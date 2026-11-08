import { motion } from 'framer-motion';
import { PRIORITY_LABELS, STATUS_LABELS } from '../constants';
import type { Todo } from '../types/todo';
import { formatDueDate, isOverdue } from '../utils/date';
import { CheckIcon, EditIcon, TrashIcon } from './icons';

interface TodoItemProps {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onCycleStatus: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}

export function TodoItem({
  todo,
  onToggle,
  onCycleStatus,
  onEdit,
  onDelete,
}: TodoItemProps) {
  const done = todo.status === 'DONE';
  const overdue = isOverdue(todo.dueDate, todo.status);

  return (
    <motion.li
      layout
      className={`todo-item ${done ? 'todo-item--done' : ''}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -32, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
    >
      <button
        type="button"
        className={`checkbox ${done ? 'checkbox--checked' : ''}`}
        onClick={() => onToggle(todo)}
        aria-pressed={done}
        aria-label={done ? 'Mark as not done' : 'Mark as done'}
      >
        {done && <CheckIcon size={14} />}
      </button>

      <div className="todo-item__body">
        <p className="todo-item__title">{todo.title}</p>
        {todo.description && (
          <p className="todo-item__description">{todo.description}</p>
        )}

        <div className="todo-item__meta">
          <button
            type="button"
            className={`chip chip--status chip--${todo.status.toLowerCase()}`}
            onClick={() => onCycleStatus(todo)}
            title="Click to change status"
          >
            {STATUS_LABELS[todo.status]}
          </button>

          <span
            className={`chip chip--priority chip--${todo.priority.toLowerCase()}`}
          >
            {PRIORITY_LABELS[todo.priority]}
          </span>

          {todo.dueDate && (
            <span className={`chip chip--date ${overdue ? 'chip--overdue' : ''}`}>
              {overdue ? 'Overdue · ' : ''}
              {formatDueDate(todo.dueDate)}
            </span>
          )}

          {todo.tags.map((tag) => (
            <span key={tag} className="chip chip--tag">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="todo-item__actions">
        <button
          type="button"
          className="icon-button"
          onClick={() => onEdit(todo)}
          aria-label="Edit task"
          title="Edit"
        >
          <EditIcon />
        </button>
        <button
          type="button"
          className="icon-button icon-button--danger"
          onClick={() => onDelete(todo)}
          aria-label="Delete task"
          title="Delete"
        >
          <TrashIcon />
        </button>
      </div>
    </motion.li>
  );
}
