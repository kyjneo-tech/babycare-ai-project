/**
 * Note 관련 Server Actions
 * 클라이언트에서 직접 호출할 수 있는 서버 액션들
 */

'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/shared/lib/prisma';
import { NoteService, CreateNoteData } from './services/noteService';
import { NoteType, Priority, Note } from '@prisma/client';
import { generateAllSchedules } from './services/scheduleGeneratorService';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * 새 노트 생성 액션
 */
export async function createNoteAction(formData: {
  babyId: string;
  type: NoteType;
  title: string;
  content?: string;
  dueDate?: string;
  priority?: Priority;
  tags?: string[];
  metadata?: Record<string, unknown>;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Rate limiting 적용
    const { noteCreateRateLimit } = await import('@/shared/lib/ratelimit');
    if (noteCreateRateLimit) {
      const { success } = await noteCreateRateLimit.limit(user.id);
      if (!success) {
        return {
          success: false,
          error: '너무 많은 노트를 생성하고 있습니다. 잠시 후 다시 시도해주세요.'
        };
      }
    }

    // 입력 검증
    if (formData.title.length > 200) {
      return { success: false, error: '제목은 200자 이내로 작성해주세요.' };
    }

    if (formData.content && formData.content.length > 5000) {
      return { success: false, error: '내용은 5000자 이내로 작성해주세요.' };
    }

    if (formData.tags && formData.tags.length > 20) {
      return { success: false, error: '태그는 최대 20개까지만 추가할 수 있습니다.' };
    }

    const noteService = new NoteService();
    const note = await noteService.createNote({
      babyId: formData.babyId,
      userId: user.id,
      type: formData.type,
      title: formData.title,
      content: formData.content,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      priority: formData.priority,
      tags: formData.tags,
      metadata: formData.metadata,
    });

    revalidatePath('/');
    revalidatePath('/notes');

    return { success: true, data: { id: note.id } };
  } catch (error) {
    console.error('createNoteAction error:', error);
    return { success: false, error: 'Failed to create note' };
  }
}

/**
 * 노트 수정 액션
 */
export async function updateNoteAction(
  noteId: string,
  formData: {
    title?: string;
    content?: string;
    dueDate?: string;
    completed?: boolean;
    priority?: Priority;
    tags?: string[];
    metadata?: any;
  }
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // 권한 검증: 노트가 사용자의 가족에 속하는지 확인
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
      return { success: false, error: '노트를 찾을 수 없습니다.' };
    }

    if (note.Baby.Family.FamilyMembers.length === 0) {
      return { success: false, error: '이 노트를 수정할 권한이 없습니다.' };
    }

    // 입력 검증
    if (formData.title && formData.title.length > 200) {
      return { success: false, error: '제목은 200자 이내로 작성해주세요.' };
    }

    if (formData.content && formData.content.length > 5000) {
      return { success: false, error: '내용은 5000자 이내로 작성해주세요.' };
    }

    if (formData.tags && formData.tags.length > 20) {
      return { success: false, error: '태그는 최대 20개까지만 추가할 수 있습니다.' };
    }

    const noteService = new NoteService();
    const updatedNote = await noteService.updateNote(noteId, {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
    });

    revalidatePath('/');
    revalidatePath('/notes');
    revalidatePath('/schedules');

    return { success: true, data: { id: updatedNote.id } };
  } catch (error) {
    console.error('updateNoteAction error:', error);
    return { success: false, error: 'Failed to update note' };
  }
}

/**
 * 노트 삭제 액션
 */
export async function deleteNoteAction(
  noteId: string
): Promise<ActionResult<null>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // 권한 검증: 노트가 사용자의 가족에 속하는지 확인
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
      return { success: false, error: '노트를 찾을 수 없습니다.' };
    }

    if (note.Baby.Family.FamilyMembers.length === 0) {
      return { success: false, error: '이 노트를 삭제할 권한이 없습니다.' };
    }

    const noteService = new NoteService();
    await noteService.deleteNote(noteId);

    revalidatePath('/');
    revalidatePath('/notes');

    return { success: true, data: null };
  } catch (error) {
    console.error('deleteNoteAction error:', error);
    return { success: false, error: 'Failed to delete note' };
  }
}

/**
 * 노트 완료 토글 액션
 */
export async function toggleNoteCompletionAction(
  noteId: string
): Promise<ActionResult<{ completed: boolean }>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // 권한 검증: 노트가 사용자의 가족에 속하는지 확인
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
      return { success: false, error: '노트를 찾을 수 없습니다.' };
    }

    if (note.Baby.Family.FamilyMembers.length === 0) {
      return { success: false, error: '이 노트를 수정할 권한이 없습니다.' };
    }

    const noteService = new NoteService();
    const updatedNote = await noteService.toggleComplete(noteId);

    revalidatePath('/');
    revalidatePath('/notes');

    return { success: true, data: { completed: updatedNote.completed } };
  } catch (error) {
    console.error('toggleNoteCompletionAction error:', error);
    return { success: false, error: 'Failed to toggle note completion' };
  }
}

