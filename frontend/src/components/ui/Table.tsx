import React, { useState, useMemo } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

// Props 타입들 export
export interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  sortable?: boolean;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

export function Table<T extends Record<string, unknown>>({
  data,
  columns,
  className = "",
  sortable = true,
  onRowClick,
  loading = false,
  emptyMessage = "데이터가 없습니다.",
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      // 값이 없는 경우 처리
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // 타입 안전한 비교
      const aStr = String(aVal);
      const bStr = String(bVal);

      if (aStr < bStr) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aStr > bStr) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const handleSort = (columnKey: string) => {
    if (!sortable) return;

    setSortConfig((prevSort) => {
      if (prevSort?.key === columnKey) {
        return {
          key: columnKey,
          direction: prevSort.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key: columnKey, direction: "asc" };
    });
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return null;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUpIcon className="w-4 h-4" />
    ) : (
      <ChevronDownIcon className="w-4 h-4" />
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded mb-2"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  sortable && column.sortable !== false
                    ? "cursor-pointer hover:bg-gray-100"
                    : ""
                }`}
                style={{ width: column.width }}
                onClick={() =>
                  sortable &&
                  column.sortable !== false &&
                  handleSort(String(column.key))
                }
              >
                <div className="flex items-center gap-1">
                  {column.header}
                  {sortable &&
                    column.sortable !== false &&
                    getSortIcon(String(column.key))}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, index) => (
              <tr
                key={index}
                className={`${
                  onRowClick ? "cursor-pointer hover:bg-gray-50" : ""
                } transition-colors`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key] || "-")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
