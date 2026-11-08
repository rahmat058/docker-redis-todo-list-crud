import { AnimatePresence } from 'framer-motion';
import type { Todo } from '../types/todo';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  loading: boolean;
  hasAnyTodos: boolean;
  onToggle: (todo: Todo) => void;
  onCycleStatus: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}

export function TodoList({
  todos,
  loading,
  hasAnyTodos,
  onToggle,
  onCycleStatus,
  onEdit,
  onDelete,
}: TodoListProps) {
  if (loading) return <LoadingState />;
  if (todos.length === 0) return <EmptyState filtered={hasAnyTodos} />;

  return (
    <ul className="todo-list">
      <AnimatePresence initial={false} mode="popLayout">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onCycleStatus={onCycleStatus}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </ul>
  );
}
