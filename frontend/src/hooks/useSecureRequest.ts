import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
}

interface RequestState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * 보안이 강화된 API 요청을 위한 커스텀 훅
 */
export const useSecureRequest = <T = any>() => {
  const { session, refreshToken } = useAuth();
  const [state, setState] = useState<RequestState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const executeRequest = useCallback(
    async (url: string, options: RequestOptions = {}): Promise<T | null> => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        // 세션이 없으면 에러
        if (!session?.access_token) {
          throw new Error('인증되지 않은 사용자입니다.');
        }

        // 토큰 만료 체크 및 자동 갱신
        if (session.expires_at && session.expires_at * 1000 < Date.now()) {
          try {
            await refreshToken();
          } catch (refreshError) {
            throw new Error('토큰 갱신에 실패했습니다. 다시 로그인해주세요.');
          }
        }

        // 보안 헤더 설정
        const secureHeaders = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'X-Requested-With': 'XMLHttpRequest', // CSRF 보호
          'X-Content-Type-Options': 'nosniff', // MIME 타입 스니핑 방지
          ...options.headers,
        };

        // Supabase 요청인 경우 Supabase 클라이언트 사용
        if (url.startsWith('/supabase/')) {
          const supabaseUrl = url.replace('/supabase/', '');
          const response = await supabase
            .from(supabaseUrl)
            .select('*');
          
          if (response.error) throw response.error;
          
          setState(prev => ({ ...prev, data: response.data as T, loading: false }));
          return response.data as T;
        }

        // 일반 HTTP 요청
        const fetchOptions: RequestInit = {
          method: options.method || 'GET',
          headers: secureHeaders,
          credentials: 'include', // 쿠키 포함
          mode: 'cors',
        };

        if (options.body && options.method !== 'GET') {
          fetchOptions.body = JSON.stringify(options.body);
        }

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setState(prev => ({ ...prev, data, loading: false }));
        return data;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
        setState(prev => ({ ...prev, error: errorMessage, loading: false }));
        throw error;
      }
    },
    [session, refreshToken]
  );

  // Supabase 특화 메서드들
  const supabaseRequest = {
    // 테이블에서 데이터 조회
    select: useCallback(async (tableName: string, query?: any) => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        let supabaseQuery = supabase.from(tableName).select('*');
        
        if (query) {
          Object.keys(query).forEach(key => {
            supabaseQuery = supabaseQuery.eq(key, query[key]);
          });
        }
        
        const { data, error } = await supabaseQuery;
        
        if (error) throw error;
        
        setState(prev => ({ ...prev, data: data as T, loading: false }));
        return data as T;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '데이터 조회 중 오류가 발생했습니다.';
        setState(prev => ({ ...prev, error: errorMessage, loading: false }));
        throw error;
      }
    }, []),

    // 테이블에 데이터 삽입
    insert: useCallback(async (tableName: string, data: any) => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const { data: insertedData, error } = await supabase
          .from(tableName)
          .insert(data)
          .select();
        
        if (error) throw error;
        
        setState(prev => ({ ...prev, data: insertedData as T, loading: false }));
        return insertedData as T;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '데이터 삽입 중 오류가 발생했습니다.';
        setState(prev => ({ ...prev, error: errorMessage, loading: false }));
        throw error;
      }
    }, []),

    // 테이블의 데이터 업데이트
    update: useCallback(async (tableName: string, data: any, query: any) => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        let supabaseQuery = supabase.from(tableName).update(data);
        
        Object.keys(query).forEach(key => {
          supabaseQuery = supabaseQuery.eq(key, query[key]);
        });
        
        const { data: updatedData, error } = await supabaseQuery.select();
        
        if (error) throw error;
        
        setState(prev => ({ ...prev, data: updatedData as T, loading: false }));
        return updatedData as T;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '데이터 업데이트 중 오류가 발생했습니다.';
        setState(prev => ({ ...prev, error: errorMessage, loading: false }));
        throw error;
      }
    }, []),

    // 테이블에서 데이터 삭제
    delete: useCallback(async (tableName: string, query: any) => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        let supabaseQuery = supabase.from(tableName).delete();
        
        Object.keys(query).forEach(key => {
          supabaseQuery = supabaseQuery.eq(key, query[key]);
        });
        
        const { error } = await supabaseQuery;
        
        if (error) throw error;
        
        setState(prev => ({ ...prev, data: null, loading: false }));
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '데이터 삭제 중 오류가 발생했습니다.';
        setState(prev => ({ ...prev, error: errorMessage, loading: false }));
        throw error;
      }
    }, [])
  };

  return {
    ...state,
    executeRequest,
    supabaseRequest,
    // 상태 초기화
    reset: () => setState({ data: null, loading: false, error: null }),
  };
};
