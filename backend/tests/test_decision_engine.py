from app.models.weather import WeatherSnapshot
from app.services.decision_engine import IrrigationDecisionEngine


def test_recommends_delaying_irrigation_when_rain_is_forecast() -> None:
    weather = WeatherSnapshot(
        temperature_celsius=25,
        humidity_percent=70,
        rainfall_mm=0,
        soil_moisture_percent=40,
        forecast_rainfall_mm=12,
    )

    recommendation, health_score = IrrigationDecisionEngine().analyze(weather, "maize")

    assert recommendation.action == "Delay Irrigation"
    assert "expected in the next 24 hours" in recommendation.reason
    assert recommendation.water_savings_liters > 0
    assert recommendation.risk_level == "Low"
    assert health_score > 0


def test_recommends_irrigation_for_a_dry_field_without_rain() -> None:
    weather = WeatherSnapshot(
        temperature_celsius=26,
        humidity_percent=55,
        rainfall_mm=0,
        soil_moisture_percent=20,
        forecast_rainfall_mm=0,
    )

    recommendation, _ = IrrigationDecisionEngine().analyze(weather, "maize")

    assert recommendation.action == "Irrigate Today"
    assert recommendation.water_savings_liters == 0
    assert recommendation.risk_level in {"Moderate", "High"}
