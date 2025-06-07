import type { Meta, StoryObj } from "@storybook/react";
import { Table } from "../components/ui/Table";
import { Button } from "../components/ui/Button";

/**
 * 온톨로지 거래 플랫폼의 테이블 컴포넌트입니다.
 * 데이터를 구조화된 형태로 표시합니다.
 */
const meta: Meta<typeof Table> = {
  title: "UI Components/Table",
  component: Table,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
테이블 컴포넌트는 구조화된 데이터를 행과 열로 표시하는 데 사용됩니다.

## 주요 특징
- 정렬 기능 지원
- 커스텀 셀 렌더링
- 로딩 상태
- 빈 데이터 메시지
- 행 클릭 이벤트
- 반응형 디자인
- TypeScript 제네릭 타입 지원
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    loading: {
      control: "boolean",
      description: "로딩 상태",
    },
    sortable: {
      control: "boolean",
      description: "정렬 기능 활성화",
    },
    emptyMessage: {
      control: "text",
      description: "데이터가 없을 때 표시할 메시지",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 샘플 데이터
const stockData = [
  {
    symbol: "AAPL",
    name: "애플",
    price: 150.25,
    change: 2.3,
    changePercent: 1.55,
  },
  {
    symbol: "TSLA",
    name: "테슬라",
    price: 245.8,
    change: -5.2,
    changePercent: -2.08,
  },
  {
    symbol: "MSFT",
    name: "마이크로소프트",
    price: 320.15,
    change: -1.6,
    changePercent: -0.5,
  },
  {
    symbol: "GOOGL",
    name: "구글",
    price: 125.4,
    change: 4.2,
    changePercent: 3.46,
  },
  {
    symbol: "NVDA",
    name: "엔비디아",
    price: 489.5,
    change: 12.3,
    changePercent: 2.58,
  },
];

const stockColumns = [
  {
    key: "symbol" as keyof (typeof stockData)[0],
    header: "종목코드",
    sortable: true,
  },
  {
    key: "name" as keyof (typeof stockData)[0],
    header: "종목명",
    sortable: true,
  },
  {
    key: "price" as keyof (typeof stockData)[0],
    header: "현재가",
    sortable: true,
    render: (value: any) => `$${value.toFixed(2)}`,
  },
  {
    key: "change" as keyof (typeof stockData)[0],
    header: "변동",
    sortable: true,
    render: (value: any) => (
      <span className={value >= 0 ? "text-green-600" : "text-red-600"}>
        {value >= 0 ? "+" : ""}${value.toFixed(2)}
      </span>
    ),
  },
  {
    key: "changePercent" as keyof (typeof stockData)[0],
    header: "변동률",
    sortable: true,
    render: (value: any) => (
      <span className={value >= 0 ? "text-green-600" : "text-red-600"}>
        {value >= 0 ? "+" : ""}
        {value.toFixed(2)}%
      </span>
    ),
  },
];

const userRankingData = [
  { rank: 1, username: "투자달인", profit: 34.5, trades: 127, winRate: 85.2 },
  { rank: 2, username: "수익왕", profit: 28.3, trades: 89, winRate: 78.4 },
  { rank: 3, username: "안정투자", profit: 22.1, trades: 156, winRate: 82.1 },
  { rank: 4, username: "빠른손", profit: 19.8, trades: 203, winRate: 65.5 },
  { rank: 5, username: "신중파", profit: 17.2, trades: 67, winRate: 91.0 },
];

const rankingColumns = [
  {
    key: "rank" as keyof (typeof userRankingData)[0],
    header: "순위",
    render: (value: any) => (
      <div className="flex items-center justify-center">
        {value === 1 && "🥇"}
        {value === 2 && "🥈"}
        {value === 3 && "🥉"}
        {value > 3 && `#${value}`}
      </div>
    ),
  },
  {
    key: "username" as keyof (typeof userRankingData)[0],
    header: "사용자명",
    sortable: true,
  },
  {
    key: "profit" as keyof (typeof userRankingData)[0],
    header: "수익률",
    sortable: true,
    render: (value: any) => (
      <span className="text-green-600 font-semibold">+{value.toFixed(1)}%</span>
    ),
  },
  {
    key: "trades" as keyof (typeof userRankingData)[0],
    header: "거래횟수",
    sortable: true,
    render: (value: any) => `${value}회`,
  },
  {
    key: "winRate" as keyof (typeof userRankingData)[0],
    header: "승률",
    sortable: true,
    render: (value: any) => `${value.toFixed(1)}%`,
  },
];

/**
 * 기본 테이블입니다.
 */
export const Default: Story = {
  args: {
    data: stockData,
    columns: stockColumns,
    sortable: true,
  },
};

/**
 * 로딩 상태의 테이블입니다.
 */
export const Loading: Story = {
  args: {
    data: [],
    columns: stockColumns,
    loading: true,
  },
};

/**
 * 빈 데이터 테이블입니다.
 */
export const Empty: Story = {
  args: {
    data: [],
    columns: stockColumns,
    emptyMessage: "등록된 종목이 없습니다.",
  },
};

/**
 * 정렬 기능이 없는 테이블입니다.
 */
export const NoSorting: Story = {
  args: {
    data: stockData,
    columns: stockColumns.map((col) => ({ ...col, sortable: false })),
    sortable: false,
  },
};

/**
 * 행 클릭 이벤트가 있는 테이블입니다.
 */
export const WithRowClick: Story = {
  args: {
    data: stockData,
    columns: stockColumns,
    sortable: true,
    onRowClick: (row: any) => alert(`${row.name} (${row.symbol}) 선택됨`),
  },
};

/**
 * 사용자 랭킹 테이블입니다.
 */
export const UserRanking: Story = {
  args: {
    data: userRankingData,
    columns: rankingColumns,
    sortable: true,
    onRowClick: (user: any) => alert(`${user.username} 프로필 보기`),
  },
};

/**
 * 액션 버튼이 있는 테이블입니다.
 */
export const WithActions: Story = {
  render: () => {
    const actionsData = stockData.map((stock) => ({
      ...stock,
      actions: stock,
    }));

    const actionsColumns = [
      ...stockColumns,
      {
        key: "actions" as keyof (typeof actionsData)[0],
        header: "액션",
        render: (value: any, row: any) => (
          <div className="flex gap-1">
            <Button size="sm" variant="outline">
              매수
            </Button>
            <Button size="sm" variant="secondary">
              매도
            </Button>
            <Button size="sm" variant="ghost">
              관심종목
            </Button>
          </div>
        ),
      },
    ];

    return (
      <Table
        data={actionsData}
        columns={actionsColumns}
        sortable={true}
        className="min-w-full"
      />
    );
  },
};

/**
 * 컴팩트한 크기의 테이블입니다.
 */
export const Compact: Story = {
  render: () => {
    const compactColumns = stockColumns.map((col) => ({
      ...col,
      width: col.key === "name" ? "200px" : "100px",
    }));

    return (
      <Table
        data={stockData.slice(0, 3)}
        columns={compactColumns}
        sortable={true}
        className="text-sm"
      />
    );
  },
};

/**
 * 큰 데이터셋 테이블입니다.
 */
export const LargeDataset: Story = {
  render: () => {
    // 큰 데이터셋 생성
    const largeData = Array.from({ length: 50 }, (_, i) => ({
      symbol: `STOCK${i + 1}`,
      name: `회사 ${i + 1}`,
      price: Math.random() * 500 + 50,
      change: (Math.random() - 0.5) * 20,
      changePercent: (Math.random() - 0.5) * 10,
    }));

    return (
      <div className="max-h-96 overflow-auto">
        <Table data={largeData} columns={stockColumns} sortable={true} />
      </div>
    );
  },
};

/**
 * 다양한 데이터 타입을 보여주는 테이블입니다.
 */
export const MixedDataTypes: Story = {
  render: () => {
    const mixedData = [
      {
        id: 1,
        status: "active",
        date: new Date("2024-01-15"),
        verified: true,
        score: 95.5,
        tags: ["premium", "verified"],
      },
      {
        id: 2,
        status: "pending",
        date: new Date("2024-01-14"),
        verified: false,
        score: 78.2,
        tags: ["new"],
      },
      {
        id: 3,
        status: "inactive",
        date: new Date("2024-01-13"),
        verified: true,
        score: 86.7,
        tags: ["premium"],
      },
    ];

    const mixedColumns = [
      {
        key: "id" as keyof (typeof mixedData)[0],
        header: "ID",
        sortable: true,
      },
      {
        key: "status" as keyof (typeof mixedData)[0],
        header: "상태",
        render: (value: any) => (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              value === "active"
                ? "bg-green-100 text-green-800"
                : value === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {value === "active"
              ? "활성"
              : value === "pending"
                ? "대기"
                : "비활성"}
          </span>
        ),
      },
      {
        key: "date" as keyof (typeof mixedData)[0],
        header: "날짜",
        sortable: true,
        render: (value: any) => (value as Date).toLocaleDateString("ko-KR"),
      },
      {
        key: "verified" as keyof (typeof mixedData)[0],
        header: "인증",
        render: (value: any) => (value ? "✅" : "❌"),
      },
      {
        key: "score" as keyof (typeof mixedData)[0],
        header: "점수",
        sortable: true,
        render: (value: any) => `${value.toFixed(1)}점`,
      },
      {
        key: "tags" as keyof (typeof mixedData)[0],
        header: "태그",
        render: (value: any) => (
          <div className="flex gap-1">
            {(value as string[]).map((tag) => (
              <span
                key={tag}
                className="px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        ),
      },
    ];

    return <Table data={mixedData} columns={mixedColumns} sortable={true} />;
  },
};
