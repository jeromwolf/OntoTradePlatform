import React, { useState, useEffect } from 'react';
import { PortfolioItem } from '../../api/kisApi';
import kisApi from '../../api/kisApi';

const PortfolioSummary: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const data = await kisApi.getPortfolio();
        setPortfolio(data);
        setError(null);
      } catch (err) {
        console.error('포트폴리오 조회 중 오류 발생:', err);
        setError('포트폴리오를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
    
    // 30초마다 포트폴리오 갱신
    const intervalId = setInterval(fetchPortfolio, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (loading) return <div>포트폴리오를 불러오는 중...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (portfolio.length === 0) return <div>보유 종목이 없습니다.</div>;

  // 총 평가금액 계산
  const totalValue = portfolio.reduce((sum, item) => sum + (item.quantity * item.currentPrice), 0);
  const totalProfitLoss = portfolio.reduce((sum, item) => sum + item.profitLoss, 0);
  const totalProfitLossRate = portfolio.length > 0 
    ? (totalProfitLoss / (totalValue - totalProfitLoss)) * 100 
    : 0;

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">포트폴리오 요약</h3>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-2xl font-bold">{totalValue.toLocaleString()}원</div>
            <div className={`text-sm ${totalProfitLoss >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
              {totalProfitLoss >= 0 ? '+' : ''}{totalProfitLoss.toLocaleString()}원 
              ({totalProfitLoss >= 0 ? '+' : ''}{totalProfitLossRate.toFixed(2)}%)
            </div>
          </div>
          <div className="text-sm text-gray-500">
            총 {portfolio.length}개 종목 보유 중
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-gray-700">보유 종목</h4>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">종목명</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">보유수량</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">평균단가</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">현재가</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">평가손익</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {portfolio.map((item) => (
                <tr key={item.symbol} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.symbol}</div>
                  </td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    {item.quantity.toLocaleString()}주
                  </td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    {item.averagePrice.toLocaleString()}원
                  </td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    {item.currentPrice.toLocaleString()}원
                  </td>
                  <td className={`px-4 py-2 text-right whitespace-nowrap ${
                    item.profitLoss >= 0 ? 'text-red-500' : 'text-blue-500'
                  }`}>
                    {item.profitLoss >= 0 ? '+' : ''}{item.profitLoss.toLocaleString()}원
                    <div className="text-xs">
                      ({item.profitLoss >= 0 ? '+' : ''}{item.profitLossRate.toFixed(2)}%)
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;
