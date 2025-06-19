import React, { useEffect, useState } from 'react';
import { Table, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { tradingApi } from '../../api/tradingApi';
import type { OrderBookEntry } from '../../types/trading';

interface OrderBookProps {
  symbol: string;
}

interface OrderBookState {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastUpdate: Date | null;
  currentPrice: number | null;
}

const OrderBook: React.FC<OrderBookProps> = ({ symbol }) => {
  const [state, setState] = useState<OrderBookState>({
    bids: [],
    asks: [],
    lastUpdate: null,
    currentPrice: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 호가창 데이터 가져오기
  useEffect(() => {
    const fetchOrderBook = async () => {
      if (!symbol) return;
      
      try {
        const data = await tradingApi.getOrderBook(symbol);
        
        // 매수 호가(가격 내림차순)와 매도 호가(가격 오름차순)로 정렬
        const sortedBids = [...data.bids].sort((a, b) => b.price - a.price);
        const sortedAsks = [...data.asks].sort((a, b) => a.price - b.price);
        
        setState({
          bids: sortedBids,
          asks: sortedAsks,
          lastUpdate: new Date(),
          currentPrice: data.currentPrice,
        });
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order book';
        setError(errorMessage);
        console.error('Error fetching order book:', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderBook();
    const intervalId = setInterval(fetchOrderBook, 5000); // 5초마다 새로고침

    return () => clearInterval(intervalId);
  }, [symbol]);

  // 호가 테이블 컬럼 정의
  const columns: ColumnsType<OrderBookEntry> = [
    {
      title: '가격',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => {
        const isAsk = state.asks.some(ask => ask.price === price);
        const colorClass = isAsk ? 'text-red-500' : 'text-green-500';
        return (
          <span className={colorClass}>
            {price.toLocaleString()}
          </span>
        );
      },
    },
    {
      title: '수량',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number) => quantity.toLocaleString(),
    },
    {
      title: '총액',
      key: 'total',
      render: (_, record) => (record.price * record.quantity).toLocaleString(),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Spin size="small" />
        <span className="ml-2">호가창을 불러오는 중...</span>
      </div>
    );
  }

  if (state.asks.length === 0 && state.bids.length === 0) {
    return (
<div className="flex justify-center items-center p-4 text-gray-500">
        <span>호가 정보를 불러오는 중...</span>
        <div className="ml-2">
          <Spin size="small" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        호가 정보를 불러오는 중 오류가 발생했습니다: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-100 dark:bg-gray-800 p-2 border-b">
          <h3 className="font-medium">매도 호가</h3>
        </div>
        <div className="overflow-x-auto">
          <Table<OrderBookEntry>
            columns={columns}
            dataSource={state.asks}
            rowKey={(record) => `ask-${record.price}`}
            pagination={false}
            size="small"
            showHeader={false}
          />
        </div>
      </div>

      {state.currentPrice !== null && (
        <div className="text-center py-2 font-medium bg-gray-50 dark:bg-gray-800 rounded">
          현재가: {state.currentPrice.toLocaleString()}
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-100 dark:bg-gray-800 p-2 border-b">
          <h3 className="font-medium">매수 호가</h3>
        </div>
        <div className="overflow-x-auto">
          <Table<OrderBookEntry>
            columns={columns}
            dataSource={state.bids}
            rowKey={(record) => `bid-${record.price}`}
            pagination={false}
            size="small"
            showHeader={false}
          />
        </div>
      </div>

      {state.lastUpdate && (
        <div className="text-xs text-gray-500 text-right">
          마지막 업데이트: {state.lastUpdate.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default OrderBook;
