/**
 * PostHog 사용자 분석 설정
 */

import posthog from 'posthog-js';

/**
 * PostHog 초기화
 */
export function initPostHog() {
  if (!import.meta.env.VITE_POSTHOG_KEY) {
    console.warn('PostHog API 키가 설정되지 않았습니다.');
    return;
  }

  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',

    // 개발 환경에서는 추적 비활성화
    disabled: import.meta.env.VITE_APP_ENV === 'development',

    // 자동 캡처 설정
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,

    // 세션 녹화 설정 (프로덕션에서만)
    session_recording: {
      enabled: import.meta.env.VITE_APP_ENV === 'production',
      maskAllInputs: true,
      maskAllText: false,
      recordCrossOriginIframes: false,
    },

    // 개인정보 보호 설정
    respect_dnt: true,
    opt_out_capturing_by_default: false,

    // 로드된 라이브러리 확인
    loaded: posthog => {
      if (import.meta.env.VITE_APP_ENV === 'development') {
        posthog.debug();
      }
    },
  });

  console.log('PostHog 초기화 완료');
}

/**
 * 페이지 뷰 추적
 */
export function trackPageView(
  pageName: string,
  properties?: Record<string, any>
) {
  posthog.capture('$pageview', {
    $current_url: window.location.href,
    page_name: pageName,
    ...properties,
  });
}

/**
 * 커스텀 이벤트 추적
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  posthog.capture(eventName, properties);
}

/**
 * 사용자 식별
 */
export function identifyUser(
  userId: string,
  userProperties?: Record<string, any>
) {
  posthog.identify(userId, userProperties);
}

/**
 * 사용자 속성 설정
 */
export function setUserProperties(properties: Record<string, any>) {
  posthog.people.set(properties);
}

/**
 * A/B 테스트 기능 플래그 확인
 */
export function getFeatureFlag(flagKey: string): boolean | string {
  return posthog.getFeatureFlag(flagKey);
}

/**
 * 그룹 설정 (조직, 팀 등)
 */
export function setGroup(
  groupType: string,
  groupKey: string,
  groupProperties?: Record<string, any>
) {
  posthog.group(groupType, groupKey, groupProperties);
}

/**
 * 이벤트 추적 헬퍼 함수들
 */
export const analytics = {
  // 인증 관련
  trackSignUp: (method: string) => trackEvent('user_signed_up', { method }),
  trackSignIn: (method: string) => trackEvent('user_signed_in', { method }),
  trackSignOut: () => trackEvent('user_signed_out'),

  // 온톨로지 관련
  trackOntologyCreated: (ontologyType: string) =>
    trackEvent('ontology_created', { ontology_type: ontologyType }),
  trackOntologyViewed: (ontologyId: string) =>
    trackEvent('ontology_viewed', { ontology_id: ontologyId }),
  trackOntologyShared: (ontologyId: string, method: string) =>
    trackEvent('ontology_shared', { ontology_id: ontologyId, method }),

  // 거래 관련
  trackTradeInitiated: (tradeType: string, amount: number) =>
    trackEvent('trade_initiated', { trade_type: tradeType, amount }),
  trackTradeCompleted: (tradeId: string, amount: number) =>
    trackEvent('trade_completed', { trade_id: tradeId, amount }),

  // 검색 관련
  trackSearch: (query: string, resultsCount: number) =>
    trackEvent('search_performed', { query, results_count: resultsCount }),
  trackFilterUsed: (filterType: string, filterValue: string) =>
    trackEvent('filter_used', {
      filter_type: filterType,
      filter_value: filterValue,
    }),

  // UI 인터랙션
  trackButtonClick: (buttonName: string, location: string) =>
    trackEvent('button_clicked', { button_name: buttonName, location }),
  trackModalOpened: (modalName: string) =>
    trackEvent('modal_opened', { modal_name: modalName }),
  trackFormSubmitted: (formName: string) =>
    trackEvent('form_submitted', { form_name: formName }),
};

/**
 * PostHog 리셋 (로그아웃 시 사용)
 */
export function resetPostHog() {
  posthog.reset();
}
