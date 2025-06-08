"""
주식 데이터 API 엔드포인트

실시간 주식 시세, 검색, 히스토리 데이터를 제공하는 FastAPI 라우터입니다.
중앙 집중식 로깅, 에러 처리, 성능 모니터링이 통합되어 있습니다.
"""

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.core.error_recovery import circuit_breaker
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
from app.services.data_validator import DataValidationError, validator
from app.services.stock_data import (
    APIConnectionError,
    RateLimitExceededError,
    stock_data_service,
)

router = APIRouter()


# 확장된 스키마
class Stock(BaseModel):
    symbol: str
    name: str
    name_ko: Optional[str] = None
    price: float
    change: float
    change_percent: float
    volume: int
    market_cap: Optional[float] = None
    sector: Optional[str] = None
    currency: str = "USD"


class StockSearch(BaseModel):
    symbol: str
    name: str
    name_ko: Optional[str] = None
    exchange: str
    currency: str


class MultipleQuotesRequest(BaseModel):
    symbols: List[str]


@router.get("/search")
async def search_stocks(
    q: str = Query(..., description="검색 키워드 (종목명 또는 심볼)"),
    limit: int = Query(10, description="결과 개수 제한"),
):
    """주식 검색"""

    log_api_call(
        endpoint="search_stocks", method="GET", context={"query": q, "limit": limit}
    )

    try:
        async with logging_system.performance_monitor("stock_search"):
            # TODO: 실제 주식 데이터 API 연동
            mock_results = [
                StockSearch(
                    symbol="AAPL",
                    name="Apple Inc.",
                    name_ko="애플",
                    exchange="NASDAQ",
                    currency="USD",
                ),
                StockSearch(
                    symbol="GOOGL",
                    name="Alphabet Inc.",
                    name_ko="알파벳",
                    exchange="NASDAQ",
                    currency="USD",
                ),
                StockSearch(
                    symbol="TSLA",
                    name="Tesla, Inc.",
                    name_ko="테슬라",
                    exchange="NASDAQ",
                    currency="USD",
                ),
            ]

            # 검색어 필터링 (실제로는 외부 API 호출)
            filtered_results = [
                stock
                for stock in mock_results
                if q.lower() in stock.symbol.lower()
                or q.lower() in stock.name.lower()
                or (stock.name_ko and q.lower() in stock.name_ko.lower())
            ]

            result_count = len(filtered_results)

            log_info(
                f"주식 검색 완료: '{q}'",
                context={
                    "query": q,
                    "results_found": result_count,
                    "limit": limit,
                    "returned_count": min(result_count, limit),
                },
                logger_name="api",
            )

            return JSONResponse(
                {
                    "results": [stock.dict() for stock in filtered_results[:limit]],
                    "total": result_count,
                    "query": q,
                }
            )

    except Exception as e:
        log_error(
            f"주식 검색 실패: '{q}'",
            category=ErrorCategory.API_ERROR,
            severity=ErrorSeverity.MEDIUM,
            context={"query": q, "limit": limit, "error": str(e)},
            logger_name="api",
        )

        capture_exception(e, {"endpoint": "search_stocks", "query": q, "limit": limit})

        raise HTTPException(status_code=500, detail="주식 검색 중 오류가 발생했습니다")


@router.get("/trending")
async def get_trending_stocks():
    """인기 종목 조회"""

    log_api_call(endpoint="get_trending_stocks", method="GET")

    try:
        async with logging_system.performance_monitor("trending_stocks"):
            # TODO: 실제 인기 종목 데이터
            trending_stocks = [
                Stock(
                    symbol="AAPL",
                    name="Apple Inc.",
                    name_ko="애플",
                    price=175.84,
                    change=2.14,
                    change_percent=1.23,
                    volume=54789123,
                    market_cap=2850000000000,
                    sector="Technology",
                    currency="USD",
                ),
                Stock(
                    symbol="NVDA",
                    name="NVIDIA Corporation",
                    name_ko="엔비디아",
                    price=432.65,
                    change=-5.23,
                    change_percent=-1.19,
                    volume=23456789,
                    market_cap=1250000000000,
                    sector="Technology",
                    currency="USD",
                ),
                Stock(
                    symbol="TSLA",
                    name="Tesla, Inc.",
                    name_ko="테슬라",
                    price=198.45,
                    change=8.76,
                    change_percent=4.62,
                    volume=67891234,
                    market_cap=625000000000,
                    sector="Automotive",
                    currency="USD",
                ),
            ]

            log_info(
                "인기 종목 조회 완료",
                context={"trending_count": len(trending_stocks)},
                logger_name="api",
            )

            return JSONResponse(
                {
                    "trending_stocks": [stock.dict() for stock in trending_stocks],
                    "updated_at": datetime.utcnow().isoformat(),
                }
            )

    except Exception as e:
        log_error(
            "인기 종목 조회 실패",
            category=ErrorCategory.API_ERROR,
            severity=ErrorSeverity.MEDIUM,
            context={"error": str(e)},
            logger_name="api",
        )

        capture_exception(e, {"endpoint": "get_trending_stocks"})

        raise HTTPException(
            status_code=500, detail="인기 종목 조회 중 오류가 발생했습니다"
        )


