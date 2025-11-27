"use client";

import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TYPOGRAPHY, SPACING } from "@/design-system";

interface BabyCardProps {
  baby: {
    id: string;
    name: string;
    birthDate: Date | string;
    gender: string;
  };
  canEdit: boolean;
  onEdit: (babyId: string) => void;
  onDelete: (babyId: string) => void;
}

export function BabyCard({ baby, canEdit, onEdit, onDelete }: BabyCardProps) {
  const birthDate = typeof baby.birthDate === 'string' ? new Date(baby.birthDate) : baby.birthDate;
  
  return (
    <Card className={cn("flex items-center p-2 sm:p-3 bg-muted rounded-lg", SPACING.gap.sm)}>
      <Link
        href={`/babies/${baby.id}`}
        className="flex items-center flex-1 hover:opacity-80 transition-opacity"
      >
        <span className="text-xl sm:text-2xl mr-2 sm:mr-3">
          {baby.gender === "male" ? "👶‍♂️" : "👶‍♀️"}
        </span>
        <div className="flex-1">
          <p className={cn(TYPOGRAPHY.body.default, "font-semibold")}>
            {baby.name}
          </p>
          <p className={cn(TYPOGRAPHY.caption, "text-muted-foreground")}>
            {birthDate.toLocaleDateString("ko-KR")} 출생
          </p>
        </div>
      </Link>
      
      {canEdit && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(baby.id)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(baby.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </Card>
  );
}
