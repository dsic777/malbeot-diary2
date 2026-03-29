# 말벗이 내 손 안에 — API 흐름도 (Flow)

> 작성일: 2026-03-28 ~ 2026-03-30 | 작성: 유동주 + Claude AI
> 각 기능별 요청~응답 전체 흐름 정리

---

## 전체 구조 개념도

```
[React 앱 (모바일, 포트 5173/80)]
        ↕  HTTP 요청/응답 (JSON)  /api/v1/...
[FastAPI 백엔드 (포트 8000)]
    ├── api/v1/       ← 엔드포인트 (창구)
    ├── services/     ← 비즈니스 로직 (처리)
    ├── models/       ← DB 테이블 구조
    └── schemas/      ← 요청/응답 데이터 형식
        ↕
[SQLite DB (개발) / PostgreSQL (운영)]
        ↕
[Claude API (Anthropic)] ← AI 피드백 생성
```

---

## 1. 인증 (Auth)

### 1-1. 회원가입

```
[React] 아이디 / 비밀번호 / 닉네임 입력 후 가입 버튼
    ↓ POST /api/v1/auth/register
[auth.py] 요청 데이터 수신 (UserCreate 스키마로 검증)
    ↓
[AuthService.register()]
    ├── users 테이블에서 아이디 중복 확인
    │       중복이면 → 409 Conflict 오류 반환
    ├── 비밀번호 bcrypt 암호화 (hash_password)
    ├── User 객체 생성 → DB 저장 (INSERT)
    └── 저장된 User 반환
    ↓
[auth.py] UserResponse 형식으로 응답
    ↓
[React] 가입 완료 → 로그인 화면으로 이동
```

### 1-2. 로그인

```
[React] 아이디 / 비밀번호 입력 후 로그인 버튼
    ↓ POST /api/v1/auth/login
[AuthService.login()]
    ├── users 테이블에서 아이디 조회 (없으면 401)
    ├── 비밀번호 bcrypt 검증 (불일치 → 401)
    └── JWT 토큰 생성 (create_access_token)
    ↓
[React] access_token → localStorage 저장 → 메인 화면 이동
```

### 1-3. 인증이 필요한 API 공통 흐름

```
[React] 모든 API 요청 시 Header 자동 포함
    Authorization: Bearer {JWT토큰}   ← api/client.js 에서 자동 처리
    ↓
[FastAPI] get_current_user() 자동 실행 (Depends)
    ├── 토큰 없거나 만료 → 401 Unauthorized
    └── 토큰 정상 → current_user 객체 전달
```

---

## 2. 일기 (Diary)

### 2-1. 일기 작성 (19번 화면)

```
[React] 날짜/제목/감정/날씨/내용/말벗 선택 후 저장
    ↓ POST /api/v1/diaries/
    { title, content, emotion, weather, diary_date, input_type, persona_id }
[DiaryService.create_diary()]
    └── DB INSERT → diary 객체 반환
    ↓
[React] 저장 완료 → 자동으로 AI 피드백 요청
    ↓ POST /api/v1/feedback/{diary_id}
[React] 피드백 수신 → 19번 화면에 인라인 표시 + TTS 자동 읽기
```

### 2-2. 일기 목록 (17번 화면)

```
[React] 메인 화면 진입 시 자동 요청
    ↓ GET /api/v1/diaries/
[DiaryService.get_diaries()]
    └── user_id 필터 + diary_date 최신순 정렬
    ↓
[React] 카드 목록 렌더링 (날짜, 감정이모지, 제목, 날씨)
```

### 2-3. 일기 상세 (18번 화면)

```
[React] 목록 카드 클릭
    ↓ GET /api/v1/diaries/{diary_id}
[React] 상세 화면 렌더링
    → 피드백 있으면: TTS 설정 ON이면 0.5초 후 자동 읽기
    → 피드백 없으면: "말벗에게 물어보기" 버튼 표시
```

### 2-4. 일기 수정

```
[React] 기록 보기(34번) → ✏️ 수정 버튼 클릭
    → navigate('/write', { state: { diary } })  ← 기존 데이터 전달
    ↓
[이야기 남기기 화면] 수정 모드 감지 (location.state.diary 존재)
    → 타이틀: "이야기 수정하기"
    → 폼 미리 채움: 제목·내용·감정·날씨·날짜
    ↓ PATCH /api/v1/diaries/{diary_id}
    { title, content, emotion, weather, diary_date, ... }
[DiaryService.update_diary()]
    └── 변경된 필드만 업데이트 → DB COMMIT
    ↓
[React] 수정 완료 → 기록 보기 화면으로 복귀 (피드백 재생성 없음)
```

