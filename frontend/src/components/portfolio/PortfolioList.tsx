import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGetPortfolios, useCreatePortfolio } from '../../hooks/usePortfolioApi';
import type { Portfolio, PortfolioCreateData } from '../../types/portfolio';
import { Button, Input, Modal, Table, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Column } = Table;

const PortfolioList: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newPortfolio, setNewPortfolio] = useState<PortfolioCreateData>({
    name: '',
    description: '',
    initial_balance: 10000000, // 기본 1천만원
    risk_level: 'MEDIUM',
  });

  // 포트폴리오 목록 조회
  const { 
    execute: fetchPortfolios, 
    data: portfolios = [], 
    loading, 
    error 
  } = useGetPortfolios();

  // 포트폴리오 생성
  const { 
    execute: createPortfolio, 
    loading: creating, 
    error: createError 
  } = useCreatePortfolio();

  // 컴포넌트 마운트 시 포트폴리오 목록 조회
  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  // 에러 발생 시 알림 표시
  useEffect(() => {
    if (error) {
      message.error(`포트폴리오 목록을 불러오는 중 오류가 발생했습니다: ${error.message}`);
    }
    if (createError) {
      message.error(`포트폴리오 생성 중 오류가 발생했습니다: ${createError.message}`);
    }
  }, [error, createError]);

  // 새 포트폴리오 생성 핸들러
  const handleCreatePortfolio = async () => {
    try {
      await createPortfolio(newPortfolio);
      message.success('포트폴리오가 성공적으로 생성되었습니다.');
      setIsModalVisible(false);
      setNewPortfolio({
        name: '',
        description: '',
        initial_balance: 10000000,
        risk_level: 'MEDIUM',
      });
      // 포트폴리오 목록 새로고침
      fetchPortfolios();
    } catch (err) {
      console.error('포트폴리오 생성 실패:', err);
    }
  };

  // 숫자 포맷팅 (3자리마다 콤마)
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 리스크 레벨 한글 표시
  const getRiskLevelText = (level: string) => {
    const levels: Record<string, string> = {
      LOW: '안정',
      MEDIUM: '중립',
      HIGH: '공격',
    };
    return levels[level] || level;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">내 포트폴리오</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          새 포트폴리오
        </Button>
      </div>

      <Table 
        dataSource={portfolios} 
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      >
        <Column 
          title="포트폴리오명" 
          dataIndex="name" 
          key="name"
          render={(_: unknown, record: Portfolio) => (
            <Link to={`/portfolios/${record.id}`} className="text-blue-600 hover:underline">
              {record.name}
            </Link>
          )} 
        />
        <Column 
          title="초기 자본" 
          key="initial_balance" 
          render={(_: unknown, record: Portfolio) => (
            <span>₩{formatNumber(record.initial_balance)}</span>
          )} 
        />
        <Column 
          title="현재 가치" 
          key="current_value" 
          render={(_: unknown, record: Portfolio) => (
            <span>₩{formatNumber(record.total_value || 0)}</span>
          )} 
        />
        <Column 
          title="수익률" 
          key="return" 
          render={(_: unknown, record: Portfolio) => {
            const returnRate = ((record.total_value - record.initial_balance) / record.initial_balance) * 100;
            const isPositive = returnRate >= 0;
            return (
              <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                {isPositive ? '+' : ''}{returnRate.toFixed(2)}%
              </span>
            );
          }} 
        />
        <Column 
          title="리스크" 
          key="risk_level" 
          render={(_: unknown, record: Portfolio) => (
            <span>{getRiskLevelText(record.risk_level)}</span>
          )} 
        />
        <Column 
          title="생성일" 
          dataIndex="created_at" 
          key="created_at" 
          render={(date: string) => new Date(date).toLocaleDateString()} 
        />
        <Column
          title="액션"
          key="action"
          render={(_: unknown, record: Portfolio) => (
            <Space size="middle">
              <Link to={`/portfolios/${record.id}`}>상세보기</Link>
              <a>편집</a>
              <a className="text-red-500">삭제</a>
            </Space>
          )}
        />
      </Table>

      {/* 새 포트폴리오 생성 모달 */}
      <Modal
        title="새 포트폴리오 생성"
        open={isModalVisible}
        onOk={handleCreatePortfolio}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={creating}
        okText="생성"
        cancelText="취소"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">포트폴리오 이름</label>
            <Input
              value={newPortfolio.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setNewPortfolio({ ...newPortfolio, name: e.target.value })
              }
              placeholder="예) 나의 첫 번째 포트폴리오"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설명 (선택사항)</label>
            <Input.TextArea
              value={newPortfolio.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                setNewPortfolio({ ...newPortfolio, description: e.target.value })
              }
              rows={3}
              placeholder="포트폴리오에 대한 간단한 설명을 입력해주세요."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">초기 자본 (원)</label>
            <Input
              type="number"
              value={newPortfolio.initial_balance}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setNewPortfolio({ ...newPortfolio, initial_balance: Number(e.target.value) })
              }
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">리스크 프로필</label>
            <select
              className="w-full p-2 border rounded"
              value={newPortfolio.risk_level}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                setNewPortfolio({ ...newPortfolio, risk_level: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' })
              }
            >
              <option value="LOW">안정형 (저위험)</option>
              <option value="MEDIUM">중립형 (중위험)</option>
              <option value="HIGH">공격형 (고위험)</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PortfolioList;
