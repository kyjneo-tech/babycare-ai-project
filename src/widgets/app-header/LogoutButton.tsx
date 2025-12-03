import { Button, ButtonProps } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

interface Props extends ButtonProps {
  callbackUrl?: string;
}

export default function LogoutButton({
  callbackUrl = "/login",
  variant = "destructive",
  className,
  ...props
}: Props) {
  const handleLogout = async () => {
    // ⚠️ CRITICAL: 로그아웃 시 모든 Zustand Store 초기화 (보안 필수!)
    try {
      const { useBabyStore, useActivityStore, useMeasurementStore, useFamilyStore, useNoteStore, useChatStore } = await import('@/stores');

      // 모든 store 초기화 (다른 사용자 데이터 유출 방지)
      useBabyStore.getState().clearBabies();
      useActivityStore.getState().clearAll();
      useMeasurementStore.getState().clearAll();
      useFamilyStore.getState().clearFamily();
      useNoteStore.getState().clearNotes();
      useChatStore.getState().clearMessages();

      console.log('[SECURITY] All stores cleared on logout');
    } catch (error) {
      console.error('[SECURITY] Failed to clear stores:', error);
    }

    // NextAuth 로그아웃
    await signOut({ callbackUrl });
  };

  return (
    <Button
      onClick={handleLogout}
      variant={variant}
      className={className}
      {...props}
    >
      <span className="hidden sm:inline">로그아웃</span>
      <LogOut className="h-4 w-4 sm:hidden" />
    </Button>
  );
}
