import { useState, useEffect, useMemo, type FC } from "react";
import { type StockData } from "../services/simulationApi";

interface StockSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockData: Record<string, StockData>;
  onSelectStock: (symbol: string) => void;
  language: "ko" | "en";
}

const StockSearchModal: FC<StockSearchModalProps> = ({
  isOpen,
  onClose,
  stockData,
  onSelectStock,
  language,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const t = (ko: string, en: string) => (language === "ko" ? ko : en);

  // 모달이 열릴 때 검색어 초기화
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  // 검색 및 필터링된 종목 목록
  const filteredStocks = useMemo(() => {
    try {
      // 디버깅: stockData 상태 로깅
      console.log("StockData in filter:", stockData);
      console.log("SearchTerm:", searchTerm);
      
      // stockData가 없거나 빈 객체인 경우 빈 배열 반환
      if (!stockData || Object.keys(stockData).length === 0) {
        console.log("No stockData available");
        return [];
      }

      let stocks = Object.entries(stockData);

      // 검색 필터
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        stocks = stocks.filter(
          ([symbol, stock]) => {
            // stock 객체와 필수 속성들이 존재하는지 확인
            if (!stock || !stock.name || !symbol) {
              return false;
            }
            return (
              symbol.toLowerCase().includes(term) ||
              stock.name.toLowerCase().includes(term)
            );
          },
        );
      }

      // 정렬 (종목명만 사용)
      stocks.sort(([, stockA], [, stockB]) => {
        // stock 객체들이 유효한지 확인
        if (!stockA || !stockB) return 0;
        
        const valueA = stockA.name || "";
        const valueB = stockB.name || "";

        return sortOrder === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      });

      return stocks;
    } catch (error) {
      console.error("Error filtering stocks:", error);
      return [];
    }
  }, [stockData, searchTerm, sortOrder]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          background: "#0a0e27",
          borderRadius: "12px",
          padding: "24px",
          width: "100%",
          maxWidth: "800px",
          maxHeight: "80vh",
          border: "1px solid #1e293b",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 헤더 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0, color: "#60a5fa", fontSize: "20px" }}>
            🔍 {t("종목 검색", "Stock Search")}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              fontSize: "24px",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            ✕
          </button>
        </div>

        {/* 검색 및 필터 */}
        <div style={{ marginBottom: "20px" }}>
          {/* 검색창 */}
          <div style={{ marginBottom: "16px" }}>
            <input
              type="text"
              placeholder={t(
                "종목명 또는 코드로 검색...",
                "Search by name or symbol...",
              )}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid #1e293b",
                background: "#131629",
                color: "#e2e8f0",
                fontSize: "14px",
                outline: "none",
              }}
              autoFocus
            />
          </div>

          {/* 필터 및 정렬 - 심플하게 변경 */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {/* 정렬 순서만 유지 */}
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #1e293b",
                background: "#131629",
                color: "#94a3b8",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {sortOrder === "asc" ? "▲" : "▼"} {t("정렬", "Sort")}
            </button>
          </div>
        </div>

        {/* 종목 목록 */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            border: "1px solid #1e293b",
            borderRadius: "8px",
          }}
        >
          {!stockData ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#94a3b8",
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "12px" }}>📊</div>
              {t("주식 데이터를 불러오는 중...", "Loading stock data...")}
            </div>
          ) : Object.keys(stockData).length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#94a3b8",
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "12px" }}>⚠️</div>
              {t("주식 데이터가 없습니다", "No stock data available")}
            </div>
          ) : filteredStocks.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#94a3b8",
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "12px" }}>🔍</div>
              {searchTerm 
                ? t(`"${searchTerm}"에 대한 검색 결과가 없습니다`, `No results found for "${searchTerm}"`)
                : t("해당 조건에 맞는 종목이 없습니다", "No stocks match the current filters")
              }
            </div>
          ) : (
            <div>
              {/* 헤더 */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "12px",
                  padding: "12px 16px",
                  background: "#131629",
                  borderBottom: "1px solid #1e293b",
                  fontSize: "12px",
                  color: "#94a3b8",
                  fontWeight: "bold",
                }}
              >
                <div>{t("종목", "Stock")}</div>
              </div>

              {/* 종목 리스트 */}
              {filteredStocks.map(([symbol, stock]) => (
                <div
                  key={symbol}
                  onClick={() => {
                    onSelectStock(symbol);
                    onClose();
                  }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "12px",
                    padding: "12px 16px",
                    borderBottom: "1px solid #1e293b",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#0f172a";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {/* 종목명만 표시 */}
                  <div>
                    <div
                      style={{
                        fontWeight: "bold",
                        color: "#e2e8f0",
                        marginBottom: "2px",
                      }}
                    >
                      {stock.name}
                    </div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                      {symbol}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 정보 */}
        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            background: "#131629",
            borderRadius: "6px",
            fontSize: "12px",
            color: "#94a3b8",
            textAlign: "center",
          }}
        >
          {t(
            `총 ${filteredStocks.length}개 종목 표시 중`,
            `Showing ${filteredStocks.length} stocks`,
          )}
        </div>
      </div>
    </div>
  );
};

export default StockSearchModal;
