/**
 * TodoItem
 * 개별 투두 항목 컴포넌트
 */

'use client';

import { Note } from '@prisma/client';
import { Checkbox } from '@/components/ui/checkbox';
import { toggleNoteCompletionAction, deleteNoteAction } from '@/features/notes/actions';
import { getPriorityColor, getCategoryIcon, formatTodoDate, isOverdue } from '@/shared/utils/todo-helpers';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type TodoItemProps = {
  todo: Note & {
    user?: { name: string | null };
  };
  onClick?: () => void;
  onOptimisticToggle?: (id: string) => void;
  onOptimisticDelete?: (id: string) => void;
};

export function TodoItem({ todo, onClick, onOptimisticToggle, onOptimisticDelete }: TodoItemProps) {
  const [deleting, setDeleting] = useState(false);
  const [optimisticCompleted, setOptimisticCompleted] = useState(todo.completed);
  const [optimisticDeleted, setOptimisticDeleted] = useState(false);
  const router = useRouter();

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 낙관적 업데이트: 즉시 UI 변경
    const newCompleted = !optimisticCompleted;
    setOptimisticCompleted(newCompleted);
    
    if (onOptimisticToggle) {
      onOptimisticToggle(todo.id);
    }

    try {
      await toggleNoteCompletionAction(todo.id);
      router.refresh();
    } catch (error) {
      // 실패 시 원래 상태로 복구
      setOptimisticCompleted(!newCompleted);
      console.error('Failed to toggle todo:', error);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('이 할 일을 삭제하시겠습니까?')) return;
    
    // 낙관적 업데이트: 즉시 UI에서 제거
    setOptimisticDeleted(true);
    if (onOptimisticDelete) {
      onOptimisticDelete(todo.id);
    }

    setDeleting(true);
    try {
      await deleteNoteAction(todo.id);
      router.refresh();
    } catch (error) {
      // 실패 시 원래 상태로 복구
      setOptimisticDeleted(false);
      console.error('Failed to delete todo:', error);
    } finally {
      setDeleting(false);
    }
  };

  // 낙관적으로 삭제된 경우 렌더링하지 않음
  if (optimisticDeleted) {
    return null;
  }

  const metadata = todo.metadata as any;
  const category = metadata?.category || 'other';
  const assigneeName = metadata?.assigneeName || todo.user?.name || '';
  const overdue = todo.dueDate && !todo.completed && isOverdue(todo.dueDate);

  return (
    <div
      onClick={onClick}
      className={`
        group flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer
        ${optimisticCompleted ? 'bg-gray-50 opacity-60' : 'bg-white hover:shadow-md'}
        ${overdue ? 'border-red-200' : 'border-gray-200'}
      `}
    >
      {/* 우선순위 인디케이터 */}
      <div className={`w-1 h-full rounded-full ${getPriorityColor(todo.priority || 'MEDIUM')}`} />

      {/* 체크박스 */}
      <div onClick={handleToggle} className="flex items-center pt-0.5">
        <Checkbox
          checked={optimisticCompleted}
          className="h-5 w-5"
        />
      </div>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base">{getCategoryIcon(category)}</span>
          <p className={`text-sm font-medium ${optimisticCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
            {todo.title}
          </p>
        </div>
        
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          {assigneeName && <span>{assigneeName}</span>}
          {todo.dueDate && (
            <>
              <span>•</span>
              <span className={overdue ? 'text-red-600 font-medium' : ''}>
                {formatTodoDate(new Date(todo.dueDate))}
              </span>
            </>
          )}
        </div>
      </div>

      {/* 삭제 버튼 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={deleting}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
      </Button>
    </div>
  );
}
