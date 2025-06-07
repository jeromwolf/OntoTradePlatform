import platform
import sys
from datetime import datetime

import psutil
from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()


@router.get("/")
async def health_check():
    """기본 헬스 체크 엔드포인트"""
    return JSONResponse(
        {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "service": "OntoTrade API",
            "version": "1.0.0",
        }
    )


@router.get("/detailed")
async def detailed_health_check():
    """상세 시스템 정보 포함 헬스 체크"""
    try:
        # 시스템 정보 수집
        cpu_usage = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage("/")

        return JSONResponse(
            {
                "status": "healthy",
                "timestamp": datetime.utcnow().isoformat(),
                "service": "OntoTrade API",
                "version": "1.0.0",
                "system_info": {
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
                },
            }
        )
    except Exception as e:
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
    # 여기서 데이터베이스 연결, 외부 서비스 등 확인 가능
    return JSONResponse(
        {
            "status": "ready",
            "timestamp": datetime.utcnow().isoformat(),
            "checks": {
                "database": "connected",  # 실제 DB 연결 시 구현
                "external_apis": "available",
            },
        }
    )


@router.get("/liveness")
async def liveness_check():
    """생존 상태 확인 (Kubernetes 등에서 사용)"""
    return JSONResponse({"status": "alive", "timestamp": datetime.utcnow().isoformat()})
