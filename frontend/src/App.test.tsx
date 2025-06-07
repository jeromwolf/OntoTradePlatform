import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders OntoTrade title", () => {
    render(<App />);
    expect(screen.getByText("OntoTrade")).toBeInTheDocument();
  });

  it("shows Korean content by default", () => {
    render(<App />);
    expect(
      screen.getByText("온톨로지 기반 투자 시뮬레이션 플랫폼"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("OntoTrade에 오신 것을 환영합니다! 🎉"),
    ).toBeInTheDocument();
  });

  it("switches to English when English button is clicked", () => {
    render(<App />);

    const englishButton = screen.getByText("English");
    fireEvent.click(englishButton);

    expect(
      screen.getByText("Ontology-based Investment Simulation Platform"),
    ).toBeInTheDocument();
    expect(screen.getByText("Welcome to OntoTrade! 🎉")).toBeInTheDocument();
  });

  it("switches back to Korean when Korean button is clicked", () => {
    render(<App />);

    // First switch to English
    const englishButton = screen.getByText("English");
    fireEvent.click(englishButton);

    // Then switch back to Korean
    const koreanButton = screen.getByText("한국어");
    fireEvent.click(koreanButton);

    expect(
      screen.getByText("온톨로지 기반 투자 시뮬레이션 플랫폼"),
    ).toBeInTheDocument();
  });

  it("renders all feature items", () => {
    render(<App />);

    expect(screen.getByText("🎯 실시간 투자 시뮬레이션")).toBeInTheDocument();
    expect(screen.getByText("📊 온톨로지 기반 분석 도구")).toBeInTheDocument();
    expect(screen.getByText("🏆 게임화된 학습 시스템")).toBeInTheDocument();
    expect(screen.getByText("👥 커뮤니티 기능")).toBeInTheDocument();
  });

  it("renders get started button", () => {
    render(<App />);
    expect(screen.getByText("시작하기")).toBeInTheDocument();
  });

  it("shows setup status indicators", () => {
    render(<App />);
    expect(
      screen.getByText("✅ React 18 + TypeScript + Vite"),
    ).toBeInTheDocument();
    expect(screen.getByText("✅ Tailwind CSS")).toBeInTheDocument();
    expect(screen.getByText("✅ Vitest 테스트 환경")).toBeInTheDocument();
  });
});
