/**
 * FamilyTodoWidget
 * 가족 투두리스트 위젯 - 대시보드 메인 컴포넌트
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Note } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TodoQuickAddInput } from '@/features/notes/components/TodoQuickAddInput';
import { TodoItem } from '@/features/notes/components/TodoItem';
import { TodoDetailModal } from '@/features/notes/components/TodoDetailModal';
import { getPrioritySortOrder } from '@/shared/utils/todo-helpers';
import { ChevronDown, ChevronUp, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SPACING, TYPOGRAPHY } from '@/design-system';
import { cn } from '@/lib/utils';
import { useNoteStore } from '@/stores';
import { getNotesAction } from '@/features/notes/actions';


type FamilyTodoWidgetProps = {
  babyId: string;
  userId: string;
};

type TodoWithUser = Note & {
  user?: { name: string | null };
};

export function FamilyTodoWidget({ babyId, userId }: FamilyTodoWidgetProps) {
  const { 
    getTodoList, 
    setNotes, 
    addNote, 
    updateNote, 
    deleteNote,
    isLoading 
  } = useNoteStore();
  
  const todos = getTodoList(babyId);
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Note | null>(null);
  const pathname = usePathname();
  const isGuestMode = pathname?.includes('guest-baby-id') || false;

  const fetchTodos = useCallback(async () => {
    try {
      const result = await getNotesAction(babyId, 'TODO');
      if (result.success) {
        // 기존 노트들과 합치거나 교체해야 하는데, 여기서는 TODO만 가져오므로
        // store 구조상 setNotes는 해당 baby의 모든 노트를 덮어쓰는게 아니라면 조심해야 함.
        // useNoteStore의 setNotes는 전체 교체임.
        // 따라서 기존 다른 타입의 노트가 있다면 유지해야 함.
        // 하지만 현재 useNoteStore 구현을 보면 setNotes는 해당 babyId의 배열을 통째로 교체함.
        // 다른 타입의 노트가 날아갈 수 있음.
        // 일단 addNote 등을 사용하거나, store에 merge 기능을 추가해야 함.
        // 또는 getNotesAction에서 모든 타입을 가져오도록 하거나.
        // 여기서는 일단 TODO만 다루므로, TODO만 가져와서 기존 것과 merge하는 로직이 필요함.
        // 하지만 간단하게 하기 위해, store에 setNotesByType 같은게 있으면 좋겠지만 없음.
        // 임시로 기존 notes를 가져와서 합치는 건 store 내부에서 해야 함.
        // useNoteStore.ts를 다시 보면:
        // setNotes: (babyId, notes) => set((state) => ({ notes: { ...state.notes, [babyId]: notes } })),
        // 이건 덮어쓰기임.
        
        // 해결책: useNoteStore에 mergeNotes 추가하거나, 여기서 기존 notes를 읽어서 합침.
        // 하지만 getTodoList는 selector라서 전체 notes를 가져오려면 state.notes[babyId] 접근 필요.
        
        // 일단은 TODO만 관리하는 위젯이라 가정하고, 
        // 다른 컴포넌트에서 다른 타입의 노트를 로드하면 덮어씌워질 위험이 있음.
        // 안전하게 하려면 'mergeNotes' 액션을 store에 추가하는 것이 좋음.
        // 지금은 일단 직접 구현.
        
        const currentNotes = useNoteStore.getState().notes[babyId] || [];
        const otherNotes = currentNotes.filter(n => n.type !== 'TODO');
        const newNotes = [...otherNotes, ...result.data];
        setNotes(babyId, newNotes);
      }
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    }
  }, [babyId, setNotes]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // 정렬: 완료 여부 > 우선순위 > 마감일
  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    const aPriority = getPrioritySortOrder(a.priority || 'MEDIUM');
    const bPriority = getPrioritySortOrder(b.priority || 'MEDIUM');
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const activeTodos = sortedTodos.filter((todo) => !todo.completed);
  const completedTodos = sortedTodos.filter((todo) => todo.completed);

  // 우선순위별 그룹핑
  const urgentTodos = activeTodos.filter((t) => t.priority === 'URGENT');
  const highTodos = activeTodos.filter((t) => t.priority === 'HIGH');
  const normalTodos = activeTodos.filter((t) => t.priority === 'MEDIUM' || t.priority === 'LOW');

  const handleOptimisticAdd = (tempTodo: any) => {
    addNote(babyId, tempTodo);
  };

  const handleOptimisticToggle = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      updateNote(id, { completed: !todo.completed });
    }
  };

  const handleOptimisticDelete = (id: string) => {
    deleteNote(id);
  };

  if (isLoading) {
    return (
      <Card className="h-full border-none shadow-sm bg-white/50 backdrop-blur-sm">
        <CardHeader className={SPACING.card.medium}>
          <CardTitle className={TYPOGRAPHY.h3}>가족 할 일 📝</CardTitle>
        </CardHeader>
        <CardContent className={SPACING.card.medium}>
          <p className={cn(TYPOGRAPHY.body.small, "text-muted-foreground")}>로딩 중...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-none shadow-sm bg-white/50 backdrop-blur-sm">
      <CardHeader className={cn(SPACING.card.medium, "border-b bg-white/50")}>
        <div className={cn("flex items-center justify-between", SPACING.gap.sm)}>
          <CardTitle className={cn(TYPOGRAPHY.h3, "font-bold flex items-center", SPACING.gap.sm)}>
            <span>✅ 우리가족 할일</span>
            {todos.length > 0 && (
              <Badge variant="secondary" className={cn(TYPOGRAPHY.caption, "px-1.5 py-0.5 h-auto")}>
                {todos.filter((t) => !t.completed).length}
              </Badge>
            )}
          </CardTitle>
          <Link
            href="/schedules"
            className={cn(TYPOGRAPHY.body.small, "text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors")}
          >
            모두 보기 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className={cn(SPACING.card.medium, "pt-0", SPACING.space.md)}>
        <div className="pt-4">
          <TodoQuickAddInput
            onOptimisticAdd={handleOptimisticAdd}
            babyId={babyId}
            userId={userId}
          />
        </div>

        {sortedTodos.length === 0 ? (
          <div className={cn("text-center py-6 sm:py-8 bg-muted/50 rounded-lg border border-dashed", SPACING.space.xs)}>
            <p className={cn(TYPOGRAPHY.body.default, "text-muted-foreground mb-1")}>할 일이 없습니다</p>
            <p className={cn(TYPOGRAPHY.caption, "text-muted-foreground")}>새로운 할 일을 추가해보세요!</p>
          </div>
        ) : (
          <div className={SPACING.space.lg}>
            {/* 긴급 & 높음 우선순위 */}
            {(urgentTodos.length > 0 || highTodos.length > 0) && (
              <div className={SPACING.space.sm}>
                <h4 className={cn(TYPOGRAPHY.body.small, "font-semibold text-destructive flex items-center gap-1.5 mb-1")}>
                  <AlertCircle className="w-4 h-4" />
                  중요한 할 일
                </h4>
                <div className={SPACING.space.xs}>
                  {urgentTodos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onClick={() => setSelectedTodo(todo)}
                      onOptimisticToggle={handleOptimisticToggle}
                    />
                  ))}
                  {highTodos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onClick={() => setSelectedTodo(todo)}
                      onOptimisticToggle={handleOptimisticToggle}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 일반 할 일 */}
            {normalTodos.length > 0 && (
              <div className={SPACING.space.sm}>
                <h4 className={cn(TYPOGRAPHY.body.small, "font-medium text-muted-foreground mb-1")}>해야 할 일</h4>
                <div className={SPACING.space.xs}>
                  {normalTodos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onClick={() => setSelectedTodo(todo)}
                      onOptimisticToggle={handleOptimisticToggle}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 완료된 할 일 (토글) */}
            {completedTodos.length > 0 && (
              <div className="pt-3 sm:pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCompleted(!showCompleted)}
                  className={cn("w-full flex items-center justify-between text-muted-foreground hover:text-foreground", TYPOGRAPHY.body.small)}
                >
                  <span className={cn("flex items-center", SPACING.gap.sm)}>
                    완료된 항목 {completedTodos.length}개
                  </span>
                  {showCompleted ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>

                {showCompleted && (
                  <div className={cn("mt-2 sm:mt-3 animate-in slide-in-from-top-2", SPACING.space.xs)}>
                    {completedTodos.map((todo) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        onClick={() => setSelectedTodo(todo)}
                        onOptimisticToggle={handleOptimisticToggle}
                        onOptimisticDelete={handleOptimisticDelete}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* 상세 모달 */}
      {selectedTodo && (
        <TodoDetailModal
          todo={selectedTodo}
          babyId={babyId}
          userId={userId}
          onClose={() => setSelectedTodo(null)}
        />
      )}
    </Card>
  );
}
