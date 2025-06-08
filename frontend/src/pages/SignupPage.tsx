/**
 * 회원가입 페이지 - LoginPage와 동일한 톤앤매너 적용
 */

import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function SignupPage() {
  const { signUp, signInWithGoogle, signInWithFacebook, loading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState<"ko" | "en">("ko");

  // 약관 동의 상태
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  // 포커스 상태 관리
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const style = {
    container: {
      minHeight: "100vh",
      background:
        "linear-gradient(135deg, #0a0e27 0%, #1a1b3a 50%, #0f172a 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "48px 16px",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    card: {
      width: "100%",
      maxWidth: "480px",
      background: "rgba(19, 22, 41, 0.95)",
      borderRadius: "20px",
      padding: "40px",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(55, 65, 81, 0.3)",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
    },
    languageContainer: {
      display: "flex",
      justifyContent: "flex-end",
      marginBottom: "32px",
      gap: "8px",
    },
    languageButton: (active: boolean) => ({
      padding: "8px 16px",
      borderRadius: "12px",
      border: "none",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s ease",
      background: active
        ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
        : "rgba(55, 65, 81, 0.5)",
      color: active ? "#ffffff" : "#9ca3af",
    }),
    header: {
      textAlign: "center" as const,
      marginBottom: "32px",
    },
    logo: {
      fontSize: "32px",
      marginBottom: "8px",
    },
    title: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#ffffff",
      marginBottom: "8px",
    },
    subtitle: {
      fontSize: "16px",
      color: "#9ca3af",
      lineHeight: "1.5",
    },
    form: {
      marginBottom: "32px",
    },
    inputContainer: {
      marginBottom: "20px",
    },
    inputLabel: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "8px",
      fontSize: "14px",
      fontWeight: "500",
      color: "#e5e7eb",
    },
    inputWrapper: {
      position: "relative" as const,
    },
    input: (focused: boolean) => ({
      width: "100%",
      padding: "16px",
      borderRadius: "12px",
      border: `2px solid ${focused ? "#3b82f6" : "rgba(55, 65, 81, 0.6)"}`,
      background: "rgba(17, 24, 39, 0.8)",
      color: "#ffffff",
      fontSize: "16px",
      outline: "none",
      transition: "all 0.2s ease",
      "::placeholder": {
        color: "#6b7280",
      },
    }),
    checkboxContainer: {
      marginBottom: "24px",
    },
    checkboxItem: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "12px",
      padding: "12px",
      borderRadius: "8px",
      background: "rgba(17, 24, 39, 0.4)",
      border: "1px solid rgba(55, 65, 81, 0.3)",
    },
    checkbox: {
      width: "18px",
      height: "18px",
      borderRadius: "4px",
      border: "2px solid #6b7280",
      background: "transparent",
      cursor: "pointer",
      appearance: "none" as const,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxChecked: {
      background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      borderColor: "#3b82f6",
    },
    checkboxLabel: {
      fontSize: "14px",
      color: "#e5e7eb",
      cursor: "pointer",
      flex: 1,
    },
    submitButton: {
      width: "100%",
      padding: "16px",
      borderRadius: "12px",
      border: "none",
      background: loading
        ? "rgba(107, 114, 128, 0.5)"
        : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      color: "#ffffff",
      fontSize: "16px",
      fontWeight: "600",
      cursor: loading ? "not-allowed" : "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      marginBottom: "16px",
    },
    errorMessage: {
      background: "rgba(220, 38, 38, 0.1)",
      border: "1px solid rgba(220, 38, 38, 0.3)",
      color: "#fca5a5",
      padding: "12px 16px",
      borderRadius: "8px",
      fontSize: "14px",
      marginBottom: "16px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    successMessage: {
      background: "rgba(34, 197, 94, 0.1)",
      border: "1px solid rgba(34, 197, 94, 0.3)",
      color: "#86efac",
      padding: "12px 16px",
      borderRadius: "8px",
      fontSize: "14px",
      marginBottom: "16px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    socialDivider: {
      position: "relative" as const,
      textAlign: "center" as const,
      margin: "24px 0",
    },
    socialDividerLine: {
      position: "absolute" as const,
      top: "50%",
      left: 0,
      right: 0,
      height: "1px",
      background: "rgba(55, 65, 81, 0.5)",
    },
    socialDividerText: {
      background: "rgba(19, 22, 41, 0.95)",
      padding: "0 16px",
      fontSize: "14px",
      color: "#9ca3af",
    },
    socialButtons: {
      display: "flex",
      gap: "12px",
      marginBottom: "24px",
    },
    socialButton: {
      flex: 1,
      padding: "14px",
      borderRadius: "12px",
      border: "1px solid rgba(55, 65, 81, 0.5)",
      background: "rgba(17, 24, 39, 0.6)",
      color: "#e5e7eb",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },
    loginLink: {
      textAlign: "center" as const,
      fontSize: "14px",
      color: "#9ca3af",
    },
    linkText: {
      color: "#60a5fa",
      textDecoration: "none",
      fontWeight: "500",
    },
    footer: {
      textAlign: "center" as const,
      marginTop: "32px",
      fontSize: "14px",
      color: "#6b7280",
    },
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // 유효성 검사
    if (!username || !email || !password || !confirmPassword) {
      setError(
        language === "ko"
          ? "모든 필드를 입력해주세요."
          : "Please fill in all fields.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        language === "ko"
          ? "비밀번호가 일치하지 않습니다."
          : "Passwords do not match.",
      );
      return;
    }

    if (password.length < 6) {
      setError(
        language === "ko"
          ? "비밀번호는 최소 6자 이상이어야 합니다."
          : "Password must be at least 6 characters.",
      );
      return;
    }

    if (!agreeTerms || !agreePrivacy) {
      setError(
        language === "ko"
          ? "필수 약관에 동의해주세요."
          : "Please agree to the required terms.",
      );
      return;
    }

    try {
      await signUp(email, password);
      setMessage(
        language === "ko"
          ? "회원가입이 완료되었습니다! 이메일을 확인해주세요."
          : "Sign up completed! Please check your email.",
      );
      // 성공 시 로그인 페이지로 이동
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(
        err.message ||
          (language === "ko" ? "회원가입에 실패했습니다." : "Sign up failed."),
      );
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    try {
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.message ||
          (language === "ko"
            ? "Google 회원가입에 실패했습니다."
            : "Google sign up failed."),
      );
    }
  };

  const handleFacebookSignup = async () => {
    setError("");
    try {
      await signInWithFacebook();
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.message ||
          (language === "ko"
            ? "Facebook 회원가입에 실패했습니다."
            : "Facebook sign up failed."),
      );
    }
  };

  return (
    <div style={style.container}>
      <div style={style.card}>
        {/* 언어 선택 */}
        <div style={style.languageContainer}>
          <button
            onClick={() => setLanguage("ko")}
            style={style.languageButton(language === "ko")}
            onMouseEnter={(e) => {
              if (language !== "ko") {
                e.currentTarget.style.background = "rgba(75, 85, 99, 0.7)";
              }
            }}
            onMouseLeave={(e) => {
              if (language !== "ko") {
                e.currentTarget.style.background = "rgba(55, 65, 81, 0.5)";
              }
            }}
          >
            🇰🇷 한국어
          </button>
          <button
            onClick={() => setLanguage("en")}
            style={style.languageButton(language === "en")}
            onMouseEnter={(e) => {
              if (language !== "en") {
                e.currentTarget.style.background = "rgba(75, 85, 99, 0.7)";
              }
            }}
            onMouseLeave={(e) => {
              if (language !== "en") {
                e.currentTarget.style.background = "rgba(55, 65, 81, 0.5)";
              }
            }}
          >
            🇺🇸 English
          </button>
        </div>

        {/* 헤더 */}
        <div style={style.header}>
          <div style={style.logo}>📈</div>
          <h1 style={style.title}>
            {language === "ko" ? "온토트레이드" : "OntoTrade"}
          </h1>
          <p style={style.subtitle}>
            {language === "ko"
              ? "지식 그래프 기반 AI 트레이딩 플랫폼"
              : "Knowledge Graph-based AI Trading Platform"}
          </p>
        </div>

        {/* 에러/성공 메시지 */}
        {error && (
          <div style={style.errorMessage}>
            <span>⚠️</span>
            {error}
          </div>
        )}

        {message && (
          <div style={style.successMessage}>
            <span>✅</span>
            {message}
          </div>
        )}

        {/* 회원가입 폼 */}
        <form onSubmit={handleEmailSignup} style={style.form}>
          {/* 사용자명 */}
          <div style={style.inputContainer}>
            <label style={style.inputLabel}>
              <span>👤</span>
              {language === "ko" ? "사용자명" : "Username"}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setFocusedInput("username")}
              onBlur={() => setFocusedInput(null)}
              style={style.input(focusedInput === "username")}
              placeholder={language === "ko" ? "사용자명" : "Username"}
              required
            />
          </div>

          {/* 이메일 */}
          <div style={style.inputContainer}>
            <label style={style.inputLabel}>
              <span>📧</span>
              {language === "ko" ? "이메일" : "Email"}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
              style={style.input(focusedInput === "email")}
              placeholder={language === "ko" ? "이메일" : "Email"}
              required
            />
          </div>

          {/* 비밀번호 */}
          <div style={style.inputContainer}>
            <label style={style.inputLabel}>
              <span>🔒</span>
              {language === "ko" ? "비밀번호" : "Password"}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
              style={style.input(focusedInput === "password")}
              placeholder={
                language === "ko"
                  ? "비밀번호 (최소 6자)"
                  : "Password (min 6 chars)"
              }
              required
            />
          </div>

          {/* 비밀번호 확인 */}
          <div style={style.inputContainer}>
            <label style={style.inputLabel}>
              <span>🔑</span>
              {language === "ko" ? "비밀번호 확인" : "Confirm Password"}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={() => setFocusedInput("confirmPassword")}
              onBlur={() => setFocusedInput(null)}
              style={style.input(focusedInput === "confirmPassword")}
              placeholder={
                language === "ko" ? "비밀번호 확인" : "Confirm Password"
              }
              required
            />
          </div>

          {/* 약관 동의 */}
          <div style={style.checkboxContainer}>
            <div style={style.checkboxItem}>
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                style={{
                  ...style.checkbox,
                  ...(agreeTerms ? style.checkboxChecked : {}),
                }}
              />
              <label htmlFor="agreeTerms" style={style.checkboxLabel}>
                📋{" "}
                {language === "ko"
                  ? "(필수) 이용약관에 동의합니다"
                  : "(Required) I agree to the Terms of Service"}
              </label>
            </div>

            <div style={style.checkboxItem}>
              <input
                type="checkbox"
                id="agreePrivacy"
                checked={agreePrivacy}
                onChange={(e) => setAgreePrivacy(e.target.checked)}
                style={{
                  ...style.checkbox,
                  ...(agreePrivacy ? style.checkboxChecked : {}),
                }}
              />
              <label htmlFor="agreePrivacy" style={style.checkboxLabel}>
                🔒{" "}
                {language === "ko"
                  ? "(필수) 개인정보 처리방침에 동의합니다"
                  : "(Required) I agree to the Privacy Policy"}
              </label>
            </div>

            <div style={style.checkboxItem}>
              <input
                type="checkbox"
                id="agreeMarketing"
                checked={agreeMarketing}
                onChange={(e) => setAgreeMarketing(e.target.checked)}
                style={{
                  ...style.checkbox,
                  ...(agreeMarketing ? style.checkboxChecked : {}),
                }}
              />
              <label htmlFor="agreeMarketing" style={style.checkboxLabel}>
                📬{" "}
                {language === "ko"
                  ? "(선택) 마케팅 정보 수신에 동의합니다"
                  : "(Optional) I agree to receive marketing information"}
              </label>
            </div>
          </div>

          {/* 가입하기 버튼 */}
          <button
            type="submit"
            disabled={loading}
            style={style.submitButton}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, #2563eb, #1e40af)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, #3b82f6, #1d4ed8)";
                e.currentTarget.style.transform = "translateY(0px)";
              }
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    borderTop: "2px solid #ffffff",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                {language === "ko" ? "가입 중..." : "Signing up..."}
              </>
            ) : (
              <>🎉 {language === "ko" ? "회원가입" : "Sign Up"}</>
            )}
          </button>

          {/* 로그인 링크 */}
          <div style={style.loginLink}>
            {language === "ko"
              ? "이미 계정이 있나요?"
              : "Already have an account?"}{" "}
            <Link to="/login" style={style.linkText}>
              {language === "ko" ? "로그인" : "Login"}
            </Link>
          </div>
        </form>

        {/* 소셜 로그인 */}
        <div style={style.socialDivider}>
          <div style={style.socialDividerLine}></div>
          <span style={style.socialDividerText}>
            {language === "ko" ? "또는 다음으로 계속" : "or continue with"}
          </span>
        </div>

        <div style={style.socialButtons}>
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            style={style.socialButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(17, 24, 39, 0.8)";
              e.currentTarget.style.borderColor = "rgba(75, 85, 99, 0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(17, 24, 39, 0.6)";
              e.currentTarget.style.borderColor = "rgba(55, 65, 81, 0.5)";
            }}
          >
            🔍 {language === "ko" ? "구글" : "Google"}
          </button>

          <button
            onClick={handleFacebookSignup}
            disabled={loading}
            style={style.socialButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(17, 24, 39, 0.8)";
              e.currentTarget.style.borderColor = "rgba(75, 85, 99, 0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(17, 24, 39, 0.6)";
              e.currentTarget.style.borderColor = "rgba(55, 65, 81, 0.5)";
            }}
          >
            📘 {language === "ko" ? "페이스북" : "Facebook"}
          </button>
        </div>

        {/* 하단 안내 */}
        <div style={style.footer}>
          🚀{" "}
          {language === "ko"
            ? "OntoTrade에 가입하고 새로운 투자 경험을 시작하세요!"
            : "Join OntoTrade and start your new investment experience!"}
        </div>
      </div>

      {/* CSS 애니메이션 */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
