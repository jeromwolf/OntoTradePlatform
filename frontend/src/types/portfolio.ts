/**
 * 포트폴리오 관리 관련 타입 정의
 */

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  initial_balance: number;
  current_balance: number;
  total_value: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  investment_goal?: string;
  target_return?: number;
  created_at: string;
  updated_at: string;
}

export interface Holding {
  id: string;
  portfolio_id: string;
  symbol: string;
  quantity: number;
  average_cost: number;
  current_price?: number;
  total_value?: number;
  unrealized_pnl?: number;
  unrealized_pnl_percent?: number;
  weight?: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  portfolio_id: string;
  symbol: string;
  transaction_type: "BUY" | "SELL";
  quantity: number;
  price: number;
  total_amount: number;
  fees?: number;
  notes?: string;
  transaction_date: string;
  created_at: string;
}

export interface PerformanceData {
  id: string;
  portfolio_id: string;
  date: string;
  total_value: number;
  cash_balance: number;
  invested_amount: number;
  daily_return?: number;
  cumulative_return?: number;
  benchmark_return?: number;
  alpha?: number;
  beta?: number;
  sharpe_ratio?: number;
  volatility?: number;
  max_drawdown?: number;
  created_at: string;
}

export interface PortfolioStats {
  total_assets: number;
  daily_change: number;
  daily_change_percent: number;
  total_return: number;
  total_return_percent: number;
  annualized_return: number;
  volatility: number;
  sharpe_ratio: number;
  max_drawdown: number;
  win_rate: number;
  holdings_count: number;
  sectors_count: number;
}

export interface PortfolioCreateData {
  name: string;
  description?: string;
  initial_balance: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  investment_goal?: string;
  target_return?: number;
}

export interface HoldingCreateData {
  symbol: string;
  quantity: number;
  average_cost: number;
}

export interface TransactionCreateData {
  symbol: string;
  transaction_type: "BUY" | "SELL";
  quantity: number;
  price: number;
  fees?: number;
  notes?: string;
}
