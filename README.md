# UK Wholesale Day-Ahead Renewable Wind Forecast & Accuracy Evaluation Portal

> **Client:** UK Electricity Supplier / Energy Utility Trading Desk  
> **Target Scope:** January 2026 UK National Wind Generation (Actuals & Day-Ahead Forecasts via Elexon BMRS)  
> **Deployment Target:** Vercel (Frontend) & Heroku / Render (Backend)  
> **Containerization:** Docker & Docker Compose  

---

## 1. Executive Summary & Problem Context

In the UK wholesale electricity market (EPEX SPOT / Nord Pool Day-Ahead Auctions), electricity suppliers must submit binding purchase bids one day before delivery ($D-1$) by the auction gate closure (typically **11:00 or 12:00 GMT**).

To fulfill anticipated consumer demand, the trading desk needs to determine how much **additional thermal or dispatchable power** to buy day-ahead beyond what is generated from intermittent renewable sources (primarily Wind). Because wind generation is weather-dependent, traders rely on wind forecasts published prior to the gate closure.

### Key Business Challenges Solved
1. **Latest Day-Ahead Forecast at Gate Closure:** Eliminates data leakage by strictly filtering for the latest forecast available prior to the decision cutoff ($T_{\text{gate}} \le D-1\text{ 11:00 GMT}$).
2. **Quantified Risk & Error Margins:** Translates forecast variance into actionable metrics (MAE, RMSE, Bias, and P10/P50/P90 error margins) so traders can purchase the optimal thermal reserve margin and avoid punitive system cashout penalties in the balancing mechanism.
3. **Diurnal Volatility Insights:** Highlights morning ramp (07:00–09:00 GMT) and evening peak (17:00–19:00 GMT) forecast error clusters to inform intra-day hedging strategies.

---

## 2. System Architecture

```
                                  +---------------------------------------+
                                  |         Elexon BMRS API / Stream      |
                                  | - Actuals: FUELHH (fuelType=WIND)     |
                                  | - Forecasts: WINDFOR (hourly horizon) |
                                  +---------------------------------------+
                                                     |
                                                     v
                                  +---------------------------------------+
                                  |       Ingestion & Cache Engine        |
                                  |       (backend/data/ SQLite store)    |
                                  +---------------------------------------+
                                                     |
               +-------------------------------------+-------------------------------------+
               |                                                                           |
               v                                                                           v
+-----------------------------+                                             +-----------------------------+
|    FastAPI Python Backend   |                                             |     React 18 + Vite UI      |
| - Temporal anti-leakage SQL | <========== REST API (Port 8000) =========> | - Executive KPI Ribbon      |
| - Statistical error engine  |             /api/forecast/day-ahead         | - 48-Period Forecast Curve  |
| - 48 settlement period map  |             /api/metrics/month-overview     | - Error Distribution Bars   |
| - CSV ledger export service |             /api/forecast/export-csv        | - Diurnal Ramp Analysis     |
+-----------------------------+                                             +-----------------------------+
```

### Core Architectural Decisions
- **Anti-Leakage Temporal Isolation:** Uses SQL window partitioning (`ROW_NUMBER() OVER (PARTITION BY startTime ORDER BY publishTime DESC)`) bounded by `publishTime <= decision_gate_time` to guarantee that no forecast released after gate closure contaminates day-ahead decision points.
- **Granularity Harmonization:** Elexon publishes `WINDFOR` at hourly intervals and `FUELHH` at 30-minute settlement period intervals (HH 1–48). The engine cleanly aligns the 48 half-hour settlement periods to provide precise half-hourly operational fidelity.
- **Zero-Latency Local Caching:** January 2026 data (1,632 actual generation periods and 20,440 forecast snapshots) is pre-cached in SQLite and JSON for sub-50ms dashboard responsiveness.

---

## 3. Directory & File Structure

