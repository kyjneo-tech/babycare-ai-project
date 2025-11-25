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
import { Calendar } from 'lucide-react';

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

  const handleSave = async () => {
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
              onChange={(e) => setTitle(e.target.value)}
              placeholder="할 일을 입력하세요"
            />
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
              onChange={(e) => setContent(e.target.value)}
              placeholder="상세 내용을 입력하세요 (선택사항)"
              rows={4}
            />
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
            disabled={loading || !title.trim()}
          >
            {loading ? '저장 중...' : '저장'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
