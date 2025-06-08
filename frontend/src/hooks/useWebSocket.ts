import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import websocketService from "../services/websocket";

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
  high: number;
  low: number;
  open: number;
  volume: number;
  market_cap?: number;
  pe_ratio?: number;
  dividend_yield?: number;
  timestamp: string;
}

interface ConnectionStatus {
  connected: boolean;
  reconnectAttempts: number;
}

/**
 * WebSocket 연결 상태 및 기본 기능을 제공하는 Hook
 */
export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    reconnectAttempts: 0,
  });

  useEffect(() => {
    // 연결 상태 업데이트
    const updateStatus = () => {
      const status = websocketService.getConnectionStatus();
      setConnectionStatus(status);
      setIsConnected(status.connected);
    };

    // 이벤트 리스너 등록
    const handleConnected = () => {
      setIsConnected(true);
      updateStatus();
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      updateStatus();
    };

    const handleError = (error: string) => {
      console.error("WebSocket 오류:", error);
      setIsConnected(false);
      updateStatus();
    };

    websocketService.addEventListener("connected", handleConnected);
    websocketService.addEventListener("disconnected", handleDisconnected);
    websocketService.addEventListener("error", handleError);

    // 초기 상태 설정
    updateStatus();

    return () => {
      websocketService.removeEventListener("connected", handleConnected);
      websocketService.removeEventListener("disconnected", handleDisconnected);
      websocketService.removeEventListener("error", handleError);
    };
  }, []);

  const subscribe = useCallback((symbol: string) => {
    websocketService.subscribe(symbol);
  }, []);

  const unsubscribe = useCallback((symbol: string) => {
    websocketService.unsubscribe(symbol);
  }, []);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);

  return {
    isConnected,
    connectionStatus,
    subscribe,
    unsubscribe,
    disconnect,
  };
};

/**
 * 단일 종목 실시간 주식 데이터 구독 Hook
 */
export const useStockSubscription = (symbol: string | null) => {
  const [stockData, setStockData] = useState<StockQuote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, subscribe, unsubscribe } = useWebSocket();

  useEffect(() => {
    if (!isConnected || !symbol) {
      return;
    }

    const upperSymbol = symbol.toUpperCase();
    let cleanupTimer: NodeJS.Timeout;

    const stockUpdateCallback = (updateData: any) => {
      if (updateData.symbol?.toUpperCase() === upperSymbol) {
        setStockData(updateData.data || updateData);
        setError(null);
      }
    };

    const errorCallback = (errorMessage: string) => {
      setError(errorMessage);
    };

    // 구독 시작
    subscribe(upperSymbol);
    websocketService.addEventListener("stock_data", stockUpdateCallback);
    websocketService.addEventListener("error", errorCallback);

    return () => {
      // cleanup을 지연시켜 즉시 구독/해제 방지
      cleanupTimer = setTimeout(() => {
        unsubscribe(upperSymbol);
        websocketService.removeEventListener("stock_data", stockUpdateCallback);
        websocketService.removeEventListener("error", errorCallback);
      }, 1000); // 1초 지연
    };
  }, [symbol, isConnected]);

  return {
    stockData,
    error,
    isLoading: isConnected && symbol && !stockData && !error,
  };
};

/**
 * 다중 종목 실시간 주식 데이터 구독 Hook
 */
export const useMultipleStockSubscriptions = (symbols: string[]) => {
  const [stocksData, setStocksData] = useState<Map<string, StockQuote>>(
    new Map()
  );
  const [errors, setErrors] = useState<string[]>([]);
  const { isConnected, subscribe, unsubscribe } = useWebSocket();
  const previousSymbolsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!isConnected || symbols.length === 0) {
      return;
    }

    const currentSymbols = symbols.map((s) => s.toUpperCase());
    const previousSymbols = previousSymbolsRef.current;

    // 변경된 심볼들 계산
    const removedSymbols = previousSymbols.filter(
      (symbol) => !currentSymbols.includes(symbol)
    );
    const newSymbols = currentSymbols.filter(
      (symbol) => !previousSymbols.includes(symbol)
    );

    // 제거된 심볼들 처리
    removedSymbols.forEach((symbol) => {
      unsubscribe(symbol);
    });

    // 새로운 심볼들 구독
    newSymbols.forEach((symbol) => {
      subscribe(symbol);
    });

    previousSymbolsRef.current = symbols.map((s) => s.toUpperCase());
  }, [symbols, isConnected]);

  useEffect(() => {
    if (!isConnected) {
      return;
    }

    // 주식 업데이트 리스너
    const stockUpdateCallback = (updateData: any) => {
      const symbol = updateData.symbol?.toUpperCase();
      if (symbols.some((s) => s.toUpperCase() === symbol)) {
        setStocksData((prev) =>
          new Map(prev.set(symbol, updateData.data || updateData))
        );
      }
    };

    // 에러 리스너
    const errorCallback = (errorMessage: string) => {
      setErrors((prev) => [...prev, errorMessage]);
    };

    websocketService.addEventListener("stock_data", stockUpdateCallback);
    websocketService.addEventListener("error", errorCallback);

    return () => {
      websocketService.removeEventListener("stock_data", stockUpdateCallback);
      websocketService.removeEventListener("error", errorCallback);
    };
  }, [symbols, isConnected]);

  const getStockData = useCallback(
    (symbol: string): StockQuote | null => {
      return stocksData.get(symbol.toUpperCase()) || null;
    },
    [stocksData]
  );

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const resubscribeAll = useCallback(() => {
    symbols.forEach((symbol) => {
      unsubscribe(symbol);
      setTimeout(() => {
        subscribe(symbol);
      }, 100);
    });
  }, [symbols, subscribe, unsubscribe]);

  return {
    stocksData,
    getStockData,
    errors,
    clearErrors,
    resubscribeAll,
    isLoading: isConnected && symbols.length > 0 && stocksData.size === 0,
  };
};

