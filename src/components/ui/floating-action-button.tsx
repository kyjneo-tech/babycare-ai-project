import * as React from "react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  position?: "bottom-right" | "bottom-left";
  className?: string;
}

export function FloatingActionButton({
  icon,
  label,
  onClick,
  position = "bottom-right",
  className,
}: FloatingActionButtonProps) {
  return (
    <button
      className={cn(
        "fixed z-50 flex flex-col items-center gap-1",
        "bg-primary text-primary-foreground",
        "rounded-full shadow-soft hover:shadow-lg",
        "px-4 py-3 transition-all duration-200 hover:scale-105",
        position === "bottom-right" ? "bottom-20 right-4" : "bottom-20 left-4",
        className
      )}
      onClick={onClick}
      aria-label={label}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs font-semibold whitespace-nowrap">{label}</span>
    </button>
  );
}
