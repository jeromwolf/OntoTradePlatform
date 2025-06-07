/**
 * 데이터 품질 관련 타입 정의
 */

export interface QualityMetrics {
  validation_rate: number;
  anomaly_rate: number;
  processing_time_ms: number;
  last_updated: string;
}

export interface DataQualitySummary {
  total_symbols: number;
  avg_validation_rate: number;
  avg_anomaly_rate: number;
  avg_processing_time_ms: number;
  recent_anomalies_count: number;
}

export interface AnomalyAlert {
  symbol: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  detected_at: string;
  current_value: number;
  expected_range?: [number, number];
}

export interface DataQualityReport {
  summary: DataQualitySummary;
  per_symbol_metrics: Record<string, QualityMetrics>;
  recent_anomalies: AnomalyAlert[];
  timestamp: string;
}

export interface AnomaliesResponse {
  anomalies: AnomalyAlert[];
  total_count: number;
  timestamp: number;
}