/**
 * 주식 가격 변화 추적 훅
 */
export const useStockChanges = (symbol: string) => {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [priceDirection, setPriceDirection] = useState<
    "up" | "down" | "neutral"
  >("neutral");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const { isConnected, subscribe, unsubscribe } = useWebSocket();

  useEffect(() => {
    if (!isConnected || !symbol) {
      return;
    }

    const upperSymbol = symbol.toUpperCase();

    const stockUpdateCallback = (updateData: any) => {
      if (updateData.symbol?.toUpperCase() === upperSymbol) {
        const newPrice = updateData.data?.price || updateData.price;

        setPreviousPrice(currentPrice);
        setCurrentPrice(newPrice);
        setLastUpdate(new Date());

        if (currentPrice !== null) {
          if (newPrice > currentPrice) {
            setPriceDirection("up");
          } else if (newPrice < currentPrice) {
            setPriceDirection("down");
          } else {
            setPriceDirection("neutral");
          }
        }
      }
    };

    subscribe(upperSymbol);
    websocketService.addEventListener("stock_data", stockUpdateCallback);

    return () => {
      unsubscribe(upperSymbol);
      websocketService.removeEventListener("stock_data", stockUpdateCallback);
    };
  }, [symbol, isConnected, currentPrice, subscribe, unsubscribe]);

  const getPriceChange = () => {
    if (currentPrice === null || previousPrice === null) {
      return { amount: 0, percentage: 0 };
    }

    const amount = currentPrice - previousPrice;
    const percentage = (amount / previousPrice) * 100;

    return { amount, percentage };
  };

  return {
    currentPrice,
    previousPrice,
    priceDirection,
    lastUpdate,
    priceChange: getPriceChange(),
  };
};

/**
 * WebSocket 연결 모니터링 훅
 */
export const useWebSocketMonitor = () => {
  const [connectionHistory, setConnectionHistory] = useState<
    Array<{
      status: string;
      timestamp: Date;
    }>
  >([]);
  const [stats, setStats] = useState({
    totalConnections: 0,
    totalDisconnections: 0,
    totalErrors: 0,
    uptime: 0,
  });

  const { isConnected, connectionStatus } = useWebSocket();

  useEffect(() => {
    const handleConnected = () => {
      setConnectionHistory((prev) => [
        ...prev,
        {
          status: "connected",
          timestamp: new Date(),
        },
      ]);
      setStats((prev) => ({
        ...prev,
        totalConnections: prev.totalConnections + 1,
      }));
    };

    const handleDisconnected = () => {
      setConnectionHistory((prev) => [
        ...prev,
        {
          status: "disconnected",
          timestamp: new Date(),
        },
      ]);
      setStats((prev) => ({
        ...prev,
        totalDisconnections: prev.totalDisconnections + 1,
      }));
    };

    const handleError = (error: string) => {
      setConnectionHistory((prev) => [
        ...prev,
        {
          status: `error: ${error}`,
          timestamp: new Date(),
        },
      ]);
      setStats((prev) => ({
        ...prev,
        totalErrors: prev.totalErrors + 1,
      }));
    };

    websocketService.addEventListener("connected", handleConnected);
    websocketService.addEventListener("disconnected", handleDisconnected);
    websocketService.addEventListener("error", handleError);

    return () => {
      websocketService.removeEventListener("connected", handleConnected);
      websocketService.removeEventListener("disconnected", handleDisconnected);
      websocketService.removeEventListener("error", handleError);
    };
  }, []);

  return {
    isConnected,
    connectionStatus,
    connectionHistory,
    stats,
  };
};