/**
 * 아기의 모든 일정 자동 생성 액션
 */
export async function generateSchedulesAction(
  babyId: string,
  options?: {
    includeVaccination?: boolean;
    includeHealthCheck?: boolean;
    includeMilestone?: boolean;
    includeWonderWeeks?: boolean;
    includeSleepRegression?: boolean;
    includeFeedingStage?: boolean;
    includeDevelopmentalMilestones?: boolean;
  }
): Promise<ActionResult<{ count: number }>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // 아기 정보 조회 (필요한 필드만 select)
    const baby = await prisma.baby.findUnique({
      where: { id: babyId },
      select: {
        id: true,
        birthDate: true,
      },
    });

    if (!baby) {
      return { success: false, error: 'Baby not found' };
    }

    // 일정 생성
    console.log('[DEBUG] generateSchedulesAction options:', { ...options, includeDevelopmentalMilestones: true });
    const schedules = generateAllSchedules(babyId, user.id, baby.birthDate, {
      ...options,
      includeMilestone: false,
      includeDevelopmentalMilestones: true, // 발달 이정표 포함
    });
    console.log(`[DEBUG] Generated ${schedules.length} total schedules`);

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

    revalidatePath('/');
    revalidatePath('/notes');

    return { success: true, data: { count } };
  } catch (error) {
    console.error('generateSchedulesAction error:', error);
    return { success: false, error: 'Failed to generate schedules' };
  }
}

/**
 * 다가오는 주요 일정 조회 액션
 */
export async function getUpcomingSchedules(
  babyId: string,
  limit: number = 2
): Promise<ActionResult<(Note & { daysUntil: number })[]>> {
  try {
    // 게스트 모드에서는 샘플 일정 반환
    if (babyId === 'guest-baby-id') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const sampleSchedules = [
        {
          id: 'sample-1',
          babyId: 'guest-baby-id',
          userId: 'guest-user',
          type: 'VACCINATION' as const,
          title: 'BCG 예방접종',
          content: '결핵 예방접종',
          dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 7일 후
          completed: false,
          completedAt: null,
          priority: 'MEDIUM' as const,
          tags: [],
          metadata: {},
          reminderDays: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          daysUntil: 7
        },
        {
          id: 'sample-2',
          babyId: 'guest-baby-id',
          userId: 'guest-user',
          type: 'HEALTH_CHECKUP' as const,
          title: '4개월 건강검진',
          content: '성장 발달 확인',
          dueDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000), // 14일 후
          completed: false,
          completedAt: null,
          priority: 'MEDIUM' as const,
          tags: [],
          metadata: {},
          reminderDays: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          daysUntil: 14
        }
      ];

      return { success: true, data: sampleSchedules.slice(0, limit) };
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized' };
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const notes = await prisma.note.findMany({
      where: {
        babyId: babyId,
        completed: false,
        dueDate: {
          gte: todayStart, // 오늘 00:00 이후 (오늘 포함)
        },
        type: {
          in: ['VACCINATION', 'HEALTH_CHECKUP', 'WONDER_WEEK', 'APPOINTMENT'],
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
      take: limit,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const notesWithDaysUntil = notes.map(note => {
      const dueDate = new Date(note.dueDate!);
      dueDate.setHours(0, 0, 0, 0);
      const diffTime = dueDate.getTime() - today.getTime();
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { ...note, daysUntil };
    });

    return { success: true, data: notesWithDaysUntil };
  } catch (error) {
    console.error('getUpcomingSchedules error:', error);
    return { success: false, error: 'Failed to fetch upcoming schedules' };
  }
}

/**
 * 특정 아기의 자동 생성된 모든 일정 삭제 액션
 */
export async function deleteSchedulesForBabyAction(
  babyId: string,
): Promise<ActionResult<{ count: number }>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }
    
    // 권한 검증: 사용자가 해당 아기의 가족 구성원인지 확인
    const baby = await prisma.baby.findFirst({
      where: {
        id: babyId,
        Family: {
          FamilyMembers: {
            some: { userId: session.user.id }
          }
        }
      }
    });

    if (!baby) {
      return { success: false, error: '권한이 없거나 아기를 찾을 수 없습니다.' };
    }

    const result = await prisma.note.deleteMany({
      where: {
        babyId: babyId,
        type: {
          in: ['VACCINATION', 'HEALTH_CHECKUP', 'MILESTONE', 'WONDER_WEEK', 'SLEEP_REGRESSION', 'FEEDING_STAGE'],
        },
      },
    });

    revalidatePath(`/schedules?babyId=${babyId}`);
    revalidatePath(`/babies/${babyId}`);

    return { success: true, data: { count: result.count } };
  } catch (error) {
    console.error('deleteSchedulesForBabyAction error:', error);
    return { success: false, error: '일정 삭제 중 오류가 발생했습니다.' };
  }
}

/**
 * 특정 아기의 모든 일정 조회 액션 (페이지네이션 지원)
 */
