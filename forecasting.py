import pandas as pd
from pmdarima import auto_arima

def run_forecast(data: pd.DataFrame, metric: str, forecast_period: int) -> pd.Series:
    ts = data[metric].dropna()

    if ts.empty or len(ts) < 6:
        return pd.Series([None] * forecast_period)

    seasonal_flag = len(ts) >= 24  # hanya musiman jika data >= 2 tahun

    try:
        model = auto_arima(
            ts,
            seasonal=seasonal_flag,
            m=12 if seasonal_flag else 1,
            stepwise=True,
            suppress_warnings=True,
            error_action='ignore'
        )
        forecast = model.predict(n_periods=forecast_period)
        if len(forecast) < forecast_period:
            forecast = list(forecast) + [None] * (forecast_period - len(forecast))
    except Exception as e:
        print(f"[run_forecast] Gagal: {e}")
        forecast = [None] * forecast_period

    last_date = data.index[-1]
    future_index = pd.date_range(start=last_date + pd.offsets.MonthBegin(1), periods=forecast_period, freq='MS')
    return pd.Series(forecast, index=future_index)