```text
REapp/
├── docker-compose.yml              # Multi-container orchestration (Backend + Frontend)
├── .env.example                    # Global environment variables template
├── .env                            # Active environment configuration
├── .gitignore                      # Git exclusion rules
├── README.md                       # Comprehensive documentation & review guide
├── backend/
│   ├── Dockerfile                  # Python 3.11 slim containerization
│   ├── requirements.txt            # Python dependencies (FastAPI, NumPy, Pandas, etc.)
│   ├── .env.example                # Backend environment template
│   ├── .env                        # Backend environment settings
│   ├── main.py                     # FastAPI entrypoint & middleware configuration
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py               # Pydantic BaseSettings & CORS management
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py          # Pydantic data schemas & response contracts
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── metrics_engine.py   # Vectorized MAE, RMSE, MAPE, nMAE, Bias & Percentiles
│   │   │   ├── data_manager.py     # SQLite data access & 48-period aggregator
│   │   │   └── elexon_client.py    # Asynchronous HTTP client for live Elexon BMRS stream
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── forecast.py         # /api/forecast/day-ahead & /api/forecast/export-csv
│   │       ├── metrics.py          # /api/metrics/month-overview
│   │       └── data_sync.py        # /api/data/status
│   ├── data/
│   │   ├── elexon_wind_2026.db     # SQLite database storing Jan 2026 actuals & forecasts
│   │   ├── actuals_jan_2026.json   # Exported JSON archive of actual wind generation
│   │   └── forecasts_jan_2026.json # Exported JSON archive of forecasts
│   ├── scripts/
│   │   └── download_jan_2026.py    # Automated batch ingestion script from Elexon BMRS
│   └── tests/
│       ├── __init__.py
│       └── test_metrics.py         # Unit test suite verifying metric math & cutoffs
└── frontend/
    ├── Dockerfile                  # Multi-stage build (Node build -> Nginx Alpine)
    ├── nginx.conf                  # Production reverse-proxy & SPA route handler
    ├── package.json                # React, Vite, Tailwind, Lucide, Recharts dependencies
    ├── vite.config.js              # Vite bundler & backend proxy config
    ├── tailwind.config.js          # Energy utility theme palette (emerald, cyan, amber)
    ├── postcss.config.js
    ├── index.html                  # HTML5 entrypoint with Google Fonts
    └── src/
        ├── main.jsx                # React root mount
        ├── App.jsx                 # Main application dashboard layout & state
        ├── index.css               # Tailwind CSS directives
        ├── services/
        │   └── api.js              # Frontend API client
        └── components/
            ├── Navbar.jsx          # Header with market status & pitch modal triggers
            ├── GateSelector.jsx    # Date picker & Day D-1 gate cutoff slider (11:00 / 12:00)
            ├── KpiCards.jsx        # MAE, Net Bias, RMSE, and Total Delivered Energy cards
            ├── ForecastChart.jsx   # 48-period Recharts curve with interactive tooltips
            ├── ErrorDistributionChart.jsx # Half-hourly error bars with P10/P90 statistical bounds
            ├── MonthlyAnalysis.jsx # 31-day January macro trend & diurnal ramp profile
            ├── DataTable.jsx       # 48-period ledger with search, filtering, and CSV export
            ├── ClientPitchModal.jsx # Built-in script guide for Video Part 1 (Client Pitch)
            └── TechLeadDocsModal.jsx# Built-in review guide for Video Part 2 (Tech Lead Specs)
```

---

## 4. How to Start the Application

### Option A: Running with Docker (Recommended - 1 Command)
Make sure Docker Desktop is installed and running:

```bash
# Clone the repository and navigate into it
cd REapp

# Build and start all services
docker compose up --build
```
- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **FastAPI Backend & Interactive Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option B: Running Locally for Development

#### 1. Backend Setup (Python 3.10+)
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Verify unit test suite
python tests/test_metrics.py

# Start FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API is now running at `http://127.0.0.1:8000`.

#### 2. Frontend Setup (Node.js v18+)
In a new terminal window:
```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend dashboard is now running at `http://localhost:5173`.

---

## 5. API Keys & Environment Configuration

The application works **out-of-the-box** using the pre-cached January 2026 Elexon dataset and the public stream endpoint.

