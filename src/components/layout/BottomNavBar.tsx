"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Home,
  CalendarDays,
  BarChart2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavBarProps {
  currentBabyId?: string;
}

export function BottomNavBar({ currentBabyId }: BottomNavBarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const { status } = useSession();
  const isGuestMode = status === "unauthenticated";

  const isBabyIdAvailable = !!currentBabyId;

  // Helper to determine if a link is active
  // Home is active if we are on the baby page and no tab is selected (or tab is activities default)
  const isHomeActive = pathname === `/babies/${currentBabyId}` && (!tab || tab === 'activities');
  const isScheduleActive = tab === 'timeline';
  const isStatsActive = tab === 'analytics';
  const isFamilyActive = pathname.startsWith("/family");

  const navItems = [
    {
      href: `/babies/${currentBabyId}`,
      icon: Home,
      label: "홈",
      isActive: isHomeActive,
      disabled: !isBabyIdAvailable,
    },
    {
      href: `/babies/${currentBabyId}?tab=timeline`,
      icon: CalendarDays,
      label: "일정",
      isActive: isScheduleActive,
      disabled: !isBabyIdAvailable,
    },
    {
      href: `/babies/${currentBabyId}?tab=analytics`,
      icon: BarChart2,
      label: "통계",
      isActive: isStatsActive,
      disabled: !isBabyIdAvailable,
    },
    {
      href: "/family",
      icon: Users,
      label: "가족",
      isActive: isFamilyActive,
      disabled: false,
    },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 pb-safe-bottom bg-slate-900/80 backdrop-blur-2xl border-t border-white/5 shadow-[0_-8px_32px_rgba(0,0,0,0.4)]">
      <div className="flex h-16 items-center justify-around max-w-lg mx-auto px-2 relative">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 py-1 transition-all duration-300",
                item.disabled && "pointer-events-none opacity-20",
                !item.isActive && "hover:text-white active:scale-90"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-2xl transition-all duration-300 mb-0.5",
                item.isActive ? "bg-purple-500/20 text-purple-300 shadow-[0_0_15px_rgba(192,132,252,0.3)]" : "text-slate-500"
              )}>
                <Icon
                  className={cn(
                    "w-6 h-6 transition-transform duration-300",
                    item.isActive && "scale-110"
                  )}
                  strokeWidth={item.isActive ? 2.5 : 2}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold transition-colors duration-200 uppercase tracking-tighter",
                  item.isActive ? "text-purple-300" : "text-slate-500"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </footer>
  );
}
