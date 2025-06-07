import { useState, useEffect, useRef, useCallback, useMemo, useReducer, useContext } from 'react';
import { websocketService } from '../services/websocket';
import type { StockQuote, ConnectionStatus } from '../types/websocket';

/**
 * WebSocket 연결 상태 및 기본 기능을 제공하는 Hook
 */
export const useWebSocket = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    websocketService.getConnectionStatus()
  );
  const [isConnected, setIsConnected] = useState(websocketService.isConnected());

  useEffect(() => {
    // 연결 상태 변경 리스너 등록
    const statusCallback = (status: ConnectionStatus) => {
      setConnectionStatus(status);
      setIsConnected(status === 'connected');
    };
    
    websocketService.onStatusChange(statusCallback);

    // 연결 이벤트 리스너
    const connectCallback = () => {
      setIsConnected(true);
    };
    
    const disconnectCallback = () => {
      setIsConnected(false);
    };

    websocketService.on('connect', connectCallback);
    websocketService.on('disconnect', disconnectCallback);

    // 초기 연결 시도
    if (connectionStatus === 'disconnected') {
      websocketService.connect();
    }

    return () => {
      websocketService.offStatusChange(statusCallback);
      websocketService.off('connect', connectCallback);
      websocketService.off('disconnect', disconnectCallback);
    };
  }, []);

  const connect = useCallback(() => {
    websocketService.connect();
  }, []);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);

  return {
    connectionStatus,
    isConnected,
    connect,
    disconnect,
    reconnectAttempts: websocketService.getReconnectAttempts(),
  };
};

/**
 * 특정 주식의 실시간 시세 데이터를 구독하는 Hook
 */
export const useStockSubscription = (symbol: string | null) => {
  const [stockData, setStockData] = useState<StockQuote | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isConnected } = useWebSocket();

  useEffect(() => {
    if (!symbol || !isConnected) {
      return;
    }

    // 구독 시작
    websocketService.subscribeToStock(symbol);

    // 주식 업데이트 리스너 등록
    const stockUpdateCallback = (data: StockQuote) => {
      if (data.symbol === symbol.toUpperCase()) {
        setStockData(data);
        setLastUpdate(new Date().toISOString());
        setError(null);
      }
    };

    // 구독 확인 리스너 등록
    const subscriptionConfirmedCallback = (data: { symbol: string; status: string }) => {
      if (data.symbol === symbol.toUpperCase()) {
        console.log(`${data.symbol} 구독 확인됨`);
      }
    };

    // 오류 리스너 등록
    const errorCallback = (errorMessage: string) => {
      setError(errorMessage);
    };

    websocketService.on('stock_update', stockUpdateCallback);
    websocketService.on('subscription_confirmed', subscriptionConfirmedCallback);
    websocketService.on('error', errorCallback);

    return () => {
      // 구독 해제
      websocketService.unsubscribeFromStock(symbol);
      websocketService.off('stock_update', stockUpdateCallback);
      websocketService.off('subscription_confirmed', subscriptionConfirmedCallback);
      websocketService.off('error', errorCallback);
    };
  }, [symbol, isConnected]);

  const resubscribe = useCallback(() => {
    if (symbol && isConnected) {
      websocketService.unsubscribeFromStock(symbol);
      setTimeout(() => {
        websocketService.subscribeToStock(symbol);
      }, 100);
    }
  }, [symbol, isConnected]);

  return {
    stockData,
    lastUpdate,
    error,
    isLoading: !stockData && isConnected && !error,
    isSubscribed: !!symbol && isConnected,
    resubscribe,
  };
};

/**
 * 여러 주식의 실시간 시세 데이터를 관리하는 Hook
 */
