import type { Meta, StoryObj } from "@storybook/react";
import { List, ListItem, DataList, SimpleList } from "../components/ui/List";
import { Button } from "../components/ui/Button";

/**
 * 온톨로지 거래 플랫폼의 리스트 컴포넌트입니다.
 * 항목들을 목록 형태로 표시합니다.
 */
const meta: Meta<typeof List> = {
  title: "UI Components/List",
  component: List,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
리스트 컴포넌트는 항목들을 구조화된 목록으로 표시하는 데 사용됩니다.

## 포함된 컴포넌트
- **List**: 기본 리스트 컨테이너
- **ListItem**: 개별 리스트 항목
- **DataList**: 키-값 쌍 데이터 리스트
- **SimpleList**: 간단한 텍스트 리스트

## 주요 특징
- 다양한 리스트 스타일
- 클릭 가능한 항목
- 커스텀 콘텐츠
- 반응형 디자인
- 접근성 지원
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    divided: {
      control: "boolean",
      description: "항목 간 구분선 표시",
    },
    clickable: {
      control: "boolean",
      description: "클릭 가능한 항목",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 리스트입니다.
 */
export const Default: Story = {
  render: () => (
    <List>
      <ListItem>첫 번째 항목</ListItem>
      <ListItem>두 번째 항목</ListItem>
      <ListItem>세 번째 항목</ListItem>
    </List>
  ),
};

/**
 * 구분선이 있는 리스트입니다.
 */
export const Divided: Story = {
  render: () => (
    <List divided>
      <ListItem>구분선이 있는 첫 번째 항목</ListItem>
      <ListItem>구분선이 있는 두 번째 항목</ListItem>
      <ListItem>구분선이 있는 세 번째 항목</ListItem>
    </List>
  ),
};

/**
 * 클릭 가능한 리스트입니다.
 */
export const Clickable: Story = {
  render: () => (
    <List divided clickable>
      <ListItem onClick={() => alert("첫 번째 항목 클릭됨")}>
        클릭 가능한 첫 번째 항목
      </ListItem>
      <ListItem onClick={() => alert("두 번째 항목 클릭됨")}>
        클릭 가능한 두 번째 항목
      </ListItem>
      <ListItem onClick={() => alert("세 번째 항목 클릭됨")}>
        클릭 가능한 세 번째 항목
      </ListItem>
    </List>
  ),
};

/**
 * 복잡한 콘텐츠가 있는 리스트입니다.
 */
export const ComplexContent: Story = {
  render: () => (
    <List divided className="max-w-md">
      <ListItem>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              A
            </div>
            <div>
              <div className="font-medium">Apple Inc.</div>
              <div className="text-sm text-gray-500">AAPL</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold">$150.25</div>
            <div className="text-sm text-green-600">+2.30 (1.55%)</div>
          </div>
        </div>
      </ListItem>

      <ListItem>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-semibold">
              T
            </div>
            <div>
              <div className="font-medium">Tesla Inc.</div>
              <div className="text-sm text-gray-500">TSLA</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold">$245.80</div>
            <div className="text-sm text-red-600">-5.20 (-2.08%)</div>
          </div>
        </div>
      </ListItem>

      <ListItem>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
              M
            </div>
            <div>
              <div className="font-medium">Microsoft Corp.</div>
              <div className="text-sm text-gray-500">MSFT</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold">$320.15</div>
            <div className="text-sm text-red-600">-1.60 (-0.50%)</div>
          </div>
        </div>
      </ListItem>
    </List>
  ),
};

/**
 * 액션 버튼이 있는 리스트입니다.
 */
export const WithActions: Story = {
  render: () => (
    <List divided className="max-w-lg">
      <ListItem>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">삼성전자</div>
            <div className="text-sm text-gray-500">005930 • 10주 보유</div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              매도
            </Button>
            <Button size="sm">추가매수</Button>
          </div>
        </div>
      </ListItem>

      <ListItem>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">카카오</div>
            <div className="text-sm text-gray-500">035720 • 5주 보유</div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              매도
            </Button>
            <Button size="sm">추가매수</Button>
          </div>
        </div>
      </ListItem>

      <ListItem>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">네이버</div>
            <div className="text-sm text-gray-500">035420 • 3주 보유</div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              매도
            </Button>
            <Button size="sm">추가매수</Button>
          </div>
        </div>
      </ListItem>
    </List>
  ),
};

/**
 * 단순 텍스트 리스트입니다.
 */
export const SimpleTextList: Story = {
  render: () => {
    const items = [
      "포트폴리오 분석",
      "실시간 시장 데이터",
      "자동 거래 시스템",
      "리스크 관리",
      "수익률 추적",
      "세금 최적화",
    ];

    return <SimpleList items={items} />;
  },
};

/**
 * 키-값 데이터 리스트입니다.
 */
export const DataKeyValue: Story = {
  render: () => {
    const data = [
      { key: "총 자산", value: "$125,430.50" },
      { key: "오늘 수익", value: "+$2,340.25" },
      { key: "수익률", value: "+1.85%" },
      { key: "보유 종목", value: "12개" },
      { key: "현금 비중", value: "15.3%" },
      { key: "위험도", value: "중간" },
    ];

    return (
      <DataList
        data={data}
        renderItem={(item) => (
          <div className="flex justify-between py-2">
            <span className="text-gray-600">{item.key}</span>
            <span className="font-medium">{item.value}</span>
          </div>
        )}
        keyExtractor={(item, index) => `${item.key}-${index}`}
      />
    );
  },
};

/**
 * 뉴스 리스트입니다.
 */
export const NewsList: Story = {
  render: () => (
    <List divided className="max-w-2xl">
      <ListItem clickable onClick={() => alert("뉴스 클릭됨")}>
        <div className="space-y-2">
          <div className="font-medium">
            온톨로지 기반 거래 시스템, 새로운 투자 패러다임 제시
          </div>
          <div className="text-sm text-gray-600">
            인공지능과 온톨로지 기술을 결합한 혁신적인 거래 플랫폼이 투자자들의
            관심을 끌고 있다...
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>머니투데이</span>
            <span>2시간 전</span>
          </div>
        </div>
      </ListItem>

      <ListItem clickable onClick={() => alert("뉴스 클릭됨")}>
        <div className="space-y-2">
          <div className="font-medium">
            AI 기반 포트폴리오 최적화, 수익률 20% 향상 효과
          </div>
          <div className="text-sm text-gray-600">
            머신러닝 알고리즘을 활용한 포트폴리오 자동 조정 기능이 주목받고
            있다...
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>이코노미스트</span>
            <span>4시간 전</span>
          </div>
        </div>
      </ListItem>

      <ListItem clickable onClick={() => alert("뉴스 클릭됨")}>
        <div className="space-y-2">
          <div className="font-medium">
            개인투자자를 위한 AI 거래 도구, 접근성 크게 향상
          </div>
          <div className="text-sm text-gray-600">
            복잡한 금융 분석을 자동화하여 일반인도 쉽게 투자할 수 있는 환경이
            조성되고 있다...
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>한국경제</span>
            <span>6시간 전</span>
          </div>
        </div>
      </ListItem>
    </List>
  ),
};

/**
 * 랭킹 리스트입니다.
 */
export const RankingList: Story = {
  render: () => (
    <List divided className="max-w-md">
      <ListItem>
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🥇</div>
          <div className="flex-1">
            <div className="font-medium">투자달인</div>
            <div className="text-sm text-gray-500">수익률: +34.5%</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-green-600">1위</div>
            <div className="text-xs text-gray-500">127회 거래</div>
          </div>
        </div>
      </ListItem>

      <ListItem>
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🥈</div>
          <div className="flex-1">
            <div className="font-medium">수익왕</div>
            <div className="text-sm text-gray-500">수익률: +28.3%</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-600">2위</div>
            <div className="text-xs text-gray-500">89회 거래</div>
          </div>
        </div>
      </ListItem>

      <ListItem>
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🥉</div>
          <div className="flex-1">
            <div className="font-medium">안정투자</div>
            <div className="text-sm text-gray-500">수익률: +22.1%</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-amber-600">3위</div>
            <div className="text-xs text-gray-500">156회 거래</div>
          </div>
        </div>
      </ListItem>

      <ListItem>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold">
            4
          </div>
          <div className="flex-1">
            <div className="font-medium">빠른손</div>
            <div className="text-sm text-gray-500">수익률: +19.8%</div>
          </div>
          <div className="text-right">
            <div className="font-semibold">4위</div>
            <div className="text-xs text-gray-500">203회 거래</div>
          </div>
        </div>
      </ListItem>
    </List>
  ),
};

/**
 * 알림 리스트입니다.
 */
export const NotificationList: Story = {
  render: () => (
    <List divided className="max-w-lg">
      <ListItem clickable>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
          <div className="flex-1">
            <div className="font-medium">매수 주문 체결</div>
            <div className="text-sm text-gray-600">
              삼성전자 10주가 67,500원에 체결되었습니다.
            </div>
            <div className="text-xs text-gray-500 mt-1">5분 전</div>
          </div>
        </div>
      </ListItem>

      <ListItem clickable>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
          <div className="flex-1">
            <div className="font-medium">목표가 도달</div>
            <div className="text-sm text-gray-600">
              카카오 주식이 설정한 목표가 65,000원에 도달했습니다.
            </div>
            <div className="text-xs text-gray-500 mt-1">1시간 전</div>
          </div>
        </div>
      </ListItem>

      <ListItem clickable>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-gray-300 rounded-full mt-2 flex-shrink-0"></div>
          <div className="flex-1">
            <div className="font-medium text-gray-600">시장 분석 리포트</div>
            <div className="text-sm text-gray-500">
              새로운 주간 시장 분석 리포트가 업로드되었습니다.
            </div>
            <div className="text-xs text-gray-500 mt-1">3시간 전</div>
          </div>
        </div>
      </ListItem>
    </List>
  ),
};
