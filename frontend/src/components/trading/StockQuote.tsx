import React, { useState, useEffect } from 'react';
import type { StockQuote as StockQuoteType } from '../../types/stock';
import kisApi from '../../api/kisApi';

interface StockQuoteProps {
  symbol: string;
  isOverseas?: boolean;
  onPriceUpdate?: (price: number) => void;
}

const StockQuote: React.FC<StockQuoteProps> = ({ symbol, isOverseas = false, onPriceUpdate }) => {
  const [quote, setQuote] = useState<StockQuoteType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setLoading(true);
        const data = await kisApi.getStockQuote(symbol, isOverseas);
        setQuote(data);
        if (data.currentPrice && onPriceUpdate) {
          onPriceUpdate(data.currentPrice);
        }
        setError(null);
      } catch (err) {
        console.error('주식 시세 조회 중 오류 발생:', err);
        setError('주식 시세를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
    
    // 10초마다 시세 갱신
    const intervalId = setInterval(fetchQuote, 10000);
    
    return () => clearInterval(intervalId);
  }, [symbol, isOverseas]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!quote) return <div>데이터가 없습니다.</div>;

  const isPositive = quote.change >= 0;
  const changeClass = isPositive ? 'text-red-500' : 'text-blue-500';
  const changeIcon = isPositive ? '▲' : '▼';

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">
          {quote.name} ({quote.symbol})
        </h3>
        <span className={`text-2xl font-bold ${changeClass}`}>
          {quote.currentPrice.toLocaleString()}원
        </span>
      </div>
      <div className="flex justify-between text-sm text-gray-600">
        <span>
          전일대비 
          <span className={`ml-1 ${changeClass} font-medium`}>
            {changeIcon} {Math.abs(quote.change).toLocaleString()}원
            ({Math.abs(quote.changePercent).toFixed(2)}%)
          </span>
        </span>
        <span>거래량: {quote.volume.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default StockQuote;
