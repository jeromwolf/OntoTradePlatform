"""
자동 오류 복구 및 헬스체크 시스템

이 모듈은 시스템 장애에 대한 자동 복구 메커니즘과 헬스체크 기능을 제공합니다.
"""

import asyncio
import json
import time
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Callable, Dict, List, Optional, Union
from dataclasses import dataclass, asdict
import aiohttp
import psutil
from contextlib import asynccontextmanager

from app.core.logging_system import (
    logging_system, log_info, log_warning, log_error, log_critical,
    ErrorCategory, ErrorSeverity
)


class ServiceStatus(Enum):
    """서비스 상태 정의"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"


class RecoveryAction(Enum):
    """복구 액션 타입"""
    RESTART_SERVICE = "restart_service"
    CLEAR_CACHE = "clear_cache"
    RECONNECT = "reconnect"
    WAIT_AND_RETRY = "wait_and_retry"
    FALLBACK_MODE = "fallback_mode"
    CIRCUIT_BREAKER = "circuit_breaker"
    SCALE_UP = "scale_up"
    ALERT_ADMIN = "alert_admin"


@dataclass
class HealthCheck:
    """헬스체크 결과"""
    service_name: str
    status: ServiceStatus
    response_time_ms: float
    timestamp: datetime
    details: Dict[str, Any]
    error_message: Optional[str] = None


@dataclass
class RecoveryStrategy:
    """복구 전략 정의"""
    name: str
    actions: List[RecoveryAction]
    max_attempts: int
    delay_seconds: float
    success_condition: Callable[[], bool]
    fallback_strategy: Optional[str] = None


@dataclass
class ServiceHealth:
    """서비스 헬스 상태"""
    service_name: str
    current_status: ServiceStatus
    last_check: datetime
    consecutive_failures: int
    total_checks: int
    success_rate: float
    average_response_time: float
    recent_checks: List[HealthCheck]


class CircuitBreaker:
    """서킷 브레이커 패턴 구현"""
    
    def __init__(
        self,
        name: str,
        failure_threshold: int = 5,
        recovery_timeout: int = 60,
        expected_exception: Exception = Exception
    ):
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.expected_exception = expected_exception
        
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "closed"  # closed, open, half-open
    
    async def call(self, func: Callable, *args, **kwargs):
        """서킷 브레이커를 통한 함수 호출"""
        if self.state == "open":
            if self._should_attempt_reset():
                self.state = "half-open"
                log_info(f"서킷 브레이커 반개방: {self.name}")
            else:
                raise Exception(f"서킷 브레이커 개방 상태: {self.name}")
        
        try:
            result = await func(*args, **kwargs) if asyncio.iscoroutinefunction(func) else func(*args, **kwargs)
            self._on_success()
            return result
        except self.expected_exception as e:
            self._on_failure()
            raise e
    
    def _should_attempt_reset(self) -> bool:
        """리셋 시도 여부 확인"""
        return (
            self.last_failure_time and
            time.time() - self.last_failure_time >= self.recovery_timeout
        )
    
    def _on_success(self) -> None:
        """성공 시 처리"""
        self.failure_count = 0
        if self.state == "half-open":
            self.state = "closed"
            log_info(f"서킷 브레이커 정상화: {self.name}")
    
    def _on_failure(self) -> None:
        """실패 시 처리"""
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.failure_count >= self.failure_threshold:
            self.state = "open"
            log_error(
                f"서킷 브레이커 개방: {self.name}",
                category=ErrorCategory.SYSTEM_ERROR,
                severity=ErrorSeverity.HIGH,
                context={
                    "failure_count": self.failure_count,
                    "threshold": self.failure_threshold
                }
            )


class ErrorRecoverySystem:
    """오류 복구 시스템"""
    
    def __init__(self):
        self.services: Dict[str, ServiceHealth] = {}
        self.recovery_strategies: Dict[str, RecoveryStrategy] = {}
        self.circuit_breakers: Dict[str, CircuitBreaker] = {}
        self.monitoring_active = False
        self.monitoring_interval = 30  # 30초마다 헬스체크
        
        self._setup_default_strategies()
        self._setup_circuit_breakers()
    
    def _setup_default_strategies(self) -> None:
        """기본 복구 전략 설정"""
        
        # API 서비스 복구 전략
        self.recovery_strategies["api_service"] = RecoveryStrategy(
            name="API 서비스 복구",
            actions=[
                RecoveryAction.WAIT_AND_RETRY,
                RecoveryAction.CLEAR_CACHE,
                RecoveryAction.RECONNECT,
                RecoveryAction.FALLBACK_MODE
            ],
            max_attempts=3,
            delay_seconds=5.0,
            success_condition=lambda: True,  # 실제 조건으로 대체 예정
            fallback_strategy="fallback_api"
        )
        
        # 데이터베이스 복구 전략
        self.recovery_strategies["database"] = RecoveryStrategy(
            name="데이터베이스 복구",
            actions=[
                RecoveryAction.WAIT_AND_RETRY,
                RecoveryAction.RECONNECT,
                RecoveryAction.CIRCUIT_BREAKER
            ],
            max_attempts=5,
            delay_seconds=10.0,
            success_condition=lambda: True,
            fallback_strategy="read_only_mode"
        )
        
        # WebSocket 복구 전략
        self.recovery_strategies["websocket"] = RecoveryStrategy(
            name="WebSocket 복구",
            actions=[
                RecoveryAction.RECONNECT,
                RecoveryAction.WAIT_AND_RETRY,
                RecoveryAction.RESTART_SERVICE
            ],
            max_attempts=3,
            delay_seconds=3.0,
            success_condition=lambda: True
        )
        
        # 외부 API 복구 전략
        self.recovery_strategies["external_api"] = RecoveryStrategy(
            name="외부 API 복구",
            actions=[
                RecoveryAction.WAIT_AND_RETRY,
                RecoveryAction.CIRCUIT_BREAKER,
                RecoveryAction.FALLBACK_MODE
            ],
            max_attempts=3,
            delay_seconds=15.0,
            success_condition=lambda: True,
            fallback_strategy="cached_data"
        )
    
    def _setup_circuit_breakers(self) -> None:
        """서킷 브레이커 설정"""
        self.circuit_breakers["stock_api"] = CircuitBreaker(
            name="Stock API",
            failure_threshold=5,
            recovery_timeout=300,  # 5분
            expected_exception=aiohttp.ClientError
        )
        
        self.circuit_breakers["database"] = CircuitBreaker(
            name="Database",
            failure_threshold=3,
            recovery_timeout=60,  # 1분
            expected_exception=Exception
        )
        
        self.circuit_breakers["websocket"] = CircuitBreaker(
            name="WebSocket",
            failure_threshold=5,
            recovery_timeout=30,  # 30초
            expected_exception=Exception
        )
    
    def register_service(self, service_name: str, check_function: Callable) -> None:
        """서비스 등록"""
        self.services[service_name] = ServiceHealth(
            service_name=service_name,
            current_status=ServiceStatus.UNKNOWN,
            last_check=datetime.now(),
            consecutive_failures=0,
            total_checks=0,
            success_rate=0.0,
            average_response_time=0.0,
            recent_checks=[]
        )
        
        log_info(f"서비스 등록: {service_name}")
    
    async def check_service_health(self, service_name: str) -> HealthCheck:
        """개별 서비스 헬스체크"""
        start_time = time.time()
        
        try:
            # 서비스별 헬스체크 로직
            if service_name == "database":
                result = await self._check_database_health()
            elif service_name == "stock_api":
                result = await self._check_stock_api_health()
            elif service_name == "websocket":
                result = await self._check_websocket_health()
            elif service_name == "system":
                result = await self._check_system_health()
            else:
                result = HealthCheck(
                    service_name=service_name,
                    status=ServiceStatus.UNKNOWN,
                    response_time_ms=0,
                    timestamp=datetime.now(),
                    details={"error": "Unknown service"}
                )
            
            response_time = (time.time() - start_time) * 1000
            result.response_time_ms = response_time
            
            # 서비스 상태 업데이트
            self._update_service_health(service_name, result)
            
            return result
        
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            
            error_result = HealthCheck(
                service_name=service_name,
                status=ServiceStatus.UNHEALTHY,
                response_time_ms=response_time,
                timestamp=datetime.now(),
                details={"error": str(e)},
                error_message=str(e)
            )
            
            self._update_service_health(service_name, error_result)
            return error_result
    
    async def _check_database_health(self) -> HealthCheck:
        """데이터베이스 헬스체크"""
        try:
            # 실제 DB 연결 테스트 (추후 구현)
            await asyncio.sleep(0.1)  # 모의 지연
            
            return HealthCheck(
                service_name="database",
                status=ServiceStatus.HEALTHY,
                response_time_ms=0,
                timestamp=datetime.now(),
                details={
                    "connection_pool": "available",
                    "active_connections": 5,
                    "max_connections": 20
                }
            )
        except Exception as e:
            return HealthCheck(
                service_name="database",
                status=ServiceStatus.UNHEALTHY,
                response_time_ms=0,
                timestamp=datetime.now(),
                details={},
                error_message=str(e)
            )
    
    async def _check_stock_api_health(self) -> HealthCheck:
        """주식 API 헬스체크"""
        try:
            # Alpha Vantage API 상태 확인
            async with aiohttp.ClientSession() as session:
                url = "https://www.alphavantage.co/query"
                params = {
                    "function": "GLOBAL_QUOTE",
                    "symbol": "AAPL",
                    "apikey": "demo"
                }
                
                async with session.get(url, params=params, timeout=10) as response:
                    if response.status == 200:
                        data = await response.json()
                        if "Error Message" not in data:
                            return HealthCheck(
                                service_name="stock_api",
                                status=ServiceStatus.HEALTHY,
                                response_time_ms=0,
                                timestamp=datetime.now(),
                                details={
                                    "api_status": "operational",
                                    "rate_limit": "normal"
                                }
                            )
            
            return HealthCheck(
                service_name="stock_api",
                status=ServiceStatus.DEGRADED,
                response_time_ms=0,
                timestamp=datetime.now(),
                details={"api_status": "limited"}
            )
            
        except Exception as e:
            return HealthCheck(
                service_name="stock_api",
                status=ServiceStatus.UNHEALTHY,
                response_time_ms=0,
                timestamp=datetime.now(),
                details={},
                error_message=str(e)
            )
    
    async def _check_websocket_health(self) -> HealthCheck:
        """WebSocket 헬스체크"""
        try:
            # WebSocket 서버 상태 확인 (모의)
            return HealthCheck(
                service_name="websocket",
                status=ServiceStatus.HEALTHY,
                response_time_ms=0,
                timestamp=datetime.now(),
                details={
                    "active_connections": 12,
                    "message_queue_size": 0
                }
            )
        except Exception as e:
            return HealthCheck(
                service_name="websocket",
                status=ServiceStatus.UNHEALTHY,
                response_time_ms=0,
                timestamp=datetime.now(),
                details={},
                error_message=str(e)
            )
    
    async def _check_system_health(self) -> HealthCheck:
        """시스템 리소스 헬스체크"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # 임계값 확인
            status = ServiceStatus.HEALTHY
            if cpu_percent > 80 or memory.percent > 85 or disk.percent > 90:
                status = ServiceStatus.DEGRADED
            if cpu_percent > 95 or memory.percent > 95 or disk.percent > 95:
                status = ServiceStatus.UNHEALTHY
            
            return HealthCheck(
                service_name="system",
                status=status,
                response_time_ms=0,
                timestamp=datetime.now(),
                details={
                    "cpu_percent": cpu_percent,
                    "memory_percent": memory.percent,
                    "disk_percent": disk.percent,
                    "load_average": psutil.getloadavg() if hasattr(psutil, 'getloadavg') else None
                }
            )
        except Exception as e:
            return HealthCheck(
                service_name="system",
                status=ServiceStatus.UNHEALTHY,
                response_time_ms=0,
                timestamp=datetime.now(),
                details={},
                error_message=str(e)
            )
    
    def _update_service_health(self, service_name: str, check_result: HealthCheck) -> None:
        """서비스 헬스 상태 업데이트"""
        if service_name not in self.services:
            self.register_service(service_name, None)
        
        service = self.services[service_name]
        service.last_check = check_result.timestamp
        service.total_checks += 1
        
        # 최근 체크 기록 (최대 50개)
        service.recent_checks.append(check_result)
        if len(service.recent_checks) > 50:
            service.recent_checks.pop(0)
        
        # 상태 변경 감지
        if service.current_status != check_result.status:
            log_info(
                f"서비스 상태 변경: {service_name} {service.current_status.value} → {check_result.status.value}",
                context={"service": service_name, "old_status": service.current_status.value, "new_status": check_result.status.value}
            )
            service.current_status = check_result.status
        
        # 연속 실패 카운트
        if check_result.status == ServiceStatus.UNHEALTHY:
            service.consecutive_failures += 1
        else:
            service.consecutive_failures = 0
        
        # 성공률 계산
        healthy_checks = len([c for c in service.recent_checks if c.status == ServiceStatus.HEALTHY])
        service.success_rate = (healthy_checks / len(service.recent_checks)) * 100 if service.recent_checks else 0
        
        # 평균 응답 시간 계산
        if service.recent_checks:
            service.average_response_time = sum(c.response_time_ms for c in service.recent_checks) / len(service.recent_checks)
        
        # 자동 복구 트리거
        if service.consecutive_failures >= 3:
            asyncio.create_task(self._trigger_recovery(service_name))
    
    async def _trigger_recovery(self, service_name: str) -> None:
        """자동 복구 트리거"""
        strategy_key = service_name
        if strategy_key not in self.recovery_strategies:
            strategy_key = "api_service"  # 기본 전략
        
        strategy = self.recovery_strategies[strategy_key]
        
        log_warning(
            f"자동 복구 시작: {service_name}",
            category=ErrorCategory.SYSTEM_ERROR,
            severity=ErrorSeverity.MEDIUM,
            context={"service": service_name, "strategy": strategy.name}
        )
        
        success = await self._execute_recovery_strategy(service_name, strategy)
        
        if success:
            log_info(f"자동 복구 성공: {service_name}")
        else:
            log_error(
                f"자동 복구 실패: {service_name}",
                category=ErrorCategory.SYSTEM_ERROR,
                severity=ErrorSeverity.HIGH,
                context={"service": service_name}
            )
            
            # 폴백 전략 시도
            if strategy.fallback_strategy:
                await self._execute_fallback_strategy(service_name, strategy.fallback_strategy)
    
    async def _execute_recovery_strategy(self, service_name: str, strategy: RecoveryStrategy) -> bool:
        """복구 전략 실행"""
        for attempt in range(strategy.max_attempts):
            log_info(f"복구 시도 {attempt + 1}/{strategy.max_attempts}: {service_name}")
            
            for action in strategy.actions:
                try:
                    await self._execute_recovery_action(service_name, action)
                    await asyncio.sleep(strategy.delay_seconds)
                    
                    # 성공 조건 확인
                    if await self._check_recovery_success(service_name):
                        return True
                        
                except Exception as e:
                    log_error(
                        f"복구 액션 실패: {action.value}",
                        category=ErrorCategory.SYSTEM_ERROR,
                        severity=ErrorSeverity.MEDIUM,
                        context={"service": service_name, "action": action.value, "error": str(e)}
                    )
        
        return False
    
    async def _execute_recovery_action(self, service_name: str, action: RecoveryAction) -> None:
        """개별 복구 액션 실행"""
        if action == RecoveryAction.WAIT_AND_RETRY:
            await asyncio.sleep(5)
        
        elif action == RecoveryAction.CLEAR_CACHE:
            log_info(f"캐시 정리: {service_name}")
            # 실제 캐시 정리 로직 구현 필요
        
        elif action == RecoveryAction.RECONNECT:
            log_info(f"재연결 시도: {service_name}")
            # 실제 재연결 로직 구현 필요
        
        elif action == RecoveryAction.CIRCUIT_BREAKER:
            if service_name in self.circuit_breakers:
                breaker = self.circuit_breakers[service_name]
                breaker.state = "half-open"
                log_info(f"서킷 브레이커 반개방: {service_name}")
        
        elif action == RecoveryAction.FALLBACK_MODE:
            log_info(f"폴백 모드 활성화: {service_name}")
            # 폴백 모드 로직 구현 필요
    
    async def _check_recovery_success(self, service_name: str) -> bool:
        """복구 성공 여부 확인"""
        try:
            check_result = await self.check_service_health(service_name)
            return check_result.status in [ServiceStatus.HEALTHY, ServiceStatus.DEGRADED]
        except Exception:
            return False
    
    async def _execute_fallback_strategy(self, service_name: str, fallback_name: str) -> None:
        """폴백 전략 실행"""
        log_warning(
            f"폴백 전략 실행: {service_name} → {fallback_name}",
            category=ErrorCategory.SYSTEM_ERROR,
            severity=ErrorSeverity.HIGH
        )
        
        # 폴백 전략별 로직 구현
        if fallback_name == "cached_data":
            log_info("캐시된 데이터 사용 모드 활성화")
        elif fallback_name == "read_only_mode":
            log_info("읽기 전용 모드 활성화")
        elif fallback_name == "fallback_api":
            log_info("대체 API 서비스 활성화")
    
    async def start_monitoring(self) -> None:
        """헬스 모니터링 시작"""
        if self.monitoring_active:
            return
        
        self.monitoring_active = True
        log_info("헬스 모니터링 시작")
        
        # 기본 서비스들 등록
        services_to_monitor = ["database", "stock_api", "websocket", "system"]
        for service in services_to_monitor:
            self.register_service(service, None)
        
        # 모니터링 루프 시작
        asyncio.create_task(self._monitoring_loop())
    
    async def _monitoring_loop(self) -> None:
        """모니터링 루프"""
        while self.monitoring_active:
            try:
                # 모든 등록된 서비스 체크
                check_tasks = [
                    self.check_service_health(service_name)
                    for service_name in self.services.keys()
                ]
                
                await asyncio.gather(*check_tasks, return_exceptions=True)
                
                await asyncio.sleep(self.monitoring_interval)
                
            except Exception as e:
                log_error(
                    f"모니터링 루프 오류: {e}",
                    category=ErrorCategory.SYSTEM_ERROR,
                    severity=ErrorSeverity.MEDIUM
                )
                await asyncio.sleep(self.monitoring_interval)
    
    def stop_monitoring(self) -> None:
        """헬스 모니터링 중지"""
        self.monitoring_active = False
        log_info("헬스 모니터링 중지")
    
    def get_system_status(self) -> Dict[str, Any]:
        """전체 시스템 상태 조회"""
        service_statuses = {}
        overall_status = ServiceStatus.HEALTHY
        
        for service_name, service in self.services.items():
            service_statuses[service_name] = {
                "status": service.current_status.value,
                "last_check": service.last_check.isoformat(),
                "consecutive_failures": service.consecutive_failures,
                "success_rate": service.success_rate,
                "average_response_time": service.average_response_time
            }
            
            # 전체 상태 결정
            if service.current_status == ServiceStatus.UNHEALTHY:
                overall_status = ServiceStatus.UNHEALTHY
            elif service.current_status == ServiceStatus.DEGRADED and overall_status == ServiceStatus.HEALTHY:
                overall_status = ServiceStatus.DEGRADED
        
        # 서킷 브레이커 상태
        circuit_breaker_status = {
            name: {
                "state": breaker.state,
                "failure_count": breaker.failure_count,
                "last_failure": breaker.last_failure_time
            }
            for name, breaker in self.circuit_breakers.items()
        }
        
        return {
            "overall_status": overall_status.value,
            "timestamp": datetime.now().isoformat(),
            "services": service_statuses,
            "circuit_breakers": circuit_breaker_status,
            "monitoring_active": self.monitoring_active
        }


# 전역 복구 시스템 인스턴스
recovery_system = ErrorRecoverySystem()


# 편의 함수들
async def start_health_monitoring() -> None:
    """헬스 모니터링 시작"""
    await recovery_system.start_monitoring()


def stop_health_monitoring() -> None:
    """헬스 모니터링 중지"""
    recovery_system.stop_monitoring()


async def check_system_health() -> Dict[str, Any]:
    """시스템 전체 헬스체크"""
    return recovery_system.get_system_status()


@asynccontextmanager
async def circuit_breaker(service_name: str):
    """서킷 브레이커 컨텍스트 매니저"""
    if service_name not in recovery_system.circuit_breakers:
        recovery_system.circuit_breakers[service_name] = CircuitBreaker(service_name)
    
    breaker = recovery_system.circuit_breakers[service_name]
    
    async def protected_call(func, *args, **kwargs):
        return await breaker.call(func, *args, **kwargs)
    
    yield protected_call
