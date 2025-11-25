import { Note, Prisma, NoteType } from '@prisma/client';

export type NoteFilters = {
  type?: NoteType;
  completed?: boolean;
  startDate?: Date;
  endDate?: Date;
};

export interface INoteRepository {
  create(data: Prisma.NoteCreateInput): Promise<Note>;
  findById(id: string): Promise<Note | null>;
  findByBaby(babyId: string, filters?: NoteFilters): Promise<Note[]>;
  findUpcoming(babyId: string, withinDays: number): Promise<Note[]>;
  update(id: string, data: Prisma.NoteUpdateInput): Promise<Note>;
  delete(id: string): Promise<void>;
  createMany(data: Prisma.NoteCreateManyInput[]): Promise<number>;
}
