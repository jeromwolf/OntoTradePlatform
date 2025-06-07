/**
 * 모니터링 도구 사용 예시 컴포넌트
 * 실제 프로젝트에서는 이런 방식으로 에러 추적과 분석을 구현합니다
 */

import React, { useState } from "react";
import { reportError, trackEvent } from "../utils/sentry";
import { analytics } from "../utils/posthog";

const MonitoringExample: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string>("");

  // 의도적으로 에러를 발생시켜 Sentry 테스트
  const triggerError = () => {
    try {
      throw new Error("테스트 에러입니다");
    } catch (error) {
      reportError(error as Error, {
        component: "MonitoringExample",
        action: "triggerError",
        timestamp: new Date().toISOString(),
      });
      setErrorMessage("에러가 발생했습니다! Sentry에 보고되었습니다.");
    }
  };

  // PostHog 이벤트 추적 테스트
  const trackTestEvent = () => {
    analytics.trackButtonClick("test-button", "monitoring-example");
    setErrorMessage("이벤트가 PostHog에 전송되었습니다!");
  };

  // 온톨로지 생성 시뮬레이션
  const simulateOntologyCreation = () => {
    const ontologyType = "investment-strategy";
    analytics.trackOntologyCreated(ontologyType);
    trackEvent("ontology_test_created", {
      type: ontologyType,
      timestamp: new Date().toISOString(),
    });
    setErrorMessage(`온톨로지 생성 이벤트가 추적되었습니다: ${ontologyType}`);
  };

  // 거래 시뮬레이션
  const simulateTrade = () => {
    const tradeData = {
      type: "buy",
      amount: 1000,
      asset: "ONTO-COIN",
    };

    analytics.trackTradeInitiated(tradeData.type, tradeData.amount);
    setErrorMessage(
      `거래 이벤트가 추적되었습니다: ${tradeData.type} ${tradeData.amount}`,
    );
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">모니터링 도구 테스트</h2>

      <div className="space-y-4">
        <button
          onClick={triggerError}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Sentry 에러 테스트
        </button>

        <button
          onClick={trackTestEvent}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          PostHog 이벤트 테스트
        </button>

        <button
          onClick={simulateOntologyCreation}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          온톨로지 생성 시뮬레이션
        </button>

        <button
          onClick={simulateTrade}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          거래 시뮬레이션
        </button>
      </div>

      {errorMessage && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm text-gray-700">{errorMessage}</p>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <h3 className="font-semibold">모니터링 정보:</h3>
        <ul className="mt-2 space-y-1">
          <li>• Sentry: 에러 추적 및 성능 모니터링</li>
          <li>• PostHog: 사용자 행동 분석</li>
          <li>• 실시간 이벤트 추적</li>
          <li>• 커스텀 메트릭 수집</li>
        </ul>
      </div>
    </div>
  );
};

export default MonitoringExample;
