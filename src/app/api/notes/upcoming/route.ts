/**
 * Upcoming Notes API Route
 * GET: 다가오는 일정 조회 (7일 이내)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { NoteService } from '@/features/notes/services/noteService';

/**
 * @swagger
 * /api/notes/upcoming:
 *   get:
 *     summary: 다가오는 일정 조회
 *     description: |
 *       지정된 기간 내에 예정된 노트를 조회합니다. (기본 7일 이내)
 *
 *       **테스트 방법:**
 *       1. `Authorize` 버튼으로 JWT 토큰 입력
 *       2. `Try it out` 버튼 클릭
 *       3. babyId와 withinDays(선택) 입력
 *       4. `Execute` 버튼으로 실행
 *       5. 다가오는 일정 목록 확인
 *     tags: [Notes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: babyId
 *         required: true
 *         schema:
 *           type: string
 *         description: 아기 ID
 *       - in: query
 *         name: withinDays
 *         required: false
 *         schema:
 *           type: integer
 *           default: 7
 *         description: 조회할 기간 (일 단위, 기본값 7일)
 *     responses:
 *       '200':
 *         description: 일정 조회 성공
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
 *         description: babyId가 필요합니다
 *       '401':
 *         description: 인증되지 않은 사용자
 *       '500':
 *         description: 서버 내부 오류
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const babyId = searchParams.get('babyId');
    const withinDays = parseInt(searchParams.get('withinDays') || '7');

    if (!babyId) {
      return NextResponse.json(
        { error: 'babyId is required' },
        { status: 400 }
      );
    }

    const noteService = new NoteService();
    const notes = await noteService.getUpcomingNotes(babyId, withinDays);

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('GET /api/notes/upcoming error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
