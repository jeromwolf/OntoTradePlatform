/**
 * 메인 대시보드 페이지 - 와이어프레임 기반 구현
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';

// 타입 정의
interface QuickAction {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  bgColor: string;
  route: string;
}

interface MarketStats {
  label: string;
  labelEn: string;
  value: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  icon: string;
}

const DashboardPage: React.FC = () => {
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');
  const navigate = useNavigate();

  // 빠른 액션 카드들
  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: '실시간 거래',
      titleEn: 'Live Trading',
      description: '주식 매매 및 포트폴리오 관리',
      descriptionEn: 'Trade stocks and manage portfolio',
      icon: '📈',
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      route: '/trading'
    },
    {
      id: '2',
      title: '포트폴리오 관리',
      titleEn: 'Portfolio',
      description: '자산 현황 및 수익률 분석',
      descriptionEn: 'Asset overview and return analysis',
      icon: '💼',
      bgColor: 'bg-gradient-to-br from-green-500 to-green-600',
      route: '/portfolio'
    },
    {
      id: '3',
      title: '리더보드',
      titleEn: 'Leaderboard',
      description: '투자자 순위 및 경쟁',
      descriptionEn: 'Investor rankings and competition',
      icon: '🏆',
      bgColor: 'bg-gradient-to-br from-yellow-500 to-orange-500',
      route: '/leaderboard'
    },
    {
      id: '4',
      title: '분석 도구',
      titleEn: 'Analytics',
      description: '온톨로지 기반 기업 분석',
      descriptionEn: 'Ontology-based company analysis',
      icon: '🕸️',
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      route: '/analytics'
    },
    {
      id: '5',
      title: '학습 센터',
      titleEn: 'Learning',
      description: '투자 가이드 및 튜토리얼',
      descriptionEn: 'Investment guides and tutorials',
      icon: '📚',
      bgColor: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      route: '/learning'
    },
    {
      id: '6',
      title: '시뮬레이션',
      titleEn: 'Simulation',
      description: '가상 투자 연습',
      descriptionEn: 'Virtual investment practice',
      icon: '🎮',
      bgColor: 'bg-gradient-to-br from-red-500 to-pink-500',
      route: '/simulation'
    }
  ];

  // 시장 통계
  const marketStats: MarketStats[] = [
    {
      label: 'S&P 500',
      labelEn: 'S&P 500',
      value: '4,350.65',
      change: '+24.30',
      changePercent: '+0.56',
      isPositive: true,
      icon: '📊'
    },
    {
      label: 'NASDAQ',
      labelEn: 'NASDAQ',
      value: '13,542.12',
      change: '+89.45',
      changePercent: '+0.67',
      isPositive: true,
      icon: '💻'
    },
    {
      label: 'KOSPI',
      labelEn: 'KOSPI',
      value: '2,485.34',
      change: '-12.67',
      changePercent: '-0.51',
      isPositive: false,
      icon: '🇰🇷'
    },
    {
      label: '비트코인',
      labelEn: 'Bitcoin',
      value: '$67,234',
      change: '+1,234',
      changePercent: '+1.87',
      isPositive: true,
      icon: '₿'
    }
  ];

  // 최근 활동 더미 데이터
  const recentActivities = [
    {
      id: '1',
      type: 'buy',
      symbol: 'AAPL',
      action: language === 'ko' ? '매수' : 'Bought',
      quantity: 10,
      price: 155.30,
      time: '10:23',
      profit: null
    },
    {
      id: '2',
      type: 'sell',
      symbol: 'TSLA',
      action: language === 'ko' ? '매도' : 'Sold',
      quantity: 5,
      price: 235.40,
      time: '09:45',
      profit: 234.50
    },
    {
      id: '3',
      type: 'buy',
      symbol: 'MSFT',
      action: language === 'ko' ? '매수' : 'Bought',
      quantity: 8,
      price: 318.90,
      time: '09:12',
      profit: null
    }
  ];

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-900 p-6">
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

        <div className="max-w-7xl mx-auto space-y-8">
          {/* 환영 메시지 */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">
              ⚡ {language === 'ko' ? 'OntoTrade에 오신 것을 환영합니다!' : 'Welcome to OntoTrade!'}
            </h1>
            <p className="text-xl text-gray-400">
              {language === 'ko' 
                ? '온톨로지 기반 스마트 투자 플랫폼' 
                : 'Ontology-powered Smart Investment Platform'
              }
            </p>
          </div>

          {/* 시장 현황 */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              📈 {language === 'ko' ? '시장 현황' : 'Market Overview'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {marketStats.map((stat, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">{stat.icon}</span>
                    <span className="text-sm text-gray-400">
                      {language === 'ko' ? stat.label : stat.labelEn}
                    </span>
                  </div>
                  <div className="text-xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className={`text-sm font-medium ${
                    stat.isPositive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stat.change} ({stat.changePercent}%)
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 빠른 액션 카드들 */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              🚀 {language === 'ko' ? '빠른 시작' : 'Quick Actions'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action) => (
                <div
                  key={action.id}
                  className={`${action.bgColor} rounded-xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl`}
                  onClick={() => navigate(action.route)}
                >
                  <div className="text-4xl mb-4">{action.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {language === 'ko' ? action.title : action.titleEn}
                  </h3>
                  <p className="text-white/80">
                    {language === 'ko' ? action.description : action.descriptionEn}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 최근 거래 활동 */}
            <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                📋 {language === 'ko' ? '최근 거래 활동' : 'Recent Trading Activity'}
              </h2>
              
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'buy' ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                      <div>
                        <div className="text-white font-medium">
                          {activity.symbol} - {activity.action} {activity.quantity}주
                        </div>
                        <div className="text-sm text-gray-400">
                          ${activity.price} • {activity.time}
                        </div>
                      </div>
                    </div>
                    {activity.profit && (
                      <div className="text-green-400 font-medium">
                        +{formatCurrency(activity.profit)}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button 
                onClick={() => navigate('/transactions')}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {language === 'ko' ? '모든 거래 내역 보기' : 'View All Transactions'}
              </button>
            </div>

            {/* 포트폴리오 요약 */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                💼 {language === 'ko' ? '내 포트폴리오' : 'My Portfolio'}
              </h2>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">
                    $127,580
                  </div>
                  <div className="text-sm text-gray-400">
                    {language === 'ko' ? '총 자산' : 'Total Assets'}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xl font-bold text-green-400 mb-1">
                    +$2,450 (+1.96%)
                  </div>
                  <div className="text-sm text-gray-400">
                    {language === 'ko' ? '일간 수익' : 'Daily P&L'}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {language === 'ko' ? '투자 원금' : 'Initial Investment'}
                    </span>
                    <span className="text-white">$100,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {language === 'ko' ? '총 수익률' : 'Total Return'}
                    </span>
                    <span className="text-green-400">+27.58%</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/portfolio')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {language === 'ko' ? '포트폴리오 관리' : 'Manage Portfolio'}
                </button>
              </div>
            </div>
          </div>

          {/* 학습 및 도움말 */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              📚 {language === 'ko' ? '투자 학습이 처음이신가요?' : 'New to investing?'}
            </h2>
            <p className="text-white/80 mb-4">
              {language === 'ko' 
                ? 'OntoTrade 학습 센터에서 투자의 기초부터 고급 전략까지 배워보세요!' 
                : 'Learn from basics to advanced strategies in OntoTrade Learning Center!'
              }
            </p>
            <button 
              onClick={() => navigate('/learning')}
              className="bg-white text-indigo-600 font-medium py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {language === 'ko' ? '학습 시작하기' : 'Start Learning'}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
