"""
주식 데이터 검증 및 정규화 서비스

이 모듈은 외부 API에서 받은 주식 데이터를 검증하고
일관된 형식으로 정규화하는 기능을 제공합니다.
"""

import logging
import re
from dataclasses import dataclass
from datetime import datetime, timedelta
from decimal import Decimal, InvalidOperation
from enum import Enum
from typing import Any, Dict, List, Optional, Union

logger = logging.getLogger(__name__)


class DataValidationError(Exception):
    """데이터 검증 오류 예외"""

    pass


class DataSource(Enum):
    """데이터 소스 타입"""

    ALPHA_VANTAGE = "Alpha Vantage"
    TWELVE_DATA = "Twelve Data"
    MOCK = "Mock"
    UNKNOWN = "Unknown"


@dataclass
class ValidationResult:
    """검증 결과를 담는 데이터 클래스"""

    is_valid: bool
    errors: List[str]
    warnings: List[str]
    normalized_data: Optional[Dict[str, Any]] = None


class StockDataValidator:
    """주식 데이터 검증 및 정규화 클래스"""

    # 유효한 주식 심볼 패턴 (알파벳 대문자, 1-5자리)
    SYMBOL_PATTERN = re.compile(r"^[A-Z]{1,5}$")

    # 가격 범위 (최소/최대)
    MIN_PRICE = Decimal("0.01")
    MAX_PRICE = Decimal("100000.00")

    # 볼륨 범위
    MIN_VOLUME = 0
    MAX_VOLUME = 10_000_000_000

    # 변동률 범위 (-100% ~ +1000%)
    MIN_CHANGE_PERCENT = -100.0
    MAX_CHANGE_PERCENT = 1000.0

    def __init__(self):
        self.anomaly_threshold = 3.0  # 이상치 탐지 임계값 (표준편차 배수)

    def validate_symbol(self, symbol: str) -> ValidationResult:
        """주식 심볼 검증"""
        errors = []
        warnings = []

        if not symbol:
            errors.append("심볼이 비어있습니다")
            return ValidationResult(False, errors, warnings)

        symbol = symbol.strip().upper()

        if not self.SYMBOL_PATTERN.match(symbol):
            errors.append(f"유효하지 않은 심볼 형식: {symbol}")

        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            normalized_data={"symbol": symbol},
        )

    def validate_price(
        self, price: Union[str, float, int], field_name: str = "price"
    ) -> ValidationResult:
        """가격 데이터 검증"""
        errors = []
        warnings = []
        normalized_price = None

        if price is None:
            errors.append(f"{field_name}이 None입니다")
            return ValidationResult(False, errors, warnings)

        try:
            # 문자열에서 숫자 추출 (예: "$123.45" -> "123.45")
            if isinstance(price, str):
                price_str = re.sub(r"[^\d.-]", "", price)
                normalized_price = Decimal(price_str)
            else:
                normalized_price = Decimal(str(price))

            # 범위 검증
            if normalized_price < self.MIN_PRICE:
                errors.append(
                    f"{field_name}이 최소값({self.MIN_PRICE})보다 작습니다: {normalized_price}"
                )
            elif normalized_price > self.MAX_PRICE:
                errors.append(
                    f"{field_name}이 최대값({self.MAX_PRICE})보다 큽니다: {normalized_price}"
                )

            # 소수점 2자리로 정규화
            normalized_price = round(normalized_price, 2)

        except (InvalidOperation, ValueError, TypeError) as e:
            errors.append(f"{field_name} 변환 오류: {price} ({str(e)})")

        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            normalized_data={
                field_name: float(normalized_price) if normalized_price else None
            },
        )

    def validate_volume(self, volume: Union[str, int, float]) -> ValidationResult:
        """거래량 검증"""
        errors = []
        warnings = []
        normalized_volume = None

        if volume is None:
            errors.append("거래량이 None입니다")
            return ValidationResult(False, errors, warnings)

        try:
            # 문자열에서 숫자 추출
            if isinstance(volume, str):
                volume_str = re.sub(r"[^\d]", "", volume)
                normalized_volume = int(volume_str) if volume_str else 0
            else:
                normalized_volume = int(float(volume))

            # 범위 검증
            if normalized_volume < self.MIN_VOLUME:
                errors.append(f"거래량이 음수입니다: {normalized_volume}")
            elif normalized_volume > self.MAX_VOLUME:
                warnings.append(f"거래량이 매우 큽니다: {normalized_volume:,}")

        except (ValueError, TypeError) as e:
            errors.append(f"거래량 변환 오류: {volume} ({str(e)})")

        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            normalized_data={"volume": normalized_volume},
        )

    def validate_percentage(
        self, percentage: Union[str, float], field_name: str = "change_percent"
    ) -> ValidationResult:
        """백분율 데이터 검증"""
        errors = []
        warnings = []
        normalized_percent = None

        if percentage is None:
            errors.append(f"{field_name}이 None입니다")
            return ValidationResult(False, errors, warnings)

        try:
            # 문자열에서 숫자 추출 (예: "+1.23%" -> "1.23")
            if isinstance(percentage, str):
                percent_str = re.sub(r"[^\d.-]", "", percentage)
                normalized_percent = float(percent_str)
            else:
                normalized_percent = float(percentage)

            # 범위 검증
            if normalized_percent < self.MIN_CHANGE_PERCENT:
                errors.append(
                    f"{field_name}이 허용 범위를 벗어남: {normalized_percent}%"
                )
            elif normalized_percent > self.MAX_CHANGE_PERCENT:
                warnings.append(f"{field_name}이 매우 큽니다: {normalized_percent}%")

            # 소수점 4자리로 정규화
            normalized_percent = round(normalized_percent, 4)

        except (ValueError, TypeError) as e:
            errors.append(f"{field_name} 변환 오류: {percentage} ({str(e)})")

        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            normalized_data={field_name: normalized_percent},
        )

    def validate_timestamp(
        self, timestamp: Union[str, datetime], field_name: str = "timestamp"
    ) -> ValidationResult:
        """타임스탬프 검증"""
        errors = []
        warnings = []
        normalized_timestamp = None

        if timestamp is None:
            errors.append(f"{field_name}이 None입니다")
            return ValidationResult(False, errors, warnings)

        try:
            if isinstance(timestamp, str):
                # 다양한 날짜 형식 파싱 시도
                formats = [
                    "%Y-%m-%d %H:%M:%S",
                    "%Y-%m-%d",
                    "%Y-%m-%dT%H:%M:%S",
                    "%Y-%m-%dT%H:%M:%SZ",
                    "%Y-%m-%dT%H:%M:%S.%f",
                ]

                parsed = False
                for fmt in formats:
                    try:
                        normalized_timestamp = datetime.strptime(timestamp, fmt)
                        parsed = True
                        break
                    except ValueError:
                        continue

                if not parsed:
                    errors.append(f"지원하지 않는 날짜 형식: {timestamp}")
                    return ValidationResult(False, errors, warnings)

            elif isinstance(timestamp, datetime):
                normalized_timestamp = timestamp
            else:
                errors.append(f"유효하지 않은 타임스탬프 타입: {type(timestamp)}")

            # 미래 날짜 검증
            now = datetime.now()
            if normalized_timestamp and normalized_timestamp > now + timedelta(days=1):
                warnings.append(f"미래 날짜입니다: {normalized_timestamp}")

            # 너무 오래된 날짜 검증
            if normalized_timestamp and normalized_timestamp < now - timedelta(
                days=3650
            ):  # 10년
                warnings.append(f"너무 오래된 날짜입니다: {normalized_timestamp}")

        except Exception as e:
            errors.append(f"{field_name} 처리 오류: {str(e)}")

        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            normalized_data={
                field_name: (
                    normalized_timestamp.isoformat() if normalized_timestamp else None
                )
            },
        )

    def detect_price_anomaly(
        self, current_price: float, previous_prices: List[float]
    ) -> bool:
        """가격 이상치 탐지"""
        if not previous_prices or len(previous_prices) < 2:
            return False

        try:
            import numpy as np

            prices_array = np.array(previous_prices)
            mean_price = np.mean(prices_array)
            std_price = np.std(prices_array)

            if std_price == 0:
                return False

            z_score = abs((current_price - mean_price) / std_price)
            return z_score > self.anomaly_threshold

        except ImportError:
            # numpy가 없으면 간단한 방법 사용
            mean_price = sum(previous_prices) / len(previous_prices)
            max_price = max(previous_prices)
            min_price = min(previous_prices)

            price_range = max_price - min_price
            if price_range == 0:
                return False

            deviation = abs(current_price - mean_price)
            return deviation > (price_range * 0.5)  # 50% 이상 벗어나면 이상치

    def validate_stock_quote(
        self, data: Dict[str, Any], source: DataSource = DataSource.UNKNOWN
    ) -> ValidationResult:
        """전체 주식 시세 데이터 검증"""
        all_errors = []
        all_warnings = []
        normalized_data = {}

        # 필수 필드 검증
        required_fields = ["symbol", "price"]
        for field in required_fields:
            if field not in data:
                all_errors.append(f"필수 필드 누락: {field}")

        if all_errors:
            return ValidationResult(False, all_errors, all_warnings)

        # 각 필드별 검증
        validations = [
            self.validate_symbol(data.get("symbol", "")),
            self.validate_price(data.get("price"), "price"),
            (
                self.validate_price(data.get("open"), "open")
                if data.get("open") is not None
                else ValidationResult(True, [], [])
            ),
            (
                self.validate_price(data.get("high"), "high")
                if data.get("high") is not None
                else ValidationResult(True, [], [])
            ),
            (
                self.validate_price(data.get("low"), "low")
                if data.get("low") is not None
                else ValidationResult(True, [], [])
            ),
            (
                self.validate_price(data.get("previous_close"), "previous_close")
                if data.get("previous_close") is not None
                else ValidationResult(True, [], [])
            ),
            (
                self.validate_volume(data.get("volume"))
                if data.get("volume") is not None
                else ValidationResult(True, [], [])
            ),
            (
                self.validate_percentage(data.get("change_percent"))
                if data.get("change_percent") is not None
                else ValidationResult(True, [], [])
            ),
        ]

        # 타임스탬프 검증
        for timestamp_field in ["timestamp", "latest_trading_day"]:
            if data.get(timestamp_field) is not None:
                validations.append(
                    self.validate_timestamp(data.get(timestamp_field), timestamp_field)
                )

        # 검증 결과 통합
        for validation in validations:
            all_errors.extend(validation.errors)
            all_warnings.extend(validation.warnings)
            if validation.normalized_data:
                normalized_data.update(validation.normalized_data)

        # 논리적 일관성 검증
        logical_validation = self._validate_logical_consistency(normalized_data)
        all_errors.extend(logical_validation.errors)
        all_warnings.extend(logical_validation.warnings)

        # 소스 정보 추가
        normalized_data["source"] = source.value
        normalized_data["validated_at"] = datetime.now().isoformat()

        is_valid = len(all_errors) == 0

        # 경고가 있으면 로깅
        if all_warnings:
            logger.warning(
                f"데이터 검증 경고 ({data.get('symbol', 'Unknown')}): {', '.join(all_warnings)}"
            )

        return ValidationResult(is_valid, all_errors, all_warnings, normalized_data)

    def _validate_logical_consistency(self, data: Dict[str, Any]) -> ValidationResult:
        """논리적 일관성 검증"""
        errors = []
        warnings = []

        # 가격 관계 검증
        high = data.get("high")
        low = data.get("low")
        open_price = data.get("open")
        price = data.get("price")

        if high is not None and low is not None:
            if high < low:
                errors.append(f"고가({high})가 저가({low})보다 낮습니다")

        if high is not None and price is not None:
            if price > high:
                warnings.append(f"현재가({price})가 고가({high})보다 높습니다")

        if low is not None and price is not None:
            if price < low:
                warnings.append(f"현재가({price})가 저가({low})보다 낮습니다")

        if open_price is not None and high is not None:
            if open_price > high:
                warnings.append(f"시가({open_price})가 고가({high})보다 높습니다")

        if open_price is not None and low is not None:
            if open_price < low:
                warnings.append(f"시가({open_price})가 저가({low})보다 낮습니다")

        return ValidationResult(len(errors) == 0, errors, warnings)


# 전역 인스턴스
validator = StockDataValidator()
