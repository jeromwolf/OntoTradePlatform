# KIS API 마이그레이션 가이드

## 개요
이 문서는 OntoTradePlatform에서 한국투자증권(KIS) Open API를 통합하기 위한 마이그레이션 가이드입니다.

## 목차
1. [필수 사전 준비사항](#필수-사전-준비사항)
2. [환경 설정](#환경-설정)
3. [인증 흐름](#인증-흐름)
4. [주요 API 엔드포인트](#주요-api-엔드포인트)
5. [에러 처리](#에러-처리)
6. [테스트 전략](#테스트-전략)
7. [모의 투자 환경 연동](#모의-투자-환경-연동)

## 필수 사전 준비사항
- 한국투자증권 계좌 개설
- KIS Developers 계정 생성
- API Key 발급 (REST API, WebSocket)
- 모의투자 신청 (테스트용)

## 환경 설정

### 1. 환경 변수 설정 (`.env`)
```plaintext
# KIS API 인증 정보
KIS_APP_KEY=your_app_key
KIS_APP_SECRET=your_app_secret
KIS_CANO=your_cano
KIS_ACNT_PRDT_CD=your_acnt_prdt_cd

# 운영/모의투자 환경 구분 (true: 모의투자, false: 실거래)
KIS_IS_VIRTUAL_ACCOUNT=true

# 토큰 캐시 설정 (선택사항)
KIS_TOKEN_CACHE_TTL=3600
```

### 2. 백엔드 의존성 설치
```bash
# 필요한 패키지 설치
pip install requests python-dotenv aiohttp
```

## 인증 흐름

### 1. 접근 토큰 발급
```python
async def get_access_token():
    url = "https://openapi.koreainvestment.com:9443/oauth2/tokenP"
    headers = {
        "content-type": "application/json"
    }
    body = {
        "grant_type": "client_credentials",
        "appkey": os.getenv("KIS_APP_KEY"),
        "appsecret": os.getenv("KIS_APP_SECRET")
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=headers, json=body) as response:
            if response.status == 200:
                data = await response.json()
                return data["access_token"]
            else:
                raise Exception("Failed to get access token")
```

## 주요 API 엔드포인트

### 1. 계좌 잔고 조회
```
GET /uapi/domestic-stock/v1/trading/inquire-balance
```

### 2. 주식 현재가 시세
```
GET /uapi/domestic-stock/v1/quotations/inquire-price
```

### 3. 주식 주문
```
POST /uapi/domestic-stock/v1/trading/order-cash
```

## 에러 처리

### 주요 에러 코드
- H0STAPT002: 토큰 만료
- H0STAPT003: 유효하지 않은 토큰
- H0STAPT004: 인증 실패

## 테스트 전략
1. 모의투자 환경에서 모든 API 테스트
2. 단위 테스트 작성
3. 통합 테스트 시나리오 실행
4. 에러 케이스 테스트

## 모의 투자 환경 연동
1. 모의투자 계좌로 전환
2. 가상 자금으로 거래 테스트
3. 실시간 시세 모니터링 테스트
