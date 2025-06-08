import React, { useState, useEffect } from "react";
import { websocketService } from "../../services/websocket";
import { Button } from "../ui/Button";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface DataQualityMetric {
  validation_success_rate: number;
  anomaly_rate: number;
  average_processing_time: number;
  total_messages_processed: number;
  last_updated: string;
}

interface StockQualityMetric {
  symbol: string;
  quality_score: number;
  validation_success_rate: number;
  anomaly_count: number;
  last_validated: string;
}

interface AnomalyAlert {
  id: string;
  symbol: string;
  anomaly_type: string;
  message: string;
  severity: "low" | "medium" | "high";
  timestamp: string;
}

interface DataQualityReport {
  overall_metrics: DataQualityMetric;
  stock_metrics: StockQualityMetric[];
  recent_anomalies: AnomalyAlert[];
}

export const DataQualityDashboard: React.FC = () => {
  const [qualityData, setQualityData] = useState<DataQualityReport | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchDataQuality = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // REST API로 데이터 품질 정보 가져오기
      const response = await fetch("http://localhost:8000/api/data-quality");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setQualityData(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setIsLoading(false);
    }
  };

  const requestWebSocketDataQuality = () => {
    if (websocketService.isConnected()) {
      websocketService.send("get_data_quality", {});
    }
  };

  useEffect(() => {
    fetchDataQuality();

    // WebSocket 이벤트 리스너 등록
    const handleDataQuality = (data: DataQualityReport) => {
      setQualityData(data);
      setLastRefresh(new Date());
    };

    websocketService.on("data_quality_report", handleDataQuality);

    // 정기적으로 데이터 품질 요청 (30초마다)
    const interval = setInterval(() => {
      requestWebSocketDataQuality();
    }, 30000);

    return () => {
      websocketService.off("data_quality_report", handleDataQuality);
      clearInterval(interval);
    };
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading && !qualityData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">📊 데이터 품질 대시보드</h2>
          <div className="flex items-center space-x-2">
            <ArrowPathIcon className="h-4 w-4 animate-spin text-gray-400" />
            <span className="text-sm text-gray-500">로딩 중...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 border rounded-lg bg-gray-50 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">📊 데이터 품질 대시보드</h2>
          <Button onClick={fetchDataQuality} variant="secondary" size="sm">
            다시 시도
          </Button>
        </div>
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            <span className="text-red-700">오류: {error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!qualityData) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold">📊 데이터 품질 대시보드</h2>
        <div className="text-center p-8 text-gray-500">
          <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>데이터 품질 정보를 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }

  const { overall_metrics, stock_metrics, recent_anomalies } = qualityData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">📊 데이터 품질 대시보드</h2>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            마지막 업데이트: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button onClick={fetchDataQuality} variant="secondary" size="sm">
            새로고침
          </Button>
          <Button
            onClick={requestWebSocketDataQuality}
            variant="secondary"
            size="sm"
          >
            실시간 요청
          </Button>
        </div>
      </div>

      {/* 전체 메트릭 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg bg-white">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-gray-600">
              검증 성공률
            </span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {overall_metrics.validation_success_rate.toFixed(1)}%
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-white">
          <div className="flex items-center space-x-2 mb-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600">
              이상치 발생률
            </span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {overall_metrics.anomaly_rate.toFixed(1)}%
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-white">
          <div className="flex items-center space-x-2 mb-2">
            <ClockIcon className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600">
              평균 처리시간
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {overall_metrics.average_processing_time.toFixed(2)}ms
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-white">
          <div className="flex items-center space-x-2 mb-2">
            <ChartBarIcon className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-600">
              처리된 메시지
            </span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {overall_metrics.total_messages_processed.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 종목별 품질 메트릭 */}
      <div className="bg-white border rounded-lg">
        <div className="p-4 border-b">
          <h3 className="font-semibold">종목별 데이터 품질</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  종목
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  품질 점수
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  검증 성공률
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  이상치 수
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  마지막 검증
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stock_metrics.map((metric) => (
                <tr key={metric.symbol} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">
                    {metric.symbol}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`font-medium ${getQualityScoreColor(metric.quality_score)}`}
                    >
                      {metric.quality_score.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {metric.validation_success_rate.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-sm">{metric.anomaly_count}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(metric.last_validated).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {stock_metrics.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>종목별 품질 데이터가 없습니다</p>
            </div>
          )}
        </div>
      </div>

      {/* 최근 이상치 알림 */}
      <div className="bg-white border rounded-lg">
        <div className="p-4 border-b">
          <h3 className="font-semibold">최근 이상치 알림</h3>
        </div>
        <div className="p-4">
          {recent_anomalies.length > 0 ? (
            <div className="space-y-3">
              {recent_anomalies.map((anomaly) => (
                <div
                  key={anomaly.id}
                  className={`p-3 border rounded ${getSeverityColor(anomaly.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium">{anomaly.symbol}</span>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            anomaly.severity === "high"
                              ? "bg-red-100 text-red-800"
                              : anomaly.severity === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {anomaly.severity.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {anomaly.anomaly_type}
                        </span>
                      </div>
                      <p className="text-sm">{anomaly.message}</p>
                    </div>
                    <span className="text-xs text-gray-500 ml-4">
                      {new Date(anomaly.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 text-gray-500">
              <CheckCircleIcon className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p>최근 이상치가 감지되지 않았습니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
