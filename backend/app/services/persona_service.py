from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
import uuid

from app.models.persona import Persona
from app.schemas.persona import PersonaCreate, PersonaUpdate


class PersonaService:

    # ── 페르소나 생성 ────────────────────────────────
    async def create_persona(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        data: PersonaCreate,
    ) -> Persona:
        persona = Persona(
            user_id=user_id,
            name=data.name,
            preset_type=data.preset_type,
            custom_description=data.custom_description,
            image_url=data.image_url,
        )
        db.add(persona)
        await db.commit()
        await db.refresh(persona)
        return persona

    # ── 목록 조회 ────────────────────────────────────
    async def get_personas(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> List[Persona]:
        stmt = (
            select(Persona)
            .where(Persona.user_id == user_id)
            .order_by(Persona.created_at)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    # ── 단건 조회 ────────────────────────────────────
    async def get_persona(
        self,
        db: AsyncSession,
        persona_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> Persona:
        stmt = select(Persona).where(
            Persona.id == persona_id,
            Persona.user_id == user_id,
        )
        result = await db.execute(stmt)
        persona = result.scalar_one_or_none()
        if not persona:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="페르소나를 찾을 수 없습니다.",
            )
        return persona

    # ── 수정 ─────────────────────────────────────────
    async def update_persona(
        self,
        db: AsyncSession,
        persona: Persona,
        data: PersonaUpdate,
    ) -> Persona:
        if data.name is not None:
            persona.name = data.name
        if data.preset_type is not None:
            persona.preset_type = data.preset_type
        if data.custom_description is not None:
            persona.custom_description = data.custom_description
        if data.image_url is not None:
            persona.image_url = data.image_url
        if data.is_active is not None:
            persona.is_active = data.is_active

        await db.commit()
        await db.refresh(persona)
        return persona

    # ── 삭제 ─────────────────────────────────────────
    async def delete_persona(self, db: AsyncSession, persona: Persona) -> None:
        await db.delete(persona)
        await db.commit()
