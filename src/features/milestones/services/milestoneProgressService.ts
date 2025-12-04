/**
 * Milestone Progress Service
 * 발달 이정표 진행 상황 관리 서비스
 */

import { prisma } from '@/shared/lib/prisma';
import { MilestoneProgress } from '@prisma/client';

export type CategoryStats = {
  category: string;
  total: number;
  achieved: number;
  percentage: number;
};

export type MilestoneStats = {
  totalItems: number;
  achievedItems: number;
  percentage: number;
  categories: CategoryStats[];
};

export class MilestoneProgressService {
  /**
   * 이정표 항목 토글 (달성 ↔ 미달성)
   */
  async toggleItem(
    noteId: string,
    category: string,
    itemIndex: number
  ): Promise<MilestoneProgress> {
    // 기존 진행 상황 조회
    const existing = await prisma.milestoneProgress.findUnique({
      where: {
        noteId_category_itemIndex: {
          noteId,
          category,
          itemIndex,
        },
      },
    });

    if (existing) {
      // 이미 존재하면 토글
      return prisma.milestoneProgress.update({
        where: { id: existing.id },
        data: {
          achieved: !existing.achieved,
          achievedAt: !existing.achieved ? new Date() : null,
        },
      });
    } else {
      // 없으면 새로 생성 (달성 상태로)
      return prisma.milestoneProgress.create({
        data: {
          noteId,
          category,
          itemIndex,
          achieved: true,
          achievedAt: new Date(),
        },
      });
    }
  }

  /**
   * 이정표 항목에 메모 추가
   */
  async addMemo(progressId: string, memo: string): Promise<MilestoneProgress> {
    return prisma.milestoneProgress.update({
      where: { id: progressId },
      data: { memo },
    });
  }

  /**
   * 특정 이정표의 모든 진행 상황 조회
   */
  async getProgress(noteId: string): Promise<MilestoneProgress[]> {
    return prisma.milestoneProgress.findMany({
      where: { noteId },
      orderBy: [{ category: 'asc' }, { itemIndex: 'asc' }],
    });
  }

  /**
   * 이정표 통계 계산
   */
  async getStats(noteId: string, categories: string[]): Promise<MilestoneStats> {
    const progress = await this.getProgress(noteId);

    // 카테고리별 통계
    const categoryStats: CategoryStats[] = categories.map((category) => {
      const categoryProgress = progress.filter((p) => p.category === category);
      const achieved = categoryProgress.filter((p) => p.achieved).length;
      const total = categoryProgress.length;

      return {
        category,
        total,
        achieved,
        percentage: total > 0 ? Math.round((achieved / total) * 100) : 0,
      };
    });

    // 전체 통계
    const totalItems = progress.length;
    const achievedItems = progress.filter((p) => p.achieved).length;

    return {
      totalItems,
      achievedItems,
      percentage: totalItems > 0 ? Math.round((achievedItems / totalItems) * 100) : 0,
      categories: categoryStats,
    };
  }

  /**
   * 특정 항목의 진행 상황 조회 (없으면 null)
   */
  async getItemProgress(
    noteId: string,
    category: string,
    itemIndex: number
  ): Promise<MilestoneProgress | null> {
    return prisma.milestoneProgress.findUnique({
      where: {
        noteId_category_itemIndex: {
          noteId,
          category,
          itemIndex,
        },
      },
    });
  }
}
