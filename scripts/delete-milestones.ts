
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Deleting all notes with type MILESTONE...');
    const result = await prisma.note.deleteMany({
      where: {
        type: 'MILESTONE',
      },
    });
    console.log(`Successfully deleted ${result.count} milestone notes.`);
  } catch (error) {
    console.error('Error deleting milestones:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
