// OntoTrade 기본 타입 정의

export interface User {
  id: string;
  email: string;
  username: string;
  virtualBalance: number;
  level: number;
  experience: number;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Stock {
  symbol: string;
  name: string;
  nameKo?: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  sector?: string;
  currency: string;
}

export interface Portfolio {
  id: string;
  userId: string;
  totalValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  holdings: Holding[];
  createdAt: string;
  updatedAt: string;
}

export interface Holding {
  id: string;
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  return: number;
  returnPercent: number;
  purchaseDate: string;
}

export interface Transaction {
  id: string;
  userId: string;
  symbol: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  total: number;
  timestamp: string;
}

export interface Simulation {
  id: string;
  userId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  initialBalance: number;
  currentBalance: number;
  totalReturn: number;
  totalReturnPercent: number;
  status: "ACTIVE" | "COMPLETED" | "PAUSED";
  isPublic: boolean;
  createdAt: string;
}

export interface Language {
  code: "ko" | "en";
  name: string;
  flag: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
