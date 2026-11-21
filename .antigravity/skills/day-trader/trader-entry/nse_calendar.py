#!/usr/bin/env python3
"""National Stock Exchange of India (NSE) Market Calendar and Timings.

Handles:
- IST Timezone (UTC + 05:30, no daylight saving time).
- NSE Standard Trading Hours: 09:15 to 15:30 IST.
- Pre-market Session: 09:00 to 09:08 IST.
- Intraday MIS Square-off window: 15:15 to 15:20 IST.
- NSE Trading Holidays for 2025, 2026, and 2027.
- Weekly and Monthly Expiry calculation (Thursdays).
"""

import datetime
import re

IST_OFFSET = datetime.timedelta(hours=5, minutes=30)
NSE_OPEN = datetime.time(9, 15)
NSE_CLOSE = datetime.time(15, 30)

NSE_HOLIDAYS = {
    # 2025
    "2025-01-26": "Republic Day",
    "2025-02-26": "Mahashivratri",
    "2025-03-14": "Holi",
    "2025-03-31": "Id-Ul-Fitr",
    "2025-04-10": "Mahavir Jayanti",
    "2025-04-14": "Dr. Baba Saheb Ambedkar Jayanti",
    "2025-04-18": "Good Friday",
    "2025-05-01": "Maharashtra Day",
    "2025-06-07": "Bakri Id",
    "2025-08-15": "Independence Day",
    "2025-08-27": "Ganesh Chaturthi",
    "2025-10-02": "Mahatma Gandhi Jayanti",
    "2025-10-21": "Dussehra",
    "2025-10-22": "Diwali Balipratipada",
    "2025-11-05": "Guru Nanak Jayanti",
    "2025-12-25": "Christmas",
    # 2026
    "2026-01-26": "Republic Day",
    "2026-02-15": "Mahashivratri",
    "2026-03-04": "Holi",
    "2026-03-20": "Id-Ul-Fitr",
    "2026-04-03": "Good Friday",
    "2026-04-14": "Dr. Ambedkar Jayanti",
    "2026-05-01": "Maharashtra Day",
    "2026-05-27": "Bakri Id",
    "2026-06-25": "Muharram",
    "2026-08-15": "Independence Day",
    "2026-09-14": "Ganesh Chaturthi",
    "2026-10-02": "Mahatma Gandhi Jayanti",
    "2026-10-20": "Dussehra",
    "2026-11-10": "Diwali Balipratipada",
    "2026-11-24": "Guru Nanak Jayanti",
    "2026-12-25": "Christmas",
    # 2027
    "2027-01-26": "Republic Day",
    "2027-03-05": "Mahashivratri",
    "2027-03-23": "Holi",
    "2027-03-26": "Good Friday",
    "2027-04-14": "Dr. Ambedkar Jayanti",
    "2027-05-01": "Maharashtra Day",
    "2027-08-15": "Independence Day",
    "2027-10-02": "Mahatma Gandhi Jayanti",
    "2027-10-11": "Dussehra",
    "2027-11-01": "Diwali Balipratipada",
    "2027-12-25": "Christmas",
}


def to_ist(utc_dt):
    """Convert a naive or aware UTC datetime to naive IST."""
    if utc_dt is None:
        return None
    if utc_dt.tzinfo is not None:
        utc_dt = (utc_dt - utc_dt.utcoffset()).replace(tzinfo=None)
    return utc_dt + IST_OFFSET


def ist_to_utc(ist_dt):
    """Convert naive IST datetime to naive UTC datetime."""
    if ist_dt is None:
        return None
    return ist_dt.replace(tzinfo=None) - IST_OFFSET


def is_trading_day(date_obj):
    """Check if date_obj (date or datetime) is an NSE trading day."""
    d = date_obj.date() if isinstance(date_obj, datetime.datetime) else date_obj
    if d.weekday() >= 5:  # Saturday or Sunday
        return False, "Weekend"
    iso = d.isoformat()
    if iso in NSE_HOLIDAYS:
        return False, "NSE Holiday: " + NSE_HOLIDAYS[iso]
    return True, ""


def get_market_status(now_ist=None):
    """Returns detailed status of the NSE market at a given IST time."""
    if now_ist is None:
        now_ist = to_ist(datetime.datetime.now(datetime.timezone.utc))
    d = now_ist.date()
    t = now_ist.time()
    ok, why = is_trading_day(d)
    if not ok:
        return {"status": "CLOSED", "reason": why, "time_ist": now_ist.strftime("%Y-%m-%d %H:%M:%S IST")}
    if t < datetime.time(9, 0):
        return {"status": "PRE_PRE_MARKET", "reason": "Before pre-market (opens 09:00 IST)", "time_ist": now_ist.strftime("%Y-%m-%d %H:%M:%S IST")}
    if t < datetime.time(9, 8):
        return {"status": "PRE_MARKET", "reason": "Pre-market session (09:00 - 09:08 IST)", "time_ist": now_ist.strftime("%Y-%m-%d %H:%M:%S IST")}
    if t < NSE_OPEN:
        return {"status": "BUFFER", "reason": "Pre-market order matching (09:08 - 09:15 IST)", "time_ist": now_ist.strftime("%Y-%m-%d %H:%M:%S IST")}
    if t >= NSE_CLOSE:
        return {"status": "CLOSED", "reason": "Post-market (session ended at 15:30 IST)", "time_ist": now_ist.strftime("%Y-%m-%d %H:%M:%S IST")}
    if t >= datetime.time(15, 15):
        return {"status": "AUTO_SQUAREOFF", "reason": "Broker auto-squareoff window (15:15 - 15:30 IST)", "time_ist": now_ist.strftime("%Y-%m-%d %H:%M:%S IST")}
    return {"status": "OPEN", "reason": "Regular trading session", "time_ist": now_ist.strftime("%Y-%m-%d %H:%M:%S IST")}


def get_next_expiry(from_date=None, weekday=3):
    """Finds the next weekly/monthly expiry date (default Thursday=3).
    If Thursday is a holiday, the expiry is on the preceding trading day."""
    if from_date is None:
        from_date = to_ist(datetime.datetime.now(datetime.timezone.utc)).date()
    elif isinstance(from_date, datetime.datetime):
        from_date = from_date.date()

    days_ahead = (weekday - from_date.weekday()) % 7
    candidate = from_date + datetime.timedelta(days=days_ahead)
    # Check if holiday, if so step back
    while not is_trading_day(candidate)[0]:
        candidate -= datetime.timedelta(days=1)
    return candidate


if __name__ == "__main__":
    status = get_market_status()
    print("NSE Market Status: %s (%s) at %s" % (status["status"], status["reason"], status["time_ist"]))
    print("Next Expiry: %s" % get_next_expiry())
