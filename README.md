# EcoAgri AI

EcoAgri AI is a weather-powered crop intelligence application that helps farmers make clearer irrigation and crop-health decisions.

## What It Does

The application combines current weather observations, forecast rainfall, soil moisture, and crop profiles to produce a concise field advisory. Each analysis returns a recommended action, the reason behind it, an estimated water saving, a risk level, and practical follow-up advice.

## Features

- Premium responsive agri-tech interface built around field decisions
- Location and crop-specific weather analysis
- Smart irrigation recommendations with clear rationale and advisory notes
- Water-savings estimates and irrigation risk levels
- Crop Health Index based on temperature, humidity, and soil-moisture signals
- Forecast, rainfall, wind, and soil-moisture indicators for fast field review

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| Backend | FastAPI, Pydantic, HTTPX |
| Data integration | Configurable Weather AI provider endpoint |
| Testing | Pytest |

## Setup Instructions

### Prerequisites

- Node.js 18 or newer
- Python 3.11 or newer
- A Weather AI provider API key and endpoint

### 1. Configure the environment

Create a root `.env` file from the supplied template and add the provider credentials:

```bash
cp .env.example .env
```

Set `WEATHER_AI_API_KEY` and any required provider settings in `.env` before running an analysis.

If you do not have (or do not want to pay for) an external Weather AI provider, the backend
includes a configurable local fallback provider so the app continues working for development
and demonstration purposes. See **Configuration** below for the related settings.

### 2. Run the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

The FastAPI service starts at `http://localhost:8000`. Interactive API documentation is available at `http://localhost:8000/docs`.

### 3. Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser. By default, the frontend expects the API at `http://localhost:8000`; set `NEXT_PUBLIC_API_BASE_URL` if your backend runs elsewhere.

Configuration
 - **Settings file**: backend/app/core/config.py
 - **Fallback toggles**: `weather_enable_local_fallback` (default: true)
 - **Fallback defaults**: `weather_fallback_wind_speed_kph`, `weather_fallback_soil_moisture_percent`,
	 `weather_fallback_rainfall_mm`, `weather_fallback_temperature_offset`

What changed (no paid Weather API)
 - The backend will use a deterministic local fallback when `WEATHER_AI_API_KEY` is not set
	 and `weather_enable_local_fallback` is enabled. This fallback produces reasonable
	 placeholder values for temperature, humidity, rainfall, wind speed and soil moisture so
	 analysis and UI flows work without an external provider.
 - The fallback is configurable via `Settings` and covered by unit tests (`backend/tests/test_weather_fallback.py`).

Deployment guidance
 - Frontend (recommended): Deploy the `frontend/` Next.js app to Vercel. Connect your Git
	 repository in Vercel and set the project root to `frontend`. Add `NEXT_PUBLIC_API_BASE_URL`
	 env var to point to your backend URL after deployment.
 - Backend (recommended): Host the FastAPI backend on a Python-friendly host (Render,
	 Railway, Fly, or a small VPS). Configure env vars in the host (for example `WEATHER_AI_API_KEY`,
	 or leave it unset to use the local fallback). Ensure the service exposes `/api/v1/health` for
	 health checks.
 - Serverless note (Vercel): Vercel can host Python serverless functions but FastAPI
	 apps require adaptation (ASGI adapter) and have cold-start/time-limit constraints. For
	 production APIs prefer a dedicated Python host.

Quick deploy commands (local test)
```bash
# Run backend locally
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload

# Run frontend locally
cd frontend
npm install
npm run dev
```
