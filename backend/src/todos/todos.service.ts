import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Todo, TodoPriority, TodoStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { QueryTodoDto } from './dto/query-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

const LIST_CACHE_PREFIX = 'todos:list';
const ITEM_CACHE_PREFIX = 'todos:item';
const STATS_CACHE_KEY = 'todos:stats';

export interface TodoStats {
  total: number;
  completed: number;
  active: number;
  overdue: number;
  byPriority: Record<TodoPriority, number>;
}

@Injectable()
export class TodosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(dto: CreateTodoDto): Promise<Todo> {
    const todo = await this.prisma.todo.create({
      data: {
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        status: dto.status ?? TodoStatus.TODO,
        priority: dto.priority ?? TodoPriority.MEDIUM,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        tags: dto.tags ?? [],
        completedAt: dto.status === TodoStatus.DONE ? new Date() : null,
      },
    });

    await this.invalidateCache();
    return todo;
  }

  async findAll(query: QueryTodoDto): Promise<Todo[]> {
    const cacheKey = `${LIST_CACHE_PREFIX}:${this.hash(query)}`;
    const cached = await this.redis.get<Todo[]>(cacheKey);
    if (cached) return cached;

    const where: Prisma.TodoWhereInput = {};

    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const sortBy = query.sortBy ?? 'createdAt';
    const order = query.order ?? 'desc';

    const todos = await this.prisma.todo.findMany({
      where,
      orderBy:
        sortBy === 'priority'
          ? ({ priority: order } as Prisma.TodoOrderByWithRelationInput)
          : ({ [sortBy]: order } as Prisma.TodoOrderByWithRelationInput),
    });

    await this.redis.set(cacheKey, todos);
    return todos;
  }

  async findOne(id: string): Promise<Todo> {
    const cacheKey = `${ITEM_CACHE_PREFIX}:${id}`;
    const cached = await this.redis.get<Todo>(cacheKey);
    if (cached) return cached;

    const todo = await this.prisma.todo.findUnique({ where: { id } });
    if (!todo) {
      throw new NotFoundException(`Todo with id "${id}" was not found`);
    }

    await this.redis.set(cacheKey, todo);
    return todo;
  }

  async update(id: string, dto: UpdateTodoDto): Promise<Todo> {
    await this.ensureExists(id);

    const data: Prisma.TodoUpdateInput = {};

    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined)
      data.description = dto.description?.trim() || null;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.dueDate !== undefined)
      data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    if (dto.tags !== undefined) data.tags = dto.tags;

    if (dto.status !== undefined) {
      data.status = dto.status;
      data.completedAt = dto.status === TodoStatus.DONE ? new Date() : null;
    }

    const todo = await this.prisma.todo.update({ where: { id }, data });

    await this.invalidateCache(id);
    return todo;
  }

  async toggle(id: string): Promise<Todo> {
    const existing = await this.ensureExists(id);
    const nextStatus =
      existing.status === TodoStatus.DONE ? TodoStatus.TODO : TodoStatus.DONE;

    return this.update(id, { status: nextStatus });
  }

  async remove(id: string): Promise<{ id: string; deleted: true }> {
    await this.ensureExists(id);
    await this.prisma.todo.delete({ where: { id } });

    await this.invalidateCache(id);
    return { id, deleted: true };
  }

  async clearCompleted(): Promise<{ deleted: number }> {
    const result = await this.prisma.todo.deleteMany({
      where: { status: TodoStatus.DONE },
    });

    await this.invalidateCache();
    return { deleted: result.count };
  }

  async stats(): Promise<TodoStats> {
    const cached = await this.redis.get<TodoStats>(STATS_CACHE_KEY);
    if (cached) return cached;

    const now = new Date();

    const [total, completed, active, overdue, groupedRaw] =
      await this.prisma.$transaction([
        this.prisma.todo.count(),
        this.prisma.todo.count({ where: { status: TodoStatus.DONE } }),
        this.prisma.todo.count({ where: { status: { not: TodoStatus.DONE } } }),
        this.prisma.todo.count({
          where: { status: { not: TodoStatus.DONE }, dueDate: { lt: now } },
        }),
        this.prisma.todo.groupBy({
          by: ['priority'],
          _count: { _all: true },
          orderBy: { priority: 'asc' },
        }),
      ]);

    const grouped = groupedRaw as unknown as Array<{
      priority: TodoPriority;
      _count: { _all: number };
    }>;

    const byPriority: Record<TodoPriority, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
    };
    for (const row of grouped) {
      byPriority[row.priority] = row._count._all;
    }

    const result: TodoStats = { total, completed, active, overdue, byPriority };

    await this.redis.set(STATS_CACHE_KEY, result, 30);
    return result;
  }

  private async ensureExists(id: string): Promise<Todo> {
    const todo = await this.prisma.todo.findUnique({ where: { id } });
    if (!todo) {
      throw new NotFoundException(`Todo with id "${id}" was not found`);
    }
    return todo;
  }

  private async invalidateCache(id?: string) {
    await this.redis.delByPattern(`${LIST_CACHE_PREFIX}:*`);
    await this.redis.del(STATS_CACHE_KEY);
    if (id) {
      await this.redis.del(`${ITEM_CACHE_PREFIX}:${id}`);
    }
  }

  private hash(query: QueryTodoDto): string {
    const keys: (keyof QueryTodoDto)[] = [
      'status',
      'priority',
      'search',
      'sortBy',
      'order',
    ];
    const ordered: Record<string, unknown> = {};
    for (const key of keys) {
      if (query[key] !== undefined) ordered[key] = query[key];
    }
    return JSON.stringify(ordered);
  }
}
