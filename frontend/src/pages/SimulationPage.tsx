import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StockSearchModal from '../components/StockSearchModal';
import {
  getStockData,
  startSimulation,
  executeTrade,
  getSimulationPortfolio,
  getLeaderboard,
  createWebSocketConnection,
  formatCurrency,
  formatPercent,
  type StockData,
  type SimulationSession,
  type DetailedHolding,
  type LeaderboardEntry,
} from '../services/simulationApi';

const SimulationPage: React.FC = () => {
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  // 시뮬레이션 상태
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [stockData, setStockData] = useState<Record<string, StockData>>({});
  const [session, setSession] = useState<SimulationSession | null>(null);
  const [detailedHoldings, setDetailedHoldings] = useState<DetailedHolding[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [error, setError] = useState<string>('');
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [tradeQuantity, setTradeQuantity] = useState<number>(1);
  const [tradeAction, setTradeAction] = useState<'BUY' | 'SELL'>('BUY');
  const [isTrading, setIsTrading] = useState(false);
  const [isStockSearchOpen, setIsStockSearchOpen] = useState(false);

  const t = (ko: string, en: string) => (language === 'ko' ? ko : en);

  // 초기 데이터 로딩
  const initializeSimulation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      console.log('시뮬레이션 초기화 시작...');

      // 1단계: 주식 데이터 로드 (인증 불필요)
      console.log('주식 데이터 로딩 중...');
      setLoadingStep('주식 데이터 로딩 중...');
      const stocks = await getStockData();
      console.log('주식 데이터 로딩 완료:', Object.keys(stocks).length, '개 종목');
      setStockData(stocks);

      // 사용자 인증 확인
      if (!user) {
        console.error('사용자가 로그인되어 있지 않습니다.');
        setError('로그인이 필요합니다. 로그인 페이지로 이동해주세요.');
        return;
      }

      // 2단계: 시뮬레이션 세션 시작 (인증 필요)
      console.log('시뮬레이션 세션 시작 중...');
      setLoadingStep('시뮬레이션 세션 시작 중...');
      const sessionData = await startSimulation();
      console.log('시뮬레이션 세션 시작 완료:', sessionData);
      setSession(sessionData);

      // 3단계: 포트폴리오 데이터 로드 (인증 필요)
      console.log('포트폴리오 데이터 로딩 중...');
      setLoadingStep('포트폴리오 데이터 로딩 중...');
      try {
        const portfolioData = await getSimulationPortfolio();
        console.log('포트폴리오 데이터 로딩 완료:', portfolioData);
        setDetailedHoldings(portfolioData.detailed_holdings || []);
      } catch (portfolioError) {
        console.error('Portfolio Error:', portfolioError);
        // 포트폴리오 오류는 치명적이지 않으므로 계속 진행
        setDetailedHoldings([]);
      }

      // 4단계: 리더보드 데이터 로드 (인증 불필요)
      console.log('리더보드 데이터 로딩 중...');
      setLoadingStep('리더보드 데이터 로딩 중...');
      const leaderboardData = await getLeaderboard();
      console.log('리더보드 데이터 로딩 완료:', leaderboardData.length, '명');
      setLeaderboard(leaderboardData);

      // 5단계: WebSocket 연결
      console.log('WebSocket 연결 중...');
      setLoadingStep('WebSocket 연결 중...');
      const ws = createWebSocketConnection(
        (data) => {
          if (data.type === 'stock_update') {
            console.log('실시간 주식 데이터 업데이트 수신');
            setStockData(data.data);
          }
        },
        (_error) => {
          console.error('WebSocket 연결 오류');
          setError('실시간 데이터 연결에 실패했습니다. 페이지를 새로고침해주세요.');
        },
        (_event) => console.log('WebSocket 연결이 종료되었습니다.')
      );
      setWebSocket(ws);

      console.log('시뮬레이션 초기화 완료!');

    } catch (err) {
      console.error('시뮬레이션 초기화 오류:', err);
      setError(err instanceof Error ? err.message : '시뮬레이션 초기화에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 거래 실행
  const handleTrade = useCallback(async () => {
    if (!selectedStock || tradeQuantity <= 0) {
      setError(t('주식과 수량을 선택하세요.', 'Please select stock and quantity.'));
      return;
    }

    try {
      setIsTrading(true);
      setError('');

      const result = await executeTrade(selectedStock, tradeAction, tradeQuantity);
      
      // 세션 및 포트폴리오 업데이트
      setSession(result.session);
      
      // 포트폴리오 데이터 다시 로드
      const portfolioData = await getSimulationPortfolio();
      setDetailedHoldings(portfolioData.detailed_holdings);

      // 리더보드 업데이트
      const leaderboardData = await getLeaderboard();
      setLeaderboard(leaderboardData);

      // 폼 초기화
      setTradeQuantity(1);
      
    } catch (err) {
      console.error('거래 실행 오류:', err);
      setError(err instanceof Error ? err.message : '거래 실행에 실패했습니다.');
    } finally {
      setIsTrading(false);
    }
  }, [selectedStock, tradeAction, tradeQuantity, t]);

  // 로그아웃 핸들러
  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('로그아웃 오류:', err);
    }
  }, [signOut, navigate]);

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    // 사용자가 로그인되어 있지 않으면 로그인 페이지로 리다이렉트
    if (!user) {
      console.log('사용자가 로그인되어 있지 않음. 로그인 페이지로 이동...');
      navigate('/login');
      return;
    }

    initializeSimulation();

    // 컴포넌트 언마운트 시 WebSocket 연결 해제
    return () => {
      if (webSocket) {
        webSocket.close();
      }
    };
  }, [user, navigate, initializeSimulation]);

  // 금액 포맷 함수
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  // 퍼센트 포맷 함수
  const formatPercent = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0e27',
        color: '#e2e8f0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* 헤더 */}
      <header
        style={{
          background: '#131629',
          borderBottom: '1px solid #1e293b',
          padding: '16px 24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#60a5fa' }}>
            🎮 {t('시뮬레이션 거래', 'Trading Simulation')}
          </div>

          <nav style={{ display: 'flex', gap: '24px' }}>
            {[
              { path: '/dashboard', icon: '🏠', ko: '대시보드', en: 'Dashboard' },
              { path: '/portfolio', icon: '💼', ko: '포트폴리오', en: 'Portfolio' },
              { path: '/analytics', icon: '📊', ko: '분석도구', en: 'Analytics' },
              { path: '/simulation', icon: '🎮', ko: '시뮬레이션', en: 'Simulation', active: true },
              { path: '/learning', icon: '📚', ko: '학습센터', en: 'Learn' },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: item.active ? '#2563eb' : 'transparent',
                  color: item.active ? 'white' : '#94a3b8',
                }}
                onMouseEnter={(e) => {
                  if (!item.active) {
                    e.currentTarget.style.color = '#e2e8f0';
                    e.currentTarget.style.background = '#334155';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!item.active) {
                    e.currentTarget.style.color = '#94a3b8';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {item.icon} {t(item.ko, item.en)}
              </button>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* 언어 선택 */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setLanguage('ko')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  background: language === 'ko' ? '#2563eb' : '#334155',
                  color: 'white',
                }}
              >
                🇰🇷
              </button>
              <button
                onClick={() => setLanguage('en')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  background: language === 'en' ? '#2563eb' : '#334155',
                  color: 'white',
                }}
              >
                🇺🇸
              </button>
            </div>

            {/* 로그아웃 */}
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                background: '#dc2626',
                color: 'white',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#b91c1c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#dc2626';
              }}
            >
              🚪 {t('로그아웃', 'Logout')}
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main style={{ padding: '24px' }}>
        {isLoading ? (
          // 로딩 화면
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '400px',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '4px solid #334155',
                borderTop: '4px solid #2563eb',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <div style={{ color: '#94a3b8' }}>
              {loadingStep ? (
                <div>
                  {t('시뮬레이션을 초기화하고 있습니다...', 'Initializing simulation...')}
                  <br />
                  {loadingStep}
                </div>
              ) : (
                t('시뮬레이션을 초기화하고 있습니다...', 'Initializing simulation...')
              )}
            </div>
          </div>
        ) : error ? (
          // 에러 화면
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '400px',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ fontSize: '48px' }}>⚠️</div>
            <div style={{ color: '#ef4444', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                {t('오류가 발생했습니다', 'An error occurred')}
              </div>
              <div style={{ color: '#94a3b8' }}>{error}</div>
            </div>
            <button
              onClick={initializeSimulation}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                background: '#2563eb',
                color: 'white',
              }}
            >
              {t('다시 시도', 'Retry')}
            </button>
          </div>
        ) : (
          // 메인 시뮬레이션 UI
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* 왼쪽 컬럼 - 거래 및 포트폴리오 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* 포트폴리오 요약 */}
              {session && (
                <div
                  style={{
                    background: '#131629',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px solid #1e293b',
                  }}
                >
                  <h2 style={{ margin: '0 0 20px 0', color: '#60a5fa', fontSize: '18px' }}>
                    💼 {t('내 포트폴리오', 'My Portfolio')}
                  </h2>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '4px' }}>
                        {t('보유 현금', 'Cash')}
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#34d399' }}>
                        {formatCurrency(session.cash)}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '4px' }}>
                        {t('총 자산가치', 'Total Value')}
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                        {formatCurrency(session.total_value)}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '4px' }}>
                        {t('수익률', 'P&L')}
                      </div>
                      <div
                        style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: session.total_pnl >= 0 ? '#34d399' : '#ef4444',
                        }}
                      >
                        {formatCurrency(session.total_pnl)} ({formatPercent(session.total_pnl_percent)})
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '4px' }}>
                        {t('보유 종목 수', 'Holdings')}
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                        {detailedHoldings.length}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 거래 패널 */}
              <div
                style={{
                  background: '#131629',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #1e293b',
                }}
              >
                <h2 style={{ margin: '0 0 20px 0', color: '#60a5fa', fontSize: '18px' }}>
                  📈 {t('가상 거래', 'Virtual Trading')}
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* 주식 선택 */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>
                      {t('종목 선택', 'Select Stock')}
                    </label>
                    
                    {/* 종목 검색 버튼 */}
                    <button
                      onClick={() => setIsStockSearchOpen(true)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '6px',
                        border: '1px solid #1e293b',
                        background: '#0a0e27',
                        color: selectedStock && stockData[selectedStock] ? '#e2e8f0' : '#94a3b8',
                        fontSize: '14px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'border-color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#2563eb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#1e293b';
                      }}
                    >
                      <span>
                        {selectedStock && stockData[selectedStock] 
                          ? `${stockData[selectedStock].name} (${selectedStock})` 
                          : t('🔍 종목을 검색하세요', '🔍 Search for stocks')
                        }
                      </span>
                      <span style={{ color: '#60a5fa' }}>▼</span>
                    </button>

                    {/* 선택된 종목 정보 */}
                    {selectedStock && stockData[selectedStock] && (
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '12px',
                          background: '#131629',
                          borderRadius: '6px',
                          border: '1px solid #1e293b',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: 'bold', color: '#e2e8f0' }}>
                              {stockData[selectedStock].name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                              {selectedStock}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '4px' }}>
                              {formatCurrency(stockData[selectedStock].price)}
                            </div>
                            <div
                              style={{
                                fontSize: '12px',
                                color: stockData[selectedStock].change >= 0 ? '#34d399' : '#ef4444',
                              }}
                            >
                              {stockData[selectedStock].change >= 0 ? '+' : ''}
                              {formatCurrency(stockData[selectedStock].change)} 
                              ({stockData[selectedStock].change >= 0 ? '+' : ''}
                              {stockData[selectedStock].change_percent.toFixed(2)}%)
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 거래 유형 선택 */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>
                      {t('거래 유형', 'Trade Type')}
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setTradeAction('BUY')}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          background: tradeAction === 'BUY' ? '#16a34a' : '#334155',
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      >
                        📈 {t('매수', 'BUY')}
                      </button>
                      <button
                        onClick={() => setTradeAction('SELL')}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          background: tradeAction === 'SELL' ? '#dc2626' : '#334155',
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      >
                        📉 {t('매도', 'SELL')}
                      </button>
                    </div>
                  </div>

                  {/* 수량 입력 */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>
                      {t('수량', 'Quantity')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={tradeQuantity}
                      onChange={(e) => setTradeQuantity(parseInt(e.target.value) || 1)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #1e293b',
                        background: '#0a0e27',
                        color: '#e2e8f0',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  {/* 예상 금액 */}
                  {selectedStock && stockData[selectedStock] && (
                    <div
                      style={{
                        background: '#0f172a',
                        padding: '12px',
                        borderRadius: '6px',
                        fontSize: '14px',
                      }}
                    >
                      <div style={{ color: '#94a3b8', marginBottom: '4px' }}>
                        {t('예상 금액', 'Estimated Amount')}
                      </div>
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                        {formatCurrency(stockData[selectedStock].price * tradeQuantity)}
                      </div>
                    </div>
                  )}

                  {/* 거래 실행 버튼 */}
                  <button
                    onClick={handleTrade}
                    disabled={!selectedStock || tradeQuantity <= 0 || isTrading}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: !selectedStock || tradeQuantity <= 0 || isTrading ? 'not-allowed' : 'pointer',
                      background: !selectedStock || tradeQuantity <= 0 || isTrading ? '#374151' : '#2563eb',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      opacity: !selectedStock || tradeQuantity <= 0 || isTrading ? 0.5 : 1,
                    }}
                  >
                    {isTrading ? (
                      <>🔄 {t('거래 중...', 'Trading...')}</>
                    ) : (
                      <>⚡ {t('거래 실행', 'Execute Trade')}</>
                    )}
                  </button>
                </div>
              </div>

              {/* 보유 종목 */}
              <div
                style={{
                  background: '#131629',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #1e293b',
                }}
              >
                <h2 style={{ margin: '0 0 20px 0', color: '#60a5fa', fontSize: '18px' }}>
                  📊 {t('보유 종목', 'Holdings')}
                </h2>
                
                {detailedHoldings.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                    {t('보유 종목이 없습니다', 'No holdings yet')}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {detailedHoldings.map((holding) => (
                      <div
                        key={holding.symbol}
                        style={{
                          background: '#0f172a',
                          padding: '16px',
                          borderRadius: '8px',
                          border: '1px solid #1e293b',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                              {holding.symbol}
                            </div>
                            <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                              {t('수량', 'Qty')}: {holding.quantity} | 
                              {t('평균가', 'Avg')}: {formatCurrency(holding.avg_price)}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '4px' }}>
                              {formatCurrency(holding.market_value)}
                            </div>
                            <div
                              style={{
                                fontSize: '14px',
                                color: holding.unrealized_pnl >= 0 ? '#34d399' : '#ef4444',
                              }}
                            >
                              {formatCurrency(holding.unrealized_pnl)} ({formatPercent(holding.unrealized_pnl_percent)})
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 오른쪽 컬럼 - 주식 데이터 및 리더보드 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* 실시간 주식 데이터 */}
              <div
                style={{
                  background: '#131629',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #1e293b',
                }}
              >
                <h2 style={{ margin: '0 0 20px 0', color: '#60a5fa', fontSize: '18px' }}>
                  📈 {t('실시간 주식 데이터', 'Real-time Stock Data')}
                  {webSocket?.readyState === WebSocket.OPEN && (
                    <span style={{ color: '#34d399', fontSize: '14px', marginLeft: '8px' }}>
                      🟢 {t('연결됨', 'Connected')}
                    </span>
                  )}
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                  {Object.entries(stockData).map(([symbol, stock]) => (
                    <div
                      key={symbol}
                      style={{
                        background: '#0f172a',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #1e293b',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onClick={() => setSelectedStock(symbol)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#1e293b';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#0f172a';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                            {stock.name}
                          </div>
                          <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                            {symbol}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '4px' }}>
                            {formatCurrency(stock.price)}
                          </div>
                          <div
                            style={{
                              fontSize: '14px',
                              color: stock.change >= 0 ? '#34d399' : '#ef4444',
                            }}
                          >
                            {stock.change >= 0 ? '+' : ''}{formatCurrency(stock.change)} ({formatPercent(stock.change_percent)})
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 리더보드 */}
              <div
                style={{
                  background: '#131629',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #1e293b',
                }}
              >
                <h2 style={{ margin: '0 0 20px 0', color: '#60a5fa', fontSize: '18px' }}>
                  🏆 {t('리더보드', 'Leaderboard')}
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {leaderboard.slice(0, 10).map((entry) => (
                    <div
                      key={entry.user_id}
                      style={{
                        background: entry.user_id === user?.id ? '#1e293b' : '#0f172a',
                        padding: '16px',
                        borderRadius: '8px',
                        border: entry.user_id === user?.id ? '1px solid #2563eb' : '1px solid #1e293b',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: entry.rank <= 3 ? 
                                (entry.rank === 1 ? '#fbbf24' : entry.rank === 2 ? '#94a3b8' : '#f97316') 
                                : '#374151',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              color: 'white',
                            }}
                          >
                            {entry.rank}
                          </div>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>
                              {entry.user_id === user?.id ? t('나', 'You') : `User ${entry.user_id.slice(-4)}`}
                            </div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                              {t('종목', 'Holdings')}: {entry.holdings_count} | {t('거래', 'Trades')}: {entry.transactions_count}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 'bold' }}>
                            {formatCurrency(entry.total_value)}
                          </div>
                          <div
                            style={{
                              fontSize: '14px',
                              color: entry.total_pnl >= 0 ? '#34d399' : '#ef4444',
                            }}
                          >
                            {formatPercent(entry.total_pnl_percent)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* CSS 애니메이션 */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      
      {/* 종목 검색 모달 */}
      {isStockSearchOpen && (
        <StockSearchModal
          isOpen={isStockSearchOpen}
          onClose={() => setIsStockSearchOpen(false)}
          stockData={stockData}
          onSelectStock={(symbol) => setSelectedStock(symbol)}
          selectedStock={selectedStock}
          language={language}
        />
      )}
    </div>
  );
};

export default SimulationPage;
