// src/features/activities/components/forms/PlayForm.tsx
"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "../ui/ButtonGroup";
import { cn } from "@/lib/utils";

interface PlayFormProps {
  playLocation: string;
  setPlayLocation: (value: string) => void;
  playType: string[];
  setPlayType: (value: string[]) => void;
  reaction: string;
  setReaction: (value: string) => void;
  disabled?: boolean;
}

const PLAY_TYPES = [
  "장난감",
  "책",
  "음악",
  "산책",
  "놀이터",
  "수영",
  "미술",
  "기타",
];

export function PlayForm({
  playLocation,
  setPlayLocation,
  playType,
  setPlayType,
  reaction,
  setReaction,
  disabled = false,
}: PlayFormProps) {
  const togglePlayType = (type: string) => {
    if (playType.includes(type)) {
      setPlayType(playType.filter((t) => t !== type));
    } else {
      setPlayType([...playType, type]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>놀이 장소</Label>
        <ButtonGroup
          options={[
            { value: "indoor", label: "실내" },
            { value: "outdoor", label: "실외" },
          ]}
          value={playLocation}
          onChange={setPlayLocation}
          disabled={disabled}
        />
      </div>

      <div>
        <Label>놀이 종류 (복수 선택 가능)</Label>
        <div className="flex flex-wrap gap-2">
          {PLAY_TYPES.map((type) => (
            <Button
              key={type}
              type="button"
              onClick={() => togglePlayType(type)}
              variant="outline"
              size="sm"
              disabled={disabled}
              className={cn(
                "transition-all",
                playType.includes(type) &&
                  "bg-purple-500 text-white hover:bg-purple-600"
              )}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="playReaction">아기 반응</Label>
        <Textarea
          id="playReaction"
          placeholder="아기가 즐거워했어요..."
          value={reaction}
          onChange={(e) => setReaction(e.target.value)}
          disabled={disabled}
          rows={3}
        />
      </div>
    </div>
  );
}
