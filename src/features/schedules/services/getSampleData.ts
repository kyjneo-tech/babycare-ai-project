// src/features/schedules/services/getSampleData.ts
import { Note, NoteType } from '@prisma/client';

const getRelativeDate = (dayOffset: number, hour: number, minute: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
};

export const getSampleSchedules = (): Note[] => {
  const sampleSchedules: Note[] = [
    {
      id: 'sample-schedule-1',
      title: 'B형 간염 2차 예방접종',
      content: '가까운 소아과에 방문하여 접종하세요.',
      type: NoteType.VACCINATION,
      dueDate: getRelativeDate(-5, 10, 0),
      completed: true,
      babyId: 'guest-baby-id',
      userId: 'guest-user-id',
      createdAt: getRelativeDate(-35, 9, 0),
      updatedAt: getRelativeDate(-5, 10, 5),
      relatedActivityId: null,
      isGenerated: true,
    },
    {
      id: 'sample-schedule-2',
      title: '초기 건강검진',
      content: '1차 영유아 건강검진 시기입니다. 문진표를 미리 작성해가세요.',
      type: NoteType.HEALTH_CHECKUP,
      dueDate: getRelativeDate(2, 14, 30),
      completed: false,
      babyId: 'guest-baby-id',
      userId: 'guest-user-id',
      createdAt: getRelativeDate(-10, 11, 0),
      updatedAt: getRelativeDate(-10, 11, 0),
      relatedActivityId: null,
      isGenerated: true,
    },
    {
      id: 'sample-schedule-3',
      title: '할머니 댁 방문',
      content: '기저귀, 분유, 여벌 옷 챙기기',
      type: NoteType.APPOINTMENT,
      dueDate: getRelativeDate(5, 11, 0),
      completed: false,
      babyId: 'guest-baby-id',
      userId: 'guest-user-id',
      createdAt: getRelativeDate(-1, 15, 0),
      updatedAt: getRelativeDate(-1, 15, 0),
      relatedActivityId: null,
      isGenerated: false,
    },
    {
      id: 'sample-schedule-4',
      title: '로타바이러스 1차 예방접종',
      content: '선택 접종 항목입니다.',
      type: NoteType.VACCINATION,
      dueDate: getRelativeDate(20, 10, 0),
      completed: false,
      babyId: 'guest-baby-id',
      userId: 'guest-user-id',
      createdAt: getRelativeDate(-10, 11, 0),
      updatedAt: getRelativeDate(-10, 11, 0),
      relatedActivityId: null,
      isGenerated: true,
    },
  ];

  return sampleSchedules;
};
