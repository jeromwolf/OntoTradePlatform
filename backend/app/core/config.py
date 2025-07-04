"""OntoTrade 백엔드 애플리케이션 설정 모듈."""

from typing import List, Optional, Union

from pydantic import validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """OntoTrade 백엔드 애플리케이션 설정."""

    # 애플리케이션 기본 설정
    PROJECT_NAME: str = "OntoTrade API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"  # API 버전 접두사
    DEBUG: Optional[bool] = False

    # 서버 설정 (개발용으로 localhost 사용)
    HOST: str = "127.0.0.1"
    PORT: int = 8000

    # CORS 설정
    ALLOWED_HOSTS: List[str] = [
        "http://localhost:3000",  # React 기본 포트
        "http://localhost:5173",  # Vite 기본 포트
        "http://localhost:5174",  # Vite 대체 포트 1
        "http://localhost:5175",  # Vite 대체 포트 2
        "http://localhost:5176",  # Vite 대체 포트 3
        "http://localhost:5177",  # Vite 대체 포트 4
        "http://localhost:5178",  # Vite 대체 포트 5
        "http://localhost:5179",  # Vite 대체 포트 6
        "http://localhost:5180",  # 새로운 Vite 개발 서버 포트
        "http://127.0.0.1:3000",  # localhost 대신 127.0.0.1
        "http://127.0.0.1:5173",  # Vite 127.0.0.1 포트
        "http://127.0.0.1:5174",  # Vite 127.0.0.1 포트
        "http://127.0.0.1:5175",  # Vite 127.0.0.1 포트
        "http://127.0.0.1:5176",  # Vite 127.0.0.1 포트
        "http://127.0.0.1:5177",  # Vite 127.0.0.1 포트
        "http://127.0.0.1:5178",  # Vite 127.0.0.1 포트
        "http://127.0.0.1:5179",  # Vite 127.0.0.1 포트
        "http://127.0.0.1:5180",  # 새로운 Vite 개발 서버 포트
        "https://ontotrade.vercel.app",  # 프로덕션 프론트엔드
        "https://www.ontotrade.com",  # 커스텀 도메인 (미래)
        "*",  # 개발 중 모든 오리진 허용
    ]

    # 데이터베이스 설정
    DATABASE_URL: str = "sqlite:///./ontotrade.db"
    DATABASE_CONNECT_DICT: dict = {}

    # JWT 설정
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Redis 설정 (캐싱 및 세션)
    REDIS_URL: str = "redis://localhost:6379"

    # 외부 API 설정
    ALPHA_VANTAGE_API_KEY: str = ""
    YAHOO_FINANCE_API_KEY: str = ""

    # Supabase 설정
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""

    # 로깅 설정
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    # 보안 설정
    BCRYPT_ROUNDS: int = 12

    # 파일 업로드 설정
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_FOLDER: str = "uploads"

    @validator("DEBUG", pre=True)
    def parse_debug(cls, v) -> bool:
        """DEBUG 값을 불린으로 파싱합니다."""
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            return v.lower() in ("true", "1", "yes", "on")
        return False

    @validator("ALLOWED_HOSTS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        """CORS 허용 목록을 검증하고 설정합니다."""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    class Config:
        """Pydantic 설정 클래스."""

        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # 추가 환경변수 무시


# 전역 설정 인스턴스
settings = Settings()
