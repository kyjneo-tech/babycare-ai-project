// src/shared/lib/__tests__/growthGuidelines.test.ts
import {
  getWeightPercentile,
  getFeedingGuideline,
  getSleepGuideline,
  getDexibuprofenGuideline
} from '../growthGuidelines';

describe('growthGuidelines', () => {
  describe('getWeightPercentile', () => {
    describe('[성공] 정상 케이스 - 남아', () => {
      it('12개월 남아, 10kg → 정확한 백분위를 반환해야 한다', () => {
        // Given
        const weight = 10;
        const ageInMonths = 12;
        const gender = 'male';

        // When
        const result = getWeightPercentile(weight, ageInMonths, gender);

        // Then
        // 12개월 남아: p50=9.6, p85=10.8 → 10kg는 평균 이상 (65%)
        expect(result.percentile).toBe(65);
        expect(result.label).toBe('평균 이상');
      });

      it('0개월 남아, 3.3kg → p50 백분위를 반환해야 한다', () => {
        // Given
        const weight = 3.3;
        const ageInMonths = 0;
        const gender = 'male';

        // When
        const result = getWeightPercentile(weight, ageInMonths, gender);

        // Then
        expect(result.percentile).toBe(65);
        expect(result.label).toBe('평균 이상');
      });

      it('6개월 남아, 8.8kg → p85 백분위를 반환해야 한다', () => {
        // Given
        const weight = 8.8;
        const ageInMonths = 6;
        const gender = 'male';

        // When
        const result = getWeightPercentile(weight, ageInMonths, gender);

        // Then
        expect(result.percentile).toBe(95);
        expect(result.label).toBe('상위 15%');
      });
    });

    describe('[성공] 정상 케이스 - 여아', () => {
      it('6개월 여아, 7kg → 정확한 백분위를 반환해야 한다', () => {
        // Given
        const weight = 7;
        const ageInMonths = 6;
        const gender = 'female';

        // When
        const result = getWeightPercentile(weight, ageInMonths, gender);

        // Then
        // 6개월 여아: p15=6.5, p50=7.3 → 7kg는 평균 이하 (35%)
        expect(result.percentile).toBe(35);
        expect(result.label).toBe('평균 이하');
      });

      it('12개월 여아, 11kg → p85 이상 백분위를 반환해야 한다', () => {
        // Given
        const weight = 11;
        const ageInMonths = 12;
        const gender = 'female';

        // When
        const result = getWeightPercentile(weight, ageInMonths, gender);

        // Then
        // 12개월 여아: p85=10.1, p97=11.2 → 11kg는 상위 15% (95%)
        expect(result.percentile).toBe(95);
        expect(result.label).toBe('상위 15%');
      });
    });

    describe('[경계값] 백분위 경계선', () => {
      it('p3 경계선 값을 정확히 분류해야 한다', () => {
        // Given: 0개월 남아 p3 = 2.5kg
        const weight = 2.4; // p3보다 작음
        const ageInMonths = 0;
        const gender = 'male';

        // When
        const result = getWeightPercentile(weight, ageInMonths, gender);

        // Then
        expect(result.percentile).toBe(3);
        expect(result.label).toBe('하위 3%');
      });

      it('p15 경계선 값을 정확히 분류해야 한다', () => {
        // Given: 3개월 남아 p15 = 5.7kg
        const weight = 5.6; // p15보다 작음
        const ageInMonths = 3;
        const gender = 'male';

        // When
        const result = getWeightPercentile(weight, ageInMonths, gender);

        // Then
        expect(result.percentile).toBe(15);
        expect(result.label).toBe('하위 15%');
      });

      it('p50 경계선 값을 정확히 분류해야 한다', () => {
        // Given: 6개월 남아 p50 = 8.0kg
        const weight = 7.9; // p50보다 작음
        const ageInMonths = 6;
        const gender = 'male';

        // When
        const result = getWeightPercentile(weight, ageInMonths, gender);

        // Then
        expect(result.percentile).toBe(35);
        expect(result.label).toBe('평균 이하');
      });

      it('p85 경계선 값을 정확히 분류해야 한다', () => {
        // Given: 12개월 남아 p85 = 10.8kg
        const weight = 10.7; // p85보다 작음
        const ageInMonths = 12;
        const gender = 'male';

        // When
        const result = getWeightPercentile(weight, ageInMonths, gender);

        // Then
        expect(result.percentile).toBe(65);
        expect(result.label).toBe('평균 이상');
      });

      it('p97 경계선 값을 정확히 분류해야 한다', () => {
        // Given: 12개월 남아 p97 = 11.8kg
        const weight = 12.0; // p97보다 큼
        const ageInMonths = 12;
        const gender = 'male';

        // When
        const result = getWeightPercentile(weight, ageInMonths, gender);

        // Then
        expect(result.percentile).toBe(97);
        expect(result.label).toBe('상위 3%');
      });
    });

    describe('[경계값] Edge Cases', () => {
      it('데이터가 없는 개월수에 대해 기본값을 반환해야 한다', () => {
        // Given: 데이터가 없는 24개월
        const weight = 12;
        const ageInMonths = 24;
        const gender = 'male';

        // When
        const result = getWeightPercentile(weight, ageInMonths, gender);

        // Then
        expect(result.percentile).toBe(50);
        expect(result.label).toBe('평균');
      });

      it('0개월 신생아 정상 범위를 처리해야 한다', () => {
        // Given
        const weight = 3.5;
        const ageInMonths = 0;
        const gender = 'female';

        // When
        const result = getWeightPercentile(weight, ageInMonths, gender);

        // Then
        // 0개월 여아: p50=3.2, p85=3.7 → 3.5kg는 평균 이상
        expect(result.percentile).toBe(65);
      });

      it('36개월 이상 유아에 대해 기본값을 반환해야 한다', () => {
        // Given
        const weight = 15;
        const ageInMonths = 36;
        const gender = 'male';

        // When
        const result = getWeightPercentile(weight, ageInMonths, gender);

        // Then
        expect(result.percentile).toBe(50);
        expect(result.label).toBe('평균');
      });
    });

    describe('[검증] 성별 차이 반영', () => {
      it('동일 개월수에서 남아와 여아의 백분위가 다르게 계산되어야 한다', () => {
        // Given: 12개월, 9.5kg
        const weight = 9.5;
        const ageInMonths = 12;

        // When
        const maleResult = getWeightPercentile(weight, ageInMonths, 'male');
        const femaleResult = getWeightPercentile(weight, ageInMonths, 'female');

        // Then
        // 남아: p50=9.6 → 9.5kg는 평균 이하 (35%)
        expect(maleResult.percentile).toBe(35);
        expect(maleResult.label).toBe('평균 이하');

        // 여아: p50=8.9, p85=10.1 → 9.5kg는 평균 이상 (65%)
        expect(femaleResult.percentile).toBe(65);
        expect(femaleResult.label).toBe('평균 이상');
      });
    });
  });

  describe('getFeedingGuideline', () => {
    it('체중 5kg → 하루 500~750ml를 반환해야 한다', () => {
      // Given
      const weight = 5;

      // When
      const result = getFeedingGuideline(weight);

      // Then
      expect(result.daily.min).toBe(500);
      expect(result.daily.max).toBe(750);
    });

    it('체중 10kg → 하루 1000~1500ml를 반환해야 한다', () => {
      // Given
      const weight = 10;

      // When
      const result = getFeedingGuideline(weight);

      // Then
      expect(result.daily.min).toBe(1000);
      expect(result.daily.max).toBe(1500);
    });

    it('회당 수유량이 올바르게 계산되어야 한다 (하루 6~8회 기준)', () => {
      // Given
      const weight = 6; // 하루 600~900ml

      // When
      const result = getFeedingGuideline(weight);

      // Then
      // perFeedingMin = 600ml / 8회 = 75ml
      // perFeedingMax = 900ml / 6회 = 150ml
      expect(result.perFeeding.min).toBe(75);
      expect(result.perFeeding.max).toBe(150);
    });

    it('소수점 체중도 올바르게 처리해야 한다', () => {
      // Given
      const weight = 5.5;

      // When
      const result = getFeedingGuideline(weight);

      // Then
      expect(result.daily.min).toBe(550);
      expect(result.daily.max).toBe(825);
    });
  });

  describe('getSleepGuideline', () => {
    it('0~3개월 → 14~17시간, 낮잠 3~5회를 반환해야 한다', () => {
      // Given
      const ageInMonths = 2;

      // When
      const result = getSleepGuideline(ageInMonths);

      // Then
      expect(result.total).toBe('14-17시간');
      expect(result.naps).toBe('3-5회');
    });

    it('4~11개월 → 12~15시간, 낮잠 2~3회를 반환해야 한다', () => {
      // Given
      const ageInMonths = 8;

      // When
      const result = getSleepGuideline(ageInMonths);

      // Then
      expect(result.total).toBe('12-15시간');
      expect(result.naps).toBe('2-3회');
    });

    it('12~24개월 → 11~14시간, 낮잠 1~2회를 반환해야 한다', () => {
      // Given
      const ageInMonths = 18;

      // When
      const result = getSleepGuideline(ageInMonths);

      // Then
      expect(result.total).toBe('11-14시간');
      expect(result.naps).toBe('1-2회');
    });

    it('25개월 이상 → 10~13시간, 낮잠 1회를 반환해야 한다', () => {
      // Given
      const ageInMonths = 30;

      // When
      const result = getSleepGuideline(ageInMonths);

      // Then
      expect(result.total).toBe('10-13시간');
      expect(result.naps).toBe('1회');
    });

    it('경계값: 정확히 3개월일 때 0~3개월 범위를 적용해야 한다', () => {
      // Given
      const ageInMonths = 3;

      // When
      const result = getSleepGuideline(ageInMonths);

      // Then
      expect(result.total).toBe('14-17시간');
      expect(result.naps).toBe('3-5회');
    });

    it('경계값: 정확히 11개월일 때 4~11개월 범위를 적용해야 한다', () => {
      // Given
      const ageInMonths = 11;

      // When
      const result = getSleepGuideline(ageInMonths);

      // Then
      expect(result.total).toBe('12-15시간');
      expect(result.naps).toBe('2-3회');
    });
  });

  describe('getDexibuprofenGuideline', () => {
    it('체중 10kg → 4.0~6.0ml를 반환해야 한다', () => {
      // Given
      const weight = 10;

      // When
      const result = getDexibuprofenGuideline(weight);

      // Then
      expect(result.dose).toBe('4.0 ~ 6.0ml');
      expect(result.disclaimer).toContain('의사/약사와 상담하세요');
    });

    it('체중 5kg → 2.0~3.0ml를 반환해야 한다', () => {
      // Given
      const weight = 5;

      // When
      const result = getDexibuprofenGuideline(weight);

      // Then
      expect(result.dose).toBe('2.0 ~ 3.0ml');
    });

    it('disclaimer 메시지를 포함해야 한다', () => {
      // Given
      const weight = 7;

      // When
      const result = getDexibuprofenGuideline(weight);

      // Then
      expect(result.disclaimer).toBe('⚠️ 본 계산은 일반 참고용이며, 실제 투약 전 반드시 의사/약사와 상담하세요.');
    });
  });
});
