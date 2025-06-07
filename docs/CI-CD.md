# CI/CD 파이프라인 가이드

OntoTrade 플랫폼의 지속적 통합 및 배포(CI/CD) 시스템에 대한 가이드입니다.

## 개요

우리의 CI/CD 파이프라인은 GitHub Actions를 사용하여 다음 작업을 자동화합니다:

- 코드 품질 검사 (린팅, 포맷팅)
- 자동 테스트 실행
- 보안 스캔
- 자동 배포 (Vercel + Railway)
- 배포 알림

## 워크플로우 구조

### 1. 프론트엔드 테스트 & 빌드 (`frontend-test`)

**트리거**: 모든 push와 PR
**실행 환경**: `frontend/` 디렉토리
**단계**:
- Node.js 18 환경 설정
- 의존성 설치 (`npm ci`)
- ESLint 린팅 검사
- Prettier 포맷팅 검사
- TypeScript 타입 체크
- 테스트 실행 (Vitest)
- 프로덕션 빌드
- 빌드 아티팩트 업로드

### 2. 백엔드 테스트 & 린팅 (`backend-test`)

**트리거**: 모든 push와 PR
**실행 환경**: `backend/` 디렉토리
**단계**:
- Python 3.11 환경 설정
- 의존성 설치 (`requirements.txt` + `requirements-dev.txt`)
- Black 포맷터 검사
- isort import 정렬 검사
- Flake8 린팅 검사
- mypy 타입 체크
- pytest 테스트 실행 (커버리지 포함)
- Codecov로 커버리지 업로드

### 3. 보안 스캔 (`security-scan`)

**트리거**: 모든 push와 PR
**도구**: Bandit (Python 보안 스캔)
**결과**: JSON 형태로 아티팩트 저장

### 4. 프론트엔드 배포 (`deploy-frontend`)

**트리거**: `main` 브랜치로의 push (테스트 통과 후)
**플랫폼**: Vercel
**의존성**: `frontend-test`, `backend-test` 성공

### 5. 백엔드 배포 (`deploy-backend`)

**트리거**: `main` 브랜치로의 push (테스트 통과 후)
**플랫폼**: Railway
**의존성**: `frontend-test`, `backend-test` 성공

### 6. 배포 알림 (`notify`)

**트리거**: 배포 작업 완료 후
**채널**: Slack (#deployments)
**조건**: SLACK_WEBHOOK 환경변수 설정 시에만

## 필요한 환경 변수 (GitHub Secrets)

CI/CD 파이프라인을 위해 다음 GitHub Secrets를 설정해야 합니다:

### Vercel 배포용
```
VERCEL_TOKEN         # Vercel 배포 토큰
VERCEL_ORG_ID        # Vercel 조직 ID
VERCEL_PROJECT_ID    # Vercel 프로젝트 ID
```

### Railway 배포용
```
RAILWAY_TOKEN        # Railway 배포 토큰
```

### 선택사항 - Slack 알림용
```
SLACK_WEBHOOK        # Slack 웹훅 URL
```

## 설정 방법

### 1. GitHub Secrets 설정

1. GitHub 리포지토리로 이동
2. `Settings` → `Secrets and variables` → `Actions`
3. `New repository secret` 클릭
4. 위의 환경 변수들을 하나씩 추가

### 2. Vercel 연동

1. [Vercel 대시보드](https://vercel.com/dashboard)에서 프로젝트 생성
2. 프로젝트를 GitHub 리포지토리와 연결
3. 빌드 설정:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3. Railway 연동

1. [Railway 대시보드](https://railway.app/dashboard)에서 새 프로젝트 생성
2. GitHub 리포지토리와 연결
3. 백엔드 서비스 설정:
   - **Root Directory**: `backend`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 4. 환경 변수 설정

**Vercel 환경 변수**:
```
VITE_API_URL         # Railway 백엔드 URL
VITE_APP_ENV         # production
```

**Railway 환경 변수**:
```
DATABASE_URL         # PostgreSQL 데이터베이스 URL
SECRET_KEY           # JWT 토큰용 비밀키
ALGORITHM           # HS256
ACCESS_TOKEN_EXPIRE_MINUTES  # 30
```

## 브랜치 전략

- **`main`**: 프로덕션 브랜치 (자동 배포)
- **`develop`**: 개발 브랜치 (테스트만 실행)
- **feature 브랜치**: 기능 개발용 (PR을 통해 develop에 머지)

## 로컬 개발 환경에서 CI 테스트

배포 전에 로컬에서 CI 단계들을 테스트할 수 있습니다:

### 프론트엔드
```bash
cd frontend
npm run lint          # ESLint 검사
npm run format:check   # Prettier 검사
npm run type-check     # TypeScript 체크
npm run test          # 테스트 실행
npm run build         # 빌드 테스트
```

### 백엔드
```bash
cd backend
black --check .       # Black 포맷터 체크
isort --check-only .  # isort 체크
flake8 .             # Flake8 린팅
mypy app/            # mypy 타입 체크
pytest app/tests/    # 테스트 실행
```

## 트러블슈팅

### 빌드 실패

1. **의존성 문제**: `package-lock.json` 또는 `requirements.txt` 확인
2. **린팅 오류**: 로컬에서 `npm run lint:fix` 또는 `black .` 실행
3. **테스트 실패**: 로컬에서 테스트 실행하여 오류 확인

### 배포 실패

1. **환경 변수**: GitHub Secrets 설정 확인
2. **권한 문제**: Vercel/Railway 토큰 권한 확인
3. **빌드 설정**: 플랫폼별 설정 파일 확인

### 알림 문제

1. **Slack 웹훅**: URL 형식 및 권한 확인
2. **채널 설정**: #deployments 채널 존재 여부 확인

## 성능 최적화

- **캐시 활용**: Node.js와 Python 의존성 캐시 사용
- **병렬 실행**: 프론트엔드/백엔드 테스트 병렬 실행
- **조건부 배포**: `main` 브랜치에만 배포 실행
- **아티팩트 관리**: 불필요한 아티팩트는 짧은 보존 기간 설정

## 모니터링

- **GitHub Actions**: 워크플로우 실행 상태 모니터링
- **Vercel**: 프론트엔드 배포 상태 및 성능 모니터링
- **Railway**: 백엔드 서비스 상태 및 로그 모니터링
- **Slack**: 실시간 배포 알림
