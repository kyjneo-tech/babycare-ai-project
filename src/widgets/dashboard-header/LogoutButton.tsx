"use client";

import Button from "@/components/ui/atoms/Button";
import { signOut } from "next-auth/react";

type Props = {
  callbackUrl?: string;
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
};

export default function LogoutButton({
  callbackUrl = "/login",
  variant = "danger",
  size = "medium",
}: Props) {
  return (
    <Button
      onClick={() => signOut({ callbackUrl })}
      variant={variant}
      size={size}
    >
      로그아웃
    </Button>
  );
}
