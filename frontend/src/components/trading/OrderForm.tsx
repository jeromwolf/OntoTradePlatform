import React, { useState, useEffect } from "react";
import { StockQuote } from "../../types/stock";
import kisApi, { OrderRequest } from "../../api/kisApi";

interface OrderFormProps {
  symbol: string;
  currentPrice: number;
  onOrderSuccess?: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({
  symbol,
  currentPrice,
  onOrderSuccess,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [price, setPrice] = useState<number>(currentPrice);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 현재가가 변경되면 주문 가격도 업데이트
  useEffect(() => {
    if (orderType === "market") {
      setPrice(currentPrice);
    }
  }, [currentPrice, orderType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (quantity <= 0) {
      setError("수량은 1 이상이어야 합니다.");
      return;
    }

    if (orderType === "limit" && price <= 0) {
      setError("가격은 0보다 커야 합니다.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const order: OrderRequest = {
        symbol,
        side,
        orderType,
        price: orderType === "market" ? currentPrice : price,
        quantity,
      };

      const result = await kisApi.placeOrder(order);

      setSuccess(`주문이 완료되었습니다. 주문번호: ${result.orderId}`);
      if (onOrderSuccess) {
        onOrderSuccess();
      }
    } catch (err) {
      console.error("주문 중 오류 발생:", err);
      setError("주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount =
    quantity * (orderType === "market" ? currentPrice : price);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">주문하기</h3>

      <div className="flex space-x-2">
        <button
          type="button"
          className={`px-4 py-2 rounded-md ${side === "buy" ? "bg-red-500 text-white" : "bg-gray-200"}`}
          onClick={() => setSide("buy")}
        >
          매수
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded-md ${side === "sell" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setSide("sell")}
        >
          매도
        </button>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          주문 유형
        </label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              checked={orderType === "limit"}
              onChange={() => setOrderType("limit")}
            />
            <span className="ml-2">지정가</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              checked={orderType === "market"}
              onChange={() => setOrderType("market")}
            />
            <span className="ml-2">시장가</span>
          </label>
        </div>
      </div>

      {orderType === "limit" && (
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700"
          >
            가격 (원)
          </label>
          <input
            type="number"
            id="price"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            min="0"
            step="1"
            disabled={isSubmitting}
          />
        </div>
      )}

      <div>
        <label
          htmlFor="quantity"
          className="block text-sm font-medium text-gray-700"
        >
          수량 (주)
        </label>
        <input
          type="number"
          id="quantity"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
          min="1"
          step="1"
          disabled={isSubmitting}
        />
      </div>

      <div className="p-3 bg-gray-50 rounded-md">
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-700">
            주문 가능 금액
          </span>
          <span className="font-medium">{currentPrice.toLocaleString()}원</span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-sm font-medium text-gray-700">주문 총액</span>
          <span className="font-bold">{totalAmount.toLocaleString()}원</span>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}

      <button
        type="submit"
        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          side === "buy"
            ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
            : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        } focus:outline-none focus:ring-2 focus:ring-offset-2`}
        disabled={isSubmitting}
      >
        {isSubmitting ? "처리 중..." : side === "buy" ? "매수하기" : "매도하기"}
      </button>
    </form>
  );
};

export default OrderForm;
