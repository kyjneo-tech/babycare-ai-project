"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, ChevronDown, HelpCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface AIConsultMenuProps {
  currentBabyId?: string;
  pathname: string;
}

export function AIConsultMenu({ currentBabyId, pathname }: AIConsultMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const chatLink = currentBabyId ? `/ai-chat/${currentBabyId}` : '/add-baby';

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          className="flex-1 h-full rounded-none bg-transparent hover:bg-white/10 text-white font-semibold text-base border-r border-white/20 justify-center gap-2"
          aria-label="AI 상담 메뉴"
        >
          <MessageCircle className="h-5 w-5" />
          🤖 AI 육아 상담
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56 p-2 mb-2">
        <DropdownMenuItem asChild>
          <Link href={chatLink} className="flex items-center cursor-pointer">
            <MessageCircle className="mr-2 h-4 w-4" />
            <span>AI 육아 상담</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href={currentBabyId ? `/ai-chat/${currentBabyId}?mode=general` : '/add-baby'}
            className="flex items-center cursor-pointer"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>기타 상담</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
