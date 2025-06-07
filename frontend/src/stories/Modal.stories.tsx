import type { Meta, StoryObj } from "@storybook/react";
import { Modal, ConfirmModal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useState } from "react";

/**
 * 온톨로지 거래 플랫폼의 모달 컴포넌트입니다.
 * 오버레이 위에 콘텐츠를 표시합니다.
 */
const meta: Meta<typeof Modal> = {
  title: "UI Components/Modal",
  component: Modal,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
모달 컴포넌트는 메인 콘텐츠 위에 오버레이로 표시되는 대화상자입니다.

## 포함된 컴포넌트
- **Modal**: 기본 모달
- **ConfirmModal**: 확인/취소 모달

## 주요 특징
- 다양한 크기 (sm, md, lg, xl, full)
- 백드롭 클릭으로 닫기
- ESC 키로 닫기
- 접근성 지원 (aria-modal, role="dialog")
- 포커스 트랩
- 스크롤 방지
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    isOpen: {
      control: "boolean",
      description: "모달 열림 상태",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "full"],
      description: "모달 크기",
    },
    closeOnBackdrop: {
      control: "boolean",
      description: "백드롭 클릭으로 닫기",
    },
    closeOnEscape: {
      control: "boolean",
      description: "ESC 키로 닫기",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 모달입니다.
 */
export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>모달 열기</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">기본 모달</h2>
            <p className="text-gray-600 mb-6">
              이것은 기본 모달의 예시입니다. 백드롭을 클릭하거나 ESC 키를 눌러
              닫을 수 있습니다.
            </p>
            <div className="flex justify-end">
              <Button onClick={() => setIsOpen(false)}>닫기</Button>
            </div>
          </div>
        </Modal>
      </>
    );
  },
};

/**
 * 확인 모달입니다.
 */
export const Confirm: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button variant="secondary" onClick={() => setIsOpen(true)}>
          계좌 삭제
        </Button>
        <ConfirmModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onConfirm={() => {
            alert("계좌가 삭제되었습니다.");
            setIsOpen(false);
          }}
          title="계좌 삭제 확인"
          message="정말로 계좌를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
          confirmText="삭제"
          cancelText="취소"
          variant="error"
        />
      </>
    );
  },
};

/**
 * 다양한 크기의 모달들입니다.
 */
export const Sizes: Story = {
  render: () => {
    const [activeModal, setActiveModal] = useState<string | null>(null);

    const sizes = [
      { key: "sm", label: "작은 모달" },
      { key: "md", label: "중간 모달" },
      { key: "lg", label: "큰 모달" },
      { key: "xl", label: "매우 큰 모달" },
    ] as const;

    return (
      <>
        <div className="flex flex-wrap gap-2">
          {sizes.map(({ key, label }) => (
            <Button
              key={key}
              onClick={() => setActiveModal(key)}
              variant="outline"
            >
              {label}
            </Button>
          ))}
        </div>

        {sizes.map(({ key, label }) => (
          <Modal
            key={key}
            isOpen={activeModal === key}
            onClose={() => setActiveModal(null)}
            size={key}
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">{label}</h2>
              <p className="text-gray-600 mb-6">
                이것은 {key} 크기의 모달입니다. 다양한 크기로 콘텐츠를 표시할 수
                있습니다.
              </p>
              <div className="flex justify-end">
                <Button onClick={() => setActiveModal(null)}>닫기</Button>
              </div>
            </div>
          </Modal>
        ))}
      </>
    );
  },
};

/**
 * 주문 폼 모달입니다.
 */
export const OrderForm: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [orderType, setOrderType] = useState("buy");
    const [quantity, setQuantity] = useState("");
    const [price, setPrice] = useState("");

    const handleSubmit = () => {
      alert(
        `${orderType === "buy" ? "매수" : "매도"} 주문: ${quantity}주, $${price}`,
      );
      setIsOpen(false);
      setQuantity("");
      setPrice("");
    };

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>주문하기</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="md">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-6">AAPL 주문</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  주문 유형
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={orderType === "buy" ? "default" : "outline"}
                    onClick={() => setOrderType("buy")}
                    className="flex-1"
                  >
                    매수
                  </Button>
                  <Button
                    variant={orderType === "sell" ? "default" : "outline"}
                    onClick={() => setOrderType("sell")}
                    className="flex-1"
                  >
                    매도
                  </Button>
                </div>
              </div>

              <Input
                label="수량"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="주식 수량을 입력하세요"
              />

              <Input
                label="가격"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="주당 가격을 입력하세요"
              />

              {quantity && price && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <span>총 금액:</span>
                    <span className="font-semibold">
                      ${(parseFloat(quantity) * parseFloat(price)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!quantity || !price}
                className="flex-1"
                variant={orderType === "buy" ? "default" : "secondary"}
              >
                {orderType === "buy" ? "매수" : "매도"} 주문
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  },
};

/**
 * 스크롤 가능한 긴 콘텐츠 모달입니다.
 */
