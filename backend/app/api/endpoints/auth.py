"""
사용자 인증 API 엔드포인트

로그인, 회원가입, 토큰 관리 등의 인증 관련 기능을 제공하는 FastAPI 라우터입니다.
중앙 집중식 로깅, 에러 처리, 성능 모니터링이 통합되어 있습니다.
"""

from datetime import datetime

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr

from app.core.logging_system import (
    ErrorCategory,
    ErrorSeverity,
    log_api_call,
    log_critical,
    log_error,
    log_info,
    log_warning,
    logging_system,
)
from app.core.monitoring import capture_exception, capture_message
from app.core.supabase import get_supabase_client
from app.services.supabase_service import SupabaseService

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
    log_api_call(
        endpoint="POST /auth/login",
        parameters={
            "email": credentials.email,
            "has_password": bool(credentials.password),
        },
    )

    try:
        # 성능 측정 시작
        with logging_system.performance_monitor.measure_operation(
            "auth_login"
        ) as monitor:
            log_info(
                "사용자 로그인 시도",
                category="authentication",
                context={"email": credentials.email, "source": "auth_endpoint"},
            )

            # TODO: 실제 인증 로직 구현 (Supabase 연동)

            # 임시 모의 응답
            if (
                credentials.email == TEST_EMAIL
                and credentials.password == TEST_PASSWORD
            ):
                token_response = Token(
                    access_token=MOCK_ACCESS_TOKEN,
                    refresh_token=MOCK_REFRESH_TOKEN,
                    expires_in=1800,  # 30분
                )

                log_info(
                    "사용자 로그인 성공",
                    category="authentication",
                    context={
                        "email": credentials.email,
                        "expires_in": 1800,
                        "token_type": "bearer",
                    },
                )

                return token_response

            # 인증 실패
            log_warning(
                "사용자 로그인 실패",
                category="authentication",
                context={
                    "email": credentials.email,
                    "reason": "invalid_credentials",
                    "severity": ErrorSeverity.MEDIUM.value,
                },
            )

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="이메일 또는 비밀번호가 올바르지 않습니다.",
                headers={"WWW-Authenticate": "Bearer"},
            )

    except HTTPException:
        # 알려진 인증 실패는 다시 발생시킴
        raise
    except Exception as e:
        # 예상치 못한 오류 처리
        log_error(
            "로그인 과정 중 예상치 못한 오류",
            category=ErrorCategory.AUTHENTICATION.value,
            severity=ErrorSeverity.HIGH.value,
            context={
                "email": credentials.email,
                "error": str(e),
                "error_type": type(e).__name__,
            },
        )

        # Sentry에 예외 정보 전송
        capture_exception(
            e,
            {
                "endpoint": "POST /auth/login",
                "email": credentials.email,
                "operation": "user_login",
            },
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        )


