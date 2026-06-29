# JeevanSetu

**AI-Powered Hospital Blood Network**

A production-quality hackathon frontend for managing hospital blood inventory, forecasting shortages, and optimizing transfers across a connected hospital network.

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- React Router
- Recharts (charts)
- React Leaflet (maps)
- Framer Motion (subtle animations)
- Lucide React (icons)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

**Demo login:** Any email/password works. Credentials are pre-filled on the login page.

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Hospital authentication |
| Dashboard | `/dashboard` | Overview stats, inventory summary, mini forecast |
| Inventory | `/inventory` | Blood stock management with search/filter |
| Forecast | `/forecast` | AI shortage prediction with charts |
| Transfers | `/transfers` | AI transfer suggestions |
| Network | `/network` | Leaflet map of all hospitals |
| Alerts | `/alerts` | Notification center |
| Reports | `/reports` | Analytics and charts |
| Profile | `/profile` | Hospital settings and preferences |

## Architecture

```
src/
├── components/     # Reusable UI components
├── pages/          # Route pages
├── layouts/        # App layout wrapper
├── services/       # Data access layer (mock → replace with FastAPI)
├── mock/           # Mock data (used only by services)
├── hooks/          # Custom React hooks
├── utils/          # Helpers and constants
└── styles/         # Global CSS
```

**Important:** Pages fetch data only through `services/`. When integrating a FastAPI backend, replace service implementations while keeping the same function signatures.

## Build

```bash
npm run build
npm run preview
```
