# Connected Hospital Blood Network - API + Web Dashboard

This project builds the offline foundation, FastAPI backend, transfer suggestion engine, and a browser dashboard for a connected hospital blood stock network. It does not include donor matching or login yet.

## What Is Included

- `models.py` defines the SQLite schema with SQLAlchemy ORM models for hospitals, blood bags, daily stock snapshots, and transfer suggestions.
- `generate_data.py` creates 90 days of daily stock history for 6 Pune and Pimpri-Chinchwad hospital blood centres.
- `train_forecast_model.py` trains a small real PyTorch neural network to predict whether stock for a hospital and blood type will fall below a critical threshold in the next 48 hours.
- `api/main.py` exposes the existing database and saved model through HTTP endpoints.
- `hospital_simulator.py` replays a curated sequence of live-looking hospital stock updates into `POST /stock/update`.
- `api/schemas.py` defines the Pydantic request and response shapes.
- `frontend/` contains the React/Vite command-center dashboard served by FastAPI at `/app/`.

## Setup

Use Python 3.11 or newer.

```bash
python -m venv .venv
source .venv/bin/activate
pip install sqlalchemy pandas numpy torch fastapi uvicorn
```

## Run Order

First generate the database and inspection CSV:

```bash
python generate_data.py
```

This creates:

- `blood_network.db`
- `stock_snapshots.csv`

Then train and evaluate the forecast model:

```bash
python train_forecast_model.py
```

This prints train loss, test accuracy, precision, recall, and example predictions. The decision threshold is set to favor recall because missing a likely shortage is worse than sending an early warning that needs human review. It also saves:

- `shortage_forecast_model.pt`

## Run The API

After generating data and training the model, start the backend:

```bash
uvicorn api.main:app --reload
```

The API will be available at:

- `http://127.0.0.1:8000`
- `http://127.0.0.1:8000/app/` for the dashboard
- `http://127.0.0.1:8000/docs` for interactive Swagger docs

The API loads `shortage_forecast_model.pt` once at startup. If that file is missing or broken, startup fails clearly instead of serving fake predictions.

If port `8000` is blocked on Windows, run the same command on `8001`:

```powershell
uvicorn api.main:app --reload --host 127.0.0.1 --port 8001
```

Then open:

- `http://127.0.0.1:8001/app/`
- `http://127.0.0.1:8001/docs`

## Web Dashboard

The dashboard is the React/Vite JeevanSetu frontend served from the same FastAPI backend. It uses the live API endpoints for hospitals, stock, forecasts, and transfer suggestions. It shows:

- network metrics for hospitals, critical risks, transfer suggestions, and recommended units,
- a network view of connected hospitals,
- the forecast risk queue from the neural network,
- ranked transfer suggestions from the rules engine,
- latest stock by hospital and blood type.

Use this for demos when you want the story in one screen: Phase 1 predicts risk, Phase 2 converts risk into action.

The dashboard, forecast page, and transfer suggestions page poll the API every 4 seconds. When a new stock snapshot arrives, the next poll recomputes the neural-network forecast and transfer suggestions without needing WebSockets.

## Hospital Simulator Demo

With FastAPI already running, open the dashboard and run:

```bash
python hospital_simulator.py
```

The simulator sends three small stock events to `POST /stock/update`: Sassoon General Hospital Blood Centre reports `O-` dropping, then critical, and Deenanath Mangeshkar Hospital Blood Bank confirms an `O-` buffer. This stands in for hospital HMIS integrations calling the same endpoint one event at a time.

To point at another API URL or slow the replay:

```bash
python hospital_simulator.py --api-base http://127.0.0.1:8001 --delay 3
```

Demo narration: "This script is standing in for what a hospital HMIS would send. Sassoon just reported O-negative dropping to 4 units; the dashboard poll picks up the new snapshot, reruns the forecast read, and the transfer page suggests nearby O-negative support from another Pune hospital."

If you edit files under `frontend/src`, rebuild the frontend before restarting FastAPI:

```powershell
cd frontend
pnpm install
pnpm build
cd ..
```

## API Endpoints

