from fastapi import APIRouter
from app.api.v1 import auth

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["인증"])

# 아래 라우터는 기능 완성 후 순서대로 추가 예정
# from app.api.v1 import diary
# api_router.include_router(diary.router, prefix="/diaries", tags=["일기"])

# from app.api.v1 import persona
# api_router.include_router(persona.router, prefix="/personas", tags=["페르소나"])

# from app.api.v1 import feedback
# api_router.include_router(feedback.router, prefix="/feedback", tags=["AI피드백"])

# from app.api.v1 import voice
# api_router.include_router(voice.router, prefix="/voice", tags=["음성"])

# from app.api.v1 import alarm
# api_router.include_router(alarm.router, prefix="/alarms", tags=["알림"])
