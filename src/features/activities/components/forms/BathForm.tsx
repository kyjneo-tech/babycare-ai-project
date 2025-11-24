// src/features/activities/components/forms/BathForm.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ButtonGroup } from "../ui/ButtonGroup";

interface BathFormProps {
  bathType: string;
  setBathType: (value: string) => void;
  bathTemp: string;
  setBathTemp: (value: string) => void;
  reaction: string;
  setReaction: (value: string) => void;
  disabled?: boolean;
}

export function BathForm({
  bathType,
  setBathType,
  bathTemp,
  setBathTemp,
  reaction,
  setReaction,
  disabled = false,
}: BathFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>목욕 종류</Label>
        <ButtonGroup
          options={[
            { value: "tub", label: "욕조" },
            { value: "shower", label: "샤워" },
            { value: "sponge", label: "스펀지" },
          ]}
          value={bathType}
          onChange={setBathType}
          disabled={disabled}
          columns={3}
        />
      </div>

      <div>
        <Label htmlFor="bathTemp">물 온도 (°C)</Label>
        <Input
          id="bathTemp"
          type="number"
          step="0.5"
          placeholder="38"
          value={bathTemp}
          onChange={(e) => setBathTemp(e.target.value)}
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground mt-1">
          권장 온도: 37~38°C
        </p>
      </div>

      <div>
        <Label htmlFor="reaction">아기 반응</Label>
        <Textarea
          id="reaction"
          placeholder="아기가 목욕을 좋아했어요..."
          value={reaction}
          onChange={(e) => setReaction(e.target.value)}
          disabled={disabled}
          rows={3}
        />
      </div>
    </div>
  );
}
