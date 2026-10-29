import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional
from app.models.schemas import AccuracyMetrics

def calculate_accuracy_metrics(pairs: List[Dict[str, Any]]) -> AccuracyMetrics:
    """
    Calculate quantitative accuracy metrics for a set of (actual, forecast) pairs.
    Each pair must contain 'actual' and 'forecast'.
    """
    valid = [p for p in pairs if p.get("actual") is not None and p.get("forecast") is not None]
    if not valid:
        return AccuracyMetrics(
            mae=0.0,
            rmse=0.0,
            mape=0.0,
            nmae=0.0,
            bias=0.0,
            maxOverForecastMW=0.0,
            maxUnderForecastMW=0.0,
            p10ErrorMW=0.0,
            p50ErrorMW=0.0,
            p90ErrorMW=0.0,
            totalActualMWh=0.0,
            totalForecastMWh=0.0,
            validPeriodsCount=0
        )

    actuals = np.array([float(p["actual"]) for p in valid], dtype=float)
    forecasts = np.array([float(p["forecast"]) for p in valid], dtype=float)
    errors = forecasts - actuals # Positive = Over-forecast, Negative = Under-forecast
    abs_errors = np.abs(errors)

    mae = float(np.mean(abs_errors))
    rmse = float(np.sqrt(np.mean(errors ** 2)))
    
    # Avoid zero division in MAPE by setting minimum denominator to 10.0 MW
    safe_actuals = np.where(actuals < 10.0, 10.0, actuals)
    mape = float(np.mean(abs_errors / safe_actuals) * 100.0)

    # Normalized MAE by peak actual generation
    peak_actual = float(np.max(actuals)) if len(actuals) > 0 and np.max(actuals) > 0 else 1.0
    nmae = float((mae / peak_actual) * 100.0)

    bias = float(np.mean(errors))
    max_over = float(np.max(errors)) if len(errors) > 0 else 0.0
    max_under = float(np.min(errors)) if len(errors) > 0 else 0.0

    p10 = float(np.percentile(errors, 10))
    p50 = float(np.percentile(errors, 50))
    p90 = float(np.percentile(errors, 90))

    # Energy in MWh: each settlement period is 30 mins = 0.5 hour
    total_act_mwh = float(np.sum(actuals) * 0.5)
    total_fc_mwh = float(np.sum(forecasts) * 0.5)

    return AccuracyMetrics(
        mae=round(mae, 2),
        rmse=round(rmse, 2),
        mape=round(mape, 2),
        nmae=round(nmae, 2),
        bias=round(bias, 2),
        maxOverForecastMW=round(max_over, 2),
        maxUnderForecastMW=round(max_under, 2),
        p10ErrorMW=round(p10, 2),
        p50ErrorMW=round(p50, 2),
        p90ErrorMW=round(p90, 2),
        totalActualMWh=round(total_act_mwh, 2),
        totalForecastMWh=round(total_fc_mwh, 2),
        validPeriodsCount=len(valid)
    )
