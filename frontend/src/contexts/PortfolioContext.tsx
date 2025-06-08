/**
 * 포트폴리오 상태 관리 컨텍스트
 */

import React, { createContext, useContext, useReducer, useEffect } from "react";
import type { ReactNode } from "react";
import { portfolioApi } from "../services/portfolioApi";
import type {
  Portfolio,
  Holding,
  Transaction,
  PerformanceData,
  PortfolioStats,
  PortfolioCreateData,
  HoldingCreateData,
  TransactionCreateData,
} from "../types/portfolio";

// 상태 타입 정의
interface PortfolioState {
  portfolios: Portfolio[];
  currentPortfolio: Portfolio | null;
  holdings: Holding[];
  transactions: Transaction[];
  performance: PerformanceData[];
  stats: PortfolioStats | null;
  loading: boolean;
  error: string | null;
}

// 액션 타입 정의
type PortfolioAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_PORTFOLIOS"; payload: Portfolio[] }
  | { type: "SET_CURRENT_PORTFOLIO"; payload: Portfolio | null }
  | { type: "SET_HOLDINGS"; payload: Holding[] }
  | { type: "SET_TRANSACTIONS"; payload: Transaction[] }
  | { type: "SET_PERFORMANCE"; payload: PerformanceData[] }
  | { type: "SET_STATS"; payload: PortfolioStats | null }
  | { type: "ADD_PORTFOLIO"; payload: Portfolio }
  | { type: "UPDATE_PORTFOLIO"; payload: Portfolio }
  | { type: "REMOVE_PORTFOLIO"; payload: string }
  | { type: "ADD_HOLDING"; payload: Holding }
  | { type: "UPDATE_HOLDING"; payload: Holding }
  | { type: "REMOVE_HOLDING"; payload: string }
  | { type: "ADD_TRANSACTION"; payload: Transaction };

// 초기 상태
const initialState: PortfolioState = {
  portfolios: [],
  currentPortfolio: null,
  holdings: [],
  transactions: [],
  performance: [],
  stats: null,
  loading: false,
  error: null,
};

// 리듀서
const portfolioReducer = (
  state: PortfolioState,
  action: PortfolioAction,
): PortfolioState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };

    case "SET_PORTFOLIOS":
      return { ...state, portfolios: action.payload };

    case "SET_CURRENT_PORTFOLIO":
      return { ...state, currentPortfolio: action.payload };

    case "SET_HOLDINGS":
      return { ...state, holdings: action.payload };

    case "SET_TRANSACTIONS":
      return { ...state, transactions: action.payload };

    case "SET_PERFORMANCE":
      return { ...state, performance: action.payload };

    case "SET_STATS":
      return { ...state, stats: action.payload };

    case "ADD_PORTFOLIO":
      return { ...state, portfolios: [...state.portfolios, action.payload] };

    case "UPDATE_PORTFOLIO":
      return {
        ...state,
        portfolios: state.portfolios.map((p) =>
          p.id === action.payload.id ? action.payload : p,
        ),
        currentPortfolio:
          state.currentPortfolio?.id === action.payload.id
            ? action.payload
            : state.currentPortfolio,
      };

    case "REMOVE_PORTFOLIO":
      return {
        ...state,
        portfolios: state.portfolios.filter((p) => p.id !== action.payload),
        currentPortfolio:
          state.currentPortfolio?.id === action.payload
            ? null
            : state.currentPortfolio,
      };

    case "ADD_HOLDING":
      return { ...state, holdings: [...state.holdings, action.payload] };

    case "UPDATE_HOLDING":
      return {
        ...state,
        holdings: state.holdings.map((h) =>
          h.id === action.payload.id ? action.payload : h,
        ),
      };

    case "REMOVE_HOLDING":
      return {
        ...state,
        holdings: state.holdings.filter((h) => h.id !== action.payload),
      };

    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };

    default:
      return state;
  }
};

// 컨텍스트 타입 정의
interface PortfolioContextType extends PortfolioState {
  // 포트폴리오 관리
  loadPortfolios: () => Promise<void>;
  selectPortfolio: (portfolioId: string) => Promise<void>;
  createPortfolio: (data: PortfolioCreateData) => Promise<Portfolio>;
  updatePortfolio: (
    portfolioId: string,
    data: Partial<PortfolioCreateData>,
  ) => Promise<void>;
  deletePortfolio: (portfolioId: string) => Promise<void>;

  // 보유 종목 관리
  loadHoldings: (portfolioId: string) => Promise<void>;
  addHolding: (portfolioId: string, data: HoldingCreateData) => Promise<void>;
  updateHolding: (
    portfolioId: string,
    holdingId: string,
    data: Partial<HoldingCreateData>,
  ) => Promise<void>;
  removeHolding: (portfolioId: string, holdingId: string) => Promise<void>;

  // 거래 내역 관리
  loadTransactions: (portfolioId: string) => Promise<void>;
  addTransaction: (
    portfolioId: string,
    data: TransactionCreateData,
  ) => Promise<void>;

  // 성과 데이터
  loadPerformance: (
    portfolioId: string,
    startDate?: string,
    endDate?: string,
  ) => Promise<void>;
  loadStats: (portfolioId: string) => Promise<void>;

  // 유틸리티
  clearError: () => void;
}

