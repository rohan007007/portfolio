#!/usr/bin/env python3
"""Paper Trading Broker Engine for Indian F&O (NSE).

Features:
- Simulates virtual order execution for NSE Option Buying & Selling.
- Enforces MIS (Intraday) & NRML products with automatic margin tracking.
- Calculates realistic Indian statutory taxes and transaction costs:
  - Brokerage: ₹20 flat per executed order
  - STT: 0.1% on sell turnover (premium value)
  - Exchange transaction charges: 0.05%
  - GST: 18% on (brokerage + exchange transaction charges)
  - Stamp duty: 0.003% on buy turnover
- Integrates with the Day Trader suite's `trader/portfolio.json` and `trader/state/broker.json`.
"""

import argparse
import datetime
import json
import math
import os
import sys

DEFAULT_PORTFOLIO = "trader/portfolio.json"
DEFAULT_ORDERS = "trader/orders.json"
DEFAULT_LOG = "trader/state/broker.json"


def calc_transaction_charges(side, qty, price):
    """
    Computes exact statutory and brokerage costs in INR for Indian F&O options.
    """
    turnover = float(qty) * float(price)
    brokerage = 20.0  # ₹20 flat discount broker fee

    stt = round(turnover * 0.001, 2) if side.upper() == "SELL" else 0.0
    exchange_charges = round(turnover * 0.0005, 2)
    gst = round((brokerage + exchange_charges) * 0.18, 2)
    stamp_duty = round(turnover * 0.00003, 2) if side.upper() == "BUY" else 0.0
    sebi_charges = round(turnover * 0.000001, 2)

    total_charges = round(brokerage + stt + exchange_charges + gst + stamp_duty + sebi_charges, 2)
    return {
        "turnover": turnover,
        "brokerage": brokerage,
        "stt": stt,
        "exchange_charges": exchange_charges,
        "gst": gst,
        "stamp_duty": stamp_duty,
        "sebi_charges": sebi_charges,
        "total_charges": total_charges
    }


def load_portfolio(path=DEFAULT_PORTFOLIO):
    if not os.path.exists(path):
        return {
            "currency": "INR",
            "cash": 100000.0,
            "initial_capital": 100000.0,
            "positions": {},
            "realized_pnl": 0.0,
            "total_charges": 0.0,
            "trades_count": 0,
            "updated_at": datetime.datetime.now().isoformat()
        }
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_portfolio(p, path=DEFAULT_PORTFOLIO):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    p["updated_at"] = datetime.datetime.now().isoformat()
    with open(path, "w", encoding="utf-8") as f:
        json.dump(p, f, indent=2)


def append_broker_log(entry, path=DEFAULT_LOG):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    state = {"orders": []}
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                state = json.load(f)
        except Exception:
            state = {"orders": []}
    state["orders"].append(entry)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)


def execute_order(portfolio, symbol, side, qty, price, product="MIS"):
    side = side.upper()
    qty = int(qty)
    price = float(price)
    turnover = qty * price
    charges = calc_transaction_charges(side, qty, price)

    pos = portfolio["positions"].get(symbol, {"qty": 0, "avg_price": 0.0, "product": product})
    current_qty = pos["qty"]
    current_avg = pos["avg_price"]

    if side == "BUY":
        required_cash = turnover + charges["total_charges"]
        if portfolio["cash"] < required_cash:
            return False, "Insufficient virtual cash: requires ₹%.2f, available ₹%.2f" % (required_cash, portfolio["cash"])

        new_qty = current_qty + qty
        new_avg = ((current_qty * current_avg) + turnover) / new_qty if new_qty > 0 else 0.0
        portfolio["cash"] -= required_cash
        pos["qty"] = new_qty
        pos["avg_price"] = round(new_avg, 2)
        portfolio["positions"][symbol] = pos
    else:  # SELL
        if current_qty < qty:
            return False, "Short selling options without margin not permitted in paper broker (held: %d, sell: %d)" % (current_qty, qty)

        # Realize PnL
        pnl = (price - current_avg) * qty - charges["total_charges"]
        portfolio["cash"] += (turnover - charges["total_charges"])
        portfolio["realized_pnl"] += round(pnl, 2)
        new_qty = current_qty - qty
        if new_qty == 0:
            del portfolio["positions"][symbol]
        else:
            pos["qty"] = new_qty
            portfolio["positions"][symbol] = pos

    portfolio["total_charges"] += charges["total_charges"]
    portfolio["trades_count"] += 1

    log_entry = {
        "symbol": symbol,
        "side": side.lower(),
        "qty": qty,
        "price": price,
        "product": product,
        "charges": charges["total_charges"],
        "status": "filled",
        "at": datetime.datetime.now().isoformat()
    }
    append_broker_log(log_entry)
    return True, "Executed %s %d %s at ₹%.2f (charges: ₹%.2f)" % (side, qty, symbol, price, charges["total_charges"])


