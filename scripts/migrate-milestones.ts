/**
 * 발달 이정표 데이터 마이그레이션 스크립트
 *
 * 기존 범위형 MILESTONE (4-6개월) → 새로운 단일 월 MILESTONE (4개월)
 *
 * 실행 방법:
 * npx tsx scripts/migrate-milestones.ts
 */

import { PrismaClient } from '@prisma/client';
import { generateDevelopmentalMilestones } from '../src/features/notes/services/scheduleGeneratorService';

const prisma = new PrismaClient();

async function migrateMilestones() {
  console.log('🚀 발달 이정표 마이그레이션 시작...\n');

  try {
    // 1. 모든 아기 조회
    const babies = await prisma.baby.findMany({
      select: {
        id: true,
        name: true,
        birthDate: true,
        Family: {
          select: {
            FamilyMembers: {
              take: 1,
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    console.log(`📊 총 ${babies.length}명의 아기 발견\n`);

    for (const baby of babies) {
      console.log(`👶 ${baby.name} 처리 중...`);

      // 2. 기존 MILESTONE 타입 Note 삭제
      const deleted = await prisma.note.deleteMany({
        where: {
          babyId: baby.id,
          type: 'MILESTONE',
        },
      });

      console.log(`  ✅ 기존 발달 이정표 ${deleted.count}개 삭제`);

      // 3. 새로운 MILESTONE 생성
      const userId = baby.Family.FamilyMembers[0]?.userId;
      if (!userId) {
        console.log(`  ⚠️  Family Member를 찾을 수 없어 건너뜁니다.`);
        continue;
      }

      const newMilestones = generateDevelopmentalMilestones(
        baby.id,
        userId,
        baby.birthDate
      );

      // 4. DB에 저장
      const created = await prisma.note.createMany({
        data: newMilestones.map((m) => ({
          babyId: m.babyId,
          userId: m.userId,
          type: m.type,
          title: m.title,
          content: m.content,
          dueDate: m.dueDate,
          completed: m.completed,
          priority: m.priority,
          tags: m.tags,
          metadata: m.metadata,
          reminderDays: m.reminderDays,
        })),
      });

      console.log(`  ✅ 새로운 발달 이정표 ${created.count}개 생성`);
      console.log(`  📅 생성된 이정표: 2m, 4m, 6m, 9m, 12m, 15m, 18m, 24m\n`);
    }

    console.log('✨ 마이그레이션 완료!\n');
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
migrateMilestones()
  .then(() => {
    console.log('👍 모든 작업이 성공적으로 완료되었습니다.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 오류 발생:', error);
    process.exit(1);
  });
