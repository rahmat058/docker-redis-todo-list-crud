import { motion } from 'framer-motion';
import { useEffect, useState, type FormEvent } from 'react';
import {
  PRIORITY_LABELS,
  PRIORITY_ORDER,
  STATUS_LABELS,
  STATUS_ORDER,
} from '../constants';
import type { Todo, TodoPriority, TodoStatus, UpdateTodoInput } from '../types/todo';
import { toDateInputValue } from '../utils/date';
import { CloseIcon } from './icons';

interface EditTodoModalProps {
  todo: Todo;
  onClose: () => void;
  onSave: (id: string, input: UpdateTodoInput) => Promise<void> | void;
}

export function EditTodoModal({ todo, onClose, onSave }: EditTodoModalProps) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description ?? '');
  const [status, setStatus] = useState<TodoStatus>(todo.status);
  const [priority, setPriority] = useState<TodoPriority>(todo.priority);
  const [dueDate, setDueDate] = useState(toDateInputValue(todo.dueDate));
  const [tags, setTags] = useState(todo.tags.join(', '));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || saving) return;

    setSaving(true);
    try {
      await onSave(todo.id, {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: dueDate || null,
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="modal__backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
    >
      <motion.div
        className="modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Edit task"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={(event) => event.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="modal__header">
            <h2 className="modal__title">Edit task</h2>
            <button
              type="button"
              className="icon-button"
              onClick={onClose}
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="modal__body">
            <label className="field">
              <span className="field__label">Title</span>
              <input
                className="field__control"
                value={title}
                maxLength={200}
                onChange={(event) => setTitle(event.target.value)}
                autoFocus
              />
            </label>

            <label className="field">
              <span className="field__label">Description</span>
              <textarea
                className="field__control"
                rows={3}
                value={description}
                maxLength={2000}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>

            <div className="todo-form__row">
              <label className="field">
                <span className="field__label">Status</span>
                <select
                  className="field__control"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as TodoStatus)
                  }
                >
                  {STATUS_ORDER.map((value) => (
                    <option key={value} value={value}>
                      {STATUS_LABELS[value]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span className="field__label">Priority</span>
                <select
                  className="field__control"
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value as TodoPriority)
                  }
                >
                  {PRIORITY_ORDER.map((value) => (
                    <option key={value} value={value}>
                      {PRIORITY_LABELS[value]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span className="field__label">Due date</span>
                <input
                  className="field__control"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                />
              </label>
            </div>

            <label className="field">
              <span className="field__label">Tags</span>
              <input
                className="field__control"
                value={tags}
                placeholder="work, urgent"
                onChange={(event) => setTags(event.target.value)}
              />
            </label>
          </div>

          <div className="modal__footer">
            <button
              type="button"
              className="button button--ghost"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button--primary"
              disabled={!title.trim() || saving}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
