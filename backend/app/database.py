from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.config import get_settings

settings = get_settings()

# DB 엔진 생성 (개발 환경에서는 SQL 로그 출력)
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.APP_ENV == "development",
)

# 세션 팩토리
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """모든 모델이 상속받는 기본 클래스"""
    pass


async def get_db() -> AsyncSession:
    """API 라우터에서 DB 세션을 주입받을 때 사용 (Depends)"""
    async with AsyncSessionLocal() as session:
        yield session
