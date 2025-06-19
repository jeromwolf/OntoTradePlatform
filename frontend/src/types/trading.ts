import { UUID } from 'crypto';

export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';
export type OrderSide = 'buy' | 'sell';
export type OrderStatus = 'pending' | 'filled' | 'partially_filled' | 'cancelled' | 'rejected';

export interface OrderBookEntry {
  price: number;
  quantity: number;
}

export interface OrderBook {
  symbol: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  timestamp: Date;
}

export interface OrderCreate {
  portfolio_id: string;
  symbol: string;
  order_type: OrderType;
  side: OrderSide;
  quantity: number;
  price?: number;
  stop_price?: number;
}

export interface Order extends Omit<OrderCreate, 'portfolio_id'> {
  id: string;
  user_id: string;
  portfolio_id: string;
  status: OrderStatus;
  filled_quantity: number;
  avg_fill_price?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Trade {
  id: string;
  order_id: string;
  quantity: number;
  price: number;
  fee: number;
  created_at: Date;
}

export interface Position {
  symbol: string;
  quantity: number;
  avg_price: number;
  current_price: number;
  pnl: number;
  pnl_percent: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  timestamp: Date;
}

export interface OrderExecution {
  order_id: string;
  symbol: string;
  side: OrderSide;
  quantity: number;
  price: number;
  timestamp: Date;
}

export interface TradingState {
  selectedSymbol: string | null;
  orders: Order[];
  positions: Position[];
  marketData: Record<string, MarketData>;
  orderBook: OrderBook | null;
  loading: boolean;
  error: string | null;
}
