import { prisma } from '@/shared/lib/prisma';
import { redis } from '@/shared/lib/redis';
import { INoteRepository, NoteFilters } from './INoteRepository';
import { Note, Prisma } from '@prisma/client';

export class PrismaNoteRepository implements INoteRepository {
  async create(data: Prisma.NoteCreateInput): Promise<Note> {
    const note = await prisma.note.create({
      data,
    });

    // Invalidate cache
    const babyId = (data.Baby as any)?.connect?.id;
    if (babyId) {
      await this.invalidateCache(babyId);
    }

    return note;
  }

  async findById(id: string): Promise<Note | null> {
    return prisma.note.findUnique({
      where: { id },
    });
  }

  async findByBaby(babyId: string, filters?: NoteFilters): Promise<Note[]> {
    const where: Prisma.NoteWhereInput = {
      babyId,
    };

    if (filters) {
      if (filters.type) {
        where.type = filters.type;
      }
      if (filters.completed !== undefined) {
        where.completed = filters.completed;
      }
      if (filters.startDate || filters.endDate) {
        where.dueDate = {};
        if (filters.startDate) {
          where.dueDate.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.dueDate.lte = filters.endDate;
        }
      }
    }

    return prisma.note.findMany({
      where,
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      include: {
        User: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async findUpcoming(babyId: string, withinDays: number = 7): Promise<Note[]> {
    const cacheKey = `Baby:${babyId}:upcoming-notes:${withinDays}`;
    const cacheDuration = 300; // 5 minutes

    const cached = await redis.get(cacheKey);
    if (cached) {
      if (typeof cached === 'string') {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          console.error('Error parsing cached notes:', e);
        }
      } else if (Array.isArray(cached)) {
        return cached as Note[];
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + withinDays);

    const notes = await prisma.note.findMany({
      where: {
        babyId,
        completed: false,
        dueDate: {
          gte: today,
          lte: futureDate,
        },
      },
      orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
      include: {
        User: {
          select: {
            name: true,
          },
        },
      },
      take: 50,
    });

    await redis.setex(cacheKey, cacheDuration, JSON.stringify(notes));

    return notes;
  }

  async update(id: string, data: Prisma.NoteUpdateInput): Promise<Note> {
    const note = await prisma.note.update({
      where: { id },
      data,
    });

    // Invalidate cache
    await this.invalidateCache(note.babyId);

    return note;
  }

  async delete(id: string): Promise<void> {
    const note = await prisma.note.findUnique({
      where: { id },
      select: { babyId: true },
    });

    await prisma.note.delete({
      where: { id },
    });

    if (note) {
      await this.invalidateCache(note.babyId);
    }
  }

  async createMany(data: Prisma.NoteCreateManyInput[]): Promise<number> {
    const result = await prisma.note.createMany({
      data,
      skipDuplicates: true,
    });

    // Invalidate cache for all affected babies
    const babyIds = [...new Set(data.map((note) => note.babyId))];
    await Promise.all(babyIds.map((id) => this.invalidateCache(id)));

    return result.count;
  }

  /**
   * 가족 전체의 투두 조회 (Baby의 Family 관계 활용)
   */
  async getTodosByFamily(familyId: string, filters?: NoteFilters): Promise<Note[]> {
    const where: Prisma.NoteWhereInput = {
      type: 'TODO',
      Baby: {
        familyId,
      },
    };

    if (filters) {
      if (filters.completed !== undefined) {
        where.completed = filters.completed;
      }
      if (filters.startDate || filters.endDate) {
        where.dueDate = {};
        if (filters.startDate) {
          where.dueDate.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.dueDate.lte = filters.endDate;
        }
      }
    }

    return prisma.note.findMany({
      where,
      orderBy: [
        { completed: 'asc' },     // 미완료 먼저
        { priority: 'desc' },      // 우선순위 높은 것부터
        { dueDate: 'asc' },        // 마감일 빠른 것부터
        { createdAt: 'desc' },     // 최신 순
      ],
      include: {
        User: {
          select: {
            id: true,
            name: true,
          },
        },
        Baby: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * 담당자별 투두 조회
   */
  async getTodosByAssignee(familyId: string, assigneeId: string): Promise<Note[]> {
    return prisma.note.findMany({
      where: {
        type: 'TODO',
        Baby: {
          familyId,
        },
        metadata: {
          path: ['assigneeId'],
          equals: assigneeId,
        },
      },
      orderBy: [
        { completed: 'asc' },
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
      include: {
        User: {
          select: {
            id: true,
            name: true,
          },
        },
        Baby: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * 카테고리별 투두 조회
   */
  async getTodosByCategory(familyId: string, category: string): Promise<Note[]> {
    return prisma.note.findMany({
      where: {
        type: 'TODO',
        Baby: {
          familyId,
        },
        metadata: {
          path: ['category'],
          equals: category,
        },
      },
      orderBy: [
        { completed: 'asc' },
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
      include: {
        User: {
          select: {
            id: true,
            name: true,
          },
        },
        Baby: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  private async invalidateCache(babyId: string) {
    const keys = await redis.keys(`Baby:${babyId}:*notes*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

