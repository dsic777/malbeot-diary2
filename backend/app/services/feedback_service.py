import anthropic
from app.config import get_settings

settings = get_settings()


class FeedbackService:

    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    # ── Claude에게 공감 피드백 요청 ──────────────────
    async def generate_feedback(
        self,
        content: str,
        emotion: str | None = None,
        persona_name: str | None = None,
        persona_description: str | None = None,
    ) -> str:
        # 페르소나 설정
        persona_context = ""
        if persona_name and persona_description:
            persona_context = f"당신은 '{persona_name}'입니다. {persona_description}\n\n"
        elif persona_name:
            persona_context = f"당신은 '{persona_name}'입니다.\n\n"

        # 감정 컨텍스트
        emotion_context = f"오늘 감정: {emotion}\n" if emotion else ""

        prompt = f"""{persona_context}사용자가 오늘 일기를 썼습니다. 따뜻하고 진심 어린 공감의 말을 3~4문장으로 전해주세요.
판단하거나 조언하지 말고, 감정을 먼저 알아봐 주는 말로 답해주세요.
반드시 순수한 텍스트로만 답하세요. #, **, *, - 같은 마크다운 기호는 절대 사용하지 마세요.

{emotion_context}일기 내용:
{content}

공감 피드백:"""

        message = self.client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}],
        )

        text = message.content[0].text.strip()
        # 혹시 남은 마크다운 기호 제거
        import re
        text = re.sub(r'^#+\s*', '', text, flags=re.MULTILINE)
        text = re.sub(r'\*+', '', text)
        text = re.sub(r'^-\s+', '', text, flags=re.MULTILINE)
        return text.strip()
