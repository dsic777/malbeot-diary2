from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from app.database import get_db
from app.schemas.diary import DiaryCreate, DiaryUpdate, DiaryResponse, DiaryListResponse
from app.services.diary_service import DiaryService
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()
diary_svc = DiaryService()


# ── GET /diaries ─ 목록 조회 (최신순) ──────────────
@router.get("/", response_model=List[DiaryListResponse])
async def list_diaries(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await diary_svc.get_diaries(db, current_user.id)


# ── POST /diaries ─ 일기 작성 ──────────────────────
@router.post("/", response_model=DiaryResponse, status_code=status.HTTP_201_CREATED)
async def create_diary(
    body: DiaryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await diary_svc.create_diary(db, current_user.id, body)


# ── GET /diaries/search ─ 검색 (반드시 /{diary_id} 앞에 위치) ──
@router.get("/search", response_model=List[DiaryListResponse])
async def search_diaries(
    q: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await diary_svc.search_diaries(db, current_user.id, q)


# ── GET /diaries/{diary_id} ─ 단건 조회 ────────────
@router.get("/{diary_id}", response_model=DiaryResponse)
async def get_diary(
    diary_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await diary_svc.get_diary(db, diary_id, current_user.id)


# ── PATCH /diaries/{diary_id} ─ 수정 ───────────────
@router.patch("/{diary_id}", response_model=DiaryResponse)
async def update_diary(
    diary_id: uuid.UUID,
    body: DiaryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    diary = await diary_svc.get_diary(db, diary_id, current_user.id)
    return await diary_svc.update_diary(db, diary, body)


# ── DELETE /diaries/{diary_id} ─ 삭제 ──────────────
@router.delete("/{diary_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_diary(
    diary_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    diary = await diary_svc.get_diary(db, diary_id, current_user.id)
    await diary_svc.delete_diary(db, diary)
