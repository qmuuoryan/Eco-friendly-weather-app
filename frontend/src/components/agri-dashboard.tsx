"use client";

import { FormEvent, useState } from "react";

import { apiClient, type WeatherAnalysis } from "@/lib/api-client";

const cropOptions = ["Maize", "Wheat", "Rice", "Tomato", "Potato"];

function formatNumber(value: number | null, suffix = "") {
  return value === null ? "—" : `${Math.round(value)}${suffix}`;
}

function WeatherCard({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: string }) {
  return (
    <article className="rounded-2xl border border-emerald-950/5 bg-white p-5 shadow-[0_8px_30px_rgb(22,44,24,0.06)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
        </div>
        <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-xl" aria-hidden="true">{icon}</span>
      </div>
      <p className="mt-4 text-sm text-slate-500">{detail}</p>
    </article>
  );
}

function ForecastCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <article className="rounded-2xl border border-white/70 bg-white/70 p-4 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">{title}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </article>
  );
}

function HealthGauge({ score }: { score: number }) {
  const color = score >= 75 ? "#15803d" : score >= 50 ? "#ca8a04" : "#dc2626";
  const status = score >= 75 ? "Healthy" : score >= 50 ? "Needs attention" : "At risk";

  return (
    <div className="flex items-center gap-5">
      <div
        className="grid size-28 shrink-0 place-items-center rounded-full"
        style={{ background: `conic-gradient(${color} ${score * 3.6}deg, #e7eee7 0deg)` }}
      >
        <div className="grid size-20 place-items-center rounded-full bg-[#f5f8ef]">
          <span className="text-2xl font-bold text-slate-900">{score}</span>
        </div>
      </div>
      <div>
        <p className="font-semibold text-slate-900">{status}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">Based on current temperature, humidity, and soil moisture signals.</p>
      </div>
    </div>
  );
}

export function AgriDashboard() {
  const [location, setLocation] = useState("-1.2864, 36.8172");
  const [crop, setCrop] = useState("Maize");
  const [analysis, setAnalysis] = useState<WeatherAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const [latText, lonText, ...extra] = location.split(",").map((part) => part.trim());
    const lat = Number(latText);
    const lon = Number(lonText);
    if (extra.length > 0 || !Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setError("Enter a valid location as latitude, longitude (for example: -1.2864, 36.8172).");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      setAnalysis(await apiClient.getWeatherAnalysis(lat, lon, crop.toLowerCase()));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load weather analysis.");
    } finally {
      setIsLoading(false);
    }
  }

  const weather = analysis?.weather;

  return (
    <main className="min-h-screen bg-[#f5f8ef] text-slate-900">
      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-12">
        <header className="flex flex-col gap-5 border-b border-emerald-950/10 pb-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-emerald-700 text-xl shadow-lg shadow-emerald-900/15" aria-hidden="true">🌿</div>
            <div>
              <p className="text-lg font-bold tracking-tight">WeatherAI</p>
              <p className="text-sm text-slate-500">Eco Agri Dashboard</p>
            </div>
          </div>
          <span className="w-fit rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-800">Field intelligence</span>
        </header>

        <section className="grid gap-8 py-9 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Farm overview</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Make every drop count.</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Use local weather intelligence to plan irrigation and protect crop health.</p>
          </div>
          <form onSubmit={handleSubmit} className="rounded-2xl bg-emerald-900 p-5 text-white shadow-xl shadow-emerald-950/15">
            <label className="block text-sm font-medium" htmlFor="location">Location coordinates</label>
            <input id="location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="-1.2864, 36.8172" className="mt-2 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2.5 text-sm outline-none placeholder:text-emerald-100/60 focus:ring-2 focus:ring-lime-300" />
            <label className="mt-4 block text-sm font-medium" htmlFor="crop">Crop type</label>
            <select id="crop" value={crop} onChange={(event) => setCrop(event.target.value)} className="mt-2 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-lime-300">
              {cropOptions.map((option) => <option className="text-slate-900" key={option}>{option}</option>)}
            </select>
            <button type="submit" disabled={isLoading} className="mt-5 w-full rounded-lg bg-lime-300 px-4 py-2.5 text-sm font-semibold text-emerald-950 transition hover:bg-lime-200 disabled:cursor-wait disabled:opacity-70">
              {isLoading ? "Analysing field…" : "Analyse field"}
            </button>
          </form>
        </section>

        {error && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

        <section aria-label="Current weather" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <WeatherCard label="Temperature" value={weather ? formatNumber(weather.temperature_celsius, "°C") : "—"} detail="Current field conditions" icon="☀️" />
          <WeatherCard label="Humidity" value={weather ? formatNumber(weather.humidity_percent, "%") : "—"} detail="Atmospheric moisture" icon="💧" />
          <WeatherCard label="Rainfall" value={weather ? formatNumber(weather.rainfall_mm, " mm") : "—"} detail="Observed precipitation" icon="🌧️" />
          <WeatherCard label="Soil moisture" value={weather ? formatNumber(weather.soil_moisture_percent, "%") : "—"} detail="Root-zone reading" icon="🌱" />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-emerald-950/5 bg-[#eaf3e6] p-6">
            <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Forecast outlook</p><h2 className="mt-1 text-xl font-semibold">Planning window</h2></div><span className="text-2xl" aria-hidden="true">⛅</span></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <ForecastCard title="Expected rain" value={weather ? `${weather.forecast_rainfall_mm.toFixed(1)} mm` : "—"} detail="Provider forecast" />
              <ForecastCard title="Wind" value={weather ? formatNumber(weather.wind_speed_kph, " kph") : "—"} detail="Current wind speed" />
              <ForecastCard title="Irrigation" value={analysis?.irrigation.should_irrigate ? "Recommended" : analysis ? "Hold" : "—"} detail="Based on rainfall and soil" />
            </div>
          </div>

          <section className="rounded-2xl border border-emerald-950/5 bg-white p-6 shadow-[0_8px_30px_rgb(22,44,24,0.06)]" aria-label="Crop Health Index">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Crop Health Index</p>
            <div className="mt-5">{analysis ? <HealthGauge score={analysis.crop_health_score} /> : <p className="text-sm leading-6 text-slate-500">Run an analysis to calculate crop health.</p>}</div>
          </section>
        </section>

        <section className="mt-6 rounded-2xl bg-slate-950 p-6 text-white">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.14em] text-lime-300">Irrigation recommendation</p><h2 className="mt-2 text-2xl font-semibold">{analysis ? (analysis.irrigation.should_irrigate ? `Apply ${analysis.irrigation.recommended_water_mm} mm of water` : "Irrigation can wait") : "Your next recommendation will appear here"}</h2></div>{analysis && <span className="w-fit rounded-full bg-white/10 px-3 py-1.5 text-sm capitalize text-lime-200">{analysis.irrigation.urgency} priority</span>}</div>
          {analysis && <ul className="mt-5 grid gap-2 text-sm leading-6 text-slate-300">{analysis.irrigation.rationale.map((reason) => <li className="flex gap-2" key={reason}><span className="text-lime-300">✓</span>{reason}</li>)}</ul>}
        </section>
      </div>
    </main>
  );
}
