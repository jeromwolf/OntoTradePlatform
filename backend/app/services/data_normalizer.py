"""
데이터 정규화 및 이상치 탐지 서비스

실시간 주식 데이터의 정규화, 검증, 이상치 탐지를 담당합니다.
"""

import logging
from dataclasses import dataclass
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any, Dict, List, Optional, Tuple

from app.services.data_validator import DataSource, ValidationResult, validator

logger = logging.getLogger(__name__)


@dataclass
class DataQualityMetrics:
    """데이터 품질 메트릭"""

    validation_rate: float  # 검증 성공률
    anomaly_rate: float  # 이상치 발견률
    processing_time: float  # 처리 시간 (ms)
    last_updated: datetime


@dataclass
class AnomalyAlert:
    """이상치 알림"""

    symbol: str
    type: str  # price_spike, volume_spike, data_corruption
    severity: str  # low, medium, high, critical
    message: str
    detected_at: datetime
    current_value: Any
    expected_range: Optional[Tuple[float, float]] = None


class DataNormalizer:
    """데이터 정규화 및 이상치 탐지 클래스"""

    def __init__(self):
        self.price_history: Dict[str, List[float]] = {}
        self.volume_history: Dict[str, List[int]] = {}
        self.anomaly_alerts: List[AnomalyAlert] = []
        self.quality_metrics: Dict[str, DataQualityMetrics] = {}

        # 이상치 탐지 설정
        self.price_spike_threshold = 0.15  # 15% 이상 변동 시 이상치로 판단
        self.volume_spike_threshold = 5.0  # 평균 거래량의 5배 이상 시 이상치
        self.history_window = 20  # 이력 데이터 윈도우 크기

    def normalize_and_validate(
        self, symbol: str, data: Dict[str, Any], source: DataSource = DataSource.UNKNOWN
    ) -> ValidationResult:
        """데이터 정규화 및 검증을 수행합니다."""
        start_time = datetime.now()

        try:
            # 1. 기본 검증
            validation_result = validator.validate_stock_quote(data, source)

            if not validation_result.is_valid:
                self._update_quality_metrics(symbol, False, start_time)
                return validation_result

            normalized_data = validation_result.normalized_data

            # 2. 이상치 탐지
            anomalies = self._detect_anomalies(symbol, normalized_data)

            # 3. 데이터 정규화 강화
            enhanced_data = self._enhance_normalization(normalized_data)

            # 4. 이력 데이터 업데이트
            self._update_history(symbol, enhanced_data)

            # 5. 이상치가 발견된 경우 경고 추가
            if anomalies:
                validation_result.warnings.extend(
                    [alert.message for alert in anomalies]
                )
                self.anomaly_alerts.extend(anomalies)
                # 최근 50개 알림만 유지
                self.anomaly_alerts = self.anomaly_alerts[-50:]

            # 6. 품질 메트릭 업데이트
            self._update_quality_metrics(symbol, True, start_time, len(anomalies) > 0)

            validation_result.normalized_data = enhanced_data
            return validation_result

        except Exception as e:
            logger.error(f"데이터 정규화 중 오류 발생 ({symbol}): {e}")
            self._update_quality_metrics(symbol, False, start_time)
            return ValidationResult(
                is_valid=False,
                errors=[f"정규화 처리 오류: {str(e)}"],
                warnings=[],
                normalized_data=None,
            )

    def _detect_anomalies(
        self, symbol: str, data: Dict[str, Any]
    ) -> List[AnomalyAlert]:
        """이상치 탐지를 수행합니다."""
        anomalies = []
        current_time = datetime.now()

        # 가격 이상치 탐지
        current_price = data.get("price")
        if current_price and symbol in self.price_history:
            price_history = self.price_history[symbol]
            if len(price_history) >= 3:
                recent_prices = price_history[-3:]
                avg_price = sum(recent_prices) / len(recent_prices)

                price_change_rate = abs(current_price - avg_price) / avg_price

                if price_change_rate > self.price_spike_threshold:
                    severity = "critical" if price_change_rate > 0.3 else "high"
                    anomalies.append(
                        AnomalyAlert(
                            symbol=symbol,
                            type="price_spike",
                            severity=severity,
                            message=f"가격 급등/급락 탐지: {price_change_rate:.2%} 변동",
                            detected_at=current_time,
                            current_value=current_price,
                            expected_range=(avg_price * 0.85, avg_price * 1.15),
                        )
                    )

        # 거래량 이상치 탐지
        current_volume = data.get("volume")
        if current_volume and symbol in self.volume_history:
            volume_history = self.volume_history[symbol]
            if len(volume_history) >= 5:
                avg_volume = sum(volume_history[-5:]) / 5

                if (
                    avg_volume > 0
                    and current_volume > avg_volume * self.volume_spike_threshold
                ):
                    anomalies.append(
                        AnomalyAlert(
                            symbol=symbol,
                            type="volume_spike",
                            severity="medium",
                            message=f"거래량 급증 탐지: {current_volume/avg_volume:.1f}배 증가",
                            detected_at=current_time,
                            current_value=current_volume,
                            expected_range=(0, avg_volume * 2),
                        )
                    )

        # 데이터 무결성 검사
        integrity_anomaly = self._check_data_integrity(symbol, data)
        if integrity_anomaly:
            anomalies.append(integrity_anomaly)

        return anomalies

    def _check_data_integrity(
        self, symbol: str, data: Dict[str, Any]
    ) -> Optional[AnomalyAlert]:
        """데이터 무결성을 검사합니다."""
        current_time = datetime.now()

        # 가격 논리 검사
        price = data.get("price")
        high = data.get("high")
        low = data.get("low")

        if price and high and low:
            if not (low <= price <= high):
                return AnomalyAlert(
                    symbol=symbol,
                    type="data_corruption",
                    severity="high",
                    message=f"가격 논리 오류: 현재가({price})가 고가-저가 범위({low}-{high})를 벗어남",
                    detected_at=current_time,
                    current_value=price,
                )

        # 타임스탬프 검사
        timestamp = data.get("timestamp")
        if timestamp:
            try:
                if isinstance(timestamp, str):
                    data_time = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
                else:
                    data_time = timestamp

                time_diff = abs((current_time - data_time).total_seconds())
                # 데이터가 5분 이상 오래되었거나 미래 시간인 경우
                if time_diff > 300:
                    return AnomalyAlert(
                        symbol=symbol,
                        type="data_corruption",
                        severity="medium",
                        message=f"타임스탬프 이상: {time_diff:.0f}초 차이",
                        detected_at=current_time,
                        current_value=timestamp,
                    )
            except Exception as e:
                return AnomalyAlert(
                    symbol=symbol,
                    type="data_corruption",
                    severity="low",
                    message=f"타임스탬프 파싱 오류: {str(e)}",
                    detected_at=current_time,
                    current_value=timestamp,
                )

        return None

    def _enhance_normalization(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """데이터 정규화를 강화합니다."""
        enhanced_data = data.copy()

        # 소수점 정규화 (가격은 2자리, 변동률은 4자리)
        for price_field in ["price", "open", "high", "low", "previous_close"]:
            if price_field in enhanced_data and enhanced_data[price_field] is not None:
                enhanced_data[price_field] = round(float(enhanced_data[price_field]), 2)

        for percent_field in ["change_percent"]:
            if (
                percent_field in enhanced_data
                and enhanced_data[percent_field] is not None
            ):
                enhanced_data[percent_field] = round(
                    float(enhanced_data[percent_field]), 4
                )

        # 거래량 정수화
        if "volume" in enhanced_data and enhanced_data["volume"] is not None:
            enhanced_data["volume"] = int(enhanced_data["volume"])

        # 추가 메타데이터
        enhanced_data["normalized_at"] = datetime.now().isoformat()
        enhanced_data["data_quality"] = self._calculate_data_quality_score(
            enhanced_data
        )

        return enhanced_data

    def _calculate_data_quality_score(self, data: Dict[str, Any]) -> float:
        """데이터 품질 점수를 계산합니다 (0-100)."""
        score = 100.0

        # 필수 필드 존재 여부 (60점)
        required_fields = ["symbol", "price", "timestamp"]
        missing_required = sum(1 for field in required_fields if not data.get(field))
        score -= missing_required * 20

        # 선택 필드 존재 여부 (20점)
        optional_fields = ["open", "high", "low", "volume", "change_percent"]
        missing_optional = sum(1 for field in optional_fields if not data.get(field))
        score -= missing_optional * 4

        # 데이터 논리 일관성 (20점)
        price = data.get("price")
        high = data.get("high")
        low = data.get("low")

        if price and high and low:
            if not (low <= price <= high):
                score -= 20

        return max(0.0, min(100.0, score))

    def _update_history(self, symbol: str, data: Dict[str, Any]):
        """이력 데이터를 업데이트합니다."""
        # 가격 이력 업데이트
        if "price" in data and data["price"] is not None:
            if symbol not in self.price_history:
                self.price_history[symbol] = []

            self.price_history[symbol].append(float(data["price"]))
            # 윈도우 크기 유지
            if len(self.price_history[symbol]) > self.history_window:
                self.price_history[symbol] = self.price_history[symbol][
                    -self.history_window :
                ]

        # 거래량 이력 업데이트
        if "volume" in data and data["volume"] is not None:
            if symbol not in self.volume_history:
                self.volume_history[symbol] = []

            self.volume_history[symbol].append(int(data["volume"]))
            # 윈도우 크기 유지
            if len(self.volume_history[symbol]) > self.history_window:
                self.volume_history[symbol] = self.volume_history[symbol][
                    -self.history_window :
                ]

    def _update_quality_metrics(
        self,
        symbol: str,
        success: bool,
        start_time: datetime,
        has_anomaly: bool = False,
    ):
        """품질 메트릭을 업데이트합니다."""
        processing_time = (datetime.now() - start_time).total_seconds() * 1000

        if symbol not in self.quality_metrics:
            self.quality_metrics[symbol] = DataQualityMetrics(
                validation_rate=1.0 if success else 0.0,
                anomaly_rate=1.0 if has_anomaly else 0.0,
                processing_time=processing_time,
                last_updated=datetime.now(),
            )
        else:
            metrics = self.quality_metrics[symbol]
            # 이동 평균 업데이트 (최근 100개 기준)
            alpha = 0.01  # 가중치
            metrics.validation_rate = (1 - alpha) * metrics.validation_rate + alpha * (
                1.0 if success else 0.0
            )
            metrics.anomaly_rate = (1 - alpha) * metrics.anomaly_rate + alpha * (
                1.0 if has_anomaly else 0.0
            )
            metrics.processing_time = (
                1 - alpha
            ) * metrics.processing_time + alpha * processing_time
            metrics.last_updated = datetime.now()

    def get_recent_anomalies(
        self, symbol: Optional[str] = None, hours: int = 24
    ) -> List[AnomalyAlert]:
        """최근 이상치 알림을 조회합니다."""
        cutoff_time = datetime.now() - timedelta(hours=hours)

        filtered_alerts = [
            alert for alert in self.anomaly_alerts if alert.detected_at >= cutoff_time
        ]

        if symbol:
            filtered_alerts = [
                alert for alert in filtered_alerts if alert.symbol == symbol
            ]

        return sorted(filtered_alerts, key=lambda x: x.detected_at, reverse=True)

    def get_quality_metrics(
        self, symbol: Optional[str] = None
    ) -> Dict[str, DataQualityMetrics]:
        """품질 메트릭을 조회합니다."""
        if symbol:
            return (
                {symbol: self.quality_metrics.get(symbol)}
                if symbol in self.quality_metrics
                else {}
            )
        return self.quality_metrics.copy()

    def clear_old_data(self, hours: int = 168):  # 기본 7일
        """오래된 데이터를 정리합니다."""
        cutoff_time = datetime.now() - timedelta(hours=hours)

        # 오래된 이상치 알림 제거
        self.anomaly_alerts = [
            alert for alert in self.anomaly_alerts if alert.detected_at >= cutoff_time
        ]

        logger.info(f"오래된 데이터 정리 완료: {cutoff_time} 이전 데이터 제거")


# 전역 인스턴스
data_normalizer = DataNormalizer()
