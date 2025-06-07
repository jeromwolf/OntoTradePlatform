import React from "react";
import { cn } from "@/utils/cn";
import { Header } from "./Navigation";

// 메인 레이아웃 컴포넌트 (와이어프레임 기반)
interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      <Header />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
};

// 그리드 컨테이너 (대시보드용)
interface GridContainerProps {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  className?: string;
}

export const GridContainer: React.FC<GridContainerProps> = ({
  children,
  columns = 3,
  gap = 6,
  className,
}) => {
  return (
    <div
      className={cn(
        `grid gap-${gap}`,
        columns === 2 && "grid-cols-1 md:grid-cols-2",
        columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
};

// 섹션 헤더 (와이어프레임의 각 영역 타이틀)
interface SectionHeaderProps {
  title: string;
  emoji?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  emoji,
  action,
  className,
}) => {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
        {emoji && <span className="text-2xl">{emoji}</span>}
        {title}
      </h2>
      {action && <div>{action}</div>}
    </div>
  );
};

// 사이드바 (와이어프레임의 좌측 패널)
interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ children, className }) => {
  return (
    <aside
      className={cn("w-64 bg-white rounded-lg shadow-sm p-4 h-fit", className)}
    >
      {children}
    </aside>
  );
};

// 메인 컨텐츠 영역
interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export const MainContent: React.FC<MainContentProps> = ({
  children,
  className,
}) => {
  return <div className={cn("flex-1 space-y-6", className)}>{children}</div>;
};

// 대시보드 레이아웃 (사이드바 + 메인)
interface DashboardLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  sidebar,
  children,
  className,
}) => {
  return (
    <Layout className={className}>
      <div className="flex gap-6">
        <Sidebar>{sidebar}</Sidebar>
        <MainContent>{children}</MainContent>
      </div>
    </Layout>
  );
};
