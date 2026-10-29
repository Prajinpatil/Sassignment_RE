import os
from fastapi import FastAPI  # pyright: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware  # pyright: ignore[reportMissingImports]
from app.config import settings
from app.routers import forecast, metrics, data_sync
from app.services.data_manager import data_manager

app = FastAPI(
    title="UK Day-Ahead Renewable Wind Forecast Portal",
    description="Wholesale Electricity Day-Ahead Wind Forecasting & Quantified Accuracy Evaluation Platform for UK Utilities",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(forecast.router)
app.include_router(metrics.router)
app.include_router(data_sync.router)

@app.get("/")
def root():
    return {
        "name": "UK Day-Ahead Renewable Wind Forecast Portal API",
        "status": "online",
        "docs": "/docs",
        "data_status": data_manager.get_status().model_dump()
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "environment": settings.ENVIRONMENT}

if __name__ == "__main__":
    import uvicorn  # pyright: ignore[reportMissingImports]
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
