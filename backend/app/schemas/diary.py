from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, List
import uuid


# ── 일기 작성 요청 ─────────────────────────────────
class DiaryCreate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    emotion: Optional[str] = Field(None, max_length=100)   # 기쁨/슬픔/화남/평온 등
    weather: Optional[str] = Field(None, max_length=100)   # 맑음/흐림/비/눈 등
    content: str                                            # 일기 본문 (필수)
    diary_date: date                                        # 일기 날짜
    input_type: str = "text"                                # text | voice | mixed
    persona_id: Optional[uuid.UUID] = None                  # AI 페르소나 선택 (선택)


# ── 일기 수정 요청 ─────────────────────────────────
class DiaryUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    emotion: Optional[str] = Field(None, max_length=100)
    weather: Optional[str] = Field(None, max_length=100)
    content: Optional[str] = None
    diary_date: Optional[date] = None
    persona_id: Optional[uuid.UUID] = None


# ── 일기 응답 ──────────────────────────────────────
class DiaryResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    persona_id: Optional[uuid.UUID] = None
    title: Optional[str] = None
    emotion: Optional[str] = None
    weather: Optional[str] = None
    content: str
    input_type: str
    ai_feedback: Optional[str] = None      # AI 피드백 (있을 경우)
    diary_date: date
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── 일기 목록 응답 (요약) ──────────────────────────
class DiaryListResponse(BaseModel):
    id: uuid.UUID
    title: Optional[str] = None
    emotion: Optional[str] = None
    weather: Optional[str] = None
    diary_date: date
    input_type: str
    created_at: datetime

    class Config:
        from_attributes = True
