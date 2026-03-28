from datetime import datetime, timezone
from typing import Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password, verify_password, create_access_token


class AuthService:

    # ── 회원가입 ───────────────────────────────────
    async def register(self, db: AsyncSession, data: UserCreate) -> User:
        # 아이디 중복 확인
        result = await db.execute(select(User).where(User.username == data.username))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="이미 사용 중인 아이디입니다.",
            )

        user = User(
            username=data.username,
            password_hash=hash_password(data.password),
            nickname=data.nickname,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    # ── 로그인 ─────────────────────────────────────
    async def login(self, db: AsyncSession, username: str, password: str) -> Tuple[User, str]:
        result = await db.execute(select(User).where(User.username == username))
        user = result.scalar_one_or_none()

        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="아이디 또는 비밀번호가 올바르지 않습니다.",
            )

        # 마지막 로그인 시각 갱신
        user.last_login_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(user)

        token = create_access_token(str(user.id))
        return user, token
