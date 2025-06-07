import React from "react";

export interface ListItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  active?: boolean;
  disabled?: boolean;
  clickable?: boolean;
}

export function ListItem({
  children,
  onClick,
  className = "",
  active = false,
  disabled = false,
  clickable = false,
}: ListItemProps) {
  return (
    <li
      className={`
        px-4 py-3 border-b border-gray-200 last:border-b-0
        ${onClick && !disabled ? "cursor-pointer hover:bg-gray-50" : ""}
        ${active ? "bg-blue-50 border-blue-200" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${clickable ? "cursor-pointer" : ""}
        transition-colors
        ${className}
      `}
      onClick={!disabled ? onClick : undefined}
    >
      {children}
    </li>
  );
}

export interface ListProps {
  children: React.ReactNode;
  className?: string;
  bordered?: boolean;
  divided?: boolean;
  clickable?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  maxHeight?: string;
}

export function List({
  children,
  className = "",
  bordered = true,
  divided = false,
  clickable = false,
  loading = false,
  emptyMessage = "항목이 없습니다.",
  maxHeight,
}: ListProps) {
  const childrenArray = React.Children.toArray(children);

  if (loading) {
    return (
      <div
        className={`${bordered ? "border border-gray-200 rounded-lg" : ""} ${className}`}
      >
        <ul className="divide-y divide-gray-200">
          {[...Array(5)].map((_, i) => (
            <li key={i} className="px-4 py-3 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div
      className={`
        ${bordered ? "border border-gray-200 rounded-lg" : ""}
        ${maxHeight ? "overflow-y-auto" : ""}
        ${className}
      `}
      style={maxHeight ? { maxHeight } : undefined}
    >
      {childrenArray.length === 0 ? (
        <div className="px-4 py-8 text-center text-gray-500">
          {emptyMessage}
        </div>
      ) : (
        <ul
          className={`${divided ? "divide-y divide-gray-200" : ""} ${clickable ? "cursor-pointer" : ""}`}
        >
          {children}
        </ul>
      )}
    </div>
  );
}

// 특수한 형태의 리스트 컴포넌트들
export interface DataListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
  onItemClick?: (item: T, index: number) => void;
}

export function DataList<T>({
  data,
  renderItem,
  keyExtractor,
  className = "",
  loading = false,
  emptyMessage = "데이터가 없습니다.",
  onItemClick,
}: DataListProps<T>) {
  return (
    <List className={className} loading={loading} emptyMessage={emptyMessage}>
      {data.map((item, index) => (
        <ListItem
          key={keyExtractor(item, index)}
          onClick={onItemClick ? () => onItemClick(item, index) : undefined}
        >
          {renderItem(item, index)}
        </ListItem>
      ))}
    </List>
  );
}

// 간단한 텍스트 리스트
export interface SimpleListProps {
  items: string[];
  className?: string;
  onItemClick?: (item: string, index: number) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function SimpleList({
  items,
  className = "",
  onItemClick,
  loading = false,
  emptyMessage = "항목이 없습니다.",
}: SimpleListProps) {
  return (
    <List className={className} loading={loading} emptyMessage={emptyMessage}>
      {items.map((item, index) => (
        <ListItem
          key={index}
          onClick={onItemClick ? () => onItemClick(item, index) : undefined}
        >
          {item}
        </ListItem>
      ))}
    </List>
  );
}

export default List;
