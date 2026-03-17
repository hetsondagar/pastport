from __future__ import annotations

from typing import Dict, Any, List

TRAITS = ["optimismScore", "ambitionScore", "anxietyScore", "reflectionScore", "socialFocusScore"]


def forecast_personality(history: List[Dict[str, Any]], years: int = 3) -> Dict[str, float]:
    """
    Forecast each trait independently using Prophet on monthly snapshots.
    History rows must include 'ds' (date string) and trait columns.
    """
    if not history or len(history) < 4:
        # Not enough history; return neutral-ish defaults
        return {t: 0.5 for t in TRAITS}

    # Lazy import heavy dependencies to avoid startup overhead on requests that
    # do not need forecasting (most present/past chats and process-entry calls).
    try:
        import pandas as pd
        from prophet import Prophet
    except Exception:
        # Graceful fallback when Prophet stack is unavailable in constrained envs.
        out: Dict[str, float] = {}
        for trait in TRAITS:
            vals = [row.get(trait) for row in history if isinstance(row.get(trait), (int, float))]
            out[trait] = float(sum(vals) / len(vals)) if vals else 0.5
        return out

    df = pd.DataFrame(history).copy()
    if "ds" not in df.columns:
        return {t: 0.5 for t in TRAITS}

    df["ds"] = pd.to_datetime(df["ds"])
    df = df.sort_values("ds")

    future_months = max(12, int(years) * 12)
    out: Dict[str, float] = {}

    for trait in TRAITS:
        if trait not in df.columns:
            out[trait] = 0.5
            continue

        series = df[["ds", trait]].rename(columns={trait: "y"}).dropna()
        if len(series) < 4:
            out[trait] = float(series["y"].mean()) if len(series) else 0.5
            continue

        # Prophet expects y to be numeric; clamp to [0,1] later.
        m = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=False,
            daily_seasonality=False,
            changepoint_prior_scale=0.2,
        )
        m.fit(series)
        future = m.make_future_dataframe(periods=future_months, freq="MS")
        forecast = m.predict(future)
        yhat = float(forecast.iloc[-1]["yhat"])
        out[trait] = float(max(0.0, min(1.0, yhat)))

    return out


