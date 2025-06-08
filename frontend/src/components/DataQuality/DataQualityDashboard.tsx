import React, { useState, useEffect } from "react";
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import type { DataQualityReport } from "../../types/dataQuality";

interface DataQualityDashboardProps {
  className?: string;
}

const DataQualityDashboard: React.FC<DataQualityDashboardProps> = ({
  className = "",
}) => {
  const [qualityReport, setQualityReport] = useState<DataQualityReport | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchQualityReport = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/data-quality");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setQualityReport(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error("데이터 품질 보고서 조회 실패:", err);
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQualityReport();

    // 30초마다 자동 갱신
    const interval = setInterval(fetchQualityReport, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getQualityStatus = (rate: number) => {
    if (rate >= 0.95) return { text: "우수", color: "text-green-600" };
    if (rate >= 0.9) return { text: "양호", color: "text-blue-600" };
    if (rate >= 0.8) return { text: "보통", color: "text-yellow-600" };
    return { text: "주의", color: "text-red-600" };
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">
            데이터 품질 정보 로딩 중...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            데이터 품질 정보 로딩 실패
          </h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={fetchQualityReport}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!qualityReport) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center text-gray-500">
          데이터 품질 정보가 없습니다.
        </div>
      </div>
    );
  }

  const { summary, per_symbol_metrics, recent_anomalies } = qualityReport;
  const validationStatus = getQualityStatus(summary.avg_validation_rate);

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            데이터 품질 대시보드
          </h2>
          <div className="text-sm text-gray-500 flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            {lastUpdate?.toLocaleTimeString() || "업데이트 없음"}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* 요약 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">검증 성공률</p>
                <p className={`text-2xl font-bold ${validationStatus.color}`}>
                  {(summary.avg_validation_rate * 100).toFixed(1)}%
                </p>
                <p className={`text-xs ${validationStatus.color}`}>
                  {validationStatus.text}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  이상치 발생률
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {(summary.avg_anomaly_rate * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  평균 처리시간
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {summary.avg_processing_time_ms.toFixed(1)}ms
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  모니터링 종목
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {summary.total_symbols}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 최근 이상치 알림 */}
        {recent_anomalies.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              최근 이상치 알림
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recent_anomalies.slice(0, 5).map((anomaly, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getSeverityColor(anomaly.severity)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="font-medium">{anomaly.symbol}</span>
                      <span className="ml-2 text-sm opacity-75">
                        {anomaly.type}
                      </span>
                    </div>
                    <span className="text-xs">
                      {new Date(anomaly.detected_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{anomaly.message}</p>
                  {anomaly.current_value && (
                    <p className="text-xs mt-1 opacity-75">
                      현재값: {anomaly.current_value}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 종목별 품질 메트릭 */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            종목별 데이터 품질
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    종목
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    검증률
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    이상치율
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    처리시간
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    최종 업데이트
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(per_symbol_metrics).map(([symbol, metrics]) => {
                  const status = getQualityStatus(metrics.validation_rate);
                  return (
                    <tr key={symbol} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {symbol}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <span className={status.color}>
                          {(metrics.validation_rate * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {(metrics.anomaly_rate * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {metrics.processing_time_ms.toFixed(1)}ms
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {new Date(metrics.last_updated).toLocaleTimeString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 새로고침 버튼 */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={fetchQualityReport}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "로딩 중..." : "새로고침"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataQualityDashboard;