// 컨텍스트 생성
const PortfolioContext = createContext<PortfolioContextType | undefined>(
  undefined,
);

// 프로바이더 컴포넌트
interface PortfolioProviderProps {
  children: ReactNode;
}

export const PortfolioProvider: React.FC<PortfolioProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(portfolioReducer, initialState);

  // 에러 처리 헬퍼
  const handleError = (error: any) => {
    const errorMessage = error.message || "알 수 없는 오류가 발생했습니다.";
    dispatch({ type: "SET_ERROR", payload: errorMessage });
    console.error("Portfolio Error:", error);
  };

  // 포트폴리오 관리 함수들
  const loadPortfolios = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const portfolios = await portfolioApi.getPortfolios();
      dispatch({ type: "SET_PORTFOLIOS", payload: portfolios });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const selectPortfolio = async (portfolioId: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const portfolio = await portfolioApi.getPortfolio(portfolioId);
      dispatch({ type: "SET_CURRENT_PORTFOLIO", payload: portfolio });

      // 관련 데이터도 함께 로드
      await Promise.all([
        loadHoldings(portfolioId),
        loadTransactions(portfolioId),
        loadStats(portfolioId),
      ]);
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const createPortfolio = async (
    data: PortfolioCreateData,
  ): Promise<Portfolio> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const portfolio = await portfolioApi.createPortfolio(data);
      dispatch({ type: "ADD_PORTFOLIO", payload: portfolio });
      return portfolio;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const updatePortfolio = async (
    portfolioId: string,
    data: Partial<PortfolioCreateData>,
  ) => {
    try {
      const portfolio = await portfolioApi.updatePortfolio(portfolioId, data);
      dispatch({ type: "UPDATE_PORTFOLIO", payload: portfolio });
    } catch (error) {
      handleError(error);
    }
  };

  const deletePortfolio = async (portfolioId: string) => {
    try {
      await portfolioApi.deletePortfolio(portfolioId);
      dispatch({ type: "REMOVE_PORTFOLIO", payload: portfolioId });
    } catch (error) {
      handleError(error);
    }
  };

  // 보유 종목 관리 함수들
  const loadHoldings = async (portfolioId: string) => {
    try {
      const holdings = await portfolioApi.getHoldings(portfolioId);
      dispatch({ type: "SET_HOLDINGS", payload: holdings });
    } catch (error) {
      handleError(error);
    }
  };

  const addHolding = async (portfolioId: string, data: HoldingCreateData) => {
    try {
      const holding = await portfolioApi.addHolding(portfolioId, data);
      dispatch({ type: "ADD_HOLDING", payload: holding });
    } catch (error) {
      handleError(error);
    }
  };

  const updateHolding = async (
    portfolioId: string,
    holdingId: string,
    data: Partial<HoldingCreateData>,
  ) => {
    try {
      const holding = await portfolioApi.updateHolding(
        portfolioId,
        holdingId,
        data,
      );
      dispatch({ type: "UPDATE_HOLDING", payload: holding });
    } catch (error) {
      handleError(error);
    }
  };

  const removeHolding = async (portfolioId: string, holdingId: string) => {
    try {
      await portfolioApi.removeHolding(portfolioId, holdingId);
      dispatch({ type: "REMOVE_HOLDING", payload: holdingId });
    } catch (error) {
      handleError(error);
    }
  };

  // 거래 내역 관리 함수들
  const loadTransactions = async (portfolioId: string) => {
    try {
      const transactions = await portfolioApi.getTransactions(portfolioId);
      dispatch({ type: "SET_TRANSACTIONS", payload: transactions });
    } catch (error) {
      handleError(error);
    }
  };

  const addTransaction = async (
    portfolioId: string,
    data: TransactionCreateData,
  ) => {
    try {
      const transaction = await portfolioApi.addTransaction(portfolioId, data);
      dispatch({ type: "ADD_TRANSACTION", payload: transaction });

      // 거래 후 관련 데이터 새로고침
      await Promise.all([loadHoldings(portfolioId), loadStats(portfolioId)]);
    } catch (error) {
      handleError(error);
    }
  };

  // 성과 데이터 함수들
  const loadPerformance = async (
    portfolioId: string,
    startDate?: string,
    endDate?: string,
  ) => {
    try {
      const performance = await portfolioApi.getPerformance(
        portfolioId,
        startDate,
        endDate,
      );
      dispatch({ type: "SET_PERFORMANCE", payload: performance });
    } catch (error) {
      handleError(error);
    }
  };

  const loadStats = async (portfolioId: string) => {
    try {
      const stats = await portfolioApi.getPortfolioStats(portfolioId);
      dispatch({ type: "SET_STATS", payload: stats });
    } catch (error) {
      handleError(error);
    }
  };

  const clearError = () => {
    dispatch({ type: "SET_ERROR", payload: null });
  };

  // 초기 포트폴리오 로드
  useEffect(() => {
    loadPortfolios();
  }, []);

  const value: PortfolioContextType = {
    ...state,
    loadPortfolios,
    selectPortfolio,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    loadHoldings,
    addHolding,
    updateHolding,
    removeHolding,
    loadTransactions,
    addTransaction,
    loadPerformance,
    loadStats,
    clearError,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

// 커스텀 훅
export const usePortfolio = (): PortfolioContextType => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
};
