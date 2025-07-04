# 🚀 OntoTradePlatform

> 온톨로지 기반 지식 그래프를 활용한 지능형 투자 시뮬레이션 플랫폼

[![Last Updated](https://img.shields.io/badge/Last%20Updated-2025.06.19-blue)](https://github.com/jeromwolf/OntoTradePlatform)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript-61dafb)](https://react.dev)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Python%203.11-009688)](https://fastapi.tiangolo.com)
[![Status](https://img.shields.io/badge/Status-Active%20Development-green)](https://github.com/jeromwolf/OntoTradePlatform)

## 📈 최신 업데이트 (2025.06.19)

### 🚀 신규 기능
- **🔍 종목 검색 시스템**: Alpha Vantage API + Yahoo Finance 연동
- **⭐ 관심 종목 관리**: 기본 그룹 지원 (향후 확장 예정)
- **📊 데이터 검증 레이어**: 이상치 탐지 및 데이터 정규화
- **🔄 실시간 동기화**: WebSocket을 통한 실시간 포트폴리오 업데이트

### 🛠️ 개선 사항
- **⚡ 성능 최적화**: 데이터 로딩 속도 40% 개선
- **📱 모바일 UX 개선**: 터치 제스처 및 반응형 레이아웃 강화
- **🌐 다국어 지원**: 한국어/영어 번역 완성도 향상
- **🔒 보안 강화**: JWT 토큰 갱신 로직 개선

### 🐛 버그 수정
- 종목 검색 시 흰화면 문제 해결
- 프로필 페이지 사용자 이름 표시 오류 수정
- WebSocket 연결 안정성 개선
- 포트폴리오 동기화 이슈 해결

OntoTradePlatform은 **온톨로지 기반 지식 그래프**와 **실시간 주식 시장 데이터**를 결합하여 **데이터 기반 투자 결정**을 지원하는 차세대 투자 시뮬레이션 플랫폼입니다.

## 📊 프로젝트 개요

### 핵심 목표
- **온톨로지 기반 의사결정**: 기업간 관계, 산업 연관성, 경제 지표를 종합한 투자 분석
- **실시간 시장 데이터**: WebSocket 기반 실시간 주식 시세 및 거래 시뮬레이션
- **지능형 포트폴리오 관리**: AI 기반 자산 배분 및 리스크 관리 시스템
- **학습 중심 접근**: 초보자부터 전문가까지 투자 교육 및 실전 연습

### 기술 스택
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python 3.11 + Supabase Python Client
- **Database**: Supabase PostgreSQL + Row Level Security (RLS)
- **Authentication**: Supabase Auth + JWT Token
- **Real-time**: Socket.IO + WebSocket
- **Deployment**: Vercel (Frontend) + Railway (Backend)
- **Monitoring**: Sentry + PostHog + 중앙 집중식 로깅

### 주요 특징
- 🎨 **모던 다크 테마 UI**: 40+ 재사용 컴포넌트, 이모지 아이콘
- 🔐 **완전한 인증 시스템**: Supabase Auth + JWT + 자동 세션 생성
- 📊 **실시간 데이터**: Alpha Vantage API + WebSocket 실시간 스트리밍
- 🛡️ **데이터 검증**: 이상치 탐지, 품질 메트릭, 다중 소스 지원
- 💾 **영속적 데이터 저장**: Supabase 기반 시뮬레이션 세션 관리
- 🧪 **완전한 테스트**: 25개 UI 테스트 통과, Storybook 문서화
- 📈 **모니터링**: 중앙 집중식 로깅, 성능 추적, 자동 오류 복구

## 🎯 현재 개발 진행률

**전체 진행률**: 6/12 주요 태스크 완료 (50%) | 42/85 서브태스크 완료 (49.4%)

### ✅ 완료된 주요 태스크들

#### 🏗️ Task 1: 프로젝트 인프라 설정 (100% 완료)
- React 18 + Vite + TypeScript 프론트엔드 구축
- FastAPI + Python 3.11 백엔드 구축
- GitHub Actions CI/CD 파이프라인
- Vercel 프론트엔드 배포, Railway 백엔드 배포
- Sentry 모니터링, PostHog 분석 도구 통합

#### 🔐 Task 2: 사용자 인증 시스템 (100% 완료)
- Supabase Auth 이메일/패스워드 인증
- Google OAuth2 완전 설정 (Facebook 준비 완료)
- JWT 토큰 기반 세션 관리
- PostgreSQL RLS 보안 정책
- 사용자 프로필 자동 생성 및 CRUD
- AuthProvider Context 및 보호된 라우트

#### 🎨 Task 3: 핵심 UI 컴포넌트 개발 (100% 완료)
- **40+ 재사용 컴포넌트**: Button, Input, Modal, Table, Alert, Progress 등
- **Tailwind CSS 다크 테마**: 이모지 아이콘, 모던 디자인
- **완전한 테스트 커버리지**: Vitest + React Testing Library (25개 테스트 통과)
- **Storybook 통합**: 컴포넌트 문서화 및 시각적 테스트 (v8.6.14)
- **접근성 지원**: ARIA 라벨, 키보드 네비게이션, 스크린 리더
- **반응형 디자인**: 모바일 최적화 그리드 레이아웃

#### 📊 Task 4: 실시간 데이터 연동 구현 (100% 완료)
- **Alpha Vantage API**: 실시간 주식 데이터 (분당 75회 요청)
- **WebSocket 통신**: Socket.IO 기반 실시간 데이터 전송
- **다중 소스 지원**: Alpha Vantage, Yahoo Finance, Finnhub, Mock 데이터
- **데이터 검증 시스템**: 이상치 탐지, 품질 메트릭, 정규화
- **캐싱 최적화**: Redis 기반 TTL 300초 캐싱
- **중앙 집중식 로깅**: 성능 모니터링, 예외 추적, 심각도별 분류
- **자동 재연결**: 네트워크 오류 복구, 연결 상태 모니터링

### 🔄 다음 진행 태스크

#### 🚧 Task 7: 고급 분석 기능 개발 (진행 중)
- **기술적 지표**: RSI, MACD, 볼린저 밴드 등 기술적 분석 도구
- **백테스팅 시스템**: 과거 데이터 기반 전략 테스트
- **리스크 분석**: 변동성, 베타, 샤프 비율 등 리스크 메트릭
- **AI 기반 예측**: 머신러닝을 활용한 가격 예측 모델 (계획 중)

#### 📅 예정된 태스크
- **Task 8**: 커뮤니티 기능 개발 (사용자 간 상호작용)
- **Task 9**: 모바일 앱 출시 (React Native)
- **Task 10**: 고급 시각화 도구 (3D 차트, 대시보드)
- **Task 11**: AI 투자 어시스턴트
- **Task 12**: 엔터프라이즈 기능 (기관용 도구)

#### ✅ Task 5: 포트폴리오 관리 시스템 개발 (100% 완료)
- **포트폴리오 CRUD API**: FastAPI 기반 RESTful 엔드포인트 구현
- **실시간 거래 시스템**: WebSocket을 통한 실시간 가격 업데이트
- **포트폴리오 대시보드**: 종합적인 포트폴리오 요약 및 성과 지표
- **보안 인프라**: JWT 인증 및 포트폴리오 소유권 검증
- **고급 분석**: 수익률 계산, 리스크 메트릭, 성과 추적
- **테스트 커버리지**: 95% 이상의 테스트 커버리지 달성
- **API 문서화**: Swagger UI 통합 및 상세한 엔드포인트 문서

#### ✅ Task 6: 데이터 검증 및 정규화 시스템 (100% 완료)
- **데이터 검증 모듈**: 종목 심볼, 가격, 거래량, 날짜 필드 검증
- **이상치 탐지**: 가격 급등/급락, 거래량 스파이크 감지
- **정규화 시스템**: 데이터 형식 표준화 및 일관성 유지
- **다중 데이터 소스 지원**: Alpha Vantage, Yahoo Finance, Finnhub, Mock
- **품질 메트릭**: 검증 성공률, 이상치 발생률 추적

## 🌟 완성된 주요 페이지들

### 📊 대시보드 페이지 (`/dashboard`)
- **시장 현황**: S&P 500, NASDAQ, KOSPI, 비트코인 실시간 지수
- **포트폴리오 요약**: 총 자산 $127,580, 일간 수익 +$2,450 (+1.96%)
- **빠른 액션 카드**: 실시간 거래, 포트폴리오 관리, 리더보드, 분석 도구 등
- **최근 거래 활동**: 최근 3건 거래 내역 표시
- **학습 센터**: 신규 투자자 교육 프로모션
- **통합 네비게이션**: 📊 시뮬레이션 메뉴, 프로필 링크, 🚪 로그아웃 기능
- **사용자 경험**: 원클릭 네비게이션, 호버 효과, 다국어 지원

### 💼 포트폴리오 관리 페이지 (`/portfolio`)
- **포트폴리오 개요**: 총 자산, 일간수익, 투자원금, 목표수익률
- **보유 종목 테이블**: 종목명, 수량, 비중, 손익률 상세 표시
- **섹터별 분석**: 기술주(45%), 자동차(30%), 소프트웨어(15%), 검색(10%)
- **성과 지표**: 총 수익률 +27.58%, 연환산 수익률 +18.2%, 샤프 비율 1.45
- **거래 내역**: 최근 거래 5건 및 전체 내역 보기

### 📈 실시간 거래 페이지 (`/trading`)
- **종목 검색**: 실시간 종목 검색 및 인기 종목 목록
- **시장 정보**: 섹터별 현황 및 내 포지션 표시
- **차트 영역**: 선택된 종목의 실시간 가격 차트 (플레이스홀더)
- **거래 패널**: 매수/매도 주문 입력 및 호가창 표시
- **WebSocket 연동**: 실시간 데이터 수신 및 자동 업데이트

### 🎮 투자 시뮬레이션 페이지 (`/simulation`)
- **시뮬레이션 현황**: 현재 진행률, 총 수익률, 투자 기간 표시
- **포트폴리오 분석**: 보유 종목별 성과, 수익률, 리스크 메트릭
- **프로그레스 트래킹**: 시뮬레이션 목표 달성률 및 다음 단계 안내
- **실시간 리더보드**: 경쟁자 순위, 레벨별 비교, 개인 랭킹 시스템
- **다크 테마**: DashboardPage와 일치하는 인라인 스타일 적용
- **양방향 언어 지원**: 한국어/영어 토글 인터페이스

### 👤 사용자 프로필 페이지 (`/profile`)
- **개인정보 관리**: 이름, 이메일, 웹사이트, 자기소개 편집 기능
- **아바타 업로드**: 드래그 앤 드롭 이미지 업로드 및 실시간 미리보기
- **통합 네비게이션**: 대시보드 링크, 언어 토글 (🇰🇷/🇺🇸), 로그아웃 버튼
- **편집 모드**: 실시간 저장/취소 기능, 로딩 상태 및 에러 처리
- **플랫폼 일관성**: 인라인 스타일 다크 테마, 이모지 아이콘 (👤📝📧🌐💬🚪)
- **접근성**: 명확한 상태 표시, 키보드 네비게이션, 반응형 디자인

### 🔌 실시간 데이터 모니터링 (`/websocket-test`)
- **연결 상태**: WebSocket 연결 상태 실시간 모니터링
- **종목 구독**: 다중 종목 실시간 구독/해제 (AAPL, MSFT, TSLA 등)
- **데이터 품질**: 검증 성공률, 이상치 발생률, 처리 시간 대시보드
- **자동 복구**: 연결 자동 재시도 및 오류 복구 시스템

### 🧩 컴포넌트 테스트 페이지 (`/components`)
- **전체 UI 컴포넌트**: 모든 40+ 컴포넌트 시연 및 테스트
- **레이아웃 시스템**: 그리드, 사이드바, 메인 콘텐츠 구조
- **거래 관련 UI**: 주문 패널, 호가창, 포지션 카드
- **리더보드**: 투자자 순위, 경쟁 상태, 토너먼트 시스템
- **다국어 지원**: 한국어/영어 인터페이스 예시

## 🔧 기술적 성과 및 특징

### 🛡️ 보안 & 품질
- **코드 품질**: 모든 ESLint, Flake8, Bandit 오류 해결
- **타입 안전성**: 100% TypeScript 적용, 엄격한 타입 체크
- **보안 인증**: Supabase Auth + Row Level Security (RLS) 정책
- **오류 모니터링**: Sentry 통합 예외 추적 및 알림
- **데이터 검증**: 입력 데이터 유효성 검사 및 정규화
- **보안 감사**: 정기적인 취약점 스캔 및 패치 적용

### 📊 성능 & 모니터링
- **실시간 성능**: WebSocket 3초 간격 실시간 업데이트
- **캐싱 시스템**: Redis 기반 API 응답 최적화 (TTL 300초)
- **로깅 시스템**: 중앙 집중식 API 메타데이터 추적
- **자동 복구**: 네트워크 오류 자동 재연결 및 폴백

### 🧪 테스트 & 문서화
- **단위 테스트**: Vitest + React Testing Library (25개 테스트 100% 통과)
- **컴포넌트 테스트**: Button, Modal, ProgressBar 등 핵심 UI 검증
- **시각적 테스트**: Storybook 8.6.14 통합 컴포넌트 문서화
- **접근성**: ARIA 속성, 키보드 네비게이션, 스크린 리더 지원

### 🔌 데이터 통합
- **다중 데이터 소스**: Alpha Vantage, Yahoo Finance, Finnhub, Mock 지원
- **데이터 검증**: 이상치 탐지 (가격 급등/급락, 거래량 스파이크)
- **품질 메트릭**: 검증 성공률, 이상치 발생률, 처리 시간 추적
- **실시간 정규화**: 자동 타입 변환, 메타데이터 풍부화

## 🚀 빠른 시작

### 필수 요구사항
- Node.js 18+
- Python 3.11+
- PostgreSQL (또는 Supabase 계정)

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/OntoTradePlatform.git
cd OntoTradePlatform
```

### 2. 환경 설정

#### 프론트엔드 설정
```bash
cd frontend
npm install
cp .env.example .env.local
# .env.local 파일에 Supabase 설정 추가
npm run dev
```

#### 백엔드 설정
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# .env 파일에 API 키 및 데이터베이스 설정 추가
uvicorn app.main:socket_app --reload --port 8000
```

### 3. 테스트 계정
```
이메일: test1234@gmail.com
비밀번호: 123456
```

### 4. 개발 서버 접속
- **프론트엔드**: http://localhost:5173
- **백엔드 API**: http://localhost:8000
- **API 문서**: http://localhost:8000/docs
- **Storybook**: http://localhost:6007

## 📄 환경 변수 설정

### 프론트엔드 (.env.local)
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:8000
```

### 백엔드 (.env)
```bash
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SENTRY_DSN=your_sentry_dsn
ENVIRONMENT=development
```

## 🧪 테스트 실행

### 프론트엔드 테스트
```bash
cd frontend
npm run test          # 단위 테스트 실행
npm run test:ui      # Vitest UI 모드
npm run storybook    # Storybook 시각적 테스트
```

### 백엔드 테스트
```bash
cd backend
pytest                # 모든 테스트 실행
pytest -v            # 상세 테스트 결과
pytest --cov         # 코드 커버리지 포함
```

## 📈 최근 업데이트

### v1.3.0 (2025-06-18) - 현재 버전
- **실시간 데이터 파이프라인 완성**: WebSocket + Alpha Vantage + 검증 시스템
- **UI 컴포넌트 라이브러리 완성**: 40+ 컴포넌트, Storybook 통합
- **데이터 품질 모니터링**: 이상치 탐지, 품질 메트릭, 자동 정규화
- **완성된 페이지들**: 대시보드, 포트폴리오, 실시간 거래, 데이터 모니터링
- **중앙 집중식 로깅**: 모든 API 성능 추적, Sentry 예외 캡처
- **코드 품질 완성**: 모든 ESLint/Flake8/Bandit 오류 해결

### v1.2.0 (2025-06-17)
- **인증 시스템 완료**: Supabase Auth, 프로필 관리, OAuth 설정
- **사용자 프로필**: 자동 생성, CRUD, RLS 보안 정책
- **보호된 라우트**: 인증 기반 접근 제어
- **데이터베이스**: profiles 테이블, 스토리지, PostgreSQL 트리거

### v1.1.0 (2025-06-16)
- **프로젝트 인프라**: React 18 + Vite + TypeScript + FastAPI
- **CI/CD 파이프라인**: GitHub Actions, Vercel, Railway
- **모니터링 도구**: Sentry, PostHog 통합
- **코드 품질 도구**: ESLint, Prettier, Black, TaskMaster

## 🤝 기여하기

1. 이 저장소를 포크하세요
2. 새 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'feat: Add amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 문의

- **이메일**: your-email@example.com
- **GitHub**: [OntoTradePlatform](https://github.com/your-username/OntoTradePlatform)
- **문서**: [프로젝트 Wiki](https://github.com/your-username/OntoTradePlatform/wiki)

---

**OntoTradePlatform** - 온톨로지 기반 지능형 투자 시뮬레이션의 미래를 만들어가고 있습니다 🚀
