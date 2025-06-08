/**
 * 포트폴리오 관리 페이지 - 와이어프레임 기반 리디자인
 */

import React, { useState } from "react";
import MainLayout from "../components/Layout/MainLayout";

// 타입 정의
interface Position {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  average_price: number;
  current_price: number;
  total_value: number;
  unrealized_pnl: number;
  unrealized_pnl_percent: number;
  weight: number;
}

const PortfolioPage: React.FC = () => {
  const [language, setLanguage] = useState<"ko" | "en">("ko");
  const [selectedPeriod, setSelectedPeriod] = useState<
    "1M" | "3M" | "6M" | "1Y" | "ALL"
  >("1M");

  // 더미 데이터 - 실제 API 연결 시 교체
  const portfolioSummary = {
    totalAssets: 127580,
    dailyChange: 2450,
    dailyChangePercent: 1.96,
    initialInvestment: 100000,
    targetReturn: 15,
    totalReturn: 27.58,
    annualizedReturn: 18.2,
    volatility: 12.5,
    sharpeRatio: 1.45,
    maxDrawdown: -8.3,
  };

  const positions: Position[] = [
    {
      id: "1",
      symbol: "AAPL",
      name: "Apple Inc.",
      quantity: 50,
      average_price: 150.25,
      current_price: 155.3,
      total_value: 7765,
      unrealized_pnl: 252.5,
      unrealized_pnl_percent: 3.36,
      weight: 45,
    },
    {
      id: "2",
      symbol: "TSLA",
      name: "Tesla Inc.",
      quantity: 25,
      average_price: 240.8,
      current_price: 235.4,
      total_value: 5885,
      unrealized_pnl: -135.0,
      unrealized_pnl_percent: -2.24,
      weight: 30,
    },
    {
      id: "3",
      symbol: "MSFT",
      name: "Microsoft Corp.",
      quantity: 20,
      average_price: 310.15,
      current_price: 318.9,
      total_value: 6378,
      unrealized_pnl: 175.0,
      unrealized_pnl_percent: 2.82,
      weight: 15,
    },
    {
      id: "4",
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      quantity: 15,
      average_price: 145.6,
      current_price: 148.2,
      total_value: 2223,
      unrealized_pnl: 39.0,
      unrealized_pnl_percent: 1.78,
      weight: 10,
    },
  ];

  const transactions = [
    {
      id: "1",
      date: "2024-06-07",
      symbol: "AAPL",
      type: "buy",
      quantity: 10,
      price: 155.3,
      total: 1553,
    },
    {
      id: "2",
      date: "2024-06-06",
      symbol: "TSLA",
      type: "sell",
      quantity: 5,
      price: 235.4,
      total: 1177,
    },
    {
      id: "3",
      date: "2024-06-05",
      symbol: "MSFT",
      type: "buy",
      quantity: 5,
      price: 318.9,
      total: 1594.5,
    },
  ];

  const sectorAllocations = [
    { sector: "기술주", weight: 45, color: "bg-blue-500", emoji: "💻" },
    { sector: "자동차", weight: 30, color: "bg-green-500", emoji: "🚗" },
    { sector: "소프트웨어", weight: 15, color: "bg-yellow-500", emoji: "💾" },
    { sector: "검색", weight: 10, color: "bg-purple-500", emoji: "🔍" },
  ];

  const periods = [
    { key: "1M", label: language === "ko" ? "1개월" : "1M" },
    { key: "3M", label: language === "ko" ? "3개월" : "3M" },
    { key: "6M", label: language === "ko" ? "6개월" : "6M" },
    { key: "1Y", label: language === "ko" ? "1년" : "1Y" },
    { key: "ALL", label: language === "ko" ? "전체" : "ALL" },
  ] as const;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (percent: number): string => {
    const sign = percent >= 0 ? "+" : "";
    return `${sign}${percent.toFixed(2)}%`;
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-900 p-6">
        {/* 언어 선택 */}
        <div className="flex justify-end mb-6">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setLanguage("ko")}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                language === "ko"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🇰🇷 한국어
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                language === "en"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🇺🇸 English
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* 페이지 헤더 */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              💼{" "}
              {language === "ko" ? "포트폴리오 관리" : "Portfolio Management"}
            </h1>
          </div>

          {/* 포트폴리오 개요 */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              📊 {language === "ko" ? "포트폴리오 개요" : "Portfolio Overview"}
            </h2>

            {/* 주요 지표 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">
                  💰 {language === "ko" ? "총 자산" : "Total Assets"}
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(portfolioSummary.totalAssets)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">
                  📈 {language === "ko" ? "일간수익" : "Daily P&L"}
                </div>
                <div
                  className={`text-2xl font-bold ${portfolioSummary.dailyChange >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {formatCurrency(portfolioSummary.dailyChange)} (
                  {formatPercent(portfolioSummary.dailyChangePercent)})
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">
                  💸 {language === "ko" ? "투자원금" : "Initial Investment"}
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(portfolioSummary.initialInvestment)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">
                  🎯 {language === "ko" ? "목표수익률" : "Target Return"}
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {portfolioSummary.targetReturn}%
                </div>
              </div>
            </div>

            {/* 기간 선택 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {periods.map((period) => (
                <button
                  key={period.key}
                  onClick={() =>
                    setSelectedPeriod(
                      period.key as "1M" | "3M" | "6M" | "1Y" | "ALL",
                    )
                  }
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedPeriod === period.key
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>

            {/* 수익률 차트 플레이스홀더 */}
            <div className="bg-gray-700 rounded-lg p-6 h-64 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="text-4xl mb-2">📈</div>
                <div className="text-lg font-medium">
                  {language === "ko" ? "수익률 차트" : "Return Chart"}
                </div>
                <div className="text-sm mt-2">
                  {language === "ko"
                    ? "차트 라이브러리 통합 예정"
                    : "Chart library integration pending"}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 보유 종목 */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  🏷️ {language === "ko" ? "보유 종목" : "Holdings"}
                </h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2 text-sm font-medium text-gray-400 border-b border-gray-600 pb-2">
                    <div>{language === "ko" ? "종목명" : "Symbol"}</div>
                    <div className="text-center">
                      {language === "ko" ? "수량" : "Qty"}
                    </div>
                    <div className="text-center">
                      {language === "ko" ? "비중" : "Weight"}
                    </div>
                    <div className="text-center">
                      {language === "ko" ? "손익" : "P&L"}
                    </div>
                  </div>

                  {positions.map((position) => (
                    <div
                      key={position.id}
                      className="grid grid-cols-4 gap-2 text-sm"
                    >
                      <div className="text-white font-medium">
                        {position.symbol}
                      </div>
                      <div className="text-center text-gray-300">
                        {position.quantity}
                      </div>
                      <div className="text-center text-gray-300">
                        {position.weight}%
                      </div>
                      <div
                        className={`text-center font-medium ${
                          position.unrealized_pnl >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {formatPercent(position.unrealized_pnl_percent)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-2">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    📈 {language === "ko" ? "종목 추가" : "Add Position"}
                  </button>
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    📉 {language === "ko" ? "전체 매도" : "Sell All"}
                  </button>
                </div>
              </div>

              {/* 거래 내역 */}
              <div className="bg-gray-800 rounded-lg p-6 mt-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  📋 {language === "ko" ? "거래 내역" : "Transaction History"}
                </h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-sm font-medium text-gray-400 border-b border-gray-600 pb-2">
                    <div>{language === "ko" ? "날짜" : "Date"}</div>
                    <div className="text-center">
                      {language === "ko" ? "종목" : "Symbol"}
                    </div>
                    <div className="text-center">
                      {language === "ko" ? "유형" : "Type"}
                    </div>
                  </div>

                  {transactions.slice(0, 5).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="grid grid-cols-3 gap-2 text-sm"
                    >
                      <div className="text-gray-300">
                        {transaction.date.slice(5)}
                      </div>
                      <div className="text-center text-white font-medium">
                        {transaction.symbol}
                      </div>
                      <div
                        className={`text-center font-medium ${
                          transaction.type === "buy"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {transaction.type === "buy"
                          ? language === "ko"
                            ? "매수"
                            : "Buy"
                          : language === "ko"
                            ? "매도"
                            : "Sell"}
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors">
                  {language === "ko"
                    ? "전체 내역 보기"
                    : "View All Transactions"}
                </button>
              </div>
            </div>

            {/* 자산 분석 */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  📊 {language === "ko" ? "자산 분석" : "Asset Analysis"}
                </h3>

                {/* 섹터별 비중 */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-white mb-3 flex items-center gap-2">
                    🥧 {language === "ko" ? "섹터별 비중" : "Sector Allocation"}
                  </h4>

                  <div className="space-y-3">
                    {sectorAllocations.map((sector, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex items-center gap-2 w-24">
                          <span>{sector.emoji}</span>
                          <span className="text-sm text-gray-300">
                            {sector.sector}
                          </span>
                        </div>
                        <div className="flex-1 bg-gray-700 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${sector.color}`}
                            style={{ width: `${sector.weight}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-white font-medium w-12">
                          {sector.weight}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 성과 지표 */}
                <div>
                  <h4 className="text-md font-medium text-white mb-3 flex items-center gap-2">
                    📈 {language === "ko" ? "성과 지표" : "Performance Metrics"}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          {language === "ko" ? "총 수익률" : "Total Return"}:
                        </span>
                        <span className="text-green-400 font-medium">
                          {formatPercent(portfolioSummary.totalReturn)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          {language === "ko"
                            ? "연환산 수익률"
                            : "Annualized Return"}
                          :
                        </span>
                        <span className="text-green-400 font-medium">
                          {formatPercent(portfolioSummary.annualizedReturn)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          {language === "ko" ? "변동성" : "Volatility"}:
                        </span>
                        <span className="text-white font-medium">
                          {portfolioSummary.volatility}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          {language === "ko" ? "샤프 비율" : "Sharpe Ratio"}:
                        </span>
                        <span className="text-white font-medium">
                          {portfolioSummary.sharpeRatio}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          {language === "ko" ? "최대 낙폭" : "Max Drawdown"}:
                        </span>
                        <span className="text-red-400 font-medium">
                          {formatPercent(portfolioSummary.maxDrawdown)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PortfolioPage;
