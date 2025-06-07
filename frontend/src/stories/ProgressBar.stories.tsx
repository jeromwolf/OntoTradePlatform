import type { Meta, StoryObj } from "@storybook/react";
import {
  ProgressBar,
  CircularProgress,
  StepProgress,
  Spinner,
} from "../components/ui/ProgressBar";
import { Button } from "../components/ui/Button";
import { useState } from "react";

/**
 * 온톨로지 거래 플랫폼의 진행률 표시 컴포넌트입니다.
 * 작업 진행 상황을 시각적으로 표현합니다.
 */
const meta: Meta<typeof ProgressBar> = {
  title: "UI Components/ProgressBar",
  component: ProgressBar,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
진행률 컴포넌트는 작업의 완료 정도를 시각적으로 표시하는 데 사용됩니다.

## 포함된 컴포넌트
- **ProgressBar**: 기본 진행률 막대
- **CircularProgress**: 원형 진행률 표시기
- **StepProgress**: 단계별 진행률
- **Spinner**: 로딩 스피너

## 주요 특징
- 다양한 크기와 색상 variant
- 애니메이션 효과
- 접근성 지원 (aria-valuenow, aria-valuemax)
- 커스터마이징 가능한 스타일
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "진행률 (0-100)",
    },
    variant: {
      control: "select",
      options: ["default", "success", "warning", "error"],
      description: "진행률 막대 색상",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "진행률 막대 크기",
    },
    animated: {
      control: "boolean",
      description: "애니메이션 효과",
    },
    showValue: {
      control: "boolean",
      description: "진행률 수치 표시",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 진행률 막대입니다.
 */
export const Default: Story = {
  args: {
    value: 50,
    showValue: true,
  },
};

/**
 * 성공 상태의 진행률 막대입니다.
 */
export const Success: Story = {
  args: {
    value: 100,
    variant: "success",
    showValue: true,
  },
};

/**
 * 경고 상태의 진행률 막대입니다.
 */
export const Warning: Story = {
  args: {
    value: 75,
    variant: "warning",
    showValue: true,
  },
};

/**
 * 오류 상태의 진행률 막대입니다.
 */
export const Error: Story = {
  args: {
    value: 25,
    variant: "error",
    showValue: true,
  },
};

/**
 * 애니메이션이 있는 진행률 막대입니다.
 */
export const Animated: Story = {
  args: {
    value: 65,
    animated: true,
    showValue: true,
  },
};

/**
 * 작은 크기의 진행률 막대입니다.
 */
export const Small: Story = {
  args: {
    value: 40,
    size: "sm",
    showValue: true,
  },
};

/**
 * 큰 크기의 진행률 막대입니다.
 */
export const Large: Story = {
  args: {
    value: 80,
    size: "lg",
    showValue: true,
  },
};

/**
 * 원형 진행률 표시기입니다.
 */
export const Circular: Story = {
  render: () => (
    <div className="flex flex-wrap gap-8 items-center">
      <CircularProgress value={25} size="sm" />
      <CircularProgress value={50} size="md" />
      <CircularProgress value={75} size="lg" />
      <CircularProgress value={100} variant="success" size="md" />
    </div>
  ),
};

/**
 * 단계별 진행률입니다.
 */
export const StepByStep: Story = {
  render: () => {
    const [currentStep, setCurrentStep] = useState(1);
    const steps = [
      { id: 1, title: "계좌 생성", description: "기본 정보 입력" },
      { id: 2, title: "이메일 인증", description: "이메일 확인" },
      { id: 3, title: "신원 확인", description: "신분증 업로드" },
      { id: 4, title: "완료", description: "계좌 개설 완료" },
    ];

    return (
      <div className="w-full max-w-2xl space-y-6">
        <StepProgress steps={steps} currentStep={currentStep} />
        <div className="flex gap-2 justify-center">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            이전
          </Button>
          <Button
            size="sm"
            onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
            disabled={currentStep === 4}
          >
            다음
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setCurrentStep(1)}
          >
            초기화
          </Button>
        </div>
      </div>
    );
  },
};

/**
 * 로딩 스피너입니다.
 */
export const LoadingSpinners: Story = {
  render: () => (
    <div className="flex flex-wrap gap-8 items-center">
      <div className="text-center space-y-2">
        <Spinner size="sm" />
        <p className="text-sm">작은 스피너</p>
      </div>
      <div className="text-center space-y-2">
        <Spinner size="md" />
        <p className="text-sm">중간 스피너</p>
      </div>
      <div className="text-center space-y-2">
        <Spinner size="lg" />
        <p className="text-sm">큰 스피너</p>
      </div>
      <div className="text-center space-y-2">
        <Spinner variant="success" size="md" />
        <p className="text-sm">성공 색상</p>
      </div>
    </div>
  ),
};

/**
 * 인터랙티브 진행률 데모입니다.
 */
export const Interactive: Story = {
  render: () => {
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const simulateProgress = () => {
      setIsLoading(true);
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsLoading(false);
            return 100;
          }
          return prev + 1;
        });
      }, 50);
    };

    return (
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-4">
          <ProgressBar
            value={progress}
            variant={progress === 100 ? "success" : "default"}
            animated={isLoading}
            showValue
          />
          <CircularProgress
            value={progress}
            variant={progress === 100 ? "success" : "default"}
            size="lg"
          />
        </div>

        <div className="flex gap-2 justify-center">
          <Button onClick={simulateProgress} disabled={isLoading}>
            {isLoading ? "진행 중..." : "시작"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setProgress(0);
              setIsLoading(false);
            }}
            disabled={isLoading}
          >
            리셋
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2">
            <Spinner size="sm" />
            <span className="text-sm">데이터 처리 중...</span>
          </div>
        )}
      </div>
    );
  },
};

/**
 * 포트폴리오 성과 진행률입니다.
 */
export const PortfolioProgress: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>목표 수익률</span>
          <span>80%</span>
        </div>
        <ProgressBar value={80} variant="success" showValue animated />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>리스크 수준</span>
          <span>45%</span>
        </div>
        <ProgressBar value={45} variant="warning" showValue />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>다각화 지수</span>
          <span>92%</span>
        </div>
        <ProgressBar value={92} variant="success" showValue />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>자산 활용률</span>
          <span>65%</span>
        </div>
        <ProgressBar value={65} showValue />
      </div>
    </div>
  ),
};
