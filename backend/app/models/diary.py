import uuid
from datetime import datetime, date
from typing import Optional
from sqlalchemy import String, Text, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Diary(Base):
    __tablename__ = "diaries"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    persona_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("personas.id"), nullable=True)
    title: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    emotion: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    weather: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    input_type: Mapped[str] = mapped_column(String(10), nullable=False, default="text")  # text | voice | mixed
    audio_file_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    ai_feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    diary_date: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # 관계 정의
    user = relationship("User", back_populates="diaries")
    persona = relationship("Persona", back_populates="diaries")
