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
import { NoteType, Priority } from '@prisma/client';
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

    // 아기 정보 조회
    const baby = await prisma.baby.findUnique({
      where: { id: babyId },
    });

    if (!baby) {
      return { success: false, error: 'Baby not found' };
    }

    // 일정 생성
    const schedules = generateAllSchedules(babyId, user.id, baby.birthDate, options);

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
