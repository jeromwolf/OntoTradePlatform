import React from "react";
import { supabase } from "./lib/supabase";

export function TestAuth() {
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState<string>("");

  const testConnection = async () => {
    setLoading(true);
    try {
      console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
      console.log("Anon Key exists:", !!import.meta.env.VITE_SUPABASE_ANON_KEY);

      const { error } = await supabase.auth.getUser();
      if (error) {
        setStatus(`에러: ${error.message}`);
      } else {
        setStatus("Supabase 연결 성공! 현재 사용자 없음 (정상)");
      }
    } catch (err) {
      setStatus(`예외 발생: ${err}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Supabase 연결 테스트</h1>

        <div className="space-y-4">
          <div>
            <strong>환경변수 상태:</strong>
            <ul className="text-sm text-gray-600 mt-2">
              <li>URL: {import.meta.env.VITE_SUPABASE_URL || "❌ 없음"}</li>
              <li>
                Anon Key:{" "}
                {import.meta.env.VITE_SUPABASE_ANON_KEY
                  ? "✅ 설정됨"
                  : "❌ 없음"}
              </li>
            </ul>
          </div>

          <button
            onClick={testConnection}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "테스트 중..." : "Supabase 연결 테스트"}
          </button>

          {status && (
            <div className="p-3 bg-gray-100 rounded text-sm">{status}</div>
          )}
        </div>
      </div>
    </div>
  );
}
