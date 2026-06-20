from dataclasses import dataclass

from app.models.weather import IrrigationRecommendation, WeatherSnapshot


@dataclass(frozen=True)
class CropProfile:
    optimal_temperature_min: float
    optimal_temperature_max: float
    target_soil_moisture: float


DEFAULT_PROFILE = CropProfile(18.0, 30.0, 55.0)
CROP_PROFILES = {
    "maize": CropProfile(18.0, 32.0, 55.0),
    "wheat": CropProfile(12.0, 25.0, 50.0),
    "rice": CropProfile(20.0, 35.0, 70.0),
    "tomato": CropProfile(18.0, 30.0, 60.0),
    "potato": CropProfile(15.0, 24.0, 60.0),
}


class IrrigationDecisionEngine:
    """Converts weather observations into explainable, conservative recommendations."""

    def analyze(self, weather: WeatherSnapshot, crop: str) -> tuple[IrrigationRecommendation, int]:
        profile = CROP_PROFILES.get(crop.lower().strip(), DEFAULT_PROFILE)
        rationale: list[str] = []
        moisture_deficit = max(0.0, profile.target_soil_moisture - (weather.soil_moisture_percent or 0))
        rain_credit = weather.forecast_rainfall_mm + weather.rainfall_mm

        if weather.soil_moisture_percent is None:
            rationale.append("Soil moisture was unavailable; the recommendation uses rainfall signals.")
            moisture_deficit = 15.0 if rain_credit < 5.0 else 0.0
        elif moisture_deficit > 0:
            rationale.append(f"Soil moisture is {moisture_deficit:.0f}% below the crop target.")
        else:
            rationale.append("Soil moisture is at or above the crop target.")

        water_mm = max(0.0, round((moisture_deficit * 0.45) - rain_credit, 1))
        should_irrigate = water_mm >= 3.0
        if rain_credit >= 5.0:
            rationale.append("Recent or forecast rainfall reduces the irrigation requirement.")
        if should_irrigate:
            urgency = "high" if water_mm >= 12 else "moderate"
            rationale.append(f"Apply approximately {water_mm:.1f} mm of water, then reassess soil moisture.")
        else:
            urgency = "low"
            rationale.append("No irrigation is currently required.")

        health_score = self._health_score(weather, profile)
        return (
            IrrigationRecommendation(
                should_irrigate=should_irrigate,
                recommended_water_mm=water_mm,
                urgency=urgency,
                rationale=rationale,
            ),
            health_score,
        )

    @staticmethod
    def _health_score(weather: WeatherSnapshot, profile: CropProfile) -> int:
        score = 100
        if weather.temperature_celsius < profile.optimal_temperature_min:
            score -= int((profile.optimal_temperature_min - weather.temperature_celsius) * 3)
        elif weather.temperature_celsius > profile.optimal_temperature_max:
            score -= int((weather.temperature_celsius - profile.optimal_temperature_max) * 3)
        if weather.soil_moisture_percent is not None:
            score -= int(abs(profile.target_soil_moisture - weather.soil_moisture_percent) * 0.5)
        if weather.humidity_percent < 30 or weather.humidity_percent > 90:
            score -= 8
        return max(0, min(100, score))