export async function getAllSchedulesForBaby(
  babyId: string,
  options?: { offset?: number; limit?: number }
): Promise<ActionResult<{schedules: Note[], babyName: string, allBabies: {id: string, name: string}[], total: number, hasMore: boolean}>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 100;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        FamilyMembers: {
          include: {
            Family: {
              include: {
                Babies: {
                  select: { id: true, name: true },
                  orderBy: { createdAt: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    const allBabies = user?.FamilyMembers.flatMap(fm => fm.Family.Babies) ?? [];
    const currentBaby = allBabies.find(b => b.id === babyId);

    if (!currentBaby) {
      // babyId가 유효하지 않거나, 해당 유저의 아기가 아닐 경우
      return { success: true, data: { schedules: [], babyName: '', allBabies: allBabies, total: 0, hasMore: false } };
    }

    const where = {
      babyId: babyId,
      type: {
        in: ['VACCINATION', 'HEALTH_CHECKUP', 'MILESTONE', 'WONDER_WEEK', 'SLEEP_REGRESSION', 'FEEDING_STAGE', 'APPOINTMENT', 'TODO'] as NoteType[],
      },
    };

    // 전체 개수 조회
    const total = await prisma.note.count({ where });

    // 페이지네이션된 일정 조회
    const schedules = await prisma.note.findMany({
      where,
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
      skip: offset,
      take: limit,
    });

    const hasMore = offset + schedules.length < total;

    return { success: true, data: { schedules, babyName: currentBaby.name, allBabies, total, hasMore } };
  } catch (error) {
    console.error('getAllSchedulesForBaby error:', error);
    return { success: false, error: 'Failed to fetch schedules' };
  }
}

/**
 * 오늘을 기준으로 일정 조회 (투데이 핀 보장)
 * 과거 10개 + 미래 40개를 조회하여 항상 오늘 위치를 포함
 */
export async function getInitialSchedulesWithToday(
  babyId: string
): Promise<ActionResult<{
  schedules: Note[];
  todayIndex: number;
  hasMorePast: boolean;
  hasMoreFuture: boolean;
  babyName: string;
  allBabies: {id: string, name: string}[];
}>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        FamilyMembers: {
          include: {
            Family: {
              include: {
                Babies: {
                  select: { id: true, name: true },
                  orderBy: { createdAt: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    const allBabies = user?.FamilyMembers.flatMap(fm => fm.Family.Babies) ?? [];
    const currentBaby = allBabies.find(b => b.id === babyId);

    if (!currentBaby) {
      return {
        success: true,
        data: {
          schedules: [],
          todayIndex: -1,
          hasMorePast: false,
          hasMoreFuture: false,
          babyName: '',
          allBabies: allBabies
        }
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where = {
      babyId: babyId,
      type: {
        in: ['VACCINATION', 'HEALTH_CHECKUP', 'MILESTONE', 'WONDER_WEEK', 'SLEEP_REGRESSION', 'FEEDING_STAGE', 'APPOINTMENT', 'TODO'] as NoteType[],
      },
    };

    // 과거 일정 (오늘 미포함, 최신순으로 10개)
    const pastSchedules = await prisma.note.findMany({
      where: {
        ...where,
        dueDate: {
          lt: today,
        },
      },
      orderBy: [
        { dueDate: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 10,
    });

    // 미래 일정 (오늘 포함, 오래된 순으로 40개)
    const futureSchedules = await prisma.note.findMany({
      where: {
        ...where,
        dueDate: {
          gte: today,
        },
      },
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
      take: 40,
    });

    // 과거 일정을 역순으로 정렬 (오래된 순)
    const sortedPastSchedules = pastSchedules.reverse();

    // 전체 일정 결합
    const schedules = [...sortedPastSchedules, ...futureSchedules];

    // todayIndex 계산
    const todayIndex = sortedPastSchedules.length;

    // 더 많은 일정이 있는지 확인
    const totalPastCount = await prisma.note.count({
      where: {
        ...where,
        dueDate: {
          lt: today,
        },
      },
    });

    const totalFutureCount = await prisma.note.count({
      where: {
        ...where,
        dueDate: {
          gte: today,
        },
      },
    });

    const hasMorePast = totalPastCount > 10;
    const hasMoreFuture = totalFutureCount > 40;

    return {
      success: true,
      data: {
        schedules,
        todayIndex,
        hasMorePast,
        hasMoreFuture,
        babyName: currentBaby.name,
        allBabies
      }
    };
  } catch (error) {
    console.error('getInitialSchedulesWithToday error:', error);
    return { success: false, error: 'Failed to fetch schedules with today' };
  }
}

/**
 * 노트 목록 조회 액션
 */
export async function getNotesAction(
  babyId: string,
  type?: NoteType
): Promise<ActionResult<Note[]>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized' };
    }

    const notes = await prisma.note.findMany({
      where: {
        babyId,
        type: type ? type : undefined,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, data: notes };
  } catch (error) {
    console.error('getNotesAction error:', error);
    return { success: false, error: 'Failed to fetch notes' };
  }
}
