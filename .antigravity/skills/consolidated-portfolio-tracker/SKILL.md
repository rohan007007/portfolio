---
name: consolidated-portfolio-tracker
description: Core operations, data ingestion pipeline, security model, and API bridge for the Consolidated Portfolio Tracker.
---

# Consolidated Portfolio Tracker Skill

This skill documents the architecture, data pipeline, and zero-knowledge operational protocols of the **Consolidated Portfolio Tracker** app.

## Project Summary
A high-performance, dark-themed family wealth tracking and mutual fund portfolio analytics system. Built on a zero-knowledge architecture where sensitive source documents (encrypted mutual fund CAS and AMC PDF statements, transaction Excels, and passwords) reside strictly offline on the local PC, while sanitized aggregated analytics are served via GitHub Pages or the local bridge.

## Core Architecture
- **Web Frontend (`index.html`)**: Single-page modern dashboard with pinned growth chart crosshairs, deep holding drawers with scroll isolation, and 6 comprehensive portfolio analysis breakdowns (Asset Split, Market Cap Split, Active/Passive Split, Sector Allocation, Holding Horizon Split, Tag Split) and complete consolidated company stock distribution.
- **Data Ingestion Engine (`parse_all_portfolios.py`)**: Parses CAMS consolidated account statements (CAS) via `casparser`, AMC companion Excels (`.xls`), and individual AMC PDFs across PAN directories. Merges holdings using deterministic `(folio, plan)` keys.
- **Data Enrichment Layer (`build_charlie_data.py` / `build_amfi_mapper.py`)**: Enriches mutual fund schemes with official AMFI codes and fetches complete underlying stock holdings, sector weightings, AUM, expense ratios, and quantitative metrics (Sharpe ratio, Beta, Alpha, Sortino ratio, max drawdown) via the Charlie API (`https://api.charliealpha.in/`).
- **Local Sync Bridge (`server.py`)**: FastAPI server running on `http://127.0.0.1:8000` with Private Network Access (PNA) and CORS support. Provides `/api/portfolios`, `/api/health`, and `/api/rescan` endpoints.
- **Remote Access Tunnel (`cloudflared.exe`)**: Secure Cloudflare Tunnel routing remote requests (e.g. mobile 5G) to the local PC server without opening firewall ports.

## Zero-Knowledge Security Model
1. **Never commit sensitive files**:
   - `All Portfolios/` (contains real investor statements and PDFs)
   - `passwords.local.json` (contains statement decryption passwords)
   - Any raw `*.pdf`, `*.xls`, or personal transaction records.
2. **Public / Hosted Assets**:
   - `data/portfolios_data.json` contains sanitized summary analytics and aggregated holdings.
   - `index.html` loads locally or from GitHub Pages (`rohan007007.github.io/consolidated-portfolio-tracker`).

## Common Operations

### 1. Re-ingesting Source Statements
```powershell
python parse_all_portfolios.py
```
This updates `data/portfolios_data.json` with exact cost, valuation, unit balances, and cross-folio stock aggregations.

### 2. Starting Local Server
```powershell
python server.py
# Server runs on http://127.0.0.1:8000
```

### 3. Starting Mobile Sync Bridge
```powershell
.\start_sync_bridge.bat
```
Copies the generated `https://*.trycloudflare.com` URL into the web app's Sync Bridge modal on mobile.
