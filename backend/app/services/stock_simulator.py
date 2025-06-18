"""주식 데이터 시뮬레이터."""

import asyncio
import logging
import random
import time
from datetime import datetime
from typing import Dict, List

from app.services.data_normalizer import DataSource, data_normalizer

logger = logging.getLogger(__name__)


class StockDataSimulator:
    """실시간 주식 데이터를 시뮬레이션하는 클래스."""

    def __init__(self):
        self.is_running = False
        self.stock_data: Dict[str, Dict] = {}
        self.simulation_task = None

        # 시뮬레이션할 주식 목록과 기본 데이터
        self.stock_symbols = {
            "AAPL": {"name": "Apple Inc. (애플)", "base_price": 180.00},
            "GOOGL": {"name": "Alphabet Inc. (구글)", "base_price": 140.00},
            "MSFT": {"name": "Microsoft Corp. (마이크로소프트)", "base_price": 350.00},
            "TSLA": {"name": "Tesla Inc. (테슬라)", "base_price": 250.00},
            "AMZN": {"name": "Amazon.com Inc. (아마존)", "base_price": 140.00},
            "NVDA": {"name": "NVIDIA Corp. (엔비디아)", "base_price": 800.00},
            "META": {"name": "Meta Platforms Inc. (메타)", "base_price": 350.00},
            "NFLX": {"name": "Netflix Inc. (넷플릭스)", "base_price": 450.00},
            "AMD": {"name": "Advanced Micro Devices (AMD)", "base_price": 120.00},
            "CRM": {"name": "Salesforce Inc. (세일즈포스)", "base_price": 220.00},
        }

        # 초기 주식 데이터 설정
        self.initialize_stock_data()

    def initialize_stock_data(self):
        """주식 데이터 초기화."""
        for symbol, info in self.stock_symbols.items():
            base_price = info["base_price"]
            initial_data = {
                "symbol": symbol,
                "name": info["name"],
                "price": base_price,
                "previous_close": base_price,
                "open": base_price + random.uniform(-5, 5),
                "high": base_price + random.uniform(0, 10),
                "low": base_price + random.uniform(-10, 0),
                "volume": random.randint(1000000, 50000000),
                "change": 0.0,
                "change_percent": 0.0,
                "timestamp": datetime.now().isoformat(),
            }

            # 데이터 정규화 및 검증 (향상된 버전 사용)
            validation_result = data_normalizer.normalize_and_validate(
                symbol, initial_data, DataSource.MOCK
            )

            if validation_result.is_valid:
                self.stock_data[symbol] = validation_result.normalized_data
                logger.debug(
                    f"{symbol} 초기 데이터 정규화 성공 (품질 점수: {validation_result.normalized_data.get('data_quality', 'N/A')})"
                )

                # 경고가 있는 경우 로깅
                if validation_result.warnings:
                    logger.warning(
                        f"{symbol} 초기 데이터 경고: {', '.join(validation_result.warnings)}"
                    )
            else:
                logger.error(
                    f"{symbol} 초기 데이터 정규화 실패: {validation_result.errors}"
                )
                # 검증 실패 시 기본 데이터 사용
                self.stock_data[symbol] = initial_data

    def generate_price_update(self, symbol: str) -> Dict:
        """특정 주식의 가격 업데이트를 생성."""
        if symbol not in self.stock_data:
            return None

        current_data = self.stock_data[symbol]
        current_price = current_data["price"]

        # 가격 변동 (-2% ~ +2%)
        change_percent = random.uniform(-0.02, 0.02)
        new_price = current_price * (1 + change_percent)

        # 소수점 둘째 자리까지
        new_price = round(new_price, 2)

        # 일일 고가/저가 업데이트
        if new_price > current_data["high"]:
            current_data["high"] = new_price
        if new_price < current_data["low"]:
            current_data["low"] = new_price

        # 변화량 계산
        change = new_price - current_data["previous_close"]
        price_change_percent = (change / current_data["previous_close"]) * 100

        # 거래량 업데이트 (랜덤하게 증가)
        volume_increase = random.randint(1000, 100000)
        new_volume = current_data["volume"] + volume_increase

        # 업데이트할 데이터 생성
        updated_data = {
            "symbol": symbol,
            "price": new_price,
            "previous_close": current_data["previous_close"],
            "open": current_data["open"],
            "high": current_data["high"],
            "low": current_data["low"],
            "volume": new_volume,
            "change": round(change, 2),
            "change_percent": round(price_change_percent, 2),
            "timestamp": datetime.now().isoformat(),
            "name": current_data.get("name", ""),
        }

        # 데이터 정규화 및 검증 (향상된 버전 사용)
        validation_result = data_normalizer.normalize_and_validate(
            symbol, updated_data, DataSource.MOCK
        )

        if validation_result.is_valid:
            # 정규화된 데이터로 업데이트
            self.stock_data[symbol].update(validation_result.normalized_data)

            # 로그 레벨 동적 조정 (이상치 발견 시 INFO, 아니면 DEBUG)
            log_level = logging.INFO if validation_result.warnings else logging.DEBUG
            logger.log(
                log_level,
                f"{symbol} 데이터 업데이트: ${new_price} (품질: {validation_result.normalized_data.get('data_quality', 'N/A')})",
            )

            # 이상치 경고 로깅
            if validation_result.warnings:
                logger.warning(
                    f"{symbol} 이상치 탐지: {', '.join(validation_result.warnings)}"
                )

            return validation_result.normalized_data.copy()
        else:
            # 검증 실패 시 경고 로그 및 이전 데이터 유지
            logger.error(
                f"{symbol} 데이터 업데이트 정규화 실패: {validation_result.errors}"
            )
            # 타임스탬프만 업데이트하여 반환
            current_data["timestamp"] = datetime.now().isoformat()
            return current_data.copy()

    def get_stock_data(self, symbol: str) -> Dict:
        """특정 주식의 현재 데이터를 반환."""
        return self.stock_data.get(symbol)

    def get_real_time_data(self, symbol: str) -> Dict:
        """실시간 주식 데이터를 반환 (WebSocket용)."""
        if symbol in self.stock_data:
            # 최신 가격 업데이트를 생성하여 반환
            return self.generate_price_update(symbol)
        else:
            # 새로운 종목인 경우 기본 데이터로 초기화
            if symbol in self.stock_symbols:
                self.initialize_stock_data()
                return self.stock_data.get(symbol)
            else:
                # 알려지지 않은 종목의 경우 모의 데이터 생성
                mock_data = {
                    "symbol": symbol,
                    "name": f"{symbol} Corp.",
                    "price": round(random.uniform(50, 500), 2),
                    "previous_close": round(random.uniform(50, 500), 2),
                    "open": round(random.uniform(50, 500), 2),
                    "high": round(random.uniform(50, 500), 2),
                    "low": round(random.uniform(50, 500), 2),
                    "volume": random.randint(1000000, 50000000),
                    "change": round(random.uniform(-10, 10), 2),
                    "change_percent": round(random.uniform(-5, 5), 2),
                    "timestamp": datetime.now().isoformat(),
                }
                self.stock_data[symbol] = mock_data
                return mock_data

    async def start_simulation(self):
        """시뮬레이션 시작."""
        if self.is_running:
            logger.info("시뮬레이션이 이미 실행 중입니다.")
            return

        self.is_running = True
        logger.info("주식 데이터 시뮬레이션 시작")

        # 백그라운드 태스크로 실행
        self.simulation_task = asyncio.create_task(self._run_simulation())

    async def stop_simulation(self):
        """시뮬레이션 중지."""
        if not self.is_running:
            logger.info("시뮬레이션이 실행 중이 아닙니다.")
            return

        self.is_running = False

        if self.simulation_task:
            self.simulation_task.cancel()
            try:
                await self.simulation_task
            except asyncio.CancelledError:
                pass

        logger.info("주식 데이터 시뮬레이션 중지")

    async def _run_simulation(self):
        """시뮬레이션 백그라운드 실행."""
        try:
            while self.is_running:
                # 모든 주식의 가격 업데이트
                for symbol in self.stock_symbols.keys():
                    self.generate_price_update(symbol)

                # 2초마다 업데이트
                await asyncio.sleep(2)
        except asyncio.CancelledError:
            logger.info("시뮬레이션 태스크가 취소되었습니다.")
        except Exception as e:
            logger.error(f"시뮬레이션 실행 중 오류: {str(e)}")

    def get_all_stocks(self) -> Dict[str, Dict]:
        """모든 주식 데이터 반환."""
        return self.stock_data.copy()

    def get_stock_by_symbol(self, symbol: str) -> Dict:
        """특정 주식 데이터 반환."""
        return self.stock_data.get(symbol, {})

    def create_market_status(self) -> Dict:
        """시장 상태 정보를 생성."""
        total_stocks = len(self.stock_data)
        gainers = len([s for s in self.stock_data.values() if s["change"] > 0])
        losers = len([s for s in self.stock_data.values() if s["change"] < 0])
        unchanged = total_stocks - gainers - losers

        return {
            "market_open": True,
            "total_stocks": total_stocks,
            "gainers": gainers,
            "losers": losers,
            "unchanged": unchanged,
            "timestamp": datetime.now().isoformat(),
        }

    def get_data_quality_report(self) -> Dict:
        """데이터 품질 보고서를 생성합니다."""
        quality_metrics = data_normalizer.get_quality_metrics()
        recent_anomalies = data_normalizer.get_recent_anomalies(hours=1)

        # 전체 통계 계산
        total_symbols = len(quality_metrics)
        avg_validation_rate = (
            sum(m.validation_rate for m in quality_metrics.values()) / total_symbols
            if total_symbols > 0
            else 0
        )
        avg_anomaly_rate = (
            sum(m.anomaly_rate for m in quality_metrics.values()) / total_symbols
            if total_symbols > 0
            else 0
        )
        avg_processing_time = (
            sum(m.processing_time for m in quality_metrics.values()) / total_symbols
            if total_symbols > 0
            else 0
        )

        return {
            "summary": {
                "total_symbols": total_symbols,
                "avg_validation_rate": round(avg_validation_rate, 4),
                "avg_anomaly_rate": round(avg_anomaly_rate, 4),
                "avg_processing_time_ms": round(avg_processing_time, 2),
                "recent_anomalies_count": len(recent_anomalies),
            },
            "per_symbol_metrics": {
                symbol: {
                    "validation_rate": round(metrics.validation_rate, 4),
                    "anomaly_rate": round(metrics.anomaly_rate, 4),
                    "processing_time_ms": round(metrics.processing_time, 2),
                    "last_updated": metrics.last_updated.isoformat(),
                }
                for symbol, metrics in quality_metrics.items()
            },
            "recent_anomalies": [
                {
                    "symbol": alert.symbol,
                    "type": alert.type,
                    "severity": alert.severity,
                    "message": alert.message,
                    "detected_at": alert.detected_at.isoformat(),
                    "current_value": alert.current_value,
                }
                for alert in recent_anomalies[:10]  # 최근 10개만
            ],
            "timestamp": datetime.now().isoformat(),
        }


# 전역 시뮬레이터 인스턴스
stock_simulator = StockDataSimulator()