@router.get("/quote/{symbol}")
async def get_stock_quote(symbol: str):
    """개별 주식의 실시간 시세 정보를 가져옵니다."""

    log_api_call(endpoint="get_stock_quote", method="GET", context={"symbol": symbol})

    try:
        async with logging_system.performance_monitor("single_quote_fetch"):
            # 수정된 메소드명 사용
            quote_data = await stock_data_service.get_quote(symbol.upper())

            if not quote_data:
                log_warning(
                    f"주식 데이터 없음: {symbol}",
                    category=ErrorCategory.API_ERROR,
                    severity=ErrorSeverity.LOW,
                    context={"symbol": symbol},
                    logger_name="api",
                )

                raise HTTPException(
                    status_code=404, detail=f"주식 '{symbol}' 데이터를 찾을 수 없습니다"
                )

            log_info(
                f"주식 시세 조회 성공: {symbol}",
                context={
                    "symbol": symbol,
                    "price": quote_data.get("price"),
                    "data_source": quote_data.get("data_source"),
                    "is_cached": quote_data.get("is_cached", False),
                },
                logger_name="api",
            )

            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "data": quote_data,
                    "timestamp": datetime.now().isoformat(),
                },
            )

    except RateLimitExceededError as e:
        log_warning(
            f"Rate limit 초과: {symbol}",
            category=ErrorCategory.RATE_LIMIT_ERROR,
            severity=ErrorSeverity.MEDIUM,
            context={"symbol": symbol, "error": str(e)},
            logger_name="api",
        )

        raise HTTPException(
            status_code=429,
            detail="요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
        )

    except APIConnectionError as e:
        log_error(
            f"API 연결 오류: {symbol}",
            category=ErrorCategory.API_ERROR,
            severity=ErrorSeverity.HIGH,
            context={"symbol": symbol, "error": str(e)},
            logger_name="api",
        )

        raise HTTPException(
            status_code=503,
            detail="외부 API 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.",
        )

    except DataValidationError as e:
        log_error(
            f"데이터 검증 오류: {symbol}",
            category=ErrorCategory.DATA_VALIDATION_ERROR,
            severity=ErrorSeverity.MEDIUM,
            context={"symbol": symbol, "validation_error": str(e)},
            logger_name="api",
        )

        raise HTTPException(status_code=422, detail=f"데이터 검증 실패: {str(e)}")

    except Exception as e:
        log_critical(
            f"주식 시세 조회 실패: {symbol}",
            category=ErrorCategory.SYSTEM_ERROR,
            severity=ErrorSeverity.CRITICAL,
            context={"symbol": symbol, "error": str(e), "error_type": type(e).__name__},
            logger_name="api",
        )

        capture_exception(e, {"endpoint": "get_stock_quote", "symbol": symbol})

        raise HTTPException(
            status_code=500, detail="주식 시세 조회 중 오류가 발생했습니다"
        )


