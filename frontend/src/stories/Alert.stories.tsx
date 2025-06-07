import type { Meta, StoryObj } from "@storybook/react";
import {
  Alert,
  SuccessAlert,
  ErrorAlert,
  WarningAlert,
  InfoAlert,
  AlertActions,
  AlertAction,
} from "../components/ui/Alert";
import { useState } from "react";

/**
 * 온톨로지 거래 플랫폼의 알림 컴포넌트입니다.
 * 중요한 정보나 상태를 사용자에게 지속적으로 표시합니다.
 */
const meta: Meta<typeof Alert> = {
  title: "UI Components/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
알림 컴포넌트는 사용자에게 중요한 정보, 경고, 성공 메시지 등을 표시하는 데 사용됩니다.

## 주요 특징
- 4가지 variant (success, error, warning, info)
- 커스텀 아이콘 지원
- 닫기 기능 (dismissible)
- 액션 버튼 지원
- 제목과 설명 분리
- 반응형 디자인
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["success", "error", "warning", "info"],
      description: "알림 타입",
    },
    title: {
      control: "text",
      description: "알림 제목",
    },
    dismissible: {
      control: "boolean",
      description: "닫기 버튼 표시",
    },
    icon: {
      control: "text",
      description: "커스텀 아이콘 (이모지)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 정보 알림입니다.
 */
export const Default: Story = {
  args: {
    variant: "info",
    title: "정보 알림",
    children: "이것은 기본 정보 알림 메시지입니다.",
  },
};

/**
 * 성공 알림입니다.
 */
export const Success: Story = {
  render: () => (
    <SuccessAlert title="거래 성공" dismissible>
      AAPL 10주 매수 주문이 성공적으로 체결되었습니다.
    </SuccessAlert>
  ),
};

/**
 * 오류 알림입니다.
 */
export const Error: Story = {
  render: () => (
    <ErrorAlert title="거래 실패" dismissible>
      잔고가 부족하여 주문을 처리할 수 없습니다. 계좌 잔고를 확인해 주세요.
    </ErrorAlert>
  ),
};

/**
 * 경고 알림입니다.
 */
export const Warning: Story = {
  render: () => (
    <WarningAlert title="위험 경고" dismissible>
      이 종목은 최근 높은 변동성을 보이고 있습니다. 신중하게 투자하시기
      바랍니다.
    </WarningAlert>
  ),
};

/**
 * 정보 알림입니다.
 */
export const Info: Story = {
  render: () => (
    <InfoAlert title="시장 정보" dismissible>
      미국 주식 시장이 30분 후에 개장됩니다.
    </InfoAlert>
  ),
};

/**
 * 커스텀 아이콘이 있는 알림입니다.
 */
export const CustomIcon: Story = {
  args: {
    variant: "success",
    title: "포트폴리오 성과",
    icon: "📈",
    children: "이번 달 포트폴리오 수익률이 15% 증가했습니다!",
  },
};

/**
 * 제목 없는 알림입니다.
 */
export const NoTitle: Story = {
  args: {
    variant: "info",
    children: "자동 저장이 활성화되었습니다.",
    dismissible: true,
  },
};

/**
 * 액션 버튼이 있는 알림입니다.
 */
export const WithActions: Story = {
  render: () => {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) {
      return (
        <div className="p-4 text-center">
          <p>알림이 닫혔습니다.</p>
          <button
            onClick={() => setDismissed(false)}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            다시 보기
          </button>
        </div>
      );
    }

    return (
      <WarningAlert
        title="계좌 인증 필요"
        dismissible
        onDismiss={() => setDismissed(true)}
      >
        <div className="space-y-3">
          <p>투자 한도를 늘리려면 추가 계좌 인증이 필요합니다.</p>
          <AlertActions>
            <AlertAction variant="primary">지금 인증하기</AlertAction>
            <AlertAction variant="secondary">나중에 하기</AlertAction>
          </AlertActions>
        </div>
      </WarningAlert>
    );
  },
};

/**
 * 긴 내용의 알림입니다.
 */
export const LongContent: Story = {
  render: () => (
    <InfoAlert title="이용 약관 업데이트" dismissible>
      <div className="space-y-2">
        <p>
          OntoTrade 플랫폼의 이용 약관이 업데이트되었습니다. 주요 변경사항은
          다음과 같습니다:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>개인정보 처리 방침 개정</li>
          <li>거래 수수료 구조 변경</li>
          <li>계좌 보안 강화 정책</li>
          <li>API 이용 조건 업데이트</li>
        </ul>
        <AlertActions>
          <AlertAction variant="primary">전체 내용 보기</AlertAction>
          <AlertAction variant="secondary">확인</AlertAction>
        </AlertActions>
      </div>
    </InfoAlert>
  ),
};

/**
 * 모든 알림 타입을 보여주는 그룹입니다.
 */
export const AllTypes: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-2xl">
      <SuccessAlert title="성공" dismissible>
        거래가 성공적으로 완료되었습니다.
      </SuccessAlert>

      <ErrorAlert title="오류" dismissible>
        시스템 오류가 발생했습니다.
      </ErrorAlert>

      <WarningAlert title="경고" dismissible>
        주의가 필요한 상황입니다.
      </WarningAlert>

      <InfoAlert title="정보" dismissible>
        새로운 정보가 있습니다.
      </InfoAlert>
    </div>
  ),
};
