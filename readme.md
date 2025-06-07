# OntoTradePlatform 

> **온톨로지 기반 지식 그래프를 활용한 혁신적인 투자 시뮬레이션 플랫폼**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/ontotrade/ontotrade)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.0-61dafb.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688.svg)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646cff.svg)](https://vitejs.dev/)

## 프로젝트 개요

OntoTradePlatform은 온톨로지 기반 지식 그래프를 활용하여 투자 결정 과정을 혁신하는 차세대 투자 시뮬레이션 플랫폼입니다. 

### 핵심 가치 제안
- **데이터 기반 투자**: 방대한 지식 그래프로 투자 결정 지원
- **게임화된 학습**: 재미있는 투자 교육 경험 제공
- **AI 기반 분석**: 머신러닝을 활용한 시장 분석 및 예측
- **실시간 시뮬레이션**: 실제 시장과 동일한 환경에서 연습

## 프로젝트 진행 상황

### 완료된 태스크 (Phase 1)

#### 프로젝트 인프라 구축 (완료)
- **1.1** 프론트엔드 프로젝트 초기화 (React 18 + Vite + TypeScript)
- **1.2** 백엔드 프로젝트 설정 (FastAPI + Python 3.11)
- **1.3** 코드 스타일 및 품질 도구 구성 (ESLint, Prettier, Black, isort)
- **1.4** CI/CD 파이프라인 구축 (GitHub Actions, Vercel, Railway)
- **1.5** 모니터링 및 분석 도구 통합 (Sentry, PostHog)

### 진행 예정 태스크

#### 인증 시스템 구현 (다음 단계)
- **2.1** Supabase 프로젝트 설정 및 인증 구성
- **2.2** 사용자 등록 및 로그인 기능 구현
- **2.3** OAuth2 소셜 로그인 구현
- **2.4** 보안 기능 강화
- **2.5** 사용자 관리 기능 개발

## 기술 스택

### 프론트엔드
- **Framework**: React 18
- **Build Tool**: Vite 5.0
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Testing**: Vitest + React Testing Library

### 백엔드
- **Framework**: FastAPI 0.104
- **Language**: Python 3.11
- **Database**: PostgreSQL (Supabase)
- **ORM**: SQLAlchemy
- **Authentication**: Supabase Auth
- **Testing**: Pytest

### 인프라 & DevOps
- **CI/CD**: GitHub Actions
- **Frontend Deployment**: Vercel
- **Backend Deployment**: Railway
- **Monitoring**: Sentry
- **Analytics**: PostHog
- **Code Quality**: ESLint, Prettier, Black, isort

### 개발 도구
- **Task Management**: TaskMaster AI
- **Version Control**: Git & GitHub
- **Code Editor**: VS Code
- **API Documentation**: FastAPI Swagger

## 빠른 시작

### 필수 요구사항
- Node.js 18+
- Python 3.11+
- PostgreSQL (또는 Supabase 계정)

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/OntoTradePlatform.git
cd OntoTradePlatform
```

### 2. 환경 변수 설정
```bash
# 루트 디렉토리에 .env 파일 생성
cp .env.example .env
# 필요한 환경 변수들을 설정하세요
```

### 3. 프론트엔드 설정
```bash
cd frontend
npm install
npm run dev
```

### 4. 백엔드 설정
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 프로젝트 구조

```
OntoTradePlatform/
├── frontend/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/       # 재사용 가능한 컴포넌트
│   │   ├── pages/           # 페이지 컴포넌트
│   │   ├── utils/           # 유틸리티 함수
│   │   ├── stores/          # Zustand 상태 관리
│   │   └── types/           # TypeScript 타입 정의
│   ├── public/              # 정적 파일
│   └── package.json
├── backend/                  # FastAPI 백엔드
│   ├── app/
│   │   ├── api/             # API 라우터
│   │   ├── core/            # 핵심 설정 및 유틸리티
│   │   ├── models/          # 데이터베이스 모델
│   │   ├── schemas/         # Pydantic 스키마
│   │   └── services/        # 비즈니스 로직
│   ├── tests/               # 테스트 파일
│   └── requirements.txt
├── docs/                     # 프로젝트 문서
├── .github/workflows/        # GitHub Actions 워크플로우
├── .taskmaster/             # TaskMaster 설정 및 태스크
└── README.md
```

## 개발 가이드

### 코드 스타일
이 프로젝트는 일관된 코드 스타일을 유지하기 위해 다음 도구들을 사용합니다:

#### 프론트엔드
```bash
npm run lint      # ESLint 검사
npm run format    # Prettier 포맷팅
npm run test      # 테스트 실행
```

#### 백엔드
```bash
black .           # 코드 포맷팅
isort .           # import 정렬
flake8 .          # 린팅 검사
pytest            # 테스트 실행
```

### Git 워크플로우
1. 새 기능을 위한 브랜치 생성: `git checkout -b feature/새기능`
2. 변경사항 커밋: `git commit -m "feat: 새 기능 추가"`
3. Pull Request 생성
4. 코드 리뷰 및 CI/CD 통과 후 메인 브랜치로 병합

## 모니터링 및 분석

### 에러 추적 (Sentry)
- 실시간 에러 모니터링
- 성능 추적 및 릴리스 추적
- 사용자 컨텍스트 및 브레드크럼

### 사용자 분석 (PostHog)
- 사용자 행동 분석
- 이벤트 추적 및 퍼널 분석
- A/B 테스트 및 기능 플래그

자세한 내용은 [모니터링 가이드](./docs/Monitoring.md)를 참조하세요.

## 문서

- [CI/CD 가이드](./docs/CI-CD.md)
- [모니터링 가이드](./docs/Monitoring.md)
- [API 문서](http://localhost:8000/docs) (개발 환경)

## 기여하기

1. 이 저장소를 포크하세요
2. 새 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'feat: Add amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요

## 최근 업데이트

### v1.0.0 (2025-06-07)
- 프로젝트 초기 인프라 구축 완료
- React 18 + Vite 프론트엔드 설정
- FastAPI 백엔드 설정
- CI/CD 파이프라인 구축 (GitHub Actions)
- 모니터링 도구 통합 (Sentry, PostHog)
- 코드 품질 도구 설정 (ESLint, Prettier, Black)

## 연락처

프로젝트에 대한 질문이나 제안사항이 있으시면 언제든 연락주세요.

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

**OntoTradePlatform** - 투자의 미래를 함께 만들어갑니다 
