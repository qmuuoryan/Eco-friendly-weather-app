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
