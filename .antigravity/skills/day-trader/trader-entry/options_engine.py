#!/usr/bin/env python3
"""Options Engine for Indian F&O (NSE).

Calculates:
- Strike selection (ATM, ITM, OTM).
- Lot sizing and rounding.
- Option symbol generation (NSE/Kite format).
- Delta-adjusted option premium stop-loss and take-profit from spot chart setups.
- Generates/updates trader/plan.json with options contracts.
"""

import argparse
import datetime
import json
import math
import os
import re
import sys

from nse_calendar import to_ist, get_next_expiry

DEFAULT_LOT_SIZES = {
    "NIFTY": 25,
    "BANKNIFTY": 15,
    "FINNIFTY": 25,
    "MIDCPNIFTY": 50,
    "SENSEX": 10,
    "BANKEX": 15,
    "RELIANCE": 250,
    "HDFCBANK": 550,
    "ICICIBANK": 700,
    "INFY": 400,
    "TCS": 175,
}

STRIKE_STEPS = {
    "NIFTY": 50,
    "BANKNIFTY": 100,
    "FINNIFTY": 50,
    "MIDCPNIFTY": 25,
    "SENSEX": 100,
    "BANKEX": 100,
    "RELIANCE": 20,
    "HDFCBANK": 10,
    "ICICIBANK": 10,
    "INFY": 20,
    "TCS": 20,
}

MONTH_CODES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
# Weekly month code in NSE (1-9 for Jan-Sep, O for Oct, N for Nov, D for Dec)
WEEKLY_MONTH_CODES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "O", "N", "D"]


def get_atm_strike(spot_price, step=50):
    """Finds the nearest ATM strike price."""
    return int(round(float(spot_price) / step) * step)


def select_strike(spot_price, option_type="CE", moneyness="ATM", step=50, itm_steps=1):
    """
    Selects strike based on spot price, option type (CE/PE), and moneyness.
    moneyness:
      - ATM: exactly at the money
      - ITM: in the money (CE: spot - step * itm_steps, PE: spot + step * itm_steps)
      - OTM: out of the money (CE: spot + step, PE: spot - step)
    """
    atm = get_atm_strike(spot_price, step)
    opt = option_type.upper()
    if moneyness == "ATM":
        return atm
    elif moneyness == "ITM":
        if opt == "CE":
            return atm - (step * itm_steps)
        else:
            return atm + (step * itm_steps)
    elif moneyness == "OTM":
        if opt == "CE":
            return atm + (step * itm_steps)
        else:
            return atm - (step * itm_steps)
    return atm


def format_tradingsymbol(underlying, expiry_date, strike, option_type="CE", is_weekly=False):
    """
    Builds the standard NSE / Zerodha Kite tradingsymbol.
    Monthly: NIFTY26NOV24500CE (YY + MMM + Strike + Type)
    Weekly:  NIFTY26N2024500CE (YY + MonthCode + DD + Strike + Type)
    """
    und = underlying.upper().replace("^NSEI", "NIFTY").replace("^NSEBANK", "BANKNIFTY")
    yy = expiry_date.strftime("%y")
    m_idx = expiry_date.month - 1
    opt = option_type.upper()
    strike_str = str(int(strike))

    if not is_weekly:
        mmm = MONTH_CODES[m_idx]
        return "%s%s%s%s%s" % (und, yy, mmm, strike_str, opt)
    else:
        m_code = WEEKLY_MONTH_CODES[m_idx]
        dd = expiry_date.strftime("%d")
        return "%s%s%s%s%s%s" % (und, yy, m_code, dd, strike_str, opt)


def calculate_option_plan(spot_entry, spot_stop, spot_target, option_premium,
                          option_type="CE", moneyness="ATM", delta=None, lot_size=25):
    """
    Converts a spot index/stock trade plan into an option trading plan with
    Delta-adjusted stops, targets, and lot-size aligned quantities.
    """
    opt = option_type.upper()
    if delta is None:
        if moneyness == "ITM":
            delta = 0.65
        elif moneyness == "ATM":
            delta = 0.50
        else:
            delta = 0.35

    spot_risk = abs(spot_entry - spot_stop)
    spot_reward = abs(spot_target - spot_entry)

    # Option premium move estimation
    premium_risk = round(spot_risk * delta, 2)
    # Ensure minimum risk of ₹2 or 5% of premium to avoid noise
    premium_risk = max(premium_risk, 2.0)
    premium_reward = round(spot_reward * delta, 2)

    option_entry = round(float(option_premium), 2)
    option_stop = round(max(0.05, option_entry - premium_risk), 2)
    option_target = round(option_entry + premium_reward, 2)
    risk_per_share = round(option_entry - option_stop, 2)

    reward_risk = round(premium_reward / premium_risk, 2) if premium_risk > 0 else 1.0

    return {
        "option_entry": option_entry,
        "option_stop": option_stop,
        "option_target": option_target,
        "risk_per_share": risk_per_share,
        "reward_risk": reward_risk,
        "delta": delta,
        "lot_size": lot_size,
        "risk_per_lot": round(risk_per_share * lot_size, 2)
    }


