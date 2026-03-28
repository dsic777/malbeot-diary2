from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
import uuid


# ── 페르소나 생성 요청 ─────────────────────────────
class PersonaCreate(BaseModel):
    name: str = Field(..., max_length=50)
    preset_type: Optional[str] = Field(None, max_length=20)   # empathy | advice | custom
    custom_description: Optional[str] = None
    image_url: Optional[str] = Field(None, max_length=500)


# ── 페르소나 수정 요청 ─────────────────────────────
class PersonaUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=50)
    preset_type: Optional[str] = Field(None, max_length=20)
    custom_description: Optional[str] = None
    image_url: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None


# ── 페르소나 응답 ──────────────────────────────────
class PersonaResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    preset_type: Optional[str] = None
    custom_description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
