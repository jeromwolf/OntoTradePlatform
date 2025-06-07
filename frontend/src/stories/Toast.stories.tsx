import type { Meta, StoryObj } from "@storybook/react";
import { Toast, ToastProvider, ToastContainer } from "../components/ui/Toast";
import { Button } from "../components/ui/Button";
import { useState } from "react";

/**
 * 온톨로지 거래 플랫폼의 토스트 알림 컴포넌트입니다.
 * 사용자에게 즉시 피드백을 제공합니다.
 */
const meta: Meta<typeof Toast> = {
  title: "UI Components/Toast",
  component: Toast,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
토스트 컴포넌트는 사용자에게 중요한 정보나 액션의 결과를 알려주는 데 사용됩니다.

## 주요 특징
- 4가지 타입 (success, error, warning, info)
- 자동 사라지기 기능 (4초)
- 수동 닫기 버튼
- 다양한 화면 위치 지원
- 애니메이션 효과
- Context API를 통한 전역 상태 관리
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["success", "error", "warning", "info"],
      description: "토스트 타입",
    },
    title: {
      control: "text",
      description: "토스트 제목",
    },
    message: {
      control: "text",
      description: "토스트 메시지",
    },
    duration: {
      control: "number",
      description: "자동 닫기 시간 (밀리초)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 성공 알림 토스트입니다.
 */
export const Success: Story = {
  args: {
    id: "1",
    type: "success",
    title: "거래 완료",
    message: "AAPL 10주 매수 주문이 체결되었습니다.",
    duration: 4000,
    onClose: () => {},
  },
};

/**
 * 오류 알림 토스트입니다.
 */
export const Error: Story = {
  args: {
    id: "2",
    type: "error",
    title: "거래 실패",
    message: "잔고가 부족하여 주문을 처리할 수 없습니다.",
    duration: 4000,
    onClose: () => {},
  },
};

/**
 * 경고 알림 토스트입니다.
 */
export const Warning: Story = {
  args: {
    id: "3",
    type: "warning",
    title: "위험 알림",
    message: "이 거래는 높은 리스크를 포함하고 있습니다.",
    duration: 4000,
    onClose: () => {},
  },
};

/**
 * 정보 알림 토스트입니다.
 */
export const Info: Story = {
  args: {
    id: "4",
    type: "info",
    title: "시장 정보",
    message: "미국 시장이 30분 후 개장합니다.",
    duration: 4000,
    onClose: () => {},
  },
};

/**
 * 짧은 메시지 토스트입니다.
 */
export const ShortMessage: Story = {
  args: {
    id: "5",
    type: "success",
    title: "저장 완료",
    message: "설정이 저장되었습니다.",
    duration: 4000,
    onClose: () => {},
  },
};

/**
 * 긴 메시지 토스트입니다.
 */
export const LongMessage: Story = {
  args: {
    id: "6",
    type: "info",
    title: "시스템 점검 안내",
    message:
      "내일 오전 2시부터 4시까지 시스템 점검이 진행됩니다. 점검 중에는 거래 서비스가 일시적으로 중단될 수 있으니 양해 부탁드립니다.",
    duration: 6000,
    onClose: () => {},
  },
};

/**
 * 제목 없는 토스트입니다.
 */
export const NoTitle: Story = {
  args: {
    id: "7",
    type: "success",
    message: "자동 저장되었습니다.",
    duration: 3000,
    onClose: () => {},
  },
};

/**
 * 토스트 시스템 시연입니다.
 */
export const ToastSystem: Story = {
  render: () => {
    const [toasts, setToasts] = useState<any[]>([]);
    let toastId = 0;

    const addToast = (
      type: "success" | "error" | "warning" | "info",
      title: string,
      message: string,
    ) => {
      const id = (++toastId).toString();
      const newToast = {
        id,
        type,
        title,
        message,
        duration: 4000,
        onClose: () => removeToast(id),
      };
      setToasts((prev) => [...prev, newToast]);
    };

    const removeToast = (id: string) => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() =>
              addToast("success", "거래 성공", "AAPL 10주 매수 완료")
            }
          >
            성공 토스트
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => addToast("error", "거래 실패", "잔고 부족")}
          >
            오류 토스트
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => addToast("warning", "위험 경고", "높은 변동성 종목")}
          >
            경고 토스트
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => addToast("info", "시장 정보", "30분 후 개장")}
          >
            정보 토스트
          </Button>
        </div>

        <ToastContainer position="top-right">
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} />
          ))}
        </ToastContainer>
      </div>
    );
  },
};
