import { PrismaClient, TodoPriority, TodoStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.todo.count();
  if (count > 0) {
    console.log(`Database already has ${count} todos, skipping seed.`);
    return;
  }

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  await prisma.todo.createMany({
    data: [
      {
        title: 'Design the to-do list UI',
        description: 'Wireframe the layout and pick a color palette.',
        status: TodoStatus.DONE,
        priority: TodoPriority.HIGH,
        tags: ['design', 'frontend'],
        dueDate: new Date(now - 2 * day),
        completedAt: new Date(now - 1 * day),
      },
      {
        title: 'Build the NestJS API',
        description: 'CRUD endpoints, Prisma, validation and Redis caching.',
        status: TodoStatus.IN_PROGRESS,
        priority: TodoPriority.HIGH,
        tags: ['backend', 'nestjs'],
        dueDate: new Date(now + 1 * day),
      },
      {
        title: 'Write Dockerfiles and compose file',
        description: 'Multi-stage builds for both apps plus a compose file.',
        status: TodoStatus.TODO,
        priority: TodoPriority.MEDIUM,
        tags: ['devops', 'docker'],
        dueDate: new Date(now + 3 * day),
      },
      {
        title: 'Add integration tests',
        description: 'Cover the CRUD flow end to end.',
        status: TodoStatus.TODO,
        priority: TodoPriority.LOW,
        tags: ['testing'],
        dueDate: new Date(now - 1 * day),
      },
    ],
  });

  console.log('Seeded sample todos.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
