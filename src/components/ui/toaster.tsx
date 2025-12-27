"use client";

import { useToastStore } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "p-4 rounded-xl shadow-2xl backdrop-blur-xl border-2 animate-in slide-in-from-top-5 fade-in duration-300",
            toast.variant === 'success' && "bg-green-500/90 border-green-400/50 text-white",
            toast.variant === 'destructive' && "bg-red-500/90 border-red-400/50 text-white",
            (!toast.variant || toast.variant === 'default') && "bg-slate-800/95 border-white/20 text-white"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {toast.title && (
                <div className="font-bold text-base mb-1">{toast.title}</div>
              )}
              {toast.description && (
                <div className="text-sm opacity-90">{toast.description}</div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 rounded-full p-1 hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
