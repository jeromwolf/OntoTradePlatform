import { io, Socket } from "socket.io-client";

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

class WebSocketService {
  private socket: Socket | null = null;
  private eventListeners: Map<string, Function[]> = new Map();
  private isConnecting = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private subscribedSymbols = new Set<string>(); // 구독 상태 추적

  constructor() {
    this.connect();
  }

  private connect() {
    if (this.isConnecting || this.socket?.connected) {
      return;
    }

    this.isConnecting = true;
    console.log("Socket.IO 연결 시도 중...");

    // Socket.IO 클라이언트 생성
    this.socket = io("http://localhost:8000", {
      transports: ["polling", "websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    // 연결 이벤트 설정
    this.socket.on("connect", () => {
      console.log("Socket.IO 연결 성공:", this.socket?.id);
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.emit("connected", { status: "connected" });
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket.IO 연결 해제:", reason);
      this.isConnecting = false;
      this.emit("disconnected", { reason });
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket.IO 연결 오류:", error);
      this.isConnecting = false;
      this.emit("error", `연결 오류: ${error.message}`);
    });

    // 주식 데이터 이벤트 리스너 (백엔드와 일치하도록 stock_data 사용)
    this.socket.on("stock_data", (data) => {
      this.emit("stock_data", data);
    });

    this.socket.on("subscription_confirmed", (data) => {
      console.log("구독 확인:", data);
      this.emit("subscription_confirmed", data);
    });

    this.socket.on("unsubscription_confirmed", (data) => {
      console.log("구독 해제 확인:", data);
      this.emit("unsubscription_confirmed", data);
    });
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public subscribe(symbol: string): void {
    if (!this.socket?.connected) {
      console.warn("Socket.IO가 연결되지 않았습니다. 연결 후 다시 시도하세요.");
      return;
    }

    if (this.subscribedSymbols.has(symbol.toUpperCase())) {
      console.log(`이미 구독 중인 종목: ${symbol}`);
      return;
    }

    console.log(`종목 구독: ${symbol}`);
    this.socket.emit("subscribe", { symbol: symbol.toUpperCase() });
    this.subscribedSymbols.add(symbol.toUpperCase());
  }

  public unsubscribe(symbol: string): void {
    if (!this.socket?.connected) {
      return;
    }

    if (!this.subscribedSymbols.has(symbol.toUpperCase())) {
      console.log(`구독 중이지 않은 종목: ${symbol}`);
      return;
    }

    console.log(`종목 구독 해제: ${symbol}`);
    this.socket.emit("unsubscribe", { symbol: symbol.toUpperCase() });
    this.subscribedSymbols.delete(symbol.toUpperCase());
  }

  public getConnectionStatus(): {
    connected: boolean;
    reconnectAttempts: number;
  } {
    return {
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.eventListeners.clear();
  }

  public addEventListener(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public removeEventListener(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`이벤트 처리 오류 (${event}):`, error);
      }
    });
  }
}

// 싱글톤 인스턴스
export const websocketService = new WebSocketService();
export default websocketService;