@router.get("/intraday/{symbol}")
async def get_intraday_data(
    symbol: str,
    interval: str = Query(
        "1min", description="데이터 간격 (1min, 5min, 15min, 30min, 60min)"
    ),
):
    """일중 주식 데이터 조회"""

    log_api_call(
        endpoint="get_intraday_data",
        method="GET",
        context={"symbol": symbol, "interval": interval},
    )

    try:
        async with logging_system.performance_monitor("intraday_data_fetch"):
            intraday_data = await stock_data_service.get_intraday_data(
                symbol.upper(), interval
            )

            if not intraday_data:
                log_warning(
                    f"일중 데이터 없음: {symbol}",
                    category=ErrorCategory.API_ERROR,
                    severity=ErrorSeverity.LOW,
                    context={"symbol": symbol, "interval": interval},
                    logger_name="api",
                )

                raise HTTPException(
                    status_code=404, detail=f"'{symbol}' 일중 데이터를 찾을 수 없습니다"
                )

            log_info(
                f"일중 데이터 조회 성공: {symbol}",
                context={
                    "symbol": symbol,
                    "interval": interval,
                    "data_points": len(intraday_data.get("time_series", [])),
                    "data_source": intraday_data.get("data_source"),
                    "is_cached": intraday_data.get("is_cached", False),
                },
                logger_name="api",
            )

            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "data": intraday_data,
                    "timestamp": datetime.now().isoformat(),
                },
            )

    except RateLimitExceededError as e:
        log_warning(
            f"Rate limit 초과 (일중): {symbol}",
            category=ErrorCategory.RATE_LIMIT_ERROR,
            severity=ErrorSeverity.MEDIUM,
            context={"symbol": symbol, "interval": interval, "error": str(e)},
            logger_name="api",
        )

        raise HTTPException(
            status_code=429,
            detail="요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
        )

    except APIConnectionError as e:
        log_error(
            f"API 연결 오류 (일중): {symbol}",
            category=ErrorCategory.API_ERROR,
            severity=ErrorSeverity.HIGH,
            context={"symbol": symbol, "interval": interval, "error": str(e)},
            logger_name="api",
        )

        raise HTTPException(
            status_code=503,
            detail="외부 API 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.",
        )

    except DataValidationError as e:
        log_error(
            f"데이터 검증 오류 (일중): {symbol}",
            category=ErrorCategory.DATA_VALIDATION_ERROR,
            severity=ErrorSeverity.MEDIUM,
            context={
                "symbol": symbol,
                "interval": interval,
                "validation_error": str(e),
            },
            logger_name="api",
        )

        raise HTTPException(status_code=422, detail=f"데이터 검증 실패: {str(e)}")

    except Exception as e:
        log_critical(
            f"일중 데이터 조회 실패: {symbol}",
            category=ErrorCategory.SYSTEM_ERROR,
            severity=ErrorSeverity.CRITICAL,
            context={
                "symbol": symbol,
                "interval": interval,
                "error": str(e),
                "error_type": type(e).__name__,
            },
            logger_name="api",
        )

        capture_exception(
            e, {"endpoint": "get_intraday_data", "symbol": symbol, "interval": interval}
        )

        raise HTTPException(
            status_code=500, detail="일중 데이터 조회 중 오류가 발생했습니다"
        )


@router.post("/quotes/multiple")
async def get_multiple_quotes(symbols_request: MultipleQuotesRequest):
    """여러 주식의 실시간 시세를 일괄 조회합니다."""

    symbols = symbols_request.symbols

    log_api_call(
        endpoint="get_multiple_quotes_post",
        method="POST",
        context={"symbols_count": len(symbols), "symbols": symbols},
    )

    try:
        async with logging_system.performance_monitor("batch_quotes_fetch"):
            # StockDataService의 batch_quotes 메소드 사용
            results = await stock_data_service.batch_quotes(symbols)

            successful_count = sum(
                1 for result in results.values() if "error" not in result
            )
            failed_count = len(symbols) - successful_count

            log_info(
                f"배치 시세 조회 완료",
                context={
                    "total_symbols": len(symbols),
                    "successful": successful_count,
                    "failed": failed_count,
                    "symbols": symbols,
                },
                logger_name="api",
            )

            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "data": results,
                    "summary": {
                        "total": len(symbols),
                        "successful": successful_count,
                        "failed": failed_count,
                    },
                    "timestamp": datetime.now().isoformat(),
                },
            )

    except RateLimitExceededError as e:
        log_warning(
            f"Rate limit 초과 (배치): {len(symbols)}개 심볼",
            category=ErrorCategory.RATE_LIMIT_ERROR,
            severity=ErrorSeverity.MEDIUM,
            context={
                "symbols_count": len(symbols),
                "symbols": symbols,
                "error": str(e),
            },
            logger_name="api",
        )

        raise HTTPException(
            status_code=429,
            detail="요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
        )

    except Exception as e:
        log_error(
            f"배치 시세 조회 실패: {len(symbols)}개 심볼",
            category=ErrorCategory.API_ERROR,
            severity=ErrorSeverity.HIGH,
            context={
                "symbols_count": len(symbols),
                "symbols": symbols,
                "error": str(e),
            },
            logger_name="api",
        )

        capture_exception(
            e,
            {
                "endpoint": "get_multiple_quotes_post",
                "symbols_count": len(symbols),
                "symbols": symbols,
            },
        )

        raise HTTPException(
            status_code=500, detail="배치 시세 조회 중 오류가 발생했습니다"
        )


