from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from app.database import get_db
from app.schemas.persona import PersonaCreate, PersonaUpdate, PersonaResponse
from app.services.persona_service import PersonaService
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()
persona_svc = PersonaService()


# ── GET /personas ─ 목록 조회 ──────────────────────
@router.get("/", response_model=List[PersonaResponse])
async def list_personas(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await persona_svc.get_personas(db, current_user.id)


# ── POST /personas ─ 페르소나 생성 ─────────────────
@router.post("/", response_model=PersonaResponse, status_code=status.HTTP_201_CREATED)
async def create_persona(
    body: PersonaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await persona_svc.create_persona(db, current_user.id, body)


# ── GET /personas/{persona_id} ─ 단건 조회 ─────────
@router.get("/{persona_id}", response_model=PersonaResponse)
async def get_persona(
    persona_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await persona_svc.get_persona(db, persona_id, current_user.id)


# ── PATCH /personas/{persona_id} ─ 수정 ────────────
@router.patch("/{persona_id}", response_model=PersonaResponse)
async def update_persona(
    persona_id: uuid.UUID,
    body: PersonaUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    persona = await persona_svc.get_persona(db, persona_id, current_user.id)
    return await persona_svc.update_persona(db, persona, body)


# ── DELETE /personas/{persona_id} ─ 삭제 ───────────
@router.delete("/{persona_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_persona(
    persona_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    persona = await persona_svc.get_persona(db, persona_id, current_user.id)
    await persona_svc.delete_persona(db, persona)
