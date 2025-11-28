"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  CalendarClock,
  Sparkles,
  BarChart3,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavBarProps {
  currentBabyId?: string;
}

const NavLink = ({ href, icon: Icon, label, isActive, disabled, isCenter = false }: { href: string, icon: React.ElementType, label: string, isActive: boolean, disabled: boolean, isCenter?: boolean }) => {
  if (isCenter) {
    return (
      <Link
        href={disabled ? "#" : href}
        className={cn(
          "flex items-center justify-center h-14 rounded-full bg-primary-foreground shadow-lg transition-transform active:scale-95 border-2 border-primary-foreground/50 px-4 -mt-8",
          disabled && "pointer-events-none opacity-60"
        )}
      >
        <Sparkles className="h-6 w-6 text-primary mr-2" />
        <span className="text-sm font-bold text-primary">{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={disabled ? "#" : href}
      className={cn(
        "flex flex-col items-center justify-center w-full h-full pt-2 pb-1 transition-all",
        disabled ? "pointer-events-none opacity-50" : "active:scale-95"
      )}
    >
      <Icon
        className={cn(
          "w-6 h-6 mb-1 transition-colors",
          isActive ? "text-primary-foreground" : "text-primary-foreground/70"
        )}
        strokeWidth={isActive ? 2.5 : 2}
      />
      <span
        className={cn(
          "text-xs font-semibold transition-colors",
          isActive ? "text-primary-foreground" : "text-primary-foreground/70"
        )}
      >
        {label}
      </span>
    </Link>
  );
};

export function BottomNavBar({ currentBabyId }: { currentBabyId?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');

  const isBabyIdAvailable = !!currentBabyId;

  const navItems: NavLinkProps[] = [
    {
      href: `/babies/${currentBabyId}`,
      icon: LayoutDashboard,
      label: "홈",
      isActive: pathname.startsWith('/babies/') && !tab,
      disabled: !isBabyIdAvailable,
    },
    {
      href: `/babies/${currentBabyId}?tab=timeline`,
      icon: CalendarClock,
      label: "일정",
      isActive: pathname.startsWith('/babies/') && tab === 'timeline',
      disabled: !isBabyIdAvailable,
    },
    {
      href: `/ai-chat/${currentBabyId}`,
      icon: Sparkles,
      label: "AI상담",
      isActive: pathname.startsWith("/ai-chat"),
      disabled: !isBabyIdAvailable,
      isCenter: true,
    },
    {
      href: `/analytics/${currentBabyId}`,
      icon: BarChart3,
      label: "통계",
      isActive: pathname.startsWith("/analytics"),
      disabled: !isBabyIdAvailable,
    },
    {
      href: "/family",
      icon: Users,
      label: "가족",
      isActive: pathname.startsWith("/family"),
      disabled: false,
    },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-primary">
      <div className="flex h-16 items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => (
          <div key={item.label} className="flex-1 flex justify-center items-center">
            <NavLink {...item} />
          </div>
        ))}
      </div>
    </footer>
  );
}
