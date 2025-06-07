# 사용자 프로필 관리 기능 설정 가이드

## 구현된 기능 

### 1. 프로필 페이지 컴포넌트
- **위치**: `frontend/src/pages/ProfilePage.tsx`
- **기능**:
  - 사용자 프로필 정보 조회 및 표시
  - 프로필 편집 모드 토글
  - 실시간 아바타 이미지 업로드
  - 폼 데이터 검증 및 업데이트
  - 에러 상태 관리 및 사용자 피드백

### 2. 라우팅 설정
- **파일**: `frontend/src/App.tsx`
- **추가된 라우트**: `/profile` (보호된 라우트)
- **네비게이션**: 대시보드 상단에 프로필 링크 추가

### 3. 데이터베이스 스키마
- **파일**: `database/create_profiles_table.sql`
- **테이블**: `profiles`
- **스토리지**: `avatars` 버킷
- **보안**: RLS 정책 및 사용자별 접근 제어

## 필수 설정 단계

### 1. Supabase 데이터베이스 설정
1. Supabase Dashboard 접속
2. SQL Editor로 이동
3. `database/create_profiles_table.sql` 파일 내용을 복사하여 실행
4. 다음 구조가 생성됩니다:
   - `profiles` 테이블 (사용자 프로필 정보)
   - `avatars` 스토리지 버킷 (프로필 이미지)
   - RLS 정책 (행 레벨 보안)
   - 자동 프로필 생성 트리거

### 2. 환경변수 확인
현재 설정된 환경변수들:
```env
VITE_SUPABASE_URL=https://qcyfhnsdzvtucnahtvla.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_key>
VITE_GOOGLE_CLIENT_ID=<google_client_id>
VITE_FACEBOOK_APP_ID=<facebook_app_id>
```

## 프로필 기능 사용 방법

### 1. 프로필 조회
1. 로그인 후 상단 네비게이션에서 "프로필" 클릭
2. 자동으로 프로필 정보가 로드됨
3. 프로필이 없으면 기본 프로필이 자동 생성됨

### 2. 프로필 편집
1. 프로필 페이지에서 "편집" 버튼 클릭
2. 다음 필드들을 수정 가능:
   - 전체 이름 (Full Name)
   - 웹사이트 URL
   - 자기소개 (Bio)
3. "저장" 버튼으로 변경사항 저장

### 3. 아바타 업로드
1. 편집 모드에서 아바타 이미지 클릭
2. 파일 선택 대화상자에서 이미지 선택
3. 자동으로 Supabase Storage에 업로드
4. 실시간으로 프로필에 반영

## 기술적 세부사항

### 데이터 구조
```typescript
interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  website?: string;
  bio?: string;
  updated_at?: string;
}
```

### API 엔드포인트
- **조회**: `GET /profiles?id=eq.{user_id}`
- **업데이트**: `POST /profiles` (upsert)
- **아바타 업로드**: `POST /storage/v1/object/avatars/{filename}`

### 보안 정책
- 사용자는 자신의 프로필만 조회/수정 가능
- 아바타 파일은 사용자별로 분리된 폴더에 저장
- 모든 데이터베이스 작업에 RLS 적용

## 🔐 보안 기능

### 비밀번호 재설정
- **재설정 요청**: `/reset-password` 페이지에서 이메일 입력
- **이메일 확인**: Supabase가 자동으로 재설정 링크 전송
- **새 비밀번호 설정**: `/reset-password-confirm` 페이지에서 새 비밀번호 입력
- **보안 검증**: 강력한 비밀번호 정책 적용

### 토큰 관리
- **자동 새로고침**: 토큰 만료 5분 전 자동 갱신
- **세션 모니터링**: 30분 비활성 시 자동 로그아웃
- **활동 추적**: 마우스, 키보드, 스크롤 등 사용자 활동 감지

### 보안 강화 기능
- **안전한 로그아웃**: 모든 로컬 데이터 및 캐시 완전 삭제
- **입력 검증**: 이메일, 비밀번호, URL 등 클라이언트 측 검증
- **파일 업로드 보안**: 파일 타입 및 크기 제한
- **XSS/CSRF 방지**: HTML 이스케이프 및 보안 헤더 적용

### 보안 유틸리티
- `src/utils/security.ts`: 보안 관련 유틸리티 함수 모음
- `src/hooks/useSecureRequest.ts`: 보안이 강화된 API 요청 훅
- `src/components/SessionMonitor.tsx`: 세션 활동 모니터링 컴포넌트

## 다음 단계

### 추가 기능 구현 예정
1. **사용자 역할 관리**: 관리자, 일반 사용자 구분
2. **프로필 검증**: 이메일 인증, 프로필 완성도 체크
3. **소셜 로그인 프로필 동기화**: Google, Facebook 프로필 정보 자동 가져오기
4. **프로필 이미지 리사이징**: 자동 크기 조정 및 최적화
5. **활동 로그**: 프로필 변경 이력 추적

### 테스트 시나리오
1. ✅ 새 사용자 회원가입 시 기본 프로필 생성
2. ✅ 로그인 후 프로필 페이지 접근
3. ✅ 프로필 정보 편집 및 저장
4. ✅ 아바타 이미지 업로드
5. ⏳ 다른 사용자 프로필 접근 차단 (보안 테스트)
6. ⏳ 로그아웃 후 프로필 페이지 접근 차단

## 문제 해결

### 일반적인 문제들
1. **프로필 로딩 실패**: Supabase 연결 상태 확인
2. **아바타 업로드 실패**: Storage 버킷 설정 및 정책 확인
3. **권한 오류**: RLS 정책이 올바르게 설정되었는지 확인
4. **라우팅 문제**: React Router 설정 확인

### 디버깅 도구
- 브라우저 개발자 도구 Network 탭
- Supabase Dashboard > Authentication > Users
- Supabase Dashboard > Database > Tables
- Supabase Dashboard > Storage > avatars

---

**구현 상태**: ✅ 완료 (2024년 기준)
**테스트 필요**: Supabase 설정 후 전체 기능 테스트
**다음 우선순위**: Google OAuth 완료 및 사용자 역할 관리
