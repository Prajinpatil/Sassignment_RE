from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SettlementPeriodData(BaseModel):
    settlementPeriod: int
    startTime: str
    targetTime: str
    actualMW: Optional[float] = None
    forecastMW: Optional[float] = None
    forecastPublishTime: Optional[str] = None
    errorMW: Optional[float] = None          # Forecast - Actual (Positive = Over-forecast, Negative = Under-forecast)
    absErrorMW: Optional[float] = None       # |Forecast - Actual|
    percentageError: Optional[float] = None  # |Error / Actual| * 100
    residualProcurementRisk: str = "BALANCED" # "DEFICIT_RISK", "SURPLUS_RISK", "BALANCED"

class AccuracyMetrics(BaseModel):
    mae: float = Field(description="Mean Absolute Error in MW")
    rmse: float = Field(description="Root Mean Square Error in MW")
    mape: float = Field(description="Mean Absolute Percentage Error (%)")
    nmae: float = Field(description="Normalized MAE relative to peak generation (%)")
    bias: float = Field(description="Mean Error / Bias in MW (Positive = Over-forecast)")
    maxOverForecastMW: float = Field(description="Maximum single-period over-forecast (MW)")
    maxUnderForecastMW: float = Field(description="Maximum single-period under-forecast (MW)")
    p10ErrorMW: float = Field(description="10th percentile error in MW")
    p50ErrorMW: float = Field(description="50th percentile (median) error in MW")
    p90ErrorMW: float = Field(description="90th percentile error in MW")
    totalActualMWh: float = Field(description="Total actual energy delivered (MWh)")
    totalForecastMWh: float = Field(description="Total forecast energy anticipated (MWh)")
    validPeriodsCount: int = Field(description="Number of periods with both actual and forecast")

class DayAheadForecastResponse(BaseModel):
    targetDate: str
    decisionDate: str
    decisionGateTime: str
    gateClosureCutoffHour: int
    periods: List[SettlementPeriodData]
    metrics: AccuracyMetrics

class DailyMetricItem(BaseModel):
    date: str
    mae: float
    rmse: float
    bias: float
    mape: float
    totalActualMWh: float
    totalForecastMWh: float

class HourlyProfileItem(BaseModel):
    settlementPeriod: int
    timeLabel: str
    avgActualMW: float
    avgForecastMW: float
    avgErrorMW: float
    avgAbsErrorMW: float
    p10ErrorMW: float
    p90ErrorMW: float

class MonthOverviewResponse(BaseModel):
    month: str
    totalRecords: int
    overallMetrics: AccuracyMetrics
    dailyMetrics: List[DailyMetricItem]
    hourlyProfile: List[HourlyProfileItem]

class DataSyncResponse(BaseModel):
    status: str
    message: str
    actualsCount: int
    forecastsCount: int
    earliestStartTime: Optional[str]
    latestStartTime: Optional[str]
