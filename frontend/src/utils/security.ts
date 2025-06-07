/**
 * 보안 관련 유틸리티 함수들
 */

// CSRF 토큰 생성
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// CSRF 토큰 검증
export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return token === storedToken;
};

// XSS 방지를 위한 HTML 이스케이프
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// 안전한 외부 링크 열기
export const openExternalLink = (url: string): void => {
  const newWindow = window.open();
  if (newWindow) {
    newWindow.opener = null;
    newWindow.location = url;
  }
};

// 입력값 검증
export const validateInput = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  password: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('비밀번호는 최소 8자 이상이어야 합니다.');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('비밀번호에는 소문자가 포함되어야 합니다.');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('비밀번호에는 대문자가 포함되어야 합니다.');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('비밀번호에는 숫자가 포함되어야 합니다.');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('비밀번호에는 특수문자(@$!%*?&)가 포함되어야 합니다.');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  url: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};

// 세션 보안
export const sessionSecurity = {
  // 세션 타임아웃 체크 (밀리초 단위)
  isSessionExpired: (lastActivity: number, timeoutMs: number = 30 * 60 * 1000): boolean => {
    return Date.now() - lastActivity > timeoutMs;
  },
  
  // 활동 시간 업데이트
  updateLastActivity: (): void => {
    localStorage.setItem('lastActivity', Date.now().toString());
  },
  
  // 마지막 활동 시간 가져오기
  getLastActivity: (): number => {
    const lastActivity = localStorage.getItem('lastActivity');
    return lastActivity ? parseInt(lastActivity, 10) : Date.now();
  },
  
  // 세션 데이터 안전하게 삭제
  clearSession: (): void => {
    localStorage.removeItem('lastActivity');
    sessionStorage.clear();
  }
};

// 파일 업로드 보안
export const fileUploadSecurity = {
  // 허용된 파일 타입 체크
  isAllowedFileType: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
  },
  
  // 파일 크기 체크
  isFileSizeValid: (file: File, maxSizeBytes: number): boolean => {
    return file.size <= maxSizeBytes;
  },
  
  // 이미지 파일 검증
  validateImageFile: (file: File): { isValid: boolean; error?: string } => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!fileUploadSecurity.isAllowedFileType(file, allowedTypes)) {
      return { isValid: false, error: '허용되지 않는 파일 형식입니다. JPEG, PNG, GIF, WebP만 지원됩니다.' };
    }
    
    if (!fileUploadSecurity.isFileSizeValid(file, maxSize)) {
      return { isValid: false, error: '파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.' };
    }
    
    return { isValid: true };
  }
};

// 브라우저 보안 정보
export const browserSecurity = {
  // HTTPS 연결 확인
  isHTTPS: (): boolean => {
    return window.location.protocol === 'https:';
  },
  
  // 안전한 컨텍스트 확인
  isSecureContext: (): boolean => {
    return window.isSecureContext;
  },
  
  // CSP 위반 리포트
  reportCSPViolation: (violationDetails: string): void => {
    console.warn('CSP Violation:', violationDetails);
    // 실제 환경에서는 서버로 리포트 전송
  }
};
