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
  const { stockData, error, isLoading } = useStockSubscription(symbol);
  const { priceDirection, lastUpdate, priceChange } = useStockChanges(symbol);

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
        </div>
      </div>
    );
  }

  if (isLoading || !stockData) {
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
          <WifiIcon className="h-4 w-4 text-green-500" />
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
            {stockData.change.toFixed(2)} ({stockData.change_percent.toFixed(2)}
            %)
          </span>

          {priceChange.amount !== 0 && (
            <span className="text-gray-500">
              변화: {priceChange.amount > 0 ? "+" : ""}
              {priceChange.amount.toFixed(2)}
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
          <div className="text-xs text-gray-500 pt-2 border-t">
            마지막 업데이트: {lastUpdate.toLocaleTimeString()}
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
  const { getStockData, errors } = useMultipleStockSubscriptions(symbols);

  if (symbols.length === 0) {
    return (
      <div className={`text-center p-8 text-gray-500 ${className}`}>
        <SignalIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>구독 중인 종목이 없습니다</p>
        <p className="text-sm">위에서 종목 코드를 입력해 주세요</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        {symbols.map((symbol) => {
          const stockData = getStockData(symbol);
          const changeColor =
            stockData && stockData.change > 0
              ? "text-green-600"
              : stockData && stockData.change < 0
                ? "text-red-600"
                : "text-gray-600";

          return (
            <div
              key={symbol}
              className="flex items-center justify-between p-3 bg-white border rounded"
            >
              <div className="flex items-center space-x-3">
                <span className="font-medium">{symbol}</span>
                {stockData ? (
                  <span className="text-lg font-semibold">
                    ${stockData.price.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-gray-500">로딩 중...</span>
                )}
              </div>
              {stockData && (
                <span className={`text-sm ${changeColor}`}>
                  {stockData.change > 0 ? "+" : ""}
                  {stockData.change.toFixed(2)} (
                  {stockData.change_percent.toFixed(2)}%)
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {errors.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-600">오류: {errors.join(", ")}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {symbols.map((symbol) => (
          <StockRealTimeDisplay
            key={symbol}
            symbol={symbol}
            className="h-full"
          />
        ))}
      </div>
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
  const { isConnected, connectionStatus } = useWebSocket();

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

  const status = isConnected ? "connected" : "disconnected";
  const config = statusConfig[status] || statusConfig.disconnected;
  const Icon = config.icon;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${config.color}`}></div>
      <Icon className="h-4 w-4 text-gray-600" />
      <span className="text-sm text-gray-700">{config.text}</span>
      {connectionStatus.reconnectAttempts > 0 && (
        <span className="text-xs text-gray-500">
          (재연결 {connectionStatus.reconnectAttempts}회)
        </span>
      )}
    </div>
  );
};
