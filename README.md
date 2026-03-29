# 🌿 말벗이 내 손 안에

> "언제든 말을 걸 수 있는 내 손 안의 절친"
> React 모바일 앱 + FastAPI 백엔드

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React (Vite) + Tailwind CSS |
| 백엔드 | FastAPI + SQLAlchemy 2.0 |
| 데이터베이스 | SQLite (개발) / PostgreSQL (운영) |
| 인증 | JWT |
| AI | Claude Haiku (Anthropic) |
| STT/TTS | Web Speech API (브라우저 내장, 무료) |
| 배포 | Docker + Nginx |

---

## 주요 기능

- 일기 작성 (텍스트 + 음성 입력)
- AI 말벗 피드백 (Claude Haiku)
- TTS 읽어주기 (ON/OFF 토글)
- 페르소나 설정 (공감형 / 조언형 / 직접설정)
- 다크 테마 모바일 UI

---

## 로컬 개발 환경 실행

```bash
# 백엔드
cd backend
python -m venv myEnv
source myEnv/bin/activate  # Windows: myEnv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# 프론트엔드 (별도 터미널)
cd frontend
npm install
npm run dev
```

백엔드: http://127.0.0.1:8000
프론트엔드: http://localhost:5173
API 문서: http://127.0.0.1:8000/docs

---

## 서버 배포 (Docker)

```bash
# 1. 코드 받기
git clone https://github.com/dsic777/malbeot-diary2.git
cd malbeot-diary2

# 2. 환경변수 설정
cp .env.example .env
vi .env  # ANTHROPIC_API_KEY 등 입력

# 3. 포트 변경 (80이 이미 사용 중인 경우)
sed -i 's/"80:80"/"8080:80"/' docker-compose.yml

# 4. 빌드 및 실행
docker compose up -d --build

# 5. 확인
docker ps
```

접속: `http://서버IP:8080`

---

## ⚠️ 음성 기능 (STT/TTS) 사용 시 주의

브라우저 보안 정책상 **마이크 권한은 HTTPS 환경에서만 허용**됩니다.

- `http://` 접속 → 음성 입력/읽어주기 **사용 불가**
- `https://` 접속 → 음성 입력/읽어주기 **정상 동작**

HTTPS 적용을 위해서는 **도메인**이 필요합니다.
무료 도메인: [DuckDNS](https://www.duckdns.org) + Let's Encrypt SSL 조합 권장.
자세한 설정 방법은 `말벗이내손안에.md` 참고.

---

## 저장소

- 모바일 버전: https://github.com/dsic777/malbeot-diary2
- 팀 원본 (참조용): https://github.com/solrimna/malbeot-diary
