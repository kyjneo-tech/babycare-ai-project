// src/features/measurements/services/__tests__/createMeasurementService.test.ts

import { BabyMeasurement } from "@prisma/client";
import { createMeasurementService } from "../createMeasurementService";
import {
  CreateMeasurementData,
  IMeasurementRepository,
} from "../../repositories/IMeasurementRepository";

describe("createMeasurementService", () => {
  let mockRepository: jest.Mocked<IMeasurementRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findLatest: jest.fn(),
      findByBabyId: jest.fn(),
    };
  });

  describe("정상 케이스", () => {
    it("정상적인 측정값으로 기록을 생성해야 한다", async () => {
      // Arrange
      const data: CreateMeasurementData = {
        babyId: "baby-1",
        weight: 8.5,
        height: 70.0,
        measuredAt: new Date("2025-11-22T10:00:00Z"),
        note: "정기 검진",
      };

      const expectedMeasurement: BabyMeasurement = {
        id: "measurement-1",
        babyId: "baby-1",
        weight: 8.5,
        height: 70.0,
        measuredAt: new Date("2025-11-22T10:00:00Z"),
        note: "정기 검진",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(expectedMeasurement);

      // Act
      const result = await createMeasurementService(mockRepository, data);

      // Assert
      expect(result).toEqual(expectedMeasurement);
      expect(mockRepository.create).toHaveBeenCalledWith(data);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
    });

    it("신생아 정상 범위: 체중 1.5~5.5kg, 키 45~60cm", async () => {
      // Arrange
      const data: CreateMeasurementData = {
        babyId: "baby-newborn",
        weight: 3.2, // 신생아 정상 범위
        height: 50.0, // 신생아 정상 범위
        measuredAt: new Date("2025-11-22T10:00:00Z"),
      };

      const expectedMeasurement: BabyMeasurement = {
        id: "measurement-newborn",
        babyId: "baby-newborn",
        weight: 3.2,
        height: 50.0,
        measuredAt: new Date("2025-11-22T10:00:00Z"),
        note: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(expectedMeasurement);

      // Act
      const result = await createMeasurementService(mockRepository, data);

      // Assert
      expect(result).toEqual(expectedMeasurement);
      expect(result.weight).toBeGreaterThanOrEqual(1.5);
      expect(result.weight).toBeLessThanOrEqual(5.5);
      expect(result.height).toBeGreaterThanOrEqual(45);
      expect(result.height).toBeLessThanOrEqual(60);
    });

    it("유아 정상 범위: 체중 7~15kg, 키 65~90cm", async () => {
      // Arrange
      const data: CreateMeasurementData = {
        babyId: "baby-toddler",
        weight: 10.5, // 유아 정상 범위
        height: 75.0, // 유아 정상 범위
        measuredAt: new Date("2025-11-22T10:00:00Z"),
      };

      const expectedMeasurement: BabyMeasurement = {
        id: "measurement-toddler",
        babyId: "baby-toddler",
        weight: 10.5,
        height: 75.0,
        measuredAt: new Date("2025-11-22T10:00:00Z"),
        note: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(expectedMeasurement);

      // Act
      const result = await createMeasurementService(mockRepository, data);

      // Assert
      expect(result).toEqual(expectedMeasurement);
      expect(result.weight).toBeGreaterThanOrEqual(7);
      expect(result.weight).toBeLessThanOrEqual(15);
      expect(result.height).toBeGreaterThanOrEqual(65);
      expect(result.height).toBeLessThanOrEqual(90);
    });

    it("소수점 측정값을 정확하게 저장해야 한다", async () => {
      // Arrange
      const data: CreateMeasurementData = {
        babyId: "baby-1",
        weight: 8.567, // 소수점 3자리
        height: 70.123, // 소수점 3자리
        measuredAt: new Date("2025-11-22T10:00:00Z"),
      };

      const expectedMeasurement: BabyMeasurement = {
        id: "measurement-1",
        babyId: "baby-1",
        weight: 8.567,
        height: 70.123,
        measuredAt: new Date("2025-11-22T10:00:00Z"),
        note: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(expectedMeasurement);

      // Act
      const result = await createMeasurementService(mockRepository, data);

      // Assert
      expect(result.weight).toBe(8.567);
      expect(result.height).toBe(70.123);
    });
  });

  describe("경계값 테스트", () => {
    it("체중 경계값: 0.1kg (최소 허용값)", async () => {
      // Arrange
      const data: CreateMeasurementData = {
        babyId: "baby-1",
        weight: 0.1, // 매우 작은 값이지만 0보다 큼
        height: 30.0,
        measuredAt: new Date("2025-11-22T10:00:00Z"),
      };

      const expectedMeasurement: BabyMeasurement = {
        id: "measurement-1",
        babyId: "baby-1",
        weight: 0.1,
        height: 30.0,
        measuredAt: new Date("2025-11-22T10:00:00Z"),
        note: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(expectedMeasurement);

      // Act
      const result = await createMeasurementService(mockRepository, data);

      // Assert
      expect(result.weight).toBe(0.1);
    });

    it("키 경계값: 0.1cm (최소 허용값)", async () => {
      // Arrange
      const data: CreateMeasurementData = {
        babyId: "baby-1",
        weight: 3.0,
        height: 0.1, // 매우 작은 값이지만 0보다 큼
        measuredAt: new Date("2025-11-22T10:00:00Z"),
      };

      const expectedMeasurement: BabyMeasurement = {
        id: "measurement-1",
        babyId: "baby-1",
        weight: 3.0,
        height: 0.1,
        measuredAt: new Date("2025-11-22T10:00:00Z"),
        note: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(expectedMeasurement);

      // Act
      const result = await createMeasurementService(mockRepository, data);

      // Assert
      expect(result.height).toBe(0.1);
    });
  });

  describe("실패 케이스", () => {
    it("체중이 0일 때 에러를 발생시켜야 한다", async () => {
      // Arrange
      const data: CreateMeasurementData = {
        babyId: "baby-1",
        weight: 0,
        height: 70.0,
        measuredAt: new Date("2025-11-22T10:00:00Z"),
      };

      // Act & Assert
      await expect(
        createMeasurementService(mockRepository, data)
      ).rejects.toThrow("체중은 0보다 커야 합니다");
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("체중이 음수일 때 에러를 발생시켜야 한다", async () => {
      // Arrange
      const data: CreateMeasurementData = {
        babyId: "baby-1",
        weight: -5.0,
        height: 70.0,
        measuredAt: new Date("2025-11-22T10:00:00Z"),
      };

      // Act & Assert
      await expect(
        createMeasurementService(mockRepository, data)
      ).rejects.toThrow("체중은 0보다 커야 합니다");
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("키가 0일 때 에러를 발생시켜야 한다", async () => {
      // Arrange
      const data: CreateMeasurementData = {
        babyId: "baby-1",
        weight: 8.5,
        height: 0,
        measuredAt: new Date("2025-11-22T10:00:00Z"),
      };

      // Act & Assert
      await expect(
        createMeasurementService(mockRepository, data)
      ).rejects.toThrow("키는 0보다 커야 합니다");
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("키가 음수일 때 에러를 발생시켜야 한다", async () => {
      // Arrange
      const data: CreateMeasurementData = {
        babyId: "baby-1",
        weight: 8.5,
        height: -50.0,
        measuredAt: new Date("2025-11-22T10:00:00Z"),
      };

      // Act & Assert
      await expect(
        createMeasurementService(mockRepository, data)
      ).rejects.toThrow("키는 0보다 커야 합니다");
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("비정상 값 범위 검증 (추가 케이스)", () => {
    it("체중 100kg 이상일 때 경고 없이 저장되어야 한다 (현재 검증 없음)", async () => {
      // Arrange
      const data: CreateMeasurementData = {
        babyId: "baby-1",
        weight: 150.0, // 비정상적으로 높은 값
        height: 70.0,
        measuredAt: new Date("2025-11-22T10:00:00Z"),
      };

      const expectedMeasurement: BabyMeasurement = {
        id: "measurement-1",
        babyId: "baby-1",
        weight: 150.0,
        height: 70.0,
        measuredAt: new Date("2025-11-22T10:00:00Z"),
        note: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(expectedMeasurement);

      // Act
      const result = await createMeasurementService(mockRepository, data);

      // Assert
      // 현재는 상한선 검증이 없으므로 저장됨
      expect(result.weight).toBe(150.0);
      expect(mockRepository.create).toHaveBeenCalledWith(data);
    });

    it("키 200cm 이상일 때 경고 없이 저장되어야 한다 (현재 검증 없음)", async () => {
      // Arrange
      const data: CreateMeasurementData = {
        babyId: "baby-1",
        weight: 8.5,
        height: 250.0, // 비정상적으로 높은 값
        measuredAt: new Date("2025-11-22T10:00:00Z"),
      };

      const expectedMeasurement: BabyMeasurement = {
        id: "measurement-1",
        babyId: "baby-1",
        weight: 8.5,
        height: 250.0,
        measuredAt: new Date("2025-11-22T10:00:00Z"),
        note: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(expectedMeasurement);

      // Act
      const result = await createMeasurementService(mockRepository, data);

      // Assert
      // 현재는 상한선 검증이 없으므로 저장됨
      expect(result.height).toBe(250.0);
      expect(mockRepository.create).toHaveBeenCalledWith(data);
    });
  });

  describe("에러 처리", () => {
    it("데이터베이스 에러 발생 시 에러를 전파해야 한다", async () => {
      // Arrange
      const data: CreateMeasurementData = {
        babyId: "baby-1",
        weight: 8.5,
        height: 70.0,
        measuredAt: new Date("2025-11-22T10:00:00Z"),
      };

      const dbError = new Error("Database connection failed");
      mockRepository.create.mockRejectedValue(dbError);

      // Act & Assert
      await expect(
        createMeasurementService(mockRepository, data)
      ).rejects.toThrow("Database connection failed");
    });
  });

  describe("선택적 필드 처리", () => {
    it("note 필드가 없어도 기록을 생성할 수 있어야 한다", async () => {
      // Arrange
      const data: CreateMeasurementData = {
        babyId: "baby-1",
        weight: 8.5,
        height: 70.0,
        measuredAt: new Date("2025-11-22T10:00:00Z"),
        // note 없음
      };

      const expectedMeasurement: BabyMeasurement = {
        id: "measurement-1",
        babyId: "baby-1",
        weight: 8.5,
        height: 70.0,
        measuredAt: new Date("2025-11-22T10:00:00Z"),
        note: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(expectedMeasurement);

      // Act
      const result = await createMeasurementService(mockRepository, data);

      // Assert
      expect(result).toEqual(expectedMeasurement);
      expect(result.note).toBeNull();
    });

    it("note 필드가 빈 문자열일 때도 저장되어야 한다", async () => {
      // Arrange
      const data: CreateMeasurementData = {
        babyId: "baby-1",
        weight: 8.5,
        height: 70.0,
        measuredAt: new Date("2025-11-22T10:00:00Z"),
        note: "",
      };

      const expectedMeasurement: BabyMeasurement = {
        id: "measurement-1",
        babyId: "baby-1",
        weight: 8.5,
        height: 70.0,
        measuredAt: new Date("2025-11-22T10:00:00Z"),
        note: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(expectedMeasurement);

      // Act
      const result = await createMeasurementService(mockRepository, data);

      // Assert
      expect(result.note).toBe("");
    });
  });
});
