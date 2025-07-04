/**
 * 시뮬레이션 API 서비스
 * OntoTradePlatform - Simulation API Integration
 */

import { apiRequest, API_BASE_URL } from "./api";

const SIMULATION_API_URL = `${API_BASE_URL}/simulation`;

// 타입 정의
export interface StockData {
  symbol: string;
  name: string;
  price: number;
  previous_close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  change: number;
  change_percent: number;
  timestamp: string;
}

export interface SimulationSession {
  user_id: string;
  cash: number;
  holdings: Record<string, { quantity: number; avg_price: number }>;
  transactions: Transaction[];
  created_at: string;
  total_value: number;
  total_pnl: number;
  total_pnl_percent: number;
}

export interface Transaction {
  symbol: string;
  action: "BUY" | "SELL";
  quantity: number;
  price: number;
  total_amount: number;
  timestamp: string;
}

export interface DetailedHolding {
  symbol: string;
  quantity: number;
  avg_price: number;
  current_price: number;
  market_value: number;
  cost_basis: number;
  unrealized_pnl: number;
  unrealized_pnl_percent: number;
}

export interface LeaderboardEntry {
  user_id: string;
  rank: number;
  total_value: number;
  total_pnl: number;
  total_pnl_percent: number;
  cash: number;
  holdings_count: number;
  transactions_count: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

/**
 * 현재 주식 데이터 조회
 */
export const getStockData = async (): Promise<Record<string, StockData>> => {
  try {
    const response = await fetch(`${SIMULATION_API_URL}/stocks`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<Record<string, StockData>> =
      await response.json();

    if (!result.success) {
      throw new Error("주식 데이터 조회 실패");
    }

    return result.data;
  } catch (error) {
    console.error("주식 데이터 조회 중 오류:", error);
    throw error;
  }
};

/**
 * 시뮬레이션 세션 시작
 */
export const startSimulation = async (): Promise<SimulationSession> => {
  try {
    const result: ApiResponse<SimulationSession> = await apiRequest(
      `${SIMULATION_API_URL}/start`,
      {
        method: "POST",
      },
    );

    if (!result.success) {
      throw new Error("시뮬레이션 시작 실패");
    }

    return result.data;
  } catch (error) {
    console.error("시뮬레이션 시작 중 오류:", error);
    throw error;
  }
};

/**
 * 가상 거래 실행
 */
export const executeTrade = async (
  symbol: string,
  action: "BUY" | "SELL",
  quantity: number,
): Promise<any> => {
  try {
    const result = await apiRequest(`${SIMULATION_API_URL}/trade`, {
      method: "POST",
      body: JSON.stringify({
        symbol,
        action,
        quantity,
      }),
    });

    if (!result.success) {
      throw new Error("거래 실행 실패");
    }

    return result.data;
  } catch (error) {
    console.error("거래 실행 중 오류:", error);
    throw error;
  }
};

/**
 * 시뮬레이션 포트폴리오 조회
 */
export const getSimulationPortfolio = async (): Promise<
  SimulationSession & { detailed_holdings: DetailedHolding[] }
> => {
  try {
    const result = await apiRequest(`${SIMULATION_API_URL}/portfolio`);

    if (!result.success) {
      throw new Error("포트폴리오 조회 실패");
    }

    return result.data;
  } catch (error) {
    console.error("포트폴리오 조회 중 오류:", error);
    throw error;
  }
};

/**
 * 시뮬레이션 리더보드 조회
 */
export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const response = await fetch(`${SIMULATION_API_URL}/leaderboard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<LeaderboardEntry[]> = await response.json();

    if (!result.success) {
      throw new Error("리더보드 조회 실패");
    }

    return result.data;
  } catch (error) {
    console.error("리더보드 조회 중 오류:", error);
    throw error;
  }
};

import { io, Socket } from 'socket.io-client';

// Socket.IO 클라이언트 타입 정의
export interface SocketIOClient extends Socket {
  on(event: 'connect', listener: () => void): this;
  on(event: 'stock_update', listener: (data: any) => void): this;
  on(event: 'connect_error', listener: (error: Error) => void): this;
  on(event: 'disconnect', listener: (reason: string) => void): this;
  on(event: string, listener: (...args: any[]) => void): this;
}

/**
 * Socket.IO 연결 생성 (실시간 주식 데이터)
 */
export const createWebSocketConnection = (
  onMessage: (data: any) => void,
  onError?: (error: Error) => void,
  onClose?: (event: string) => void,
): SocketIOClient => {
  // Socket.IO 클라이언트 생성
  const socket: SocketIOClient = io('http://127.0.0.1:8000', {
    path: '/socket.io',
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  // 연결 이벤트 핸들러
  socket.on('connect', () => {
    console.log('Socket.IO 연결 성공:', socket.id);
  });

  // 주식 업데이트 이벤트 핸들러
  socket.on('stock_update', (data: any) => {
    try {
      onMessage(data);
    } catch (error) {
      console.error('주식 업데이트 처리 중 오류:', error);
    }
  });

  // 에러 이벤트 핸들러
  socket.on('connect_error', (error: Error) => {
    console.error('Socket.IO 연결 오류:', error);
    if (onError) {
      onError(error);
    }
  });

  // 연결 종료 이벤트 핸들러
  socket.on('disconnect', (reason: string) => {
    console.log('Socket.IO 연결 종료:', reason);
    if (onClose) {
      onClose(reason);
    }
  });

  return socket;
};

/**
 * 통화 포맷팅 유틸리티
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount);
};

/**
 * 퍼센트 포맷팅 유틸리티
 */
export const formatPercent = (value: number): string => {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
};

/**
 * 숫자 포맷팅 유틸리티 (천 단위 콤마)
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("ko-KR").format(value);
};