def size_option_lots(budget, max_loss_trade, risk_per_share, entry_price, lot_size, cash_buffer_pct=10):
    """Calculates position size strictly in multiples of lot_size."""
    available_cash = budget * (1 - cash_buffer_pct / 100.0)
    risk_per_lot = risk_per_share * lot_size
    cost_per_lot = entry_price * lot_size

    if risk_per_lot <= 0 or cost_per_lot <= 0:
        return 0, 0, "Invalid pricing/risk"

    lots_by_loss = int(max_loss_trade // risk_per_lot)
    lots_by_cash = int(available_cash // cost_per_lot)

    lots = max(0, min(lots_by_loss, lots_by_cash))
    total_qty = lots * lot_size
    total_cost = round(total_qty * entry_price, 2)
    total_risk = round(total_qty * risk_per_share, 2)

    return lots, total_qty, {
        "lots": lots,
        "total_qty": total_qty,
        "total_cost": total_cost,
        "total_risk": total_risk,
        "bound_by": "max loss" if lots_by_loss <= lots_by_cash else "cash"
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Options Plan and Strike Generator for NSE.")
    parser.add_argument("--underlying", default="NIFTY", help="NIFTY, BANKNIFTY, etc.")
    parser.add_argument("--spot", type=float, required=True, help="Current spot price")
    parser.add_argument("--spot-stop", type=float, required=True, help="Spot stop level")
    parser.add_argument("--spot-target", type=float, required=True, help="Spot target level")
    parser.add_argument("--premium", type=float, default=120.0, help="Estimated/Live option premium")
    parser.add_argument("--type", choices=["CE", "PE"], default="CE", help="Option type")
    parser.add_argument("--moneyness", choices=["ATM", "ITM", "OTM"], default="ATM")
    parser.add_argument("--weekly", action="store_true", help="Weekly expiry instead of monthly")
    parser.add_argument("--write-plan", help="Write resulting option plan to this JSON file")
    args = parser.parse_args()

    und = args.underlying.upper()
    step = STRIKE_STEPS.get(und, 50)
    lot = DEFAULT_LOT_SIZES.get(und, 25)
    strike = select_strike(args.spot, args.type, args.moneyness, step)
    expiry = get_next_expiry()
    symbol = format_tradingsymbol(und, expiry, strike, args.type, is_weekly=args.weekly)

    plan = calculate_option_plan(args.spot, args.spot_stop, args.spot_target, args.premium,
                                 option_type=args.type, moneyness=args.moneyness, lot_size=lot)

    print("=" * 60)
    print("NSE OPTION TRADE SPECIFICATION")
    print("=" * 60)
    print("Underlying:       %s (Spot: %.2f)" % (und, args.spot))
    print("Contract:         %s (%s %d %s, Exp: %s)" % (symbol, und, strike, args.type, expiry))
    print("Option Premium:   ₹%.2f" % plan["option_entry"])
    print("Stop-Loss:        ₹%.2f (Risk: ₹%.2f / share)" % (plan["option_stop"], plan["risk_per_share"]))
    print("Target:           ₹%.2f (Reward: ₹%.2f / share)" % (plan["option_target"], round(plan["option_target"] - plan["option_entry"], 2)))
    print("Reward : Risk:    1 : %.2f" % plan["reward_risk"])
    print("Lot Size:         %d (Risk per lot: ₹%.2f)" % (lot, plan["risk_per_lot"]))
    print("=" * 60)

    if args.write_plan:
        out_plan = {
            "symbol": symbol,
            "underlying": und,
            "exchange": "NFO",
            "entry": plan["option_entry"],
            "stop": plan["option_stop"],
            "target": plan["option_target"],
            "lot_size": lot,
            "setup": "options_spot_trigger",
            "date": datetime.date.today().isoformat(),
            "flat_by": "15:15",
            "currency": "INR",
            "market": "IN"
        }
        with open(args.write_plan, "w", encoding="utf-8") as f:
            json.dump(out_plan, f, indent=2)
        print("Wrote option plan to %s" % args.write_plan)
