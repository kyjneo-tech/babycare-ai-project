/**
 * FormTextarea
 * 표준 Textarea 컴포넌트 (shadcn/ui 기반)
 */

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function FormTextarea({ error, className, ...props }: FormTextareaProps) {
  return (
    <Textarea
      className={cn(
        error && "border-destructive focus-visible:ring-destructive",
        className
      )}
      {...props}
    />
  );
}
