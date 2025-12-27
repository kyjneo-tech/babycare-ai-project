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

/**
 * @swagger
 * /api/notes/{noteId}:
 *   get:
 *     summary: 노트 상세 조회
 *     description: |
 *       특정 노트의 상세 정보를 조회합니다.
 *
 *       **테스트 방법:**
 *       1. `Authorize` 버튼으로 JWT 토큰 입력
 *       2. `Try it out` 버튼 클릭
 *       3. noteId 입력
 *       4. `Execute` 버튼으로 실행
 *     tags: [Notes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *         description: 노트 ID
 *     responses:
 *       '200':
 *         description: 노트 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 note:
 *                   $ref: '#/components/schemas/Note'
 *       '401':
 *         description: 인증되지 않은 사용자
 *       '404':
 *         description: 노트를 찾을 수 없음
 *       '500':
 *         description: 서버 내부 오류
 */
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

    // 🔒 보안: 사용자 ID 조회
    const { prisma } = await import('@/shared/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 🔒 보안: 노트 권한 검증 (가족 멤버만 조회 가능)
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

    // 가족 멤버가 아니면 접근 거부
    if (note.Baby.Family.FamilyMembers.length === 0) {
      return NextResponse.json(
        { error: '이 노트를 조회할 권한이 없습니다.' },
        { status: 403 }
      );
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

/**
 * @swagger
 * /api/notes/{noteId}:
 *   patch:
 *     summary: 노트 수정
 *     description: |
 *       특정 노트의 정보를 수정합니다. 가족 구성원만 수정 가능합니다.
 *
 *       **테스트 방법:**
 *       1. `Authorize` 버튼으로 JWT 토큰 입력
 *       2. `Try it out` 버튼 클릭
 *       3. noteId 입력 및 수정할 필드 입력
 *       4. `Execute` 버튼으로 실행
 *     tags: [Notes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *         description: 노트 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               content:
 *                 type: string
 *                 maxLength: 5000
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               completed:
 *                 type: boolean
 *               priority:
 *                 type: string
 *                 enum: [HIGH, MEDIUM, LOW]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 20
 *               metadata:
 *                 type: object
 *               reminderDays:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       '200':
 *         description: 노트 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 note:
 *                   $ref: '#/components/schemas/Note'
 *       '400':
 *         description: 잘못된 요청 (유효성 검증 실패)
 *       '401':
 *         description: 인증되지 않은 사용자
 *       '403':
 *         description: 권한 없음
 *       '404':
 *         description: 노트를 찾을 수 없음
 *       '500':
 *         description: 서버 내부 오류
 */
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
      select: { id: true },
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

/**
 * @swagger
 * /api/notes/{noteId}:
 *   delete:
 *     summary: 노트 삭제
 *     description: |
 *       특정 노트를 삭제합니다. 가족 구성원만 삭제 가능합니다.
 *
 *       **테스트 방법:**
 *       1. `Authorize` 버튼으로 JWT 토큰 입력
 *       2. `Try it out` 버튼 클릭
 *       3. noteId 입력
 *       4. `Execute` 버튼으로 실행
 *     tags: [Notes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *         description: 노트 ID
 *     responses:
 *       '200':
 *         description: 노트 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       '401':
 *         description: 인증되지 않은 사용자
 *       '403':
 *         description: 권한 없음
 *       '404':
 *         description: 노트를 찾을 수 없음
 *       '500':
 *         description: 서버 내부 오류
 */
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
      select: { id: true },
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
