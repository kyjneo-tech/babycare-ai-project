/**
 * FormField
 * Label + Input/Select/Textarea를 포함한 표준 폼 필드
 */

import { cn } from "@/lib/utils";
import { SPACING, TYPOGRAPHY } from "@/design-system";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  description,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={cn(SPACING.space.sm, className)}>
      <Label
        htmlFor={htmlFor}
        className={cn(TYPOGRAPHY.body.default, "font-medium")}
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {description && (
        <p className={cn(TYPOGRAPHY.caption, "mt-1")}>
          {description}
        </p>
      )}
      <div className="mt-2">
        {children}
      </div>
      {error && (
        <p className={cn(TYPOGRAPHY.caption, "text-destructive mt-1")}>
          {error}
        </p>
      )}
    </div>
  );
}
