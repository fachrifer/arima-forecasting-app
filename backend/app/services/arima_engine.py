import pandas as pd
import numpy as np
from pmdarima import auto_arima
from statsmodels.tsa.stattools import adfuller

from app.services.evaluation import compute_mape, compute_rmse, compute_mae


def _run_adf_test(ts: pd.Series) -> dict:
    result = adfuller(ts, autolag="AIC")
    return {
        "adf_statistic": float(result[0]),
        "adf_pvalue": float(result[1]),
        "is_stationary": result[1] < 0.05,
    }


def _evaluate_on_test(ts: pd.Series, seasonal: bool, m: int) -> dict:
    split = max(1, int(len(ts) * 0.8))
    train, test = ts.iloc[:split], ts.iloc[split:]
    if len(test) == 0:
        return {"mape": None, "rmse": None, "mae": None}

    try:
        model = auto_arima(
            train,
            seasonal=seasonal,
            m=m,
            stepwise=True,
            suppress_warnings=True,
            error_action="ignore",
        )
        predicted = model.predict(n_periods=len(test))
        return {
            "mape": compute_mape(test.values, predicted),
            "rmse": compute_rmse(test.values, predicted),
            "mae": compute_mae(test.values, predicted),
        }
    except Exception:
        return {"mape": None, "rmse": None, "mae": None}


def run_full_forecast(
    ts: pd.Series, forecast_period: int, seasonal: bool = True
) -> dict:
    if ts.empty or len(ts) < 6:
        raise ValueError("Time series must have at least 6 data points")

    m = 12 if seasonal and len(ts) >= 24 else 1
    use_seasonal = seasonal and len(ts) >= 24

    adf = _run_adf_test(ts)
    eval_metrics = _evaluate_on_test(ts, use_seasonal, m)

    model = auto_arima(
        ts,
        seasonal=use_seasonal,
        m=m,
        stepwise=True,
        suppress_warnings=True,
        error_action="ignore",
    )

    fc, conf_int = model.predict(n_periods=forecast_period, return_conf_int=True)

    # convert to plain numpy arrays to avoid pandas DatetimeIndex key errors
    fc_arr = np.asarray(fc, dtype=float)
    conf_arr = np.asarray(conf_int, dtype=float)

    last_date = ts.index[-1]
    future_index = pd.date_range(
        start=last_date + pd.offsets.MonthBegin(1),
        periods=forecast_period,
        freq="MS",
    )

    forecast_points = []
    for i, date in enumerate(future_index):
        forecast_points.append(
            {
                "date": date.strftime("%Y-%m-%d"),
                "value": float(fc_arr[i]) if not np.isnan(fc_arr[i]) else None,
                "lower_ci": float(conf_arr[i, 0]) if not np.isnan(conf_arr[i, 0]) else None,
                "upper_ci": float(conf_arr[i, 1]) if not np.isnan(conf_arr[i, 1]) else None,
            }
        )

    historical_points = []
    for date, value in ts.items():
        historical_points.append(
            {
                "date": date.strftime("%Y-%m-%d"),
                "value": float(value) if not np.isnan(value) else None,
                "lower_ci": None,
                "upper_ci": None,
            }
        )

    seasonal_order = (
        tuple(model.seasonal_order) if use_seasonal else None
    )

    return {
        "historical": historical_points,
        "forecast": forecast_points,
        "diagnostics": {
            "order": tuple(model.order),
            "seasonal_order": seasonal_order,
            "aic": float(model.aic()),
            "bic": float(model.bic()),
            **adf,
        },
        "metrics": eval_metrics,
        "model_summary": str(model.summary()),
    }
