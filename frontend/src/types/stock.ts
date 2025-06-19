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
  side: 'buy' | 'sell';
  orderType: 'limit' | 'market';
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