export const LongContent: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>이용약관 보기</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="lg">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">이용약관</h2>
            <div className="max-h-96 overflow-y-auto mb-6">
              <div className="space-y-4 text-sm text-gray-600">
                <p>
                  제1조 (목적) 이 약관은 온톨로지 거래 플랫폼(이하 "회사")이
                  제공하는 온라인 거래 서비스(이하 "서비스")의 이용과 관련하여
                  회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로
                  합니다.
                </p>
                <p>
                  제2조 (정의) 이 약관에서 사용하는 용어의 정의는 다음과
                  같습니다: 1. "서비스"란 회사가 제공하는 온라인 거래 플랫폼을
                  의미합니다. 2. "이용자"란 이 약관에 따라 회사가 제공하는
                  서비스를 받는 회원 및 비회원을 말합니다. 3. "회원"이란 회사에
                  개인정보를 제공하여 회원등록을 한 자로서 회사의 정보를
                  지속적으로 제공받으며 회사가 제공하는 서비스를 계속적으로
                  이용할 수 있는 자를 말합니다.
                </p>
                <p>
                  제3조 (약관의 명시와 설명 및 개정) 1. 회사는 이 약관의 내용과
                  상호 및 대표자 성명, 영업소 소재지 주소(소비자의 불만을 처리할
                  수 있는 곳의 주소를 포함), 전화번호, 모사전송번호,
                  전자우편주소, 사업자등록번호, 통신판매업 신고번호,
                  개인정보보호책임자 등을 이용자가 쉽게 알 수 있도록 서비스 초기
                  화면에 게시합니다. 2. 회사는 「전자상거래 등에서의
                  소비자보호에 관한 법률」, 「약관의 규제에 관한 법률」,
                  「전자문서 및 전자거래기본법」, 「전자금융거래법」,
                  「전자서명법」, 「정보통신망 이용촉진 및 정보보호 등에 관한
                  법률」, 「방문판매 등에 관한 법률」, 「소비자기본법」 등 관련
                  법을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.
                </p>
                <p>
                  제4조 (서비스의 제공 및 변경) 1. 회사는 다음과 같은 업무를
                  수행합니다. - 거래 정보 제공 서비스 - 온라인 거래 중개 서비스
                  - 기타 회사가 정하는 업무 2. 회사는 재화 또는 용역의 품절 또는
                  기술적 사양의 변경 등의 경우에는 장차 체결되는 계약에 의해
                  제공할 재화 또는 용역의 내용을 변경할 수 있습니다. 이 경우에는
                  변경된 재화 또는 용역의 내용 및 제공일자를 명시하여 현재의
                  재화 또는 용역의 내용을 게시한 곳에 즉시 공지합니다.
                </p>
                <p>
                  제5조 (서비스의 중단) 1. 회사는 컴퓨터 등 정보통신설비의
                  보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한
                  경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다. 2.
                  회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로
                  인하여 이용자 또는 제3자가 입은 손해에 대하여 배상합니다. 단,
                  회사가 고의 또는 과실이 없음을 입증하는 경우에는 그러하지
                  아니합니다.
                </p>
                <p>
                  제6조 (회원가입) 1. 이용자는 회사가 정한 가입 양식에 따라
                  회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로서
                  회원가입을 신청합니다. 2. 회사는 제1항과 같이 회원으로 가입할
                  것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로
                  등록합니다.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                취소
              </Button>
              <Button onClick={() => setIsOpen(false)} className="flex-1">
                동의
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  },
};

/**
 * 중첩 모달 예시입니다.
 */
export const NestedModals: Story = {
  render: () => {
    const [firstModal, setFirstModal] = useState(false);
    const [secondModal, setSecondModal] = useState(false);

    return (
      <>
        <Button onClick={() => setFirstModal(true)}>첫 번째 모달 열기</Button>

        <Modal isOpen={firstModal} onClose={() => setFirstModal(false)}>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">첫 번째 모달</h2>
            <p className="text-gray-600 mb-6">
              이것은 첫 번째 모달입니다. 여기서 두 번째 모달을 열 수 있습니다.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setFirstModal(false)}>
                닫기
              </Button>
              <Button onClick={() => setSecondModal(true)}>
                두 번째 모달 열기
              </Button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={secondModal} onClose={() => setSecondModal(false)}>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">두 번째 모달</h2>
            <p className="text-gray-600 mb-6">
              이것은 중첩된 두 번째 모달입니다. 첫 번째 모달 위에 표시됩니다.
            </p>
            <div className="flex justify-end">
              <Button onClick={() => setSecondModal(false)}>닫기</Button>
            </div>
          </div>
        </Modal>
      </>
    );
  },
};

/**
 * 백드롭 클릭 비활성화 모달입니다.
 */
export const NoBackdropClose: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>
          모달 열기 (백드롭 클릭 불가)
        </Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          closeOnBackdrop={false}
          closeOnEscape={false}
        >
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">중요한 알림</h2>
            <p className="text-gray-600 mb-6">
              이 모달은 백드롭 클릭이나 ESC 키로 닫을 수 없습니다. 반드시 버튼을
              클릭해야 합니다.
            </p>
            <div className="flex justify-end">
              <Button onClick={() => setIsOpen(false)}>확인</Button>
            </div>
          </div>
        </Modal>
      </>
    );
  },
};
