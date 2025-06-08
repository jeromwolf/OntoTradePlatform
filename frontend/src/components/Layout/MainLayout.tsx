import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');

  const navigation = [
    { 
      path: '/dashboard', 
      icon: '🏠', 
      label: { ko: '대시보드', en: 'Dashboard' } 
    },
    { 
      path: '/portfolio', 
      icon: '💼', 
      label: { ko: '포트폴리오', en: 'Portfolio' } 
    },
    { 
      path: '/analytics', 
      icon: '📊', 
      label: { ko: '분석도구', en: 'Analytics' } 
    },
    { 
      path: '/simulation', 
      icon: '🎮', 
      label: { ko: '시뮬레이션', en: 'Simulation' } 
    },
    { 
      path: '/leaderboard', 
      icon: '🏆', 
      label: { ko: '리더보드', en: 'Leaderboard' } 
    },
    { 
      path: '/learn', 
      icon: '📚', 
      label: { ko: '학습센터', en: 'Learn' } 
    },
    { 
      path: '/settings', 
      icon: '⚙️', 
      label: { ko: '설정', en: 'Settings' } 
    }
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };

  return (
    <div className="min-h-screen" style={{ background: '#0a0e27', color: '#e2e8f0' }}>
      <div className="max-w-7xl mx-auto p-4">
        {/* 헤더 */}
        <header 
          className="rounded-lg p-4 mb-4 flex justify-between items-center"
          style={{ 
            background: '#131629',
            border: '1px solid #1e293b'
          }}
        >
          {/* 로고 */}
          <Link 
            to="/dashboard" 
            className="text-xl font-semibold"
            style={{ color: '#3b82f6' }}
          >
            ⚡ OntoTrade
          </Link>

          {/* 메인 네비게이션 */}
          <nav className="flex items-center gap-2">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-md text-decoration-none transition-colors ${
                  isActivePath(item.path)
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                style={{
                  backgroundColor: isActivePath(item.path) ? '#3b82f6' : 'transparent',
                  border: isActivePath(item.path) ? 'none' : '1px solid transparent'
                }}
              >
                {item.icon} {item.label[language]}
              </Link>
            ))}
          </nav>

          {/* 사용자 정보 */}
          <div className="flex items-center gap-4">
            {/* 언어 전환 */}
            <div className="flex items-center gap-1">
              <button
                onClick={toggleLanguage}
                className={`px-2 py-1 rounded text-sm ${
                  language === 'ko' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                🇰🇷
              </button>
              <button
                onClick={toggleLanguage}
                className={`px-2 py-1 rounded text-sm ${
                  language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                🇺🇸
              </button>
            </div>

            {/* 가상자산 */}
            <div className="text-sm font-medium" style={{ color: '#10b981' }}>
              💰 {language === 'ko' ? '가상자산' : 'Virtual'} $10,000,000
            </div>

            {/* 사용자명 */}
            <div className="text-sm text-gray-300">
              👤 {user?.email?.split('@')[0] || '투자자'}님
            </div>

            {/* 로그아웃 */}
            <button
              onClick={signOut}
              className="px-3 py-1 rounded text-sm bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              {language === 'ko' ? '로그아웃' : 'Logout'}
            </button>
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
