/**
 * 포트폴리오 관리 페이지 - 플랫폼 톤앤매너 통일
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { usePortfolio } from "../contexts/PortfolioContext";

interface PortfolioPageParams {
  portfolioId?: string;
  [key: string]: string | undefined;
}

const PortfolioPage: React.FC = () => {
  const navigate = useNavigate();
  const { portfolioId } = useParams<PortfolioPageParams>();
  const { user, signOut } = useAuth();
  const {
    portfolios,
    currentPortfolio,
    holdings,
    transactions,
    loading,
    error,
    selectPortfolio,
  } = usePortfolio();

  // 지원 언어 상태
  const [language, setLanguage] = useState<"ko" | "en">("ko");

  // URL 파라미터에 따라 포트폴리오 선택
  useEffect(() => {
    if (portfolioId) {
      // URL에 포트폴리오 ID가 있으면 해당 포트폴리오 선택
      selectPortfolio(portfolioId);
    } else if (portfolios.length > 0 && !currentPortfolio) {
      // URL에 포트폴리오 ID가 없고, 현재 선택된 포트폴리오가 없으면 첫 번째 포트폴리오 선택 후 리다이렉트
      const firstPortfolioId = portfolios[0].id;
      selectPortfolio(firstPortfolioId);
      navigate(`/portfolios/${firstPortfolioId}`, { replace: true });
    } else if (currentPortfolio) {
      // 현재 선택된 포트폴리오가 있으면 해당 포트폴리오 페이지로 리다이렉트
      navigate(`/portfolios/${currentPortfolio.id}`, { replace: true });
    }
  }, [portfolioId, portfolios, currentPortfolio, selectPortfolio, navigate]);

  // 포트폴리오가 없으면 포트폴리오 목록으로 리다이렉트
  useEffect(() => {
    if (!loading && portfolios.length === 0) {
      navigate("/portfolios", { replace: true });
    }
  }, [loading, portfolios, navigate]);

  // 통화 포맷 함수
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === "ko" ? "ko-KR" : "en-US", {
      style: "currency",
      currency: language === "ko" ? "KRW" : "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // 퍼센트 포맷 함수
  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  // 네비게이션 함수
  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // 포트폴리오 요약 계산
  const calculatePortfolioSummary = () => {
    if (!currentPortfolio || holdings.length === 0) {
      return {
        totalValue: 0,
        totalCost: 0,
        totalGainLoss: 0,
        totalGainLossPercent: 0,
        dayGainLoss: 0,
        dayGainLossPercent: 0,
        totalReturn: 0,
        annualizedReturn: 0,
        volatility: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
      };
    }

    const totalValue = holdings.reduce(
      (sum, holding) =>
        sum +
        (holding.current_price || holding.average_cost) * holding.quantity,
      0,
    );
    const totalCost = holdings.reduce(
      (sum, holding) => sum + holding.average_cost * holding.quantity,
      0,
    );
    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent =
      totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    // 임시 일일 손익 계산 (실제로는 이전 종가 데이터가 필요)
    const dayGainLoss = totalGainLoss * 0.02; // 2% 임시 일일 변동
    const dayGainLossPercent =
      totalValue > 0 ? (dayGainLoss / totalValue) * 100 : 0;

    return {
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercent,
      dayGainLoss,
      dayGainLossPercent,
      totalReturn: totalGainLossPercent,
      annualizedReturn: totalGainLossPercent * 2, // 임시 연환산
      volatility: 15.5, // 임시 변동성
      sharpeRatio: 1.2, // 임시 샤프 비율
      maxDrawdown: -8.5, // 임시 최대 낙폭
    };
  };

  const portfolioSummary = calculatePortfolioSummary();

  // Position 타입 정의 (보유종목 표시용)
  interface Position {
    symbol: string;
    quantity: number;
    avgPrice: number;
    currentPrice: number;
    marketValue: number;
    unrealized_pnl: number;
    unrealized_pnl_percent: number;
  }

  // 보유종목을 Position 형태로 변환
  const positions: Position[] = holdings.map((holding) => {
    const currentPrice = holding.current_price || holding.average_cost;
    const marketValue = currentPrice * holding.quantity;
    const costBasis = holding.average_cost * holding.quantity;
    const unrealized_pnl = marketValue - costBasis;
    const unrealized_pnl_percent =
      costBasis > 0 ? (unrealized_pnl / costBasis) * 100 : 0;

    return {
      symbol: holding.symbol,
      quantity: holding.quantity,
      avgPrice: holding.average_cost,
      currentPrice,
      marketValue,
      unrealized_pnl,
      unrealized_pnl_percent,
    };
  });

  // 섹터별 비중 계산 (임시 데이터)
  const sectorAllocations = [
    {
      sector: language === "ko" ? "기술주" : "Technology",
      weight: 35,
      color: "#3b82f6",
      emoji: "💻",
    },
    {
      sector: language === "ko" ? "금융" : "Finance",
      weight: 25,
      color: "#10b981",
      emoji: "🏦",
    },
    {
      sector: language === "ko" ? "헬스케어" : "Healthcare",
      weight: 20,
      color: "#8b5cf6",
      emoji: "🏥",
    },
    {
      sector: language === "ko" ? "소비재" : "Consumer",
      weight: 15,
      color: "#f59e0b",
      emoji: "🛍️",
    },
    {
      sector: language === "ko" ? "기타" : "Others",
      weight: 5,
      color: "#6b7280",
      emoji: "📊",
    },
  ];

  const [selectedPeriod, setSelectedPeriod] = useState<
    "1M" | "3M" | "6M" | "1Y" | "ALL"
  >("1M");

  const periods = [
    { key: "1M", label: language === "ko" ? "1개월" : "1M" },
    { key: "3M", label: language === "ko" ? "3개월" : "3M" },
    { key: "6M", label: language === "ko" ? "6개월" : "6M" },
    { key: "1Y", label: language === "ko" ? "1년" : "1Y" },
    { key: "ALL", label: language === "ko" ? "전체" : "ALL" },
  ] as const;

  // 로딩 상태 표시
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0a0e27",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            color: "#e2e8f0",
            fontSize: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div
            style={{
              width: "2rem",
              height: "2rem",
              border: "3px solid #374151",
              borderTop: "3px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          {language === "ko" ? "포트폴리오 로딩 중..." : "Loading Portfolio..."}
        </div>
      </div>
    );
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0a0e27",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            backgroundColor: "#131629",
            padding: "2rem",
            borderRadius: "0.75rem",
            border: "1px solid #ef4444",
            textAlign: "center",
            maxWidth: "400px",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>❌</div>
          <h3 style={{ color: "#ef4444", marginBottom: "0.5rem" }}>
            {language === "ko" ? "오류 발생" : "Error Occurred"}
          </h3>
          <p style={{ color: "#e2e8f0", marginBottom: "1.5rem" }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: "500",
            }}
          >
            {language === "ko" ? "다시 시도" : "Retry"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0e27",
        padding: "1.5rem",
      }}
    >
      {/* 스타일 정의 */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* 통합 네비게이션 헤더 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          padding: "1rem 0",
          borderBottom: "1px solid #374151",
        }}
      >
        {/* 로고 및 네비게이션 */}
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <div
            onClick={() => navigate("/dashboard")}
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "#3b82f6",
              cursor: "pointer",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.color = "#1d4ed8")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color = "#3b82f6")
            }
          >
            💼 OntoTrade
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#374151",
              color: "#e2e8f0",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = "#4b5563";
              (e.target as HTMLElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = "#374151";
              (e.target as HTMLElement).style.transform = "translateY(0px)";
            }}
          >
            🏠 {language === "ko" ? "대시보드" : "Dashboard"}
          </button>

          {/* 포트폴리오 선택 드롭다운 */}
          {portfolios.length > 0 && (
            <select
              value={currentPortfolio?.id || ""}
              onChange={(e) => selectPortfolio(e.target.value)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#131629",
                color: "#e2e8f0",
                border: "1px solid #374151",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              {portfolios.map((portfolio) => (
                <option key={portfolio.id} value={portfolio.id}>
                  📊 {portfolio.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* 사용자 컨트롤 */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* 언어 토글 */}
          <div
            style={{
              display: "flex",
              backgroundColor: "#131629",
              borderRadius: "0.5rem",
              padding: "0.25rem",
            }}
          >
            <button
              onClick={() => setLanguage("ko")}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: language === "ko" ? "#3b82f6" : "transparent",
                color: language === "ko" ? "#ffffff" : "#64748b",
                border: "none",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              🇰🇷 한국어
            </button>
            <button
              onClick={() => setLanguage("en")}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: language === "en" ? "#3b82f6" : "transparent",
                color: language === "en" ? "#ffffff" : "#64748b",
                border: "none",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              🇺🇸 English
            </button>
          </div>

          {/* 사용자 정보 및 로그아웃 */}
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <span style={{ color: "#e2e8f0", fontSize: "0.875rem" }}>
              👤 {user?.email}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#ef4444",
                color: "#ffffff",
                border: "none",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = "#dc2626";
                (e.target as HTMLElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = "#ef4444";
                (e.target as HTMLElement).style.transform = "translateY(0px)";
              }}
            >
              🚪 {language === "ko" ? "로그아웃" : "Logout"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
        {/* 페이지 헤더 */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "2.25rem",
              fontWeight: "bold",
              color: "#e2e8f0",
              marginBottom: "0.5rem",
            }}
          >
            💼 {language === "ko" ? "포트폴리오 관리" : "Portfolio Management"}
          </h1>
        </div>

        {/* 포트폴리오 개요 */}
        <div
          style={{
            backgroundColor: "#131629",
            borderRadius: "0.75rem",
            padding: "2rem",
            marginBottom: "2rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#e2e8f0",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            📊 {language === "ko" ? "포트폴리오 개요" : "Portfolio Overview"}
          </h2>

          {/* 주요 지표 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#64748b",
                  marginBottom: "0.5rem",
                }}
              >
                💰 {language === "ko" ? "총 자산" : "Total Assets"}
              </div>
              <div
                style={{
                  fontSize: "1.875rem",
                  fontWeight: "bold",
                  color: "#e2e8f0",
                }}
              >
                {formatCurrency(portfolioSummary.totalValue)}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#64748b",
                  marginBottom: "0.5rem",
                }}
              >
                📈 {language === "ko" ? "일간수익" : "Daily P&L"}
              </div>
              <div
                style={{
                  fontSize: "1.875rem",
                  fontWeight: "bold",
                  color:
                    portfolioSummary.dayGainLoss >= 0 ? "#10b981" : "#ef4444",
                }}
              >
                {formatCurrency(portfolioSummary.dayGainLoss)} (
                {formatPercent(portfolioSummary.dayGainLossPercent)})
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#64748b",
                  marginBottom: "0.5rem",
                }}
              >
                💸 {language === "ko" ? "투자원금" : "Initial Investment"}
              </div>
              <div
                style={{
                  fontSize: "1.875rem",
                  fontWeight: "bold",
                  color: "#e2e8f0",
                }}
              >
                {formatCurrency(portfolioSummary.totalCost)}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#64748b",
                  marginBottom: "0.5rem",
                }}
              >
                🎯 {language === "ko" ? "목표수익률" : "Target Return"}
              </div>
              <div
                style={{
                  fontSize: "1.875rem",
                  fontWeight: "bold",
                  color: "#3b82f6",
                }}
              >
                {portfolioSummary.totalReturn}%
              </div>
            </div>
          </div>

          {/* 기간 선택 */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginBottom: "1.5rem",
            }}
          >
            {periods.map((period) => (
              <button
                key={period.key}
                onClick={() =>
                  setSelectedPeriod(
                    period.key as "1M" | "3M" | "6M" | "1Y" | "ALL",
                  )
                }
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor:
                    selectedPeriod === period.key ? "#3b82f6" : "#374151",
                  color: selectedPeriod === period.key ? "#ffffff" : "#d1d5db",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (selectedPeriod !== period.key) {
                    (e.target as HTMLElement).style.backgroundColor = "#4b5563";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedPeriod !== period.key) {
                    (e.target as HTMLElement).style.backgroundColor = "#374151";
                  }
                }}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* 수익률 차트 플레이스홀더 */}
          <div
            style={{
              backgroundColor: "#374151",
              borderRadius: "0.75rem",
              padding: "2rem",
              height: "16rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ textAlign: "center", color: "#64748b" }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>📈</div>
              <div style={{ fontSize: "1.125rem", fontWeight: "500" }}>
                {language === "ko" ? "수익률 차트" : "Return Chart"}
              </div>
              <div style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
                {language === "ko"
                  ? "차트 라이브러리 통합 예정"
                  : "Chart library integration pending"}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}
        >
          {/* 보유 종목 */}
          <div
            style={{
              backgroundColor: "#131629",
              borderRadius: "0.75rem",
              padding: "2rem",
            }}
          >
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                color: "#e2e8f0",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              🏷️ {language === "ko" ? "보유 종목" : "Holdings"}
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                {language === "ko" ? "종목명" : "Symbol"}
              </div>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#64748b",
                  textAlign: "center",
                }}
              >
                {language === "ko" ? "수량" : "Qty"}
              </div>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#64748b",
                  textAlign: "center",
                }}
              >
                {language === "ko" ? "비중" : "Weight"}
              </div>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#64748b",
                  textAlign: "center",
                }}
              >
                {language === "ko" ? "손익" : "P&L"}
              </div>

              {positions.map((position) => (
                <React.Fragment key={position.symbol}>
                  <div
                    style={{
                      fontSize: "1rem",
                      fontWeight: "500",
                      color: "#e2e8f0",
                    }}
                  >
                    {position.symbol}
                  </div>
                  <div
                    style={{
                      fontSize: "1rem",
                      color: "#d1d5db",
                      textAlign: "center",
                    }}
                  >
                    {position.quantity}
                  </div>
                  <div
                    style={{
                      fontSize: "1rem",
                      color: "#d1d5db",
                      textAlign: "center",
                    }}
                  >
                    {position.marketValue}
                  </div>
                  <div
                    style={{
                      fontSize: "1rem",
                      fontWeight: "500",
                      color:
                        position.unrealized_pnl >= 0 ? "#10b981" : "#ef4444",
                      textAlign: "center",
                    }}
                  >
                    {formatPercent(position.unrealized_pnl_percent)}
                  </div>
                </React.Fragment>
              ))}
            </div>

            <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
              <button
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#3b82f6",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = "#1d4ed8";
                  (e.target as HTMLElement).style.transform =
                    "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = "#3b82f6";
                  (e.target as HTMLElement).style.transform = "translateY(0px)";
                }}
              >
                📈 {language === "ko" ? "종목 추가" : "Add Position"}
              </button>
              <button
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = "#dc2626";
                  (e.target as HTMLElement).style.transform =
                    "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = "#ef4444";
                  (e.target as HTMLElement).style.transform = "translateY(0px)";
                }}
              >
                📉 {language === "ko" ? "전체 매도" : "Sell All"}
              </button>
            </div>
          </div>

          {/* 거래 내역 */}
          <div
            style={{
              backgroundColor: "#131629",
              borderRadius: "0.75rem",
              padding: "2rem",
            }}
          >
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                color: "#e2e8f0",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              📋 {language === "ko" ? "거래 내역" : "Transaction History"}
            </h3>

            {/* 빈 상태 메시지 */}
            {positions.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "#64748b",
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
                <h4
                  style={{
                    fontSize: "1.25rem",
                    marginBottom: "0.5rem",
                    color: "#e2e8f0",
                  }}
                >
                  {language === "ko"
                    ? "포트폴리오가 비어있습니다"
                    : "Portfolio is Empty"}
                </h4>
                <p style={{ fontSize: "0.875rem" }}>
                  {language === "ko"
                    ? "첫 번째 투자를 시작해보세요"
                    : "Start your first investment"}
                </p>
                <button
                  style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "#3b82f6",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    marginTop: "1rem",
                    fontSize: "0.875rem",
                  }}
                >
                  📈{" "}
                  {language === "ko" ? "종목 추가하기" : "Add First Position"}
                </button>
              </div>
            ) : (
              <>
                {/* 거래내역 헤더 */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
                    gap: "1rem",
                    marginBottom: "1rem",
                    padding: "0.75rem",
                    backgroundColor: "#0a0e27",
                    borderRadius: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "#64748b",
                      fontWeight: "600",
                    }}
                  >
                    {language === "ko" ? "날짜" : "Date"}
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "#64748b",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    {language === "ko" ? "종목" : "Symbol"}
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "#64748b",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    {language === "ko" ? "유형" : "Type"}
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "#64748b",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    {language === "ko" ? "수량" : "Quantity"}
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "#64748b",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    {language === "ko" ? "가격" : "Price"}
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "#64748b",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    {language === "ko" ? "총액" : "Total"}
                  </div>
                </div>

                {/* 더미 거래 내역 (실제 거래내역 API 연동 필요) */}
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
                      gap: "1rem",
                      padding: "0.75rem",
                      backgroundColor: "#1e293b",
                      borderRadius: "0.5rem",
                      marginBottom: "0.5rem",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div style={{ color: "#e2e8f0", fontSize: "0.875rem" }}>
                      {new Date(
                        transaction.transaction_date,
                      ).toLocaleDateString(
                        language === "ko" ? "ko-KR" : "en-US",
                      )}
                    </div>
                    <div
                      style={{
                        color: "#e2e8f0",
                        textAlign: "center",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                      }}
                    >
                      {transaction.symbol}
                    </div>
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: "0.875rem",
                        color:
                          transaction.transaction_type === "BUY"
                            ? "#10b981"
                            : "#ef4444",
                        fontWeight: "500",
                      }}
                    >
                      {transaction.transaction_type === "BUY"
                        ? language === "ko"
                          ? "매수"
                          : "BUY"
                        : language === "ko"
                          ? "매도"
                          : "SELL"}
                    </div>
                    <div
                      style={{
                        color: "#e2e8f0",
                        textAlign: "center",
                        fontSize: "0.875rem",
                      }}
                    >
                      {transaction.quantity.toLocaleString()}
                    </div>
                    <div
                      style={{
                        color: "#e2e8f0",
                        textAlign: "center",
                        fontSize: "0.875rem",
                      }}
                    >
                      {formatCurrency(transaction.price)}
                    </div>
                    <div
                      style={{
                        color: "#e2e8f0",
                        textAlign: "center",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                      }}
                    >
                      {formatCurrency(transaction.total_amount)}
                    </div>
                  </div>
                ))}

                {transactions.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#64748b",
                    }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                      📋
                    </div>
                    <p style={{ fontSize: "0.875rem" }}>
                      {language === "ko"
                        ? "거래 내역이 없습니다"
                        : "No transaction history"}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}
        >
          {/* 자산 분석 */}
          <div
            style={{
              backgroundColor: "#131629",
              borderRadius: "0.75rem",
              padding: "2rem",
            }}
          >
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                color: "#e2e8f0",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              📊 {language === "ko" ? "자산 분석" : "Asset Analysis"}
            </h3>

            {/* 섹터별 비중 */}
            <div style={{ marginBottom: "2rem" }}>
              <h4
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "500",
                  color: "#e2e8f0",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                🥧 {language === "ko" ? "섹터별 비중" : "Sector Allocation"}
              </h4>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                }}
              >
                {sectorAllocations.map((sector, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span style={{ fontSize: "1.5rem" }}>{sector.emoji}</span>
                      <span style={{ fontSize: "1rem", color: "#d1d5db" }}>
                        {sector.sector}
                      </span>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        backgroundColor: "#374151",
                        borderRadius: "0.5rem",
                        height: "1rem",
                      }}
                    >
                      <div
                        style={{
                          height: "1rem",
                          borderRadius: "0.5rem",
                          backgroundColor: sector.color,
                          width: `${sector.weight}%`,
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        fontSize: "1rem",
                        fontWeight: "500",
                        color: "#e2e8f0",
                      }}
                    >
                      {sector.weight}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 성과 지표 */}
            <div>
              <h4
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "500",
                  color: "#e2e8f0",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                📈 {language === "ko" ? "성과 지표" : "Performance Metrics"}
              </h4>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "1rem",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ fontSize: "1rem", color: "#64748b" }}>
                    {language === "ko" ? "총 수익률" : "Total Return"}:
                  </span>
                  <span
                    style={{
                      fontSize: "1rem",
                      fontWeight: "500",
                      color: "#10b981",
                    }}
                  >
                    {formatPercent(portfolioSummary.totalReturn)}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ fontSize: "1rem", color: "#64748b" }}>
                    {language === "ko" ? "연환산 수익률" : "Annualized Return"}:
                  </span>
                  <span
                    style={{
                      fontSize: "1rem",
                      fontWeight: "500",
                      color: "#10b981",
                    }}
                  >
                    {formatPercent(portfolioSummary.annualizedReturn)}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ fontSize: "1rem", color: "#64748b" }}>
                    {language === "ko" ? "변동성" : "Volatility"}:
                  </span>
                  <span
                    style={{
                      fontSize: "1rem",
                      fontWeight: "500",
                      color: "#e2e8f0",
                    }}
                  >
                    {portfolioSummary.volatility}%
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ fontSize: "1rem", color: "#64748b" }}>
                    {language === "ko" ? "샤프 비율" : "Sharpe Ratio"}:
                  </span>
                  <span
                    style={{
                      fontSize: "1rem",
                      fontWeight: "500",
                      color: "#e2e8f0",
                    }}
                  >
                    {portfolioSummary.sharpeRatio}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ fontSize: "1rem", color: "#64748b" }}>
                    {language === "ko" ? "최대 낙폭" : "Max Drawdown"}:
                  </span>
                  <span
                    style={{
                      fontSize: "1rem",
                      fontWeight: "500",
                      color: "#ef4444",
                    }}
                  >
                    {formatPercent(portfolioSummary.maxDrawdown)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
