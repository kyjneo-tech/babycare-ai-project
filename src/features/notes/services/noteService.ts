/**
 * Note 서비스
 * Note CRUD 및 비즈니스 로직 처리
 */

import { INoteRepository } from '../repositories/INoteRepository';
import { PrismaNoteRepository } from '../repositories/PrismaNoteRepository';
import { Note, NoteType, Priority } from '@prisma/client';

export type CreateNoteData = {
  babyId: string;
  userId: string;
  type: NoteType;
  title: string;
  content?: string;
  dueDate?: Date;
  priority?: Priority;
  tags?: string[];
  metadata?: Record<string, unknown>;
  reminderDays?: number[];
};

export type UpdateNoteData = {
  title?: string;
  content?: string;
  dueDate?: Date;
  completed?: boolean;
  priority?: Priority;
  tags?: string[];
  metadata?: Record<string, unknown>;
  reminderDays?: number[];
};

export class NoteService {
  private repository: INoteRepository;

  constructor(repository?: INoteRepository) {
    this.repository = repository || new PrismaNoteRepository();
  }

  async createNote(data: CreateNoteData): Promise<Note> {
    return this.repository.create({
      Baby: { connect: { id: data.babyId } },
      User: { connect: { id: data.userId } },
      type: data.type,
      title: data.title,
      content: data.content,
      dueDate: data.dueDate,
      priority: data.priority || 'MEDIUM',
      tags: data.tags || [],
      metadata: data.metadata ? (data.metadata as any) : undefined,
      reminderDays: data.reminderDays || [],
    });
  }

  async getNotes(
    babyId: string,
    options?: {
      type?: NoteType;
      completed?: boolean;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<Note[]> {
    return this.repository.findByBaby(babyId, options);
  }

  async getUpcomingNotes(babyId: string, withinDays: number = 7): Promise<Note[]> {
    return this.repository.findUpcoming(babyId, withinDays);
  }

  async getNoteById(id: string): Promise<Note | null> {
    return this.repository.findById(id);
  }

  async updateNote(id: string, data: UpdateNoteData): Promise<Note> {
    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.metadata !== undefined) updateData.metadata = data.metadata;
    if (data.reminderDays !== undefined)
      updateData.reminderDays = data.reminderDays;

    if (data.completed !== undefined) {
      updateData.completed = data.completed;
      if (data.completed) {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }

    return this.repository.update(id, updateData);
  }

  async toggleComplete(id: string): Promise<Note> {
    const note = await this.repository.findById(id);
    if (!note) {
      throw new Error('Note not found');
    }

    return this.updateNote(id, { completed: !note.completed });
  }

  async deleteNote(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  async createManyNotes(
    notes: Array<{
      babyId: string;
      userId: string;
      type: NoteType;
      title: string;
      content?: string;
      dueDate?: Date;
      priority?: Priority;
      tags?: string[];
      metadata?: Record<string, unknown>;
      reminderDays?: number[];
    }>
  ): Promise<number> {
    return this.repository.createMany(
      notes.map((note) => ({
        babyId: note.babyId,
        userId: note.userId,
        type: note.type,
        title: note.title,
        content: note.content,
        dueDate: note.dueDate,
        priority: note.priority,
        tags: note.tags || [],
        metadata: note.metadata ? JSON.parse(JSON.stringify(note.metadata)) : {},
        reminderDays: note.reminderDays || [],
      }))
    );
  }
}