### 2-5. 일기 삭제

```
[React] 기록 보기(34번) → 🗑️ 삭제 버튼 → confirm 확인
    ↓ DELETE /api/v1/diaries/{diary_id}
[React] 204 No Content → 목록 화면 이동
```

### 2-6. 일기 검색

```
[React] 목록 화면 검색바 → 키워드 입력 후 Enter / 검색 버튼
    ↓ GET /api/v1/diaries/search?q={keyword}
[DiaryService.search_diaries()]
    └── user_id 필터 + title ILIKE OR content ILIKE + 최신순
    ↓
[React] 검색 결과 카드 목록 표시 + 결과 건수 안내
    → ✕ 버튼 클릭 시 검색 초기화 → 전체 목록 복귀
```

---

## 3. AI 피드백 (Claude Haiku)

### 3-1. 피드백 생성 흐름

```
[React] POST /api/v1/feedback/{diary_id}
    ↓
[feedback.py]
    ├── 일기 조회 (소유권 확인)
    ├── 이미 피드백 있으면 → 기존 피드백 반환
    ├── diary.persona_id 있으면 → 페르소나 이름/설명 조회
    └── feedback_service.generate_feedback() 호출
    ↓
[feedback_service.py]
    ├── 페르소나 설정으로 프롬프트 구성
    │   "당신은 '공감형 말벗'입니다. 따뜻하고 공감적인..."
    ├── Claude API 호출 (claude-haiku-4-5-20251001, max_tokens=300)
    ├── 응답 텍스트 수신
    └── 마크다운 기호 제거 (# → 제거, ** → 제거)
    ↓
[feedback.py] diary.ai_feedback DB 저장
    ↓
[React] { diary_id, ai_feedback } 수신
    → 화면에 텍스트 표시
    → TTS ON이면 자동으로 읽어주기
```

### 3-2. Swagger UI 테스트 방법

브라우저: `http://127.0.0.1:8000/docs`

```
1. POST /api/v1/auth/login → access_token 복사
2. 우상단 Authorize → Bearer {토큰} 입력
3. GET /api/v1/diaries/ → diary id 복사
4. POST /api/v1/feedback/{diary_id} → Claude 피드백 확인
```

---

## 4. TTS 읽어주기

### 4-1. 흐름

```
[useTTS.js 훅] localStorage('tts_enabled') 로드 (기본값: true)
    ↓
[18번 화면 진입 시]
    일기 상세 API 호출 완료
    → ai_feedback 있고 TTS ON → 0.5초 후 speak(ai_feedback)
    → Web Speech Synthesis API 호출 (ko-KR, rate: 0.9)
    → 🔊 아이콘 파란색으로 변경 (읽는 중)
    → 읽기 완료 → 🔊 일반 상태로 복귀

[19번 화면 저장 후]
    일기 저장 + 피드백 자동 생성
    → 피드백 수신 + TTS ON → 자동 읽기 시작

[뒤로가기 (←) 클릭]
    useEffect cleanup → window.speechSynthesis.cancel()
    → 즉시 읽기 중단
```

### 4-2. TTS 토글 동작

```
헤더 UI: [← 뒤로가기]  [🔊/🔇 아이콘]  [파란 토글]

🔊 (파란색) + 토글 ON  → TTS 켜짐, 아이콘 클릭 시 다시 읽기
🔇 (회색)   + 토글 OFF → TTS 꺼짐, 자동 읽기 없음

토글 클릭 시:
    → localStorage 업데이트
    → 18번/19번 두 화면 자동 연동 (같은 localStorage 키 사용)
```

---

## 5. 음성 입력 (STT)

```
[19번 화면] 🎤 말로 쓰기 버튼 클릭
    ↓
[Web Speech Recognition API 시작]
    recognition.lang = 'ko-KR'
    recognition.continuous = true
    recognition.interimResults = true
    ↓
사용자 말하는 중...
    interim 결과 → 상태바에 "인식 중: ..." 표시
    final 결과 → textarea에 텍스트 추가 (누적)
    input_type → 'voice' 로 변경
    ↓
[중지 버튼 클릭] → recognition.stop()
    → "음성 입력 완료" 표시
    ↓
[저장 버튼] → 음성으로 입력된 내용으로 일기 저장
```

> ⚠️ HTTPS 환경에서만 마이크 권한 허용

---

## 6. 페르소나 (말벗 설정)

### 6-1. 페르소나 추가

