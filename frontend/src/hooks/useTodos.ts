import { useCallback, useEffect, useMemo, useState } from 'react';
import { todosApi } from '../api/todos';
import { useToast } from '../context/ToastContext';
import type {
  CreateTodoInput,
  Todo,
  TodoPriority,
  TodoStats,
  TodoStatus,
  UpdateTodoInput,
} from '../types/todo';

export type StatusFilter = 'ALL' | TodoStatus;
export type PriorityFilter = 'ALL' | TodoPriority;
export type SortBy = 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';

export interface Filters {
  status: StatusFilter;
  priority: PriorityFilter;
  search: string;
  sortBy: SortBy;
  order: 'asc' | 'desc';
}

const PRIORITY_RANK: Record<TodoPriority, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

export function useTodos() {
  const { notify } = useToast();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [stats, setStats] = useState<TodoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    status: 'ALL',
    priority: 'ALL',
    search: '',
    sortBy: 'createdAt',
    order: 'desc',
  });

  const refreshStats = useCallback(async () => {
    try {
      setStats(await todosApi.stats());
    } catch {
      // stats are non-critical, fail silently
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await todosApi.list();
      setTodos(list);
      void refreshStats();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [refreshStats]);

  useEffect(() => {
    void load();
  }, [load]);

  const create = useCallback(
    async (input: CreateTodoInput) => {
      const created = await todosApi.create(input);
      setTodos((current) => [created, ...current]);
      notify('Task created', 'success');
      void refreshStats();
      return created;
    },
    [notify, refreshStats],
  );

  const update = useCallback(
    async (id: string, input: UpdateTodoInput) => {
      const snapshot = todos;
      setTodos((current) =>
        current.map((todo) =>
          todo.id === id ? ({ ...todo, ...input } as Todo) : todo,
        ),
      );

      try {
        const updated = await todosApi.update(id, input);
        setTodos((current) =>
          current.map((todo) => (todo.id === id ? updated : todo)),
        );
        notify('Task updated', 'success');
        void refreshStats();
      } catch (err) {
        setTodos(snapshot);
        notify((err as Error).message, 'error');
      }
    },
    [todos, notify, refreshStats],
  );

  const toggle = useCallback(
    async (todo: Todo) => {
      const snapshot = todos;
      const nextStatus: TodoStatus =
        todo.status === 'DONE' ? 'TODO' : 'DONE';

      setTodos((current) =>
        current.map((item) =>
          item.id === todo.id
            ? {
                ...item,
                status: nextStatus,
                completedAt:
                  nextStatus === 'DONE' ? new Date().toISOString() : null,
              }
            : item,
        ),
      );

      try {
        const updated = await todosApi.toggle(todo.id);
        setTodos((current) =>
          current.map((item) => (item.id === todo.id ? updated : item)),
        );
        void refreshStats();
      } catch (err) {
        setTodos(snapshot);
        notify((err as Error).message, 'error');
      }
    },
    [todos, notify, refreshStats],
  );

  const remove = useCallback(
    async (id: string) => {
      const snapshot = todos;
      setTodos((current) => current.filter((todo) => todo.id !== id));

      try {
        await todosApi.remove(id);
        notify('Task deleted', 'success');
        void refreshStats();
      } catch (err) {
        setTodos(snapshot);
        notify((err as Error).message, 'error');
      }
    },
    [todos, notify, refreshStats],
  );

  const clearCompleted = useCallback(async () => {
    const snapshot = todos;
    setTodos((current) => current.filter((todo) => todo.status !== 'DONE'));

    try {
      const { deleted } = await todosApi.clearCompleted();
      notify(
        deleted > 0
          ? `${deleted} completed task${deleted > 1 ? 's' : ''} cleared`
          : 'Nothing to clear',
        'success',
      );
      void refreshStats();
    } catch (err) {
      setTodos(snapshot);
      notify((err as Error).message, 'error');
    }
  }, [todos, notify, refreshStats]);

  const visibleTodos = useMemo(() => {
    const term = filters.search.trim().toLowerCase();

    const filtered = todos.filter((todo) => {
      if (filters.status !== 'ALL' && todo.status !== filters.status)
        return false;
      if (filters.priority !== 'ALL' && todo.priority !== filters.priority)
        return false;
      if (term) {
        const haystack = `${todo.title} ${todo.description ?? ''} ${todo.tags.join(' ')}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      let result = 0;
      switch (filters.sortBy) {
        case 'title':
          result = a.title.localeCompare(b.title);
          break;
        case 'priority':
          result = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
          break;
        case 'dueDate':
          result =
            (a.dueDate ? Date.parse(a.dueDate) : Number.POSITIVE_INFINITY) -
            (b.dueDate ? Date.parse(b.dueDate) : Number.POSITIVE_INFINITY);
          break;
        case 'updatedAt':
          result = Date.parse(a.updatedAt) - Date.parse(b.updatedAt);
          break;
        default:
          result = Date.parse(a.createdAt) - Date.parse(b.createdAt);
      }
      return filters.order === 'asc' ? result : -result;
    });

    return sorted;
  }, [todos, filters]);

  return {
    todos,
    visibleTodos,
    stats,
    loading,
    error,
    filters,
    setFilters,
    reload: load,
    create,
    update,
    toggle,
    remove,
    clearCompleted,
  };
}
