/**
 * 로그인 페이지 - 대시보드/시뮬레이션 페이지와 통일된 스타일로 업데이트
 */

import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const { signIn, signInWithGoogle, signInWithFacebook, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState<"ko" | "en">("ko");

  // Event handlers
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError(
        language === "ko"
          ? "이메일과 비밀번호를 입력해주세요."
          : "Please enter email and password.",
      );
      return;
    }

    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.message ||
          (language === "ko" ? "로그인에 실패했습니다." : "Login failed."),
      );
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.message ||
          (language === "ko"
            ? "Google 로그인에 실패했습니다."
            : "Google login failed."),
      );
    }
  };

  const handleFacebookLogin = async () => {
    setError("");
    try {
      await signInWithFacebook();
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.message ||
          (language === "ko"
            ? "Facebook 로그인에 실패했습니다."
            : "Facebook login failed."),
      );
    }
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.outline = "none";
    e.target.style.borderColor = styles.inputFocus.borderColor as string;
    e.target.style.boxShadow = styles.inputFocus.boxShadow as string;
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = styles.input.border as string;
    e.target.style.boxShadow = "none";
  };

  // 스타일 상수
  const styles = {
    page: {
      minHeight: "100vh",
      background: "#0a0e27",
      color: "#e2e8f0",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    },
    container: {
      width: "100%",
      maxWidth: "420px",
    },
    languageSwitcher: {
      display: "flex",
      justifyContent: "flex-end",
      marginBottom: "24px",
    },
    languageButton: (active: boolean) => ({
      padding: "6px 12px",
      borderRadius: "6px",
      background: active ? "#2563eb" : "transparent",
      color: active ? "#ffffff" : "#94a3b8",
      border: "none",
      cursor: "pointer",
      fontWeight: 500,
      fontSize: "14px",
      marginLeft: "8px",
      transition: "all 0.2s",
    }),
    card: {
      background: "#131629",
      borderRadius: "12px",
      padding: "32px",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      border: "1px solid #1e293b",
    },
    header: {
      textAlign: "center",
      marginBottom: "28px",
    },
    logo: {
      fontSize: "28px",
      fontWeight: 800,
      color: "#60a5fa",
      marginBottom: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },
    subtitle: {
      color: "#94a3b8",
      fontSize: "14px",
    },
    title: {
      fontSize: "24px",
      fontWeight: 700,
      color: "#f8fafc",
      marginBottom: "24px",
    },
    error: {
      background: "rgba(220, 38, 38, 0.2)",
      border: "1px solid #fecaca",
      color: "#fecaca",
      padding: "12px",
      borderRadius: "8px",
      marginBottom: "20px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "14px",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    inputGroup: {
      marginBottom: "8px",
    },
    label: {
      display: "flex",
      marginBottom: "8px",
      color: "#e2e8f0",
      fontSize: "14px",
      fontWeight: 500,
      alignItems: "center",
      gap: "6px",
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      background: "#1e293b",
      border: "1px solid #334155",
      borderRadius: "8px",
      color: "#f8fafc",
      fontSize: "14px",
      transition: "border-color 0.2s, box-shadow 0.2s",
    },
    inputFocus: {
      outline: "none",
      borderColor: "#60a5fa",
      boxShadow: "0 0 0 3px rgba(96, 165, 250, 0.2)",
    },
    checkboxContainer: {
      display: "flex",
      alignItems: "center",
      margin: "16px 0 24px",
    },
    checkbox: {
      width: "16px",
      height: "16px",
      marginRight: "8px",
      accentColor: "#2563eb",
    },
    checkboxLabel: {
      color: "#cbd5e1",
      fontSize: "14px",
      cursor: "pointer",
    },
    submitButton: {
      width: "100%",
      padding: "14px",
      background: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: 600,
      cursor: "pointer",
      transition: "background 0.2s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },
    submitButtonHover: {
      background: "#1d4ed8",
    },
    divider: {
      display: "flex",
      alignItems: "center",
      margin: "24px 0",
      color: "#475569",
    },
    dividerLine: {
      flex: 1,
      height: "1px",
      background: "#334155",
    },
    dividerText: {
      margin: "0 12px",
      fontSize: "14px",
      color: "#94a3b8",
    },
    socialButton: {
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #334155",
      background: "#1e293b",
      color: "#e2e8f0",
      fontSize: "14px",
      fontWeight: 500,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      transition: "background 0.2s, border-color 0.2s",
    },
    socialButtonHover: {
      background: "#334155",
      borderColor: "#475569",
    },
    footer: {
      textAlign: "center",
      marginTop: "24px",
      color: "#94a3b8",
      fontSize: "14px",
    },
    link: {
      color: "#60a5fa",
      textDecoration: "none",
      fontWeight: 500,
      marginLeft: "4px",
    },
    linkHover: {
      textDecoration: "underline",
    },
    loadingSpinner: {
      width: "16px",
      height: "16px",
      border: "2px solid rgba(255, 255, 255, 0.3)",
      borderRadius: "50%",
      borderTopColor: "#ffffff",
      animation: "spin 1s ease-in-out infinite",
    },
    forgotPassword: {
      color: "#60a5fa",
      fontSize: "14px",
      textDecoration: "none",
    },
  } as const;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* 언어 선택기 */}
        <div style={styles.languageSwitcher}>
          <button
            type="button"
            onClick={() => setLanguage("ko")}
            style={styles.languageButton(language === "ko")}
          >
            🇰🇷 한국어
          </button>
          <button
            type="button"
            onClick={() => setLanguage("en")}
            style={styles.languageButton(language === "en")}
          >
            🇺🇸 English
          </button>
        </div>

        {/* 로그인 카드 */}
        <div style={styles.card}>
          {/* 헤더 */}
          <div style={styles.header}>
            <h1 style={styles.logo}>
              <span>📈</span>
              {language === "ko" ? "온토트레이드" : "OntoTrade"}
            </h1>
            <p style={styles.subtitle}>
              {language === "ko"
                ? "지식 그래프 기반 AI 트레이딩 플랫폼"
                : "Knowledge Graph-based AI Trading Platform"}
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div style={styles.error}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* 폼 */}
          <form onSubmit={handleEmailLogin} style={styles.form}>
            {/* 이메일 입력 */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                📧 {language === "ko" ? "이메일" : "Email"}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                style={styles.input}
                placeholder={
                  language === "ko" ? "이메일을 입력하세요" : "Enter your email"
                }
                required
                disabled={loading}
              />
            </div>

            {/* 비밀번호 입력 */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                🔒 {language === "ko" ? "비밀번호" : "Password"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                style={styles.input}
                placeholder={
                  language === "ko"
                    ? "비밀번호를 입력하세요"
                    : "Enter your password"
                }
                required
                disabled={loading}
              />
            </div>

            {/* 로그인 상태 유지 & 비밀번호 찾기 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={styles.checkbox}
                  disabled={loading}
                />
                <label htmlFor="remember-me" style={styles.checkboxLabel}>
                  {language === "ko" ? "로그인 상태 유지" : "Remember me"}
                </label>
              </div>
              <a
                href="#"
                style={styles.forgotPassword}
                onClick={(e) => {
                  e.preventDefault();
                  // 비밀번호 찾기 로직
                }}
              >
                {language === "ko" ? "비밀번호 찾기" : "Forgot password?"}
              </a>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = styles.submitButtonHover
                    .background as string;
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = styles.submitButton
                  .background as string;
              }}
            >
              {loading ? (
                <>
                  <span style={styles.loadingSpinner}></span>
                  {language === "ko" ? "로그인 중..." : "Signing in..."}
                </>
              ) : (
                <>
                  <span>🔑</span>
                  <span>{language === "ko" ? "로그인" : "Sign in"}</span>
                </>
              )}
            </button>
          </form>

          {/* 소셜 로그인 구분선 */}
          <div style={styles.divider}>
            <div style={styles.dividerLine}></div>
            <div style={styles.dividerText}>
              {language === "ko" ? "또는 다음으로 계속" : "Or continue with"}
            </div>
            <div style={styles.dividerLine}></div>
          </div>

          {/* 소셜 로그인 버튼 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <button
              onClick={handleGoogleLogin}
              type="button"
              style={styles.socialButton}
              onMouseOver={(e) => {
                e.currentTarget.style.background = styles.socialButtonHover
                  .background as string;
                e.currentTarget.style.borderColor = styles.socialButtonHover
                  .borderColor as string;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = styles.socialButton
                  .background as string;
                e.currentTarget.style.borderColor = styles.socialButton
                  .border as string;
              }}
              disabled={loading}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ marginRight: "8px" }}
              >
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
              {language === "ko" ? "구글" : "Google"}
            </button>

            <button
              onClick={handleFacebookLogin}
              type="button"
              style={styles.socialButton}
              onMouseOver={(e) => {
                e.currentTarget.style.background = styles.socialButtonHover
                  .background as string;
                e.currentTarget.style.borderColor = styles.socialButtonHover
                  .borderColor as string;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = styles.socialButton
                  .background as string;
                e.currentTarget.style.borderColor = styles.socialButton
                  .border as string;
              }}
              disabled={loading}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="currentColor"
                style={{ marginRight: "8px" }}
              >
                <path
                  fillRule="evenodd"
                  d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                  clipRule="evenodd"
                />
              </svg>
              {language === "ko" ? "페이스북" : "Facebook"}
            </button>
          </div>
        </div>

        {/* 회원가입 링크 */}
        <div style={styles.footer}>
          {language === "ko" ? "계정이 없으신가요?" : "Don't have an account?"}
          <Link to="/signup" style={styles.link}>
            {language === "ko" ? " 회원가입" : " Sign up"}
          </Link>
        </div>
      </div>

      {/* 로딩 스피너 애니메이션 */}
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
};

export default LoginPage;