export const useMultipleStockSubscriptions = (symbols: string[]) => {
  const [stocksData, setStocksData] = useState<Map<string, StockQuote>>(new Map());
  const [lastUpdates, setLastUpdates] = useState<Map<string, string>>(new Map());
  const [errors, setErrors] = useState<string[]>([]);
  const { isConnected } = useWebSocket();
  const previousSymbolsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!isConnected || symbols.length === 0) {
      return;
    }

    const currentSymbols = new Set(symbols.map(s => s.toUpperCase()));
    const previousSymbols = new Set(previousSymbolsRef.current);

    // 새로 추가된 심볼 구독
    const newSymbols = symbols.filter(symbol => 
      !previousSymbols.has(symbol.toUpperCase())
    );
    
    // 제거된 심볼 구독 해제
    const removedSymbols = previousSymbolsRef.current.filter(symbol => 
      !currentSymbols.has(symbol.toUpperCase())
    );

    // 제거된 심볼들 처리
    removedSymbols.forEach(symbol => {
      websocketService.unsubscribeFromStock(symbol);
      setStocksData(prev => {
        const newMap = new Map(prev);
        newMap.delete(symbol.toUpperCase());
        return newMap;
      });
      setLastUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(symbol.toUpperCase());
        return newMap;
      });
    });

    // 새로운 심볼들 구독
    newSymbols.forEach(symbol => {
      websocketService.subscribeToStock(symbol);
    });

    previousSymbolsRef.current = symbols.map(s => s.toUpperCase());

    // 주식 업데이트 리스너
    const stockUpdateCallback = (data: StockQuote) => {
      if (currentSymbols.has(data.symbol)) {
        setStocksData(prev => new Map(prev.set(data.symbol, data)));
        setLastUpdates(prev => new Map(prev.set(data.symbol, new Date().toISOString())));
        
        // 해당 심볼의 오류 제거
        setErrors(prev => prev.filter(error => !error.includes(data.symbol)));
      }
    };

    // 오류 리스너
    const errorCallback = (errorMessage: string) => {
      setErrors(prev => [...prev, errorMessage]);
    };

    websocketService.on('stock_update', stockUpdateCallback);
    websocketService.on('error', errorCallback);

    return () => {
      websocketService.off('stock_update', stockUpdateCallback);
      websocketService.off('error', errorCallback);
    };
  }, [symbols, isConnected]);

  const getStockData = useCallback((symbol: string): StockQuote | null => {
    return stocksData.get(symbol.toUpperCase()) || null;
  }, [stocksData]);

  const getLastUpdate = useCallback((symbol: string): string | null => {
    return lastUpdates.get(symbol.toUpperCase()) || null;
  }, [lastUpdates]);

  const resubscribeAll = useCallback(() => {
    symbols.forEach(symbol => {
      websocketService.unsubscribeFromStock(symbol);
      setTimeout(() => {
        websocketService.subscribeToStock(symbol);
      }, 100);
    });
  }, [symbols]);

  return {
    stocksData: Object.fromEntries(stocksData),
    lastUpdates: Object.fromEntries(lastUpdates),
    errors,
    subscribedSymbols: symbols,
    getStockData,
    getLastUpdate,
    resubscribeAll,
    isConnected,
  };
};

/**
 * 실시간 주식 데이터의 변화를 추적하는 Hook
 */
export const useStockChanges = (symbol: string | null, trackingDuration = 60000) => {
  const { stockData } = useStockSubscription(symbol);
  const [priceHistory, setPriceHistory] = useState<Array<{
    price: number;
    timestamp: string;
    change: number;
  }>>([]);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'neutral'>('neutral');

  useEffect(() => {
    if (!stockData) return;

    const now = new Date().toISOString();
    
    setPriceHistory(prev => {
      const newHistory = [...prev, {
        price: stockData.price,
        timestamp: now,
        change: stockData.change,
      }];

      // 지정된 기간을 초과하는 데이터 제거
      const cutoffTime = new Date(Date.now() - trackingDuration);
      return newHistory.filter(entry => 
        new Date(entry.timestamp) > cutoffTime
      );
    });

    // 가격 방향 설정
    if (stockData.change > 0) {
      setPriceDirection('up');
    } else if (stockData.change < 0) {
      setPriceDirection('down');
    } else {
      setPriceDirection('neutral');
    }
  }, [stockData, trackingDuration]);

  const getPriceChangePercentage = useCallback(() => {
    if (priceHistory.length < 2) return 0;
    
    const oldest = priceHistory[0];
    const newest = priceHistory[priceHistory.length - 1];
    
    return ((newest.price - oldest.price) / oldest.price) * 100;
  }, [priceHistory]);

  const getPriceChange = useCallback((period: 'minute' | 'hour' | 'day' = 'minute') => {
    if (priceHistory.length < 2) return 0;
    
    const periodMs = {
      minute: 60 * 1000,
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000
    };
    
    const cutoffTime = new Date(Date.now() - periodMs[period]);
    const filteredHistory = priceHistory.filter(entry => 
      new Date(entry.timestamp) > cutoffTime
    );
    
    if (filteredHistory.length < 2) return 0;
    
    const oldest = filteredHistory[0];
    const newest = filteredHistory[filteredHistory.length - 1];
    
    return newest.price - oldest.price;
  }, [priceHistory]);

  return {
    priceHistory,
    priceDirection,
    getPriceChangePercentage,
    getPriceChange,
    trackingDuration,
  };
};

/**
 * WebSocket 연결 상태를 모니터링하는 Hook
 */
export const useWebSocketMonitor = () => {
  const { connectionStatus, isConnected, reconnectAttempts } = useWebSocket();
  const [connectionHistory, setConnectionHistory] = useState<Array<{
    status: ConnectionStatus;
    timestamp: string;
  }>>([]);

  useEffect(() => {
    setConnectionHistory(prev => [...prev, {
      status: connectionStatus,
      timestamp: new Date().toISOString(),
    }]);
  }, [connectionStatus]);

  const getConnectionStats = useCallback(() => {
    const total = connectionHistory.length;
    const connected = connectionHistory.filter(h => h.status === 'connected').length;
    const disconnected = connectionHistory.filter(h => h.status === 'disconnected').length;
    const connecting = connectionHistory.filter(h => h.status === 'connecting').length;
    const error = connectionHistory.filter(h => h.status === 'error').length;

    return {
      total,
      connected,
      disconnected,
      connecting,
      error,
      connectionRate: total > 0 ? (connected / total) * 100 : 0,
    };
  }, [connectionHistory]);

  return {
    connectionStatus,
    isConnected,
    reconnectAttempts,
    connectionHistory,
    getConnectionStats,
  };
};
