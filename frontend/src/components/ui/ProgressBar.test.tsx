import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar Component", () => {
  it("renders with correct progress value", () => {
    render(<ProgressBar value={75} />);

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute("aria-valuenow", "75");
  });

  it("displays progress text when showPercentage is true", () => {
    render(<ProgressBar value={50} showPercentage />);

    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("does not display progress text when showPercentage is false", () => {
    render(<ProgressBar value={50} showPercentage={false} />);

    expect(screen.queryByText("50%")).not.toBeInTheDocument();
  });

  it("renders with different sizes", () => {
    const { rerender } = render(<ProgressBar value={50} size="sm" />);

    expect(screen.getByRole("progressbar")).toHaveClass("h-2");

    rerender(<ProgressBar value={50} size="lg" />);
    expect(screen.getByRole("progressbar")).toHaveClass("h-6");
  });

  it("renders with different variants", () => {
    const { rerender } = render(<ProgressBar value={50} variant="success" />);

    const progressContainer = screen.getByRole("progressbar");
    const progressFill = progressContainer.querySelector(".bg-green-500");
    expect(progressFill).toBeInTheDocument();

    rerender(<ProgressBar value={50} variant="error" />);
    const errorFill = screen
      .getByRole("progressbar")
      .querySelector(".bg-red-500");
    expect(errorFill).toBeInTheDocument();
  });

  it("handles edge cases for progress values", () => {
    const { rerender } = render(<ProgressBar value={0} showPercentage />);
    expect(screen.getByText("0%")).toBeInTheDocument();

    rerender(<ProgressBar value={100} showPercentage />);
    expect(screen.getByText("100%")).toBeInTheDocument();

    rerender(<ProgressBar value={150} showPercentage />);
    expect(screen.getByText("100%")).toBeInTheDocument();

    rerender(<ProgressBar value={-10} showPercentage />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});
