import io

import pandas as pd
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.models.schemas import ForecastResponse
from app.services.arima_engine import run_full_forecast

router = APIRouter(prefix="/api", tags=["forecast"])


@router.post("/forecast", response_model=ForecastResponse)
async def forecast(
    file: UploadFile = File(...),
    metric: str = Form(...),
    forecast_years: int = Form(...),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")

    valid_metrics = ["CPU", "Memory", "Storage"]
    if metric not in valid_metrics:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid metric '{metric}'. Must be one of {valid_metrics}",
        )

    if forecast_years < 1:
        raise HTTPException(status_code=400, detail="forecast_years must be >= 1")

    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to parse CSV file")

    if "Tanggal" not in df.columns:
        raise HTTPException(status_code=400, detail="CSV must contain a 'Tanggal' column")

    if metric not in df.columns:
        raise HTTPException(status_code=400, detail=f"CSV must contain a '{metric}' column")

    df["Tanggal"] = pd.to_datetime(df["Tanggal"], dayfirst=True)
    df = df.sort_values("Tanggal")
    df.set_index("Tanggal", inplace=True)

    ts = df[metric].dropna()
    forecast_period = forecast_years * 12

    try:
        result = run_full_forecast(ts, forecast_period=forecast_period, seasonal=True)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting failed: {e}")

    return result
