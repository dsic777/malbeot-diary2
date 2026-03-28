# 말벗이 내 손 안에 — API 흐름도 (Flow)

> 작성일: 2026-03-28 | 작성: 유동주 + Claude AI
> 각 기능별 요청~응답 전체 흐름 정리

---

## 구조 개념도

```
[React 앱 (모바일)]
        ↕  HTTP 요청/응답 (JSON)
[FastAPI 백엔드]
    ├── api/v1/       ← 엔드포인트 (창구)
    ├── services/     ← 비즈니스 로직 (처리)
    ├── models/       ← DB 테이블 구조
    └── schemas/      ← 요청/응답 데이터 형식
        ↕
[SQLite DB (개발) / PostgreSQL (운영)]
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

**관련 파일**
| 파일 | 역할 |
|------|------|
| `api/v1/auth.py` | POST /register 엔드포인트 |
| `services/auth_service.py` | 중복확인, 암호화, DB저장 |
| `schemas/user.py` | UserCreate, UserResponse |
| `models/user.py` | users 테이블 |
| `core/security.py` | hash_password() |

---

### 1-2. 로그인

```
[React] 아이디 / 비밀번호 입력 후 로그인 버튼
    ↓ POST /api/v1/auth/login
[auth.py] 요청 데이터 수신 (UserLogin 스키마로 검증)
    ↓
[AuthService.login()]
    ├── users 테이블에서 아이디 조회
    │       없으면 → 401 Unauthorized 오류
    ├── 입력 비밀번호 vs 암호화 비밀번호 비교 (verify_password)
    │       불일치 → 401 Unauthorized 오류
    ├── last_login_at 갱신 → DB 저장 (UPDATE)
    └── JWT 토큰 생성 (create_access_token)
    ↓
[auth.py] TokenResponse 반환 (토큰 + 사용자 정보)
    ↓
[React] 토큰을 localStorage에 저장 → 메인 화면으로 이동
```

**관련 파일**
| 파일 | 역할 |
|------|------|
| `api/v1/auth.py` | POST /login 엔드포인트 |
| `services/auth_service.py` | 아이디 조회, 비밀번호 검증, 토큰 발급 |
| `schemas/user.py` | UserLogin, TokenResponse |
| `core/security.py` | verify_password(), create_access_token() |

---

### 1-3. 인증이 필요한 API 요청 (공통)

```
[React] API 요청 시 Header에 토큰 포함
    Authorization: Bearer {JWT토큰}
    ↓
[FastAPI] get_current_user() 자동 실행 (Depends)
    ├── 토큰 추출 → decode_access_token()
    │       토큰 없거나 만료 → 401 Unauthorized
    ├── 토큰에서 user_id 추출
    └── users 테이블에서 사용자 조회
            없으면 → 401 Unauthorized
    ↓
[API 함수] current_user 객체 사용 가능
```

---

## 2. 일기 (Diary)

### 2-1. 일기 작성

```
[React] 제목/감정/날씨/내용/날짜 입력 후 저장 버튼
    ↓ POST /api/v1/diaries
    Authorization: Bearer {JWT토큰}
[diary.py] DiaryCreate 스키마로 검증
    ↓
[DiaryService.create_diary()]
    ├── Diary 객체 생성 (user_id는 JWT에서)
    └── DB 저장 (INSERT) → refresh
    ↓
[diary.py] DiaryResponse 반환 (id, title, emotion, weather, content, diary_date, created_at 등)
    ↓
[React] 작성 완료 → 상세 화면으로 이동
```

**관련 파일**
| 파일 | 역할 |
|------|------|
| `api/v1/diary.py` | POST / 엔드포인트 |
| `services/diary_service.py` | DB 저장 |
| `schemas/diary.py` | DiaryCreate, DiaryResponse |
| `models/diary.py` | diaries 테이블 |

---

### 2-2. 일기 목록 조회

```
[React] 메인 화면 진입 시 자동 요청
    ↓ GET /api/v1/diaries
    Authorization: Bearer {JWT토큰}
[diary.py] 현재 사용자의 일기 목록 요청
    ↓
