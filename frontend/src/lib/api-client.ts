const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");

export type WeatherAnalysis = {
  crop: string;
  location: { lat: number; lon: number };
  weather: {
    temperature_celsius: number;
    rainfall_mm: number;
    humidity_percent: number;
    wind_speed_kph: number | null;
    soil_moisture_percent: number | null;
    forecast_rainfall_mm: number;
  };
  irrigation: {
    should_irrigate: boolean;
    recommended_water_mm: number;
    urgency: "low" | "moderate" | "high";
    rationale: string[];
  };
  crop_health_score: number;
};

export class ApiClient {
  async getHealth(): Promise<{ status: string }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/health`, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  }

  async getWeatherAnalysis(lat: number, lon: number, crop: string): Promise<WeatherAnalysis> {
    const query = new URLSearchParams({ lat: String(lat), lon: String(lon), crop });
    const response = await fetch(`${API_BASE_URL}/api/weather-analysis?${query}`, {
      cache: "no-store",
    });
    const body = (await response.json().catch(() => null)) as { detail?: string } | null;

    if (!response.ok) {
      throw new Error(body?.detail ?? `Weather analysis request failed: ${response.status}`);
    }

    return body as WeatherAnalysis;
  }
}

export const apiClient = new ApiClient();
