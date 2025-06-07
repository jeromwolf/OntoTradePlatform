/**
 * WebSocket 연결 상태 타입
 */
import { ConnectionStatus } from '../services/websocket';
export type { StockQuote } from '../services/websocket';
export { ConnectionStatus } from '../services/websocket';

/**
 * WebSocket 메시지 타입
 */
export interface WebSocketMessage {
  type: string;
  data?: any;
  symbol?: string;
  timestamp?: string;
}

/**
 * 연결 통계 타입
 */
export interface ConnectionStats {
  total: number;
  connected: number;
  disconnected: number;
  connecting: number;
  error: number;
  connectionRate: number;
}

/**
 * 연결 히스토리 항목 타입
 */
export interface ConnectionHistoryItem {
  status: ConnectionStatus;
  timestamp: string;
}
