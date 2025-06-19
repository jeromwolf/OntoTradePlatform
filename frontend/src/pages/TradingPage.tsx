import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, Card, Spin, message } from 'antd';
import type { TabsProps } from 'antd';
import MainLayout from "../components/Layout/MainLayout";
import StockQuote from "../components/trading/StockQuote";
import OrderForm from "../components/trading/OrderForm";
import OrderBook from "../components/trading/OrderBook";
import PortfolioSummary from "../components/portfolio/PortfolioSummary";
import { tradingApi } from "../api/tradingApi";
import type { OrderBook as OrderBookType, MarketData, StockInfo } from "../types/trading";

// 인기 종목 목록 (예시 데이터)
const DOMESTIC_STOCKS: StockInfo[] = [
  { symbol: '005930', name: '삼성전자' },
  { symbol: '000660', name: 'SK하이닉스' },
  { symbol: '035420', name: 'NAVER' },
  { symbol: '035720', name: '카카오' },
  { symbol: '207940', name: '삼성바이오로직스' },
];

const OVERSEAS_STOCKS: StockInfo[] = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'TSLA', name: 'Tesla' },
];

// Tabs 설정
const tabItems: TabsProps['items'] = [
  {
    key: 'domestic',
    label: '국내주식',
    children: null,
  },
  {
    key: 'overseas',
    label: '해외주식',
    children: null,
  },
];

const TradingPage: React.FC = () => {
  const { symbol: urlSymbol } = useParams<{ symbol?: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('domestic');
  const [isOverseas, setIsOverseas] = useState<boolean>(false);
  const [selectedStock, setSelectedStock] = useState<StockInfo | null>(null);
  const [orderBook, setOrderBook] = useState<OrderBookType | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [orderCompleted, setOrderCompleted] = useState<number>(0);

  const currentStocks = isOverseas ? OVERSEAS_STOCKS : DOMESTIC_STOCKS;

  // URL 파라미터나 선택된 종목이 변경되면 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // URL에 종목이 지정된 경우 해당 종목 선택
        if (urlSymbol) {
          const allStocks = [...DOMESTIC_STOCKS, ...OVERSEAS_STOCKS];
          const stock = allStocks.find(s => s.symbol === urlSymbol);
          if (stock) {
            setSelectedStock(stock);
            const isOverseasStock = OVERSEAS_STOCKS.some(s => s.symbol === urlSymbol);
            setIsOverseas(isOverseasStock);
            setActiveTab(isOverseasStock ? 'overseas' : 'domestic');
          }
        } else if (currentStocks.length > 0 && !selectedStock) {
          // 기본으로 첫 번째 종목 선택
          setSelectedStock(currentStocks[0]);
        }

        // 선택된 종목의 호가창 데이터 로드
        if (selectedStock) {
          const orderBookData = await tradingApi.getOrderBook(selectedStock.symbol);
          setOrderBook(orderBookData);
          
          // TODO: 실제 시장 데이터 API로 대체
          setMarketData({
            symbol: selectedStock.symbol,
            price: Math.random() * 1000,
            change: (Math.random() * 20) - 10,
            change_percent: (Math.random() * 5) - 2.5,
            volume: Math.floor(Math.random() * 1000000),
            timestamp: new Date(),
          });
        }
      } catch (err) {
        console.error('Failed to load trading data:', err);
        const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
        setError('거래 데이터를 불러오는 중 오류가 발생했습니다.');
        message.error(`거래 데이터 로드 실패: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedStock, urlSymbol, currentStocks]);

  // 탭 변경 핸들러
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    const newIsOverseas = key === 'overseas';
    setIsOverseas(newIsOverseas);
    
    // 탭이 변경되면 해당 탭의 첫 번째 종목 선택
    const newStocks = newIsOverseas ? OVERSEAS_STOCKS : DOMESTIC_STOCKS;
    if (newStocks.length > 0) {
      const newStock = newStocks[0];
      setSelectedStock(newStock);
      // URL 업데이트
      navigate(`/trading/${newStock.symbol}`, { replace: true });
    }
  };

  // 주문 성공 핸들러
  const handleOrderSuccess = () => {
    setOrderCompleted(prev => prev + 1);
    message.success('주문이 성공적으로 완료되었습니다.');
    // 주문 내역 새로고침 등 추가 작업
  };

  // 종목 선택 핸들러
  const handleSelectStock = (stock: StockInfo) => {
    setSelectedStock(stock);
    // URL 업데이트 (뒤로 가기/앞으로 가기 지원)
    navigate(`/trading/${stock.symbol}`, { replace: true });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="text-red-500 p-4">{error}</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* 좌측 사이드바 - 종목 목록 */}
          <div className="lg:col-span-3 space-y-4">
            <Card title="종목 검색" className="mb-4">
              {/* TODO: 검색 기능 구현 */}
              <input
                type="text"
                placeholder="종목명 또는 코드로 검색"
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              />
            </Card>

            <Card title={isOverseas ? "해외 인기 종목" : "국내 인기 종목"}>
              <Tabs 
                activeKey={activeTab} 
                onChange={handleTabChange}
                items={tabItems}
                className="p-2"
              />
              
              <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
                {currentStocks.map((stock) => (
                  <div
                    key={stock.symbol}
                    className={`p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded ${
                      selectedStock?.symbol === stock.symbol ? 'bg-blue-50 dark:bg-blue-900' : ''
                    }`}
                    onClick={() => handleSelectStock(stock)}
                  >
                    <div className="font-medium">{stock.name}</div>
                    <div className="text-sm text-gray-500">{stock.symbol}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* 중앙 차트 영역 */}
          <div className="lg:col-span-6 space-y-4">
            {/* 종목 정보 및 차트 */}
            <Card>
              {selectedStock && marketData ? (
                <StockQuote
                  symbol={selectedStock.symbol}
                  price={marketData.price}
                  change={marketData.change}
                  changePercent={marketData.change_percent}
                  volume={marketData.volume}
                />
              ) : (
                <div className="p-4">
                  <Spin />
                </div>
              )}
              <div className="mt-4 h-80 bg-gray-50 dark:bg-gray-700 rounded flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">차트 영역 (구현 예정)</p>
              </div>
            </Card>

            {/* 호가창 */}
            <Card title="호가창">
              {selectedStock ? (
                <OrderBook symbol={selectedStock.symbol} />
              ) : (
                <div className="p-4 text-center">
                  <Spin />
                </div>
              )}
            </Card>
          </div>

          {/* 우측 사이드바 - 주문 폼 및 포트폴리오 */}
          <div className="lg:col-span-3 space-y-4">
            {/* 주문 폼 */}
            <Card title="주문하기">
              {selectedStock ? (
                <OrderForm
                  symbol={selectedStock.symbol}
                  price={marketData?.price || 0}
                  onOrderSuccess={handleOrderSuccess}
                />
              ) : (
                <div className="p-4 text-center">
                  <Spin />
                </div>
              )}
            </Card>

            {/* 포트폴리오 요약 */}
            <Card title="내 포트폴리오">
              <PortfolioSummary />
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TradingPage;
