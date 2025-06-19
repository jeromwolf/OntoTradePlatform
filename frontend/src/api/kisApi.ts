import axios from "axios";
import { getAuthToken } from "./auth";

const API_BASE_URL = "http://localhost:8001/api/v1";

export interface StockQuote {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export interface OrderRequest {
  symbol: string;
  side: "buy" | "sell";
  orderType: "limit" | "market";
  price: number;
  quantity: number;
}

export interface OrderResponse {
  orderId: string;
  status: string;
  message?: string;
}

export interface PortfolioItem {
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  profitLoss: number;
  profitLossRate: number;
}

const kisApi = {
  // 주식 현재가 조회
  async getStockQuote(
    symbol: string,
    isOverseas: boolean = false,
  ): Promise<StockQuote> {
    const response = await axios.get(`${API_BASE_URL}/kis/stocks/${symbol}`, {
      params: { is_overseas: isOverseas },
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return response.data;
  },

  // 주문 실행
  async placeOrder(order: OrderRequest): Promise<OrderResponse> {
    const response = await axios.post(`${API_BASE_URL}/kis/orders`, order, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  // 포트폴리오 조회
  async getPortfolio(): Promise<PortfolioItem[]> {
    const response = await axios.get(`${API_BASE_URL}/kis/portfolio`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return response.data;
  },
};

export default kisApi;
