/**
 * FormInput
 * 표준 Input 컴포넌트 (shadcn/ui 기반)
 */

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function FormInput({ error, className, ...props }: FormInputProps) {
  return (
    <Input
      className={cn(
        error && "border-destructive focus-visible:ring-destructive",
        className
      )}
      {...props}
    />
  );
}
