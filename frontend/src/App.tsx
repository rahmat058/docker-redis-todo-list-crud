import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ConfirmDialog } from './components/ConfirmDialog';
import { EditTodoModal } from './components/EditTodoModal';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { TodoFilters } from './components/TodoFilters';
import { TodoForm } from './components/TodoForm';
import { TodoList } from './components/TodoList';
import { nextStatus } from './constants';
import { useTheme } from './hooks/useTheme';
import { useTodos, type Filters } from './hooks/useTodos';
import type { Todo, UpdateTodoInput } from './types/todo';

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme();
  const {
    todos,
    visibleTodos,
    stats,
    loading,
    error,
    filters,
    setFilters,
    create,
    update,
    toggle,
    remove,
    clearCompleted,
  } = useTodos();

  const [editing, setEditing] = useState<Todo | null>(null);
  const [deleting, setDeleting] = useState<Todo | null>(null);

  const handleFilterChange = (patch: Partial<Filters>) =>
    setFilters((current) => ({ ...current, ...patch }));

  const handleSave = (id: string, input: UpdateTodoInput) => update(id, input);

  const completedCount =
    stats?.completed ?? todos.filter((todo) => todo.status === 'DONE').length;

  return (
    <div className="app">
      <div className="app__glow" aria-hidden="true" />

      <Header theme={theme} onToggleTheme={toggleTheme} />

      <main className="app__main">
        <StatsCards stats={stats} />

        <TodoForm onSubmit={create} />

        <TodoFilters
          filters={filters}
          onChange={handleFilterChange}
          completedCount={completedCount}
          onClearCompleted={clearCompleted}
        />

        {error && (
          <div className="banner banner--error" role="alert">
            {error}
          </div>
        )}

        <TodoList
          todos={visibleTodos}
          loading={loading}
          hasAnyTodos={todos.length > 0}
          onToggle={toggle}
          onCycleStatus={(todo) =>
            void update(todo.id, { status: nextStatus(todo.status) })
          }
          onEdit={(todo) => setEditing(todo)}
          onDelete={(todo) => setDeleting(todo)}
        />

        <footer className="app__footer">
          <span>
            {todos.length} task{todos.length === 1 ? '' : 's'} · NestJS · Prisma ·
            PostgreSQL · Redis
          </span>
        </footer>
      </main>

      <AnimatePresence>
        {editing && (
          <EditTodoModal
            key="edit-modal"
            todo={editing}
            onClose={() => setEditing(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleting && (
          <ConfirmDialog
            key="confirm-dialog"
            title="Delete task"
            message={`Are you sure you want to delete “${deleting.title}”? This action cannot be undone.`}
            confirmLabel="Delete"
            onConfirm={() => {
              void remove(deleting.id);
              setDeleting(null);
            }}
            onCancel={() => setDeleting(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
