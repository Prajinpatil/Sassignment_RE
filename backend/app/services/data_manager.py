import os
import sqlite3
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
import pandas as pd
import numpy as np

from app.models.schemas import (
    SettlementPeriodData,
    AccuracyMetrics,
    DayAheadForecastResponse,
    DailyMetricItem,
    HourlyProfileItem,
    MonthOverviewResponse,
    DataSyncResponse
)
from app.services.metrics_engine import calculate_accuracy_metrics
from app.config import settings

DB_PATH = os.path.join(settings.DATA_DIR, "elexon_wind_2026.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def format_period_label(period: int) -> str:
    """Format settlement period (1-48) into HH:MM - HH:MM string."""
    start_minutes = (period - 1) * 30
    end_minutes = period * 30
    sh, sm = divmod(start_minutes, 60)
    eh, em = divmod(end_minutes, 60)
    if eh == 24:
        return f"{sh:02d}:{sm:02d} - 24:00"
    return f"{sh:02d}:{sm:02d} - {eh:02d}:{em:02d}"

class DataManager:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path

    def get_day_ahead_forecast(
        self,
        target_date: str,
        cutoff_hour: int = 11
    ) -> DayAheadForecastResponse:
        """
        Retrieves the day-ahead wind forecast for delivery on target_date,
        using only forecasts published prior to cutoff_hour on target_date - 1 day.
        Matches with actual generation delivered.
        """
        target_dt = datetime.strptime(target_date, "%Y-%m-%d")
        decision_dt = target_dt - timedelta(days=1)
        decision_date = decision_dt.strftime("%Y-%m-%d")
        gate_time_str = f"{decision_date}T{cutoff_hour:02d}:00:00Z"

        conn = get_db_connection()
        cursor = conn.cursor()

        # 1. Fetch Actuals for target_date
        cursor.execute("""
            SELECT settlementPeriod, startTime, generation
            FROM actuals
            WHERE settlementDate = ?
            ORDER BY settlementPeriod
        """, (target_date,))
        actual_rows = cursor.fetchall()

        # 2. Fetch Latest Forecasts published before or at gate_time_str
        cursor.execute("""
            SELECT startTime, generation, publishTime
            FROM (
                SELECT startTime, generation, publishTime,
                       ROW_NUMBER() OVER(PARTITION BY startTime ORDER BY publishTime DESC) as rn
                FROM forecasts
                WHERE startTime >= ? AND startTime <= ?
                  AND publishTime <= ?
            )
            WHERE rn = 1
        """, (
            f"{target_date}T00:00:00Z",
            f"{target_date}T23:30:00Z",
            gate_time_str
        ))
        fc_dict = {row["startTime"]: (row["generation"], row["publishTime"]) for row in cursor.fetchall()}
        conn.close()

        # 3. Build Settlement Period records (1 to 48)
        periods: List[SettlementPeriodData] = []
        metric_pairs: List[Dict[str, Any]] = []

        act_map = {r["settlementPeriod"]: (r["startTime"], r["generation"]) for r in actual_rows}

        for p in range(1, 49):
            start_iso, act_val = act_map.get(p, (None, None))
            if not start_iso:
                # Derive start_iso if missing
                sm = (p - 1) * 30
                sh, smin = divmod(sm, 60)
                start_iso = f"{target_date}T{sh:02d}:{smin:02d}:00Z"

            # Match forecast: exact or hourly parent
            fc_val, pub_time = fc_dict.get(start_iso, (None, None))
            if fc_val is None:
                # Derive hourly key
                dt = datetime.strptime(start_iso, "%Y-%m-%dT%H:%M:%SZ")
                hr_iso = dt.replace(minute=0, second=0).strftime("%Y-%m-%dT%H:%M:%SZ")
                fc_val, pub_time = fc_dict.get(hr_iso, (None, None))

            error_mw = None
            abs_error_mw = None
            pct_error = None
            risk = "BALANCED"

            if act_val is not None and fc_val is not None:
                error_mw = round(fc_val - act_val, 2)
                abs_error_mw = round(abs(error_mw), 2)
                denom = max(act_val, 10.0)
                pct_error = round((abs_error_mw / denom) * 100.0, 2)
                if error_mw > 200.0:
                    risk = "DEFICIT_RISK" # Over-forecasted wind: shortage in system
                elif error_mw < -200.0:
                    risk = "SURPLUS_RISK" # Under-forecasted wind: unexpected surplus

                metric_pairs.append({"actual": act_val, "forecast": fc_val})

            periods.append(SettlementPeriodData(
                settlementPeriod=p,
                startTime=start_iso,
                targetTime=format_period_label(p),
                actualMW=round(act_val, 2) if act_val is not None else None,
                forecastMW=round(fc_val, 2) if fc_val is not None else None,
                forecastPublishTime=pub_time,
                errorMW=error_mw,
                absErrorMW=abs_error_mw,
                percentageError=pct_error,
                residualProcurementRisk=risk
            ))

        metrics = calculate_accuracy_metrics(metric_pairs)

        return DayAheadForecastResponse(
            targetDate=target_date,
            decisionDate=decision_date,
            decisionGateTime=gate_time_str,
            gateClosureCutoffHour=cutoff_hour,
            periods=periods,
            metrics=metrics
        )

    def get_month_overview(
        self,
        month: str = "2026-01",
        cutoff_hour: int = 11
    ) -> MonthOverviewResponse:
        """
        Calculates daily summary metrics, overall monthly KPI, and
        the 48 settlement period average error profile for the month.
        """
        year, m = map(int, month.split("-"))
        # Number of days in month
        num_days = 31 if m in [1, 3, 5, 7, 8, 10, 12] else (30 if m in [4, 6, 9, 11] else 28)

        daily_metrics: List[DailyMetricItem] = []
        all_pairs: List[Dict[str, Any]] = []
        period_stats: Dict[int, List[Dict[str, float]]] = {p: [] for p in range(1, 49)}

        for d in range(1, num_days + 1):
            date_str = f"{year:04d}-{m:02d}-{d:02d}"
            try:
                day_res = self.get_day_ahead_forecast(date_str, cutoff_hour=cutoff_hour)
                if day_res.metrics.validPeriodsCount > 0:
                    daily_metrics.append(DailyMetricItem(
                        date=date_str,
                        mae=day_res.metrics.mae,
                        rmse=day_res.metrics.rmse,
                        bias=day_res.metrics.bias,
                        mape=day_res.metrics.mape,
                        totalActualMWh=day_res.metrics.totalActualMWh,
                        totalForecastMWh=day_res.metrics.totalForecastMWh
                    ))
                    for p in day_res.periods:
                        if p.actualMW is not None and p.forecastMW is not None:
                            all_pairs.append({"actual": p.actualMW, "forecast": p.forecastMW})
                            period_stats[p.settlementPeriod].append({
                                "actual": p.actualMW,
                                "forecast": p.forecastMW,
                                "error": p.errorMW,
                                "abs_error": p.absErrorMW
                            })
            except Exception as e:
                continue

        overall_metrics = calculate_accuracy_metrics(all_pairs)

        # Build hourly profile
        hourly_profile: List[HourlyProfileItem] = []
        for p in range(1, 49):
            items = period_stats[p]
            if items:
                acts = [x["actual"] for x in items]
                fcs = [x["forecast"] for x in items]
                errs = [x["error"] for x in items]
                abs_errs = [x["abs_error"] for x in items]

                hourly_profile.append(HourlyProfileItem(
                    settlementPeriod=p,
                    timeLabel=format_period_label(p),
                    avgActualMW=round(float(np.mean(acts)), 2),
                    avgForecastMW=round(float(np.mean(fcs)), 2),
                    avgErrorMW=round(float(np.mean(errs)), 2),
                    avgAbsErrorMW=round(float(np.mean(abs_errs)), 2),
                    p10ErrorMW=round(float(np.percentile(errs, 10)), 2),
                    p90ErrorMW=round(float(np.percentile(errs, 90)), 2)
                ))
            else:
                hourly_profile.append(HourlyProfileItem(
                    settlementPeriod=p,
                    timeLabel=format_period_label(p),
                    avgActualMW=0.0,
                    avgForecastMW=0.0,
                    avgErrorMW=0.0,
                    avgAbsErrorMW=0.0,
                    p10ErrorMW=0.0,
                    p90ErrorMW=0.0
                ))

        return MonthOverviewResponse(
            month=month,
            totalRecords=len(all_pairs),
            overallMetrics=overall_metrics,
            dailyMetrics=daily_metrics,
            hourlyProfile=hourly_profile
        )

    def get_status(self) -> DataSyncResponse:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*), MIN(startTime), MAX(startTime) FROM actuals")
        act_row = cursor.fetchone()
        cursor.execute("SELECT COUNT(*), MIN(publishTime), MAX(publishTime) FROM forecasts")
        fc_row = cursor.fetchone()
        conn.close()

        act_count = act_row[0] if act_row else 0
        fc_count = fc_row[0] if fc_row else 0
        earliest = act_row[1] if act_row else None
        latest = act_row[2] if act_row else None

        return DataSyncResponse(
            status="READY" if (act_count > 0 and fc_count > 0) else "EMPTY",
            message=f"Database active with {act_count} actuals and {fc_count} forecasts.",
            actualsCount=act_count,
            forecastsCount=fc_count,
            earliestStartTime=earliest,
            latestStartTime=latest
        )

data_manager = DataManager()
