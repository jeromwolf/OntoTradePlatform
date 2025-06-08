// 주식 시세 데이터 타입
export interface StockQuote {
  symbol: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  change: number;
  change_percent: string;
  timestamp: string;
  source: string;
  validated_at?: string;
}

// WebSocket 이벤트 타입
export interface WebSocketEvents {
  stock_update: (data: StockQuote) => void;
  connect: () => void;
  disconnect: () => void;
  connect_error: (error: Error) => void;
  error: (error: string) => void;
  subscription_confirmed: (data: { symbol: string; status: string }) => void;
  subscription_cancelled: (data: { symbol: string; status: string }) => void;
  current_subscriptions: (data: any) => void;
  market_status: (data: any) => void;
  all_stocks: (data: any) => void;
  pong: (data: any) => void;
}

// WebSocket 메시지 타입
export interface WebSocketMessage {
  type: string;
  symbol?: string;
  data?: StockQuote | any;
  message?: string;
}

/**
 * WebSocket 연결 상태
 */
export enum ConnectionStatus {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  RECONNECTING = "reconnecting",
  ERROR = "error",
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;

  private listeners: {
    [key: string]: Array<(data: any) => void>;
  } = {};

  private connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private statusListeners: Array<(status: ConnectionStatus) => void> = [];

  constructor(private url: string = "ws://localhost:8000/ws") {
    this.setupEventListeners();
  }

  /**
   * WebSocket 연결
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.setConnectionStatus(ConnectionStatus.CONNECTING);

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log("WebSocket 연결됨");
          this.reconnectAttempts = 0;
          this.setConnectionStatus(ConnectionStatus.CONNECTED);
          this.startPingInterval();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error("WebSocket 메시지 파싱 오류:", error);
          }
        };

        this.ws.onclose = (event) => {
          console.log("WebSocket 연결 해제됨:", event.code, event.reason);
          this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
          this.stopPingInterval();

          if (
            !event.wasClean &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket 오류:", error);
          this.setConnectionStatus(ConnectionStatus.ERROR);
          reject(error);
        };
      } catch (error) {
        console.error("WebSocket 연결 실패:", error);
        this.setConnectionStatus(ConnectionStatus.ERROR);
        reject(error);
      }
    });
  }

  /**
   * WebSocket 연결 해제
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopPingInterval();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
  }

  /**
   * 주식 데이터 구독
   */
  subscribeToStock(symbol: string): void {
    if (this.isConnected()) {
      this.send({
        type: "subscribe",
        symbol: symbol.toUpperCase(),
      });
    } else {
      console.warn(
        "WebSocket이 연결되지 않았습니다. 구독 요청을 보낼 수 없습니다.",
      );
    }
  }

  /**
   * 주식 데이터 구독 해제
   */
  unsubscribeFromStock(symbol: string): void {
    if (this.isConnected()) {
      this.send({
        type: "unsubscribe",
        symbol: symbol.toUpperCase(),
      });
    }
  }

  /**
   * 현재 구독 목록 요청
   */
  getSubscriptions(): void {
    if (this.isConnected()) {
      this.send({
        type: "get_subscriptions",
      });
    }
  }

  /**
   * 이벤트 리스너 등록
   */
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * 이벤트 리스너 제거
   */
  off(event: string, callback: (data: any) => void): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        (cb) => cb !== callback,
      );
    }
  }

  /**
   * 연결 상태 리스너 등록
   */
  onStatusChange(callback: (status: ConnectionStatus) => void): void {
    this.statusListeners.push(callback);
  }

  /**
   * 연결 상태 리스너 제거
   */
  offStatusChange(callback: (status: ConnectionStatus) => void): void {
    this.statusListeners = this.statusListeners.filter((cb) => cb !== callback);
  }

  /**
   * 연결 상태 확인
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * 현재 연결 상태 반환
   */
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * 현재 재연결 시도 횟수 반환
   */
  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  /**
   * 메시지 전송
   */
  private send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * 메시지 처리
   */
  private handleMessage(message: WebSocketMessage): void {
    console.log("WebSocket 메시지 수신:", message);

    switch (message.type) {
      case "stock_update":
        this.emit("stock_update", message.data);
        break;
      case "subscription_confirmed":
        this.emit("subscription_confirmed", {
          symbol: message.symbol,
          status: "subscribed",
        });
        break;
      case "subscription_cancelled":
        this.emit("subscription_cancelled", {
          symbol: message.symbol,
          status: "unsubscribed",
        });
        break;
      case "current_subscriptions":
        this.emit("current_subscriptions", message.data);
        break;
      case "market_status":
        this.emit("market_status", message.data);
        break;
      case "all_stocks":
        this.emit("all_stocks", message.data);
        break;
      case "pong":
        this.emit("pong", message);
        break;
      case "error":
        this.emit("error", message.message || "알 수 없는 오류");
        break;
      default:
        console.warn("알 수 없는 메시지 타입:", message.type);
    }
  }

  /**
   * 이벤트 발생
   */
  private emit(event: string, data: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`이벤트 리스너 오류 (${event}):`, error);
        }
      });
    }
  }

  /**
   * 연결 상태 설정
   */
  private setConnectionStatus(status: ConnectionStatus): void {
    if (this.connectionStatus !== status) {
      this.connectionStatus = status;
      this.statusListeners.forEach((callback) => {
        try {
          callback(status);
        } catch (error) {
          console.error("상태 리스너 오류:", error);
        }
      });
    }
  }

  /**
   * 재연결 스케줄링
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    this.setConnectionStatus(ConnectionStatus.DISCONNECTED);

    const delay =
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    console.log(
      `${delay}ms 후 재연결 시도 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        } else {
          console.error("최대 재연결 시도 횟수 초과");
          this.setConnectionStatus(ConnectionStatus.ERROR);
        }
      });
    }, delay);
  }

  /**
   * 핑 인터벌 시작
   */
  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: "ping" });
      }
    }, 30000); // 30초마다 핑
  }

  /**
   * 핑 인터벌 중지
   */
  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    // 페이지 언로드 시 연결 해제
    window.addEventListener("beforeunload", () => {
      this.disconnect();
    });
  }
}

// 전역 WebSocket 서비스 인스턴스
const websocketService = new WebSocketService();

export { websocketService };
export default websocketService;