@router.get("/quotes/multiple")
async def get_multiple_quotes(
    symbols: str = Query(
        ..., description="쉼표로 구분된 주식 심볼 (예: AAPL,GOOGL,MSFT)"
    )
):
    """쉼표로 구분된 여러 주식의 실시간 시세를 조회합니다."""

    symbol_list = [s.strip().upper() for s in symbols.split(",") if s.strip()]

    if not symbol_list:
        log_warning(
            "빈 심볼 리스트",
            category=ErrorCategory.INPUT_VALIDATION_ERROR,
            severity=ErrorSeverity.LOW,
            context={"raw_symbols": symbols},
            logger_name="api",
        )

        raise HTTPException(status_code=400, detail="유효한 주식 심볼을 입력해주세요")

    if len(symbol_list) > 20:  # 배치 요청 제한
        log_warning(
            f"배치 요청 제한 초과: {len(symbol_list)}개",
            category=ErrorCategory.INPUT_VALIDATION_ERROR,
            severity=ErrorSeverity.MEDIUM,
            context={"symbols_count": len(symbol_list), "symbols": symbol_list},
            logger_name="api",
        )

        raise HTTPException(
            status_code=400, detail="한 번에 최대 20개의 주식만 조회할 수 있습니다"
        )

    log_api_call(
        endpoint="get_multiple_quotes_get",
        method="GET",
        context={"symbols_count": len(symbol_list), "symbols": symbol_list},
    )

    try:
        async with logging_system.performance_monitor("batch_quotes_get"):
            results = await stock_data_service.batch_quotes(symbol_list)

            successful_count = sum(
                1 for result in results.values() if "error" not in result
            )
            failed_count = len(symbol_list) - successful_count

            log_info(
                f"GET 배치 시세 조회 완료",
                context={
                    "total_symbols": len(symbol_list),
                    "successful": successful_count,
                    "failed": failed_count,
                    "symbols": symbol_list,
                },
                logger_name="api",
            )

            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "data": results,
                    "summary": {
                        "total": len(symbol_list),
                        "successful": successful_count,
                        "failed": failed_count,
                    },
                    "timestamp": datetime.now().isoformat(),
                },
            )

    except RateLimitExceededError as e:
        log_warning(
            f"Rate limit 초과 (GET 배치): {len(symbol_list)}개 심볼",
            category=ErrorCategory.RATE_LIMIT_ERROR,
            severity=ErrorSeverity.MEDIUM,
            context={
                "symbols_count": len(symbol_list),
                "symbols": symbol_list,
                "error": str(e),
            },
            logger_name="api",
        )

        raise HTTPException(
            status_code=429,
            detail="요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
        )

    except Exception as e:
        log_error(
            f"GET 배치 시세 조회 실패: {len(symbol_list)}개 심볼",
            category=ErrorCategory.API_ERROR,
            severity=ErrorSeverity.HIGH,
            context={
                "symbols_count": len(symbol_list),
                "symbols": symbol_list,
                "error": str(e),
            },
            logger_name="api",
        )

        capture_exception(
            e,
            {
                "endpoint": "get_multiple_quotes_get",
                "symbols_count": len(symbol_list),
                "symbols": symbol_list,
            },
        )

        raise HTTPException(
            status_code=500, detail="배치 시세 조회 중 오류가 발생했습니다"
        )


