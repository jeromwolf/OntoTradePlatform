/**
 * OntoTradePlatform 통합 디자인 시스템
 */

export const theme = {
  // 색상 팔레트
  colors: {
    // 배경색
    background: {
      primary: '#0a0e27',      // 메인 배경
      secondary: '#131629',     // 카드/컨테이너 배경
      tertiary: '#1e293b',      // 보더/구분선
    },
    
    // 텍스트 색상
    text: {
      primary: '#ffffff',       // 주요 텍스트
      secondary: '#e2e8f0',     // 일반 텍스트
      muted: '#94a3b8',         // 보조 텍스트
      disabled: '#64748b',      // 비활성 텍스트
    },
    
    // 브랜드 색상
    brand: {
      primary: '#3b82f6',       // 주요 브랜드 색상
      secondary: '#1d4ed8',     // 보조 브랜드 색상
      accent: '#06b6d4',        // 강조 색상
    },
    
    // 상태 색상
    status: {
      success: '#10b981',       // 성공/상승
      warning: '#f59e0b',       // 경고
      error: '#ef4444',         // 오류/하락
      info: '#3b82f6',          // 정보
    },
    
    // 그라데이션
    gradients: {
      primary: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      purple: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      teal: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    }
  },
  
  // 간격
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
  },
  
  // 타이포그래피
  typography: {
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    }
  },
  
  // 보더 반경
  borderRadius: {
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    full: '9999px',   // 완전한 원형
  },
  
  // 그림자
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  // 트랜지션
  transitions: {
    fast: '150ms ease-in-out',
    normal: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  }
};

export default theme;
