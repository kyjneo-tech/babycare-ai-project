/**
 * TodoDetailModal
 * 투두 상세 정보 편집 모달
 */

'use client';

import { useState } from 'react';
import { Note, Priority } from '@prisma/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateNoteAction } from '@/features/notes/actions';
import { useRouter } from 'next/navigation';
import { getCategoryIcon, getCategoryLabel, getPriorityLabel } from '@/shared/utils/todo-helpers';
import { Calendar, AlertCircle } from 'lucide-react';

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 5000;

type TodoDetailModalProps = {
  todo: Note;
  babyId: string;
  userId: string;
  onClose: () => void;
};

const CATEGORIES = ['shopping', 'hospital', 'cleaning', 'childcare', 'education', 'other'] as const;
const PRIORITIES: Priority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];

export function TodoDetailModal({ todo, babyId, userId, onClose }: TodoDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const metadata = (todo.metadata as any) || {};
  
  const [title, setTitle] = useState(todo.title);
  const [content, setContent] = useState(todo.content || '');
  const [priority, setPriority] = useState<Priority>(todo.priority || 'MEDIUM');
  const [category, setCategory] = useState(metadata.category || 'other');
  const [dueDate, setDueDate] = useState(
    todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : ''
  );

  // 글자수 계산
  const titleLength = title.length;
  const contentLength = content.length;
  const titleRemaining = MAX_TITLE_LENGTH - titleLength;
  const contentRemaining = MAX_CONTENT_LENGTH - contentLength;
  const isTitleOverLimit = titleRemaining < 0;
  const isContentOverLimit = contentRemaining < 0;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // 글자수 제한 초과 시 입력 차단
    if (newValue.length <= MAX_TITLE_LENGTH) {
      setTitle(newValue);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    // 글자수 제한 초과 시 입력 차단
    if (newValue.length <= MAX_CONTENT_LENGTH) {
      setContent(newValue);
    }
  };

  const handleSave = async () => {
    // 글자수 제한 체크
    if (isTitleOverLimit || isContentOverLimit) {
      alert('글자수 제한을 초과했습니다.');
      return;
    }

    setLoading(true);
    try {
      await updateNoteAction(todo.id, {
        title: title.trim() || todo.title,
        content: content.trim() || undefined,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        metadata: {
          ...metadata,
          category,
          assigneeId: userId,
        },
      });

      router.refresh();
      onClose();
    } catch (error) {
      console.error('Failed to update todo:', error);
      alert('수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>할 일 편집</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 제목 */}
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              value={title}
              onChange={handleTitleChange}
              placeholder="할 일을 입력하세요"
              className={isTitleOverLimit ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            <div className={`text-xs ${
              titleRemaining < 20 ? (isTitleOverLimit ? 'text-red-500' : 'text-orange-500') : 'text-gray-500'
            }`}>
              {titleLength} / {MAX_TITLE_LENGTH}자
              {titleRemaining < 20 && titleRemaining >= 0 && (
                <span className="ml-1">({titleRemaining}자 남음)</span>
              )}
              {isTitleOverLimit && (
                <span className="ml-1 font-medium">({Math.abs(titleRemaining)}자 초과)</span>
              )}
            </div>
          </div>

          {/* 우선순위 */}
          <div className="space-y-2">
            <Label htmlFor="priority">우선순위</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {getPriorityLabel(p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 카테고리 */}
          <div className="space-y-2">
            <Label htmlFor="category">카테고리</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {getCategoryIcon(cat)} {getCategoryLabel(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 마감일 */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">마감일</Label>
            <div className="relative">
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="pl-10"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* 상세 메모 */}
          <div className="space-y-2">
            <Label htmlFor="content">상세 메모</Label>
            <Textarea
              id="content"
              value={content}
              onChange={handleContentChange}
              placeholder="상세 내용을 입력하세요 (선택사항)"
              rows={4}
              className={isContentOverLimit ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            <div className={`text-xs ${
              contentRemaining < 500 ? (isContentOverLimit ? 'text-red-500' : 'text-orange-500') : 'text-gray-500'
            }`}>
              {contentLength} / {MAX_CONTENT_LENGTH}자
              {contentRemaining < 500 && contentRemaining >= 0 && (
                <span className="ml-1">({contentRemaining}자 남음)</span>
              )}
              {isContentOverLimit && (
                <span className="ml-1 font-medium">({Math.abs(contentRemaining)}자 초과)</span>
              )}
            </div>
            {isContentOverLimit && (
              <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">글자수 제한 초과</p>
                  <p className="text-xs mt-0.5">
                    메모는 최대 {MAX_CONTENT_LENGTH.toLocaleString()}자까지 입력 가능합니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !title.trim() || isTitleOverLimit || isContentOverLimit}
          >
            {loading ? '저장 중...' : '저장'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
