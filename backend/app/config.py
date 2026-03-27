from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # 앱 기본
    APP_ENV: str = "development"
    SECRET_KEY: str = "change-me-before-deploy"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # 데이터베이스
    DATABASE_URL: str = "sqlite+aiosqlite:///./malbeot2.db"  # 개발용 SQLite

    # Redis (로컬 개발 시 False, EC2 배포 시 True)
    USE_REDIS: bool = False
    REDIS_URL: str = "redis://localhost:6379/0"

    # Anthropic (Claude API)
    ANTHROPIC_API_KEY: str = ""

    # Azure 음성 (STT/TTS)
    AZURE_SPEECH_KEY: str = ""
    AZURE_SPEECH_REGION: str = "koreacentral"

    # 알림 스케줄러
    ALARM_CHECK_INTERVAL_SECONDS: int = 30

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
