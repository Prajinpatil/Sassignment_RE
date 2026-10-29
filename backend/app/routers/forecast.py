import io
import csv
from fastapi import APIRouter, Query, HTTPException, Response
from app.services.data_manager import data_manager
from app.models.schemas import DayAheadForecastResponse

router = APIRouter(prefix="/api/forecast", tags=["Forecast"])

@router.get("/day-ahead", response_model=DayAheadForecastResponse)
def get_day_ahead(
    date: str = Query("2026-01-15", description="Target delivery date in YYYY-MM-DD format"),
    cutoffHour: int = Query(11, ge=0, le=23, description="Decision gate closure hour on Day D-1 (GMT, default 11)")
):
    try:
        return data_manager.get_day_ahead_forecast(target_date=date, cutoff_hour=cutoffHour)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error computing day-ahead forecast: {str(e)}")

@router.get("/export-csv")
def export_forecast_csv(
    date: str = Query("2026-01-15", description="Target delivery date in YYYY-MM-DD format"),
    cutoffHour: int = Query(11, ge=0, le=23, description="Decision gate closure hour on Day D-1 (GMT)")
):
    try:
        res = data_manager.get_day_ahead_forecast(target_date=date, cutoff_hour=cutoffHour)
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Target Date", "Settlement Period", "Time Window", "Start Time UTC",
            "Actual Wind (MW)", "Day-Ahead Forecast (MW)", "Forecast Publish Time UTC",
            "Forecast Error (MW)", "Abs Error (MW)", "Error Pct (%)", "Procurement Risk"
        ])
        for p in res.periods:
            writer.writerow([
                res.targetDate,
                p.settlementPeriod,
                p.targetTime,
                p.startTime,
                p.actualMW if p.actualMW is not None else "",
                p.forecastMW if p.forecastMW is not None else "",
                p.forecastPublishTime or "",
                p.errorMW if p.errorMW is not None else "",
                p.absErrorMW if p.absErrorMW is not None else "",
                p.percentageError if p.percentageError is not None else "",
                p.residualProcurementRisk
            ])
        
        csv_data = output.getvalue()
        return Response(
            content=csv_data,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=wind_forecast_{date}_gate_{cutoffHour}h.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting CSV: {str(e)}")
