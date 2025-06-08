import React, { useState } from "react";
import {
  useStockSubscription,
  useStockChanges,
  useWebSocket,
  useMultipleStockSubscriptions,
} from "../../hooks/useWebSocket";
import { Button } from "../ui/Button";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  SignalIcon,
  WifiIcon,
} from "@heroicons/react/24/solid";

interface StockRealTimeDisplayProps {
  symbol: string;
  className?: string;
}

/**
 * 단일 종목의 실시간 시세를 표시하는 컴포넌트
 */
export const StockRealTimeDisplay: React.FC<StockRealTimeDisplayProps> = ({
  symbol,
  className = "",
}) => {
  const { stockData, lastUpdate, error, isSubscribed, resubscribe } =
    useStockSubscription(symbol);
  const { priceDirection, getPriceChange } = useStockChanges(symbol);
  const minuteChange = getPriceChange("minute");

  if (error) {
    return (
      <div
        className={`p-4 border border-red-200 rounded-lg bg-red-50 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-red-800">
              {symbol.toUpperCase()}
            </h3>
            <p className="text-sm text-red-600">연결 오류: {error}</p>
          </div>
          <Button onClick={resubscribe} variant="secondary" size="sm">
            재연결
          </Button>
        </div>
      </div>
    );
  }

  if (!stockData) {
    return (
      <div
        className={`p-4 border border-gray-200 rounded-lg bg-gray-50 ${className}`}
      >
        <div className="flex items-center space-x-2">
          <SignalIcon className="h-4 w-4 animate-pulse text-gray-400" />
          <span className="text-gray-600">
            {symbol.toUpperCase()} 데이터 로딩 중...
          </span>
        </div>
      </div>
    );
  }

  const priceColor =
    priceDirection === "up"
      ? "text-green-600"
      : priceDirection === "down"
        ? "text-red-600"
        : "text-gray-900";

  const changeColor =
    stockData.change > 0
      ? "text-green-600"
      : stockData.change < 0
        ? "text-red-600"
        : "text-gray-600";

  return (
    <div
      className={`p-4 border border-gray-200 rounded-lg bg-white ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg">{stockData.symbol}</h3>
        <div className="flex items-center space-x-1">
          {isSubscribed && <WifiIcon className="h-4 w-4 text-green-500" />}
          {priceDirection === "up" && (
            <ArrowUpIcon className="h-4 w-4 text-green-500" />
          )}
          {priceDirection === "down" && (
            <ArrowDownIcon className="h-4 w-4 text-red-500" />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className={`text-2xl font-bold ${priceColor}`}>
          ${stockData.price.toFixed(2)}
        </div>

        <div className="flex items-center space-x-4 text-sm">
          <span className={changeColor}>
            {stockData.change > 0 ? "+" : ""}
            {stockData.change.toFixed(2)}(
            {parseFloat(stockData.change_percent).toFixed(2)}%)
          </span>

          {minuteChange && (
            <span className="text-gray-500">
              1분: {minuteChange > 0 ? "+" : ""}
              {minuteChange.toFixed(2)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
          <div>
            <span className="block">
              시가: ${stockData.open?.toFixed(2) || "N/A"}
            </span>
            <span className="block">
              고가: ${stockData.high?.toFixed(2) || "N/A"}
            </span>
          </div>
          <div>
            <span className="block">
              저가: ${stockData.low?.toFixed(2) || "N/A"}
            </span>
            <span className="block">
              거래량: {stockData.volume?.toLocaleString() || "N/A"}
            </span>
          </div>
        </div>

        {lastUpdate && (
          <div className="text-xs text-gray-400 pt-2 border-t">
            마지막 업데이트: {new Date(lastUpdate).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

interface MultiStockDisplayProps {
  symbols: string[];
  className?: string;
  compact?: boolean;
}

/**
 * 여러 종목의 실시간 시세를 표시하는 컴포넌트
 */
export const MultiStockDisplay: React.FC<MultiStockDisplayProps> = ({
  symbols,
  className = "",
  compact = false,
}) => {
  const { stocksData, errors, resubscribeAll } =
    useMultipleStockSubscriptions(symbols);

  if (!stocksData) {
    return (
      <div
        className={`p-4 border border-yellow-200 rounded-lg bg-yellow-50 ${className}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-yellow-800">WebSocket 연결 중...</span>
          <SignalIcon className="h-5 w-5 animate-pulse text-yellow-600" />
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        {symbols.map((symbol) => {
          const data = stocksData[symbol.toUpperCase()];
          if (!data) {
            return (
              <div
                key={symbol}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span className="text-sm text-gray-600">
                  {symbol.toUpperCase()}
                </span>
                <span className="text-xs text-gray-400">로딩 중...</span>
              </div>
            );
          }

          const changeColor =
            data.change > 0
              ? "text-green-600"
              : data.change < 0
                ? "text-red-600"
                : "text-gray-600";

          return (
            <div
              key={symbol}
              className="flex items-center justify-between p-2 bg-white border rounded"
            >
              <span className="font-medium text-sm">{data.symbol}</span>
              <div className="text-right">
                <div className="font-semibold">${data.price.toFixed(2)}</div>
                <div className={`text-xs ${changeColor}`}>
                  {data.change > 0 ? "+" : ""}
                  {parseFloat(data.change_percent).toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}

        {errors.length > 0 && (
          <div className="p-2 bg-red-50 border border-red-200 rounded">
            <p className="text-xs text-red-600">{errors.length}개 오류 발생</p>
            <Button
              onClick={resubscribeAll}
              variant="secondary"
              size="sm"
              className="mt-1"
            >
              재연결
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">실시간 주식 현황</h3>
        <Button onClick={resubscribeAll} variant="secondary" size="sm">
          모두 재연결
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {symbols.map((symbol) => (
          <StockRealTimeDisplay key={symbol} symbol={symbol} />
        ))}
      </div>

      {errors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-red-800 mb-2">연결 오류</h4>
          <ul className="text-sm text-red-600 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

interface StockSubscriptionManagerProps {
  subscribedSymbols?: string[];
  onAddSymbol?: (symbol: string) => void;
  onRemoveSymbol?: (symbol: string) => void;
  onReconnectAll?: () => void;
}

/**
 * 실시간 종목 검색 및 구독 관리 컴포넌트
 */
export const StockSubscriptionManager: React.FC<
  StockSubscriptionManagerProps
> = ({
  subscribedSymbols: externalSymbols,
  onAddSymbol,
  onRemoveSymbol,
  onReconnectAll,
}) => {
  const [internalSymbols, setInternalSymbols] = useState<string[]>([
    "AAPL",
    "GOOGL",
    "MSFT",
  ]);
  const [newSymbol, setNewSymbol] = useState("");

  // 외부에서 전달받은 symbols가 있으면 사용, 없으면 내부 state 사용
  const subscribedSymbols = externalSymbols || internalSymbols;
  const setSubscribedSymbols = onAddSymbol ? undefined : setInternalSymbols;

  const addSymbol = () => {
    const symbol = newSymbol.trim().toUpperCase();
    if (symbol && !subscribedSymbols.includes(symbol)) {
      if (onAddSymbol) {
        onAddSymbol(symbol);
      } else if (setSubscribedSymbols) {
        setSubscribedSymbols((prev) => [...prev, symbol]);
      }
      setNewSymbol("");
    }
  };

  const removeSymbol = (symbol: string) => {
    if (onRemoveSymbol) {
      onRemoveSymbol(symbol);
    } else if (setSubscribedSymbols) {
      setSubscribedSymbols((prev) => prev.filter((s) => s !== symbol));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">📈 실시간 주식 모니터링</h2>
        <div className="flex items-center space-x-3">
          <ConnectionStatus />
          {onReconnectAll && (
            <Button onClick={onReconnectAll} variant="secondary" size="sm">
              모두 재연결
            </Button>
          )}
        </div>
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
          onKeyPress={(e) => e.key === "Enter" && addSymbol()}
          placeholder="종목 코드 입력 (예: TSLA)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button onClick={addSymbol} disabled={!newSymbol.trim()}>
          추가
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {subscribedSymbols.map((symbol) => (
          <div
            key={symbol}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-100 rounded-full"
          >
            <span className="text-sm font-medium">{symbol}</span>
            <button
              onClick={() => removeSymbol(symbol)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <MultiStockDisplay symbols={subscribedSymbols} />
    </div>
  );
};

/**
 * WebSocket 연결 상태를 표시하는 컴포넌트
 */
export const ConnectionStatus: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const { connectionStatus, reconnectAttempts } = useWebSocket();

  const statusConfig = {
    connected: {
      color: "bg-green-500",
      text: "연결됨",
      icon: WifiIcon,
    },
    connecting: {
      color: "bg-yellow-500",
      text: "연결 중...",
      icon: SignalIcon,
    },
    reconnecting: {
      color: "bg-orange-500",
      text: "재연결 중...",
      icon: SignalIcon,
    },
    disconnected: {
      color: "bg-gray-400",
      text: "연결 해제",
      icon: WifiIcon,
    },
    error: {
      color: "bg-red-500",
      text: "연결 오류",
      icon: WifiIcon,
    },
  };

  const config = statusConfig[connectionStatus];
  const Icon = config.icon;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${config.color}`}></div>
      <Icon className="h-4 w-4 text-gray-600" />
      <span className="text-sm text-gray-700">{config.text}</span>
      {reconnectAttempts > 0 && (
        <span className="text-xs text-gray-500">
          (재연결 {reconnectAttempts}회)
        </span>
      )}
    </div>
  );
};
