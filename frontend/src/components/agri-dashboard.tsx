"use client";

import { FormEvent, useState } from "react";

import { apiClient, type WeatherAnalysis } from "@/lib/api-client";

const cropOptions = ["Maize", "Wheat", "Rice", "Tomato", "Potato"];

const features = [
  { icon: "◒", title: "Smart Irrigation", text: "Turn field conditions into precise watering decisions that protect every drop." },
  { icon: "✦", title: "Crop Health Monitoring", text: "Keep a simple, live view of the signals that influence crop performance." },
  { icon: "☁", title: "Weather Intelligence", text: "Bring local weather patterns into your day-to-day farm planning." },
  { icon: "!", title: "Risk Alerts", text: "Surface changing conditions early, before they become expensive problems." },
];

function formatNumber(value: number | null, suffix = "") {
  return value === null ? "—" : `${Math.round(value)}${suffix}`;
}

function MetricCard({ label, value, detail, icon, progress }: { label: string; value: string; detail: string; icon: string; progress?: number }) {
  return (
    <article className="rounded-3xl border border-emerald-950/5 bg-white p-6 shadow-[0_12px_35px_rgba(17,53,31,0.07)]">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-4xl font-semibold tracking-tight text-[#123321]">{value}</p></div>
        <span className="grid size-11 place-items-center rounded-2xl bg-[#edf6e8] text-lg text-[#217a41]" aria-hidden="true">{icon}</span>
      </div>
      {progress !== undefined && <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#e8eee6]"><div className="h-full rounded-full bg-[#5aaf4d]" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} /></div>}
      <p className="mt-3 text-sm text-slate-500">{detail}</p>
    </article>
  );
}

function HealthGauge({ score }: { score: number }) {
  const color = score >= 75 ? "#4ea84b" : score >= 50 ? "#d69b37" : "#d75a45";
  const state = score >= 75 ? "Healthy" : score >= 50 ? "Needs attention" : "At risk";
  return <div className="flex items-center gap-5"><div className="grid size-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(${color} ${score * 3.6}deg, #e8eee6 0deg)` }}><div className="grid size-[88px] place-items-center rounded-full bg-white"><span className="text-2xl font-bold text-[#173623]">{score}</span><span className="-mt-2 text-[10px] uppercase tracking-wider text-slate-400">score</span></div></div><div><p className="font-semibold text-[#173623]">{state}</p><p className="mt-1 max-w-xs text-sm leading-6 text-slate-500">Calculated from temperature, humidity, and root-zone moisture signals.</p></div></div>;
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
    const lat = Number(latText); const lon = Number(lonText);
    if (extra.length > 0 || !Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setError("Enter a valid location as latitude, longitude (for example: -1.2864, 36.8172)."); return;
    }
    setError(null); setIsLoading(true);
    try { setAnalysis(await apiClient.getWeatherAnalysis(lat, lon, crop.toLowerCase())); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to load weather analysis."); }
    finally { setIsLoading(false); }
  }

  const weather = analysis?.weather;
  const recommendation = analysis?.recommendation;
  const startAnalysis = () => document.getElementById("analysis")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8faf5] text-[#163522]">
      <section className="relative isolate overflow-hidden bg-[#123b2a] text-white">
        <div className="hero-orb hero-orb-one" /><div className="hero-orb hero-orb-two" />
        <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-6 sm:px-8 lg:px-12 lg:pb-32">
          <nav className="flex items-center justify-between"><a className="flex items-center gap-3 font-semibold" href="#top"><span className="grid size-10 place-items-center rounded-xl bg-[#a8d96b] text-xl text-[#123b2a]">⌁</span><span>EcoAgri <span className="font-normal text-[#b9d4c3]">AI</span></span></a><button onClick={startAnalysis} className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium transition hover:bg-white/10">Start Analysis</button></nav>
          <div id="top" className="grid gap-12 pt-20 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:pt-28">
            <div><p className="inline-flex rounded-full border border-[#b3d772]/30 bg-[#b3d772]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[.18em] text-[#c9e88f]">Built for better field decisions</p><h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">Weather-powered crop intelligence for <span className="text-[#b5df78]">smarter farming.</span></h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[#c8ddd0]">EcoAgri AI helps farmers optimise irrigation and protect crop health by turning weather and field signals into clear, practical advice.</p><div className="mt-9 flex flex-wrap gap-4"><button onClick={startAnalysis} className="rounded-full bg-[#b5df78] px-6 py-3.5 font-semibold text-[#123b2a] shadow-lg shadow-black/10 transition hover:bg-[#d0ed9b]">Start Analysis <span aria-hidden="true">→</span></button><a href="#features" className="rounded-full px-5 py-3.5 font-medium text-white/90 transition hover:text-white">Explore capabilities</a></div><div className="mt-12 flex gap-8 border-t border-white/15 pt-6 text-sm text-[#c8ddd0]"><span><strong className="block text-xl text-white">Weather-led</strong> field decisions</span><span><strong className="block text-xl text-white">Actionable</strong> recommendations</span></div></div>
            <div className="hero-panel relative rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl shadow-[#081d13]/30 backdrop-blur"><div className="rounded-[1.5rem] bg-[#f8faf5] p-5 text-[#173623]"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#5a8d58]">Live field snapshot</p><h2 className="mt-1 text-xl font-semibold">Nairobi farm zone</h2></div><span className="rounded-full bg-[#edf6e8] px-3 py-1.5 text-xs font-semibold text-[#287645]">AI ready</span></div><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-[#edf6e8] p-4"><p className="text-xs text-slate-500">Expected rain</p><p className="mt-2 text-2xl font-semibold">12.4 <span className="text-sm font-medium">mm</span></p><p className="mt-2 text-xs text-[#3b884b]">Next 24 hours</p></div><div className="rounded-2xl bg-[#fff4df] p-4"><p className="text-xs text-slate-500">Crop health</p><p className="mt-2 text-2xl font-semibold">86<span className="text-sm font-medium">/100</span></p><p className="mt-2 text-xs text-[#a76e22]">Healthy outlook</p></div></div><div className="mt-4 rounded-2xl bg-[#143e2a] p-4 text-white"><p className="text-xs font-semibold uppercase tracking-wider text-[#b5df78]">Today’s recommendation</p><p className="mt-2 text-lg font-semibold">Delay irrigation</p><p className="mt-1 text-sm text-[#c3d8c9]">Rainfall is expected to meet your near-term water needs.</p></div></div></div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12"><div className="max-w-2xl"><p className="section-kicker">A calmer way to manage uncertainty</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Everything you need for more informed farm decisions.</h2></div><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{features.map((feature) => <article key={feature.title} className="group rounded-3xl border border-[#dce7d9] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/5"><span className="grid size-11 place-items-center rounded-2xl bg-[#edf6e8] text-lg font-semibold text-[#247542]">{feature.icon}</span><h3 className="mt-6 text-lg font-semibold">{feature.title}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{feature.text}</p></article>)}</div></section>

      <section id="analysis" className="scroll-mt-4 border-y border-[#e1eadd] bg-[#eef4ea]"><div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12"><div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end"><div><p className="section-kicker">Field command centre</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Make your next irrigation move with confidence.</h2><p className="mt-3 max-w-2xl text-slate-600">Enter a field location and crop to translate current conditions into a clear operational recommendation.</p></div><form onSubmit={handleSubmit} className="grid gap-3 rounded-3xl bg-[#153d2b] p-4 shadow-xl shadow-emerald-950/10 sm:grid-cols-[1.35fr_1fr_auto]"><label className="sr-only" htmlFor="location">Location coordinates</label><input id="location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Latitude, longitude" className="min-w-0 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:ring-2 focus:ring-[#b5df78]" /><label className="sr-only" htmlFor="crop">Crop type</label><select id="crop" value={crop} onChange={(event) => setCrop(event.target.value)} className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#b5df78]">{cropOptions.map((option) => <option className="text-slate-900" key={option}>{option}</option>)}</select><button type="submit" disabled={isLoading} className="rounded-xl bg-[#b5df78] px-5 py-3 text-sm font-bold text-[#123b2a] transition hover:bg-[#d0ed9b] disabled:cursor-wait disabled:opacity-70">{isLoading ? "Analysing…" : "Analyse"}</button></form></div>
        {error && <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Temperature" value={weather ? formatNumber(weather.temperature_celsius, "°C") : "—"} detail="Current field conditions" icon="☀" progress={weather?.temperature_celsius ? Math.min(100, weather.temperature_celsius * 3) : 0} /><MetricCard label="Humidity" value={weather ? formatNumber(weather.humidity_percent, "%") : "—"} detail="Atmospheric moisture" icon="◌" progress={weather?.humidity_percent ?? 0} /><MetricCard label="Rainfall" value={weather ? formatNumber(weather.rainfall_mm, " mm") : "—"} detail="Observed precipitation" icon="☂" /><MetricCard label="Soil moisture" value={weather ? formatNumber(weather.soil_moisture_percent, "%") : "—"} detail="Root-zone reading" icon="⌁" progress={weather?.soil_moisture_percent ?? 0} /></div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.12fr_.88fr]"><article className="rounded-3xl bg-white p-7 shadow-[0_12px_35px_rgba(17,53,31,0.06)]"><div className="flex items-start justify-between"><div><p className="section-kicker">Forecast outlook</p><h3 className="mt-2 text-2xl font-semibold">Planning window</h3></div><span className="rounded-2xl bg-[#edf6e8] px-3 py-2 text-[#287645]">24 hours</span></div><div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-[#f5f8f2] p-4"><p className="text-xs font-medium uppercase tracking-wider text-slate-400">Expected rain</p><p className="mt-3 text-2xl font-semibold">{weather ? `${weather.forecast_rainfall_mm.toFixed(1)} mm` : "—"}</p></div><div className="rounded-2xl bg-[#f5f8f2] p-4"><p className="text-xs font-medium uppercase tracking-wider text-slate-400">Wind speed</p><p className="mt-3 text-2xl font-semibold">{weather ? formatNumber(weather.wind_speed_kph, " kph") : "—"}</p></div><div className="rounded-2xl bg-[#f5f8f2] p-4"><p className="text-xs font-medium uppercase tracking-wider text-slate-400">Decision</p><p className="mt-3 text-lg font-semibold">{recommendation?.action ?? "Awaiting analysis"}</p></div></div></article><article className="rounded-3xl border border-[#dce7d9] bg-white p-7"><p className="section-kicker">Crop health index</p><div className="mt-6">{analysis ? <HealthGauge score={analysis.crop_health_score} /> : <p className="text-sm leading-6 text-slate-500">Run an analysis to calculate your crop-health score.</p>}</div></article></div>
      </div></section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12"><div className="recommendation-grid overflow-hidden rounded-[2rem] bg-[#123b2a] text-white"><div className="p-7 sm:p-10"><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#b5df78]">Intelligent recommendation</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">{recommendation?.action ?? "Your field advice will appear here."}</h2><p className="mt-5 max-w-xl text-base leading-7 text-[#c5d8ca]">{recommendation?.reason ?? "Run a field analysis to combine weather data and crop conditions into a practical irrigation recommendation."}</p><div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5"><p className="text-xs font-semibold uppercase tracking-wider text-[#b5df78]">Advisory notes</p><p className="mt-2 leading-7 text-[#e0ece2]">{recommendation?.advice ?? "EcoAgri AI will explain what to do next and when to review conditions again."}</p></div></div><div className="grid content-center gap-4 bg-[#0e3021] p-7 sm:p-10"><div className="rounded-2xl border border-white/10 bg-white/5 p-5"><p className="text-sm text-[#b8cfc0]">Water savings estimate</p><p className="mt-2 text-3xl font-semibold text-[#b5df78]">{recommendation ? `${recommendation.water_savings_liters} L` : "—"}</p><p className="mt-1 text-sm text-[#b8cfc0]">Estimated for this decision</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-5"><p className="text-sm text-[#b8cfc0]">Risk level</p><p className="mt-2 text-2xl font-semibold">{recommendation?.risk_level ?? "—"}</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${recommendation?.risk_level === "High" ? "w-full bg-[#e5785e]" : recommendation?.risk_level === "Moderate" ? "w-2/3 bg-[#e5bc64]" : "w-1/3 bg-[#b5df78]"}`} /></div></div></div></div></section>

      <footer className="border-t border-[#e1eadd] px-5 py-8 text-center text-sm text-slate-500">© {new Date().getFullYear()} EcoAgri AI · Weather-powered intelligence for resilient farms.</footer>
    </main>
  );
}
