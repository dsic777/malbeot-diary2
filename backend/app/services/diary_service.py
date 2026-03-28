from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from fastapi import HTTPException, status
import uuid

from app.models.diary import Diary
from app.schemas.diary import DiaryCreate, DiaryUpdate


class DiaryService:

    # ── 일기 생성 ───────────────────────────────────
    async def create_diary(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        data: DiaryCreate,
    ) -> Diary:
        diary = Diary(
            user_id=user_id,
            persona_id=data.persona_id,
            title=data.title,
            emotion=data.emotion,
            weather=data.weather,
            content=data.content,
            input_type=data.input_type,
            diary_date=data.diary_date,
        )
        db.add(diary)
        await db.commit()
        await db.refresh(diary)
        return diary

    # ── 목록 조회 (날짜 최신순) ─────────────────────
    async def get_diaries(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> List[Diary]:
        stmt = (
            select(Diary)
            .where(Diary.user_id == user_id)
            .order_by(desc(Diary.diary_date))
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    # ── 단건 조회 ───────────────────────────────────
    async def get_diary(
        self,
        db: AsyncSession,
        diary_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> Diary:
        stmt = select(Diary).where(
            Diary.id == diary_id,
            Diary.user_id == user_id,
        )
        result = await db.execute(stmt)
        diary = result.scalar_one_or_none()
        if not diary:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="일기를 찾을 수 없습니다.",
            )
        return diary

    # ── 수정 ────────────────────────────────────────
    async def update_diary(
        self,
        db: AsyncSession,
        diary: Diary,
        data: DiaryUpdate,
    ) -> Diary:
        if data.title is not None:
            diary.title = data.title
        if data.emotion is not None:
            diary.emotion = data.emotion
        if data.weather is not None:
            diary.weather = data.weather
        if data.content is not None:
            diary.content = data.content
        if data.diary_date is not None:
            diary.diary_date = data.diary_date
        if data.persona_id is not None:
            diary.persona_id = data.persona_id

        diary.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(diary)
        return diary

    # ── 삭제 ────────────────────────────────────────
    async def delete_diary(self, db: AsyncSession, diary: Diary) -> None:
        await db.delete(diary)
        await db.commit()
