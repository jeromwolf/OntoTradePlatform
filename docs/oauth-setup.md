# OAuth 설정 가이드

## 📋 개요
OntoTrade 플랫폼에서 Google과 Facebook OAuth 로그인을 설정하는 방법을 안내합니다.

## 🔑 Google OAuth 설정

### 1단계: Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
   - 프로젝트 이름: `OntoTrade`
3. **API 및 서비스 > 사용자 인증 정보** 메뉴로 이동
4. **사용자 인증 정보 만들기 > OAuth 클라이언트 ID** 클릭

### 2단계: OAuth 클라이언트 ID 설정
- **애플리케이션 유형**: 웹 애플리케이션
- **이름**: `OntoTrade Web Client`
- **승인된 JavaScript 원본**:
  ```
  http://localhost:5173
  https://qcyfhnsdzvtucnahtvla.supabase.co
  ```
- **승인된 리디렉션 URI**:
  ```
  https://qcyfhnsdzvtucnahtvla.supabase.co/auth/v1/callback
  ```

### 3단계: 클라이언트 ID 복사
생성된 **클라이언트 ID**를 복사하여 보관합니다.

## 📘 Facebook OAuth 설정

### 1단계: Facebook Developers 설정
1. [Facebook Developers](https://developers.facebook.com) 접속
2. **앱 만들기** 클릭
   - 앱 유형: **비즈니스**
   - 앱 이름: `OntoTrade`

### 2단계: Facebook 로그인 추가
1. 생성된 앱에서 **제품 추가** 클릭
2. **Facebook 로그인** 선택 > **설정**
3. **웹** 플랫폼 선택
4. **사이트 URL** 입력:
   ```
   http://localhost:5173
   ```

### 3단계: OAuth 리디렉션 URI 설정
1. **Facebook 로그인 > 설정** 메뉴로 이동
2. **유효한 OAuth 리디렉션 URI** 추가:
   ```
   https://qcyfhnsdzvtucnahtvla.supabase.co/auth/v1/callback
   ```

### 4단계: 앱 ID 복사
**설정 > 기본** 메뉴에서 **앱 ID**를 복사하여 보관합니다.

## 🔧 Supabase OAuth 설정

### 1단계: Supabase 대시보드 접속
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. OntoTrade 프로젝트 선택
3. **Authentication > Providers** 메뉴로 이동

### 2단계: Google 프로바이더 활성화
1. **Google** 프로바이더 클릭
2. **Enable sign in with Google** 토글 활성화
3. **Client ID**: Google에서 복사한 클라이언트 ID 입력
4. **Client Secret**: Google에서 복사한 클라이언트 시크릿 입력
5. **저장** 클릭

### 3단계: Facebook 프로바이더 활성화
1. **Facebook** 프로바이더 클릭
2. **Enable sign in with Facebook** 토글 활성화
3. **App ID**: Facebook에서 복사한 앱 ID 입력
4. **App Secret**: Facebook에서 복사한 앱 시크릿 입력
5. **저장** 클릭

## 💻 프론트엔드 환경 변수 설정

### `.env` 파일 업데이트
```bash
# 기존 설정
VITE_SUPABASE_URL=https://qcyfhnsdzvtucnahtvla.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# OAuth 설정 추가 (선택사항)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_FACEBOOK_APP_ID=your-facebook-app-id
```

> **참고**: OAuth 환경 변수는 선택사항입니다. Supabase에서 OAuth를 관리하므로 프론트엔드에서는 불필요할 수 있습니다.

## 🧪 테스트 방법

### 1. 개발 서버 재시작
```bash
cd frontend
npm run dev
```

### 2. OAuth 로그인 테스트
1. http://localhost:5173/login 접속
2. **Google** 또는 **Facebook** 버튼 클릭
3. 해당 플랫폼의 로그인 페이지로 리디렉션 확인
4. 인증 후 대시보드로 리디렉션 확인

## ⚠️ 문제 해결

### CORS 에러 발생 시
- Supabase 대시보드에서 **Site URL** 설정 확인
- Google/Facebook에서 리디렉션 URI 정확성 확인

### 개발 환경 URL 추가
- Google: `http://localhost:5173`을 JavaScript 원본에 추가
- Facebook: 개발 모드에서 `localhost` 도메인 허용

## 📝 체크리스트

- [ ] Google Cloud Console에서 OAuth 클라이언트 ID 생성
- [ ] Facebook Developers에서 앱 생성 및 설정
- [ ] Supabase에서 Google 프로바이더 활성화
- [ ] Supabase에서 Facebook 프로바이더 활성화
- [ ] 환경 변수 설정 (선택사항)
- [ ] 로컬 개발 서버에서 OAuth 테스트
- [ ] 프로덕션 환경에서 OAuth 테스트

## 🔗 관련 문서
- [Supabase Auth 문서](https://supabase.com/docs/guides/auth)
- [Google OAuth 문서](https://developers.google.com/identity/protocols/oauth2)
- [Facebook 로그인 문서](https://developers.facebook.com/docs/facebook-login/)
