from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.forecast import router as forecast_router

app = FastAPI(title="ARIMA Forecasting API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forecast_router)


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
