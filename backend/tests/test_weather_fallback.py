import asyncio

import pytest

from app.core.config import Settings
from app.services.weather_service import WeatherService, WeatherProviderError


def test_local_fallback_used_when_enabled() -> None:
    settings = Settings(
        weather_ai_api_key=None,
        weather_enable_local_fallback=True,
        weather_fallback_wind_speed_kph=5.5,
        weather_fallback_soil_moisture_percent=12.5,
    )

    svc = WeatherService(settings)

    snapshot = asyncio.run(svc.get_current_conditions(latitude=0.0, longitude=0.0, crop="maize"))

    assert snapshot.temperature_celsius is not None
    assert snapshot.humidity_percent is not None
    assert snapshot.wind_speed_kph == pytest.approx(5.5)
    assert snapshot.soil_moisture_percent == pytest.approx(12.5)


def test_no_fallback_raises_when_disabled() -> None:
    settings = Settings(weather_ai_api_key=None, weather_enable_local_fallback=False)
    svc = WeatherService(settings)

    with pytest.raises(WeatherProviderError):
        asyncio.run(svc.get_current_conditions(latitude=0.0, longitude=0.0, crop="maize"))
