/**
 * 회원가입 페이지 - 와이어프레임 기반 리디자인
 */

import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

export const SignupPage: React.FC = () => {
  const { signUp, signInWithGoogle, signInWithFacebook, loading } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');
  
  // 약관 동의 상태
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // 유효성 검사
    if (!username || !email || !password || !confirmPassword) {
      setError(language === 'ko' ? "모든 필드를 입력해주세요." : "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError(language === 'ko' ? "비밀번호가 일치하지 않습니다." : "Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError(language === 'ko' ? "비밀번호는 최소 6자 이상이어야 합니다." : "Password must be at least 6 characters.");
      return;
    }

    if (!agreeTerms || !agreePrivacy) {
      setError(language === 'ko' ? "필수 약관에 동의해주세요." : "Please agree to the required terms.");
      return;
    }

    try {
      const result = await signUp(email, password);
      console.log("회원가입 결과:", result);
      setMessage(language === 'ko' ? "회원가입이 완료되었습니다! 이메일을 확인해주세요." : "Sign up completed! Please check your email.");
    } catch (err: any) {
      console.error("회원가입 오류 상세:", err);
      setError(err.message || (language === 'ko' ? "회원가입에 실패했습니다." : "Sign up failed."));
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || (language === 'ko' ? "Google 회원가입에 실패했습니다." : "Google sign up failed."));
    }
  };

  const handleFacebookSignup = async () => {
    setError("");
    try {
      await signInWithFacebook();
    } catch (err: any) {
      setError(err.message || (language === 'ko' ? "Facebook 회원가입에 실패했습니다." : "Facebook sign up failed."));
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

        {/* 회원가입 폼 카드 */}
        <div className="bg-gray-800 rounded-lg p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            {language === 'ko' ? '회원가입' : 'Sign Up'}
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

          {/* 성공 메시지 */}
          {message && (
            <div className="bg-green-900/50 border border-green-500 text-green-300 px-4 py-3 rounded-md mb-6">
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>{message}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleEmailSignup} className="space-y-4">
            {/* 사용자명 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                👤 {language === 'ko' ? '사용자명' : 'Username'}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder={language === 'ko' ? '사용자명을 입력하세요' : 'Enter your username'}
                required
              />
            </div>

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

            {/* 비밀번호 확인 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                🔒 {language === 'ko' ? '비밀번호 확인' : 'Confirm Password'}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder={language === 'ko' ? '비밀번호를 다시 입력하세요' : 'Confirm your password'}
                required
              />
            </div>

            {/* 약관 동의 체크박스 */}
            <div className="space-y-3 mt-6">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2 mt-1"
                />
                <label htmlFor="agreeTerms" className="ml-3 text-sm text-gray-300">
                  📋 {language === 'ko' ? '이용약관 동의 (필수)' : 'Agree to Terms of Service (Required)'}
                  <Link to="/terms" className="ml-2 text-blue-400 hover:text-blue-300 underline">
                    {language === 'ko' ? '보기' : 'View'}
                  </Link>
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agreePrivacy"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2 mt-1"
                />
                <label htmlFor="agreePrivacy" className="ml-3 text-sm text-gray-300">
                  🔐 {language === 'ko' ? '개인정보처리방침 동의 (필수)' : 'Agree to Privacy Policy (Required)'}
                  <Link to="/privacy" className="ml-2 text-blue-400 hover:text-blue-300 underline">
                    {language === 'ko' ? '보기' : 'View'}
                  </Link>
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agreeMarketing"
                  checked={agreeMarketing}
                  onChange={(e) => setAgreeMarketing(e.target.checked)}
                  className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2 mt-1"
                />
                <label htmlFor="agreeMarketing" className="ml-3 text-sm text-gray-300">
                  📨 {language === 'ko' ? '마케팅 정보 수신 동의 (선택)' : 'Agree to Marketing Information (Optional)'}
                </label>
              </div>
            </div>

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {language === 'ko' ? '가입 중...' : 'Signing up...'}
                </>
              ) : (
                <>
                  🎉 {language === 'ko' ? '가입하기' : 'Sign Up'}
                </>
              )}
            </button>

            {/* 로그인 링크 */}
            <div className="text-center text-sm mt-4">
              <span className="text-gray-400">
                {language === 'ko' ? '이미 계정이 있나요?' : 'Already have an account?'}
              </span>{' '}
              <Link
                to="/login"
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                {language === 'ko' ? '로그인' : 'Login'}
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
                  {language === 'ko' ? '──── 또는 소셜 가입 ────' : '──── or social sign up ────'}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {/* Google 회원가입 */}
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-600 rounded-lg shadow-sm bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="text-lg">🔍</span>
                <span className="ml-2 hidden sm:block">Google</span>
              </button>

              {/* Apple 회원가입 */}
              <button
                type="button"
                onClick={handleFacebookSignup}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-600 rounded-lg shadow-sm bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="text-lg">🍎</span>
                <span className="ml-2 hidden sm:block">Apple</span>
              </button>

              {/* Kakao 회원가입 */}
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
              ? '🚀 OntoTrade에 가입하고 새로운 투자 경험을 시작하세요!' 
              : '🚀 Join OntoTrade and start your new investment experience!'
            }
          </p>
        </div>
      </div>
    </div>
  );
};
