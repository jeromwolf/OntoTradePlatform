import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import "@testing-library/jest-dom";
import { vi, describe, test, expect } from "vitest";
import LoginPage from "../LoginPage";

// useAuth 훅 모킹
vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    signIn: vi.fn().mockResolvedValue({}),
    signInWithGoogle: vi.fn().mockResolvedValue({}),
    signInWithFacebook: vi.fn().mockResolvedValue({}),
    loading: false,
  }),
}));

describe("LoginPage", () => {
  const renderLoginPage = () => {
    return render(
      <Router>
        <LoginPage />
      </Router>,
    );
  };

  test("렌더링 테스트", () => {
    renderLoginPage();

    // 기본 요소들이 렌더링되는지 확인
    expect(screen.getByText("온토트레이드")).toBeInTheDocument();
    expect(
      screen.getByText("지식 그래프 기반 AI 트레이딩 플랫폼"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("이메일을 입력하세요"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("비밀번호를 입력하세요"),
    ).toBeInTheDocument();
    expect(screen.getByText("로그인")).toBeInTheDocument();
    expect(screen.getByText("회원가입")).toBeInTheDocument();
  });

  test("언어 전환 테스트", () => {
    renderLoginPage();

    // 영어로 전환
    fireEvent.click(screen.getByText("English"));

    // 영어 텍스트 확인
    expect(screen.getByText("OntoTrade")).toBeInTheDocument();
    expect(
      screen.getByText("Knowledge Graph-based AI Trading Platform"),
    ).toBeInTheDocument();
    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByText("Sign up")).toBeInTheDocument();

    // 다시 한국어로 전환
    fireEvent.click(screen.getByText("한국어"));
    expect(screen.getByText("로그인")).toBeInTheDocument();
  });

  test("유효성 검사 테스트", async () => {
    renderLoginPage();

    // 빈 폼 제출
    fireEvent.click(screen.getByText("로그인"));

    // 에러 메시지 확인
    await waitFor(() => {
      expect(
        screen.getByText("이메일과 비밀번호를 입력해주세요."),
      ).toBeInTheDocument();
    });

    // 이메일만 입력
    fireEvent.change(screen.getByPlaceholderText("이메일을 입력하세요"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByText("로그인"));

    await waitFor(() => {
      expect(
        screen.getByText("이메일과 비밀번호를 입력해주세요."),
      ).toBeInTheDocument();
    });
  });

  test("소셜 로그인 버튼 클릭 테스트", () => {
    renderLoginPage();

    // 구글 로그인 버튼 클릭
    fireEvent.click(screen.getByText("구글"));

    // 페이스북 로그인 버튼 클릭
    fireEvent.click(screen.getByText("페이스북"));

    // 모킹된 함수가 호출되었는지 확인
    const { signInWithGoogle, signInWithFacebook } =
      require("../../contexts/AuthContext").useAuth();
    expect(signInWithGoogle).toHaveBeenCalledTimes(1);
    expect(signInWithFacebook).toHaveBeenCalledTimes(1);
  });
});
