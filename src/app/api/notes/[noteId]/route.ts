/**
 * Single Note API Route
 * GET: 노트 상세 조회
 * PATCH: 노트 수정
 * DELETE: 노트 삭제
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { NoteService } from '@/features/notes/services/noteService';
import { Priority } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { noteId } = await params;
    const noteService = new NoteService();
    const note = await noteService.getNoteById(noteId);

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ note });
  } catch (error) {
    console.error('GET /api/notes/[noteId] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { noteId } = await params;

    // 권한 검증
    const { prisma } = await import('@/shared/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: {
        Baby: {
          include: {
            Family: {
              include: {
                FamilyMembers: {
                  where: { userId: user.id }
                }
              }
            }
          }
        }
      }
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (note.Baby.Family.FamilyMembers.length === 0) {
      return NextResponse.json(
        { error: '이 노트를 수정할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    const body = await request.json() as {
      title?: string;
      content?: string;
      dueDate?: string;
      completed?: boolean;
      priority?: string;
      tags?: string[];
      metadata?: Record<string, unknown>;
      reminderDays?: number[];
    };
    const {
      title,
      content,
      dueDate,
      completed,
      priority,
      tags,
      metadata,
      reminderDays,
    } = body;

    // 입력 검증
    if (title && title.length > 200) {
      return NextResponse.json(
        { error: '제목은 200자 이내로 작성해주세요.' },
        { status: 400 }
      );
    }

    if (content && content.length > 5000) {
      return NextResponse.json(
        { error: '내용은 5000자 이내로 작성해주세요.' },
        { status: 400 }
      );
    }

    if (tags && Array.isArray(tags) && tags.length > 20) {
      return NextResponse.json(
        { error: '태그는 최대 20개까지만 추가할 수 있습니다.' },
        { status: 400 }
      );
    }

    const noteService = new NoteService();
    const updatedNote = await noteService.updateNote(noteId, {
      title,
      content,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      completed,
      priority: priority as Priority | undefined,
      tags,
      metadata,
      reminderDays,
    });

    return NextResponse.json({ note: updatedNote });
  } catch (error) {
    console.error('PATCH /api/notes/[noteId] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { noteId } = await params;

    // 권한 검증
    const { prisma } = await import('@/shared/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: {
        Baby: {
          include: {
            Family: {
              include: {
                FamilyMembers: {
                  where: { userId: user.id }
                }
              }
            }
          }
        }
      }
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (note.Baby.Family.FamilyMembers.length === 0) {
      return NextResponse.json(
        { error: '이 노트를 삭제할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    const noteService = new NoteService();
    await noteService.deleteNote(noteId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/notes/[noteId] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
