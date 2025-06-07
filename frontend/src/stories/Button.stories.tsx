import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../components/ui/Button";

/**
 * 온톨로지 거래 플랫폼의 기본 버튼 컴포넌트입니다.
 * 다양한 variant, size, 로딩 상태를 지원합니다.
 */
const meta: Meta<typeof Button> = {
  title: "UI Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
버튼 컴포넌트는 플랫폼 전체에서 일관된 상호작용을 제공합니다.

## 주요 특징
- 5가지 variant (default, secondary, outline, ghost, destructive)
- 3가지 크기 (sm, md, lg)
- 로딩 상태 지원
- 완전 접근성 지원
- Tailwind CSS 기반 스타일링
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "outline", "ghost", "destructive"],
      description: "버튼의 시각적 스타일",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "버튼의 크기",
    },
    loading: {
      control: "boolean",
      description: "로딩 상태 표시",
    },
    disabled: {
      control: "boolean",
      description: "버튼 비활성화",
    },
    children: {
      control: "text",
      description: "버튼 텍스트 또는 콘텐츠",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 버튼 스타일입니다.
 */
export const Default: Story = {
  args: {
    children: "기본 버튼",
  },
};

/**
 * 보조 액션을 위한 세컨더리 버튼입니다.
 */
export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "보조 버튼",
  },
};

/**
 * 외곽선만 있는 아웃라인 버튼입니다.
 */
export const Outline: Story = {
  args: {
    variant: "outline",
    children: "외곽선 버튼",
  },
};

/**
 * 미묘한 액션을 위한 고스트 버튼입니다.
 */
export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "고스트 버튼",
  },
};

/**
 * 위험한 액션을 위한 파괴적 버튼입니다.
 */
export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "삭제 버튼",
  },
};

/**
 * 작은 크기의 버튼입니다.
 */
export const Small: Story = {
  args: {
    size: "sm",
    children: "작은 버튼",
  },
};

/**
 * 큰 크기의 버튼입니다.
 */
export const Large: Story = {
  args: {
    size: "lg",
    children: "큰 버튼",
  },
};

/**
 * 로딩 상태의 버튼입니다.
 */
export const Loading: Story = {
  args: {
    loading: true,
    children: "로딩 중...",
  },
};

/**
 * 비활성화된 버튼입니다.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    children: "비활성화 버튼",
  },
};

/**
 * 모든 버튼 variant를 보여주는 그룹입니다.
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 items-center">
      <Button variant="default">기본</Button>
      <Button variant="secondary">보조</Button>
      <Button variant="outline">외곽선</Button>
      <Button variant="ghost">고스트</Button>
      <Button variant="destructive">삭제</Button>
    </div>
  ),
};

/**
 * 모든 크기를 보여주는 그룹입니다.
 */
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 items-center">
      <Button size="sm">작은 버튼</Button>
      <Button size="md">중간 버튼</Button>
      <Button size="lg">큰 버튼</Button>
    </div>
  ),
};
