import os
import json
import httpx
from typing import List, Dict, Any, Optional
from app.config import settings

BASE_URL = "https://data.elexon.co.uk/bmrs/api/v1"

class ElexonClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.ELEXON_API_KEY
        self.headers = {
            "User-Agent": "UK-DayAhead-Wind-Portal/1.0",
            "Accept": "application/json"
        }
        if self.api_key:
            self.headers["x-api-key"] = self.api_key

    async def fetch_actuals_stream(
        self,
        settlement_date_from: str,
        settlement_date_to: str,
        fuel_type: str = "WIND"
    ) -> List[Dict[str, Any]]:
        """Fetch actual half-hourly generation from FUELHH stream endpoint."""
        url = f"{BASE_URL}/datasets/FUELHH/stream"
        params = {
            "settlementDateFrom": settlement_date_from,
            "settlementDateTo": settlement_date_to,
            "fuelType": fuel_type
        }
        if self.api_key:
            params["key"] = self.api_key

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(url, params=params, headers=self.headers)
            resp.raise_for_status()
            return resp.json()

    async def fetch_forecasts_stream(
        self,
        publish_datetime_from: str,
        publish_datetime_to: str
    ) -> List[Dict[str, Any]]:
        """Fetch forecasted generation from WINDFOR stream endpoint."""
        url = f"{BASE_URL}/datasets/WINDFOR/stream"
        params = {
            "publishDateTimeFrom": publish_datetime_from,
            "publishDateTimeTo": publish_datetime_to
        }
        if self.api_key:
            params["key"] = self.api_key

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(url, params=params, headers=self.headers)
            resp.raise_for_status()
            return resp.json()

elexon_client = ElexonClient()
