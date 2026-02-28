from __future__ import annotations

from typing import Optional

import numpy as np


def compute_mape(actual: np.ndarray, predicted: np.ndarray) -> Optional[float]:
    actual = np.asarray(actual, dtype=float)
    predicted = np.asarray(predicted, dtype=float)
    mask = ~np.isnan(actual) & ~np.isnan(predicted) & (actual != 0)
    if mask.sum() == 0:
        return None
    return float(np.mean(np.abs((actual[mask] - predicted[mask]) / actual[mask])) * 100)


def compute_rmse(actual: np.ndarray, predicted: np.ndarray) -> Optional[float]:
    actual = np.asarray(actual, dtype=float)
    predicted = np.asarray(predicted, dtype=float)
    mask = ~np.isnan(actual) & ~np.isnan(predicted)
    if mask.sum() == 0:
        return None
    return float(np.sqrt(np.mean((actual[mask] - predicted[mask]) ** 2)))


def compute_mae(actual: np.ndarray, predicted: np.ndarray) -> Optional[float]:
    actual = np.asarray(actual, dtype=float)
    predicted = np.asarray(predicted, dtype=float)
    mask = ~np.isnan(actual) & ~np.isnan(predicted)
    if mask.sum() == 0:
        return None
    return float(np.mean(np.abs(actual[mask] - predicted[mask])))
