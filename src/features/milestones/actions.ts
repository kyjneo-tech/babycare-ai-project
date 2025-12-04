/**
 * Milestone Progress Actions
 * 발달 이정표 진행 상황 Server Actions
 */

'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { MilestoneProgressService, MilestoneStats } from './services/milestoneProgressService';
import { MilestoneProgress } from '@prisma/client';
import { prisma } from '@/shared/lib/prisma';

export type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * 이정표 항목 토글 (달성 ↔ 미달성)
 */
export async function toggleMilestoneItemAction(
  noteId: string,
  category: string,
  itemIndex: number
): Promise<ActionResult<MilestoneProgress>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Note 소유권 확인
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { userId: true, type: true },
    });

    if (!note) {
      return { success: false, error: 'Note not found' };
    }

    if (note.userId !== session.user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    if (note.type !== 'MILESTONE') {
      return { success: false, error: 'Note is not a milestone' };
    }

    const service = new MilestoneProgressService();
    const progress = await service.toggleItem(noteId, category, itemIndex);

    return { success: true, data: progress };
  } catch (error) {
    console.error('toggleMilestoneItemAction error:', error);
    return { success: false, error: 'Failed to toggle milestone item' };
  }
}

/**
 * 이정표 항목에 메모 추가
 */
export async function addMilestoneItemMemoAction(
  progressId: string,
  memo: string
): Promise<ActionResult<MilestoneProgress>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Progress 소유권 확인
    const progress = await prisma.milestoneProgress.findUnique({
      where: { id: progressId },
      include: {
        Note: {
          select: { userId: true },
        },
      },
    });

    if (!progress) {
      return { success: false, error: 'Progress not found' };
    }

    if (progress.Note.userId !== session.user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const service = new MilestoneProgressService();
    const updated = await service.addMemo(progressId, memo);

    return { success: true, data: updated };
  } catch (error) {
    console.error('addMilestoneItemMemoAction error:', error);
    return { success: false, error: 'Failed to add memo' };
  }
}

/**
 * 이정표 진행 상황 조회
 */
export async function getMilestoneProgressAction(
  noteId: string
): Promise<ActionResult<MilestoneProgress[]>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Note 소유권 확인
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { userId: true },
    });

    if (!note) {
      return { success: false, error: 'Note not found' };
    }

    if (note.userId !== session.user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const service = new MilestoneProgressService();
    const progress = await service.getProgress(noteId);

    return { success: true, data: progress };
  } catch (error) {
    console.error('getMilestoneProgressAction error:', error);
    return { success: false, error: 'Failed to get milestone progress' };
  }
}

/**
 * 이정표 통계 조회
 */
export async function getMilestoneStatsAction(
  noteId: string,
  categories: string[]
): Promise<ActionResult<MilestoneStats>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Note 소유권 확인
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { userId: true },
    });

    if (!note) {
      return { success: false, error: 'Note not found' };
    }

    if (note.userId !== session.user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const service = new MilestoneProgressService();
    const stats = await service.getStats(noteId, categories);

    return { success: true, data: stats };
  } catch (error) {
    console.error('getMilestoneStatsAction error:', error);
    return { success: false, error: 'Failed to get milestone stats' };
  }
}
