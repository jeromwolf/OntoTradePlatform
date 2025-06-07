"""
중앙 집중식 로깅 및 오류 처리 시스템

이 모듈은 애플리케이션 전체에서 사용되는 포괄적인 로깅 및 오류 처리 기능을 제공합니다.
"""

import asyncio
import json
import logging
import sys
import traceback
from datetime import datetime, timedelta
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
from contextlib import asynccontextmanager
import aiofiles
from dataclasses import dataclass, asdict
from logging.handlers import RotatingFileHandler

from app.core.config import settings
from app.core.monitoring import capture_exception, capture_message, add_breadcrumb


class LogLevel(Enum):
    """로그 레벨 정의"""
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class ErrorCategory(Enum):
    """오류 카테고리 분류"""
    API_ERROR = "api_error"
    DATABASE_ERROR = "database_error"
    WEBSOCKET_ERROR = "websocket_error"
    DATA_VALIDATION_ERROR = "data_validation_error"
    AUTHENTICATION_ERROR = "authentication_error"
    RATE_LIMIT_ERROR = "rate_limit_error"
    NETWORK_ERROR = "network_error"
    SYSTEM_ERROR = "system_error"
    BUSINESS_LOGIC_ERROR = "business_logic_error"


class ErrorSeverity(Enum):
    """오류 심각도 분류"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class LogEntry:
    """로그 엔트리 구조"""
    timestamp: datetime
    level: LogLevel
    message: str
    module: str
    function: str
    line_number: int
    category: Optional[ErrorCategory] = None
    severity: Optional[ErrorSeverity] = None
    context: Optional[Dict[str, Any]] = None
    stack_trace: Optional[str] = None
    user_id: Optional[str] = None
    request_id: Optional[str] = None
    performance_metrics: Optional[Dict[str, float]] = None


@dataclass
class ErrorMetrics:
    """오류 메트릭 정보"""
    error_count: int = 0
    last_occurrence: Optional[datetime] = None
    error_rate: float = 0.0
    recovery_attempts: int = 0
    successful_recoveries: int = 0


class LoggingSystem:
    """중앙 집중식 로깅 시스템"""
    
    def __init__(self):
        """로깅 시스템 초기화"""
        self.log_entries: List[LogEntry] = []
        self.error_metrics: Dict[str, ErrorMetrics] = {}
        self.alert_thresholds = {
            ErrorSeverity.LOW: 10,      # 10개/분
            ErrorSeverity.MEDIUM: 5,     # 5개/분
            ErrorSeverity.HIGH: 3,       # 3개/분
            ErrorSeverity.CRITICAL: 1,   # 1개/분
        }
        self.recovery_strategies = {}
        self._setup_loggers()
        self._setup_log_files()
    
    def _setup_loggers(self) -> None:
        """로거 설정"""
        # 메인 애플리케이션 로거
        self.app_logger = logging.getLogger("ontotrade")
        self.app_logger.setLevel(logging.DEBUG)
        
        # 오류 전용 로거
        self.error_logger = logging.getLogger("ontotrade.errors")
        self.error_logger.setLevel(logging.ERROR)
        
        # 성능 모니터링 로거
        self.perf_logger = logging.getLogger("ontotrade.performance")
        self.perf_logger.setLevel(logging.INFO)
        
        # WebSocket 로거
        self.ws_logger = logging.getLogger("ontotrade.websocket")
        self.ws_logger.setLevel(logging.INFO)
        
        # API 로거
        self.api_logger = logging.getLogger("ontotrade.api")
        self.api_logger.setLevel(logging.INFO)
        
        # 포맷터 설정
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
        )
        
        # 콘솔 핸들러
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(formatter)
        console_handler.setLevel(logging.INFO)
        
        # 모든 로거에 콘솔 핸들러 추가
        for logger in [self.app_logger, self.error_logger, self.perf_logger, 
                      self.ws_logger, self.api_logger]:
            logger.addHandler(console_handler)
    
    def _setup_log_files(self) -> None:
        """로그 파일 설정"""
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        
        # 파일 핸들러들
        handlers = {
            "app": RotatingFileHandler(
                log_dir / "app.log", maxBytes=10*1024*1024, backupCount=5
            ),
            "error": RotatingFileHandler(
                log_dir / "error.log", maxBytes=10*1024*1024, backupCount=10
            ),
            "performance": RotatingFileHandler(
                log_dir / "performance.log", maxBytes=5*1024*1024, backupCount=3
            ),
            "websocket": RotatingFileHandler(
                log_dir / "websocket.log", maxBytes=5*1024*1024, backupCount=3
            ),
            "api": RotatingFileHandler(
                log_dir / "api.log", maxBytes=5*1024*1024, backupCount=3
            ),
        }
        
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
        )
        
        # 각 핸들러 설정
        for handler in handlers.values():
            handler.setFormatter(formatter)
        
        # 로거에 핸들러 연결
        self.app_logger.addHandler(handlers["app"])
        self.error_logger.addHandler(handlers["error"])
        self.perf_logger.addHandler(handlers["performance"])
        self.ws_logger.addHandler(handlers["websocket"])
        self.api_logger.addHandler(handlers["api"])
    
    def log(
        self,
        level: LogLevel,
        message: str,
        category: Optional[ErrorCategory] = None,
        severity: Optional[ErrorSeverity] = None,
        context: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None,
        request_id: Optional[str] = None,
        logger_name: str = "app"
    ) -> None:
        """통합 로깅 메서드"""
        
        # 호출자 정보 가져오기
        frame = sys._getframe(1)
        module = frame.f_globals.get('__name__', 'unknown')
        function = frame.f_code.co_name
        line_number = frame.f_lineno
        
        # 로그 엔트리 생성
        log_entry = LogEntry(
            timestamp=datetime.now(),
            level=level,
            message=message,
            module=module,
            function=function,
            line_number=line_number,
            category=category,
            severity=severity,
            context=context or {},
            user_id=user_id,
            request_id=request_id
        )
        
        # 메모리에 로그 저장 (최근 1000개만)
        self.log_entries.append(log_entry)
        if len(self.log_entries) > 1000:
            self.log_entries.pop(0)
        
        # 적절한 로거 선택
        logger_map = {
            "app": self.app_logger,
            "error": self.error_logger,
            "performance": self.perf_logger,
            "websocket": self.ws_logger,
            "api": self.api_logger,
        }
        logger = logger_map.get(logger_name, self.app_logger)
        
        # 메시지 포맷팅
        formatted_message = self._format_log_message(log_entry)
        
        # 로그 레벨에 따라 기록
        if level == LogLevel.DEBUG:
            logger.debug(formatted_message)
        elif level == LogLevel.INFO:
            logger.info(formatted_message)
        elif level == LogLevel.WARNING:
            logger.warning(formatted_message)
        elif level == LogLevel.ERROR:
            logger.error(formatted_message)
        elif level == LogLevel.CRITICAL:
            logger.critical(formatted_message)
        
        # Sentry에 전송 (ERROR 이상)
        if level in [LogLevel.ERROR, LogLevel.CRITICAL]:
            self._send_to_sentry(log_entry)
        
        # 오류 메트릭 업데이트
        if category:
            self._update_error_metrics(category, severity)
        
        # 알림 임계값 확인
        if severity:
            self._check_alert_thresholds(category, severity)
    
    def _format_log_message(self, entry: LogEntry) -> str:
        """로그 메시지 포맷팅"""
        base_msg = entry.message
        
        if entry.context:
            context_str = json.dumps(entry.context, default=str, ensure_ascii=False)
            base_msg += f" | Context: {context_str}"
        
        if entry.user_id:
            base_msg += f" | User: {entry.user_id}"
        
        if entry.request_id:
            base_msg += f" | Request: {entry.request_id}"
        
        if entry.category:
            base_msg += f" | Category: {entry.category.value}"
        
        if entry.severity:
            base_msg += f" | Severity: {entry.severity.value}"
        
        return base_msg
    
    def _send_to_sentry(self, entry: LogEntry) -> None:
        """Sentry에 로그 전송"""
        try:
            context = {
                "log_entry": {
                    "module": entry.module,
                    "function": entry.function,
                    "line_number": entry.line_number,
                    "category": entry.category.value if entry.category else None,
                    "severity": entry.severity.value if entry.severity else None,
                    "context": entry.context,
                    "user_id": entry.user_id,
                    "request_id": entry.request_id,
                }
            }
            
            if entry.level == LogLevel.CRITICAL:
                capture_exception(Exception(entry.message), context)
            else:
                capture_message(entry.message, level="error", context=context)
        
        except Exception as e:
            self.app_logger.error(f"Sentry 전송 실패: {e}")
    
    def _update_error_metrics(
        self, 
        category: ErrorCategory, 
        severity: Optional[ErrorSeverity]
    ) -> None:
        """오류 메트릭 업데이트"""
        key = f"{category.value}_{severity.value if severity else 'unknown'}"
        
        if key not in self.error_metrics:
            self.error_metrics[key] = ErrorMetrics()
        
        metrics = self.error_metrics[key]
        metrics.error_count += 1
        metrics.last_occurrence = datetime.now()
        
        # 에러율 계산 (최근 1시간 기준)
        recent_errors = [
            entry for entry in self.log_entries
            if entry.category == category 
            and entry.timestamp > datetime.now() - timedelta(hours=1)
        ]
        metrics.error_rate = len(recent_errors) / 60  # 분당 에러 수
    
    def _check_alert_thresholds(
        self, 
        category: Optional[ErrorCategory], 
        severity: Optional[ErrorSeverity]
    ) -> None:
        """알림 임계값 확인"""
        if not severity or not category:
            return
        
        threshold = self.alert_thresholds.get(severity, 10)
        key = f"{category.value}_{severity.value}"
        metrics = self.error_metrics.get(key)
        
        if metrics and metrics.error_rate > threshold:
            alert_message = (
                f"🚨 오류 알림: {category.value} ({severity.value}) "
                f"에러율이 임계값 초과 ({metrics.error_rate:.1f}/min > {threshold}/min)"
            )
            
            self.app_logger.critical(alert_message)
            capture_message(alert_message, level="error")
            
            # 자동 복구 시도
            asyncio.create_task(self._attempt_recovery(category, severity))
    
    async def _attempt_recovery(
        self, 
        category: ErrorCategory, 
        severity: ErrorSeverity
    ) -> None:
        """자동 복구 시도"""
        recovery_key = f"{category.value}_{severity.value}"
        
        if recovery_key not in self.error_metrics:
            return
        
        metrics = self.error_metrics[recovery_key]
        metrics.recovery_attempts += 1
        
        self.app_logger.info(f"자동 복구 시도 중: {category.value} ({severity.value})")
        
        try:
            # 카테고리별 복구 전략 실행
            recovery_success = await self._execute_recovery_strategy(category, severity)
            
            if recovery_success:
                metrics.successful_recoveries += 1
                self.app_logger.info(f"자동 복구 성공: {category.value}")
            else:
                self.app_logger.warning(f"자동 복구 실패: {category.value}")
        
        except Exception as e:
            self.app_logger.error(f"복구 과정에서 오류 발생: {e}")
    
    async def _execute_recovery_strategy(
        self, 
        category: ErrorCategory, 
        severity: ErrorSeverity
    ) -> bool:
        """복구 전략 실행"""
        try:
            if category == ErrorCategory.API_ERROR:
                # API 연결 재시도
                await asyncio.sleep(5)
                self.app_logger.info("API 연결 복구 시도 완료")
                return True
            
            elif category == ErrorCategory.WEBSOCKET_ERROR:
                # WebSocket 연결 재시작
                self.app_logger.info("WebSocket 연결 복구 시도")
                return True
            
            elif category == ErrorCategory.DATABASE_ERROR:
                # 데이터베이스 연결 재시도
                await asyncio.sleep(3)
                self.app_logger.info("데이터베이스 연결 복구 시도 완료")
                return True
            
            elif category == ErrorCategory.RATE_LIMIT_ERROR:
                # Rate limit 대기
                await asyncio.sleep(60)
                self.app_logger.info("Rate limit 대기 완료")
                return True
            
            return False
        
        except Exception:
            return False
    
    def get_error_statistics(self, hours: int = 24) -> Dict[str, Any]:
        """오류 통계 조회"""
        cutoff_time = datetime.now() - timedelta(hours=hours)
        recent_logs = [
            entry for entry in self.log_entries 
            if entry.timestamp > cutoff_time
        ]
        
        # 카테고리별 통계
        category_stats = {}
        severity_stats = {}
        
        for entry in recent_logs:
            if entry.category:
                cat = entry.category.value
                category_stats[cat] = category_stats.get(cat, 0) + 1
            
            if entry.severity:
                sev = entry.severity.value
                severity_stats[sev] = severity_stats.get(sev, 0) + 1
        
        return {
            "time_range_hours": hours,
            "total_logs": len(recent_logs),
            "error_logs": len([e for e in recent_logs if e.level in [LogLevel.ERROR, LogLevel.CRITICAL]]),
            "category_breakdown": category_stats,
            "severity_breakdown": severity_stats,
            "error_metrics": {k: asdict(v) for k, v in self.error_metrics.items()},
            "top_errors": self._get_top_errors(recent_logs),
        }
    
    def _get_top_errors(self, logs: List[LogEntry], limit: int = 5) -> List[Dict[str, Any]]:
        """상위 오류 목록 조회"""
        error_counts = {}
        
        for log in logs:
            if log.level in [LogLevel.ERROR, LogLevel.CRITICAL]:
                key = f"{log.module}.{log.function}"
                if key not in error_counts:
                    error_counts[key] = {
                        "location": key,
                        "count": 0,
                        "last_message": "",
                        "category": log.category.value if log.category else "unknown"
                    }
                error_counts[key]["count"] += 1
                error_counts[key]["last_message"] = log.message
        
        return sorted(
            error_counts.values(), 
            key=lambda x: x["count"], 
            reverse=True
        )[:limit]
    
    @asynccontextmanager
    async def performance_monitor(self, operation_name: str):
        """성능 모니터링 컨텍스트 매니저"""
        start_time = datetime.now()
        
        try:
            yield
        finally:
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            self.log(
                LogLevel.INFO,
                f"성능 측정: {operation_name}",
                context={"duration_seconds": duration},
                logger_name="performance"
            )
    
    async def save_logs_to_file(self, filename: Optional[str] = None) -> str:
        """로그를 파일로 저장"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"logs/export_{timestamp}.json"
        
        log_data = [asdict(entry) for entry in self.log_entries]
        
        async with aiofiles.open(filename, 'w', encoding='utf-8') as f:
            await f.write(json.dumps(log_data, default=str, ensure_ascii=False, indent=2))
        
        return filename


