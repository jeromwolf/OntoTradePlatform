# OntoTrade 플랫폼 보안 가이드

## 🔐 구현된 보안 기능

### 1. 인증 및 세션 관리
- **JWT 토큰 기반 인증**: Supabase Auth를 통한 안전한 토큰 관리
- **자동 토큰 새로고침**: 토큰 만료 5분 전 자동 갱신
- **세션 타임아웃**: 30분 비활성 시 자동 로그아웃
- **안전한 로그아웃**: 모든 세션 데이터 완전 삭제

### 2. 비밀번호 보안
- **강력한 비밀번호 정책**: 최소 8자, 대소문자, 숫자, 특수문자 포함
- **비밀번호 재설정**: 이메일 인증을 통한 안전한 재설정
- **비밀번호 해싱**: Supabase에서 bcrypt 기반 해싱 처리

### 3. OAuth 보안
- **Google OAuth 2.0**: 승인된 도메인 및 리디렉션 URI 설정
- **Facebook OAuth**: 개발 중 (향후 구현 예정)
- **PKCE 플로우**: Authorization Code with PKCE 사용

### 4. API 보안
- **인증된 요청**: 모든 API 요청에 JWT 토큰 포함
- **CORS 정책**: 허용된 도메인에서만 요청 허용
- **Rate Limiting**: 과도한 요청 방지 (Supabase 기본 제공)

### 5. 프론트엔드 보안
- **XSS 방지**: HTML 이스케이프 및 안전한 DOM 조작
- **CSRF 보호**: X-Requested-With 헤더 및 SameSite 쿠키
- **안전한 외부 링크**: `window.opener` 제거
- **입력 검증**: 클라이언트 및 서버 측 이중 검증

### 6. 파일 업로드 보안
- **파일 타입 검증**: 허용된 MIME 타입만 업로드
- **파일 크기 제한**: 최대 5MB 제한
- **안전한 저장소**: Supabase Storage의 RLS 정책 적용

### 7. 데이터베이스 보안
- **Row Level Security (RLS)**: 사용자별 데이터 접근 제어
- **SQL 인젝션 방지**: Supabase의 안전한 쿼리 빌더 사용
- **데이터 암호화**: 저장 및 전송 시 암호화

## 🛡️ 보안 설정

### 환경 변수 보안
```env
# 절대 공개하지 말 것
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Supabase RLS 정책
```sql
-- 프로필 테이블 보안 정책
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- 아바타 스토리지 보안 정책
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 🔧 보안 유틸리티 사용법

### 1. 안전한 API 요청
```typescript
import { useSecureRequest } from '../hooks/useSecureRequest';

const { executeRequest, supabaseRequest } = useSecureRequest();

// 일반 API 요청
const data = await executeRequest('/api/data', {
  method: 'POST',
  body: { key: 'value' }
});

// Supabase 요청
const profiles = await supabaseRequest.select('profiles', { id: userId });
```

### 2. 입력 검증
```typescript
import { validateInput } from '../utils/security';

// 이메일 검증
const isValidEmail = validateInput.email('user@example.com');

// 비밀번호 검증
const passwordCheck = validateInput.password('MyPassword123!');
if (!passwordCheck.isValid) {
  console.log(passwordCheck.errors);
}
```

### 3. 세션 보안
```typescript
import { sessionSecurity } from '../utils/security';

// 세션 만료 체크
const isExpired = sessionSecurity.isSessionExpired(
  sessionSecurity.getLastActivity()
);

// 활동 시간 업데이트
sessionSecurity.updateLastActivity();
```

### 4. 파일 업로드 보안
```typescript
import { fileUploadSecurity } from '../utils/security';

const validation = fileUploadSecurity.validateImageFile(file);
if (!validation.isValid) {
  alert(validation.error);
  return;
}
```

## 🚨 보안 모니터링

### 로그 수집
- 로그인/로그아웃 이벤트
- 실패한 인증 시도
- API 요청 로그
- 오류 및 예외 상황

### 알림 설정
- 비정상적인 로그인 패턴
- 다중 실패한 로그인 시도
- 의심스러운 API 사용 패턴

## 📋 보안 체크리스트

### 배포 전 체크사항
- [ ] 모든 환경 변수가 안전하게 설정됨
- [ ] HTTPS 강제 설정
- [ ] CSP (Content Security Policy) 헤더 설정
- [ ] HSTS (HTTP Strict Transport Security) 설정
- [ ] 불필요한 HTTP 헤더 제거
- [ ] 에러 메시지에서 민감한 정보 제거
- [ ] 로그에서 민감한 정보 마스킹

### 정기 보안 점검
- [ ] 의존성 취약점 스캔
- [ ] 보안 패치 적용
- [ ] 접근 로그 모니터링
- [ ] 침투 테스트 수행

## 🆘 보안 사고 대응

### 1단계: 즉시 대응
1. 영향받은 시스템 격리
2. 추가 피해 방지
3. 증거 보전

### 2단계: 조사 및 분석
1. 사고 원인 분석
2. 영향 범위 파악
3. 복구 계획 수립

### 3단계: 복구 및 개선
1. 시스템 복구
2. 보안 강화 조치
3. 재발 방지 대책 수립

## 📞 연락처
보안 관련 문의나 취약점 신고:
- 이메일: security@ontotrade.com
- 응급상황: +82-10-XXXX-XXXX

---

**마지막 업데이트**: 2025-06-07
**문서 버전**: 1.0
