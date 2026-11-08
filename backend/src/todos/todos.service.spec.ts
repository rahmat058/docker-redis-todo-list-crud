import { Test } from '@nestjs/testing';
import { TodoPriority, TodoStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { TodosService } from './todos.service';

describe('TodosService', () => {
  let service: TodosService;

  const prisma = {
    todo: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const redis = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
    delByPattern: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    redis.get.mockResolvedValue(null);

    const moduleRef = await Test.createTestingModule({
      providers: [
        TodosService,
        { provide: PrismaService, useValue: prisma },
        { provide: RedisService, useValue: redis },
      ],
    }).compile();

    service = moduleRef.get(TodosService);
  });

  it('creates a todo, trims the title and invalidates the cache', async () => {
    prisma.todo.create.mockResolvedValue({
      id: '1',
      title: 'My task',
      status: TodoStatus.TODO,
      priority: TodoPriority.MEDIUM,
      tags: [],
    });

    const result = await service.create({ title: '  My task  ' });

    expect(prisma.todo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ title: 'My task' }),
      }),
    );
    expect(result.id).toBe('1');
    expect(redis.delByPattern).toHaveBeenCalledWith('todos:list:*');
  });

  it('throws NotFoundException when a todo does not exist', async () => {
    prisma.todo.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toThrow(
      /was not found/,
    );
  });

  it('returns cached list results without hitting the database', async () => {
    redis.get.mockResolvedValueOnce([{ id: 'cached' }]);

    const result = await service.findAll({});

    expect(result).toEqual([{ id: 'cached' }]);
    expect(prisma.todo.findMany).not.toHaveBeenCalled();
  });

  it('toggles a completed todo back to TODO', async () => {
    prisma.todo.findUnique.mockResolvedValue({
      id: '1',
      status: TodoStatus.DONE,
    });
    prisma.todo.update.mockResolvedValue({
      id: '1',
      status: TodoStatus.TODO,
    });

    await service.toggle('1');

    expect(prisma.todo.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '1' },
        data: expect.objectContaining({ status: TodoStatus.TODO }),
      }),
    );
  });
});
