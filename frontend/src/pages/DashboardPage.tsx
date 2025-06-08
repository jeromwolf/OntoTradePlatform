import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DashboardPage: React.FC = () => {
  const [language, setLanguage] = useState<"ko" | "en">("ko");
  const [activeCategory, setActiveCategory] = useState("전체기업");
  const [activeTab, setActiveTab] = useState("온톨로지");
  const navigate = useNavigate();

  const t = (ko: string, en: string) => language === "ko" ? ko : en;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0a0e27',
      color: '#e2e8f0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* 헤더 */}
      <div style={{ 
        background: '#131629', 
        borderBottom: '1px solid #1e293b',
        padding: '12px 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* 로고 */}
          <div style={{ color: '#3b82f6', fontSize: '20px', fontWeight: 'bold' }}>
            ⚡ OntoTrade
          </div>

          {/* 메인 네비게이션 */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              🏠 {t("대시보드", "Dashboard")}
            </button>
            <button style={{
              padding: '8px 16px',
              background: 'transparent',
              color: '#64748b',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              🕸️ {t("온톨로지", "Ontology")}
            </button>
            <button style={{
              padding: '8px 16px',
              background: 'transparent',
              color: '#64748b',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              📊 {t("분석도구", "Analytics")}
            </button>
            <button style={{
              padding: '8px 16px',
              background: 'transparent',
              color: '#64748b',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              🏆 {t("리더보드", "Leaderboard")}
            </button>
            <button style={{
              padding: '8px 16px',
              background: 'transparent',
              color: '#64748b',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              📚 {t("학습센터", "Learn")}
            </button>
            <button style={{
              padding: '8px 16px',
              background: 'transparent',
              color: '#64748b',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              ⚙️ {t("설정", "Settings")}
            </button>
          </div>

          {/* 사용자 정보 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setLanguage("ko")}
                style={{
                  padding: '4px 8px',
                  background: language === "ko" ? '#3b82f6' : 'transparent',
                  color: language === "ko" ? 'white' : '#64748b',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              >
                🇰🇷
              </button>
              <button
                onClick={() => setLanguage("en")}
                style={{
                  padding: '4px 8px',
                  background: language === "en" ? '#3b82f6' : 'transparent',
                  color: language === "en" ? 'white' : '#64748b',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              >
                🇺🇸
              </button>
            </div>
            <div style={{ color: '#10b981', fontSize: '14px', fontWeight: '500' }}>
              💰 {t("가상자산 ₩10,000,000", "Virtual ₩10,000,000")}
            </div>
            <div style={{ color: '#e2e8f0', fontSize: '14px' }}>
              👤 {t("투자자님", "Trader")}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '240px 1fr 280px', 
        height: 'calc(100vh - 72px)',
        gap: '0'
      }}>        {/* 왼쪽 사이드바 */}
        <div style={{ 
          background: '#131629', 
          borderRight: '1px solid #1e293b',
          padding: '20px',
          overflowY: 'auto'
        }}>
          {/* 검색 */}
          <div style={{ marginBottom: '24px' }}>
            <input
              type="text"
              placeholder={t("주식, 기업명 검색...", "Search stocks, companies...")}
              style={{
                width: '100%',
                padding: '12px',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#e2e8f0',
                fontSize: '14px'
              }}
            />
          </div>

          {/* 카테고리 */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t("마켓", "Markets")}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { key: "전체기업", icon: "📈", ko: "전체 기업", en: "All Companies" },
                { key: "기술주", icon: "💻", ko: "기술주", en: "Technology" },
                { key: "금융주", icon: "🏦", ko: "금융주", en: "Finance" },
                { key: "산업재", icon: "🏭", ko: "산업재", en: "Industrial" },
                { key: "에너지", icon: "⚡", ko: "에너지", en: "Energy" },
                { key: "소비재", icon: "🛒", ko: "소비재", en: "Consumer" },
                { key: "헬스케어", icon: "💊", ko: "헬스케어", en: "Healthcare" }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveCategory(item.key)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    background: activeCategory === item.key ? '#3b82f6' : 'transparent',
                    color: activeCategory === item.key ? 'white' : '#94a3b8',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {item.icon} {t(item.ko, item.en)}
                </button>
              ))}
            </div>
          </div>

          {/* 분석도구 */}
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t("분석도구", "Analysis Tools")}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { icon: "🕸️", ko: "온톨로지 뷰", en: "Ontology View" },
                { icon: "📊", ko: "재무 분석", en: "Financial Analysis" },
                { icon: "👥", ko: "인물 네트워크", en: "People Network" },
                { icon: "🏭", ko: "산업 지도", en: "Industry Map" },
                { icon: "📈", ko: "거래 패턴", en: "Trading Patterns" },
                { icon: "🎯", ko: "투자 시뮬레이션", en: "Simulation" }
              ].map((item, index) => (
                <button
                  key={index}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    background: 'transparent',
                    color: '#94a3b8',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  {item.icon} {t(item.ko, item.en)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 중앙 메인 패널 */}
        <div style={{ 
          background: '#131629', 
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* 패널 헤더 */}
          <div style={{ 
            padding: '20px 24px',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#e2e8f0' }}>
              {t("애플 (AAPL) 분석", "Apple Inc. (AAPL) Analysis")}
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{
                padding: '6px 12px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {t("그래프", "Graph")}
              </button>
              <button style={{
                padding: '6px 12px',
                background: '#374151',
                color: '#9ca3af',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {t("목록", "List")}
              </button>
              <button style={{
                padding: '6px 12px',
                background: '#374151',
                color: '#9ca3af',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {t("차트", "Chart")}
              </button>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div style={{ 
            padding: '0 24px',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            gap: '24px'
          }}>
            {[
              { key: "온톨로지", ko: "온톨로지", en: "Ontology" },
              { key: "관련기업", ko: "관련기업", en: "Related" },
              { key: "재무제표", ko: "재무제표", en: "Financials" },
              { key: "인물", ko: "인물", en: "People" },
              { key: "뉴스", ko: "뉴스", en: "News" },
              { key: "패턴", ko: "패턴", en: "Patterns" }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '12px 0',
                  background: 'transparent',
                  color: activeTab === tab.key ? '#3b82f6' : '#64748b',
                  border: 'none',
                  borderBottom: activeTab === tab.key ? '2px solid #3b82f6' : '2px solid transparent',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {t(tab.ko, tab.en)}
              </button>
            ))}
          </div>

          {/* 온톨로지 그래프 영역 */}
          <div style={{ 
            flex: 1,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* 그래프 컨테이너 */}
            <div style={{ 
              height: '300px',
              background: '#0a0e27',
              borderRadius: '8px',
              border: '1px solid #1e293b',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* 중심 AAPL 노드 */}
              <div style={{
                position: 'absolute',
                width: '60px',
                height: '60px',
                background: '#3b82f6',
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold',
                border: '2px solid #60a5fa',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}>
                <div>AAPL</div>
                <div>Corp</div>
              </div>

              {/* Stock 노드 */}
              <div style={{
                position: 'absolute',
                width: '50px',
                height: '50px',
                background: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '9px',
                fontWeight: 'bold',
                border: '2px solid #34d399',
                top: '25%',
                right: '25%'
              }}>
                <div>Stock</div>
                <div>$189</div>
              </div>

              {/* News 노드 */}
              <div style={{
                position: 'absolute',
                width: '50px',
                height: '50px',
                background: '#f59e0b',
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '9px',
                fontWeight: 'bold',
                border: '2px solid #fbbf24',
                bottom: '25%',
                left: '25%'
              }}>
                <div>News</div>
                <div>+88%</div>
              </div>

              {/* Tech Sector 노드 */}
              <div style={{
                position: 'absolute',
                width: '50px',
                height: '50px',
                background: '#8b5cf6',
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '9px',
                fontWeight: 'bold',
                border: '2px solid #a78bfa',
                top: '30%',
                left: '20%'
              }}>
                <div>Tech</div>
                <div>Sector</div>
              </div>

              {/* 연결선들 */}
              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <line x1="50%" y1="50%" x2="75%" y2="25%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="50%" y1="50%" x2="25%" y2="75%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="50%" y1="50%" x2="20%" y2="30%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" />
              </svg>

              {/* 그래프 설명 */}
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                background: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '6px',
                padding: '12px'
              }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>
                  {t("인터랙티브 지식 그래프", "Interactive Knowledge Graph")}
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                  {t("노드를 클릭하여 연결된 정보를 탐색하세요", "Click nodes to explore connected information")}
                </p>
              </div>
            </div>

            {/* 관련 기업 카드들 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                padding: '16px',
                background: '#1e293b',
                borderRadius: '8px',
                border: '1px solid #334155'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <div style={{ color: '#e2e8f0', fontWeight: '500', fontSize: '14px' }}>Microsoft Corporation</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>MSFT</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#e2e8f0', fontWeight: '600' }}>$342.15</div>
                    <div style={{ color: '#10b981', fontSize: '12px' }}>+1.24%</div>
                  </div>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '11px' }}>
                  {t("연결관계: 경쟁사, 동일 섹터, 공급망", "Connections: Competitor, Same sector, Supply chain")}
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: '#1e293b',
                borderRadius: '8px',
                border: '1px solid #334155'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <div style={{ color: '#e2e8f0', fontWeight: '500', fontSize: '14px' }}>Alphabet Inc.</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>GOOGL</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#e2e8f0', fontWeight: '600' }}>$138.21</div>
                    <div style={{ color: '#ef4444', fontSize: '12px' }}>-0.87%</div>
                  </div>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '11px' }}>
                  {t("연결관계: 경쟁사, 모바일 생태계 파트너", "Connections: Competitor, Mobile ecosystem partner")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽 패널 */}
        <div style={{ 
          background: '#131629',
          padding: '20px',
          overflowY: 'auto'
        }}>
          {/* 포트폴리오 섹션 */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0' }}>
                💼 {t("내 포트폴리오", "My Portfolio")}
              </span>
              <a href="#" style={{ color: '#3b82f6', fontSize: '12px', textDecoration: 'none' }}>
                {t("전체보기 →", "View all →")}
              </a>
            </div>

            <div style={{ 
              background: '#10b981',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>₩9,847,320</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>-1.53% (-152,680원)</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#e2e8f0', fontWeight: '500' }}>AAPL</div>
                  <div style={{ color: '#94a3b8', fontSize: '12px' }}>{t("10주", "10 shares")}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#e2e8f0' }}>$1,892</div>
                  <div style={{ color: '#10b981', fontSize: '12px' }}>+2.1%</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#e2e8f0', fontWeight: '500' }}>MSFT</div>
                  <div style={{ color: '#94a3b8', fontSize: '12px' }}>{t("5주", "5 shares")}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#e2e8f0' }}>$1,711</div>
                  <div style={{ color: '#ef4444', fontSize: '12px' }}>-1.2%</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/trading")}
              style={{
                width: '100%',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '16px',
                cursor: 'pointer'
              }}
            >
              💹 {t("거래하기", "Trade")}
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <a href="#" style={{ color: '#3b82f6', fontSize: '12px', textDecoration: 'none' }}>
                  📈 {t("거래 내역", "Trade History")}
                </a>
                <a href="#" style={{ color: '#3b82f6', fontSize: '12px', textDecoration: 'none' }}>
                  📊 {t("성과 분석", "Performance")}
                </a>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <a href="#" style={{ color: '#3b82f6', fontSize: '12px', textDecoration: 'none' }}>
                  🏆 {t("순위: #247", "Rank: #247")}
                </a>
                <a href="#" style={{ color: '#3b82f6', fontSize: '12px', textDecoration: 'none' }}>
                  🎯 {t("목표 설정", "Set Goals")}
                </a>
              </div>
            </div>
          </div>

          {/* 성과 섹션 */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '16px' }}>
              🏆 {t("성과", "Progress")}
            </div>

            <div style={{ 
              background: '#3b82f6',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '12px'
            }}>
              <div style={{ color: 'white', fontSize: '12px', marginBottom: '4px' }}>
                {t("레벨: 초보 투자자", "Level: Novice Trader")}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>
                {t("다음 레벨까지 35%", "35% to next level")}
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                🎖️ {t("배지: 3개", "Badges: 3")}
              </span>
              <a href="#" style={{ color: '#3b82f6', fontSize: '11px', textDecoration: 'none' }}>
                {t("전체보기 →", "View all →")}
              </a>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              <span style={{
                padding: '4px 8px',
                background: '#374151',
                color: '#d1d5db',
                fontSize: '10px',
                borderRadius: '4px'
              }}>
                🥉 {t("첫 거래", "First Trade")}
              </span>
              <span style={{
                padding: '4px 8px',
                background: '#374151',
                color: '#d1d5db',
                fontSize: '10px',
                borderRadius: '4px'
              }}>
                📈 {t("수익 달성", "Profit")}
              </span>
              <span style={{
                padding: '4px 8px',
                background: '#374151',
                color: '#d1d5db',
                fontSize: '10px',
                borderRadius: '4px'
              }}>
                📚 {t("학습 완료", "Learner")}
              </span>
            </div>
          </div>

          {/* 관련 뉴스 */}
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0' }}>
                📰 {t("관련 뉴스", "Related News")}
              </span>
              <a href="#" style={{ color: '#3b82f6', fontSize: '12px', textDecoration: 'none' }}>
                {t("더보기 →", "More →")}
              </a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                {
                  title: t("애플 4분기 실적 예상치 상회", "Apple Q4 Earnings Beat Expectations"),
                  source: "Reuters",
                  sentiment: t("+88% 긍정", "+88% Positive"),
                  color: '#10b981'
                },
                {
                  title: t("아이폰 15 중국 판매량 하락", "iPhone 15 Sales Drop in China Market"),
                  source: "Bloomberg",
                  sentiment: t("-72% 부정", "-72% Negative"),
                  color: '#ef4444'
                },
                {
                  title: t("AI 칩 개발 가속화 발표", "AI Chip Development Accelerated"),
                  source: "TechCrunch",
                  sentiment: t("+91% 긍정", "+91% Positive"),
                  color: '#10b981'
                },
                {
                  title: t("신형 맥북 프로 출시 예정", "New MacBook Pro Launch Expected"),
                  source: "9to5Mac",
                  sentiment: t("65% 중립", "65% Neutral"),
                  color: '#6b7280'
                }
              ].map((news, index) => (
                <div
                  key={index}
                  style={{
                    padding: '12px',
                    background: '#1e293b',
                    borderLeft: `4px solid ${news.color}`,
                    borderRadius: '4px'
                  }}
                >
                  <div style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                    {news.title}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                    <span style={{ color: '#94a3b8' }}>{news.source}</span>
                    <span style={{ color: news.color }}>{news.sentiment}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* AI 예측 섹션 */}
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: '#0f172a',
              border: '1px solid #374151',
              borderRadius: '6px'
            }}>
              <h4 style={{
                margin: '0 0 8px 0',
                fontSize: '12px',
                fontWeight: '500',
                color: '#e2e8f0'
              }}>
                🔮 {t("AI 예측 (곧 출시!)", "AI Prediction (Coming Soon!)")}
              </h4>
              <div style={{ color: '#d1d5db', fontSize: '10px', marginBottom: '4px' }}>
                {t("AAPL 7일 예측", "AAPL 7-day forecast")}
              </div>
              <div style={{ color: '#10b981', fontSize: '10px', marginBottom: '4px' }}>
                {t("📈 73% 상승 확률", "📈 73% Bullish Probability")}
              </div>
              <div style={{ color: '#6b7280', fontSize: '9px' }}>
                {t("*V2.0에서 제공 예정", "*Available in V2.0")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;