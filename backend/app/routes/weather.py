from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, status

from app.core.config import settings
from app.models.weather import WeatherAnalysisResponse
from app.services.decision_engine import IrrigationDecisionEngine
from app.services.weather_service import WeatherProviderError, WeatherService

router = APIRouter(prefix="/api", tags=["weather"])
weather_service = WeatherService(settings)
decision_engine = IrrigationDecisionEngine()


@router.get("/weather-analysis", response_model=WeatherAnalysisResponse)
async def get_weather_analysis(
    lat: Annotated[float, Query(ge=-90, le=90)],
    lon: Annotated[float, Query(ge=-180, le=180)],
    crop: Annotated[str, Query(min_length=1, max_length=80)],
) -> WeatherAnalysisResponse:
    try:
        weather = await weather_service.get_current_conditions(lat, lon, crop)
    except WeatherProviderError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

    recommendation, crop_health_score = decision_engine.analyze(weather, crop)
    return WeatherAnalysisResponse(
        crop=crop,
        location={"lat": lat, "lon": lon},
        weather=weather,
        recommendation=recommendation,
        crop_health_score=crop_health_score,
    )
