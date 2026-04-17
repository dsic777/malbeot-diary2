from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
import uuid


# ── 회원가입 요청 ──────────────────────────────────
class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)   # 로그인 아이디
    password: str = Field(min_length=4)                   # 비밀번호 (4자 이상)
    nickname: str = Field(min_length=1, max_length=50)   # 화면 표시 이름


# ── 로그인 요청 ────────────────────────────────────
class UserLogin(BaseModel):
    username: str
    password: str


# ── 사용자 응답 (비밀번호 제외) ────────────────────
class UserResponse(BaseModel):
    id: uuid.UUID
    username: str
    nickname: str
    profile_image_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True   # SQLAlchemy 모델 → Pydantic 자동 변환


# ── 로그인 성공 응답 ───────────────────────────────
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
