/**
 * TodoList
 * 투두 목록 클라이언트 컴포넌트
 */

'use client';

import { useState } from 'react';
import { Note } from '@prisma/client';
import { TodoItem } from './TodoItem';
import { TodoDetailModal } from './TodoDetailModal';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

type TodoListProps = {
  initialTodos: (Note & { User?: { name: string | null } | null })[];
  babyId: string;
  userId: string;
};

export function TodoList({ initialTodos, babyId, userId }: TodoListProps) {
  const [selectedTodo, setSelectedTodo] = useState<Note | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const activeTodos = initialTodos.filter((todo) => !todo.completed);
  const completedTodos = initialTodos.filter((todo) => todo.completed);

  return (
    <>
      {/* 활성 투두 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          진행 중 ({activeTodos.length})
        </h2>
        {activeTodos.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            할 일이 없습니다! 🎉
          </p>
        ) : (
          <div className="space-y-2">
            {activeTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onClick={() => setSelectedTodo(todo)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 완료된 투두 */}
      {completedTodos.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <Button
            variant="ghost"
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full mb-4"
          >
            {showCompleted ? (
              <ChevronUp className="mr-2 h-4 w-4" />
            ) : (
              <ChevronDown className="mr-2 h-4 w-4" />
            )}
            완료된 항목 {completedTodos.length}개 {showCompleted ? '숨기기' : '보기'}
          </Button>

          {showCompleted && (
            <div className="space-y-2">
              {completedTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onClick={() => setSelectedTodo(todo)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 상세 모달 */}
      {selectedTodo && (
        <TodoDetailModal
          todo={selectedTodo}
          babyId={babyId}
          userId={userId}
          onClose={() => setSelectedTodo(null)}
        />
      )}
    </>
  );
}
