/**
 * 분석 도구 페이지 - 와이어프레임 기반 구현
 */

import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';

const AnalyticsPage: React.FC = () => {
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');
  const [selectedStock, setSelectedStock] = useState('AAPL');

  const analysisTools = [
    {
      id: 1,
      name: '온톨로지 맵',
      nameEn: 'Ontology Map',
      description: '기업 간 관계와 연결성을 시각화',
      descriptionEn: 'Visualize corporate relationships and connectivity',
      icon: '🕸️',
      status: 'active'
    },
    {
      id: 2,
      name: '재무 분석',
      nameEn: 'Financial Analysis',
      description: '종합적인 재무제표 분석 도구',
      descriptionEn: 'Comprehensive financial statement analysis tool',
      icon: '📊',
      status: 'active'
    },
    {
      id: 3,
      name: '감성 분석',
      nameEn: 'Sentiment Analysis',
      description: '뉴스와 소셜미디어 감성 분석',
      descriptionEn: 'News and social media sentiment analysis',
      icon: '💭',
      status: 'coming_soon'
    }
  ];

  const relatedCompanies = [
    { symbol: 'MSFT', name: 'Microsoft', relationship: '경쟁사', strength: 85 },
    { symbol: 'GOOGL', name: 'Alphabet', relationship: '파트너', strength: 72 },
    { symbol: 'AMZN', name: 'Amazon', relationship: '공급업체', strength: 68 },
    { symbol: 'TSLA', name: 'Tesla', relationship: '협력사', strength: 45 }
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
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
              🔍 {language === 'ko' ? '분석 도구' : 'Analytics Tools'}
            </h1>
            <p className="text-xl text-gray-400">
              {language === 'ko' 
                ? '온톨로지 기반 스마트 분석으로 투자 인사이트를 발견하세요' 
                : 'Discover investment insights with ontology-based smart analysis'
              }
            </p>
          </div>

          {/* 종목 선택 */}
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              📈 {language === 'ko' ? '분석할 종목 선택' : 'Select Stock to Analyze'}
            </h2>
            
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                value={selectedStock}
                onChange={(e) => setSelectedStock(e.target.value)}
                placeholder={language === 'ko' ? '종목 코드 입력...' : 'Enter stock symbol...'}
                className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                {language === 'ko' ? '분석 시작' : 'Start Analysis'}
              </button>
            </div>
            
            <div className="text-center text-2xl font-bold text-white">
              {selectedStock} - Apple Inc.
            </div>
            <div className="text-center text-green-400 text-lg">
              $155.30 (+2.45 / +1.61%)
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 분석 도구 목록 */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  🛠️ {language === 'ko' ? '분석 도구' : 'Analysis Tools'}
                </h2>
                
                <div className="space-y-3">
                  {analysisTools.map((tool) => (
                    <div 
                      key={tool.id} 
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        tool.status === 'active' 
                          ? 'bg-gray-700 hover:bg-gray-600' 
                          : 'bg-gray-700/50 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{tool.icon}</span>
                        <span className="text-white font-medium">
                          {language === 'ko' ? tool.name : tool.nameEn}
                        </span>
                        {tool.status === 'coming_soon' && (
                          <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded">
                            {language === 'ko' ? '출시예정' : 'Coming Soon'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">
                        {language === 'ko' ? tool.description : tool.descriptionEn}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 메인 분석 영역 */}
            <div className="lg:col-span-2">
              {/* 온톨로지 맵 */}
              <div className="bg-gray-800 rounded-xl p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  🕸️ {language === 'ko' ? '온톨로지 관계 맵' : 'Ontology Relationship Map'}
                </h2>
                
                <div className="bg-gray-900 rounded-lg p-8 min-h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🕸️</div>
                    <div className="text-white text-lg mb-2">
                      {language === 'ko' ? '온톨로지 맵 로딩 중...' : 'Loading Ontology Map...'}
                    </div>
                    <div className="text-gray-400">
                      {language === 'ko' 
                        ? '기업 관계 데이터를 분석하고 있습니다' 
                        : 'Analyzing corporate relationship data'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* 관련 기업 */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  🏢 {language === 'ko' ? '관련 기업' : 'Related Companies'}
                </h2>
                
                <div className="space-y-3">
                  {relatedCompanies.map((company, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="text-white font-bold">{company.symbol}</div>
                        <div className="text-gray-300">{company.name}</div>
                        <span className="text-sm bg-blue-500 text-white px-2 py-1 rounded">
                          {company.relationship}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-gray-400">
                          {language === 'ko' ? '연관도' : 'Strength'}:
                        </div>
                        <div className="w-16 bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${company.strength}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-white w-8">{company.strength}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 구현 예정 메시지 */}
          <div className="mt-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              🚧 {language === 'ko' ? '고급 분석 기능이 곧 출시됩니다!' : 'Advanced analytics features coming soon!'}
            </h2>
            <p className="text-white/80">
              {language === 'ko' 
                ? 'AI 주가 예측, 실시간 감성 분석, 포트폴리오 최적화 등 혁신적인 기능들이 준비 중입니다.' 
                : 'AI price prediction, real-time sentiment analysis, portfolio optimization and more innovative features are in development.'
              }
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
