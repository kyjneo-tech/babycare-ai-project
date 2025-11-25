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
  return (
    <Button
      onClick={() => signOut({ callbackUrl })}
      variant={variant}
      className={className}
      {...props}
    >
      <span className="hidden sm:inline">로그아웃</span>
      <LogOut className="h-4 w-4 sm:hidden" />
    </Button>
  );
}