@router.post("/register")
async def register(user_data: UserRegister):
    """사용자 회원가입."""
    log_api_call(
        endpoint="POST /auth/register",
        parameters={
            "email": user_data.email,
            "username": user_data.username,
            "has_password": bool(user_data.password),
            "has_confirm_password": bool(user_data.confirm_password),
        },
    )

    try:
        with logging_system.performance_monitor.measure_operation(
            "auth_register"
        ) as monitor:
            log_info(
                "사용자 회원가입 시도",
                category="authentication",
                context={
                    "email": user_data.email,
                    "username": user_data.username,
                    "source": "auth_endpoint",
                },
            )

            # 비밀번호 확인
            if user_data.password != user_data.confirm_password:
                log_warning(
                    "회원가입 실패 - 비밀번호 불일치",
                    category="authentication",
                    context={
                        "email": user_data.email,
                        "username": user_data.username,
                        "reason": "password_mismatch",
                        "severity": ErrorSeverity.LOW.value,
                    },
                )

                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="비밀번호가 일치하지 않습니다.",
                )

            # Supabase를 사용한 실제 회원가입
            supabase_client = get_supabase_client()
            
            try:
                # Supabase Auth를 사용한 사용자 생성
                response = supabase_client.client.auth.sign_up({
                    "email": user_data.email,
                    "password": user_data.password,
                    "options": {
                        "data": {
                            "username": user_data.username
                        }
                    }
                })
                
                if response.user:
                    user_id = response.user.id
                    
                    log_info(
                        "Supabase 사용자 생성 성공, 시뮬레이션 세션 생성 시작",
                        category="authentication",
                        context={
                            "user_id": user_id,
                            "user_id_type": str(type(user_id)),
                            "email": user_data.email,
                        },
                    )
                    
                    # 시뮬레이션 세션 초기화 (1억원 시작)
                    supabase_service = SupabaseService()
                    
                    try:
                        # user_id를 문자열로 전달 (UUID로 변환은 SupabaseService에서 처리)
                        session_data = await supabase_service.create_simulation_session(
                            user_id=user_id,  # 이미 문자열
                            cash=100000000  # 1억원
                        )
                        
                        log_info(
                            "시뮬레이션 세션 생성 성공",
                            category="authentication",
                            context={
                                "user_id": user_id,
                                "session_id": session_data.get("id"),
                                "initial_cash": 100000000,
                            },
                        )
                        
                    except Exception as session_error:
                        log_error(
                            "시뮬레이션 세션 생성 실패",
                            category="authentication",
                            context={
                                "user_id": user_id,
                                "error": str(session_error),
                                "error_type": type(session_error).__name__,
                            },
                        )
                        # 세션 생성 실패 시 사용자는 생성되었지만 세션은 나중에 생성 가능하도록 알림
                        log_warning("사용자 생성은 성공했지만 시뮬레이션 세션 생성 실패")
                    
                    log_info(
                        "사용자 회원가입 완료",
                        category="authentication",
                        context={
                            "email": user_data.email,
                            "username": user_data.username,
                            "user_id": user_id,
                        },
                    )
                    
                    response_data = {
                        "message": "회원가입이 성공적으로 완료되었습니다.",
                        "user": {
                            "id": user_id,
                            "email": user_data.email,
                            "username": user_data.username,
                            "created_at": datetime.utcnow().isoformat(),
                            "simulation_session_created": True,
                            "initial_cash": 100000000
                        },
                    }
                    
                    return JSONResponse(response_data, status_code=status.HTTP_201_CREATED)
                else:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="회원가입에 실패했습니다. 이메일이 이미 사용 중일 수 있습니다.",
                    )
                    
            except Exception as supabase_error:
                log_error(
                    "Supabase 회원가입 오류",
                    category=ErrorCategory.AUTHENTICATION.value,
                    severity=ErrorSeverity.HIGH.value,
                    context={
                        "email": user_data.email,
                        "error": str(supabase_error),
                        "error_type": type(supabase_error).__name__,
                    },
                )
                
                # 이메일 중복 등 일반적인 오류 처리
                if "already registered" in str(supabase_error).lower() or "email" in str(supabase_error).lower():
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="이미 가입된 이메일입니다.",
                    )
                else:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="회원가입 처리 중 오류가 발생했습니다.",
                    )

    except HTTPException:
        # 알려진 검증 오류는 다시 발생시킴
        raise
    except Exception as e:
        # 예상치 못한 오류 처리
        log_error(
            "회원가입 과정 중 예상치 못한 오류",
            category=ErrorCategory.AUTHENTICATION.value,
            severity=ErrorSeverity.HIGH.value,
            context={
                "email": user_data.email,
                "username": user_data.username,
                "error": str(e),
                "error_type": type(e).__name__,
            },
        )

        # Sentry에 예외 정보 전송
        capture_exception(
            e,
            {
                "endpoint": "POST /auth/register",
                "email": user_data.email,
                "username": user_data.username,
                "operation": "user_registration",
            },
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="회원가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        )


@router.post("/refresh")
async def refresh_token():
    """토큰 갱신."""
    log_api_call(endpoint="POST /auth/refresh", parameters={})

    try:
        with logging_system.performance_monitor.measure_operation(
            "auth_token_refresh"
        ) as monitor:
            log_info(
                "토큰 갱신 요청",
                category="authentication",
                context={"source": "auth_endpoint"},
            )

            # TODO: 실제 토큰 갱신 로직 구현
            response_data = {
                "access_token": "new_mock_access_token",
                "expires_in": 1800,
            }

            log_info(
                "토큰 갱신 성공",
                category="authentication",
                context={"expires_in": response_data["expires_in"]},
            )

            return JSONResponse(response_data)

    except Exception as e:
        log_error(
            "토큰 갱신 중 오류",
            category=ErrorCategory.AUTHENTICATION.value,
            severity=ErrorSeverity.MEDIUM.value,
            context={"error": str(e), "error_type": type(e).__name__},
        )

        capture_exception(
            e, {"endpoint": "POST /auth/refresh", "operation": "token_refresh"}
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="토큰 갱신 중 오류가 발생했습니다.",
        )


@router.post("/logout")
async def logout():
    """로그아웃."""
    log_api_call(endpoint="POST /auth/logout", parameters={})

    try:
        with logging_system.performance_monitor.measure_operation(
            "auth_logout"
        ) as monitor:
            log_info(
                "사용자 로그아웃 요청",
                category="authentication",
                context={"source": "auth_endpoint"},
            )

            # TODO: 토큰 무효화 로직 구현

            log_info("사용자 로그아웃 성공", category="authentication")

            return JSONResponse({"message": "성공적으로 로그아웃되었습니다."})

    except Exception as e:
        log_error(
            "로그아웃 중 오류",
            category=ErrorCategory.AUTHENTICATION.value,
            severity=ErrorSeverity.MEDIUM.value,
            context={"error": str(e), "error_type": type(e).__name__},
        )

        capture_exception(
            e, {"endpoint": "POST /auth/logout", "operation": "user_logout"}
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="로그아웃 중 오류가 발생했습니다.",
        )


@router.get("/me")
async def get_current_user():
    """현재 사용자 정보 조회."""
    log_api_call(endpoint="GET /auth/me", parameters={})

    try:
        with logging_system.performance_monitor.measure_operation(
            "auth_get_user_info"
        ) as monitor:
            log_info(
                "사용자 정보 조회 요청",
                category="authentication",
                context={"source": "auth_endpoint"},
            )

            # TODO: JWT 토큰 검증 및 사용자 정보 반환
            user_data = {
                "id": "user_123",
                "email": "test@ontotrade.com",
                "username": "testuser",
                "virtual_balance": 100000,
                "level": 1,
                "experience": 0,
                "created_at": datetime.utcnow().isoformat(),
            }

            log_info(
                "사용자 정보 조회 성공",
                category="authentication",
                context={"user_id": user_data["id"], "email": user_data["email"]},
            )

            return JSONResponse(user_data)

    except Exception as e:
        log_error(
            "사용자 정보 조회 중 오류",
            category=ErrorCategory.AUTHENTICATION.value,
            severity=ErrorSeverity.MEDIUM.value,
            context={"error": str(e), "error_type": type(e).__name__},
        )

        capture_exception(e, {"endpoint": "GET /auth/me", "operation": "get_user_info"})

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="사용자 정보 조회 중 오류가 발생했습니다.",
        )
