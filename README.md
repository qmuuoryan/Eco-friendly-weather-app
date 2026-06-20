# WeatherAI Eco Agri Dashboard

Starter monorepo for an agricultural dashboard powered by weather data and AI-ready services.

## Structure

```text
.
├── frontend/                 # Next.js and Tailwind CSS application
└── backend/                  # FastAPI service
```

## Local development

1. Copy the root environment template:

   ```bash
   cp .env.example .env
   ```

2. Start the API:

   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -e ".[dev]"
   uvicorn app.main:app --reload
   ```

3. Start the web application in another terminal:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

The frontend runs at `http://localhost:3000`; the API documentation is at `http://localhost:8000/docs`.

## Next steps

- Add weather-provider adapters under `backend/app/services`.
- Define database models and migrations when persistence is introduced.
- Add dashboard domain modules and tests as product features are specified.
