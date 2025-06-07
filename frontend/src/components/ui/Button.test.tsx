import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button } from "./Button";

describe("Button Component", () => {
  it("renders with default variant", () => {
    render(<Button>Default Button</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-slate-900");
    expect(button).toHaveTextContent("Default Button");
  });

  it("renders with primary variant", () => {
    render(<Button variant="primary">Primary Button</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-blue-600");
  });

  it("renders with secondary variant", () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-slate-100");
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("can be disabled", () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("renders in loading state", () => {
    render(<Button loading>Loading Button</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Loading Button");
    // Loading spinner should be present
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("renders with custom size", () => {
    render(<Button size="sm">Small Button</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("h-8", "px-3", "text-xs");
  });

  it("renders with emoji", () => {
    render(<Button emoji="🚀">Button with Emoji</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("🚀");
    expect(button).toHaveTextContent("Button with Emoji");
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Custom Button</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });
});
