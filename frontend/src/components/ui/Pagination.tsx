import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  size?: "sm" | "md" | "lg";
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  size = "md",
}: PaginationProps) {
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisiblePages) {
      // 모든 페이지를 보여줄 수 있는 경우
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 페이지가 많은 경우 생략 표시와 함께
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(1, currentPage - halfVisible);
      let endPage = Math.min(totalPages, currentPage + halfVisible);

      // 시작 부분 조정
      if (endPage - startPage + 1 < maxVisiblePages) {
        if (startPage === 1) {
          endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        } else {
          startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
      }

      // 첫 페이지와 생략 표시
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push("...");
        }
      }

      // 중간 페이지들
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // 마지막 페이지와 생략 표시
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push("...");
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  const buttonClass = `
    inline-flex items-center justify-center min-w-[2.5rem] h-10
    border border-gray-300 bg-white text-gray-700
    hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
    transition-colors duration-200
    ${sizeClasses[size]}
  `;

  const activeButtonClass = `
    ${buttonClass}
    bg-blue-600 text-white border-blue-600 hover:bg-blue-700
  `;

  const disabledButtonClass = `
    ${buttonClass}
    opacity-50 cursor-not-allowed hover:bg-white
  `;

  const visiblePages = getVisiblePages();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className={`flex items-center justify-center space-x-1 ${className}`}
      aria-label="페이지네이션"
    >
      {/* 첫 페이지 버튼 */}
      {showFirstLast && (
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={currentPage === 1 ? disabledButtonClass : buttonClass}
          aria-label="첫 페이지"
        >
          ««
        </button>
      )}

      {/* 이전 페이지 버튼 */}
      {showPrevNext && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={currentPage === 1 ? disabledButtonClass : buttonClass}
          aria-label="이전 페이지"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
      )}

      {/* 페이지 번호들 */}
      {visiblePages.map((page, index) => {
        if (typeof page === "string") {
          return (
            <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
              {page}
            </span>
          );
        }

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={page === currentPage ? activeButtonClass : buttonClass}
            aria-label={`페이지 ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        );
      })}

      {/* 다음 페이지 버튼 */}
      {showPrevNext && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={
            currentPage === totalPages ? disabledButtonClass : buttonClass
          }
          aria-label="다음 페이지"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      )}

      {/* 마지막 페이지 버튼 */}
      {showFirstLast && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={
            currentPage === totalPages ? disabledButtonClass : buttonClass
          }
          aria-label="마지막 페이지"
        >
          »»
        </button>
      )}
    </nav>
  );
}

// 페이지 정보 표시 컴포넌트
export interface PageInfoProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  className?: string;
}

export function PageInfo({
  currentPage,
  totalPages: _totalPages,
  totalItems,
  itemsPerPage,
  className = "",
}: PageInfoProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`text-sm text-gray-700 ${className}`}>
      <span>
        총 <span className="font-medium">{totalItems}</span>개 중{" "}
        <span className="font-medium">{startItem}</span>-
        <span className="font-medium">{endItem}</span>개 표시
      </span>
    </div>
  );
}

// 페이지 크기 선택 컴포넌트
export interface PageSizeSelectProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  options?: number[];
  className?: string;
}

export function PageSizeSelect({
  pageSize,
  onPageSizeChange,
  options = [10, 20, 50, 100],
  className = "",
}: PageSizeSelectProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm text-gray-700">페이지당:</span>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((size) => (
          <option key={size} value={size}>
            {size}개
          </option>
        ))}
      </select>
    </div>
  );
}

export default Pagination;
