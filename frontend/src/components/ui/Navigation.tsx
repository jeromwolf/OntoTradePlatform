import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/cn";

// Header 컴포넌트
export interface HeaderProps extends HTMLAttributes<HTMLDivElement> {
  logo?: string;
  logoText?: string;
}

const Header = forwardRef<HTMLDivElement, HeaderProps>(
  (
    { className, logo = "⚡", logoText = "OntoTrade", children, ...props },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between p-4 bg-white border-b border-slate-200 shadow-sm",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{logo}</span>
        <span className="text-xl font-bold text-slate-900">{logoText}</span>
      </div>
      {children}
    </div>
  ),
);
Header.displayName = "Header";

// NavLink 컴포넌트
export interface NavLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  href?: string;
  active?: boolean;
  emoji?: string;
  disabled?: boolean;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  (
    {
      className,
      href = "#",
      active = false,
      emoji,
      disabled = false,
      children,
      onClick,
      ...props
    },
    ref,
  ) => (
    <a
      ref={ref}
      href={disabled ? undefined : href}
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
        "hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
        active && "bg-blue-50 text-blue-700 border border-blue-200",
        disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
        !active && !disabled && "text-slate-700 hover:text-slate-900",
        className,
      )}
      onClick={disabled ? undefined : onClick}
      {...props}
    >
      {emoji && <span className="text-base">{emoji}</span>}
      {children}
    </a>
  ),
);
NavLink.displayName = "NavLink";

// MainNav 컴포넌트
export interface MainNavProps extends HTMLAttributes<HTMLNavElement> {
  links: Array<{
    href: string;
    emoji: string;
    label: string;
    active?: boolean;
    disabled?: boolean;
  }>;
}

const MainNav = forwardRef<HTMLNavElement, MainNavProps>(
  ({ className, links, ...props }, ref) => (
    <nav
      ref={ref}
      className={cn("flex items-center space-x-1", className)}
      {...props}
    >
      {links.map((link, index) => (
        <NavLink
          key={index}
          href={link.href}
          emoji={link.emoji}
          active={link.active}
          disabled={link.disabled}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  ),
);
MainNav.displayName = "MainNav";

// LanguageToggle 컴포넌트
export interface LanguageToggleProps extends HTMLAttributes<HTMLDivElement> {
  currentLang: "ko" | "en";
  onLanguageChange: (lang: "ko" | "en") => void;
}

const LanguageToggle = forwardRef<HTMLDivElement, LanguageToggleProps>(
  ({ className, currentLang, onLanguageChange, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex rounded-lg border border-slate-200 overflow-hidden",
        className,
      )}
      {...props}
    >
      <button
        className={cn(
          "px-3 py-1.5 text-xs font-medium transition-colors",
          currentLang === "ko"
            ? "bg-blue-600 text-white"
            : "bg-white text-slate-600 hover:bg-slate-50",
        )}
        onClick={() => onLanguageChange("ko")}
      >
        🇰🇷
      </button>
      <button
        className={cn(
          "px-3 py-1.5 text-xs font-medium transition-colors",
          currentLang === "en"
            ? "bg-blue-600 text-white"
            : "bg-white text-slate-600 hover:bg-slate-50",
        )}
        onClick={() => onLanguageChange("en")}
      >
        🇺🇸
      </button>
    </div>
  ),
);
LanguageToggle.displayName = "LanguageToggle";

// UserInfo 컴포넌트
export interface UserInfoProps extends HTMLAttributes<HTMLDivElement> {
  virtualMoney?: string;
  userName?: string;
  currentLang?: "ko" | "en";
  onLanguageChange?: (lang: "ko" | "en") => void;
}

const UserInfo = forwardRef<HTMLDivElement, UserInfoProps>(
  (
    {
      className,
      virtualMoney = "$10,000,000",
      userName = "투자자님",
      currentLang = "ko",
      onLanguageChange,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-4", className)}
      {...props}
    >
      {onLanguageChange && (
        <LanguageToggle
          currentLang={currentLang}
          onLanguageChange={onLanguageChange}
        />
      )}
      <div className="text-sm font-medium text-green-600 flex items-center gap-1">
        <span>💰</span>
        <span>가상자산 {virtualMoney}</span>
      </div>
      <div className="text-sm font-medium text-slate-700 flex items-center gap-1">
        <span>👤</span>
        <span>{userName}</span>
      </div>
    </div>
  ),
);
UserInfo.displayName = "UserInfo";

export { Header, NavLink, MainNav, LanguageToggle, UserInfo };
