// src/shared/types/__tests__/schemas.test.ts
import { CreateActivitySchema } from '../schemas';

describe('CreateActivitySchema', () => {
  describe('[성공] FEEDING 유형', () => {
    it('bottle 타입일 때 feedingType과 feedingAmount가 필수여야 한다', () => {
      // Given
      const validData = {
        babyId: 'baby-1',
        type: 'FEEDING',
        startTime: new Date(),
        feedingType: 'bottle',
        feedingAmount: 120,
      };

      // When
      const result = CreateActivitySchema.safeParse(validData);

      // Then
      expect(result.success).toBe(true);
    });

    it('formula 타입일 때 feedingType과 feedingAmount가 필수여야 한다', () => {
      // Given
      const validData = {
        babyId: 'baby-1',
        type: 'FEEDING',
        startTime: new Date(),
        feedingType: 'formula',
        feedingAmount: 150,
      };

      // When
      const result = CreateActivitySchema.safeParse(validData);

      // Then
      expect(result.success).toBe(true);
    });

    it('breast 타입일 때 feedingAmount는 선택 사항이어야 한다', () => {
      // Given: feedingAmount 없음
      const validData = {
        babyId: 'baby-1',
        type: 'FEEDING',
        startTime: new Date(),
        feedingType: 'breast',
      };

      // When
      const result = CreateActivitySchema.safeParse(validData);

      // Then
      expect(result.success).toBe(true);
    });

    it('breast 타입에서 feedingAmount를 제공해도 허용해야 한다', () => {
      // Given
      const validData = {
        babyId: 'baby-1',
        type: 'FEEDING',
        startTime: new Date(),
        feedingType: 'breast',
        feedingAmount: 100, // 선택적으로 제공
      };

      // When
      const result = CreateActivitySchema.safeParse(validData);

      // Then
      expect(result.success).toBe(true);
    });
  });

  describe('[실패] FEEDING 유형', () => {
    it('feedingType이 없으면 에러가 발생해야 한다', () => {
      // Given
      const invalidData = {
        babyId: 'baby-1',
        type: 'FEEDING',
        startTime: new Date(),
        // feedingType 누락
      };

      // When
      const result = CreateActivitySchema.safeParse(invalidData);

      // Then
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('feedingType'))).toBe(true);
        expect(result.error.issues.some(issue => issue.message === '수유 유형은 필수입니다.')).toBe(true);
      }
    });

    it('bottle/formula 타입에서 feedingAmount가 없으면 에러가 발생해야 한다', () => {
      // Given
      const invalidData = {
        babyId: 'baby-1',
        type: 'FEEDING',
        startTime: new Date(),
        feedingType: 'bottle',
        // feedingAmount 누락
      };

      // When
      const result = CreateActivitySchema.safeParse(invalidData);

      // Then
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('feedingAmount'))).toBe(true);
        expect(result.error.issues.some(issue => issue.message === '수유량은 필수입니다.')).toBe(true);
      }
    });

    it('feedingAmount가 음수이면 에러가 발생해야 한다', () => {
      // Given
      const invalidData = {
        babyId: 'baby-1',
        type: 'FEEDING',
        startTime: new Date(),
        feedingType: 'bottle',
        feedingAmount: -10,
      };

      // When
      const result = CreateActivitySchema.safeParse(invalidData);

      // Then
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.message === '수유량은 양수여야 합니다.')).toBe(true);
      }
    });

    it('feedingAmount가 0이면 에러가 발생해야 한다', () => {
      // Given
      const invalidData = {
        babyId: 'baby-1',
        type: 'FEEDING',
        startTime: new Date(),
        feedingType: 'formula',
        feedingAmount: 0,
      };

      // When
      const result = CreateActivitySchema.safeParse(invalidData);

      // Then
      expect(result.success).toBe(false);
    });
  });

  describe('[성공] SLEEP 유형', () => {
    it('endTime과 sleepType이 제공되면 성공해야 한다', () => {
      // Given
      const validData = {
        babyId: 'baby-1',
        type: 'SLEEP',
        startTime: new Date('2025-01-01T10:00:00Z'),
        endTime: new Date('2025-01-01T12:00:00Z'),
        sleepType: 'nap',
      };

      // When
      const result = CreateActivitySchema.safeParse(validData);

      // Then
      expect(result.success).toBe(true);
    });

    it('duration이 자동 계산되지 않고 직접 제공될 수 있어야 한다', () => {
      // Given
      const validData = {
        babyId: 'baby-1',
        type: 'SLEEP',
        startTime: new Date(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2시간 후
        sleepType: 'night',
        duration: 120, // 직접 제공
      };

      // When
      const result = CreateActivitySchema.safeParse(validData);

      // Then
      expect(result.success).toBe(true);
    });
  });

  describe('[실패] SLEEP 유형', () => {
    it('endTime이 없으면 에러가 발생해야 한다', () => {
      // Given
      const invalidData = {
        babyId: 'baby-1',
        type: 'SLEEP',
        startTime: new Date(),
        sleepType: 'nap',
        // endTime 누락
      };

      // When
      const result = CreateActivitySchema.safeParse(invalidData);

      // Then
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('endTime'))).toBe(true);
        expect(result.error.issues.some(issue => issue.message === '수면 종료 시간은 필수입니다.')).toBe(true);
      }
    });

    it('sleepType이 없으면 에러가 발생해야 한다', () => {
      // Given
      const invalidData = {
        babyId: 'baby-1',
        type: 'SLEEP',
        startTime: new Date(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        // sleepType 누락
      };

      // When
      const result = CreateActivitySchema.safeParse(invalidData);

      // Then
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('sleepType'))).toBe(true);
        expect(result.error.issues.some(issue => issue.message === '수면 유형은 필수입니다.')).toBe(true);
      }
    });

    it('duration이 음수이면 에러가 발생해야 한다', () => {
      // Given
      const invalidData = {
        babyId: 'baby-1',
        type: 'SLEEP',
        startTime: new Date(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        sleepType: 'nap',
        duration: -10,
      };

      // When
      const result = CreateActivitySchema.safeParse(invalidData);

      // Then
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.message === '수면 시간은 양수여야 합니다.')).toBe(true);
      }
    });
  });

  describe('[성공] DIAPER 유형', () => {
    it('diaperType이 제공되면 성공해야 한다', () => {
      // Given
      const validData = {
        babyId: 'baby-1',
        type: 'DIAPER',
        startTime: new Date(),
        diaperType: 'pee',
      };

      // When
      const result = CreateActivitySchema.safeParse(validData);

      // Then
      expect(result.success).toBe(true);
    });

    it('stoolColor와 stoolCondition은 선택 사항이어야 한다', () => {
      // Given
      const validData = {
        babyId: 'baby-1',
        type: 'DIAPER',
        startTime: new Date(),
        diaperType: 'poop',
        stoolColor: 'yellow',
        stoolCondition: 'soft',
      };

      // When
      const result = CreateActivitySchema.safeParse(validData);

      // Then
      expect(result.success).toBe(true);
    });
  });

  describe('[실패] DIAPER 유형', () => {
    it('diaperType이 없으면 에러가 발생해야 한다', () => {
      // Given
      const invalidData = {
        babyId: 'baby-1',
        type: 'DIAPER',
        startTime: new Date(),
        // diaperType 누락
      };

      // When
      const result = CreateActivitySchema.safeParse(invalidData);

      // Then
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('diaperType'))).toBe(true);
        expect(result.error.issues.some(issue => issue.message === '배변 유형은 필수입니다.')).toBe(true);
      }
    });
  });

  describe('[성공] TEMPERATURE 유형', () => {
    it('temperature가 제공되면 성공해야 한다', () => {
      // Given
      const validData = {
        babyId: 'baby-1',
        type: 'TEMPERATURE',
        startTime: new Date(),
        temperature: 37.5,
      };

      // When
      const result = CreateActivitySchema.safeParse(validData);

      // Then
      expect(result.success).toBe(true);
    });

    it('정상 체온 범위(35~40°C)를 허용해야 한다', () => {
      // Given: 35°C
      const validData1 = {
        babyId: 'baby-1',
        type: 'TEMPERATURE',
        startTime: new Date(),
        temperature: 35.0,
      };

      // Given: 40°C
      const validData2 = {
        babyId: 'baby-1',
        type: 'TEMPERATURE',
        startTime: new Date(),
        temperature: 40.0,
      };

      // When
      const result1 = CreateActivitySchema.safeParse(validData1);
      const result2 = CreateActivitySchema.safeParse(validData2);

      // Then
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });
  });

  describe('[실패] TEMPERATURE 유형', () => {
    it('temperature가 없으면 에러가 발생해야 한다', () => {
      // Given
      const invalidData = {
        babyId: 'baby-1',
        type: 'TEMPERATURE',
        startTime: new Date(),
        // temperature 누락
      };

      // When
      const result = CreateActivitySchema.safeParse(invalidData);

      // Then
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('temperature'))).toBe(true);
        expect(result.error.issues.some(issue => issue.message === '체온은 필수입니다.')).toBe(true);
      }
    });

    it('temperature가 음수이면 에러가 발생해야 한다', () => {
      // Given
      const invalidData = {
        babyId: 'baby-1',
        type: 'TEMPERATURE',
        startTime: new Date(),
        temperature: -10,
      };

      // When
      const result = CreateActivitySchema.safeParse(invalidData);

      // Then
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.message === '체온은 양수여야 합니다.')).toBe(true);
      }
    });

    it('temperature가 0이면 에러가 발생해야 한다', () => {
      // Given
      const invalidData = {
        babyId: 'baby-1',
        type: 'TEMPERATURE',
        startTime: new Date(),
        temperature: 0,
      };

      // When
      const result = CreateActivitySchema.safeParse(invalidData);

      // Then
      expect(result.success).toBe(false);
    });
  });

  describe('[성공] 기타 활동 유형', () => {
    it('BATH 타입은 기본 필드만 있어도 성공해야 한다', () => {
      // Given
      const validData = {
        babyId: 'baby-1',
        type: 'BATH',
        startTime: new Date(),
      };

      // When
      const result = CreateActivitySchema.safeParse(validData);

      // Then
      expect(result.success).toBe(true);
    });

    it('PLAY 타입은 기본 필드만 있어도 성공해야 한다', () => {
      // Given
      const validData = {
        babyId: 'baby-1',
        type: 'PLAY',
        startTime: new Date(),
      };

      // When
      const result = CreateActivitySchema.safeParse(validData);

      // Then
      expect(result.success).toBe(true);
    });

    it('MEDICINE 타입은 약 정보 없이도 성공해야 한다', () => {
      // Given
      const validData = {
        babyId: 'baby-1',
        type: 'MEDICINE',
        startTime: new Date(),
      };

      // When
      const result = CreateActivitySchema.safeParse(validData);

      // Then
      expect(result.success).toBe(true);
    });

    it('MEDICINE 타입에 약 정보를 추가해도 성공해야 한다', () => {
      // Given
      const validData = {
        babyId: 'baby-1',
        type: 'MEDICINE',
        startTime: new Date(),
        medicineName: '타이레놀',
        medicineAmount: '2.5',
        medicineUnit: 'ml',
      };

      // When
      const result = CreateActivitySchema.safeParse(validData);

      // Then
      expect(result.success).toBe(true);
    });
  });

  describe('[실패] 공통 필드', () => {
    it('babyId가 없으면 에러가 발생해야 한다', () => {
      // Given
      const invalidData = {
        type: 'FEEDING',
        startTime: new Date(),
        feedingType: 'bottle',
        feedingAmount: 120,
      };

      // When
      const result = CreateActivitySchema.safeParse(invalidData);

      // Then
      expect(result.success).toBe(false);
    });

    it('type이 없으면 에러가 발생해야 한다', () => {
      // Given
      const invalidData = {
        babyId: 'baby-1',
        startTime: new Date(),
      };

      // When
      const result = CreateActivitySchema.safeParse(invalidData);

      // Then
      expect(result.success).toBe(false);
    });

    it('startTime이 없으면 에러가 발생해야 한다', () => {
      // Given
      const invalidData = {
        babyId: 'baby-1',
        type: 'BATH',
      };

      // When
      const result = CreateActivitySchema.safeParse(invalidData);

      // Then
      expect(result.success).toBe(false);
    });
  });
});
