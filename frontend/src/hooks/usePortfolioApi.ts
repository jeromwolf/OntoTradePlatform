import { useState, useCallback } from "react";
import {
  Portfolio,
  PortfolioCreateData,
  TransactionCreateData,
  Transaction,
  Holding,
  PerformanceData,
  PortfolioStats,
} from "../types/portfolio";
import * as portfolioApi from "../api/portfolioApi";

type ApiFunction<T, Args extends any[]> = (...args: Args) => Promise<T>;

const useApi = <T, Args extends any[]>(apiFunction: ApiFunction<T, Args>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: Args): Promise<T | undefined> => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An error occurred"));
        console.error("API Error:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction],
  );

  return { execute, data, loading, error };
};

// 포트폴리오 목록 조회 훅
export const useGetPortfolios = () => {
  return useApi(portfolioApi.getPortfolios);
};

// 포트폴리오 상세 조회 훅
export const useGetPortfolio = (portfolioId: string) => {
  const apiCall = useCallback(
    () => portfolioApi.getPortfolio(portfolioId),
    [portfolioId],
  );
  return useApi(apiCall);
};

// 포트폴리오 생성 훅
export const useCreatePortfolio = () => {
  return useApi(portfolioApi.createPortfolio);
};

// 포트폴리오 업데이트 훅
export const useUpdatePortfolio = (portfolioId: string) => {
  const apiCall = useCallback(
    (data: Partial<PortfolioCreateData>) =>
      portfolioApi.updatePortfolio(portfolioId, data),
    [portfolioId],
  );
  return useApi(apiCall);
};

// 포트폴리오 삭제 훅
export const useDeletePortfolio = (portfolioId: string) => {
  const apiCall = useCallback(
    () => portfolioApi.deletePortfolio(portfolioId),
    [portfolioId],
  );
  return useApi(apiCall);
};

// 포트폴리오 보유 종목 조회 훅
export const useGetPortfolioHoldings = (portfolioId: string) => {
  const apiCall = useCallback(
    () => portfolioApi.getPortfolioHoldings(portfolioId),
    [portfolioId],
  );
  return useApi(apiCall);
};

// 포트폴리오 거래 내역 조회 훅
export const useGetPortfolioTransactions = (
  portfolioId: string,
  limit: number = 50,
  offset: number = 0,
) => {
  const apiCall = useCallback(
    () => portfolioApi.getPortfolioTransactions(portfolioId, limit, offset),
    [portfolioId, limit, offset],
  );
  return useApi(apiCall);
};

// 거래 실행 훅
export const useExecuteTrade = (portfolioId: string) => {
  const apiCall = useCallback(
    (data: TransactionCreateData) =>
      portfolioApi.executeTrade(portfolioId, data),
    [portfolioId],
  );
  return useApi(apiCall);
};

// 포트폴리오 성과 데이터 조회 훅
export const useGetPortfolioPerformance = (
  portfolioId: string,
  startDate?: string,
  endDate?: string,
) => {
  const apiCall = useCallback(
    () => portfolioApi.getPortfolioPerformance(portfolioId, startDate, endDate),
    [portfolioId, startDate, endDate],
  );
  return useApi(apiCall);
};

// 포트폴리오 통계 조회 훅
export const useGetPortfolioStats = (portfolioId: string) => {
  const apiCall = useCallback(
    () => portfolioApi.getPortfolioStats(portfolioId),
    [portfolioId],
  );
  return useApi(apiCall);
};

// 포트폴리오 설정 조회 훅
export const useGetPortfolioSettings = (portfolioId: string) => {
  const apiCall = useCallback(
    () => portfolioApi.getPortfolioSettings(portfolioId),
    [portfolioId],
  );
  return useApi(apiCall);
};

// 포트폴리오 설정 업데이트 훅
export const useUpdatePortfolioSettings = (portfolioId: string) => {
  const apiCall = useCallback(
    (settings: any) =>
      portfolioApi.updatePortfolioSettings(portfolioId, settings),
    [portfolioId],
  );
  return useApi(apiCall);
};
