// src/components/ui/fab-menu.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { BarChart2, MessageCircle, Users, Plus, Menu, X, PenLine, Calendar, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface FABMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pathname: string;
  isBottomBar?: boolean;
}

export function FABMenu({ isOpen, onOpenChange, pathname, isBottomBar = false }: FABMenuProps) {
  const [currentBabyId, setCurrentBabyId] = useState<string | null>(null);
  const router = useRouter(); // Use useRouter for redirects if babyId is null

  useEffect(() => {
    // URL에서 babyId 추출
    const match = pathname.match(/\/babies\/([^/?]+)/);
    if (match) {
      const babyIdFromUrl = match[1];
      setCurrentBabyId(babyIdFromUrl);
      // localStorage도 업데이트
      if (babyIdFromUrl !== 'guest-baby-id') {
        localStorage.setItem('lastBabyId', babyIdFromUrl);
      }
    } else {
      const lastBabyId = localStorage.getItem("lastBabyId");
      setCurrentBabyId(lastBabyId || null);
    }
  }, [pathname]);

  const menuItems = useMemo(() => {
    const items: Array<{
      label: string;
      icon: typeof BarChart2;
      href: string;
    }> = [];

    // 홈이 아닌 경우에만 "기록하기" 추가
    if (pathname !== "/") {
      items.push({
        label: "기록하기",
        icon: PenLine,
        href: currentBabyId ? `/babies/${currentBabyId}` : "/",
      });
    }

    // 전체 일정 페이지가 아니면 일정 메뉴 추가
    if (!pathname.includes("tab=timeline")) {
      items.push({
        label: "전체 일정",
        icon: Calendar,
        href: currentBabyId ? `/babies/${currentBabyId}?tab=timeline` : "/",
      });
    }

    // 통계 페이지가 아니면 통계 메뉴 추가
    if (!pathname.includes("/analytics")) {
      items.push({
        label: "통계",
        icon: BarChart2,
        href: currentBabyId ? `/analytics/${currentBabyId}` : "/add-baby",
      });
    }

    // 가족 페이지가 아니면 가족 설정 메뉴 추가
    if (pathname !== "/family") {
      items.push({
        label: "가족 설정",
        icon: Users,
        href: "/family",
      });
    }

    // 설정 페이지가 아니면 설정 메뉴 추가
    if (!pathname.includes("/settings")) {
      items.push({
        label: "설정",
        icon: Settings,
        href: "/dashboard/settings",
      });
    }

    return items;
  }, [pathname, currentBabyId]);

  if (isBottomBar) {
    return (
      <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            className="w-full h-full rounded-none bg-transparent hover:bg-white/20 text-primary-foreground font-semibold text-base"
            aria-label="메뉴"
          >
            <Menu className="mr-2 h-5 w-5" />
            메뉴
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="end" className="w-56 p-2 mb-2">
          {menuItems.map((item, index) => (
            <React.Fragment key={item.label}>
              {index > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem asChild>
                <Link href={item.href} className="flex items-center">
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </DropdownMenuItem>
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all duration-200 ease-in-out backdrop-blur-sm",
            isOpen ? 'bg-primary/90' : 'bg-primary/80'
          )}
          aria-label="메뉴 열기"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" className="w-56 p-2">
        {menuItems.map((item, index) => (
          <React.Fragment key={item.label}>
            {index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem asChild>
              <Link href={item.href} className="flex items-center">
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
