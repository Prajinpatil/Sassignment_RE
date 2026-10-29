from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.services.data_manager import data_manager
from app.models.schemas import DataSyncResponse

router = APIRouter(prefix="/api/data", tags=["Data"])

@router.get("/status", response_model=DataSyncResponse)
def get_data_status():
    try:
        return data_manager.get_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking status: {str(e)}")
