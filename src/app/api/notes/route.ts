/**
 * @swagger
 * components:
 *   schemas:
 *     Note:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier for the note.
 *         babyId:
 *           type: string
 *           description: The ID of the baby the note belongs to.
 *         userId:
 *           type: string
 *           description: The ID of the user who created the note.
 *         type:
 *           type: string
 *           enum: [MEMO, TODO, VACCINATION, HEALTH_CHECKUP]
 *           description: The type of the note.
 *         title:
 *           type: string
 *           description: The title of the note.
 *         content:
 *           type: string
 *           description: The content of the note.
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: The due date for the note (for TODOs, etc.).
 *         completed:
 *           type: boolean
 *           description: Whether the note (TODO) is completed.
 *         priority:
 *           type: string
 *           enum: [HIGH, MEDIUM, LOW]
 *           description: The priority of the note.
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags associated with the note.
 *         metadata:
 *           type: object
 *           description: Additional metadata for the note.
 *         reminderDays:
 *            type: array
 *            items:
 *              type: integer
 *            description: Days before the due date to send a reminder.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the note was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the note was last updated.
 *
 *     NewNote:
 *       type: object
 *       required:
 *         - babyId
 *         - userId
 *         - type
 *         - title
 *       properties:
 *         babyId:
 *           type: string
 *         userId:
 *           type: string
 *         type:
 *           type: string
 *           enum: [MEMO, TODO, VACCINATION, HEALTH_CHECKUP]
 *         title:
 *           type: string
 *           maxLength: 200
 *         content:
 *           type: string
 *           maxLength: 5000
 *         dueDate:
 *           type: string
 *           format: date-time
 *         priority:
 *           type: string
 *           enum: [HIGH, MEDIUM, LOW]
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           maxItems: 20
 *         metadata:
 *           type: object
 *         reminderDays:
 *           type: array
 *           items:
 *             type: integer
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { NoteService } from '@/features/notes/services/noteService';
import { NoteType, Priority } from '@prisma/client';

/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: Retrieve a list of notes
 *     description: Fetches a list of notes for a specific baby, with optional filtering.
 *     tags: [Notes]
 *     parameters:
 *       - in: query
 *         name: babyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the baby to fetch notes for.
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [MEMO, TODO, VACCINATION, HEALTH_CHECKUP]
 *         description: Filter notes by type.
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filter TODO notes by completion status.
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: The start date for a date range filter.
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: The end date for a date range filter.
 *     responses:
 *       '200':
 *         description: A list of notes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Note'
 *       '400':
 *         description: Bad request, babyId is required.
 *       '401':
 *         description: Unauthorized.
 *       '500':
 *         description: Internal server error.
 */

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

    // 🔒 보안: 사용자 ID 조회
    const { prisma } = await import('@/shared/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 🔒 보안: 아기가 사용자의 가족에 속하는지 검증
    const baby = await prisma.baby.findFirst({
      where: {
        id: babyId,
        Family: {
          FamilyMembers: {
            some: {
              userId: user.id,
            },
          },
        },
      },
    });

    if (!baby) {
      return NextResponse.json(
        { error: 'Baby not found or access denied' },
        { status: 403 }
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

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: 새 노트 생성
 *     description: |
 *       새로운 노트를 생성합니다. `babyId`, `userId`, `type`, `title`은 필수로 제공해야 합니다.
 *       나머지 필드들은 선택 사항입니다.
 *
 *       **테스트 방법:**
 *       1. `Try it out` 버튼을 클릭하세요.
 *       2. `Request body` 섹션의 예시 JSON 데이터를 실제 생성하려는 노트 정보로 수정하세요.
 *          `babyId`와 `userId`는 유효한 값이어야 합니다. `type`은 `MEMO`, `TODO`, `VACCINATION`, `HEALTH_CHECKUP` 중 하나여야 합니다.
 *       3. `Execute` 버튼을 클릭하여 API 요청을 실행하고 `Responses` 섹션에서 `201` 성공 응답과 함께 생성된 노트 정보를 확인하세요.
 *     tags: [Notes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewNote'
 *     responses:
 *       '201':
 *         description: 노트 생성 성공.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 note:
 *                   $ref: '#/components/schemas/Note'
 *       '400':
 *         description: "잘못된 요청 (필수 필드 누락 또는 유효성 검증 오류)"
 *       '401':
 *         description: 인증되지 않은 사용자입니다.
 *       '429':
 *         description: 너무 많은 노트 생성 요청입니다. 잠시 후 다시 시도해주세요.
 *       '500':
 *         description: 서버 내부 오류.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 🔒 보안: 사용자 ID 조회
    const { prisma } = await import('@/shared/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Rate limiting 적용
    const { noteCreateRateLimit } = await import('@/shared/lib/ratelimit');
    if (noteCreateRateLimit) {
      const { success } = await noteCreateRateLimit.limit(user.id);
      if (!success) {
        return NextResponse.json(
          { error: '너무 많은 노트를 생성하고 있습니다. 잠시 후 다시 시도해주세요.' },
          { status: 429 }
        );
      }
    }

    const body = await request.json() as {
      babyId: string;
      type: string;
      title: string;
      content?: string;
      dueDate?: string;
      priority?: string;
      tags?: string[];
      metadata?: Record<string, unknown>;
      reminderDays?: number[];
    };
    const {
      babyId,
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
    if (!babyId || !type || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 🔒 보안: 아기가 사용자의 가족에 속하는지 검증
    const baby = await prisma.baby.findFirst({
      where: {
        id: babyId,
        Family: {
          FamilyMembers: {
            some: {
              userId: user.id,
            },
          },
        },
      },
    });

    if (!baby) {
      return NextResponse.json(
        { error: 'Baby not found or access denied' },
        { status: 403 }
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
      userId: user.id, // 🔒 보안: 세션에서 가져온 userId 사용
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
