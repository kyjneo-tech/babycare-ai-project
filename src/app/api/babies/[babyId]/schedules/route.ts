/**
 * Baby Schedules Auto-generation API
 * POST: 아기의 모든 일정 자동 생성 (예방접종, 건강검진, 마일스톤 등)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/shared/lib/prisma';
import { NoteService, CreateNoteData } from '@/features/notes/services/noteService';
import { generateAllSchedules } from '@/features/notes/services/scheduleGeneratorService';

/**
 * @swagger
 * /api/babies/{babyId}/schedules:
 *   post:
 *     summary: 아기 일정 자동 생성
 *     description: |
 *       아기의 생년월일을 기준으로 예방접종, 건강검진, 마일스톤, 원더윅스, 수면 퇴행, 이유식 단계 등의 일정을 자동으로 생성합니다.
 *
 *       **테스트 방법:**
 *       1. `Authorize` 버튼으로 JWT 토큰 입력
 *       2. `Try it out` 버튼 클릭
 *       3. babyId 입력 및 생성할 일정 유형 선택 (모두 true가 기본값)
 *       4. `Execute` 버튼으로 실행
 *       5. 생성된 일정 개수 확인
 *     tags: [Babies]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: babyId
 *         required: true
 *         schema:
 *           type: string
 *         description: 아기 ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               includeVaccination:
 *                 type: boolean
 *                 default: true
 *                 description: 예방접종 일정 포함 여부
 *               includeHealthCheck:
 *                 type: boolean
 *                 default: true
 *                 description: 건강검진 일정 포함 여부
 *               includeMilestone:
 *                 type: boolean
 *                 default: true
 *                 description: 마일스톤 일정 포함 여부
 *               includeWonderWeeks:
 *                 type: boolean
 *                 default: true
 *                 description: 원더윅스 일정 포함 여부
 *               includeSleepRegression:
 *                 type: boolean
 *                 default: true
 *                 description: 수면 퇴행 일정 포함 여부
 *               includeFeedingStage:
 *                 type: boolean
 *                 default: true
 *                 description: 이유식 단계 일정 포함 여부
 *     responses:
 *       '200':
 *         description: 일정 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                   description: 생성된 일정 개수
 *                 message:
 *                   type: string
 *                   example: 50개의 일정이 생성되었습니다.
 *       '401':
 *         description: 인증되지 않은 사용자
 *       '404':
 *         description: 아기 또는 사용자를 찾을 수 없음
 *       '500':
 *         description: 서버 내부 오류
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ babyId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { babyId } = await params;
    const body = await request.json() as {
      includeVaccination?: boolean;
      includeHealthCheck?: boolean;
      includeMilestone?: boolean;
      includeWonderWeeks?: boolean;
      includeSleepRegression?: boolean;
      includeFeedingStage?: boolean;
      includeDevelopmentalMilestones?: boolean;
    };
    const {
      includeVaccination = true,
      includeHealthCheck = true,
      includeMilestone = true,
      includeWonderWeeks = true,
      includeSleepRegression = true,
      includeFeedingStage = true,
      includeDevelopmentalMilestones = true,
    } = body;

    // 세션에서 userId 가져오기 (필요한 필드만 select)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 🔒 보안: 아기 정보 조회 (권한 검증 포함)
    // 현재 사용자가 해당 Family의 멤버인 경우만 조회
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
      select: {
        id: true,
        birthDate: true,
      },
    });

    if (!baby) {
      return NextResponse.json({
        error: 'Baby not found or access denied'
      }, { status: 404 });
    }

    // 일정 생성
    const schedules = generateAllSchedules(babyId, user.id, baby.birthDate, {
      includeVaccination,
      includeHealthCheck,
      includeMilestone,
      includeWonderWeeks,
      includeSleepRegression,
      includeFeedingStage,
      includeDevelopmentalMilestones,
    });

    // CreateNoteData 타입으로 변환
    const cleanedSchedules: CreateNoteData[] = schedules.map(schedule => ({
      babyId: schedule.babyId,
      userId: schedule.userId,
      type: schedule.type,
      title: schedule.title,
      content: schedule.content || undefined,
      dueDate: schedule.dueDate ? new Date(schedule.dueDate) : undefined,
      priority: schedule.priority || undefined,
      tags: Array.isArray(schedule.tags) ? schedule.tags : undefined,
      metadata: schedule.metadata && typeof schedule.metadata === 'object' ? schedule.metadata as Record<string, unknown> : undefined,
      reminderDays: Array.isArray(schedule.reminderDays) ? schedule.reminderDays : undefined
    }));

    // 데이터베이스에 일괄 저장
    const noteService = new NoteService();
    const count = await noteService.createManyNotes(cleanedSchedules);

    return NextResponse.json({
      success: true,
      count,
      message: `${count}개의 일정이 생성되었습니다.`,
    });
  } catch (error) {
    console.error('POST /api/babies/[babyId]/schedules error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
