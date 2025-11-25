/**
 * TodoQuickAddInput
 * 투두 빠른 추가 컴포넌트 (우선순위 선택 + 낙관적 업데이트)
 */

'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { createNoteAction } from '@/features/notes/actions';
import { Priority } from '@prisma/client';
import { getPriorityLabel } from '@/shared/utils/todo-helpers';

type TodoQuickAddInputProps = {
  babyId: string;
  userId: string;
  onOptimisticAdd?: (tempTodo: any) => void;
};

const PRIORITIES: Priority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];

export function TodoQuickAddInput({ babyId, userId, onOptimisticAdd }: TodoQuickAddInputProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || loading) return;

    const tempId = `temp-${Date.now()}`;
    const tempTodo = {
      id: tempId,
      title: title.trim(),
      priority,
      completed: false,
      babyId,
      userId,
      type: 'TODO',
      content: null,
      dueDate: null,
      completedAt: null,
      tags: [],
      metadata: { category: 'other', assigneeId: userId },
      reminderDays: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 낙관적 업데이트: 즉시 UI에 추가
    if (onOptimisticAdd) {
      onOptimisticAdd(tempTodo);
    }

    setTitle('');
    setPriority('MEDIUM');
    setLoading(true);

    try {
      await createNoteAction({
        babyId,
        type: 'TODO',
        title: tempTodo.title,
        priority: tempTodo.priority,
        metadata: tempTodo.metadata,
      });

      // 서버에서 실제 데이터 가져오기 (refresh 대신 재조회)
      if (onOptimisticAdd) {
        // 부모 컴포넌트에서 fetchTodos 재호출
        setTimeout(() => {
          window.location.reload(); // 임시: 나중에 더 나은 방법으로 개선
        }, 500);
      }
    } catch (error) {
      console.error('Failed to create todo:', error);
      alert('할 일 추가에 실패했습니다.');
      // Rollback: 실패 시 제거 (부모에서 처리)
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-2">
      <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
        <SelectTrigger className="w-32">
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
      
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="새로운 할 일을 입력하세요..."
        disabled={loading}
        className="flex-1"
      />
      
      <Button onClick={handleSubmit} disabled={loading || !title.trim()} size="icon">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
