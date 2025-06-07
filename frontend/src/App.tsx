import { useState } from 'react';
import './App.css';

function App() {
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');

  const content = {
    ko: {
      title: 'OntoTrade',
      subtitle: '온톨로지 기반 투자 시뮬레이션 플랫폼',
      welcome: 'OntoTrade에 오신 것을 환영합니다! 🎉',
      description: '혁신적인 지식 그래프 기술로 더 스마트한 투자를 경험하세요.',
      features: [
        '🎯 실시간 투자 시뮬레이션',
        '📊 온톨로지 기반 분석 도구',
        '🏆 게임화된 학습 시스템',
        '👥 커뮤니티 기능',
      ],
      getStarted: '시작하기',
      language: '언어',
    },
    en: {
      title: 'OntoTrade',
      subtitle: 'Ontology-based Investment Simulation Platform',
      welcome: 'Welcome to OntoTrade! 🎉',
      description:
        'Experience smarter investing with innovative knowledge graph technology.',
      features: [
        '🎯 Real-time Investment Simulation',
        '📊 Ontology-based Analysis Tools',
        '🏆 Gamified Learning System',
        '👥 Community Features',
      ],
      getStarted: 'Get Started',
      language: 'Language',
    },
  };

  const t = content[language];

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <div className='max-w-4xl mx-auto text-center'>
        {/* 언어 토글 */}
        <div className='absolute top-4 right-4 flex gap-2'>
          <button
            onClick={() => setLanguage('ko')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              language === 'ko'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            한국어
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              language === 'en'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            English
          </button>
        </div>

        {/* 메인 컨텐츠 */}
        <div className='bg-white rounded-2xl shadow-xl p-8 md:p-12'>
          <h1 className='text-5xl md:text-7xl font-bold text-gray-900 mb-4'>
            {t.title}
          </h1>
          <p className='text-xl md:text-2xl text-gray-600 mb-8'>{t.subtitle}</p>

          <div className='bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl mb-8'>
            <h2 className='text-2xl font-bold mb-2'>{t.welcome}</h2>
            <p className='text-blue-100'>{t.description}</p>
          </div>

          {/* 기능 목록 */}
          <div className='grid md:grid-cols-2 gap-4 mb-8'>
            {t.features.map((feature, index) => (
              <div key={index} className='text-left p-4 bg-gray-50 rounded-lg'>
                <span className='text-lg'>{feature}</span>
              </div>
            ))}
          </div>

          {/* 시작하기 버튼 */}
          <button className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg'>
            {t.getStarted}
          </button>

          {/* 상태 표시 */}
          <div className='mt-8 text-sm text-gray-500'>
            <p>✅ React 18 + TypeScript + Vite</p>
            <p>✅ Tailwind CSS</p>
            <p>✅ Vitest 테스트 환경</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
