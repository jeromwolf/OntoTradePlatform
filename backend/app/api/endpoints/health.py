"""
헬스 체크 API 엔드포인트

시스템 상태, 헬스 체크, 준비 상태 확인 등의 모니터링 기능을 제공하는 FastAPI 라우터입니다.
중앙 집중식 로깅, 에러 처리, 성능 모니터링이 통합되어 있습니다.
"""

import platform
import sys
from datetime import datetime

import psutil
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.core.logging_system import (
    log_info, log_warning, log_error, log_critical, log_api_call,
    ErrorCategory, ErrorSeverity, logging_system
)
from app.core.monitoring import capture_exception, capture_message

router = APIRouter()


@router.get("/")
async def health_check():
    """기본 헬스 체크 엔드포인트"""
    log_api_call(endpoint="GET /health/", parameters={})
    
    try:
        with logging_system.performance_monitor.measure_operation("health_basic_check") as monitor:
            response_data = {
                "status": "healthy",
                "timestamp": datetime.utcnow().isoformat(),
                "service": "OntoTrade API",
                "version": "1.0.0",
            }
            
            log_info("기본 헬스 체크 완료", category="health_check", context={
                "status": response_data["status"],
                "service": response_data["service"],
                "version": response_data["version"]
            })
            
            return JSONResponse(response_data)
            
    except Exception as e:
        log_error("기본 헬스 체크 실패", 
                 category=ErrorCategory.SYSTEM.value, 
                 severity=ErrorSeverity.HIGH.value,
                 context={
                     "error": str(e),
                     "error_type": type(e).__name__
                 })
        
        capture_exception(e, {
            "endpoint": "GET /health/",
            "operation": "basic_health_check"
        })
        
        return JSONResponse(
            {
                "status": "error",
                "timestamp": datetime.utcnow().isoformat(),
                "error": "헬스 체크 중 오류가 발생했습니다."
            },
            status_code=500
        )


@router.get("/detailed")
async def detailed_health_check():
    """상세 시스템 정보 포함 헬스 체크"""
    log_api_call(endpoint="GET /health/detailed", parameters={})
    
    try:
        with logging_system.performance_monitor.measure_operation("health_detailed_check") as monitor:
            log_info("상세 헬스 체크 시작", category="health_check", context={
                "source": "detailed_health_endpoint"
            })
            
            # 시스템 정보 수집
            cpu_usage = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage("/")

            system_info = {
                "platform": platform.system(),
                "platform_version": platform.version(),
                "python_version": sys.version,
                "cpu_usage_percent": cpu_usage,
                "memory": {
                    "total": memory.total,
                    "available": memory.available,
                    "used": memory.used,
                    "percent": memory.percent,
                },
                "disk": {
                    "total": disk.total,
                    "used": disk.used,
                    "free": disk.free,
                    "percent": (disk.used / disk.total) * 100,
                },
            }
            
            # 시스템 리소스 상태 체크
            if cpu_usage > 90:
                log_warning("높은 CPU 사용률 감지", category="system_monitoring", context={
                    "cpu_usage": cpu_usage,
                    "threshold": 90,
                    "severity": ErrorSeverity.MEDIUM.value
                })
            
            if memory.percent > 90:
                log_warning("높은 메모리 사용률 감지", category="system_monitoring", context={
                    "memory_usage": memory.percent,
                    "threshold": 90,
                    "severity": ErrorSeverity.MEDIUM.value
                })
            
            response_data = {
                "status": "healthy",
                "timestamp": datetime.utcnow().isoformat(),
                "service": "OntoTrade API",
                "version": "1.0.0",
                "system_info": system_info,
            }
            
            log_info("상세 헬스 체크 완료", category="health_check", context={
                "status": response_data["status"],
                "cpu_usage": cpu_usage,
                "memory_usage": memory.percent,
                "disk_usage": system_info["disk"]["percent"]
            })
            
            return JSONResponse(response_data)
            
    except Exception as e:
        log_error("상세 헬스 체크 실패", 
                 category=ErrorCategory.SYSTEM.value, 
                 severity=ErrorSeverity.HIGH.value,
                 context={
                     "error": str(e),
                     "error_type": type(e).__name__
                 })
        
        capture_exception(e, {
            "endpoint": "GET /health/detailed",
            "operation": "detailed_health_check"
        })
        
        return JSONResponse(
            {
                "status": "error",
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e),
            },
            status_code=500,
        )


@router.get("/readiness")
async def readiness_check():
    """준비 상태 확인 (Kubernetes 등에서 사용)"""
    log_api_call(endpoint="GET /health/readiness", parameters={})
    
    try:
        with logging_system.performance_monitor.measure_operation("health_readiness_check") as monitor:
            log_info("준비 상태 확인 시작", category="health_check", context={
                "check_type": "readiness"
            })
            
            # 여기서 데이터베이스 연결, 외부 서비스 등 확인 가능
            checks = {
                "database": "connected",  # 실제 DB 연결 시 구현
                "external_apis": "available",
            }
            
            response_data = {
                "status": "ready",
                "timestamp": datetime.utcnow().isoformat(),
                "checks": checks,
            }
            
            log_info("준비 상태 확인 완료", category="health_check", context={
                "status": response_data["status"],
                "checks": checks
            })
            
            return JSONResponse(response_data)
            
    except Exception as e:
        log_error("준비 상태 확인 실패", 
                 category=ErrorCategory.SYSTEM.value, 
                 severity=ErrorSeverity.HIGH.value,
                 context={
                     "error": str(e),
                     "error_type": type(e).__name__
                 })
        
        capture_exception(e, {
            "endpoint": "GET /health/readiness",
            "operation": "readiness_check"
        })
        
        return JSONResponse(
            {
                "status": "not_ready",
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e)
            },
            status_code=500
        )


@router.get("/liveness")
async def liveness_check():
    """생존 상태 확인 (Kubernetes 등에서 사용)"""
    log_api_call(endpoint="GET /health/liveness", parameters={})
    
    try:
        with logging_system.performance_monitor.measure_operation("health_liveness_check") as monitor:
            response_data = {
                "status": "alive", 
                "timestamp": datetime.utcnow().isoformat()
            }
            
            log_info("생존 상태 확인 완료", category="health_check", context={
                "status": response_data["status"]
            })
            
            return JSONResponse(response_data)
            
    except Exception as e:
        log_critical("생존 상태 확인 실패", 
                    category=ErrorCategory.SYSTEM.value, 
                    severity=ErrorSeverity.CRITICAL.value,
                    context={
                        "error": str(e),
                        "error_type": type(e).__name__
                    })
        
        capture_exception(e, {
            "endpoint": "GET /health/liveness",
            "operation": "liveness_check"
        })
        
        return JSONResponse(
            {
                "status": "dead",
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e)
            },
            status_code=500
        )
