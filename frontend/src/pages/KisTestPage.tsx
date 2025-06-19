import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  Input,
  Select,
  Table,
  Tabs,
  Typography,
  message,
} from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface StockInfo {
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

const KisTestPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [stockData, setStockData] = useState<StockInfo[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockInfo | null>(null);
  const [activeTab, setActiveTab] = useState<string>("search");

  // 테스트용 더미 데이터
  const dummyStocks: StockInfo[] = [
    {
      code: "005930",
      name: "삼성전자",
      price: 72500,
      change: 1500,
      changePercent: 2.11,
      volume: 12450234,
    },
    {
      code: "035720",
      name: "카카오",
      price: 51200,
      change: -1200,
      changePercent: -2.29,
      volume: 5234123,
    },
    {
      code: "207940",
      name: "삼성바이오로직스",
      price: 856000,
      change: 12500,
      changePercent: 1.48,
      volume: 123456,
    },
  ];

  // 종목 검색 함수
  const handleSearch = () => {
    if (!searchText.trim()) {
      message.warning(t("검색어를 입력해주세요"));
      return;
    }

    setLoading(true);

    // TODO: 실제 KIS API 호출로 대체 예정
    setTimeout(() => {
      // 더미 데이터로 테스트
      setStockData(dummyStocks);
      setLoading(false);
    }, 500);
  };

  // 종목 선택 핸들러
  const handleSelectStock = (stock: StockInfo) => {
    setSelectedStock(stock);
    setActiveTab("detail");
  };

  // 테이블 컬럼 정의
  const columns = [
    {
      title: t("종목코드"),
      dataIndex: "code",
      key: "code",
      width: 120,
    },
    {
      title: t("종목명"),
      dataIndex: "name",
      key: "name",
      render: (text: string, record: StockInfo) => (
        <Button type="link" onClick={() => handleSelectStock(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: t("현재가"),
      dataIndex: "price",
      key: "price",
      render: (price: number) => <Text strong>{price.toLocaleString()}</Text>,
      align: "right",
    },
    {
      title: t("변동"),
      dataIndex: "change",
      key: "change",
      render: (change: number) => {
        const isPositive = change >= 0;
        return (
          <Text type={isPositive ? "success" : "danger"}>
            {isPositive ? "▲" : "▼"} {Math.abs(change).toLocaleString()}
          </Text>
        );
      },
      align: "right",
    },
    {
      title: t("등락률"),
      dataIndex: "changePercent",
      key: "changePercent",
      render: (percent: number) => {
        const isPositive = percent >= 0;
        return (
          <Text type={isPositive ? "success" : "danger"}>
            {isPositive ? "+" : ""}
            {percent.toFixed(2)}%
          </Text>
        );
      },
      align: "right",
    },
    {
      title: t("거래량"),
      dataIndex: "volume",
      key: "volume",
      render: (volume: number) => volume.toLocaleString(),
      align: "right",
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>KIS API 테스트 페이지</Title>

      <Card style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
          <Select
            showSearch
            style={{ width: 200 }}
            placeholder={t("시장 선택")}
            optionFilterProp="children"
            defaultValue="ALL"
          >
            <Option value="ALL">전체</Option>
            <Option value="KOSPI">코스피</Option>
            <Option value="KOSDAQ">코스닥</Option>
          </Select>
          <Input
            placeholder={t("종목명 또는 종목코드 검색")}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 300 }}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            loading={loading}
          >
            {t("검색")}
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearchText("");
              setStockData([]);
              setSelectedStock(null);
            }}
          >
            {t("초기화")}
          </Button>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={t("종목 검색")} key="search">
            <Table
              columns={columns}
              dataSource={stockData}
              rowKey="code"
              loading={loading}
              pagination={{ pageSize: 10 }}
              size="small"
              bordered
            />
          </TabPane>

          <TabPane
            tab={
              <>
                {selectedStock
                  ? `${selectedStock.name} (${selectedStock.code})`
                  : t("종목 상세")}
              </>
            }
            key="detail"
            disabled={!selectedStock}
          >
            {selectedStock ? (
              <div style={{ padding: "16px" }}>
                <Title level={4}>
                  {selectedStock.name} ({selectedStock.code})
                </Title>
                <p>현재가: {selectedStock.price.toLocaleString()}원</p>
                <p>
                  전일대비:
                  <Text type={selectedStock.change >= 0 ? "success" : "danger"}>
                    {selectedStock.change >= 0 ? "▲" : "▼"}
                    {Math.abs(selectedStock.change).toLocaleString()}원 (
                    {selectedStock.change >= 0 ? "+" : ""}
                    {selectedStock.changePercent.toFixed(2)}%)
                  </Text>
                </p>
                <p>거래량: {selectedStock.volume.toLocaleString()}주</p>

                <div style={{ marginTop: "24px" }}>
                  <Title level={5}>API 테스트</Title>
                  <div
                    style={{ display: "flex", gap: "8px", marginTop: "12px" }}
                  >
                    <Button type="primary">실시간 시세 조회</Button>
                    <Button>호가 조회</Button>
                    <Button>체결 내역 조회</Button>
                    <Button type="dashed">주문하기</Button>
                  </div>
                </div>
              </div>
            ) : (
              <p>{t("좌측에서 종목을 선택해주세요.")}</p>
            )}
          </TabPane>
        </Tabs>
      </Card>

      <Card title="API 호출 로그" style={{ marginTop: "16px" }}>
        <div
          style={{
            minHeight: "100px",
            fontFamily: "monospace",
            padding: "8px",
          }}
        >
          {loading ? "API 호출 중..." : "API 호출 로그가 여기에 표시됩니다."}
        </div>
      </Card>
    </div>
  );
};

export default KisTestPage;