@router.post("/start-realtime")
async def start_realtime_updates(
    background_tasks: BackgroundTasks,
    symbols: str = Query(..., description="실시간 업데이트할 심볼들 (쉼표 구분)"),
):
    """실시간 주식 데이터 업데이트 시작"""

    log_api_call(
        endpoint="start_realtime_updates", method="POST", context={"symbols": symbols}
    )

    try:
        async with logging_system.performance_monitor("realtime_setup"):
            symbol_list = [s.strip().upper() for s in symbols.split(",") if s.strip()]

            if len(symbol_list) > 5:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="실시간 업데이트는 최대 5개 종목까지 가능합니다.",
                )

            # 백그라운드에서 실시간 업데이트 시작
            background_tasks.add_task(
                stock_data_service.start_real_time_updates, symbol_list
            )

            log_info(
                f"실시간 업데이트 시작: {len(symbol_list)}개 심볼",
                context={"symbols_count": len(symbol_list), "symbols": symbol_list},
                logger_name="api",
            )

            return JSONResponse(
                {
                    "message": f"{len(symbol_list)}개 종목의 실시간 업데이트가 시작되었습니다.",
                    "symbols": symbol_list,
                    "started_at": datetime.now().isoformat(),
                }
            )

    except Exception as e:
        log_error(
            f"실시간 업데이트 시작 실패: {symbols}",
            category=ErrorCategory.SYSTEM_ERROR,
            severity=ErrorSeverity.HIGH,
            context={"symbols": symbols, "error": str(e)},
            logger_name="api",
        )

        capture_exception(e, {"endpoint": "start_realtime_updates", "symbols": symbols})

        raise HTTPException(
            status_code=500, detail="실시간 업데이트 시작 중 오류가 발생했습니다"
        )


@router.get("/system/stats")
async def get_cache_stats():
    """캐시 및 검증 시스템 상태를 조회합니다."""

    log_api_call(endpoint="get_cache_stats", method="GET")

    try:
        async with logging_system.performance_monitor("system_stats"):
            cache_stats = stock_data_service.get_cache_stats()

            # 검증 시스템 상태 추가
            validation_stats = {
                "validator_enabled": True,
                "supported_sources": [
                    "ALPHA_VANTAGE",
                    "YAHOO_FINANCE",
                    "FINNHUB",
                    "MOCK",
                ],
                "anomaly_detection": True,
                "field_validation": True,
                "timestamp": datetime.now().isoformat(),
            }

            log_info(
                "시스템 상태 조회 완료",
                context={
                    "cache_size": cache_stats.get("cache_size", 0),
                    "cache_hits": cache_stats.get("cache_hits", 0),
                    "cache_misses": cache_stats.get("cache_misses", 0),
                },
                logger_name="api",
            )

            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "cache": cache_stats,
                    "validation": validation_stats,
                    "system_status": "healthy",
                    "timestamp": datetime.now().isoformat(),
                },
            )

    except Exception as e:
        log_error(
            "시스템 상태 조회 실패",
            category=ErrorCategory.SYSTEM_ERROR,
            severity=ErrorSeverity.MEDIUM,
            context={"error": str(e)},
            logger_name="api",
        )

        capture_exception(e, {"endpoint": "get_cache_stats"})

        raise HTTPException(
            status_code=500, detail="시스템 상태 조회 중 오류가 발생했습니다"
        )


@router.delete("/system/cache")
async def clear_cache():
    """캐시 클리어"""

    log_api_call(endpoint="clear_cache", method="DELETE")

    try:
        async with logging_system.performance_monitor("cache_clear"):
            cache_stats_before = stock_data_service.get_cache_stats()
            stock_data_service.clear_cache()

            log_info(
                "캐시 클리어 완료",
                context={
                    "cache_size_before": cache_stats_before.get("cache_size", 0),
                    "cleared_at": datetime.now().isoformat(),
                },
                logger_name="api",
            )

            return JSONResponse(
                {
                    "message": "캐시가 성공적으로 클리어되었습니다.",
                    "cache_size_before": cache_stats_before.get("cache_size", 0),
                    "cleared_at": datetime.now().isoformat(),
                }
            )

    except Exception as e:
        log_error(
            "캐시 클리어 실패",
            category=ErrorCategory.SYSTEM_ERROR,
            severity=ErrorSeverity.MEDIUM,
            context={"error": str(e)},
            logger_name="api",
        )

        capture_exception(e, {"endpoint": "clear_cache"})

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"캐시 클리어 중 오류가 발생했습니다: {str(e)}",
        )


