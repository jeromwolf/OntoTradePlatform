from datetime import datetime

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr

router = APIRouter()


# 기본 스키마 (추후 schemas 폴더로 이동 예정)
class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRegister(BaseModel):
    """사용자 등록 요청 데이터 모델."""

    email: EmailStr
    username: str
    password: str
    confirm_password: str


class Token(BaseModel):
    """인증 토큰 응답 데이터 모델."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


# 테스트용 환경변수에서 가져오기 (프로덕션에서는 실제 인증 구현 필요)
TEST_EMAIL = "test@ontotrade.com"
TEST_PASSWORD = "test_password_123"  # nosec B105
MOCK_ACCESS_TOKEN = "mock_access_token_12345"  # nosec B105
MOCK_REFRESH_TOKEN = "mock_refresh_token_67890"  # nosec B105


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """사용자 로그인."""
    # TODO: 실제 인증 로직 구현 (Supabase 연동)

    # 임시 모의 응답
    if credentials.email == TEST_EMAIL and credentials.password == TEST_PASSWORD:
        return Token(
            access_token=MOCK_ACCESS_TOKEN,
            refresh_token=MOCK_REFRESH_TOKEN,
            expires_in=1800,  # 30분
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="이메일 또는 비밀번호가 올바르지 않습니다.",
        headers={"WWW-Authenticate": "Bearer"},
    )


@router.post("/register")
async def register(user_data: UserRegister):
    """사용자 회원가입."""
    # TODO: 실제 회원가입 로직 구현

    # 비밀번호 확인
    if user_data.password != user_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="비밀번호가 일치하지 않습니다.",
        )

    # 임시 모의 응답
    return JSONResponse(
        {
            "message": "회원가입이 성공적으로 완료되었습니다.",
            "user": {
                "email": user_data.email,
                "username": user_data.username,
                "created_at": datetime.utcnow().isoformat(),
            },
        },
        status_code=status.HTTP_201_CREATED,
    )


@router.post("/refresh")
async def refresh_token():
    """토큰 갱신."""
    # TODO: 실제 토큰 갱신 로직 구현
    return JSONResponse({"access_token": "new_mock_access_token", "expires_in": 1800})


@router.post("/logout")
async def logout():
    """로그아웃."""
    # TODO: 토큰 무효화 로직 구현
    return JSONResponse({"message": "성공적으로 로그아웃되었습니다."})


@router.get("/me")
async def get_current_user():
    """현재 사용자 정보 조회."""
    # TODO: JWT 토큰 검증 및 사용자 정보 반환
    return JSONResponse(
        {
            "id": "user_123",
            "email": "test@ontotrade.com",
            "username": "testuser",
            "virtual_balance": 100000,
            "level": 1,
            "experience": 0,
            "created_at": datetime.utcnow().isoformat(),
        }
    )
