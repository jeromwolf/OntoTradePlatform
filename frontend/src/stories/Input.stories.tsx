import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { useState } from "react";

/**
 * 온톨로지 거래 플랫폼의 입력 필드 컴포넌트입니다.
 * 다양한 타입과 상태를 지원합니다.
 */
const meta: Meta<typeof Input> = {
  title: "UI Components/Input",
  component: Input,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
입력 필드 컴포넌트는 사용자로부터 정보를 수집하는 데 사용됩니다.

## 주요 특징
- HTML5 input 타입 완전 지원
- 오류 상태 및 스타일링
- placeholder 텍스트 지원
- 완전 접근성 지원
- Tailwind CSS 기반 스타일링
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel", "url", "search"],
      description: "HTML input 타입",
    },
    placeholder: {
      control: "text",
      description: "placeholder 텍스트",
    },
    disabled: {
      control: "boolean",
      description: "입력 필드 비활성화",
    },
    error: {
      control: "boolean",
      description: "오류 상태",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 텍스트 입력 필드입니다.
 */
export const Default: Story = {
  args: {
    placeholder: "텍스트를 입력하세요",
  },
};

/**
 * 이메일 입력 필드입니다.
 */
export const Email: Story = {
  args: {
    type: "email",
    placeholder: "example@email.com",
  },
};

/**
 * 비밀번호 입력 필드입니다.
 */
export const Password: Story = {
  args: {
    type: "password",
    placeholder: "비밀번호를 입력하세요",
  },
};

/**
 * 숫자 입력 필드입니다.
 */
export const Number: Story = {
  args: {
    type: "number",
    placeholder: "숫자를 입력하세요",
  },
};

/**
 * 검색 입력 필드입니다.
 */
export const Search: Story = {
  args: {
    type: "search",
    placeholder: "종목명을 검색하세요",
  },
};

/**
 * 오류 상태의 입력 필드입니다.
 */
export const WithError: Story = {
  args: {
    placeholder: "필수 입력 항목",
    error: true,
  },
};

/**
 * 비활성화된 입력 필드입니다.
 */
export const Disabled: Story = {
  args: {
    placeholder: "비활성화된 필드",
    disabled: true,
    value: "수정할 수 없음",
  },
};

/**
 * 라벨이 있는 입력 필드입니다.
 */
export const WithLabel: Story = {
  render: () => (
    <div className="w-80 space-y-2">
      <Label htmlFor="username">사용자명</Label>
      <Input id="username" placeholder="사용자명을 입력하세요" />
    </div>
  ),
};

/**
 * 오류 메시지가 있는 입력 필드입니다.
 */
export const WithErrorMessage: Story = {
  render: () => {
    const [value, setValue] = useState("");
    const hasError = value.length > 0 && value.length < 3;

    return (
      <div className="w-80 space-y-2">
        <Label htmlFor="username-error">사용자명</Label>
        <Input
          id="username-error"
          placeholder="최소 3자 이상 입력"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          error={hasError}
        />
        {hasError && (
          <p className="text-sm text-red-600">
            사용자명은 최소 3자 이상이어야 합니다.
          </p>
        )}
      </div>
    );
  },
};

/**
 * 거래 플랫폼용 폼 예시입니다.
 */
export const TradingForm: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="stock-symbol">종목 코드</Label>
        <Input id="stock-symbol" placeholder="AAPL, TSLA 등" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="quantity">수량</Label>
        <Input id="quantity" type="number" placeholder="거래할 주식 수량" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">가격</Label>
        <Input id="price" type="number" placeholder="$0.00" />
      </div>
    </div>
  ),
};
