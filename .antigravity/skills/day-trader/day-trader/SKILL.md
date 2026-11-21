---
name: day-trader
description: >-
  Day Trader Skill Suite tuned for Indian Options & US Equities. Scans charts for
  setups (ORB, flags, oversold bounces), times bar-by-bar entry and exit, replays
  odds with the Time Machine, calculates Delta-adjusted option strikes (CE/PE) &
  lot-size sizing (NIFTY 25, BANKNIFTY 15), checks NSE market window & risk limits,
  and simulates realistic paper trades with Zerodha Kite Connect or the local paper broker.
  Use when the user asks to "day trade", "trade options", "paper trade Nifty/BankNifty",
  "scan setups", "check risk", "size options trade", or execute a paper order.
---

# Day Trader Skill Suite (India Options & US Equities)

A complete suite of 11 modular trading tools and an Indian Options paper trading engine.
All tools are self-contained, standard-library Python scripts that run offline or on public data.

## The Modular Skills

| Command / Tool | Job | What It Does |
| :--- | :--- | :--- |
| **`/trader-scanner`** | Chart Scanner | Scans charts for setups: 15-min Opening Range Breakouts (ORB), bull flags, 20-day high breakouts, oversold bounces. |
| **`/trader-entry`** | Entry Timer & Strike Selector | Watches setup bar-by-bar and calculates entry trigger. Includes `options_engine.py` for ATM/ITM strike selection and Delta-adjusted stops. |
| **`/trader-exit`** | Exit Planner | Computes technical stop-loss (OR-mid, OR-low, ATR) and profit targets (1R, 1.5R, 2R) with flat-by exit time. |
| **`/trader-timemachine`** | Monte Carlo Simulator | Replays session 10,000 times from historical intraday bars and real past setups before risking capital. |
| **`/trader-budget`** | Budget & Lot Sizer | Sizes positions to your max loss per trade. Enforces Indian F&O contract lot sizes (NIFTY 25, BANKNIFTY 15, FINNIFTY 25). |
| **`/trader-risk`** | Risk Gatekeeper | Validates proposed orders against max daily loss, IST trading window (09:15–15:30), NSE holidays, lot size multiples, and single-trade loss caps. |
| **`/trader-broker`** | Order Ticket & Execution | Displays approved tickets. Formats Zerodha Kite Connect MCP orders and executes virtual paper trades via `paper_broker.py`. |
| **`/trader-alerts`** | Alert Manager | Watches price stops, profit targets, and rings at 15:15 IST (or 15:55 ET) to flatten open positions. |
| **`/trader-news`** | Catalyst Monitor | Scans breaking news headlines and filings for trade tickers. |
| **`/trader-analyst`** | Financials Analyst | Analyzes quarterly reports, revenue growth, and earnings surprises. |
| **`/trader-pelosi`** | Government Disclosures | Tracks public stock transaction filings by US politicians. |

---

## Indian Options Paper Trading Workflow (NSE / NFO)

All working files land in `trader/` inside your project directory.

### 1. Initialize Virtual Account & Indian Config
```bash
# Set up Indian market configuration (IST 09:15-15:30, INR currency, lot sizes)
cp .agents/skills/trader-budget/config.india.example.json trader/config.json

# Initialize paper account with ₹1,00,000 virtual capital
python .agents/skills/trader-broker/paper_broker.py init --capital 100000
```

### 2. Spot Chart Setup -> Options Strike Selection
When a setup (like 15-min ORB) triggers on the NIFTY spot index (e.g. entry 24,500, stop 24,470, target 24,560):
```bash
python .agents/skills/trader-entry/options_engine.py \
  --underlying NIFTY \
  --spot 24500 \
  --spot-stop 24470 \
  --spot-target 24560 \
  --premium 140 \
  --type CE \
  --moneyness ATM \
  --write-plan trader/plan.json
```

### 3. Lot-Size Position Sizing
Sizes your position in exact integer multiples of the lot size (e.g., 25, 50, 75) based on your `max_loss_per_trade_usd` (INR):
```bash
python .agents/skills/trader-budget/size.py --write
```

### 4. Risk Gatekeeper
Validates NSE market hours, holiday status, lot-size alignment, and daily risk caps:
```bash
python .agents/skills/trader-risk/check.py
```

### 5. Review Ticket & Execute Paper Trade
```bash
# View the ticket (shows Kite Connect order format and risk)
python .agents/skills/trader-broker/ticket.py show

# Execute the virtual paper trade (applies STT, brokerage, and GST slippage)
python .agents/skills/trader-broker/paper_broker.py execute-plan

# View current virtual P&L and open positions
python .agents/skills/trader-broker/paper_broker.py status
```
