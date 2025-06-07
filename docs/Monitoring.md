# 모니터링 및 분석 도구 가이드

OntoTrade 플랫폼은 Sentry를 통한 에러 추적과 PostHog를 이용한 사용자 분석을 통합하여 운영 중인 서비스를 모니터링하고 개선점을 찾을 수 있습니다.

## 📊 도구 개요

### Sentry (에러 추적)
- **목적**: 프론트엔드와 백엔드의 에러 추적 및 성능 모니터링
- **기능**:
  - 실시간 에러 알림
  - 에러 스택 트레이스 추적
  - 성능 병목점 식별
  - 릴리스 추적
  - 사용자 피드백 수집

### PostHog (사용자 분석)
- **목적**: 사용자 행동 분석 및 제품 개선 인사이트
- **기능**:
  - 이벤트 추적
  - 퍼널 분석
  - A/B 테스트
  - 세션 리플레이
  - 기능 플래그

## 🔧 설정 방법

### 1. 환경 변수 설정

`.env` 파일에 다음 변수들을 설정하세요:

```env
# Sentry 설정
SENTRY_DSN=your_sentry_project_dsn
VITE_SENTRY_DSN=your_frontend_sentry_dsn

# PostHog 설정
VITE_POSTHOG_KEY=your_posthog_project_key
VITE_POSTHOG_HOST=https://app.posthog.com

# 환경 구분
VITE_APP_ENV=production  # development/staging/production
```

### 2. Sentry 프로젝트 설정

