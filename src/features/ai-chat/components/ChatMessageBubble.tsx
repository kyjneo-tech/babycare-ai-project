"use client";

import { format } from "date-fns";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TYPOGRAPHY } from "@/design-system";
import type { ReactNode } from "react";

interface ChatMessageBubbleProps {
  message: {
    role: "user" | "assistant" | "system" | "tool";
    content: ReactNode;
    createdAt?: Date;
  };
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex items-end gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <Avatar className={cn(isUser ? "bg-primary" : "bg-muted")}>
        <AvatarFallback>
          {isUser ? (
            <User className="w-5 h-5 text-primary-foreground" />
          ) : (
            <Bot className="w-5 h-5 text-muted-foreground" />
          )}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={cn("flex-1 max-w-[75%]", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted text-muted-foreground rounded-tl-sm"
          )}
        >
          <p className={cn(TYPOGRAPHY.body.default, "whitespace-pre-wrap break-words")}>
            {message.content}
          </p>
        </div>
        <span
          className={cn(TYPOGRAPHY.caption, "mt-1 px-2 inline-block")}
        >
          {format(message.createdAt || new Date(), "HH:mm")}
        </span>
      </div>
    </div>
  );
}