[DiaryService.get_diaries()]
    └── user_id로 필터링 → diary_date 최신순 정렬
    ↓
[diary.py] List[DiaryListResponse] 반환 (id, title, emotion, weather, diary_date, input_type, created_at)
    ↓
[React] 목록 카드 형태로 렌더링
```

---

### 2-3. 일기 단건 조회

```
[React] 목록에서 카드 클릭
    ↓ GET /api/v1/diaries/{diary_id}
    Authorization: Bearer {JWT토큰}
[DiaryService.get_diary()]
    ├── diary_id + user_id 동시 조건 (타인 일기 접근 차단)
    └── 없으면 → 404 Not Found
    ↓
[diary.py] DiaryResponse 반환
    ↓
[React] 상세 화면 렌더링
```

---

### 2-4. 일기 수정

```
[React] 수정 버튼 → 수정할 필드 입력
    ↓ PATCH /api/v1/diaries/{diary_id}
    Authorization: Bearer {JWT토큰}
[diary.py] get_diary()로 소유권 확인 → update_diary() 호출
[DiaryService.update_diary()]
    ├── 변경된 필드만 선택적 업데이트 (None 필드 무시)
    └── updated_at 갱신 → DB 저장
    ↓
[diary.py] DiaryResponse 반환
```

---

### 2-5. 일기 삭제

```
[React] 삭제 버튼 (확인 모달)
    ↓ DELETE /api/v1/diaries/{diary_id}
    Authorization: Bearer {JWT토큰}
[diary.py] get_diary()로 소유권 확인 → delete_diary() 호출
[DiaryService.delete_diary()]
    └── DB에서 해당 행 삭제 (DELETE)
    ↓
[diary.py] 204 No Content 반환
    ↓
[React] 목록 화면으로 이동 (해당 카드 제거)
```

---

## 3. AI 피드백 (Claude API)

### 3-1. Swagger UI 테스트 방법 (공통 절차)

> API 테스트 시 매번 이 순서를 따릅니다.
> 브라우저 주소창: `http://127.0.0.1:8000/docs`

**1단계 — 로그인 (토큰 받기)**

1. **인증** 섹션 → `POST /api/v1/auth/login` 클릭
2. **Try it out** 클릭
3. Request body 입력:
```json
{
  "username": "test",
  "password": "12345678"
}
```
4. **Execute** 클릭
5. Response body에서 `access_token` 값 복사
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**2단계 — 토큰 등록 (Authorize)**

1. 페이지 우상단 자물쇠 모양 **Authorize** 버튼 클릭
2. Value 입력란에 입력: (`Bearer ` 뒤에 토큰 붙여넣기, 공백 하나 필수)
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
3. **Authorize** → **Close** 클릭

**3단계 — 일기 ID 확인**

1. **일기** 섹션 → `GET /api/v1/diaries` → **Try it out** → **Execute**
2. Response body에서 `id` 복사:
```json
[{ "id": "14df3d0e-e73c-4f81-a4f6-8b2b6e0f93b7", "title": "첫 번째 일기" }]
```

**4단계 — AI 피드백 생성**

1. **AI피드백** 섹션 → `POST /api/v1/feedback/{diary_id}` 클릭
2. **Try it out** → `diary_id` 입력란에 복사한 ID 붙여넣기
3. **Execute** → Response body에서 Claude 피드백 확인

```json
{
  "diary_id": "14df3d0e-e73c-4f81-a4f6-8b2b6e0f93b7",
  "ai_feedback": "새로운 프로젝트를 시작하며 느껴지는 설렘과 활기가 정말 멋있네요..."
}
```

**관련 파일**
| 파일 | 역할 |
|------|------|
| `api/v1/feedback.py` | POST /{diary_id} 엔드포인트 |
| `services/feedback_service.py` | Claude API 호출 |
| `services/diary_service.py` | 일기 조회 및 피드백 저장 |

---

## 4. 음성 (STT/TTS) — 작성 예정

---

## 5. 알림 (Alarm) — 작성 예정

---

## 6. 페르소나 (Persona) — 작성 예정
