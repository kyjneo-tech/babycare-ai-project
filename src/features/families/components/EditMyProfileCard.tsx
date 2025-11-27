"use client";

import { useState } from "react";
import { updateMyProfile } from "@/features/families/actions";
import { relationOptions } from "@/features/families/constants/relationOptions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "lucide-react";

interface EditMyProfileCardProps {
  currentRelation: string;
  onSuccess?: () => void;
}

export function EditMyProfileCard({
  currentRelation,
  onSuccess,
}: EditMyProfileCardProps) {
  const [selectedRelation, setSelectedRelation] = useState(currentRelation);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    if (selectedRelation === currentRelation) {
      setError("변경된 내용이 없습니다.");
      return;
    }

    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      const result = await updateMyProfile(selectedRelation);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          window.location.reload();
        }, 1000);
      } else {
        setError(result.error || "프로필 업데이트에 실패했습니다.");
      }
    } catch (err) {
      setError("오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = selectedRelation !== currentRelation;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          내 프로필
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>
              ✓ 프로필이 업데이트되었습니다!
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="relation">내 역할</Label>
          <Select
            value={selectedRelation}
            onValueChange={setSelectedRelation}
            disabled={saving}
          >
            <SelectTrigger id="relation">
              <SelectValue placeholder="역할을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {relationOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                  {option.unique && " (1명만 가능)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            아기와의 관계를 선택하세요. 엄마/아빠는 각 1명만 가능합니다.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="w-full"
        >
          {saving ? "저장 중..." : "저장"}
        </Button>
      </CardContent>
    </Card>
  );
}
