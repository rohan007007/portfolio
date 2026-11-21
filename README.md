# Rohan Lodaya — Automotive Systems, Powertrain Calibration & Connected Vehicle Portfolio

> **Live Production Website**: [https://rohan007007.github.io/portfolio/](https://rohan007007.github.io/portfolio/)  
> **Direct Resume Link**: [Rohan_Lodaya_ATS_Resume.pdf](./frontend/public/Rohan_Lodaya_ATS_Resume.pdf)  
> **Handover Checkpoint**: Ready for cross-device continuation in Google Antigravity.

---

## ⚡ 1. Project Overview & Architecture

Personal engineering portfolio of **Rohan Lodaya** — Lead Automotive Systems, Powertrain Calibration & Connected Vehicle Engineer. Showcases 7+ years of automotive systems engineering, India's first 4-speed geared electric motorcycle platform (Matter Motor Works), 14 patents (2 granted), 2M+ km fleet analytics, and automated cloud diagnostics (A-FTA).

```
portfolio/
├── .antigravity/                     # Handover: Antigravity Skills & MCP server templates
│   ├── skills/                       # Bundled Antigravity agent skills
│   │   ├── video-ui-feedback/        # Multimodal video screen recording inspection
│   │   ├── consolidated-portfolio-tracker/
│   │   ├── day-trader/               # Quantitative analysis & risk suite
│   │   └── markitdown/               # Document conversion skill
│   ├── mcp_config.example.json       # Sanitized MCP servers configuration
│   ├── restore_skills.ps1            # Windows PowerShell one-click skill restoration
│   └── restore_skills.sh             # macOS / Linux one-click skill restoration
├── .github/
│   └── workflows/
│       └── deploy.yml                # CI/CD: Automated GitHub Pages build & deploy on main push
├── backend/                          # Optional FastAPI + Motor (MongoDB) backend service
│   ├── server.py                     # API router, contact capture, status checks
│   ├── requirements.txt              # Pinned Python backend dependencies
│   └── .env.example                  # Backend environment template
├── frontend/                         # Modern React 19 single-page application
│   ├── public/
│   │   ├── models/
│   │   │   └── mv_agusta_optimized.glb # 1.09 MB decimated & Draco-compressed 3D hyperbike
│   │   ├── Rohan_Lodaya_ATS_Resume.pdf # Downloadable ATS resume
│   │   └── index.html
│   ├── scripts/                      # 3D optimization pipelines & diagnostic tools
│   │   ├── build_lightweight_model.mjs # Geometry decimation (meshoptimizer) & Draco compression
│   │   ├── optimize_mv_agusta.mjs    # Paddock stand removal & material tone shader stripping
│   │   ├── generate_option_c.mjs     # Procedural superbike generator (.obj)
│   │   ├── inspect_mv.mjs            # Node glTF inspector & material validator
│   │   └── analyze_tires.mjs         # Grounding & tire coordinate calibration
│   ├── src/
│   │   ├── components/
│   │   │   ├── Hero3DModel.jsx       # Viewport-aware WebGL 3D motorcycle (0% idle GPU load)
│   │   │   └── DetailModal.jsx       # Architecture detail modal
│   │   ├── data/
│   │   │   └── portfolioData.js      # All patents, projects, competencies, experience & standards
│   │   ├── App.js                    # Core layout, GSAP ScrollTrigger animations & Lenis scroll
│   │   └── App.css                   # High-fashion dark typography, acid-yellow wipes, bento grids
│   ├── package.json                  # Pinned frontend dependencies
│   ├── yarn.lock                     # Frozen dependency lockfile
│   └── craco.config.js
├── .env.example                      # Root environment variable documentation template
├── .gitignore                        # Strict exclusion of caches, build artifacts & secrets
└── README.md                         # Comprehensive handover & continuity guide
```

### 🛠️ Core Tech Stack
- **Framework**: React 19 (`@craco/craco`, CRA-compatible build).
- **3D Graphics Engine**: Three.js (`^0.187.0`), `GLTFLoader`, `DRACOLoader` with Google gstatic decoders.
- **Motion & Scroll Architecture**: GSAP 3.15 (`ScrollTrigger`, `timeline`), Lenis Smooth Scroll (`^1.3.27`), Framer Motion.
- **Styling**: Tailored Dark Cyber-Stealth palette (`#08090b` ink, `#f4f3ee` editorial ivory, `#d9ff3f` acid yellow, `#1a1c22` cards), Syne + Mono typography.
- **Backend**: FastAPI, Uvicorn, Motor (Async MongoDB), Pydantic v2.
- **Deployment**: Automated GitHub Actions workflow deploying directly to GitHub Pages.

---

## 🧰 2. Inventory of Skills, MCPs & Custom Functions

### Bundled Antigravity Skills (`.antigravity/skills/`)
These skills are packaged in the repository so they can be restored on any new workstation:
1. **`video-ui-feedback`**: Analyzes screen recordings and videos (.mp4, .mov) with or without voiceover to diagnose UI motion bugs, z-index clipping, layout reflows, and easing issues using multimodal Gemini.
2. **`consolidated-portfolio-tracker`**: Manages career artifacts, patent databases, and portfolio metrics.
3. **`day-trader`**: Quantitative trading skill suite (risk checks, price alerts, Time Machine Monte Carlo replays, broker connectors).
4. **`markitdown`**: High-fidelity document converter (PDF, Word, HTML to Markdown).

### Model Context Protocol (MCP) Configuration (`.antigravity/mcp_config.example.json`)
Pre-configured MCP server definitions ready for registration on the new machine:
- **`kite`**: Zerodha Kite Connect MCP server for market data and portfolio execution.
- **`screener`**: Indian stock screener and corporate filings analysis MCP server.
- **`gemini-api-docs`**: Upstream Google Gemini API & SDK official documentation server.

### Custom Scripts & Optimization Pipelines (`frontend/scripts/`)
- **`build_lightweight_model.mjs`**: The master 3D asset pipeline. Takes any raw GLB, removes paddock stands, strips heavy textures, converts materials to `OPAQUE`, welds vertices, decimates geometry using `meshoptimizer` (`simplify --ratio 0.35 --error 0.002`), reorders the vertex cache for GPU locality, and compresses with Draco down to **1.09 MB**.
- **`optimize_mv_agusta.mjs`**: Stand isolation and PBR material tone shader configuration.
- **`generate_option_c.mjs`**: Procedural superbike geometry generator exporting standard `.obj`.
- **`inspect_mv.mjs` / `read_glb_json.mjs`**: GLTF node, bufferView, and accessor validation tools.

---

## 💻 3. New PC Restoration & Setup Guide

Follow these steps to set up this project and Antigravity on a new machine:

### Step 1: Clone Repository
```bash
git clone https://github.com/rohan007007/portfolio.git
cd portfolio
```

### Step 2: Restore Antigravity Skills
Run the included restoration script to copy all bundled skills into your local Antigravity environment (`~/.gemini/antigravity/skills/`):

- **On Windows (PowerShell)**:
  ```powershell
  powershell -ExecutionPolicy Bypass -File .antigravity/restore_skills.ps1
  ```
- **On macOS / Linux (Bash)**:
  ```bash
  chmod +x .antigravity/restore_skills.sh
  ./.antigravity/restore_skills.sh
  ```

### Step 3: Register MCP Servers (Optional)
If using the Kite or Screener MCP tools:
1. Copy `.antigravity/mcp_config.example.json` into your local Gemini config:
   - Windows: `C:\Users\<username>\.gemini\config\mcp_config.json`
   - macOS/Linux: `~/.gemini/config/mcp_config.json`
2. Populate your `KITE_API_KEY` and `KITE_ACCESS_TOKEN`.

### Step 4: Environment Variables
Create your local environment files from the templates:
```bash
# Frontend environment
cp frontend/.env.example frontend/.env

# Root & Backend environment (if running FastAPI)
cp .env.example .env
```

### Step 5: Install Dependencies & Launch
```bash
cd frontend

# Install frozen dependencies
yarn install

# Start local development server
yarn start
```
The site will open at **`http://localhost:3000`**.

### Step 6: Build & Production Deployment
```bash
cd frontend
yarn build
```
Pushing any changes to the `main` branch automatically triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`), which builds and deploys the site live to **`https://rohan007007.github.io/portfolio/`** in under 90 seconds.

---

## 📍 4. Current Project State & Resume Context

### Completed Features & Quality Gates:
- ✅ **3D Motorcycle Hero Model**: Integrated the MV Agusta Brutale 1000 Serie Oro hyperbike. Paddock stand completely removed, wheels grounded at $Y=0$, and monochromatic black tone PBR shaders applied (Satin Obsidian, High-Gloss Tank, Dark Gunmetal frame/powertrain, Ohlins gold inverted forks, matte vulcanized tires).
- ✅ **GPU Performance Optimization**:
  - Model decimated from 54.96 MB raw down to **1.09 MB** (render vertex count reduced by ~50% from 916K to 466K).
  - WebGL pixel ratio capped at `1.25` on high-DPI/Retina screens, saving 61% fragment shading load.
  - **Viewport-Aware Culling**: `IntersectionObserver` halts Three.js rendering whenever the hero section is offscreen, guaranteeing **0.0% GPU load** when the visitor reads lower sections.
- ✅ **Dynamic Innovation Archive (14 Patents)**:
  - Expandable drawer in Section 02 displays all 14 automotive patents in a single vertical stack.
  - Active Google Drive hyperlinks on both granted patents.
  - Fully synchronized with GSAP `ScrollTrigger` and Lenis smooth scrolling via a global `ResizeObserver`.
- ✅ **Section Visibility & Animation Fix**:
  - `start: "top 95%"` and `once: true` configured on section headings, cards, and trajectory items. Elements remain 100% visible and animated even after large content expansions.
  - Removed wheel event blocking (`data-lenis-prevent`) to ensure smooth mouse wheel scrolling.
- ✅ **Production Verified**: Zero console errors on production (`https://rohan007007.github.io/portfolio/`).

### How to Resume in Antigravity on the New PC:
1. Open Antigravity and select the cloned `portfolio` workspace directory.
2. Run `yarn start` in the `frontend` folder.
3. Antigravity will automatically detect the restored skills (`video-ui-feedback`, `consolidated-portfolio-tracker`, etc.) and be fully aware of the architecture, data models (`portfolioData.js`), and styling rules.

---

## 📄 License & Contact
© 2026 Rohan Lodaya. All rights reserved.  
Inquiries: [rohanlodaya1997@gmail.com](mailto:rohanlodaya1997@gmail.com) · [LinkedIn](https://linkedin.com/in/rohan-lodaya)
