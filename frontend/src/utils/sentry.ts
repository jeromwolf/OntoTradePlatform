/**
 * Sentry 에러 추적 설정
 */

import * as Sentry from "@sentry/react";

/**
 * Sentry 초기화
 */
export function initSentry() {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.warn("Sentry DSN이 설정되지 않았습니다.");
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_APP_ENV || "development",
    integrations: [
      Sentry.browserTracingIntegration({
        // 페이지 로드 및 네비게이션 추적
        enableInp: true,
      }),
      Sentry.replayIntegration({
        // 세션 리플레이 (프로덕션에서만)
        maskAllText: import.meta.env.VITE_APP_ENV === "production",
        blockAllMedia: import.meta.env.VITE_APP_ENV === "production",
      }),
    ],

    // 성능 모니터링
    tracesSampleRate: import.meta.env.VITE_APP_ENV === "production" ? 0.1 : 1.0,

    // 세션 리플레이 샘플링
    replaysSessionSampleRate:
      import.meta.env.VITE_APP_ENV === "production" ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,

    // 민감한 정보 필터링
    beforeSend(event) {
      // 개발 환경에서는 모든 이벤트 허용
      if (import.meta.env.VITE_APP_ENV !== "production") {
        return event;
      }

      // 프로덕션에서는 민감한 정보 필터링
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (
          error?.value?.includes("password") ||
          error?.value?.includes("token")
        ) {
          return null; // 민감한 정보가 포함된 에러는 전송하지 않음
        }
      }

      return event;
    },

    // 에러 메시지 태그 추가
    initialScope: {
      tags: {
        component: "frontend",
      },
    },
  });

  console.log("Sentry 초기화 완료");
}

/**
 * 커스텀 에러 리포팅
 */
export function reportError(error: Error, context?: Record<string, any>) {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext("additional_info", context);
    }
    Sentry.captureException(error);
  });
}

/**
 * 사용자 정보 설정
 */
export function setUser(user: {
  id: string;
  email?: string;
  username?: string;
}) {
  Sentry.setUser(user);
}

/**
 * 커스텀 이벤트 추적
 */
export function trackEvent(event: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message: event,
    data,
    level: "info",
  });
}

/**
 * 에러 바운더리 HOC
 */
export const SentryErrorBoundary = Sentry.withErrorBoundary;
