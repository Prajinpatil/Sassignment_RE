from fastapi import APIRouter, Query, HTTPException
from app.services.data_manager import data_manager
from app.models.schemas import MonthOverviewResponse

router = APIRouter(prefix="/api/metrics", tags=["Metrics"])

@router.get("/month-overview", response_model=MonthOverviewResponse)
def get_month_overview(
    month: str = Query("2026-01", description="Month in YYYY-MM format"),
    cutoffHour: int = Query(11, ge=0, le=23, description="Decision gate closure hour on Day D-1 (GMT)")
):
    try:
        return data_manager.get_month_overview(month=month, cutoff_hour=cutoffHour)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error computing month overview: {str(e)}")
