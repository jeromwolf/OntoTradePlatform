import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Modal, ConfirmModal } from "./Modal";

describe("Modal Component", () => {
  it("renders when open", () => {
    render(
      <Modal isOpen onClose={() => {}}>
        <p>Modal content</p>
      </Modal>,
    );

    expect(screen.getByText("Modal content")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <p>Modal content</p>
      </Modal>,
    );

    expect(screen.queryByText("Modal content")).not.toBeInTheDocument();
  });

  it("calls onClose when backdrop is clicked", () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen onClose={handleClose}>
        <p>Modal content</p>
      </Modal>,
    );

    const backdrop = screen.getByTestId("modal-backdrop");
    fireEvent.click(backdrop);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when escape key is pressed", () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen onClose={handleClose}>
        <p>Modal content</p>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("renders with different sizes", () => {
    const { rerender } = render(
      <Modal isOpen onClose={() => {}} size="sm">
        <p>Small modal</p>
      </Modal>,
    );

    expect(screen.getByRole("dialog")).toHaveClass("max-w-sm");

    rerender(
      <Modal isOpen onClose={() => {}} size="lg">
        <p>Large modal</p>
      </Modal>,
    );

    expect(screen.getByRole("dialog")).toHaveClass("max-w-lg");
  });
});

describe("ConfirmModal Component", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: "Confirm Action",
    message: "Are you sure?",
  };

  it("renders with title and message", () => {
    render(<ConfirmModal {...defaultProps} />);

    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button is clicked", () => {
    const handleConfirm = vi.fn();
    render(<ConfirmModal {...defaultProps} onConfirm={handleConfirm} />);

    const confirmButton = screen.getByText("확인");
    fireEvent.click(confirmButton);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when cancel button is clicked", () => {
    const handleClose = vi.fn();
    render(<ConfirmModal {...defaultProps} onClose={handleClose} />);

    const cancelButton = screen.getByText("취소");
    fireEvent.click(cancelButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("renders with different variants", () => {
    const { rerender } = render(
      <ConfirmModal {...defaultProps} variant="error" />,
    );

    expect(screen.getByText("확인")).toHaveClass("bg-red-600");

    rerender(<ConfirmModal {...defaultProps} variant="warning" />);

    expect(screen.getByText("확인")).toHaveClass("bg-yellow-600");
  });
});
