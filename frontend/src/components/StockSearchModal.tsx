import React, { useState, useEffect, useMemo } from 'react';
import { type StockData } from '../services/simulationApi';

interface StockSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockData: Record<string, StockData>;
  onSelectStock: (symbol: string) => void;
  selectedStock?: string;
  language: 'ko' | 'en';
}

const StockSearchModal: React.FC<StockSearchModalProps> = ({
  isOpen,
  onClose,
  stockData,
  onSelectStock,
  selectedStock,
  language
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'change' | 'volume'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterBy, setFilterBy] = useState<'all' | 'gainers' | 'losers' | 'active'>('all');

  const t = (ko: string, en: string) => (language === 'ko' ? ko : en);

  // 모달이 열릴 때 검색어 초기화
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  // 검색 및 필터링된 종목 목록
  const filteredStocks = useMemo(() => {
    let stocks = Object.entries(stockData);

    // 검색 필터
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      stocks = stocks.filter(([symbol, stock]) =>
        symbol.toLowerCase().includes(term) ||
        stock.name.toLowerCase().includes(term)
      );
    }

    // 카테고리 필터
    switch (filterBy) {
      case 'gainers':
        stocks = stocks.filter(([, stock]) => stock.change > 0);
        break;
      case 'losers':
        stocks = stocks.filter(([, stock]) => stock.change < 0);
        break;
      case 'active':
        stocks = stocks.filter(([, stock]) => stock.volume > 1000000); // 거래량 기준
        break;
    }

    // 정렬
    stocks.sort(([, stockA], [, stockB]) => {
      let valueA: number | string;
      let valueB: number | string;

      switch (sortBy) {
        case 'name':
          valueA = stockA.name;
          valueB = stockB.name;
          break;
        case 'price':
          valueA = stockA.price;
          valueB = stockB.price;
          break;
        case 'change':
          valueA = stockA.change_percent;
          valueB = stockB.change_percent;
          break;
        case 'volume':
          valueA = stockA.volume;
          valueB = stockB.volume;
          break;
        default:
          valueA = stockA.name;
          valueB = stockB.name;
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return sortOrder === 'asc' 
        ? (valueA as number) - (valueB as number)
        : (valueB as number) - (valueA as number);
    });

    return stocks;
  }, [stockData, searchTerm, sortBy, sortOrder, filterBy]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          background: '#0a0e27',
          borderRadius: '12px',
          padding: '24px',
          width: '100%',
          maxWidth: '800px',
          maxHeight: '80vh',
          border: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#60a5fa', fontSize: '20px' }}>
            🔍 {t('종목 검색', 'Stock Search')}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            ✕
          </button>
        </div>

        {/* 검색 및 필터 */}
        <div style={{ marginBottom: '20px' }}>
          {/* 검색창 */}
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder={t('종목명 또는 코드로 검색...', 'Search by name or symbol...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #1e293b',
                background: '#131629',
                color: '#e2e8f0',
                fontSize: '14px',
                outline: 'none',
              }}
              autoFocus
            />
          </div>

          {/* 필터 및 정렬 */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {/* 카테고리 필터 */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #1e293b',
                background: '#131629',
                color: '#e2e8f0',
                fontSize: '14px',
              }}
            >
              <option value="all">{t('전체', 'All')}</option>
              <option value="gainers">{t('상승주', 'Gainers')}</option>
              <option value="losers">{t('하락주', 'Losers')}</option>
              <option value="active">{t('거래량상위', 'Most Active')}</option>
            </select>

            {/* 정렬 기준 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #1e293b',
                background: '#131629',
                color: '#e2e8f0',
                fontSize: '14px',
              }}
            >
              <option value="name">{t('종목명', 'Name')}</option>
              <option value="price">{t('가격', 'Price')}</option>
              <option value="change">{t('등락률', 'Change %')}</option>
              <option value="volume">{t('거래량', 'Volume')}</option>
            </select>

            {/* 정렬 순서 */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #1e293b',
                background: '#131629',
                color: '#e2e8f0',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              {sortOrder === 'asc' ? '▲' : '▼'} {t('정렬', 'Sort')}
            </button>
          </div>
        </div>

        {/* 종목 목록 */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            border: '1px solid #1e293b',
            borderRadius: '8px',
          }}
        >
          {filteredStocks.length === 0 ? (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: '#94a3b8',
              }}
            >
              {t('검색 결과가 없습니다', 'No stocks found')}
            </div>
          ) : (
            <div>
              {/* 헤더 */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                  gap: '12px',
                  padding: '12px 16px',
                  background: '#131629',
                  borderBottom: '1px solid #1e293b',
                  fontSize: '12px',
                  color: '#94a3b8',
                  fontWeight: 'bold',
                }}
              >
                <div>{t('종목', 'Stock')}</div>
                <div style={{ textAlign: 'right' }}>{t('가격', 'Price')}</div>
                <div style={{ textAlign: 'right' }}>{t('등락', 'Change')}</div>
                <div style={{ textAlign: 'right' }}>{t('등락률', 'Change %')}</div>
                <div style={{ textAlign: 'right' }}>{t('거래량', 'Volume')}</div>
              </div>

              {/* 종목 리스트 */}
              {filteredStocks.map(([symbol, stock]) => (
                <div
                  key={symbol}
                  onClick={() => {
                    onSelectStock(symbol);
                    onClose();
                  }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                    gap: '12px',
                    padding: '12px 16px',
                    borderBottom: '1px solid #1e293b',
                    cursor: 'pointer',
                    background: selectedStock === symbol ? '#1e293b' : 'transparent',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedStock !== symbol) {
                      e.currentTarget.style.background = '#0f172a';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedStock !== symbol) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {/* 종목명 */}
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#e2e8f0', marginBottom: '2px' }}>
                      {stock.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {symbol}
                    </div>
                  </div>

                  {/* 가격 */}
                  <div style={{ textAlign: 'right', color: '#e2e8f0' }}>
                    {formatCurrency(stock.price)}
                  </div>

                  {/* 등락 */}
                  <div
                    style={{
                      textAlign: 'right',
                      color: stock.change >= 0 ? '#34d399' : '#ef4444',
                    }}
                  >
                    {stock.change >= 0 ? '+' : ''}{formatCurrency(stock.change)}
                  </div>

                  {/* 등락률 */}
                  <div
                    style={{
                      textAlign: 'right',
                      color: stock.change_percent >= 0 ? '#34d399' : '#ef4444',
                      fontWeight: 'bold',
                    }}
                  >
                    {formatPercent(stock.change_percent)}
                  </div>

                  {/* 거래량 */}
                  <div style={{ textAlign: 'right', color: '#94a3b8', fontSize: '12px' }}>
                    {formatVolume(stock.volume)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 정보 */}
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            background: '#131629',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#94a3b8',
            textAlign: 'center',
          }}
        >
          {t(
            `총 ${filteredStocks.length}개 종목 표시 중`,
            `Showing ${filteredStocks.length} stocks`
          )}
        </div>
      </div>
    </div>
  );
};

export default StockSearchModal;
