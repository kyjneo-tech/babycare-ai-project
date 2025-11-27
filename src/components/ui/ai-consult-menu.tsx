"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIConsultMenuProps {
  currentBabyId?: string;
  pathname: string;
}

export function AIConsultMenu({ currentBabyId, pathname }: AIConsultMenuProps) {
  const chatLink = currentBabyId ? `/babies/${currentBabyId}?tab=ai-chat` : '/add-baby';

  return (
    <Link href={chatLink} className="flex-1">
      <Button
        className="w-full h-full rounded-none bg-transparent hover:bg-white/20 text-primary-foreground font-semibold text-base border-r border-white/20 justify-center gap-2"
        aria-label="AI 상담"
      >
        <MessageCircle className="h-5 w-5" />
        🤖 AI 육아 상담
      </Button>
    </Link>
  );
}
