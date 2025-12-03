
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BABY_ID = 'cmipeq09a0037ue3dycyrt8mt';
const START_DATE = new Date('2025-11-25'); // Birth date
const END_DATE = new Date('2025-12-02');

// Helper to add random minutes to a date
const addMinutes = (date: Date, minutes: number) => {
  return new Date(date.getTime() + minutes * 60000);
};

// Helper to generate random number in range
const random = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

async function generateData() {
  console.log('Starting realistic data generation for baby:', BABY_ID);

  // First, clear existing data to avoid duplicates/mess
  await prisma.activity.deleteMany({
    where: { babyId: BABY_ID }
  });
  console.log('Cleared existing data.');

  const activities = [];
  
  // Start at 8:00 AM on the first day
  let currentTime = new Date(START_DATE);
  currentTime.setHours(8, 0, 0, 0);

  const finalEndTime = new Date(END_DATE);
  finalEndTime.setHours(23, 59, 59, 999);

  while (currentTime < finalEndTime) {
    const hour = currentTime.getHours();
    const isNight = hour >= 20 || hour < 7; // 8 PM to 7 AM is night

    if (isNight) {
      // Night Cycle: Sleep -> Feed -> Sleep
      // Long sleep stretches (2-4 hours)
      const sleepDuration = random(120, 240); 
      const sleepEnd = addMinutes(currentTime, sleepDuration);
      
      if (sleepEnd > finalEndTime) break;

      activities.push({
        babyId: BABY_ID,
        type: 'SLEEP',
        startTime: new Date(currentTime),
        endTime: sleepEnd,
        duration: sleepDuration,
        sleepType: 'night',
      });

      currentTime = sleepEnd;

      // Brief feeding after waking up at night
      const feedingDuration = random(15, 30);
      const feedingAmount = random(80, 140);
      
      activities.push({
        babyId: BABY_ID,
        type: 'FEEDING',
        startTime: new Date(currentTime),
        endTime: addMinutes(currentTime, feedingDuration),
        feedingType: Math.random() > 0.6 ? 'formula' : 'breast_milk',
        feedingAmount: feedingAmount,
        note: `밤중 수유 ${feedingAmount}ml`,
      });
      
      // Diaper change only if necessary at night (less frequent)
      if (Math.random() > 0.7) {
         activities.push({
          babyId: BABY_ID,
          type: 'DIAPER',
          startTime: new Date(currentTime),
          endTime: new Date(currentTime),
          diaperType: 'urine',
          stoolCondition: 'normal',
          stoolColor: 'yellow',
        });
      }

      currentTime = addMinutes(currentTime, feedingDuration + 10); // Back to sleep after 10 mins settling

    } else {
      // Day Cycle: Feed -> Play -> Nap
      
      // 1. Feed
      const feedingDuration = random(15, 30);
      const feedingAmount = random(60, 120);
      activities.push({
        babyId: BABY_ID,
        type: 'FEEDING',
        startTime: new Date(currentTime),
        endTime: addMinutes(currentTime, feedingDuration),
        feedingType: Math.random() > 0.5 ? 'formula' : 'breast_milk',
        feedingAmount: feedingAmount,
        note: `잘 먹음 ${feedingAmount}ml`,
      });
      
      currentTime = addMinutes(currentTime, feedingDuration);

      // 2. Diaper
      if (Math.random() > 0.2) {
        activities.push({
          babyId: BABY_ID,
          type: 'DIAPER',
          startTime: new Date(currentTime),
          endTime: new Date(currentTime),
          diaperType: Math.random() > 0.8 ? 'stool' : 'urine',
          stoolCondition: Math.random() > 0.7 ? 'normal' : 'loose',
          stoolColor: 'yellow',
        });
      }

      // 3. Awake/Play time (45 - 90 mins)
      const awakeTime = random(45, 90);
      currentTime = addMinutes(currentTime, awakeTime);

      // 4. Nap (30 - 120 mins)
      const napDuration = random(30, 120);
      const napEnd = addMinutes(currentTime, napDuration);
      
      activities.push({
        babyId: BABY_ID,
        type: 'SLEEP',
        startTime: new Date(currentTime),
        endTime: napEnd,
        duration: napDuration,
        sleepType: 'nap',
      });

      currentTime = napEnd;
    }
  }

  // Assign User ID
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('No user found!');
    return;
  }
  
  const userId = user.id;
  const validActivities = activities.map(a => ({ ...a, userId }));

  console.log(`Generated ${validActivities.length} realistic activities.`);

  // Batch insert
  await prisma.activity.createMany({
    data: validActivities as any,
  });

  console.log('Realistic data insertion complete!');
}

generateData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
