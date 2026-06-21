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
        moisture_deficit = max(0.0, profile.target_soil_moisture - (weather.soil_moisture_percent or 0))
        rain_credit = weather.forecast_rainfall_mm + weather.rainfall_mm

        if weather.soil_moisture_percent is None:
            moisture_deficit = 15.0 if rain_credit < 5.0 else 0.0

        water_mm = max(0.0, round((moisture_deficit * 0.45) - rain_credit, 1))
        if weather.forecast_rainfall_mm >= 5.0:
            action = "Delay Irrigation"
            reason = f"{weather.forecast_rainfall_mm:.1f} mm of rainfall is expected in the next 24 hours."
            water_savings_liters = int(round(max(water_mm, 3.0) * 100))
            risk_level = "Low"
            advice = "Allow the rainfall to recharge the root zone, then reassess soil moisture tomorrow."
        elif water_mm >= 3.0:
            action = "Irrigate Today"
            reason = f"Soil moisture is below the {profile.target_soil_moisture:.0f}% target for {crop.title()}."
            water_savings_liters = 0
            risk_level = "High" if water_mm >= 12 else "Moderate"
            advice = f"Apply approximately {water_mm:.1f} mm of water in an early-morning cycle and reassess afterward."
        else:
            action = "Maintain Current Schedule"
            reason = "Available soil moisture and rainfall signals meet the crop's near-term water requirement."
            water_savings_liters = int(round(max(3.0, rain_credit) * 100)) if rain_credit else 0
            risk_level = "Low"
            advice = "Monitor field conditions and run another analysis before the next scheduled irrigation cycle."

        health_score = self._health_score(weather, profile)
        return (
            IrrigationRecommendation(
                action=action,
                reason=reason,
                water_savings_liters=water_savings_liters,
                risk_level=risk_level,
                advice=advice,
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
