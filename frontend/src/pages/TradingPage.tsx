import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import StockQuote from '../components/trading/StockQuote';
import OrderForm from '../components/trading/OrderForm';
import PortfolioSummary from '../components/portfolio/PortfolioSummary';
import { Tab } from '@headlessui/react';

// 인기 종목 목록 (예시 데이터)
const DOMESTIC_STOCKS = [
  { symbol: '005930', name: '삼성전자' },
  { symbol: '000660', name: 'SK하이닉스' },
  { symbol: '035720', name: '카카오' },
  { symbol: '005380', name: '현대차' },
  { symbol: '051910', name: 'LG화학' },
];

const OVERSEAS_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'GOOGL', name: 'Alphabet' },
];

interface StockInfo {
  symbol: string;
  name: string;
}

const TradingPage: React.FC = () => {
  const [selectedStock, setSelectedStock] = useState<StockInfo>(DOMESTIC_STOCKS[0]);
  const [isOverseas, setIsOverseas] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [orderCompleted, setOrderCompleted] = useState<number>(0);
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  // 현재 탭에 따른 종목 목록
  const currentStocks = isOverseas ? OVERSEAS_STOCKS : DOMESTIC_STOCKS;

  // 탭 변경 핸들러
  const handleTabChange = (index: number) => {
    setActiveTab(index);
    const newIsOverseas = index === 1;
    setIsOverseas(newIsOverseas);
    // 탭이 변경되면 해당 탭의 첫 번째 종목 선택
    const newStocks = newIsOverseas ? OVERSEAS_STOCKS : DOMESTIC_STOCKS;
    if (newStocks.length > 0) {
      setSelectedStock(newStocks[0]);
    }
  };

  // 주문 성공 핸들러
  const handleOrderSuccess = () => {
    setOrderCompleted(prev => prev + 1);
  };

  // 주가 업데이트 핸들러
  const handlePriceUpdate = (price: number) => {
    setCurrentPrice(price);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">주식 거래</h1>
        
        <Tab.Group selectedIndex={activeTab} onChange={handleTabChange}>
          <Tab.List className="flex space-x-1 rounded-lg bg-gray-100 p-1 mb-6">
            <Tab
              className={({ selected }) =>
                `w-full py-2.5 text-sm font-medium rounded-md transition-colors ${selected ? 'bg-white shadow text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`
              }
            >
              국내주식
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full py-2.5 text-sm font-medium rounded-md transition-colors ${selected ? 'bg-white shadow text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`
              }
            >
              해외주식
            </Tab>
          </Tab.List>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 왼쪽 컬럼: 종목 정보 및 주문 폼 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 인기 종목 선택 */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-3">인기 종목</h3>
                <div className="flex flex-wrap gap-2">
                  {currentStocks.map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => setSelectedStock(stock)}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                        selectedStock.symbol === stock.symbol
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {stock.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 종목 상세 정보 */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">
                    {selectedStock.name} ({selectedStock.symbol})
                  </h3>
                  <StockQuote 
                    symbol={selectedStock.symbol}
                    isOverseas={isOverseas}
                    onPriceUpdate={handlePriceUpdate}
                  />
                </div>
              </div>

              {/* 주문 폼 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">주문하기</h2>
                <OrderForm 
                  symbol={selectedStock.symbol}
                  currentPrice={currentPrice}
                  onOrderSuccess={handleOrderSuccess}
                />
              </div>
            </div>

            {/* 오른쪽 컬럼: 포트폴리오 요약 */}
            <div className="space-y-6">
              <PortfolioSummary key={`portfolio-${orderCompleted}`} />
            </div>
          </div>
        </Tab.Group>
      </div>
    </MainLayout>
  );
};

export default TradingPage;
