// babycare-ai/src/features/families/__tests__/joinFamily.test.ts
import { joinFamilyService } from '../services/joinFamilyService';
import { prismaMock } from '../../../../jest.setup';
import { Family, FamilyMember } from '@prisma/client';

describe('가족 초대 서비스 (joinFamilyService)', () => {
  const mockUserId = 'test-user-id';
  const mockFamily: Family = {
    id: 'family-id',
    name: '테스트 가족',
    inviteCode: 'VALID1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // 각 테스트 전에 모든 모의를 초기화합니다.
    prismaMock.familyMember.findFirst.mockReset();
    prismaMock.family.findUnique.mockReset();
    prismaMock.familyMember.create.mockReset();
  });

  it('[성공] 유효한 초대 코드로 가족 참여 시 성공해야 한다', async () => {
    // Given: 사용자는 아직 가족에 속해있지 않고, 유효한 초대 코드가 존재합니다.
    prismaMock.familyMember.findFirst.mockResolvedValue(null); // 사용자가 가족에 속해있지 않음
    prismaMock.family.findUnique.mockResolvedValue(mockFamily); // 유효한 초대 코드

    // When: 가족 초대 서비스 호출
    const result = await joinFamilyService(mockUserId, mockFamily.inviteCode, 'parent', 'mother');

    // Then: 성공적으로 가족에 참여하고 familyId를 반환해야 합니다.
    expect(result).toBe(mockFamily.id);
    expect(prismaMock.familyMember.findFirst).toHaveBeenCalledWith({
      where: { userId: mockUserId },
    });
    expect(prismaMock.family.findUnique).toHaveBeenCalledWith({
      where: { inviteCode: mockFamily.inviteCode },
    });
    expect(prismaMock.familyMember.create).toHaveBeenCalledWith({
      data: {
        userId: mockUserId,
        familyId: mockFamily.id,
        role: 'parent',
        relation: 'mother',
      },
    });
  });

  it('[실패] 유효하지 않은 초대 코드로 가족 참여 시 null을 반환해야 한다', async () => {
    // Given: 사용자는 아직 가족에 속해있지 않고, 유효하지 않은 초대 코드가 존재합니다.
    prismaMock.familyMember.findFirst.mockResolvedValue(null);
    prismaMock.family.findUnique.mockResolvedValue(null); // 유효하지 않은 초대 코드

    // When: 가족 초대 서비스 호출
    const result = await joinFamilyService(mockUserId, 'INVALID', 'parent', 'mother');

    // Then: null을 반환해야 합니다.
    expect(result).toBeNull();
    expect(prismaMock.familyMember.findFirst).toHaveBeenCalledWith({
      where: { userId: mockUserId },
    });
    expect(prismaMock.family.findUnique).toHaveBeenCalledWith({
      where: { inviteCode: 'INVALID' },
    });
    expect(prismaMock.familyMember.create).not.toHaveBeenCalled(); // 가족 구성원이 생성되지 않아야 합니다.
  });

  it('[실패] 이미 가족에 속한 사용자가 가족 참여 시 null을 반환해야 한다', async () => {
    // Given: 사용자가 이미 가족에 속해있습니다.
    const existingFamilyMember: FamilyMember = {
      userId: mockUserId,
      familyId: 'another-family-id',
      role: 'parent',
      relation: 'father',
      permission: 'full',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prismaMock.familyMember.findFirst.mockResolvedValue(existingFamilyMember);

    // When: 가족 초대 서비스 호출
    const result = await joinFamilyService(mockUserId, mockFamily.inviteCode, 'parent', 'mother');

    // Then: null을 반환해야 합니다.
    expect(result).toBeNull();
    expect(prismaMock.familyMember.findFirst).toHaveBeenCalledWith({
      where: { userId: mockUserId },
    });
    expect(prismaMock.family.findUnique).not.toHaveBeenCalled(); // 이미 가족에 속해있으므로 초대 코드를 찾지 않아야 합니다.
    expect(prismaMock.familyMember.create).not.toHaveBeenCalled();
  });

  describe('[보강] 역할 및 관계 검증', () => {
    it('다양한 role(parent/caregiver)과 relation이 올바르게 저장되어야 한다', async () => {
      // Given
      prismaMock.familyMember.findFirst.mockResolvedValue(null);
      prismaMock.family.findUnique.mockResolvedValue(mockFamily);

      const mockCreatedMember: FamilyMember = {
        userId: mockUserId,
        familyId: mockFamily.id,
        role: 'caregiver',
        relation: 'grandmother',
        permission: 'full',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaMock.familyMember.create.mockResolvedValue(mockCreatedMember);

      // When: caregiver 역할로 가족 참여
      const result = await joinFamilyService(mockUserId, mockFamily.inviteCode, 'caregiver', 'grandmother');

      // Then
      expect(result).toBe(mockFamily.id);
      expect(prismaMock.familyMember.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          familyId: mockFamily.id,
          role: 'caregiver',
          relation: 'grandmother',
        },
      });
    });

    it('father 관계로 가족 참여 시 올바르게 저장되어야 한다', async () => {
      // Given
      prismaMock.familyMember.findFirst.mockResolvedValue(null);
      prismaMock.family.findUnique.mockResolvedValue(mockFamily);

      // When
      await joinFamilyService(mockUserId, mockFamily.inviteCode, 'parent', 'father');

      // Then
      expect(prismaMock.familyMember.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          familyId: mockFamily.id,
          role: 'parent',
          relation: 'father',
        },
      });
    });
  });

  describe('[보강] 초대 코드 대소문자 구분', () => {
    it('초대 코드는 대소문자를 구분해야 한다 (VALID1 ≠ valid1)', async () => {
      // Given: 대문자 'VALID1'로 저장된 초대 코드
      prismaMock.familyMember.findFirst.mockResolvedValue(null);
      prismaMock.family.findUnique.mockResolvedValue(null); // 소문자 코드는 찾지 못함

      // When: 소문자로 초대 코드 입력
      const result = await joinFamilyService(mockUserId, 'valid1', 'parent', 'mother');

      // Then: 실패해야 함
      expect(result).toBeNull();
      expect(prismaMock.family.findUnique).toHaveBeenCalledWith({
        where: { inviteCode: 'valid1' },
      });
    });

    it('정확한 대소문자로 초대 코드를 입력하면 성공해야 한다', async () => {
      // Given
      prismaMock.familyMember.findFirst.mockResolvedValue(null);
      prismaMock.family.findUnique.mockResolvedValue(mockFamily);

      // When: 정확한 대문자 코드 입력
      const result = await joinFamilyService(mockUserId, 'VALID1', 'parent', 'mother');

      // Then: 성공
      expect(result).toBe(mockFamily.id);
    });
  });

  describe('[보강] 여러 사용자 동일 초대 코드로 참여', () => {
    it('동일한 초대 코드로 여러 사용자가 참여할 수 있어야 한다', async () => {
      // Given: 첫 번째 사용자
      const user1Id = 'user-1';
      prismaMock.familyMember.findFirst.mockResolvedValue(null);
      prismaMock.family.findUnique.mockResolvedValue(mockFamily);

      // When: 첫 번째 사용자 참여
      const result1 = await joinFamilyService(user1Id, mockFamily.inviteCode, 'parent', 'mother');

      // Then: 성공
      expect(result1).toBe(mockFamily.id);

      // Given: 두 번째 사용자 (Mock 초기화)
      const user2Id = 'user-2';
      prismaMock.familyMember.findFirst.mockResolvedValue(null); // 두 번째 사용자는 가족에 속해있지 않음
      prismaMock.family.findUnique.mockResolvedValue(mockFamily); // 동일한 초대 코드

      // When: 두 번째 사용자 참여
      const result2 = await joinFamilyService(user2Id, mockFamily.inviteCode, 'parent', 'father');

      // Then: 성공
      expect(result2).toBe(mockFamily.id);

      // 두 번째 사용자도 올바른 데이터로 생성되었는지 확인
      expect(prismaMock.familyMember.create).toHaveBeenLastCalledWith({
        data: {
          userId: user2Id,
          familyId: mockFamily.id,
          role: 'parent',
          relation: 'father',
        },
      });
    });

    it('같은 초대 코드로 3명 이상의 사용자가 참여할 수 있어야 한다', async () => {
      // Given & When: 세 명의 서로 다른 사용자
      const users = [
        { id: 'user-1', role: 'parent', relation: 'mother' },
        { id: 'user-2', role: 'parent', relation: 'father' },
        { id: 'user-3', role: 'caregiver', relation: 'grandmother' },
      ];

      for (const user of users) {
        prismaMock.familyMember.findFirst.mockResolvedValue(null);
        prismaMock.family.findUnique.mockResolvedValue(mockFamily);

        const result = await joinFamilyService(user.id, mockFamily.inviteCode, user.role, user.relation);

        // Then: 모두 성공
        expect(result).toBe(mockFamily.id);
      }

      // 세 번 호출되었는지 확인
      expect(prismaMock.familyMember.create).toHaveBeenCalledTimes(3);
    });
  });
});