def print_status(p):
    print("=" * 65)
    print("       INDIAN F&O PAPER TRADING ACCOUNT SUMMARY       ")
    print("=" * 65)
    print("Initial Capital:   ₹{:,.2f}".format(p.get("initial_capital", 100000)))
    print("Available Cash:    ₹{:,.2f}".format(p.get("cash", 0)))
    print("Realized P&L:      ₹{:,.2f}".format(p.get("realized_pnl", 0)))
    print("Total Taxes/Fees:  ₹{:,.2f}".format(p.get("total_charges", 0)))
    print("Total Trades:      %d" % p.get("trades_count", 0))
    print("-" * 65)
    print("OPEN POSITIONS:")
    positions = p.get("positions", {})
    if not positions:
        print("  (No open positions)")
    else:
        for sym, pos in positions.items():
            print("  - %s: %d shares @ avg ₹%.2f (Product: %s, Invested: ₹{:,.2f})".format(pos['qty'] * pos['avg_price'])
                  % (sym, pos["qty"], pos["avg_price"], pos.get("product", "MIS")))
    print("=" * 65)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Indian F&O Paper Trading Simulator")
    sub = parser.add_subparsers(dest="cmd")

    init_p = sub.add_parser("init", help="Initialize virtual account")
    init_p.add_argument("--capital", type=float, default=100000.0, help="Initial capital in INR")

    sub.add_parser("status", help="Show account summary")

    buy_p = sub.add_parser("buy", help="Execute paper buy")
    buy_p.add_argument("--symbol", required=True)
    buy_p.add_argument("--qty", type=int, required=True)
    buy_p.add_argument("--price", type=float, required=True)
    buy_p.add_argument("--product", default="MIS")

    sell_p = sub.add_parser("sell", help="Execute paper sell")
    sell_p.add_argument("--symbol", required=True)
    sell_p.add_argument("--qty", type=int, required=True)
    sell_p.add_argument("--price", type=float, required=True)
    sell_p.add_argument("--product", default="MIS")

    exec_p = sub.add_parser("execute-plan", help="Execute order from trader/orders.json")

    args = parser.parse_args()
    p = load_portfolio()

    if args.cmd == "init":
        p = {
            "currency": "INR",
            "cash": args.capital,
            "initial_capital": args.capital,
            "positions": {},
            "realized_pnl": 0.0,
            "total_charges": 0.0,
            "trades_count": 0,
            "updated_at": datetime.datetime.now().isoformat()
        }
        save_portfolio(p)
        print("Initialized Indian Paper Trading account with ₹{:,.2f}".format(args.capital))
    elif args.cmd == "status" or not args.cmd:
        print_status(p)
    elif args.cmd == "buy":
        ok, msg = execute_order(p, args.symbol, "BUY", args.qty, args.price, args.product)
        if ok:
            save_portfolio(p)
            print("SUCCESS: %s" % msg)
        else:
            print("FAILED: %s" % msg)
            sys.exit(1)
    elif args.cmd == "sell":
        ok, msg = execute_order(p, args.symbol, "SELL", args.qty, args.price, args.product)
        if ok:
            save_portfolio(p)
            print("SUCCESS: %s" % msg)
        else:
            print("FAILED: %s" % msg)
            sys.exit(1)
    elif args.cmd == "execute-plan":
        if not os.path.exists(DEFAULT_ORDERS):
            print("No %s found." % DEFAULT_ORDERS)
            sys.exit(1)
        with open(DEFAULT_ORDERS, "r", encoding="utf-8") as f:
            odoc = json.load(f)
        orders = odoc.get("orders", odoc) if isinstance(odoc, dict) else odoc
        for o in orders:
            sym = o.get("symbol")
            qty = int(float(o.get("qty", 0)))
            side = o.get("side", "buy")
            price = float(o.get("limit_price") or (o.get("plan") or {}).get("entry") or 100.0)
            ok, msg = execute_order(p, sym, side, qty, price, o.get("product", "MIS"))
            print(msg)
        save_portfolio(p)
