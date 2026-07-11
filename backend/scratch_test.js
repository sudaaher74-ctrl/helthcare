const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findFirst();
  if (!user) return console.log('no user');

  try {
    // 1. Test Task creation (simulating frontend form)
    console.log('Testing Task creation...');
    await prisma.task.create({
      data: {
        userId: user.id,
        title: "Test task",
        description: "",
        category: 'PERSONAL',
        priority: 'MEDIUM',
        status: 'BACKLOG',
        dueDate: undefined,
        tags: [],
      },
    });
    console.log('Task created successfully');
  } catch (e) {
    console.error('Task error:', e.message);
  }

  try {
    // 2. Test Workout creation (simulating frontend form)
    console.log('\nTesting Workout creation...');
    await prisma.workoutSession.create({
      data: {
        userId: user.id,
        name: "Test Workout",
        category: "CHEST",
        date: new Date(),
        durationMinutes: 60,
        caloriesBurned: undefined,
        isCompleted: true,
        exercises: {
          create: [{
            name: "",
            category: "STRENGTH",
            sortOrder: 0,
            sets: {
              create: [{
                setNumber: 1,
                reps: 0,
                weight: 0,
                isWarmup: false,
              }]
            }
          }]
        }
      }
    });
    console.log('Workout created successfully');
  } catch (e) {
    console.error('Workout error:', e.message);
  }
}
run().catch(console.error).finally(() => prisma.$disconnect());
