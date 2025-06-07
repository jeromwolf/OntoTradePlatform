import React from "react";
import { cn } from "@/utils/cn";

// 종목 리스트 아이템 (와이어프레임의 종목 검색 영역)
interface StockItemProps {
  symbol: string;
  price: string;
  change: string;
  emoji?: string;
  onClick?: () => void;
  className?: string;
}

export const StockItem: React.FC<StockItemProps> = ({
  symbol,
  price,
  change,
  emoji = "📈",
  onClick,
  className,
}) => {
  const isPositive = change.startsWith("+");

  return (
    <div
      className={cn(
        "flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors",
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{emoji}</span>
        <span className="font-medium">{symbol}</span>
      </div>
      <div className="text-right">
        <div className="font-semibold">{price}</div>
        <div
          className={cn(
            "text-sm",
            isPositive ? "text-green-600" : "text-red-600",
          )}
        >
          {change}
        </div>
      </div>
    </div>
  );
};

// 호가창 (매수/매도 호가)
interface OrderBookItemProps {
  price: string;
  volume?: number;
  type: "bid" | "ask";
}

export const OrderBookItem: React.FC<OrderBookItemProps> = ({
  price,
  volume,
  type,
}) => {
  return (
    <div
      className={cn(
        "flex justify-between items-center py-1 px-2 text-sm",
        type === "ask" ? "text-red-600 bg-red-50" : "text-blue-600 bg-blue-50",
      )}
    >
      <span className="font-mono">{price}</span>
      {volume && <span className="text-gray-500">{volume}</span>}
    </div>
  );
};

export const OrderBook: React.FC = () => {
  const askData = [
    { price: "$150.30", volume: 100 },
    { price: "$150.28", volume: 250 },
    { price: "$150.26", volume: 150 },
  ];

  const bidData = [
    { price: "$150.25", volume: 200 },
    { price: "$150.23", volume: 300 },
    { price: "$150.21", volume: 180 },
  ];

  return (
    <div className="bg-white rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        📊 호가창/체결
      </h3>

      <div className="space-y-1">
        <div className="text-xs text-gray-500 flex justify-between px-2">
          <span>매도호가</span>
          <span>잔량</span>
        </div>

        {askData.map((ask, index) => (
          <OrderBookItem
            key={`ask-${index}`}
            price={ask.price}
            volume={ask.volume}
            type="ask"
          />
        ))}

        <div className="border-t border-gray-200 my-2"></div>

        {bidData.map((bid, index) => (
          <OrderBookItem
            key={`bid-${index}`}
            price={bid.price}
            volume={bid.volume}
            type="bid"
          />
        ))}

        <div className="text-xs text-gray-500 flex justify-between px-2">
          <span>매수호가</span>
          <span>잔량</span>
        </div>
      </div>
    </div>
  );
};

// 거래 패널 (매수/매도)
interface TradingPanelProps {
  symbol?: string;
  currentPrice?: string;
}

export const TradingPanel: React.FC<TradingPanelProps> = ({
  symbol: _symbol = "AAPL",
  currentPrice: _currentPrice = "$150.25",
}) => {
  return (
    <div className="bg-white rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        💰 주문 패널
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            📊 수량
          </label>
          <input
            type="number"
            defaultValue="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            💵 예상 금액
          </label>
          <div className="text-lg font-semibold text-gray-900">$15,025.00</div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
            매도하기
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
            매수하기
          </button>
        </div>
      </div>
    </div>
  );
};

// 포지션 카드 (내 포지션)
interface PositionCardProps {
  symbol: string;
  shares: number;
  currentValue: string;
  change: string;
  emoji?: string;
}

export const PositionCard: React.FC<PositionCardProps> = ({
  symbol,
  shares,
  currentValue,
  change,
  emoji = "📈",
}) => {
  const isPositive = change.startsWith("+");

  return (
    <div className="bg-white rounded-lg p-4 border hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{emoji}</span>
          <span className="font-semibold">{symbol}</span>
        </div>
        <span className="text-sm text-gray-500">{shares}주</span>
      </div>

      <div className="text-right">
        <div className="text-lg font-semibold">{currentValue}</div>
        <div
          className={cn(
            "text-sm",
            isPositive ? "text-green-600" : "text-red-600",
          )}
        >
          {change}
        </div>
      </div>
    </div>
  );
};
