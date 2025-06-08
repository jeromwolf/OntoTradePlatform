/**
 * 리더보드 페이지 - 실시간 순위 시스템 완성
 */

import React, { useState, useEffect } from "react";
import MainLayout from "../components/Layout/MainLayout";

const LeaderboardPage: React.FC = () => {
  const [language, setLanguage] = useState<"ko" | "en">("ko");
  const [activeTab, setActiveTab] = useState("overall");
  const [timeFilter, setTimeFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [sortBy, setSortBy] = useState("profit");
  const [realTimeUpdate, setRealTimeUpdate] = useState(true);

  // 실시간 리더보드 데이터
  const [leaderboardData, setLeaderboardData] = useState([
    {
      id: 1,
      rank: 1,
      name: "투자고수",
      avatar: "",
      profit: 127500,
      profitPercent: 27.5,
      trades: 245,
      winRate: 68,
      portfolio: 590000,
      riskScore: 7.2,
      streak: 12,
      country: "KR",
      isOnline: true,
      lastActive: "",
      achievements: ["", "", ""],
      monthlyGrowth: 15.2,
    },
    {
      id: 2,
      rank: 2,
      name: "StockMaster",
      avatar: "",
      profit: 98200,
      profitPercent: 19.6,
      trades: 189,
      winRate: 72,
      portfolio: 598200,
      riskScore: 5.8,
      streak: 8,
      country: "US",
      isOnline: true,
      lastActive: "",
      achievements: ["", ""],
      monthlyGrowth: 12.1,
    },
    {
      id: 3,
      rank: 3,
      name: "월가의늑대",
      avatar: "",
      profit: 87350,
      profitPercent: 17.5,
      trades: 156,
      winRate: 65,
      portfolio: 587350,
      riskScore: 8.5,
      streak: 6,
      country: "KR",
      isOnline: false,
      lastActive: "",
      achievements: ["", ""],
      monthlyGrowth: 9.8,
    },
    {
      id: 4,
      rank: 4,
      name: "TradingPro",
      avatar: "",
      profit: 76890,
      profitPercent: 15.4,
      trades: 203,
      winRate: 61,
      portfolio: 576890,
      riskScore: 6.3,
      streak: 4,
      country: "JP",
      isOnline: true,
      lastActive: "",
      achievements: [""],
      monthlyGrowth: 11.5,
    },
    {
      id: 5,
      rank: 5,
      name: "주식달인",
      avatar: "",
      profit: 65420,
      profitPercent: 13.1,
      trades: 167,
      winRate: 59,
      portfolio: 565420,
      riskScore: 7.8,
      streak: 3,
      country: "KR",
      isOnline: false,
      lastActive: "",
      achievements: [""],
      monthlyGrowth: 8.7,
    },
  ]);

  // 현재 사용자 정보
  const currentUser = {
    id: 123,
    rank: 15,
    name: "",
    avatar: "",
    profit: 42300,
    profitPercent: 8.5,
    trades: 89,
    winRate: 54,
    portfolio: 542300,
    riskScore: 6.1,
    streak: 2,
    monthlyGrowth: 6.2,
  };

  // 실시간 업데이트 시뮬레이션
  useEffect(() => {
    if (!realTimeUpdate) return;

    const interval = setInterval(() => {
      setLeaderboardData((prev) =>
        prev.map((user) => ({
          ...user,
          profit: user.profit + (Math.random() - 0.5) * 1000,
          profitPercent: user.profitPercent + (Math.random() - 0.5) * 0.5,
          trades: user.trades + Math.floor(Math.random() * 2),
          winRate: Math.max(40, Math.min(80, user.winRate + (Math.random() - 0.5) * 2)),
          isOnline: Math.random() > 0.3, // 70% 온라인 확률
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [realTimeUpdate]);

  const tabs = [
    { id: "overall", name: "", nameEn: "Overall", icon: "" },
    { id: "monthly", name: "", nameEn: "Monthly", icon: "" },
    { id: "weekly", name: "", nameEn: "Weekly", icon: "" },
    { id: "daily", name: "", nameEn: "Daily", icon: "" },
  ];

  const timeFilters = [
    { id: "all", name: "", nameEn: "All Time" },
    { id: "year", name: "", nameEn: "This Year" },
    { id: "month", name: "", nameEn: "This Month" },
    { id: "week", name: "", nameEn: "This Week" },
  ];

  const sortOptions = [
    { id: "profit", name: "", nameEn: "Profit" },
    { id: "winRate", name: "", nameEn: "Win Rate" },
    { id: "trades", name: "", nameEn: "Trades" },
    { id: "streak", name: "", nameEn: "Streak" },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "";
      case 2:
        return "";
      case 3:
        return "";
      default:
        return `#${rank}`;
    }
  };

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      KR: "",
      US: "",
      JP: "",
      GB: "",
      DE: "",
    };
    return flags[country] || "";
  };

  const filteredData = leaderboardData
    .filter((user) =>
      user.name.toLowerCase().includes(userSearch.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "profit":
          return b.profitPercent - a.profitPercent;
        case "winRate":
          return b.winRate - a.winRate;
        case "trades":
          return b.trades - a.trades;
        case "streak":
          return b.streak - a.streak;
        default:
          return a.rank - b.rank;
      }
    });

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {" "}
                {language === "ko" ? "" : "Leaderboard"}
              </h1>
              <p className="text-xl text-gray-400">
                {language === "ko"
                  ? ""
                  : "Real-time investment performance rankings and competition"}
              </p>
            </div>
            <div className="flex gap-4">
              {/* 실시간 업데이트 토글 */}
              <button
                onClick={() => setRealTimeUpdate(!realTimeUpdate)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  realTimeUpdate
                    ? "bg-green-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    realTimeUpdate ? "bg-green-300 animate-pulse" : "bg-gray-500"
                  }`}
                ></div>
                {language === "ko" ? "" : "Live"}
              </button>
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
                  {" "}
                </button>
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    language === "en"
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {" "}
                </button>
              </div>
            </div>
          </div>

          {/* 탭 및 필터 */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* 기간 탭 */}
            <div className="flex bg-gray-800 rounded-lg p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab.icon} {language === "ko" ? tab.name : tab.nameEn}
                </button>
              ))}
            </div>

            {/* 시간 필터 */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              {timeFilters.map((filter) => (
                <option key={filter.id} value={filter.id}>
                  {language === "ko" ? filter.name : filter.nameEn}
                </option>
              ))}
            </select>

            {/* 정렬 옵션 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {language === "ko" ? option.name : option.nameEn}
                </option>
              ))}
            </select>

            {/* 검색 */}
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder={
                language === "ko" ? "" : "Search users..."
              }
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none flex-1 min-w-0"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 상위 3명 포디움 */}
            <div className="lg:col-span-4 mb-6">
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6 text-center">
                  {" "}
                  {language === "ko" ? "" : "Hall of Fame"}
                </h2>
                <div className="flex justify-center items-end gap-8">
                  {/* 2등 */}
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-lg mb-2">
                      {leaderboardData[1]?.avatar}
                    </div>
                    <div className="text-3xl mb-2"></div>
                    <div className="text-white font-bold">
                      {leaderboardData[1]?.name}
                    </div>
                    <div className="text-green-400 font-medium">
                      +{leaderboardData[1]?.profitPercent.toFixed(1)}%
                    </div>
                  </div>

                  {/* 1등 */}
                  <div className="text-center relative">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="text-2xl animate-bounce"></div>
                    </div>
                    <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-lg mb-2">
                      {leaderboardData[0]?.avatar}
                    </div>
                    <div className="text-4xl mb-2"></div>
                    <div className="text-white font-bold text-lg">
                      {leaderboardData[0]?.name}
                    </div>
                    <div className="text-green-400 font-medium text-lg">
                      +{leaderboardData[0]?.profitPercent.toFixed(1)}%
                    </div>
                  </div>

                  {/* 3등 */}
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full flex items-center justify-center text-lg mb-2">
                      {leaderboardData[2]?.avatar}
                    </div>
                    <div className="text-3xl mb-2"></div>
                    <div className="text-white font-bold">
                      {leaderboardData[2]?.name}
                    </div>
                    <div className="text-green-400 font-medium">
                      +{leaderboardData[2]?.profitPercent.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 나의 순위 */}
            <div className="lg:col-span-4 mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {" "}
                  {language === "ko" ? "" : "My Ranking"}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-white/70 text-sm"></div>
                    <div className="text-white text-2xl font-bold">
                      #{currentUser.rank}
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-white/70 text-sm"></div>
                    <div className="text-green-300 text-2xl font-bold">
                      +{currentUser.profitPercent}%
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-white/70 text-sm"></div>
                    <div className="text-white text-2xl font-bold">
                      {currentUser.winRate}%
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-white/70 text-sm"></div>
                    <div className="text-yellow-300 text-2xl font-bold">
                      {currentUser.streak}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 리더보드 테이블 */}
            <div className="lg:col-span-4">
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                          {language === "ko" ? "" : "Rank"}
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                          {language === "ko" ? "" : "User"}
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">
                          {language === "ko" ? "" : "Return"}
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">
                          {language === "ko" ? "" : "Trades"}
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">
                          {language === "ko" ? "" : "Win Rate"}
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">
                          {language === "ko" ? "" : "Streak"}
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">
                          {language === "ko" ? "" : "Status"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredData.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">
                                {getRankIcon(user.rank)}
                              </span>
                              <span className="text-gray-400 text-sm">
                                {user.rank <= 3 ? "" : `#${user.rank}`}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-lg">
                                {user.avatar}
                              </div>
                              <div>
                                <div className="text-white font-medium flex items-center gap-2">
                                  {user.name}
                                  <span className="text-sm">
                                    {getCountryFlag(user.country)}
                                  </span>
                                  {user.achievements.map((achievement, i) => (
                                    <span key={i} className="text-sm">
                                      {achievement}
                                    </span>
                                  ))}
                                </div>
                                <div className="text-gray-400 text-sm">
                                  {user.lastActive}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="text-green-400 font-bold text-lg">
                              +{user.profitPercent.toFixed(1)}%
                            </div>
                            <div className="text-gray-400 text-sm">
                              ${user.profit.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="text-white font-medium">
                              {user.trades}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div
                              className={`font-medium ${
                                user.winRate >= 70
                                  ? "text-green-400"
                                  : user.winRate >= 60
                                  ? "text-yellow-400"
                                  : "text-red-400"
                              }`}
                            >
                              {user.winRate}%
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div
                              className={`font-medium ${
                                user.streak >= 10
                                  ? "text-yellow-400"
                                  : user.streak >= 5
                                  ? "text-green-400"
                                  : "text-white"
                              }`}
                            >
                              {user.streak}
                              {user.streak >= 5 && (
                                <span className="ml-1"></span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                user.isOnline
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  user.isOnline ? "bg-green-400" : "bg-gray-400"
                                }`}
                              ></div>
                              {user.isOnline
                                ? (language === "ko" ? "" : "Online")
                                : (language === "ko" ? "" : "Offline")}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LeaderboardPage;
