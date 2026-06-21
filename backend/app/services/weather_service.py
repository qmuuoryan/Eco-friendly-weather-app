import asyncio
from collections.abc import Mapping
from typing import Any

import httpx

from app.core.config import Settings
from app.models.weather import WeatherSnapshot


class WeatherProviderError(Exception):
    """Raised when the Weather AI provider cannot supply usable weather data."""


class WeatherService:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    async def get_current_conditions(self, latitude: float, longitude: float, crop: str) -> WeatherSnapshot:
        # If API key isn't configured, optionally use a deterministic local fallback.
        if not self._settings.weather_ai_api_key:
            if self._settings.weather_enable_local_fallback:
                return self._local_fallback(latitude, longitude, crop)
            raise WeatherProviderError("Weather AI API key is not configured.")

        headers = {"Authorization": f"Bearer {self._settings.weather_ai_api_key}"}
        params = {"lat": latitude, "lon": longitude, "crop": crop}
        timeout = httpx.Timeout(self._settings.weather_ai_timeout_seconds)

        async with httpx.AsyncClient(timeout=timeout) as client:
            try:
                payload = await self._request_with_retry(client, headers, params)
            except WeatherProviderError:
                # Fall back to local provider if the external service is unavailable and enabled.
                if self._settings.weather_enable_local_fallback:
                    return self._local_fallback(latitude, longitude, crop)
                raise
        return self._normalise_response(payload)

    def _local_fallback(self, latitude: float, longitude: float, crop: str) -> WeatherSnapshot:
        """Return a simple deterministic weather snapshot when the external API isn't available.

        Uses configured defaults from `Settings` so behaviour is configurable for tests
        and different deployments.
        """
        # Temperature heuristic: warmer near equator, cooler towards poles
        lat_abs = abs(latitude)
        temperature = max(-30.0, min(45.0, 25.0 - (lat_abs / 90.0) * 30.0))

        # Humidity heuristic: a simple function of latitude
        humidity = max(0.0, min(100.0, 60.0 - (lat_abs / 90.0) * 40.0))

        # Small default rainfall and forecast
        rainfall = 0.0
        forecast_rainfall = 0.0

        # Use configured defaults for optional values
        wind_speed = float(self._settings.weather_fallback_wind_speed_kph)
        soil_moisture = float(self._settings.weather_fallback_soil_moisture_percent)

        return WeatherSnapshot(
            temperature_celsius=temperature,
            humidity_percent=humidity,
            rainfall_mm=rainfall,
            wind_speed_kph=wind_speed,
            soil_moisture_percent=soil_moisture,
            forecast_rainfall_mm=forecast_rainfall,
        )

    async def _request_with_retry(
        self, client: httpx.AsyncClient, headers: dict[str, str], params: dict[str, float | str]
    ) -> Mapping[str, Any]:
        retries = self._settings.weather_ai_max_retries
        for attempt in range(retries):
            try:
                response = await client.get(self._settings.weather_ai_api_url, headers=headers, params=params)
                if response.status_code in {408, 429} or response.status_code >= 500:
                    if attempt < retries - 1:
                        await asyncio.sleep(0.5 * (2**attempt))
                        continue
                    raise WeatherProviderError("Weather AI service is temporarily unavailable.")
                if response.status_code in {401, 403}:
                    raise WeatherProviderError("Weather AI authentication was rejected.")
                response.raise_for_status()
                try:
                    body = response.json()
                except ValueError as exc:
                    raise WeatherProviderError("Weather AI returned malformed JSON.") from exc
                if not isinstance(body, Mapping):
                    raise WeatherProviderError("Weather AI returned an invalid response format.")
                return body
            except (httpx.TimeoutException, httpx.NetworkError) as exc:
                if attempt < retries - 1:
                    await asyncio.sleep(0.5 * (2**attempt))
                    continue
                raise WeatherProviderError("Could not reach the Weather AI service.") from exc
            except httpx.HTTPStatusError as exc:
                raise WeatherProviderError("Weather AI rejected the weather request.") from exc

        raise WeatherProviderError("Weather AI service is temporarily unavailable.")

    @staticmethod
    def _normalise_response(payload: Mapping[str, Any]) -> WeatherSnapshot:
        current = payload.get("current", payload.get("data", payload))
        if not isinstance(current, Mapping):
            raise WeatherProviderError("Weather AI response does not contain current weather data.")

        def value(*keys: str, default: float | None = None) -> float | None:
            for key in keys:
                candidate = current.get(key)
                if candidate is not None:
                    try:
                        return float(candidate)
                    except (TypeError, ValueError) as exc:
                        raise WeatherProviderError(f"Weather AI returned an invalid value for {key}.") from exc
            return default

        temperature = value("temperature_celsius", "temperature", "temp_c")
        humidity = value("humidity_percent", "humidity")
        if temperature is None or humidity is None:
            raise WeatherProviderError("Weather AI response is missing temperature or humidity.")

        forecast = payload.get("forecast", {})
        forecast_rainfall = 0.0
        if isinstance(forecast, Mapping):
            try:
                forecast_rainfall = float(
                    forecast.get("rainfall_mm", forecast.get("rain_mm", 0.0))
                )
            except (TypeError, ValueError) as exc:
                raise WeatherProviderError("Weather AI returned an invalid forecast rainfall value.") from exc
        return WeatherSnapshot(
            temperature_celsius=temperature,
            humidity_percent=humidity,
            rainfall_mm=value("rainfall_mm", "rain_mm", "precipitation_mm", default=0.0) or 0.0,
            wind_speed_kph=value("wind_speed_kph", "wind_kph"),
            soil_moisture_percent=value("soil_moisture_percent", "soil_moisture"),
            forecast_rainfall_mm=forecast_rainfall,
        )
