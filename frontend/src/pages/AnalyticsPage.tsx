/**
 * 분석 도구 페이지 - 실제 차트 라이브러리 통합 완성
 */

import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import MainLayout from "../components/Layout/MainLayout";

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsPage: React.FC = () => {
  const [language, setLanguage] = useState<"ko" | "en">("ko");
  const [selectedStock, setSelectedStock] = useState("AAPL");
  const [activeTab, setActiveTab] = useState("price");
  const [timeRange, setTimeRange] = useState("1M");

  // 실시간 가격 데이터 시뮬레이션
  const [priceData, setPriceData] = useState<number[]>([]);

  useEffect(() => {
    // 초기 가격 데이터 생성
    const initialData = Array.from({ length: 30 }, (_, i) => {
      return 155 + Math.sin(i * 0.2) * 10 + Math.random() * 5;
    });
    setPriceData(initialData);

    // 실시간 업데이트 시뮬레이션
    const interval = setInterval(() => {
      setPriceData((prev) => {
        const newData = [...prev.slice(1)];
        const lastPrice = prev[prev.length - 1];
        const newPrice = lastPrice + (Math.random() - 0.5) * 3;
        newData.push(Math.max(100, Math.min(200, newPrice)));
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedStock]);

  // 차트 데이터 설정
  const priceChartData = {
    labels: Array.from({ length: 30 }, (_, i) => `${i + 1}일`),
    datasets: [
      {
        label: `${selectedStock} 주가`,
        data: priceData,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const volumeChartData = {
    labels: ["월", "화", "수", "목", "금"],
    datasets: [
      {
        label: "거래량 (M)",
        data: [45, 52, 38, 61, 47],
        backgroundColor: [
          "rgba(239, 68, 68, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(245, 158, 11, 0.8)",
        ],
      },
    ],
  };

  const sectorAnalysisData = {
    labels: ["기술주", "금융", "헬스케어", "소비재", "에너지"],
    datasets: [
      {
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          "#3B82F6",
          "#EF4444",
          "#10B981",
          "#F59E0B",
          "#8B5CF6",
        ],
        hoverBackgroundColor: [
          "#2563EB",
          "#DC2626",
          "#059669",
          "#D97706",
          "#7C3AED",
        ],
      },
    ],
  };

  const sentimentData = {
    labels: ["매우 긍정", "긍정", "중립", "부정", "매우 부정"],
    datasets: [
      {
        data: [25, 35, 20, 15, 5],
        backgroundColor: [
          "#22C55E",
          "#84CC16",
          "#64748B",
          "#F97316",
          "#EF4444",
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#E5E7EB",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#9CA3AF",
        },
        grid: {
          color: "#374151",
        },
      },
      y: {
        ticks: {
          color: "#9CA3AF",
        },
        grid: {
          color: "#374151",
        },
      },
    },
  };

  const analysisTools = [
    {
      id: "price",
      name: "가격 분석",
      nameEn: "Price Analysis",
      icon: "📈",
      description: "실시간 가격 변동 및 기술적 분석",
    },
    {
      id: "volume",
      name: "거래량 분석",
      nameEn: "Volume Analysis",
      icon: "📊",
      description: "거래량 패턴 및 시장 참여도 분석",
    },
    {
      id: "sector",
      name: "섹터 분석",
      nameEn: "Sector Analysis",
      icon: "🏢",
      description: "업종별 비중 및 성과 분석",
    },
    {
      id: "sentiment",
      name: "감성 분석",
      nameEn: "Sentiment Analysis",
      icon: "💭",
      description: "뉴스 및 소셜미디어 감성 분석",
    },
    {
      id: "ontology",
      name: "온톨로지 맵",
      nameEn: "Ontology Map",
      icon: "🕸️",
      description: "기업 간 관계 및 연결성 분석",
    },
  ];

  const financialMetrics = [
    { name: "PER", value: "18.5", change: "+2.1%" },
    { name: "PBR", value: "4.2", change: "-0.8%" },
    { name: "ROE", value: "28.1%", change: "+1.2%" },
    { name: "부채비율", value: "31.2%", change: "-2.3%" },
  ];

  const relatedCompanies = [
    { symbol: "MSFT", name: "Microsoft", relationship: "경쟁사", score: 85, trend: "up" },
    { symbol: "GOOGL", name: "Alphabet", relationship: "파트너", score: 72, trend: "stable" },
    { symbol: "AMZN", name: "Amazon", relationship: "공급업체", score: 68, trend: "down" },
    { symbol: "TSLA", name: "Tesla", relationship: "협력사", score: 45, trend: "up" },
  ];

  const renderChart = () => {
    switch (activeTab) {
      case "price":
        return (
          <div className="h-80">
            <Line data={priceChartData} options={chartOptions} />
          </div>
        );
      case "volume":
        return (
          <div className="h-80">
            <Bar data={volumeChartData} options={chartOptions} />
          </div>
        );
      case "sector":
        return (
          <div className="h-80 flex justify-center">
            <div className="w-80">
              <Doughnut data={sectorAnalysisData} />
            </div>
          </div>
        );
      case "sentiment":
        return (
          <div className="h-80 flex justify-center">
            <div className="w-80">
              <Doughnut data={sentimentData} />
            </div>
          </div>
        );
      case "ontology":
        return (
          <div className="h-80 bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🕸️</div>
              <p className="text-gray-400">
                {language === "ko" 
                  ? "온톨로지 네트워크 맵 (개발 중)" 
                  : "Ontology Network Map (In Development)"}
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                🔍 {language === "ko" ? "분석 도구" : "Analytics Tools"}
              </h1>
              <p className="text-xl text-gray-400">
                {language === "ko"
                  ? "실시간 차트와 온톨로지 기반 스마트 분석"
                  : "Real-time charts and ontology-based smart analysis"}
              </p>
            </div>
            <div className="flex gap-4">
              {/* 시간 범위 선택 */}
              <div className="flex bg-gray-800 rounded-lg p-1">
                {["1D", "1W", "1M", "3M", "1Y"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      timeRange === range
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              {/* 언어 선택 */}
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
          </div>

          {/* 종목 정보 */}
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={selectedStock}
                  onChange={(e) => setSelectedStock(e.target.value)}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {selectedStock} - Apple Inc.
                  </div>
                  <div className="text-lg text-green-400">
                    ${priceData[priceData.length - 1]?.toFixed(2) || "155.30"} 
                    <span className="text-sm ml-2">
                      (+2.45 / +1.61%)
                    </span>
                  </div>
                </div>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                🔄 {language === "ko" ? "실시간 업데이트" : "Real-time Update"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 분석 도구 목록 */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-xl p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  🛠️ {language === "ko" ? "분석 도구" : "Analysis Tools"}
                </h2>
                <div className="space-y-2">
                  {analysisTools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTab(tool.id)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        activeTab === tool.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{tool.icon}</span>
                        <div>
                          <div className="font-medium">
                            {language === "ko" ? tool.name : tool.nameEn}
                          </div>
                          <div className="text-sm opacity-75">
                            {tool.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 재무 지표 */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  📊 {language === "ko" ? "핵심 지표" : "Key Metrics"}
                </h3>
                <div className="space-y-3">
                  {financialMetrics.map((metric, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-300">{metric.name}</span>
                      <div className="text-right">
                        <div className="text-white font-medium">{metric.value}</div>
                        <div className={`text-sm ${
                          metric.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {metric.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 메인 차트 영역 */}
            <div className="lg:col-span-3">
              <div className="bg-gray-800 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    {analysisTools.find(tool => tool.id === activeTab)?.icon}{" "}
                    {language === "ko" 
                      ? analysisTools.find(tool => tool.id === activeTab)?.name
                      : analysisTools.find(tool => tool.id === activeTab)?.nameEn
                    }
                  </h2>
                  <div className="flex gap-2">
                    <button className="text-gray-400 hover:text-white p-2">📊</button>
                    <button className="text-gray-400 hover:text-white p-2">📈</button>
                    <button className="text-gray-400 hover:text-white p-2">⚙️</button>
                  </div>
                </div>
                {renderChart()}
              </div>

              {/* 관련 종목 및 온톨로지 관계 */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  🕸️ {language === "ko" ? "연관 종목 분석" : "Related Stock Analysis"}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {relatedCompanies.map((company, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <div className="text-white font-medium">{company.symbol}</div>
                          <div className="text-gray-400 text-sm">{company.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">{company.score}</div>
                          <div className={`text-sm ${
                            company.trend === 'up' ? 'text-green-400' : 
                            company.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            {company.trend === 'up' ? '📈' : 
                             company.trend === 'down' ? '📉' : '➡️'}
                          </div>
                        </div>
                      </div>
                      <div className="text-gray-300 text-sm">{company.relationship}</div>
                      <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${company.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
