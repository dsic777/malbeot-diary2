import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import engine, Base
from app.api.v1.router import api_router
import app.models  # 모델 등록 — DB 테이블 자동 생성을 위해 필요

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s"
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 서버 시작 시 — DB 테이블 자동 생성
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("DB 테이블 준비 완료")
    yield
    # 서버 종료 시
    logger.info("서버 종료")


app = FastAPI(
    title="말벗이 내 손 안에",
    description="음성 + AI 공감 피드백 모바일 일기 서비스",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS 설정 (React 개발서버 + 모바일 접속 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "말벗이 내 손 안에"}
