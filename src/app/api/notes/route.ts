/**
 * Notes API Route
 * GET: 노트 목록 조회 (필터링 지원)
 * POST: 새 노트 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { NoteService } from '@/features/notes/services/noteService';
import { NoteType, Priority } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const babyId = searchParams.get('babyId');

    if (!babyId) {
      return NextResponse.json(
        { error: 'babyId is required' },
        { status: 400 }
      );
    }

    // 필터링 옵션
    const type = searchParams.get('type') as NoteType | null;
    const completed = searchParams.get('completed');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const options: {
      type?: NoteType;
      completed?: boolean;
      startDate?: Date;
      endDate?: Date;
    } = {};

    if (type) options.type = type;
    if (completed !== null) options.completed = completed === 'true';
    if (startDate) options.startDate = new Date(startDate);
    if (endDate) options.endDate = new Date(endDate);

    const noteService = new NoteService();
    const notes = await noteService.getNotes(babyId, options);

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('GET /api/notes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting 적용
    const { noteCreateRateLimit } = await import('@/shared/lib/ratelimit');
    if (noteCreateRateLimit && session.user.id) {
      const { success } = await noteCreateRateLimit.limit(session.user.id);
      if (!success) {
        return NextResponse.json(
          { error: '너무 많은 노트를 생성하고 있습니다. 잠시 후 다시 시도해주세요.' },
          { status: 429 }
        );
      }
    }

    const body = await request.json();
    const {
      babyId,
      userId,
      type,
      title,
      content,
      dueDate,
      priority,
      tags,
      metadata,
      reminderDays,
    } = body;

    // 필수 필드 검증
    if (!babyId || !userId || !type || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 입력 길이 검증
    if (title.length > 200) {
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

    // 태그 개수 제한
    if (tags && Array.isArray(tags) && tags.length > 20) {
      return NextResponse.json(
        { error: '태그는 최대 20개까지만 추가할 수 있습니다.' },
        { status: 400 }
      );
    }

    const noteService = new NoteService();
    const note = await noteService.createNote({
      babyId,
      userId,
      type: type as NoteType,
      title,
      content,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority: priority as Priority | undefined,
      tags,
      metadata,
      reminderDays,
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error('POST /api/notes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
