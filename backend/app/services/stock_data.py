"""
주식 데이터 서비스 모듈

Alpha Vantage API와 통합하여 실시간 주식 데이터를 제공합니다.
캐싱, Rate Limiting, 데이터 검증 기능을 포함합니다.
"""

import asyncio
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import aiohttp
import aiofiles
from dataclasses import asdict

from app.core.config import settings
from app.core.logging_system import (
    log_info, log_warning, log_error, log_critical, log_api_call,
    ErrorCategory, ErrorSeverity, logging_system
)
from app.core.error_recovery import circuit_breaker, recovery_system
from app.core.monitoring import add_breadcrumb, capture_exception, capture_message
from app.services.data_validator import DataValidationError, validator

class RateLimitExceededError(Exception):
    """Rate limit 초과 예외"""
    pass

class APIConnectionError(Exception):
    """API 연결 오류 예외"""
    pass

class StockDataService:
    """주식 데이터 서비스 클래스"""
    
    def __init__(self):
        self.api_key = settings.ALPHA_VANTAGE_API_KEY
        self.base_url = "https://www.alphavantage.co/query"
        
        # 캐시 설정
        self.cache: Dict[str, Dict] = {}
        self.cache_duration = timedelta(seconds=30)
        
        # Rate limiting
        self.request_times: List[float] = []
        self.max_requests_per_minute = 5
        self.request_delay = 12  # 12초 대기 (Alpha Vantage 제한)
        
        # 통계
        self.stats = {
            "total_requests": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "api_errors": 0,
            "successful_requests": 0,
            "rate_limit_hits": 0
        }
        
        log_info(
            "StockDataService 초기화 완료",
            context={
                "api_configured": bool(self.api_key),
                "cache_duration_seconds": self.cache_duration.total_seconds(),
                "rate_limit": self.max_requests_per_minute
            },
            logger_name="api"
        )

    async def get_quote(self, symbol: str) -> Dict[str, Any]:
        """주식 시세 조회 (캐시 및 에러 처리 포함)"""
        
        log_api_call(
            endpoint="get_quote",
            method="GET",
            context={"symbol": symbol}
        )
        
        try:
            # 캐시 확인
            cached_data = self._get_from_cache(symbol)
            if cached_data:
                self.stats["cache_hits"] += 1
                log_info(
                    f"캐시에서 데이터 반환: {symbol}",
                    context={"symbol": symbol, "cache_age_seconds": cached_data.get("cache_age")},
                    logger_name="api"
                )
                return cached_data
            
            self.stats["cache_misses"] += 1
            
            # Rate limiting 확인
            await self._check_rate_limit()
            
            # 서킷 브레이커를 통한 API 호출
            async with circuit_breaker("stock_api") as protected_call:
                quote_data = await protected_call(self._fetch_quote_from_api, symbol)
            
            # 데이터 검증 및 정규화
            async with logging_system.performance_monitor("data_validation"):
                validated_data = self._validate_and_normalize_quote(symbol, quote_data)
            
            # 캐시에 저장
            self._save_to_cache(symbol, validated_data)
            
            self.stats["successful_requests"] += 1
            
            log_info(
                f"API에서 새 데이터 조회 성공: {symbol}",
                context={
                    "symbol": symbol,
                    "price": validated_data.get("price"),
                    "change_percent": validated_data.get("change_percent"),
                    "validation_status": "success"
                },
                logger_name="api"
            )
            
            return validated_data
        
        except RateLimitExceededError as e:
            self.stats["rate_limit_hits"] += 1
            log_error(
                f"Rate limit 초과: {symbol}",
                category=ErrorCategory.RATE_LIMIT_ERROR,
                severity=ErrorSeverity.MEDIUM,
                context={"symbol": symbol, "requests_per_minute": len(self.request_times)},
                logger_name="api"
            )
            
            # 캐시된 데이터가 있으면 반환
            stale_data = self._get_from_cache(symbol, allow_stale=True)
            if stale_data:
                stale_data["is_stale"] = True
                return stale_data
            
            raise
        
        except APIConnectionError as e:
            self.stats["api_errors"] += 1
            log_error(
                f"API 연결 오류: {symbol}",
                category=ErrorCategory.API_ERROR,
                severity=ErrorSeverity.HIGH,
                context={"symbol": symbol, "error": str(e)},
                logger_name="api"
            )
            
            # 폴백 데이터 생성
            return self._generate_fallback_data(symbol)
        
        except DataValidationError as e:
            self.stats["api_errors"] += 1
            log_error(
                f"데이터 검증 오류: {symbol}",
                category=ErrorCategory.DATA_VALIDATION_ERROR,
                severity=ErrorSeverity.MEDIUM,
                context={"symbol": symbol, "validation_errors": str(e)},
                logger_name="api"
            )
            
            # 안전한 폴백 데이터 반환
            return self._generate_fallback_data(symbol)
        
        except Exception as e:
            self.stats["api_errors"] += 1
            log_critical(
                f"예상치 못한 오류: {symbol}",
                category=ErrorCategory.SYSTEM_ERROR,
                severity=ErrorSeverity.CRITICAL,
                context={"symbol": symbol, "error": str(e), "error_type": type(e).__name__},
                logger_name="api"
            )
            
            capture_exception(e, {
                "symbol": symbol,
                "service": "StockDataService",
                "method": "get_quote"
            })
            
            return self._generate_fallback_data(symbol)

    async def _fetch_quote_from_api(self, symbol: str) -> Dict[str, Any]:
        """API에서 시세 데이터 조회"""
        
        params = {
            "function": "GLOBAL_QUOTE",
            "symbol": symbol,
            "apikey": self.api_key or "demo"
        }
        
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
            try:
                async with session.get(self.base_url, params=params) as response:
                    self.stats["total_requests"] += 1
                    self.request_times.append(time.time())
                    
                    if response.status != 200:
                        raise APIConnectionError(f"HTTP {response.status}: {response.reason}")
                    
                    data = await response.json()
                    
                    # API 오류 확인
                    if "Error Message" in data:
                        raise APIConnectionError(f"API Error: {data['Error Message']}")
                    
                    if "Note" in data:
                        raise RateLimitExceededError(f"Rate limit: {data['Note']}")
                    
                    # 글로벌 시세 데이터 추출
                    global_quote = data.get("Global Quote", {})
                    if not global_quote:
                        raise APIConnectionError("빈 응답 데이터")
                    
                    log_info(
                        f"API 호출 성공: {symbol}",
                        context={
                            "symbol": symbol,
                            "response_status": response.status,
                            "data_keys": list(global_quote.keys())
                        },
                        logger_name="api"
                    )
                    
                    return global_quote
            
            except aiohttp.ClientError as e:
                raise APIConnectionError(f"네트워크 오류: {str(e)}")
            except asyncio.TimeoutError:
                raise APIConnectionError("API 응답 시간 초과")

    def _validate_and_normalize_quote(self, symbol: str, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """시세 데이터 검증 및 정규화"""
        
        try:
            # Alpha Vantage 응답 형식에 맞춰 정규화
            normalized = self._normalize_alpha_vantage_quote(raw_data)
            
            # 데이터 검증
            validation_result = validator.validate_quote_data(normalized)
            
            if not validation_result.is_valid:
                raise DataValidationError(f"검증 실패: {', '.join(validation_result.errors)}")
            
            # 검증된 데이터에 메타데이터 추가
            validated_data = validation_result.normalized_data
            validated_data.update({
                "validated_at": datetime.now().isoformat(),
                "data_source": "alpha_vantage",
                "symbol": symbol.upper(),
                "validation_warnings": validation_result.warnings
            })
            
            if validation_result.warnings:
                log_warning(
                    f"데이터 검증 경고: {symbol}",
                    category=ErrorCategory.DATA_VALIDATION_ERROR,
                    severity=ErrorSeverity.LOW,
                    context={"symbol": symbol, "warnings": validation_result.warnings},
                    logger_name="api"
                )
            
            return validated_data
        
        except Exception as e:
            log_error(
                f"데이터 정규화/검증 실패: {symbol}",
                category=ErrorCategory.DATA_VALIDATION_ERROR,
                severity=ErrorSeverity.MEDIUM,
                context={"symbol": symbol, "raw_data_keys": list(raw_data.keys()), "error": str(e)},
                logger_name="api"
            )
            raise DataValidationError(f"데이터 처리 실패: {str(e)}")

    def _normalize_alpha_vantage_quote(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Alpha Vantage 시세 데이터 정규화"""
        
        return {
            "symbol": data.get("01. symbol", ""),
            "price": float(data.get("05. price", 0)),
            "volume": int(data.get("06. volume", 0)),
            "previous_close": float(data.get("08. previous close", 0)),
            "open": float(data.get("02. open", 0)),
            "high": float(data.get("03. high", 0)),
            "low": float(data.get("04. low", 0)),
            "change": float(data.get("09. change", 0)),
            "change_percent": data.get("10. change percent", "0%").replace("%", ""),
            "latest_trading_day": data.get("07. latest trading day", ""),
        }

    async def _check_rate_limit(self) -> None:
        """Rate limit 확인 및 대기"""
        
        current_time = time.time()
        
        # 1분 이전 요청들 제거
        self.request_times = [t for t in self.request_times if current_time - t < 60]
        
        if len(self.request_times) >= self.max_requests_per_minute:
            wait_time = 60 - (current_time - self.request_times[0]) + 1
            
            log_warning(
                f"Rate limit 대기: {wait_time:.1f}초",
                category=ErrorCategory.RATE_LIMIT_ERROR,
                severity=ErrorSeverity.LOW,
                context={"wait_time": wait_time, "requests_count": len(self.request_times)},
                logger_name="api"
            )
            
            raise RateLimitExceededError(f"Rate limit 초과, {wait_time:.1f}초 대기 필요")

    def _get_from_cache(self, symbol: str, allow_stale: bool = False) -> Optional[Dict[str, Any]]:
        """캐시에서 데이터 조회"""
        
        if symbol not in self.cache:
            return None
        
        cached_item = self.cache[symbol]
        cache_time = datetime.fromisoformat(cached_item["cached_at"])
        age = datetime.now() - cache_time
        
        if not allow_stale and age > self.cache_duration:
            log_info(
                f"캐시 데이터 만료: {symbol}",
                context={"symbol": symbol, "age_seconds": age.total_seconds()},
                logger_name="api"
            )
            return None
        
        # 캐시 나이 정보 추가
        cached_item["cache_age"] = age.total_seconds()
        cached_item["is_cached"] = True
        
        return cached_item

    def _save_to_cache(self, symbol: str, data: Dict[str, Any]) -> None:
        """캐시에 데이터 저장"""
        
        cache_entry = data.copy()
        cache_entry["cached_at"] = datetime.now().isoformat()
        
        self.cache[symbol] = cache_entry
        
        # 캐시 크기 제한 (최대 100개)
        if len(self.cache) > 100:
            oldest_symbol = min(self.cache.keys(), 
                              key=lambda k: self.cache[k]["cached_at"])
            del self.cache[oldest_symbol]
            
            log_info(
                f"캐시 정리: {oldest_symbol} 제거",
                context={"removed_symbol": oldest_symbol, "cache_size": len(self.cache)},
                logger_name="api"
            )

    def _generate_fallback_data(self, symbol: str) -> Dict[str, Any]:
        """폴백 데이터 생성"""
        
        log_warning(
            f"폴백 데이터 생성: {symbol}",
            category=ErrorCategory.API_ERROR,
            severity=ErrorSeverity.MEDIUM,
            context={"symbol": symbol},
            logger_name="api"
        )
        
        return {
            "symbol": symbol.upper(),
            "price": 0.0,
            "volume": 0,
            "previous_close": 0.0,
            "open": 0.0,
            "high": 0.0,
            "low": 0.0,
            "change": 0.0,
            "change_percent": "0",
            "latest_trading_day": datetime.now().date().isoformat(),
            "validated_at": datetime.now().isoformat(),
            "data_source": "fallback",
            "is_fallback": True,
            "validation_warnings": ["폴백 데이터 사용"]
        }

    async def get_multiple_quotes(self, symbols: List[str]) -> Dict[str, Dict[str, Any]]:
        """여러 종목 시세 동시 조회"""
        
        log_api_call(
            endpoint="get_multiple_quotes",
            method="GET",
            context={"symbols": symbols, "count": len(symbols)}
        )
        
        async with logging_system.performance_monitor("batch_quote_fetch"):
            tasks = [self.get_quote(symbol) for symbol in symbols]
            results = await asyncio.gather(*tasks, return_exceptions=True)
        
        response = {}
        successful_count = 0
        error_count = 0
        
        for symbol, result in zip(symbols, results):
            if isinstance(result, Exception):
                log_error(
                    f"배치 조회 실패: {symbol}",
                    category=ErrorCategory.API_ERROR,
                    severity=ErrorSeverity.MEDIUM,
                    context={"symbol": symbol, "error": str(result)},
                    logger_name="api"
                )
                response[symbol] = self._generate_fallback_data(symbol)
                error_count += 1
            else:
                response[symbol] = result
                successful_count += 1
        
        log_info(
            "배치 시세 조회 완료",
            context={
                "total_symbols": len(symbols),
                "successful": successful_count,
                "errors": error_count,
                "success_rate": f"{(successful_count/len(symbols)*100):.1f}%"
            },
            logger_name="api"
        )
        
        return response

    def get_cache_stats(self) -> Dict[str, Any]:
        """캐시 및 API 통계 조회"""
        
        cache_info = {
            "cache_size": len(self.cache),
            "cache_duration_seconds": self.cache_duration.total_seconds(),
            "cached_symbols": list(self.cache.keys()),
        }
        
        # 최근 요청 수 계산
        current_time = time.time()
        recent_requests = len([t for t in self.request_times if current_time - t < 60])
        
        api_info = {
            "requests_last_minute": recent_requests,
            "rate_limit": self.max_requests_per_minute,
            "rate_limit_available": self.max_requests_per_minute - recent_requests,
        }
        
        stats_info = self.stats.copy()
        
        # 성공률 계산
        if stats_info["total_requests"] > 0:
            stats_info["success_rate"] = (
                stats_info["successful_requests"] / stats_info["total_requests"] * 100
            )
            stats_info["cache_hit_rate"] = (
                stats_info["cache_hits"] / (stats_info["cache_hits"] + stats_info["cache_misses"]) * 100
            )
        else:
            stats_info["success_rate"] = 0
            stats_info["cache_hit_rate"] = 0
        
        combined_stats = {
            "cache": cache_info,
            "api": api_info,
            "statistics": stats_info,
            "timestamp": datetime.now().isoformat()
        }
        
        log_info(
            "통계 조회",
            context=combined_stats,
            logger_name="api"
        )
        
        return combined_stats

    async def clear_cache(self) -> None:
        """캐시 초기화"""
        
        cache_size = len(self.cache)
        self.cache.clear()
        
        log_info(
            f"캐시 초기화 완료",
            context={"cleared_items": cache_size},
            logger_name="api"
        )

    async def health_check(self) -> Dict[str, Any]:
        """서비스 헬스체크"""
        
        try:
            # 간단한 API 테스트 (AAPL)
            test_symbol = "AAPL"
            
            async with logging_system.performance_monitor("health_check_api_test"):
                await self._fetch_quote_from_api(test_symbol)
            
            health_status = {
                "status": "healthy",
                "api_accessible": True,
                "cache_operational": True,
                "last_check": datetime.now().isoformat(),
                "stats": self.get_cache_stats()
            }
            
            log_info(
                "헬스체크 성공",
                context=health_status,
                logger_name="api"
            )
            
            return health_status
        
        except Exception as e:
            health_status = {
                "status": "unhealthy",
                "api_accessible": False,
                "cache_operational": len(self.cache) >= 0,  # 캐시는 항상 작동
                "last_check": datetime.now().isoformat(),
                "error": str(e),
                "stats": self.get_cache_stats()
            }
            
            log_error(
                "헬스체크 실패",
                category=ErrorCategory.API_ERROR,
                severity=ErrorSeverity.HIGH,
                context=health_status,
                logger_name="api"
            )
            
            return health_status


# 전역 서비스 인스턴스
stock_data_service = StockDataService()
