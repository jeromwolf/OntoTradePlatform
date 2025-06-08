/**
 * 공통 API 유틸리티 함수들
 * OntoTradePlatform - Common API Utilities
 */

import { supabase } from "../lib/supabase";

// API 인증 헤더 가져오기
export const getAuthHeaders = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("인증이 필요합니다.");
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
};

// API 요청 래퍼 함수
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const headers = await getAuthHeaders();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API 요청 실패: ${response.status}`);
  }

  return response.json();
};

// 기본 API URL
export const API_BASE_URL = "http://127.0.0.1:8000/api";
