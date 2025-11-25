/**
 * FormSection
 * Activity Form 등에서 사용하는 섹션 래퍼
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SPACING, TYPOGRAPHY } from "@/design-system";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  title?: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function FormSection({
  title,
  icon,
  children,
  className = "",
  noPadding = false
}: FormSectionProps) {
  if (!title) {
    return (
      <Card className={className}>
        <CardContent className={noPadding ? "p-0" : SPACING.card.medium}>
          {children}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className={cn(SPACING.card.small, "border-b")}>
        <CardTitle className={cn(TYPOGRAPHY.h3, "flex items-center gap-2")}>
          {icon && <span className="text-2xl">{icon}</span>}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className={noPadding ? "p-0" : SPACING.card.medium}>
        {children}
      </CardContent>
    </Card>
  );
}
