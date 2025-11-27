/**
 * Baby Schedules Auto-generation API 
 * POST: 아기의 모든 일정 자동 생성 (예방접종, 건강검진, 마일스톤 등)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/shared/lib/prisma';
import { NoteService, CreateNoteData } from '@/features/notes/services/noteService';
import { generateAllSchedules } from '@/features/notes/services/scheduleGeneratorService';

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
    };
    const {
      includeVaccination = true,
      includeHealthCheck = true,
      includeMilestone = true,
      includeWonderWeeks = true,
      includeSleepRegression = true,
      includeFeedingStage = true,
    } = body;

    // 아기 정보 조회 (필요한 필드만 select)
    const baby = await prisma.baby.findUnique({
      where: { id: babyId },
      select: {
        id: true,
        birthDate: true,
      },
    });

    if (!baby) {
      return NextResponse.json({ error: 'Baby not found' }, { status: 404 });
    }

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

    // 일정 생성
    const schedules = generateAllSchedules(babyId, user.id, baby.birthDate, {
      includeVaccination,
      includeHealthCheck,
      includeMilestone,
      includeWonderWeeks,
      includeSleepRegression,
      includeFeedingStage,
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
