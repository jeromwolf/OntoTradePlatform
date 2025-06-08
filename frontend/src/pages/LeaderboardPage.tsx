/**
 * 리더보드 페이지 - 와이어프레임 기반 구현
 */

import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';

const LeaderboardPage: React.FC = () => {
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');

  const leaderboardData = [
    { rank: 1, name: '투자고수', profit: 127500, profitPercent: 27.5, trades: 245, winRate: 68 },
    { rank: 2, name: 'StockMaster', profit: 98200, profitPercent: 19.6, trades: 189, winRate: 72 },
    { rank: 3, name: '월가의늑대', profit: 87350, profitPercent: 17.5, trades: 156, winRate: 65 },
    { rank: 4, name: 'TradingPro', profit: 76890, profitPercent: 15.4, trades: 203, winRate: 61 },
    { rank: 5, name: '주식달인', profit: 65420, profitPercent: 13.1, trades: 167, winRate: 59 }
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          {/* 언어 선택 */}
          <div className="flex justify-end mb-6">
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setLanguage('ko')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  language === 'ko' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🇰🇷 한국어
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  language === 'en' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🇺🇸 English
              </button>
            </div>
          </div>

          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              🏆 {language === 'ko' ? '리더보드' : 'Leaderboard'}
            </h1>
            <p className="text-xl text-gray-400">
              {language === 'ko' 
                ? '최고의 투자자들과 경쟁해보세요!' 
                : 'Compete with the best investors!'
              }
            </p>
          </div>

          {/* 순위표 */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-6">
              📊 {language === 'ko' ? '월간 랭킹' : 'Monthly Rankings'}
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 py-3 px-4">
                      {language === 'ko' ? '순위' : 'Rank'}
                    </th>
                    <th className="text-left text-gray-400 py-3 px-4">
                      {language === 'ko' ? '투자자' : 'Investor'}
                    </th>
                    <th className="text-left text-gray-400 py-3 px-4">
                      {language === 'ko' ? '수익' : 'Profit'}
                    </th>
                    <th className="text-left text-gray-400 py-3 px-4">
                      {language === 'ko' ? '수익률' : 'Return'}
                    </th>
                    <th className="text-left text-gray-400 py-3 px-4">
                      {language === 'ko' ? '거래 횟수' : 'Trades'}
                    </th>
                    <th className="text-left text-gray-400 py-3 px-4">
                      {language === 'ko' ? '승률' : 'Win Rate'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((user) => (
                    <tr key={user.rank} className="border-b border-gray-700/50 hover:bg-gray-700/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {user.rank === 1 && <span className="text-2xl">🥇</span>}
                          {user.rank === 2 && <span className="text-2xl">🥈</span>}
                          {user.rank === 3 && <span className="text-2xl">🥉</span>}
                          {user.rank > 3 && <span className="text-gray-400">#{user.rank}</span>}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-white font-medium">{user.name}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-green-400 font-medium">
                          ${user.profit.toLocaleString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-green-400 font-medium">
                          +{user.profitPercent}%
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-white">{user.trades}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-blue-400">{user.winRate}%</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 구현 예정 메시지 */}
          <div className="mt-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              🚧 {language === 'ko' ? '더 많은 기능이 곧 출시됩니다!' : 'More features coming soon!'}
            </h2>
            <p className="text-white/80">
              {language === 'ko' 
                ? '토너먼트, 경쟁 모드, 업적 시스템 등 흥미진진한 기능들이 준비 중입니다.' 
                : 'Tournaments, competition modes, achievement systems and more exciting features are in development.'
              }
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LeaderboardPage;