@router.get("/{symbol}")
async def get_stock_detail(symbol: str):
    """개별 종목 상세 정보"""

    log_api_call(endpoint="get_stock_detail", method="GET", context={"symbol": symbol})

    try:
        async with logging_system.performance_monitor("stock_detail_fetch"):
            # TODO: 실제 종목 데이터 API 연동
            if symbol.upper() == "AAPL":
                stock_detail = {
                    "symbol": "AAPL",
                    "name": "Apple Inc.",
                    "name_ko": "애플",
                    "price": 175.84,
                    "change": 2.14,
                    "change_percent": 1.23,
                    "volume": 54789123,
                    "market_cap": 2850000000000,
                    "sector": "Technology",
                    "currency": "USD",
                    "exchange": "NASDAQ",
                    "previous_close": 173.70,
                    "open": 174.20,
                    "day_high": 176.95,
                    "day_low": 173.85,
                    "week_52_high": 199.62,
                    "week_52_low": 164.08,
                    "pe_ratio": 28.45,
                    "dividend_yield": 0.52,
                    "beta": 1.24,
                    "eps": 6.18,
                    "description": "Apple Inc.는 소비자 전자제품, 컴퓨터 소프트웨어 및 온라인 서비스를 설계, 제조 및 판매하는 미국 다국적 기술 회사입니다.",
                }

                log_info(
                    f"종목 상세 정보 조회 성공: {symbol}",
                    context={"symbol": symbol, "price": stock_detail["price"]},
                    logger_name="api",
                )

                return JSONResponse(stock_detail)

            log_warning(
                f"종목 상세 정보 없음: {symbol}",
                category=ErrorCategory.API_ERROR,
                severity=ErrorSeverity.LOW,
                context={"symbol": symbol},
                logger_name="api",
            )

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"종목 '{symbol}'을 찾을 수 없습니다.",
            )

    except HTTPException:
        raise
    except Exception as e:
        log_error(
            f"종목 상세 정보 조회 실패: {symbol}",
            category=ErrorCategory.SYSTEM_ERROR,
            severity=ErrorSeverity.MEDIUM,
            context={"symbol": symbol, "error": str(e)},
            logger_name="api",
        )

        capture_exception(e, {"endpoint": "get_stock_detail", "symbol": symbol})

        raise HTTPException(
            status_code=500, detail="종목 상세 정보 조회 중 오류가 발생했습니다"
        )


@router.get("/{symbol}/history")
async def get_stock_history(
    symbol: str,
    period: str = Query("1M", description="기간 (1D, 1W, 1M, 3M, 6M, 1Y)"),
    interval: str = Query("1D", description="간격 (1M, 5M, 15M, 1H, 1D)"),
):
    """주식 가격 히스토리"""

    log_api_call(
        endpoint="get_stock_history",
        method="GET",
        context={"symbol": symbol, "period": period, "interval": interval},
    )

    try:
        async with logging_system.performance_monitor("stock_history_fetch"):
            # TODO: 실제 히스토리 데이터 API 연동
            mock_history = {
                "symbol": symbol.upper(),
                "period": period,
                "interval": interval,
                "data": [
                    {
                        "timestamp": "2024-06-01T09:30:00Z",
                        "open": 170.50,
                        "high": 172.80,
                        "low": 169.95,
                        "close": 171.45,
                        "volume": 45123456,
                    },
                    {
                        "timestamp": "2024-06-02T09:30:00Z",
                        "open": 171.45,
                        "high": 174.20,
                        "low": 170.85,
                        "close": 173.70,
                        "volume": 52987654,
                    },
                    {
                        "timestamp": "2024-06-03T09:30:00Z",
                        "open": 173.70,
                        "high": 176.95,
                        "low": 173.85,
                        "close": 175.84,
                        "volume": 54789123,
                    },
                ],
            }

            log_info(
                f"주식 히스토리 조회 성공: {symbol}",
                context={
                    "symbol": symbol,
                    "period": period,
                    "interval": interval,
                    "data_points": len(mock_history["data"]),
                },
                logger_name="api",
            )

            return JSONResponse(mock_history)

    except Exception as e:
        log_error(
            f"주식 히스토리 조회 실패: {symbol}",
            category=ErrorCategory.SYSTEM_ERROR,
            severity=ErrorSeverity.MEDIUM,
            context={
                "symbol": symbol,
                "period": period,
                "interval": interval,
                "error": str(e),
            },
            logger_name="api",
        )

        capture_exception(
            e,
            {
                "endpoint": "get_stock_history",
                "symbol": symbol,
                "period": period,
                "interval": interval,
            },
        )

        raise HTTPException(
            status_code=500, detail="주식 히스토리 조회 중 오류가 발생했습니다"
        )
