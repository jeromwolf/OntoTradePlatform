"""
모니터링 및 분석 도구 설정
"""

import logging
import os
from typing import Any, Dict, Optional

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.logging import LoggingIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

# 로거 설정
logger = logging.getLogger(__name__)


def init_sentry() -> None:
    """Sentry 초기화"""
    sentry_dsn = os.getenv("SENTRY_DSN")

    if not sentry_dsn:
        logger.warning("SENTRY_DSN이 설정되지 않았습니다.")
        return

    environment = os.getenv("APP_ENV", "development")

    sentry_sdk.init(
        dsn=sentry_dsn,
        environment=environment,
        integrations=[
            FastApiIntegration(auto_enabling_integrations=False),
            SqlalchemyIntegration(),
            LoggingIntegration(level=logging.INFO, event_level=logging.ERROR),
        ],
        # 성능 모니터링
        traces_sample_rate=0.1 if environment == "production" else 1.0,
        # 에러 필터링
        before_send=filter_sensitive_data,
        # 릴리스 정보
        release=os.getenv("APP_VERSION", "unknown"),
        # 추가 태그
        attach_stacktrace=True,
    )

    # 초기 컨텍스트 설정
    with sentry_sdk.configure_scope() as scope:
        scope.set_tag("component", "backend")
        scope.set_tag("service", "ontotrade-api")

    logger.info("Sentry 초기화 완료")


def filter_sensitive_data(
    event: Dict[str, Any], hint: Dict[str, Any]
) -> Optional[Dict[str, Any]]:
    """민감한 데이터 필터링"""
    # 개발 환경에서는 모든 이벤트 허용
    if os.getenv("APP_ENV") != "production":
        return event

    # 민감한 정보가 포함된 에러 필터링
    if "exception" in event:
        for exception in event["exception"]["values"]:
            if exception.get("value"):
                error_msg = exception["value"].lower()
                sensitive_keywords = [
                    "password",
                    "token",
                    "secret",
                    "key",
                    "credential",
                ]

                if any(keyword in error_msg for keyword in sensitive_keywords):
                    logger.warning("민감한 정보가 포함된 에러를 필터링했습니다.")
                    return None

    # 요청 데이터에서 민감한 정보 제거
    if "request" in event:
        request_data = event["request"]

        # 헤더에서 인증 정보 제거
        if "headers" in request_data:
            sensitive_headers = ["authorization", "cookie", "x-api-key"]
            for header in sensitive_headers:
                if header in request_data["headers"]:
                    request_data["headers"][header] = "[Filtered]"

        # 쿼리 파라미터에서 민감한 정보 제거
        if "query_string" in request_data:
            query_string = request_data["query_string"]
            if any(
                param in query_string.lower()
                for param in ["password", "token", "secret"]
            ):
                request_data["query_string"] = "[Filtered]"

    return event


def capture_exception(
    error: Exception, context: Optional[Dict[str, Any]] = None
) -> None:
    """커스텀 예외 캡처"""
    with sentry_sdk.configure_scope() as scope:
        if context:
            for key, value in context.items():
                scope.set_context(key, value)

        sentry_sdk.capture_exception(error)


def capture_message(
    message: str, level: str = "info", context: Optional[Dict[str, Any]] = None
) -> None:
    """커스텀 메시지 캡처"""
    with sentry_sdk.configure_scope() as scope:
        if context:
            for key, value in context.items():
                scope.set_context(key, value)

        sentry_sdk.capture_message(message, level=level)


def set_user_context(
    user_id: str, email: Optional[str] = None, username: Optional[str] = None
) -> None:
    """사용자 컨텍스트 설정"""
    with sentry_sdk.configure_scope() as scope:
        scope.set_user(
            {
                "id": user_id,
                "email": email,
                "username": username,
            }
        )


def add_breadcrumb(
    message: str,
    category: str = "custom",
    level: str = "info",
    data: Optional[Dict[str, Any]] = None,
) -> None:
    """브레드크럼 추가"""
    sentry_sdk.add_breadcrumb(
        message=message, category=category, level=level, data=data or {}
    )


def measure_performance(operation_name: str):
    """성능 측정 데코레이터"""

    def decorator(func):
        def wrapper(*args, **kwargs):
            with sentry_sdk.start_transaction(op="function", name=operation_name):
                return func(*args, **kwargs)

        return wrapper

    return decorator


# 백엔드 이벤트 추적 헬퍼
class BackendAnalytics:
    """백엔드 분석 이벤트 추적"""

    @staticmethod
    def track_api_call(
        endpoint: str, method: str, user_id: Optional[str] = None
    ) -> None:
        """API 호출 추적"""
        add_breadcrumb(
            message=f"API 호출: {method} {endpoint}",
            category="api",
            data={
                "endpoint": endpoint,
                "method": method,
                "user_id": user_id,
            },
        )

    @staticmethod
    def track_database_query(query_type: str, table: str, duration: float) -> None:
        """데이터베이스 쿼리 추적"""
        add_breadcrumb(
            message=f"DB 쿼리: {query_type} on {table}",
            category="database",
            data={
                "query_type": query_type,
                "table": table,
                "duration_ms": duration * 1000,
            },
        )

    @staticmethod
    def track_authentication(event_type: str, user_id: str, success: bool) -> None:
        """인증 이벤트 추적"""
        add_breadcrumb(
            message=f"인증 이벤트: {event_type}",
            category="auth",
            level="info" if success else "warning",
            data={
                "event_type": event_type,
                "user_id": user_id,
                "success": success,
            },
        )

    @staticmethod
    def track_ontology_operation(
        operation: str, ontology_id: str, user_id: str
    ) -> None:
        """온톨로지 작업 추적"""
        add_breadcrumb(
            message=f"온톨로지 작업: {operation}",
            category="ontology",
            data={
                "operation": operation,
                "ontology_id": ontology_id,
                "user_id": user_id,
            },
        )

    @staticmethod
    def track_trade_operation(
        operation: str, trade_id: str, amount: float, user_id: str
    ) -> None:
        """거래 작업 추적"""
        add_breadcrumb(
            message=f"거래 작업: {operation}",
            category="trade",
            data={
                "operation": operation,
                "trade_id": trade_id,
                "amount": amount,
                "user_id": user_id,
            },
        )


# 전역 인스턴스
analytics = BackendAnalytics()
