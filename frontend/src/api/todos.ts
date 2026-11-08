import type {
  CreateTodoInput,
  Todo,
  TodoQuery,
  TodoStats,
  UpdateTodoInput,
} from '../types/todo';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (Array.isArray(body?.message)) message = body.message.join(', ');
      else if (typeof body?.message === 'string') message = body.message;
    } catch {
      // keep the default message
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

function toQueryString(query: TodoQuery): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const todosApi = {
  list(query: TodoQuery = {}) {
    return request<Todo[]>(`/todos${toQueryString(query)}`);
  },

  stats() {
    return request<TodoStats>('/todos/stats');
  },

  create(input: CreateTodoInput) {
    return request<Todo>('/todos', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  update(id: string, input: UpdateTodoInput) {
    return request<Todo>(`/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  toggle(id: string) {
    return request<Todo>(`/todos/${id}/toggle`, { method: 'PATCH' });
  },

  remove(id: string) {
    return request<{ id: string; deleted: boolean }>(`/todos/${id}`, {
      method: 'DELETE',
    });
  },

  clearCompleted() {
    return request<{ deleted: number }>('/todos/completed', {
      method: 'DELETE',
    });
  },
};