To use an official Elexon BMRS API Key (for higher rate limits or custom live querying):
1. Register for an account at [bmrs.elexon.co.uk](https://bmrs.elexon.co.uk).
2. Generate your API key from your profile dashboard.
3. Open `.env` (or `backend/.env`) and add your key:
   ```env
   ELEXON_API_KEY=your_elexon_api_key_here
   ```
4. Restart the backend service.

---

## 6. Quantitative Accuracy Metrics Reference

The platform calculates the following metrics for any selected date and gate closure:

$$\text{Error}_t = \text{Forecast}_t - \text{Actual}_t$$

| Metric | Formula | Operational Meaning for Trading Desk |
| :--- | :--- | :--- |
| **MAE** | $\frac{1}{N}\sum \|\text{Error}_t\|$ | Volumetric uncertainty per settlement period. Used to size thermal reserve capacity. |
| **RMSE** | $\sqrt{\frac{1}{N}\sum (\text{Error}_t)^2}$ | Penalizes large misses heavily; flags severe ramp event risk. |
| **Bias** | $\frac{1}{N}\sum \text{Error}_t$ | Positive = Over-forecasting (Shortage risk). Negative = Under-forecasting (Surplus risk). |
| **MAPE** | $\frac{1}{N}\sum \left\|\frac{\text{Error}_t}{\max(\text{Actual}_t, 10)}\right\| \times 100\%$ | Relative percentage deviation (guarded against zero-division). |
| **nMAE** | $\frac{\text{MAE}}{\text{Peak Actual Generation}} \times 100\%$ | Normalized accuracy relative to UK wind fleet capacity. |
| **P10 / P90** | 10th & 90th error percentiles | Defines the 80% statistical confidence interval for hedging. |

---

## 7. Video Presentation Guide (Max 10 Minutes)

The app includes built-in interactive modals (**Client Pitch Guide** and **Tech Lead Specs** in the top navigation) to guide you during recording.

### Part 1: Client Pitch (Max 5 Minutes)
- **Minute 0:00 – 1:00:** Problem Statement. Outline how volatile wind generation creates day-ahead procurement uncertainty and balancing cashout exposure.
- **Minute 1:00 – 3:00:** Product Demo. Demonstrate selecting delivery dates (e.g., January 15, 2026), moving the D-1 auction gate slider from 11:00 to 12:00, and inspecting the 48 settlement periods.
- **Minute 3:00 – 4:30:** Quantified Value. Show the MAE ribbon, Net Bias badge, and P10/P90 error confidence intervals. Explain how this directly reduces balancing penalties.
- **Minute 4:30 – 5:00:** Commercial Wrap-up. Summary of pilot results and automated workflow benefits.

### Part 2: Tech Lead Architecture Review (Max 5 Minutes)
- **Minute 5:00 – 6:15:** System Architecture. Decoupled FastAPI + React Vite architecture, SQLite caching, and Docker packaging.
- **Minute 6:15 – 7:45:** Temporal Integrity. Explain the SQL window partition query preventing forecast leakage past `D-1 gateClosure`. Explain mapping hourly WINDFOR to 30-min FUELHH.
- **Minute 7:45 – 8:45:** Codebase & Test Suite. Show `backend/app/services/metrics_engine.py` and run `python tests/test_metrics.py`.
- **Minute 8:45 – 9:30:** Scalability & Production Roadmap (Solar PV expansion, Redis cache, automated webhook alerts).

---

## 8. Deployment Links

- **Frontend (Vercel):** `[Your Vercel deployment URL here]`
- **Backend API (Heroku / Render):** `[Your Heroku / Render deployment URL here]`

---

## 9. AI Tools Disclosure

As required by the assignment guidelines:  
AI developer tools (including Google Antigravity & AI coding assistants) were utilized during the development of this project for rapid scaffolding, Elexon BMRS OpenAPI schema inspection, test generation, and dashboard layout design. All domain formulas, gate closure logic, temporal anti-leakage constraints, and backend architecture were authored, validated, and verified against official UK Elexon documentation.
