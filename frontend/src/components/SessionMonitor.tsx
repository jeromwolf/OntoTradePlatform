import React, { useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { sessionSecurity } from "../utils/security";

/**
 * 세션 활동 모니터링 컴포넌트
 * 사용자 활동을 추적하고 비활성 시 자동 로그아웃
 */
const SessionMonitor: React.FC = () => {
  const { user, signOut } = useAuth();

  const updateActivity = useCallback(() => {
    if (user) {
      sessionSecurity.updateLastActivity();
    }
  }, [user]);

  const checkSessionExpiry = useCallback(async () => {
    if (!user) return;

    const lastActivity = sessionSecurity.getLastActivity();
    const isExpired = sessionSecurity.isSessionExpired(lastActivity);

    if (isExpired) {
      alert("세션이 만료되었습니다. 다시 로그인해주세요.");
      await signOut();
    }
  }, [user, signOut]);

  useEffect(() => {
    if (!user) return;

    // 사용자 활동 이벤트 리스너 등록
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // 이벤트 핸들러
    const handleActivity = () => {
      updateActivity();
    };

    // 이벤트 리스너 등록
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // 세션 만료 체크 (5분마다)
    const sessionCheckInterval = setInterval(checkSessionExpiry, 5 * 60 * 1000);

    // 페이지 가시성 변경 감지
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // 페이지가 다시 활성화되면 세션 체크
        checkSessionExpiry();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 컴포넌트 언마운트 시 정리
    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearInterval(sessionCheckInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, updateActivity, checkSessionExpiry]);

  // 이 컴포넌트는 UI를 렌더링하지 않음 (모니터링만)
  return null;
};

export default SessionMonitor;
