import React, { useState, useEffect } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import io from 'socket.io-client';

// 종목 데이터 타입
interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

// 호가 데이터 타입
interface OrderBookData {
  sellOrders: Array<{ price: number; quantity: number }>;
  buyOrders: Array<{ price: number; quantity: number }>;
}

// 섹터 데이터 타입
interface SectorData {
  name: string;
  change: number;
}

const TradingPage: React.FC = () => {
  // 간단한 언어 설정 (나중에 컨텍스트로 교체 예정)
  const language = 'ko'; // 기본값을 한국어로 설정
  
  const [selectedStock, setSelectedStock] = useState<StockData>({
    symbol: 'AAPL',
    price: 150.25,
    change: 2.5,
    changePercent: 1.69,
    volume: 1234567
  });

  const [stockSearch, setStockSearch] = useState('');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [orderQuantity, setOrderQuantity] = useState(100);
  const [realTimeData, setRealTimeData] = useState<Record<string, StockData>>({});
  const [socket, setSocket] = useState<any>(null);

  // 인기 종목 목록
  const popularStocks: StockData[] = [
    { symbol: 'AAPL', price: 150.25, change: 2.5, changePercent: 1.69, volume: 1234567 },
    { symbol: 'TSLA', price: 245.80, change: -5.2, changePercent: -2.07, volume: 987654 },
    { symbol: 'MSFT', price: 320.15, change: 8.1, changePercent: 2.59, volume: 654321 },
    { symbol: 'GOOGL', price: 125.40, change: 1.8, changePercent: 1.46, volume: 456789 },
  ];

  // 섹터별 현황
  const sectors: SectorData[] = [
    { name: language === 'ko' ? '기술' : 'Technology', change: 1.2 },
    { name: language === 'ko' ? '금융' : 'Financial', change: -0.5 },
    { name: language === 'ko' ? '헬스케어' : 'Healthcare', change: 0.8 },
    { name: language === 'ko' ? '에너지' : 'Energy', change: -1.1 },
  ];

  // 내 포지션 (더미 데이터)
  const myPositions = [
    { symbol: 'AAPL', quantity: 50, value: 7512.50 },
    { symbol: 'TSLA', quantity: 25, value: 6145.00 },
    { symbol: 'MSFT', quantity: 20, value: 6403.00 },
  ];

  // 호가창 데이터 (더미)
  const orderBook: OrderBookData = {
    sellOrders: [
      { price: 150.30, quantity: 100 },
      { price: 150.28, quantity: 250 },
      { price: 150.26, quantity: 150 },
    ],
    buyOrders: [
      { price: 150.25, quantity: 200 },
      { price: 150.23, quantity: 180 },
      { price: 150.21, quantity: 300 },
    ]
  };

  // WebSocket 연결
  useEffect(() => {
    const newSocket = io('http://localhost:8000', {
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('실시간 거래 데이터 연결됨');
      // 인기 종목들 구독
      popularStocks.forEach(stock => {
        newSocket.emit('subscribe', stock.symbol);
      });
    });

    newSocket.on('connect_error', (error) => {
      console.log('WebSocket 연결 실패 (더미 데이터 사용):', error.message);
      // 연결 실패 시 더미 데이터로 초기화
      const dummyData: Record<string, StockData> = {};
      popularStocks.forEach(stock => {
        dummyData[stock.symbol] = stock;
      });
      setRealTimeData(dummyData);
    });

    newSocket.on('stock_data', (data: StockData) => {
      setRealTimeData(prev => ({
        ...prev,
        [data.symbol]: data
      }));

      // 현재 선택된 종목 업데이트
      if (data.symbol === selectedStock.symbol) {
        setSelectedStock(data);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // 종목 선택
  const handleStockSelect = (stock: StockData) => {
    setSelectedStock(stock);
    if (socket) {
      socket.emit('subscribe', stock.symbol);
    }
  };

  // 주문 실행
  const handleOrder = () => {
    const orderData = {
      symbol: selectedStock.symbol,
      type: orderType,
      quantity: orderQuantity,
      price: selectedStock.price
    };
    
    console.log('주문 실행:', orderData);
    // TODO: 실제 주문 API 호출
  };

  // 검색된 종목 필터링
  const filteredStocks = popularStocks.filter(stock =>
    stock.symbol.toLowerCase().includes(stockSearch.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* 페이지 헤더 */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            💹 {language === 'ko' ? '실시간 거래' : 'Real-time Trading'}
          </h1>
        </div>

        <div className="flex h-full">
          {/* 좌측 사이드바 */}
          <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 space-y-6">
            {/* 종목 검색 */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                🔍 {language === 'ko' ? '종목 검색' : 'Stock Search'}
              </h3>
              <input
                type="text"
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                placeholder={language === 'ko' ? '종목명 입력...' : 'Enter symbol...'}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* 인기 종목 */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                📈 {language === 'ko' ? '인기 종목' : 'Popular Stocks'}
              </h3>
              <div className="space-y-2">
                {filteredStocks.map((stock) => {
                  const currentData = realTimeData[stock.symbol] || stock;
                  return (
                    <div
                      key={stock.symbol}
                      onClick={() => handleStockSelect(currentData)}
                      className={`p-3 rounded cursor-pointer transition-colors ${
                        selectedStock.symbol === stock.symbol
                          ? 'bg-blue-600'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{stock.symbol}</span>
                        <span className={`text-lg font-semibold ${currentData.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${currentData.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300">
                        {currentData.change >= 0 ? '+' : ''}{currentData.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 섹터별 현황 */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                📊 {language === 'ko' ? '섹터별 현황' : 'Sector Status'}
              </h3>
              <div className="space-y-2">
                {sectors.map((sector) => (
                  <div key={sector.name} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                    <span className="text-sm">{sector.name}</span>
                    <span className={`text-sm font-semibold ${sector.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {sector.change >= 0 ? '+' : ''}{sector.change.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 내 포지션 */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                💼 {language === 'ko' ? '내 포지션' : 'My Positions'}
              </h3>
              <div className="space-y-2">
                {myPositions.map((position) => (
                  <div key={position.symbol} className="p-2 bg-gray-700 rounded">
                    <div className="flex justify-between">
                      <span className="font-semibold">{position.symbol}</span>
                      <span className="text-sm">{position.quantity}{language === 'ko' ? '주' : ' shares'}</span>
                    </div>
                    <div className="text-sm text-gray-300">
                      ${position.value.toLocaleString()}
                    </div>
                  </div>
                ))}
                <div className="mt-2 p-2 bg-blue-600 rounded text-center text-sm font-semibold">
                  {language === 'ko' ? '총 평가액' : 'Total Value'}: $20,060
                </div>
              </div>
            </div>
          </div>

          {/* 메인 컨텐츠 영역 */}
          <div className="flex-1 p-4">
            {/* 차트 영역 */}
            <div className="bg-gray-800 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold">{selectedStock.symbol}</h2>
                  <span className="text-2xl font-bold">${selectedStock.price.toFixed(2)}</span>
                  <span className={`text-lg font-semibold ${selectedStock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedStock.change >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-gray-600 rounded text-sm">5분</button>
                  <button className="px-3 py-1 bg-blue-600 rounded text-sm">1시간</button>
                  <button className="px-3 py-1 bg-gray-600 rounded text-sm">1일</button>
                </div>
              </div>
              
              {/* 차트 플레이스홀더 */}
              <div className="h-64 bg-gray-700 rounded flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="text-4xl mb-2">📈</div>
                  <div>{language === 'ko' ? '실시간 가격 차트' : 'Real-time Price Chart'}</div>
                  <div className="text-sm mt-1">
                    {language === 'ko' ? '차트 라이브러리 통합 예정' : 'Chart integration coming soon'}
                  </div>
                </div>
              </div>
            </div>

            {/* 하단 영역: 주문 패널 + 호가창 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 주문 패널 */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  💰 {language === 'ko' ? '주문 패널' : 'Order Panel'}
                </h3>
                
                <div className="space-y-4">
                  {/* 매수/매도 선택 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOrderType('buy')}
                      className={`flex-1 py-2 px-4 rounded font-semibold ${
                        orderType === 'buy' ? 'bg-green-600' : 'bg-gray-600'
                      }`}
                    >
                      {language === 'ko' ? '매수' : 'Buy'}
                    </button>
                    <button
                      onClick={() => setOrderType('sell')}
                      className={`flex-1 py-2 px-4 rounded font-semibold ${
                        orderType === 'sell' ? 'bg-red-600' : 'bg-gray-600'
                      }`}
                    >
                      {language === 'ko' ? '매도' : 'Sell'}
                    </button>
                  </div>

                  {/* 수량 입력 */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      📊 {language === 'ko' ? '수량' : 'Quantity'}
                    </label>
                    <input
                      type="number"
                      value={orderQuantity}
                      onChange={(e) => setOrderQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* 예상 금액 */}
                  <div className="p-3 bg-gray-700 rounded">
                    <div className="text-sm text-gray-300">
                      💵 {language === 'ko' ? '예상 금액' : 'Estimated Amount'}
                    </div>
                    <div className="text-lg font-semibold">
                      ${(selectedStock.price * orderQuantity).toLocaleString()}
                    </div>
                  </div>

                  {/* 주문 버튼 */}
                  <button
                    onClick={handleOrder}
                    className={`w-full py-3 px-4 rounded font-semibold text-white ${
                      orderType === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                    } transition-colors`}
                  >
                    {orderType === 'buy' 
                      ? (language === 'ko' ? '매수하기' : 'Place Buy Order')
                      : (language === 'ko' ? '매도하기' : 'Place Sell Order')
                    }
                  </button>
                </div>
              </div>

              {/* 호가창/체결 */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  📊 {language === 'ko' ? '호가창/체결' : 'Order Book'}
                </h3>
                
                <div className="space-y-2">
                  {/* 매도 호가 */}
                  <div className="text-sm text-gray-400 mb-2">
                    {language === 'ko' ? '매도호가' : 'Ask Orders'}
                  </div>
                  {orderBook.sellOrders.map((order, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-red-900/20 rounded">
                      <span className="text-red-400">${order.price.toFixed(2)}</span>
                      <span className="text-sm text-gray-300">{order.quantity}</span>
                    </div>
                  ))}

                  {/* 현재가 */}
                  <div className="my-3 p-2 bg-blue-600 rounded text-center">
                    <div className="text-sm">{language === 'ko' ? '현재가' : 'Current Price'}</div>
                    <div className="font-bold">${selectedStock.price.toFixed(2)}</div>
                  </div>

                  {/* 매수 호가 */}
                  <div className="text-sm text-gray-400 mb-2">
                    {language === 'ko' ? '매수호가' : 'Bid Orders'}
                  </div>
                  {orderBook.buyOrders.map((order, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-green-900/20 rounded">
                      <span className="text-green-400">${order.price.toFixed(2)}</span>
                      <span className="text-sm text-gray-300">{order.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TradingPage;
