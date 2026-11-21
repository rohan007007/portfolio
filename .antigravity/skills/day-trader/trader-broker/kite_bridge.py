#!/usr/bin/env python3
"""Zerodha Kite Connect Bridge for trader-broker and trader-india.

Bridges the Day Trader skill suite with Zerodha Kite Connect:
- Converts day-trader-skill order JSON to Kite place_order format.
- Generates MCP tool-call JSON for the installed `kite` MCP server.
- Supports both paper trading (via paper_broker.py) and live/mock Kite sessions.
"""

import argparse
import json
import os
import sys

DEFAULT_ORDERS = "trader/orders.json"


def order_to_kite(order, default_product="MIS"):
    """
    Converts an internal order (from trader-budget/size.py) to Zerodha Kite Connect place_order parameters.
    """
    sym = order.get("symbol", "").upper()
    qty = int(float(order.get("qty", 1)))
    side = str(order.get("side", "BUY")).upper()
    order_type = str(order.get("type", "MARKET")).upper()

    # Determine exchange
    exchange = order.get("exchange")
    if not exchange:
        if any(sym.startswith(x) for x in ("NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY", "SENSEX")):
            exchange = "NFO"
        elif sym.endswith(".NS") or sym.endswith(".BO"):
            exchange = "NSE" if sym.endswith(".NS") else "BSE"
            sym = sym.split(".")[0]
        else:
            exchange = "NFO" if any(sym.endswith(suffix) for suffix in ("CE", "PE", "FUT")) else "NSE"

    product = order.get("product", default_product)
    limit_price = float(order.get("limit_price", 0)) if order.get("limit_price") else None
    stop_price = float(order.get("stop_loss_stop_price", 0)) if order.get("stop_loss_stop_price") else None
    target_price = float(order.get("take_profit_limit_price", 0)) if order.get("take_profit_limit_price") else None

    # Primary entry order
    kite_entry = {
        "variety": "regular",
        "exchange": exchange,
        "tradingsymbol": sym,
        "transaction_type": side,
        "quantity": qty,
        "product": product,
        "order_type": "LIMIT" if limit_price else "MARKET",
        "price": limit_price if limit_price else 0,
        "validity": "DAY"
    }

    # Bracket legs (in Kite, SL is placed as a separate SL/SL-M order or GTT)
    legs = []
    if stop_price:
        legs.append({
            "leg": "stop_loss",
            "variety": "regular",
            "exchange": exchange,
            "tradingsymbol": sym,
            "transaction_type": "SELL" if side == "BUY" else "BUY",
            "quantity": qty,
            "product": product,
            "order_type": "SL",
            "price": round(stop_price - 0.5, 2),  # Limit buffer
            "trigger_price": stop_price,
            "validity": "DAY"
        })
    if target_price:
        legs.append({
            "leg": "take_profit",
            "variety": "regular",
            "exchange": exchange,
            "tradingsymbol": sym,
            "transaction_type": "SELL" if side == "BUY" else "BUY",
            "quantity": qty,
            "product": product,
            "order_type": "LIMIT",
            "price": target_price,
            "validity": "DAY"
        })

    mcp_call = {
        "ServerName": "kite",
        "ToolName": "place_order",
        "Arguments": kite_entry
    }

    return {
        "primary_order": kite_entry,
        "legs": legs,
        "mcp_tool_call": mcp_call
    }


def convert_file(orders_path=DEFAULT_ORDERS):
    if not os.path.exists(orders_path):
        print("No %s found." % orders_path, file=sys.stderr)
        return []
    with open(orders_path, "r", encoding="utf-8") as f:
        doc = json.load(f)
    orders = doc.get("orders", doc) if isinstance(doc, dict) else doc
    return [order_to_kite(o) for o in orders]


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Kite Connect Order Bridge")
    parser.add_argument("--orders", default=DEFAULT_ORDERS)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    results = convert_file(args.orders)
    if args.json:
        print(json.dumps(results, indent=2))
    else:
        for i, res in enumerate(results, 1):
            pri = res["primary_order"]
            print("=" * 60)
            print("KITE CONNECT ORDER TICKET #%d" % i)
            print("=" * 60)
            print("Exchange:        %s" % pri["exchange"])
            print("Trading Symbol:  %s" % pri["tradingsymbol"])
            print("Side:            %s" % pri["transaction_type"])
            print("Quantity:        %d" % pri["quantity"])
            print("Product:         %s (%s)" % (pri["product"], "Intraday" if pri["product"] == "MIS" else "Overnight"))
            print("Type:            %s" % pri["order_type"])
            if pri["price"]:
                print("Limit Price:     ₹%.2f" % pri["price"])
            for leg in res["legs"]:
                print("Leg %s:   Trigger ₹%.2f, Price ₹%.2f" % (leg["leg"], leg.get("trigger_price", 0), leg["price"]))
            print("-" * 60)
            print("Antigravity MCP Tool Call:")
            print(json.dumps(res["mcp_tool_call"], indent=2))
            print("=" * 60)