# 전역 로깅 시스템 인스턴스
logging_system = LoggingSystem()


# 편의 함수들
def log_info(message: str, **kwargs) -> None:
    """정보 로그"""
    logging_system.log(LogLevel.INFO, message, **kwargs)


def log_warning(message: str, **kwargs) -> None:
    """경고 로그"""
    logging_system.log(LogLevel.WARNING, message, **kwargs)


def log_error(
    message: str, 
    category: ErrorCategory = ErrorCategory.SYSTEM_ERROR,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    **kwargs
) -> None:
    """오류 로그"""
    logging_system.log(LogLevel.ERROR, message, category=category, severity=severity, **kwargs)


def log_critical(
    message: str,
    category: ErrorCategory = ErrorCategory.SYSTEM_ERROR,
    severity: ErrorSeverity = ErrorSeverity.CRITICAL,
    **kwargs
) -> None:
    """중요 오류 로그"""
    logging_system.log(LogLevel.CRITICAL, message, category=category, severity=severity, **kwargs)


def log_api_call(endpoint: str, method: str, **kwargs) -> None:
    """API 호출 로그"""
    logging_system.log(
        LogLevel.INFO,
        f"API 호출: {method} {endpoint}",
        context={"endpoint": endpoint, "method": method},
        logger_name="api",
        **kwargs
    )


def log_websocket_event(event: str, **kwargs) -> None:
    """WebSocket 이벤트 로그"""
    logging_system.log(
        LogLevel.INFO,
        f"WebSocket 이벤트: {event}",
        context={"event": event},
        logger_name="websocket",
        **kwargs
    )
