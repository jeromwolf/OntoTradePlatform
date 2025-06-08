# 포트폴리오 시스템 설정 가이드

## 📋 단계별 설정 방법

### 1단계: Supabase 데이터베이스 스키마 적용

1. **Supabase Dashboard 접속**
   - [Supabase Dashboard](https://app.supabase.com) 로그인
   - OntoTradePlatform 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 `SQL Editor` 클릭
   - `New query` 버튼 클릭

3. **스키마 SQL 실행**
   - `database/portfolio_schema.sql` 파일의 전체 내용을 복사
   - SQL Editor에 붙여넣기
   - `Run` 버튼 클릭하여 실행

4. **실행 결과 확인**
   - 오류 없이 완료되면 성공
   - 왼쪽 메뉴 `Table Editor`에서 새로 생성된 테이블들 확인:
     - `portfolios`
     - `portfolio_holdings` 
     - `portfolio_transactions`
     - `portfolio_performance`
     - `portfolio_settings`

### 2단계: 백엔드 서버 실행

```bash
cd backend
python -m uvicorn app.main:socket_app --host 0.0.0.0 --port 8000 --reload
```

### 3단계: 프론트엔드 서버 실행

```bash
cd frontend  
npm run dev
```

### 4단계: 포트폴리오 API 테스트

#### 기본 API 엔드포인트들:

- **GET** `/api/portfolios/` - 포트폴리오 목록 조회
- **POST** `/api/portfolios/` - 새 포트폴리오 생성
- **GET** `/api/portfolios/{portfolio_id}` - 포트폴리오 상세 조회
- **PUT** `/api/portfolios/{portfolio_id}` - 포트폴리오 수정
- **DELETE** `/api/portfolios/{portfolio_id}` - 포트폴리오 삭제

#### cURL 테스트 예시:

```bash
# 포트폴리오 목록 조회
curl -X GET "http://localhost:8000/api/portfolios/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 새 포트폴리오 생성
curl -X POST "http://localhost:8000/api/portfolios/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "메인 포트폴리오",
    "description": "주식 투자용 포트폴리오",
    "initial_balance": 1000000,
    "risk_level": "medium",
    "investment_goal": "장기 성장"
  }'
```

## 🔍 문제 해결

### 스키마 적용 오류 시:
- Supabase Dashboard의 `Logs` 섹션에서 오류 확인
- 기존 테이블이 있다면 먼저 삭제 후 재실행

### API 연결 오류 시:
- 백엔드 서버가 정상 실행 중인지 확인
- `.env` 파일의 Supabase 설정값들 확인
- JWT 토큰이 유효한지 확인

## 📊 다음 단계

1. ✅ 데이터베이스 스키마 적용
2. 🚀 포트폴리오 서비스 로직 완성
3. 🔗 API 엔드포인트와 서비스 연결
4. 🧪 API 테스트 및 검증
5. 🎨 프론트엔드 UI 연동

---

**참고**: 이 가이드는 Task 5.1 "포트폴리오 데이터 모델 및 API 구현" 완료를 위한 것입니다.
