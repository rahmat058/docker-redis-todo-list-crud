import type { TodoPriority, TodoStatus } from './types/todo';

export const STATUS_LABELS: Record<TodoStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
};

export const PRIORITY_LABELS: Record<TodoPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export const PRIORITY_ORDER: TodoPriority[] = ['LOW', 'MEDIUM', 'HIGH'];
export const STATUS_ORDER: TodoStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

export function nextStatus(status: TodoStatus): TodoStatus {
  const index = STATUS_ORDER.indexOf(status);
  return STATUS_ORDER[(index + 1) % STATUS_ORDER.length];
}
