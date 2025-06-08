import React, { useState, useEffect } from "react";
import {
  StockSubscriptionManager,
  ConnectionStatus,
} from "../components/trading/StockRealTimeDisplay";
import { useWebSocketMonitor } from "../hooks/useWebSocket";
import { Button } from "../components/ui/Button";
import { websocketService } from "../services/websocket";
import DataQualityDashboard from "../components/DataQuality/DataQualityDashboard";

/**
 * WebSocket 기능을 테스트하고 모니터링하는 페이지
 */
const WebSocketTestPage: React.FC = () => {
  const [showMonitor, setShowMonitor] = useState(false);
  const [subscribedSymbols, setSubscribedSymbols] = useState<string[]>([
    "AAPL",
    "GOOGL",
    "MSFT",
  ]);
  const {
    connectionHistory,
    reconnectAttempts,
    getConnectionStats,
    isConnected,
  } = useWebSocketMonitor();

  const stats = getConnectionStats();
  const successRate =
    stats.total > 0 ? (stats.connected / stats.total) * 100 : 0;

  useEffect(() => {
    if (isConnected && subscribedSymbols.length > 0) {
      console.log(
        "WebSocket 연결됨, 기본 종목들 구독 시작:",
        subscribedSymbols,
      );
      subscribedSymbols.forEach((symbol) => {
        websocketService.subscribeToStock(symbol);
        console.log(`${symbol} 구독 요청 전송`);
      });
    }
  }, [isConnected, subscribedSymbols]);

  const handleAddSymbol = (symbol: string) => {
    const upperSymbol = symbol.toUpperCase();
    if (!subscribedSymbols.includes(upperSymbol)) {
      setSubscribedSymbols((prev) => [...prev, upperSymbol]);
      if (isConnected) {
        websocketService.subscribeToStock(upperSymbol);
      }
    }
  };

  const handleRemoveSymbol = (symbol: string) => {
    setSubscribedSymbols((prev) => prev.filter((s) => s !== symbol));
    if (isConnected) {
      websocketService.unsubscribeFromStock(symbol);
    }
  };

  const handleReconnectAll = () => {
    websocketService.disconnect();
    setTimeout(() => {
      websocketService.connect();
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            🔗 WebSocket 실시간 데이터 테스트
          </h1>
          <p className="text-gray-600 mt-2">
            실시간 주식 데이터 연결 상태를 확인하고 종목을 구독해보세요
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <ConnectionStatus />
          <Button
            onClick={() => setShowMonitor(!showMonitor)}
            variant={showMonitor ? "primary" : "secondary"}
            size="sm"
          >
            {showMonitor ? "모니터 숨기기" : "모니터 보기"}
          </Button>
        </div>
      </div>

      {/* 연결 상태 모니터 */}
      {showMonitor && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">📊 연결 상태 모니터</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {successRate.toFixed(1)}%
              </div>
              <div className="text-sm text-blue-800">연결 성공률</div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {reconnectAttempts}
              </div>
              <div className="text-sm text-yellow-800">재연결 시도</div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div
                className={`text-2xl font-bold ${isConnected ? "text-green-600" : "text-red-600"}`}
              >
                {isConnected ? "✅ 정상" : "⚠️ 불안정"}
              </div>
              <div className="text-sm text-gray-800">연결 상태</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">연결 히스토리</h3>
            <div className="max-h-40 overflow-y-auto">
              <div className="space-y-2">
                {connectionHistory
                  .slice(-10)
                  .reverse()
                  .map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          entry.status === "connected"
                            ? "bg-green-100 text-green-800"
                            : entry.status === "connecting"
                              ? "bg-yellow-100 text-yellow-800"
                              : entry.status === "error"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {entry.status}
                      </span>
                      <span className="text-gray-500">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 실시간 주식 데이터 */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <StockSubscriptionManager
          subscribedSymbols={subscribedSymbols}
          onAddSymbol={handleAddSymbol}
          onRemoveSymbol={handleRemoveSymbol}
          onReconnectAll={handleReconnectAll}
        />
      </div>

      {/* 데이터 품질 대시보드 */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <DataQualityDashboard />
      </div>

      {/* 사용 가이드 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">
          🚀 사용 가이드
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-medium text-blue-800 mb-2">기본 기능</h3>
            <ul className="space-y-1 text-blue-700">
              <li>• 종목 코드 입력하여 실시간 시세 구독</li>
              <li>• 여러 종목 동시 모니터링</li>
              <li>• 자동 재연결 및 오류 복구</li>
              <li>• 가격 변동 방향 표시</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-blue-800 mb-2">지원 종목</h3>
            <ul className="space-y-1 text-blue-700">
              <li>• 미국 주식: AAPL, GOOGL, MSFT, TSLA</li>
              <li>• 기술주: NVDA, META, AMZN</li>
              <li>• 테스트용: IBM, INTC, ORCL</li>
              <li>• 기타 나스닥/NYSE 상장 종목</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-3 bg-white rounded border-l-4 border-blue-400">
          <p className="text-blue-800 text-sm">
            💡 <strong>팁:</strong> 백엔드 서버가 실행되어 있어야 실시간
            데이터를 받을 수 있습니다. 연결 상태가 "연결 중..."인 경우 백엔드
            서버 상태를 확인해주세요.
          </p>
        </div>
      </div>

      {/* API 정보 */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          🔧 기술 정보
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h3 className="font-medium text-gray-800 mb-2">
              WebSocket 엔드포인트
            </h3>
            <code className="text-xs bg-gray-200 p-2 rounded block">
              ws://localhost:8000/ws
            </code>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">재연결 설정</h3>
            <ul className="text-gray-600 space-y-1">
              <li>• 자동 재연결: 활성화</li>
              <li>• 최대 재시도: 5회</li>
              <li>• 재연결 간격: 1-10초</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">데이터 소스</h3>
            <ul className="text-gray-600 space-y-1">
              <li>• Alpha Vantage API</li>
              <li>• 실시간 시세 (15분 지연)</li>
              <li>• 자동 데이터 검증</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebSocketTestPage;
