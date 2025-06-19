import axios from 'axios';
import { Order, OrderCreate, OrderBook } from '../types/trading';

const API_BASE_URL = '/api/trading';

export const tradingApi = {
  // 주문 생성
  async createOrder(orderData: OrderCreate): Promise<Order> {
    const response = await axios.post<Order>(`${API_BASE_URL}/orders/`, orderData, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  },

  // 주문 조회
  async getOrder(orderId: string): Promise<Order> {
    const response = await axios.get<Order>(`${API_BASE_URL}/orders/${orderId}`, {
      withCredentials: true,
    });
    return response.data;
  },

  // 주문 목록 조회
  async listOrders(params?: {
    portfolioId?: string;
    status?: string;
    skip?: number;
    limit?: number;
  }): Promise<Order[]> {
    const response = await axios.get<Order[]>(`${API_BASE_URL}/orders/`, {
      params,
      withCredentials: true,
    });
    return response.data;
  },

  // 주문 취소
  async cancelOrder(orderId: string): Promise<Order> {
    const response = await axios.patch<Order>(
      `${API_BASE_URL}/orders/${orderId}/cancel`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data;
  },

  // 호가창 조회
  async getOrderBook(symbol: string): Promise<OrderBook> {
    const response = await axios.get<OrderBook>(
      `${API_BASE_URL}/orderbook/${symbol}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  },

  // 실시간 가격 구독 (WebSocket)
  subscribeToPriceUpdates(symbol: string, callback: (data: any) => void) {
    // WebSocket 연결 로직 (실제 구현 시 WebSocket 클라이언트와 통합 필요)
    console.log(`Subscribing to price updates for ${symbol}`);
    // 실제 구현에서는 WebSocket 연결을 설정하고 구독 메시지를 보냅니다.
    // 예: this.socket.send(JSON.stringify({ action: 'subscribe', symbol }));
    
    // 임시로 5초마다 더미 데이터를 반환하는 타이머 설정 (실제 구현에서는 제거)
    const intervalId = setInterval(() => {
      const dummyData = {
        symbol,
        price: (Math.random() * 1000).toFixed(2),
        timestamp: new Date().toISOString(),
      };
      callback(dummyData);
    }, 5000);

    // 구독 취소 함수 반환
    return () => {
      console.log(`Unsubscribing from price updates for ${symbol}`);
      clearInterval(intervalId);
      // 실제 구현에서는 WebSocket 구독 취소 로직 추가
      // 예: this.socket.send(JSON.stringify({ action: 'unsubscribe', symbol }));
    };
  },
};

export default tradingApi;
