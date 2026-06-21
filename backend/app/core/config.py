from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "WeatherAI Eco Agri Dashboard API"
    environment: str = "development"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"
    cors_origins: list[str] = ["http://localhost:3000"]
    weather_ai_api_key: str | None = None
    weather_ai_api_url: str = "https://api.weather-ai.co/v1/weather"
    weather_ai_timeout_seconds: float = 10.0
    weather_ai_max_retries: int = 3
    # Local fallback behaviour when external Weather AI is unavailable
    weather_enable_local_fallback: bool = True
    weather_fallback_wind_speed_kph: float = 10.0
    weather_fallback_soil_moisture_percent: float = 25.0
    # Default fallback rainfall (mm) and temperature offset (°C) applied to local fallback
    weather_fallback_rainfall_mm: float = 0.0
    weather_fallback_temperature_offset: float = 0.0

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
