from __future__ import annotations

from typing import Optional
from pydantic import BaseModel


class ForecastRequest(BaseModel):
    metric: str
    forecast_period: int
    seasonal: bool = True


class ForecastPoint(BaseModel):
    date: str
    value: Optional[float]
    lower_ci: Optional[float]
    upper_ci: Optional[float]


class ModelDiagnostics(BaseModel):
    order: tuple
    seasonal_order: Optional[tuple]
    aic: float
    bic: float
    adf_statistic: float
    adf_pvalue: float
    is_stationary: bool


class EvaluationMetrics(BaseModel):
    mape: Optional[float]
    rmse: Optional[float]
    mae: Optional[float]


class ForecastResponse(BaseModel):
    historical: list[ForecastPoint]
    forecast: list[ForecastPoint]
    diagnostics: ModelDiagnostics
    metrics: EvaluationMetrics
    model_summary: str
