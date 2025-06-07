/**
 * 인증 컨텍스트
 */

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { sessionSecurity } from '../utils/security'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithFacebook: () => Promise<void>
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 초기 세션 확인
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // 인증 상태 변경 리스너 설정
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session: Session | null) => {
        console.log('Auth state changed:', event, session)
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // 토큰 만료 시 자동 새로고침 설정
        if (session?.access_token && session?.expires_at) {
          const expiresAt = session.expires_at * 1000; // Unix timestamp을 밀리초로 변환
          const now = Date.now();
          const timeUntilExpiry = expiresAt - now;
          
          // 토큰이 5분 후에 만료되면 자동으로 새로고침
          if (timeUntilExpiry > 300000) { // 5분 = 300,000ms
            setTimeout(() => {
              refreshTokenAutomatically();
            }, timeUntilExpiry - 300000);
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // 이메일/패스워드 로그인
  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
    } catch (error) {
      console.error('로그인 오류:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 회원가입
  const signUp = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      if (error) throw error
      console.log('Supabase signUp 응답:', data)
      return data
    } catch (error) {
      console.error('회원가입 오류:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 로그아웃
  const signOut = async () => {
    setLoading(true)
    try {
      // Supabase 로그아웃
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // 로컬 세션 데이터 완전 삭제
      sessionSecurity.clearSession()
      
      // 로컬 상태 초기화
      setUser(null)
      setSession(null)
      
      // 브라우저 캐시 및 스토리지 정리
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        )
      }
      
    } catch (error) {
      console.error('로그아웃 오류:', error)
      // 에러가 발생해도 로컬 데이터는 삭제
      sessionSecurity.clearSession()
      setUser(null)
      setSession(null)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Google 로그인
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Google 로그인 오류:', error)
      throw error
    }
  }

  // Facebook 로그인
  const signInWithFacebook = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Facebook 로그인 오류:', error)
      throw error
    }
  }

  // 토큰 자동 새로고침
  const refreshTokenAutomatically = async () => {
    try {
      const { error } = await supabase.auth.refreshSession()
      if (error) throw error
    } catch (error) {
      console.error('토큰 새로고침 오류:', error)
      throw error
    }
  }

  const refreshToken = async () => {
    await refreshTokenAutomatically()
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithFacebook,
    refreshToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}