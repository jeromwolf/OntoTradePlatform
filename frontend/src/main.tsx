import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { initSentry } from "./utils/sentry";
import { initPostHog } from "./utils/posthog";

// 모니터링 도구 초기화
initSentry();
initPostHog();

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
    <App />
  // </StrictMode>,
);
