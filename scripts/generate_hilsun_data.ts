
import { PrismaClient, ActivityType } from "@prisma/client";
import { subDays, format, addDays, setHours, setMinutes, addMinutes } from "date-fns";

const prisma = new PrismaClient();

// 유틸리티: 랜덤 시간 변동 (분 단위)
function randomTime(baseDate: Date, variationMinutes: number = 30): Date {
  const variation = Math.floor(Math.random() * (variationMinutes * 2 + 1)) - variationMinutes;
  return addMinutes(baseDate, variation);
}

// 유틸리티: 랜덤 수치 변동
function randomValue(baseValue: number, variation: number): number {
  return baseValue + Math.floor(Math.random() * (variation * 2 + 1)) - variation;
}

async function main() {
  const babyId = "cmiwoujws0009ue8p1rrsg8ek";
  const userId = "cmib7rbf30000uewanot3b9jo";

  // 13일차(12/7) 기준, 일주일 전부터 생성 (12/1 ~ 12/7)
  const targetDate = new Date("2025-12-07");
  const startDate = subDays(targetDate, 6); // 12월 1일

  console.log(`👶 홍길순 아기 일주일치 데이터 생성 시작 (${format(startDate, 'yyyy-MM-dd')} ~ ${format(targetDate, 'yyyy-MM-dd')})...`);

  // 1. 기존 데이터 삭제 (중복 방지)
  console.log("🧹 기존 데이터 정리 중...");
  await prisma.activity.deleteMany({
    where: {
      babyId,
      startTime: {
        gte: startDate,
        lte: setHours(targetDate, 23),
      },
    },
  });
  await prisma.babyMeasurement.deleteMany({
    where: {
      babyId,
      measuredAt: {
        gte: startDate,
        lte: setHours(targetDate, 23),
      },
    },
  });


  // 2. 일자별 루프
  for (let i = 0; i < 7; i++) {
    const currentDate = addDays(startDate, i);
    const dateStr = format(currentDate, "yyyy-MM-dd");
    const dayNum = i + 1; // 1일차 ~ 7일차 (로그상의 순서)

    console.log(`📅 ${dateStr} 데이터 생성 중...`);

    // --- 신체 계측 (이틀에 한번씩만, 마지막 날은 필수) ---
    if (i % 2 === 0 || i === 6) {
       // 몸무게 3.5 -> 3.8kg 서서히 증가
       const weight = 3.5 + (i * 0.05); 
       await prisma.babyMeasurement.create({
        data: {
          babyId,
          weight: Number(weight.toFixed(2)),
          height: 50.0 + (i * 0.1), // 키도 조금씩 성장
          measuredAt: setHours(currentDate, 9),
          note: i === 6 ? "일주일 동안 쑥쑥 컸네요!" : undefined,
        },
      });
    }

    // --- 일일 활동 패턴 ---
    const dailyActivities = [];

    // [02:00] 새벽 수유 (랜덤 시간)
    dailyActivities.push({
      type: ActivityType.FEEDING,
      startTime: randomTime(new Date(`${dateStr}T02:00:00`)),
      feedingType: "BOTTLE",
      feedingAmount: randomValue(80, 10),
      memo: "새벽 수유",
    });

    // [06:00] 아침 기상 및 수유
    dailyActivities.push({
      type: ActivityType.FEEDING,
      startTime: randomTime(new Date(`${dateStr}T06:00:00`)),
      feedingType: "BOTTLE",
      feedingAmount: randomValue(80, 10),
      memo: "아침 첫 수유",
    });
    dailyActivities.push({
      type: ActivityType.DIAPER,
      startTime: randomTime(new Date(`${dateStr}T06:15:00`)),
      diaperType: "PEE",
    });

    // [09:00] 오전 수유 & 대변
    dailyActivities.push({
      type: ActivityType.FEEDING,
      startTime: randomTime(new Date(`${dateStr}T09:00:00`)),
      feedingType: "BOTTLE",
      feedingAmount: randomValue(90, 10),
      memo: "컨디션 좋음",
    });
    // 3일에 한 번은 대변
    if (i % 3 === 0) {
        dailyActivities.push({
            type: ActivityType.DIAPER,
            startTime: randomTime(new Date(`${dateStr}T09:30:00`)),
            diaperType: "POOP",
            stoolCondition: "NORMAL",
            memo: "황금변",
        });
    } else {
         dailyActivities.push({
            type: ActivityType.DIAPER,
            startTime: randomTime(new Date(`${dateStr}T09:30:00`)),
            diaperType: "PEE",
        });
    }

    // [10:00 ~ 11:30] 오전 낮잠
    dailyActivities.push({
        type: ActivityType.SLEEP,
        startTime: randomTime(new Date(`${dateStr}T10:00:00`), 15),
        endTime: randomTime(new Date(`${dateStr}T11:30:00`), 15),
        memo: "오전 낮잠",
    });

    // [12:00] 점심 수유
    dailyActivities.push({
      type: ActivityType.FEEDING,
      startTime: randomTime(new Date(`${dateStr}T12:00:00`)),
      feedingType: "BOTTLE",
      feedingAmount: randomValue(90, 10),
    });

    // [13:00 ~ 14:30] 오후 낮잠 1
    dailyActivities.push({
        type: ActivityType.SLEEP,
        startTime: randomTime(new Date(`${dateStr}T13:00:00`)),
        endTime: randomTime(new Date(`${dateStr}T14:30:00`)),
        memo: "오후 낮잠 1",
    });

    // [15:00] 오후 수유 (특이사항 이벤트)
    let feedingMemo = "";
    if (i === 6) feedingMemo = "약간 게워냄 🤮"; // 마지막 날(12/7) 이벤트
    if (i === 2) feedingMemo = "딸꾹질을 좀 오래 함"; // 12/3 이벤트
    
    dailyActivities.push({
      type: ActivityType.FEEDING,
      startTime: randomTime(new Date(`${dateStr}T15:00:00`)),
      feedingType: "BOTTLE",
      feedingAmount: randomValue(90, 10),
      memo: feedingMemo,
    });
     dailyActivities.push({
        type: ActivityType.DIAPER,
        startTime: randomTime(new Date(`${dateStr}T15:30:00`)),
        diaperType: "PEE",
    });


     // [16:30 ~ 17:30] 늦은 오후 낮잠
    dailyActivities.push({
        type: ActivityType.SLEEP,
        startTime: randomTime(new Date(`${dateStr}T16:30:00`)),
        endTime: randomTime(new Date(`${dateStr}T17:30:00`)),
        memo: "쪽잠",
    });


    // [18:00] 저녁 수유
    dailyActivities.push({
      type: ActivityType.FEEDING,
      startTime: randomTime(new Date(`${dateStr}T18:00:00`)),
      feedingType: "BOTTLE",
      feedingAmount: randomValue(90, 10),
    });

    // [19:00] 목욕 (매일)
    dailyActivities.push({
      type: ActivityType.TEMPERATURE,
      startTime: randomTime(new Date(`${dateStr}T19:00:00`)),
      temperature: 36.5 + (Math.random() * 0.4),
      memo: "목욕 후",
    });

     // [21:00] 막수
    dailyActivities.push({
      type: ActivityType.FEEDING,
      startTime: randomTime(new Date(`${dateStr}T21:00:00`)),
      feedingType: "BOTTLE",
      feedingAmount: randomValue(100, 10), // 막수 증량
      memo: "막수 완료",
    });
     dailyActivities.push({
        type: ActivityType.DIAPER,
        startTime: randomTime(new Date(`${dateStr}T21:30:00`)),
        diaperType: "PEE",
        memo: "밤기저귀",
    });

    // [22:00] 밤잠
    // 밤잠은 다음날 아침까지 이어지므로 약 8시간(480분) 뒤로 설정
    const sleepStart = randomTime(new Date(`${dateStr}T22:00:00`), 20);
    dailyActivities.push({
        type: ActivityType.SLEEP,
        startTime: sleepStart,
        endTime: addMinutes(sleepStart, 480 + randomValue(30, 15)), // 8시간 +/- 30분
        memo: "밤잠 입면 (통잠 기원!)",
    });


    // DB 저장
    for (const act of dailyActivities) {
        // endTime이 startTime보다 빠르면 오류나므로 보정 (randomTime 때문에 발생 가능)
        if (act.endTime && act.endTime <= act.startTime) {
            act.endTime = addMinutes(act.startTime, 30);
        }

       await prisma.activity.create({
          data: {
            babyId,
            userId,
            type: act.type,
            startTime: act.startTime,
            endTime: act.endTime,
            feedingType: act.feedingType,
            feedingAmount: act.feedingAmount,
            diaperType: act.diaperType,
            stoolCondition: act.stoolCondition,
            temperature: act.temperature ? Number(act.temperature.toFixed(1)) : undefined,
            duration: (act as any).duration, // Note: DB schema has duration Int? but Prisma generate types based on it.
            // If duration isn't calculated in activity object, calculate it here for Sleep
            memo: act.memo,
          },
        });
    }
  }

  console.log("✅ 일주일치 데이터 생성 완료!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
