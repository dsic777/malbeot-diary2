from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
import uuid

from app.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.diary_service import DiaryService
from app.services.persona_service import PersonaService
from app.services.feedback_service import FeedbackService

router = APIRouter()
diary_svc = DiaryService()
persona_svc = PersonaService()
feedback_svc = FeedbackService()


class FeedbackResponse(BaseModel):
    diary_id: uuid.UUID
    ai_feedback: str


# ── POST /feedback/{diary_id} ─ 일기에 AI 피드백 생성 ──
@router.post("/{diary_id}", response_model=FeedbackResponse)
async def create_feedback(
    diary_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 일기 조회 (소유권 확인 포함)
    diary = await diary_svc.get_diary(db, diary_id, current_user.id)

    # 이미 피드백이 있으면 재생성하지 않음
    if diary.ai_feedback:
        return FeedbackResponse(diary_id=diary.id, ai_feedback=diary.ai_feedback)

    # 페르소나 정보 조회 (선택된 경우)
    persona_name = None
    persona_description = None
    if diary.persona_id:
        try:
            persona = await persona_svc.get_persona(db, diary.persona_id, current_user.id)
            persona_name = persona.name
            persona_description = persona.custom_description
        except HTTPException:
            pass  # 페르소나 없어도 피드백은 진행

    # Claude API 호출
    feedback_text = await feedback_svc.generate_feedback(
        content=diary.content,
        emotion=diary.emotion,
        persona_name=persona_name,
        persona_description=persona_description,
    )

    # 피드백을 일기에 저장
    diary.ai_feedback = feedback_text
    await db.commit()
    await db.refresh(diary)

    return FeedbackResponse(diary_id=diary.id, ai_feedback=feedback_text)


# ── DELETE /feedback/{diary_id} ─ 피드백 초기화 후 재생성 ──
@router.delete("/{diary_id}", response_model=FeedbackResponse)
async def regenerate_feedback(
    diary_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    diary = await diary_svc.get_diary(db, diary_id, current_user.id)

    # 피드백 초기화 후 재생성
    diary.ai_feedback = None
    await db.commit()

    persona_name = None
    persona_description = None
    if diary.persona_id:
        try:
            persona = await persona_svc.get_persona(db, diary.persona_id, current_user.id)
            persona_name = persona.name
            persona_description = persona.custom_description
        except HTTPException:
            pass

    feedback_text = await feedback_svc.generate_feedback(
        content=diary.content,
        emotion=diary.emotion,
        persona_name=persona_name,
        persona_description=persona_description,
    )

    diary.ai_feedback = feedback_text
    await db.commit()
    await db.refresh(diary)

    return FeedbackResponse(diary_id=diary.id, ai_feedback=feedback_text)
