/**
 * 포트폴리오 API 연동 서비스
 */

import { apiRequest, API_BASE_URL } from './api';
import type {
  Portfolio,
  Holding,
  Transaction,
  PerformanceData,
  PortfolioStats,
  PortfolioCreateData,
  HoldingCreateData,
  TransactionCreateData,
} from '../types/portfolio';

export const portfolioApi = {
  // 포트폴리오 관리
  async getPortfolios(): Promise<Portfolio[]> {
    return apiRequest(`${API_BASE_URL}/portfolios`);
  },

  async getPortfolio(portfolioId: string): Promise<Portfolio> {
    return apiRequest(`${API_BASE_URL}/portfolios/${portfolioId}`);
  },

  async createPortfolio(data: PortfolioCreateData): Promise<Portfolio> {
    return apiRequest(`${API_BASE_URL}/portfolios`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePortfolio(portfolioId: string, data: Partial<PortfolioCreateData>): Promise<Portfolio> {
    return apiRequest(`${API_BASE_URL}/portfolios/${portfolioId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deletePortfolio(portfolioId: string): Promise<void> {
    return apiRequest(`${API_BASE_URL}/portfolios/${portfolioId}`, {
      method: 'DELETE',
    });
  },

  // 보유 종목 관리
  async getHoldings(portfolioId: string): Promise<Holding[]> {
    return apiRequest(`${API_BASE_URL}/portfolios/${portfolioId}/holdings`);
  },

  async addHolding(portfolioId: string, data: HoldingCreateData): Promise<Holding> {
    return apiRequest(`${API_BASE_URL}/portfolios/${portfolioId}/holdings`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateHolding(portfolioId: string, holdingId: string, data: Partial<HoldingCreateData>): Promise<Holding> {
    return apiRequest(`${API_BASE_URL}/portfolios/${portfolioId}/holdings/${holdingId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async removeHolding(portfolioId: string, holdingId: string): Promise<void> {
    return apiRequest(`${API_BASE_URL}/portfolios/${portfolioId}/holdings/${holdingId}`, {
      method: 'DELETE',
    });
  },

  // 거래 내역 관리
  async getTransactions(portfolioId: string): Promise<Transaction[]> {
    return apiRequest(`${API_BASE_URL}/portfolios/${portfolioId}/transactions`);
  },

  async addTransaction(portfolioId: string, data: TransactionCreateData): Promise<Transaction> {
    return apiRequest(`${API_BASE_URL}/portfolios/${portfolioId}/transactions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 성과 데이터 조회
  async getPerformance(portfolioId: string, startDate?: string, endDate?: string): Promise<PerformanceData[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const queryString = params.toString();
    return apiRequest(`${API_BASE_URL}/portfolios/${portfolioId}/performance${queryString ? `?${queryString}` : ''}`);
  },

  // 포트폴리오 통계 조회
  async getPortfolioStats(portfolioId: string): Promise<PortfolioStats> {
    return apiRequest(`${API_BASE_URL}/portfolios/${portfolioId}/stats`);
  },
};

// 유틸리티 함수들
export const portfolioUtils = {
  // 통화 포맷팅
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  },

  // 퍼센트 포맷팅
  formatPercent(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  },

  // 날짜 포맷팅
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ko-KR');
  },

  // 수익률 계산
  calculateReturn(currentValue: number, initialValue: number): number {
    return ((currentValue - initialValue) / initialValue) * 100;
  },

  // 미실현 손익 계산
  calculateUnrealizedPnL(quantity: number, currentPrice: number, averageCost: number): number {
    return quantity * (currentPrice - averageCost);
  },

  // 미실현 손익률 계산
  calculateUnrealizedPnLPercent(currentPrice: number, averageCost: number): number {
    return ((currentPrice - averageCost) / averageCost) * 100;
  },

  // 비중 계산
  calculateWeight(holdingValue: number, totalValue: number): number {
    return (holdingValue / totalValue) * 100;
  },
};