1. [Sentry.io](https://sentry.io)에서 계정 생성
2. 새 프로젝트 생성 (React 및 Python 프로젝트 각각)
3. DSN 복사하여 환경 변수에 설정
4. 팀 멤버 초대 및 알림 설정

### 3. PostHog 프로젝트 설정

1. [PostHog](https://posthog.com)에서 계정 생성
2. 새 프로젝트 생성
3. API 키 복사하여 환경 변수에 설정
4. 대시보드 및 인사이트 설정

## 🎯 사용법

### 프론트엔드 에러 추적

```typescript
import { reportError, trackEvent, setUser } from './utils/sentry';

// 에러 수동 보고
try {
  // 위험한 작업
} catch (error) {
  reportError(error as Error, {
    component: 'ComponentName',
    action: 'specificAction',
    userId: currentUser.id,
  });
}

// 사용자 컨텍스트 설정
setUser({
  id: user.id,
  email: user.email,
  username: user.username,
});

// 커스텀 이벤트 추적
trackEvent('button_clicked', {
  buttonName: 'create-ontology',
  location: 'dashboard',
});
```

### 백엔드 에러 추적

```python
from app.core.monitoring import capture_exception, set_user_context, analytics

# 에러 수동 캡처
try:
    # 위험한 작업
    pass
except Exception as e:
    capture_exception(e, context={
        'function': 'function_name',
        'user_id': user_id,
        'request_id': request_id,
    })

# 사용자 컨텍스트 설정
set_user_context(
    user_id=str(user.id),
    email=user.email,
    username=user.username
)

# 비즈니스 이벤트 추적
analytics.track_ontology_operation(
    operation='created',
    ontology_id='onto-123',
    user_id='user-456'
)
```

### PostHog 사용자 분석

```typescript
import { analytics, identifyUser, setUserProperties } from './utils/posthog';

// 사용자 식별
identifyUser(user.id, {
  email: user.email,
  plan: user.subscription.plan,
  signupDate: user.createdAt,
});

// 사용자 속성 업데이트
setUserProperties({
  lastActiveDate: new Date().toISOString(),
  totalOntologies: user.ontologyCount,
});

// 비즈니스 이벤트 추적
analytics.trackOntologyCreated('investment-strategy');
analytics.trackTradeCompleted('trade-123', 1500);
analytics.trackSearch('machine learning', 42);
```

## 📈 주요 추적 이벤트

### 사용자 행동
- `user_signed_up`: 회원가입
- `user_signed_in`: 로그인
- `user_signed_out`: 로그아웃

### 온톨로지 관련
- `ontology_created`: 온톨로지 생성
- `ontology_viewed`: 온톨로지 조회
- `ontology_shared`: 온톨로지 공유
- `ontology_exported`: 온톨로지 내보내기

### 거래 관련
- `trade_initiated`: 거래 시작
- `trade_completed`: 거래 완료
- `trade_cancelled`: 거래 취소

### 검색 및 필터
- `search_performed`: 검색 실행
- `filter_used`: 필터 사용
- `sort_changed`: 정렬 변경

## 🔍 대시보드 및 알림

### Sentry 알림 설정

1. **이슈 알림**: 새로운 에러 발생 시 Slack/이메일 알림
2. **성능 알림**: 응답 시간 임계값 초과 시 알림
3. **릴리스 알림**: 새 배포 시 에러율 모니터링

### PostHog 대시보드

1. **사용자 활동**: DAU, WAU, MAU 추적
2. **기능 사용률**: 각 기능별 사용 빈도
3. **퍼널 분석**: 회원가입부터 거래까지의 전환율
4. **코호트 분석**: 사용자 유지율 추적

## 🚨 트러블슈팅

### Sentry 관련 이슈

**문제**: Sentry에 에러가 전송되지 않음
```bash
# 환경 변수 확인
echo $SENTRY_DSN
echo $VITE_SENTRY_DSN

# 네트워크 연결 확인
curl -I https://sentry.io
```

**해결책**:
1. DSN이 올바르게 설정되었는지 확인
2. 방화벽에서 Sentry 도메인 허용
3. 개발 환경에서는 모든 에러가 전송되는지 확인

### PostHog 관련 이슈

**문제**: 이벤트가 PostHog에 나타나지 않음
```bash
# 브라우저 개발자 도구에서 PostHog 요청 확인
# Network 탭에서 posthog.com 요청 확인
```

**해결책**:
1. API 키가 올바른지 확인
2. 광고 차단기가 PostHog를 블록하는지 확인
3. 개발 환경에서는 `disabled: false`로 설정

## 📊 성능 최적화

### Sentry 최적화
- **샘플링 비율**: 프로덕션에서는 10% 샘플링 사용
- **민감 정보 필터링**: 비밀번호, 토큰 등 자동 필터링
- **에러 그룹핑**: 유사한 에러들을 그룹으로 관리

### PostHog 최적화
- **이벤트 배치**: 여러 이벤트를 배치로 전송
- **세션 녹화**: 프로덕션에서만 활성화
- **익명화**: 민감한 사용자 정보 마스킹

## 🔒 개인정보 보호

### 데이터 수집 원칙
- **최소 수집**: 필요한 데이터만 수집
- **투명성**: 사용자에게 수집 내용 공지
- **동의**: 분석 데이터 수집에 대한 사용자 동의

### GDPR 준수
```typescript
// 사용자 동의 확인 후 추적 시작
if (userConsent.analytics) {
  initPostHog();
  analytics.trackPageView('dashboard');
}

// 데이터 삭제 요청 처리
export function deleteUserData(userId: string) {
  posthog.reset();
  // Sentry에서 사용자 데이터 제거 요청
}
```

## 📝 베스트 프랙티스

1. **의미 있는 이벤트**: 비즈니스 가치가 있는 이벤트만 추적
2. **일관된 명명**: 이벤트와 속성에 일관된 명명 규칙 사용
3. **컨텍스트 제공**: 에러 발생 시 충분한 컨텍스트 정보 포함
4. **정기적 검토**: 대시보드와 알림을 정기적으로 검토하고 개선
5. **팀 교육**: 팀 전체가 모니터링 도구 사용법을 숙지

## 🔗 참고 자료

- [Sentry React 문서](https://docs.sentry.io/platforms/javascript/react/)
- [Sentry Python 문서](https://docs.sentry.io/platforms/python/)
- [PostHog React 문서](https://posthog.com/docs/libraries/react)
- [PostHog Python 문서](https://posthog.com/docs/libraries/python)