- `GET /hospitals` returns all hospitals.
- `GET /hospitals/{hospital_id}/stock` returns latest stock per blood type.
- `GET /hospitals/{hospital_id}/stock/history?days=14` returns chart-ready history rows.
- `POST /stock/update` inserts a new point-in-time stock snapshot.
- `GET /hospitals/{hospital_id}/forecast` predicts 48-hour critical risk for one hospital.
- `GET /forecast/network` predicts 48-hour critical risk for all hospitals.
- `GET /transfers/suggestions` runs the rules engine, populates `transfer_suggestions`, and returns the ranked network-wide transfer list.

`POST /stock/update` uses `new_count` instead of `delta` because the Phase 0 table stores stock snapshots, not transaction events. This keeps the API aligned with the existing data model.

## API Test Commands

These examples use hospital `1`, which is `Sassoon General Hospital Blood Centre` in the synthetic data, and blood type `O+`.

```bash
curl http://127.0.0.1:8000/hospitals
```

```bash
curl http://127.0.0.1:8000/hospitals/1/stock
```

```bash
curl "http://127.0.0.1:8000/hospitals/1/stock/history?days=14"
```

```bash
curl "http://127.0.0.1:8000/hospitals/1/stock/history?days=14&blood_type=O%2B"
```

```bash
curl -X POST http://127.0.0.1:8000/stock/update \
  -H "Content-Type: application/json" \
  -d '{"hospital_id":1,"blood_type":"O+","new_count":23}'
```

```bash
curl http://127.0.0.1:8000/hospitals/1/forecast
```

```bash
curl http://127.0.0.1:8000/forecast/network
```

```bash
curl http://127.0.0.1:8000/transfers/suggestions
```

## Transfer Suggestion Engine

The neural network predicts shortage risk. The transfer suggestion engine decides the action with transparent rules.

That means this layer is intentionally rule-based, not another neural model. It cross-references the network forecast against same-blood-type source hospitals with surplus, available bags that are close to expiry. It then populates the existing `transfer_suggestions` table and returns the ranked suggestions.

Ranking prioritizes:

1. hospitals already critical before hospitals predicted critical within 48 hours,
2. source stock expiring sooner,
3. higher forecast confidence,
4. larger matched transfer quantity.

This is the standard predict-plus-optimize pattern: learned risk prediction first, auditable operational decision rules second.

For missing hospitals, the API returns a clean `404`, for example:

```bash
curl http://127.0.0.1:8000/hospitals/999/stock
```

## Synthetic Data Assumptions

The generator is designed to contain learnable signal rather than pure random noise:

- Stock gradually depletes every day based on hospital size, blood type prevalence, and weekend demand.
- Restocking happens irregularly every 5-9 days depending on each hospital profile.
- Larger hospitals have higher baseline capacity and stronger restocking reliability.
- Festival/event dates increase demand, especially for `O+` and `O-`, which are important in trauma scenarios.
- One hospital experiences a simulated mass casualty event that sharply increases usage.
- Blood type allocation roughly follows commonly cited India-facing proportions: `O+` and `B+` are most common, while `AB-` is rarest.
- Blood bag rows represent current available inventory plus some expired historical bags; about a fifth of available bags are intentionally near expiry at the end of the simulation.

## Model Target

The model answers this question:

> Given the last 14 days of stock for one hospital and blood type, will stock fall below the configured critical threshold within the next 48 hours?

Inputs include:

- 14-day stock count window
- day of week
- hospital identifier feature
- blood type identifier feature
- days since last restock
- current stock relative to threshold

The train/test split is time-based, using the last 18 days as test data, so future observations do not leak into training.

## Current Limitations

- The model is trained only on synthetic data. Real deployment needs real hospital inventory, usage, discard, and transfer records.
- Critical thresholds are reasonable defaults, not clinical policy.
- Blood type prevalence is approximate and not region-specific.
- Blood bags are generated to support expiry-aware future phases, but the Phase 0 model trains only on stock snapshot counts.
- Transfer suggestions are generated by an explainable rules engine using the 48-hour neural forecast plus near-expiry inventory.
- CORS allows all origins for hackathon speed. Lock this down before any real deployment.
- Network forecast loops through hospitals one by one. This is fine for the demo, but a real deployment should batch inference and cache dashboard reads.
