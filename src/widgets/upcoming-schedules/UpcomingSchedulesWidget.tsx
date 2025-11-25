/**
 * UpcomingSchedulesWidget
 * 대시보드에 표시될 "다가오는 일정 & 할 일" 위젯
 */

'use client';

import { useEffect, useState } from 'react';
import { Note } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toggleNoteCompletionAction } from '@/features/notes/actions';
import { getNoteIcon, getNoteTypeLabel, formatDueDate } from '@/shared/utils/note-helpers';
import { ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';

type UpcomingSchedulesWidgetProps = {
  babyId: string;
};

export function UpcomingSchedulesWidget({ babyId }: UpcomingSchedulesWidgetProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingNotes();
  }, [babyId]);

  const fetchUpcomingNotes = async () => {
    try {
      const response = await fetch(`/api/notes/upcoming?babyId=${babyId}&withinDays=7`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error('Failed to fetch upcoming notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (noteId: string) => {
    const result = await toggleNoteCompletionAction(noteId);
    if (result.success) {
      // 낙관적 업데이트
      setNotes(prev =>
        prev.map(note =>
          note.id === noteId
            ? { ...note, completed: result.data.completed }
            : note
        )
      );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>오늘 할 일 & 다가오는 일정</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </CardContent>
      </Card>
    );
  }

  if (notes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>오늘 할 일 & 다가오는 일정</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            다가오는 일정이 없습니다. 📅
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            💡 위의 "일정 자동 생성" 버튼을 눌러 예방접종, 건강검진 등의 일정을 자동으로 생성하세요!
          </p>
        </CardContent>
      </Card>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayNotes = notes.filter((note) => {
    if (!note.dueDate) return false;
    const dueDate = new Date(note.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime() && !note.completed;
  });

  const upcomingNotes = notes.filter((note) => {
    if (!note.dueDate) return false;
    const dueDate = new Date(note.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate > today && !note.completed;
  }).slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>오늘 할 일 & 다가오는 일정</CardTitle>
        <Link href="/notes">
          <Button variant="ghost" size="sm">
            모두 보기 <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 오늘 할 일 */}
        {todayNotes.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">오늘 ({todayNotes.length})</h4>
            <div className="space-y-2">
              {todayNotes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-start gap-2 p-2 rounded-md hover:bg-accent transition-colors"
                >
                  <button
                    onClick={() => handleToggleComplete(note.id)}
                    className="mt-0.5 flex-shrink-0"
                  >
                    {note.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{getNoteIcon(note.type)}</span>
                      <p className="text-sm font-medium truncate">{note.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {getNoteTypeLabel(note.type)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 다가오는 일정 */}
        {upcomingNotes.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">
              다가오는 일정 ({upcomingNotes.length})
            </h4>
            <div className="space-y-2">
              {upcomingNotes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-start gap-2 p-2 rounded-md hover:bg-accent transition-colors"
                >
                  <span className="text-base mt-0.5">{getNoteIcon(note.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{note.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {note.dueDate && formatDueDate(new Date(note.dueDate))} •{' '}
                      {getNoteTypeLabel(note.type)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
