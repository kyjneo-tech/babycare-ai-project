// src/shared/types/schemas.ts
import { z } from 'zod';

// ActivityType Enum (Prisma의 ActivityType과 일치)
export const ActivityTypeEnum = z.enum(['FEEDING', 'SLEEP', 'DIAPER', 'BATH', 'PLAY', 'MEDICINE', 'TEMPERATURE']);

// 예측된 활동 패턴 스키마
export const PredictedPatternSchema = z.object({
  nextTime: z.date().optional(),
  confidence: z.number().optional(), // 신뢰도
  avgInterval: z.number().optional(), // 평균 간격 (분)
  avgDuration: z.number().optional(), // 평균 지속 시간 (분)
  avgAmount: z.number().optional(), // 평균 수유량 (ml) - FEEDING에만 해당
});

export type PredictedPattern = z.infer<typeof PredictedPatternSchema>;

export const PredictedActivityPatternsSchema = z.object({
  FEEDING: PredictedPatternSchema.optional(),
  SLEEP: PredictedPatternSchema.optional(),
  DIAPER: PredictedPatternSchema.optional(),
  // BATH, PLAY, MEDICINE은 현재 예측에서 제외하지만,
  // 필요시 PredictedPatternSchema.optional()로 추가 가능
});

export type PredictedActivityPatterns = z.infer<typeof PredictedActivityPatternsSchema>;

// User 스키마 (회원가입 시 유효성 검사)
export const CreateUserSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.'),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

// Baby 스키마 (아기 생성/업데이트 시 유효성 검사)
export const CreateBabySchema = z.object({
  name: z.string().min(1, '아기 이름을 입력해주세요.'),
  gender: z.string().min(1, '성별을 선택해주세요.'), // 'male' | 'female' 등으로 제한 가능
  birthDate: z.preprocess((arg) => {
    if (typeof arg == 'string' || arg instanceof Date) return new Date(arg);
  }, z.date()),
  birthTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, '유효한 시간 형식(HH:MM)을 입력해주세요.'),
  photoUrl: z.string().url('유효한 URL을 입력해주세요.').optional(),
});

export type CreateBabyInput = z.infer<typeof CreateBabySchema>;

// Activity 스키마 (활동 생성 시 유효성 검사)
export const CreateActivitySchema = z.object({
  babyId: z.string().min(1, '아기 ID는 필수입니다.'),
  type: ActivityTypeEnum,
  startTime: z.preprocess((arg) => {
    if (typeof arg == 'string' || arg instanceof Date) return new Date(arg);
  }, z.date()),
  endTime: z.preprocess((arg) => {
    if (typeof arg == 'string' || arg instanceof Date) return new Date(arg);
  }, z.date()).optional(),
  note: z.string().optional(),

  // 수유 관련 필드
  feedingType: z.string().optional(),
  feedingAmount: z.number().int().positive('수유량은 양수여야 합니다.').optional(),
  breastSide: z.string().optional(),

  // 수면 관련 필드
  sleepType: z.string().optional(),
  duration: z.number().int().positive('수면 시간은 양수여야 합니다.').optional(),

  // 배변 관련 필드
  diaperType: z.string().optional(),
  stoolColor: z.string().optional(),
  stoolCondition: z.string().optional(),

  // 약 복용 관련 필드
  medicineName: z.string().optional(),
  medicineAmount: z.string().optional(),
  medicineUnit: z.string().optional(),

  // 체온 관련 필드
  temperature: z.number().positive('체온은 양수여야 합니다.').optional(),
}).superRefine((data, ctx) => {
  // 활동 유형에 따른 필수 필드 검증
  if (data.type === 'FEEDING') {
    if (!data.feedingType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '수유 유형은 필수입니다.',
        path: ['feedingType'],
      });
    }
    // 모유 수유가 아닌 경우에만 수유량 필수
    if (data.feedingType !== 'breast' && !data.feedingAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '수유량은 필수입니다.',
        path: ['feedingAmount'],
      });
    }
  }
  if (data.type === 'SLEEP') {
    if (!data.endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '수면 종료 시간은 필수입니다.',
        path: ['endTime'],
      });
    }
    if (!data.sleepType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '수면 유형은 필수입니다.',
        path: ['sleepType'],
      });
    }
  }
  if (data.type === 'DIAPER') {
    if (!data.diaperType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '배변 유형은 필수입니다.',
        path: ['diaperType'],
      });
    }
  }
  if (data.type === 'TEMPERATURE') {
    if (!data.temperature) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '체온은 필수입니다.',
        path: ['temperature'],
      });
    }
  }
});

export type CreateActivityInput = z.infer<typeof CreateActivitySchema>;

// BabyMeasurement 스키마 (측정값 생성 시 유효성 검사)
export const CreateMeasurementSchema = z.object({
  babyId: z.string().min(1, '아기 ID는 필수입니다.'),
  weight: z.number().positive('체중은 0보다 커야 합니다.'),
  height: z.number().positive('키는 0보다 커야 합니다.'),
  note: z.string().optional(),
});

export type CreateMeasurementInput = z.infer<typeof CreateMeasurementSchema>;

// 기타 필요한 스키마들을 여기에 추가할 수 있습니다.

export interface DailyStats {
  feeding: {
    count: number;
    totalAmount: number;
    avgAmount: number;
  };
  sleep: {
    count: number;
    totalHours: number;
  };
  diaper: {
    urine: number;
    stool: number;
  };
}

export interface WeeklyStat {
  date: string;
  totalFeeding: number;
  totalSleep: number;
}

export interface PatternData {
  hour: string;
  [key: string]: string | number;
}
