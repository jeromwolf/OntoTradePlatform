import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SimulationPage: React.FC = () => {
  const [language, setLanguage] = useState<"ko" | "en">("ko");
  const navigate = useNavigate();

  const t = (ko: string, en: string) => (language === "ko" ? ko : en);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0e27",
        color: "#e2e8f0",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* 헤더 */}
      <header
        style={{
          background: "#131629",
          borderBottom: "1px solid #1e293b",
          padding: "16px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{ fontSize: "20px", fontWeight: "bold", color: "#60a5fa" }}
          >
            ⚡ OntoTrade
          </div>

          <nav style={{ display: "flex", gap: "24px" }}>
            {[
              {
                path: "/dashboard",
                icon: "🏠",
                ko: "대시보드",
                en: "Dashboard",
              },
              {
                path: "/portfolio",
                icon: "💼",
                ko: "포트폴리오",
                en: "Portfolio",
              },
              {
                path: "/analytics",
                icon: "📊",
                ko: "분석도구",
                en: "Analytics",
              },
              {
                path: "/simulation",
                icon: "🎮",
                ko: "시뮬레이션",
                en: "Simulation",
                active: true,
              },
              {
                path: "/leaderboard",
                icon: "🏆",
                ko: "리더보드",
                en: "Leaderboard",
              },
              { path: "/learning", icon: "📚", ko: "학습센터", en: "Learn" },
              { path: "/profile", icon: "⚙️", ko: "설정", en: "Settings" },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: item.active ? "#2563eb" : "transparent",
                  color: item.active ? "white" : "#94a3b8",
                }}
                onMouseEnter={(e) => {
                  if (!item.active) {
                    e.currentTarget.style.color = "#e2e8f0";
                    e.currentTarget.style.background = "#334155";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!item.active) {
                    e.currentTarget.style.color = "#94a3b8";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {item.icon} {t(item.ko, item.en)}
              </button>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                onClick={() => setLanguage("ko")}
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  border: "none",
                  cursor: "pointer",
                  background: language === "ko" ? "#2563eb" : "#334155",
                  color: "white",
                }}
              >
                🇰🇷
              </button>
              <button
                onClick={() => setLanguage("en")}
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  border: "none",
                  cursor: "pointer",
                  background: language === "en" ? "#2563eb" : "#334155",
                  color: "white",
                }}
              >
                🇺🇸
              </button>
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              {t("💰 가상자산 $10,000,000", "💰 Virtual $10,000,000")}
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              {t("👤 투자자님", "👤 Trader")}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main style={{ padding: "24px" }}>
        {/* 페이지 제목 */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#e2e8f0",
              marginBottom: "8px",
            }}
          >
            🎮 {t("투자 시뮬레이션", "Investment Simulation")}
          </h1>
          <p style={{ fontSize: "14px", color: "#94a3b8" }}>
            {t(
              "실전과 동일한 환경에서 안전하게 투자 실력을 키워보세요",
              "Develop your investment skills safely in a real-world environment",
            )}
          </p>
        </div>

        {/* 통계 카드 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              background: "#131629",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "16px" }}>🏃‍♂️</div>
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#e2e8f0" }}
            >
              3
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                marginBottom: "4px",
              }}
            >
              {t("진행 중", "Active")}
            </div>
            <div style={{ fontSize: "12px", color: "#34c759" }}>
              {t("+1 이번 주", "+1 this week")}
            </div>
          </div>

          <div
            style={{
              background: "#131629",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "16px" }}>🏆</div>
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#e2e8f0" }}
            >
              127위
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                marginBottom: "4px",
              }}
            >
              {t("전체 순위", "Overall Rank")}
            </div>
            <div style={{ fontSize: "12px", color: "#34c759" }}>
              {t("+23 상승", "+23 up")}
            </div>
          </div>

          <div
            style={{
              background: "#131629",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "16px" }}>📈</div>
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#e2e8f0" }}
            >
              +12.3%
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                marginBottom: "4px",
              }}
            >
              {t("평균 수익률", "Avg Return")}
            </div>
            <div style={{ fontSize: "12px", color: "#34c759" }}>
              {t("+2.1% 이번 달", "+2.1% this month")}
            </div>
          </div>

          <div
            style={{
              background: "#131629",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "16px" }}>🎯</div>
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#e2e8f0" }}
            >
              8/12
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                marginBottom: "4px",
              }}
            >
              {t("완료된 시뮬레이션", "Completed Sims")}
            </div>
            <div style={{ fontSize: "12px", color: "#e2e8f0" }}>
              {t("승률 67%", "67% Win Rate")}
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 그리드 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          {/* 왼쪽: 시뮬레이션 목록 (2열) */}
          <div style={{ gridColumn: "1 / 3" }}>
            {/* 새 시뮬레이션 생성 */}
            <div
              style={{
                background: "#131629",
                padding: "20px",
                borderRadius: "8px",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>➕</div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#e2e8f0",
                  marginBottom: "8px",
                }}
              >
                {t("새 시뮬레이션 시작", "Start New Simulation")}
              </div>
              <div style={{ fontSize: "14px", color: "#94a3b8" }}>
                {t(
                  "나만의 투자 전략을 테스트해보세요",
                  "Test your investment strategy",
                )}
              </div>
            </div>

            {/* 기술주 집중 투자 */}
            <div
              style={{
                background: "#131629",
                padding: "20px",
                borderRadius: "8px",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "#34c759",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                {t("실시간", "LIVE")}
              </div>

              <div style={{ marginBottom: "16px" }}>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#e2e8f0",
                    marginBottom: "8px",
                  }}
                >
                  {t("기술주 집중 투자", "Tech Stock Focus")}
                </h3>
                <div style={{ fontSize: "14px", color: "#94a3b8" }}>
                  {t(
                    "30일 • 시작일: 2024.06.01",
                    "30 days • Started: 2024.06.01",
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ fontSize: "14px", color: "#94a3b8" }}>
                    {t("진행률", "Progress")}
                  </span>
                  <span style={{ fontSize: "14px", color: "#94a3b8" }}>
                    {t("7/30일", "7/30 days")}
                  </span>
                </div>
                <div
                  style={{
                    height: "8px",
                    background: "#334155",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "25%",
                      height: "100%",
                      background: "#34c759",
                      borderRadius: "4px",
                    }}
                  ></div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "8px",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#34c759",
                    }}
                  >
                    +8.4%
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {t("수익률", "Return")}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#e2e8f0",
                    }}
                  >
                    $108,400
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {t("현재가치", "Current Value")}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#e2e8f0",
                    }}
                  >
                    23위
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {t("순위", "Rank")}
                  </div>
                </div>
              </div>
            </div>

            {/* 배당주 안정형 */}
            <div
              style={{
                background: "#131629",
                padding: "20px",
                borderRadius: "8px",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "#34c759",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                {t("실시간", "LIVE")}
              </div>

              <div style={{ marginBottom: "16px" }}>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#e2e8f0",
                    marginBottom: "8px",
                  }}
                >
                  {t("배당주 안정형", "Dividend Stable")}
                </h3>
                <div style={{ fontSize: "14px", color: "#94a3b8" }}>
                  {t(
                    "90일 • 시작일: 2024.05.15",
                    "90 days • Started: 2024.05.15",
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ fontSize: "14px", color: "#94a3b8" }}>
                    {t("진행률", "Progress")}
                  </span>
                  <span style={{ fontSize: "14px", color: "#94a3b8" }}>
                    {t("23/90일", "23/90 days")}
                  </span>
                </div>
                <div
                  style={{
                    height: "8px",
                    background: "#334155",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "25%",
                      height: "100%",
                      background: "#34c759",
                      borderRadius: "4px",
                    }}
                  ></div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "8px",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#34c759",
                    }}
                  >
                    +3.2%
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {t("수익률", "Return")}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#e2e8f0",
                    }}
                  >
                    $51,600
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {t("현재가치", "Current Value")}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#e2e8f0",
                    }}
                  >
                    89위
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {t("순위", "Rank")}
                  </div>
                </div>
              </div>
            </div>

            {/* ESG 투자 챌린지 */}
            <div
              style={{
                background: "#131629",
                padding: "20px",
                borderRadius: "8px",
                position: "relative",
                opacity: "0.9",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "#ff9900",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                {t("대기중", "Pending")}
              </div>

              <div style={{ marginBottom: "16px" }}>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#e2e8f0",
                    marginBottom: "8px",
                  }}
                >
                  {t("ESG 투자 챌린지", "ESG Investment Challenge")}
                </h3>
                <div style={{ fontSize: "14px", color: "#94a3b8" }}>
                  {t(
                    "14일 • 시작예정: 2024.06.10",
                    "14 days • Starts: 2024.06.10",
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ fontSize: "14px", color: "#94a3b8" }}>
                    {t("참가자 모집중", "Recruiting")}
                  </span>
                  <span style={{ fontSize: "14px", color: "#94a3b8" }}>
                    {t("847/1000명", "847/1000")}
                  </span>
                </div>
                <div
                  style={{
                    height: "8px",
                    background: "#334155",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "85%",
                      height: "100%",
                      background: "#ff9900",
                      borderRadius: "4px",
                    }}
                  ></div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "8px",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#e2e8f0",
                    }}
                  >
                    $25,000
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {t("초기자금", "Initial Fund")}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#ff9900",
                    }}
                  >
                    $10,000
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {t("상금", "Prize")}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#e2e8f0",
                    }}
                  >
                    847명
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {t("참가자", "Participants")}
                  </div>
                </div>
              </div>
            </div>

            {/* 금융위기 시나리오 */}
            <div
              style={{
                background: "#131629",
                padding: "20px",
                borderRadius: "8px",
                position: "relative",
                opacity: "0.75",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "#6b7280",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                {t("완료", "Completed")}
              </div>

              <div style={{ marginBottom: "16px" }}>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#e2e8f0",
                    marginBottom: "8px",
                  }}
                >
                  {t("금융위기 시나리오", "Financial Crisis Scenario")}
                </h3>
                <div style={{ fontSize: "14px", color: "#94a3b8" }}>
                  {t(
                    "30일 • 완료일: 2024.05.30",
                    "30 days • Completed: 2024.05.30",
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ fontSize: "14px", color: "#94a3b8" }}>
                    {t("최종 결과", "Final Result")}
                  </span>
                  <span style={{ fontSize: "14px", color: "#94a3b8" }}>
                    {t("30/30일", "30/30 days")}
                  </span>
                </div>
                <div
                  style={{
                    height: "8px",
                    background: "#334155",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "#6b7280",
                      borderRadius: "4px",
                    }}
                  ></div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "8px",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#ef4444",
                    }}
                  >
                    -2.1%
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {t("최종수익률", "Final Return")}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#e2e8f0",
                    }}
                  >
                    $97,900
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {t("최종가치", "Final Value")}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#e2e8f0",
                    }}
                  >
                    156위
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {t("최종순위", "Final Rank")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 실시간 리더보드 */}
          <div
            style={{
              background: "#131629",
              padding: "20px",
              borderRadius: "8px",
              height: "fit-content",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#e2e8f0",
                marginBottom: "16px",
              }}
            >
              🏆 {t("실시간 리더보드", "Live Leaderboard")}
            </h3>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {[
                {
                  rank: 1,
                  avatar: "👑",
                  name: "InvestorKing",
                  level: t("전문가 • 3년차", "Expert • 3 years"),
                  score: "+47.2%",
                  change: t("+2.1% 오늘", "+2.1% today"),
                  bgColor: "#eab308",
                },
                {
                  rank: 2,
                  avatar: "🚀",
                  name: "TechGuru99",
                  level: t("고급자 • 2년차", "Advanced • 2 years"),
                  score: "+39.8%",
                  change: t("+1.5% 오늘", "+1.5% today"),
                  bgColor: "#94a3b8",
                },
                {
                  rank: 3,
                  avatar: "💎",
                  name: "DiamondHands",
                  level: t("중급자 • 1년차", "Intermediate • 1 year"),
                  score: "+31.2%",
                  change: t("+0.8% 오늘", "+0.8% today"),
                  bgColor: "#ea580c",
                },
                {
                  rank: 127,
                  avatar: "👤",
                  name: t("나", "You"),
                  level: t("초급자 • 6개월", "Beginner • 6 months"),
                  score: "+12.3%",
                  change: t("-0.3% 오늘", "-0.3% today"),
                  bgColor: "#2563eb",
                  highlight: true,
                },
              ].map((user) => (
                <div
                  key={user.rank}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px",
                    borderRadius: "8px",
                    background: user.highlight ? "#1a1d23" : "#131629",
                    border: user.highlight ? "1px solid #2563eb" : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        background: user.rank <= 3 ? user.bgColor : "#334155",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "white",
                        borderRadius: "50%",
                      }}
                    >
                      {user.rank}
                    </div>
                    <div style={{ fontSize: "18px" }}>{user.avatar}</div>
                    <div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "bold",
                          color: "#e2e8f0",
                        }}
                      >
                        {user.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                        {user.level}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: user.score.startsWith("+")
                          ? "#34c759"
                          : "#ef4444",
                      }}
                    >
                      {user.score}
                    </div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                      {user.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                background: "#0f172a",
                padding: "12px",
                borderRadius: "8px",
                marginTop: "16px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#94a3b8",
                  marginBottom: "4px",
                }}
              >
                {t("이번 주 목표", "Weekly Goal")}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#2563eb",
                }}
              >
                {t("100위 진입하기", "Reach Top 100")}
              </div>
              <div
                style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}
              >
                {t("27위 더 올라가세요!", "Climb 27 more positions!")}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SimulationPage;
