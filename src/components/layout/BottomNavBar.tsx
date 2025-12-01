"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Home,
  CalendarDays,
  Sparkles,
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
  const isAIActive = tab === 'ai-chat' || pathname.startsWith('/ai-chat');
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
      href: isGuestMode ? '/ai-chat/guest-baby-id' : `/babies/${currentBabyId}?tab=ai-chat`,
      icon: Sparkles,
      label: "AI상담",
      isActive: isAIActive,
      disabled: !isGuestMode && !isBabyIdAvailable,
      isCenter: true,
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
    <footer className="fixed bottom-0 left-0 right-0 z-50 pb-safe-bottom bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)]">
      <div className="flex h-16 items-center justify-around max-w-lg mx-auto px-2 relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          if (item.isCenter) {
            return (
              <div key={item.label} className="relative -top-5 group">
                <Link
                  href={item.disabled ? "#" : item.href}
                  className={cn(
                    "flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 ease-out",
                    "bg-gradient-to-tr from-rose-400 to-orange-400 text-white",
                    "shadow-rose-300/40",
                    !item.isActive && "hover:scale-105 active:scale-95",
                    item.isActive && "ring-4 ring-rose-100 scale-105",
                    item.disabled && "opacity-50 cursor-not-allowed grayscale"
                  )}
                >
                  <Icon className="w-7 h-7" strokeWidth={2.5} />
                </Link>
                <span className={cn(
                  "absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold whitespace-nowrap transition-colors",
                  item.isActive ? "text-rose-500" : "text-gray-400"
                )}>
                  {item.label}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 py-1 transition-all duration-200",
                item.disabled && "pointer-events-none opacity-40",
                !item.isActive && "hover:text-gray-600 active:scale-95"
              )}
            >
              <div className={cn(
                "p-1 rounded-xl transition-all duration-300 mb-0.5",
                item.isActive ? "text-rose-500" : "text-gray-400"
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
                  "text-[10px] font-medium transition-colors duration-200",
                  item.isActive ? "text-rose-500 font-bold" : "text-gray-400"
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
