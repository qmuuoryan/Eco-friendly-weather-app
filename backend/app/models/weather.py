from pydantic import BaseModel


class WeatherSnapshot(BaseModel):
    temperature_celsius: float
    rainfall_mm: float
    humidity_percent: float
    wind_speed_kph: float | None = None
    soil_moisture_percent: float | None = None
    forecast_rainfall_mm: float = 0.0


class IrrigationRecommendation(BaseModel):
    should_irrigate: bool
    recommended_water_mm: float
    urgency: str
    rationale: list[str]


class WeatherAnalysisResponse(BaseModel):
    crop: str
    location: dict[str, float]
    weather: WeatherSnapshot
    irrigation: IrrigationRecommendation
    crop_health_score: int
