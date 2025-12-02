"use client";

import { useState, FormEvent, KeyboardEvent } from "react";
import { Send, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const MAX_MESSAGE_LENGTH = 1500;

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const remainingChars = MAX_MESSAGE_LENGTH - message.length;
  const isOverLimit = remainingChars < 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && !isOverLimit) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    // 글자수 제한 초과 시 입력 차단
    if (newValue.length <= MAX_MESSAGE_LENGTH) {
      setMessage(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            disabled={disabled}
            rows={1}
            className={`resize-none rounded-full max-h-[120px] pr-12 ${
              isOverLimit ? 'border-red-500 focus-visible:ring-red-500' : ''
            }`}
          />
        </div>
        <Button
          type="submit"
          disabled={!message.trim() || disabled || isOverLimit}
          size="icon"
          className="flex-shrink-0 rounded-full"
        >
          <Send className="w-5 h-5" />
        </Button>
      </form>

      {/* 글자수 카운터 */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className={`flex items-center gap-1 ${
          remainingChars < 100 ? (isOverLimit ? 'text-red-500' : 'text-orange-500') : 'text-gray-500'
        }`}>
          {isOverLimit && <AlertCircle className="w-3 h-3" />}
          <span>
            {message.length} / {MAX_MESSAGE_LENGTH}자
            {remainingChars < 100 && remainingChars >= 0 && (
              <span className="ml-1">({remainingChars}자 남음)</span>
            )}
            {isOverLimit && (
              <span className="ml-1 font-medium">({Math.abs(remainingChars)}자 초과)</span>
            )}
          </span>
        </div>
        {message.length > 0 && (
          <span className="text-gray-400">
            Shift + Enter로 줄바꿈
          </span>
        )}
      </div>

      {/* 경고 메시지 */}
      {isOverLimit && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">글자수 제한 초과</p>
            <p className="text-xs mt-1">
              메시지는 최대 {MAX_MESSAGE_LENGTH.toLocaleString()}자까지 입력 가능합니다.
              현재 {Math.abs(remainingChars)}자를 초과했습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