```
[말벗 설정 페이지] /personas
    → 프리셋 선택 (🤗 공감형 / 💡 조언형) 또는 ✏️ 직접 설정
    ↓ POST /api/v1/personas/
    { name, preset_type, custom_description }
    ↓
[persona_service.create_persona()] → DB INSERT
    ↓
[React] 내 말벗 목록에 추가
```

### 6-2. 일기 작성 시 말벗 선택

```
[19번 화면] 저장 버튼 위 말벗 선택 UI
    [🌿 기본] [🤗 공감형 말벗] [💡 조언형 말벗] ...
    ↓
선택한 persona_id → 일기 저장 시 포함
    ↓ POST /api/v1/diaries/ { ..., persona_id: "uuid" }
    ↓
피드백 생성 시 해당 페르소나 스타일로 Claude 응답
```

### 6-3. 페르소나별 Claude 프롬프트 차이

| 페르소나 | 프롬프트 핵심 | Claude 응답 스타일 |
|------|------|------|
| 기본 (없음) | 따뜻한 공감, 3~4문장 | 일반 공감 |
| 공감형 말벗 | "따뜻하고 공감적인 할머니처럼..." | "그랬구나, 많이 힘들었겠다..." |
| 조언형 말벗 | "솔직하고 현실적인 친구처럼..." | "현실적으로 이렇게 해보면..." |
| 직접 설정 | 사용자 입력 설명 그대로 | 입력한 성격 그대로 적용 |

---

## 7. 배포 아키텍처

### 로컬 개발

```
브라우저 http://localhost:5173
    ↓ (Vite proxy /api → 8000)
React Dev Server (5173)
    ↕ /api/v1/...
FastAPI Dev Server (8000)
    ↕
SQLite (malbeot2.db)
```

### 운영 서버 (Docker)

```
인터넷
    ↓ :8080
nginx 컨테이너 (malbeot-diary2-frontend-1)
    ├── / → React 정적 파일 (/usr/share/nginx/html)
    └── /api/ → proxy → app:8000
                    ↓
              FastAPI 컨테이너 (malbeot-diary2-app-1)
                    ↓
              PostgreSQL 컨테이너 (malbeot-diary2-db-1)

같은 서버에 HumanRM도 동작:
    ↓ :80
humanrm-nginx-1 → humanrm-web-1 → humanrm-db-1
```

---

## 8. 캘린더 흐름

```
[React] 목록 화면 → 📅 캘린더 탭 클릭
    → 이미 로드된 diaries 데이터 사용 (추가 API 요청 없음)
    → diary_date 기준으로 날짜별 Map 생성
    ↓
[캘린더 렌더링]
    → 날짜 셀: 감정 이모지 + 날씨 이모지 + 건수
    → 감정색 20% 투명도로 셀 배경 힌트
    → 오늘 날짜 amber 강조
    ↓
[날짜 클릭]
    → selectedDate 상태 업데이트
    → 해당 날짜 일기 목록 달력 아래 인라인 표시
    → 일기 카드 클릭 → navigate('/diary/:id')

[월 이동]
    → 👈 👉 버튼 클릭
    → 또는 좌우 스와이프 (모바일 터치)
    → 또는 마우스 드래그 80px 이상 (PC)
```

---

## 9. HTTPS 적용 후 아키텍처 (DuckDNS + Let's Encrypt)

```
인터넷
    ↓ malbeot.duckdns.org:443 (HTTPS)
nginx 컨테이너
    ├── SSL 인증서 마운트 (/etc/letsencrypt)
    ├── / → React 정적 파일 (SPA)
    └── /api/ → proxy → app:8000
                    ↓
              FastAPI 컨테이너
                    ↓
              PostgreSQL 컨테이너

결과:
    🎤 음성 입력 (STT) ✅ 정상 동작
    🔊 TTS 읽어주기    ✅ 정상 동작
```

### DuckDNS 설정 요약

```bash
# 1. duckdns.org 에서 malbeot.duckdns.org 도메인 발급
# 2. EC2 보안그룹 443 포트 열기
# 3. 서버에서:
sudo apt install -y certbot
docker stop humanrm-nginx-1
sudo certbot certonly --standalone -d malbeot.duckdns.org
docker start humanrm-nginx-1

# 4. frontend/nginx.conf → HTTPS 설정으로 변경
# 5. docker-compose.yml → 443 포트 + 인증서 볼륨 추가
# 6. docker compose down && docker compose up -d --build

# 7. 인증서 자동 갱신 (crontab)
sudo crontab -e
# 추가: 0 3 1 * * certbot renew --quiet && docker restart malbeot-diary2-frontend-1
```
