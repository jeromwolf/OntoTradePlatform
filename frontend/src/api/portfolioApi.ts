import axios, { AxiosResponse } from "axios";
import {
  Portfolio,
  PortfolioCreateData,
  Holding,
  Transaction,
  TransactionCreateData,
  PerformanceData,
  PortfolioStats,
} from "../types/portfolio";

const API_BASE_URL = "/api";

// 포트폴리오 목록 조회
export const getPortfolios = async (): Promise<Portfolio[]> => {
  const response = await axios.get<Portfolio[]>(`${API_BASE_URL}/portfolios/`);
  return response.data;
};

// 포트폴리오 상세 조회
export const getPortfolio = async (portfolioId: string): Promise<Portfolio> => {
  const response = await axios.get<Portfolio>(
    `${API_BASE_URL}/portfolios/${portfolioId}`,
  );
  return response.data;
};

// 포트폴리오 생성
export const createPortfolio = async (
  data: PortfolioCreateData,
): Promise<Portfolio> => {
  const response = await axios.post<Portfolio>(
    `${API_BASE_URL}/portfolios/`,
    data,
  );
  return response.data;
};

// 포트폴리오 업데이트
export const updatePortfolio = async (
  portfolioId: string,
  data: Partial<PortfolioCreateData>,
): Promise<Portfolio> => {
  const response = await axios.put<Portfolio>(
    `${API_BASE_URL}/portfolios/${portfolioId}`,
    data,
  );
  return response.data;
};

// 포트폴리오 삭제
export const deletePortfolio = async (
  portfolioId: string,
): Promise<{ id: string }> => {
  const response = await axios.delete<{ id: string }>(
    `${API_BASE_URL}/portfolios/${portfolioId}`,
  );
  return response.data;
};

// 포트폴리오 보유 종목 조회
export const getPortfolioHoldings = async (
  portfolioId: string,
): Promise<Holding[]> => {
  const response = await axios.get<Holding[]>(
    `${API_BASE_URL}/portfolios/${portfolioId}/holdings`,
  );
  return response.data;
};

// 포트폴리오 거래 내역 조회
export const getPortfolioTransactions = async (
  portfolioId: string,
  limit: number = 50,
  offset: number = 0,
): Promise<{ transactions: Transaction[]; total: number }> => {
  const response = await axios.get<{
    transactions: Transaction[];
    total: number;
  }>(`${API_BASE_URL}/portfolios/${portfolioId}/transactions`, {
    params: { limit, offset },
  });
  return response.data;
};

// 거래 실행 (매수/매도)
export const executeTrade = async (
  portfolioId: string,
  data: TransactionCreateData,
): Promise<Transaction> => {
  const response = await axios.post<Transaction>(
    `${API_BASE_URL}/portfolios/${portfolioId}/trades`,
    data,
  );
  return response.data;
};

// 포트폴리오 성과 데이터 조회
export const getPortfolioPerformance = async (
  portfolioId: string,
  startDate?: string,
  endDate?: string,
): Promise<PerformanceData[]> => {
  const response = await axios.get<PerformanceData[]>(
    `${API_BASE_URL}/portfolios/${portfolioId}/performance`,
    { params: { start_date: startDate, end_date: endDate } },
  );
  return response.data;
};

// 포트폴리오 통계 조회
export const getPortfolioStats = async (
  portfolioId: string,
): Promise<PortfolioStats> => {
  const response = await axios.get<PortfolioStats>(
    `${API_BASE_URL}/portfolios/${portfolioId}/stats`,
  );
  return response.data;
};

// 포트폴리오 설정 조회
export const getPortfolioSettings = async (
  portfolioId: string,
): Promise<any> => {
  const response = await axios.get(
    `${API_BASE_URL}/portfolios/${portfolioId}/settings`,
  );
  return response.data;
};

// 포트폴리오 설정 업데이트
export const updatePortfolioSettings = async (
  portfolioId: string,
  settings: any,
): Promise<any> => {
  const response = await axios.put(
    `${API_BASE_URL}/portfolios/${portfolioId}/settings`,
    settings,
  );
  return response.data;
};
