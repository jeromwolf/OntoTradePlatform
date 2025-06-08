/**
 * 로그인 페이지 - 와이어프레임 기반 리디자인
 */

import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export const LoginPage: React.FC = () => {
  const { signIn, signInWithGoogle, signInWithFacebook, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError(language === 'ko' ? "이메일과 비밀번호를 입력해주세요." : "Please enter email and password.");
      return;
    }

    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || (language === 'ko' ? "로그인에 실패했습니다." : "Login failed."));
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || (language === 'ko' ? "Google 로그인에 실패했습니다." : "Google login failed."));
    }
  };

  const handleFacebookLogin = async () => {
    setError("");
    try {
      await signInWithFacebook();
    } catch (err: any) {
      setError(err.message || (language === 'ko' ? "Facebook 로그인에 실패했습니다." : "Facebook login failed."));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* 언어 선택 버튼 */}
        <div className="flex justify-end mb-6">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setLanguage('ko')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                language === 'ko' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🇰🇷 한국어
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                language === 'en' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🇺🇸 English
            </button>
          </div>
        </div>

        {/* 로고 및 헤더 */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-white mb-2">
            ⚡ OntoTrade
          </div>
          <p className="text-gray-400">
            {language === 'ko' ? '증권 온톨로지 플랫폼' : 'Securities Ontology Platform'}
          </p>
        </div>

        {/* 로그인 폼 카드 */}
        <div className="bg-gray-800 rounded-lg p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            {language === 'ko' ? '로그인' : 'Login'}
          </h2>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-md mb-6">
              <div className="flex items-center gap-2">
                <span>❌</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* 이메일 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                📧 {language === 'ko' ? '이메일' : 'Email'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder={language === 'ko' ? '이메일을 입력하세요' : 'Enter your email'}
                required
              />
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                🔒 {language === 'ko' ? '비밀번호' : 'Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder={language === 'ko' ? '비밀번호를 입력하세요' : 'Enter your password'}
                required
              />
            </div>

            {/* 로그인 상태 유지 */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-300">
                {language === 'ko' ? '로그인 상태 유지' : 'Remember me'}
              </label>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {language === 'ko' ? '로그인 중...' : 'Logging in...'}
                </>
              ) : (
                <>
                  🚀 {language === 'ko' ? '로그인 하기' : 'Login'}
                </>
              )}
            </button>

            {/* 비밀번호 찾기 및 회원가입 링크 */}
            <div className="flex items-center justify-between text-sm">
              <Link
                to="/reset-password"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                {language === 'ko' ? '비밀번호 찾기' : 'Forgot Password'}
              </Link>
              <span className="text-gray-500">|</span>
              <Link
                to="/signup"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                {language === 'ko' ? '회원가입' : 'Sign Up'}
              </Link>
            </div>
          </form>

          {/* 소셜 로그인 섹션 */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">
                  {language === 'ko' ? '──── 또는 소셜 로그인 ────' : '──── or social login ────'}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {/* Google 로그인 */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-600 rounded-lg shadow-sm bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="text-lg">🔍</span>
                <span className="ml-2 hidden sm:block">Google</span>
              </button>

              {/* Apple 로그인 */}
              <button
                type="button"
                onClick={handleFacebookLogin}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-600 rounded-lg shadow-sm bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="text-lg">🍎</span>
                <span className="ml-2 hidden sm:block">Apple</span>
              </button>

              {/* Kakao 로그인 */}
              <button
                type="button"
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-600 rounded-lg shadow-sm bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="text-lg">💬</span>
                <span className="ml-2 hidden sm:block">Kakao</span>
              </button>
            </div>
          </div>
        </div>

        {/* 하단 안내 */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>
            {language === 'ko' 
              ? '🎮 가상 투자 환경에서 안전하게 거래 연습을 시작하세요!' 
              : '🎮 Start practicing trading safely in a virtual investment environment!'
            }
          </p>
        </div>
      </div>
    </div>
  );
};
