import { AnimatePresence, motion } from 'framer-motion';
import { useState, type FormEvent } from 'react';
import { PRIORITY_LABELS, PRIORITY_ORDER } from '../constants';
import type { CreateTodoInput, TodoPriority } from '../types/todo';
import { PlusIcon } from './icons';

interface TodoFormProps {
  onSubmit: (input: CreateTodoInput) => Promise<unknown>;
}

export function TodoForm({ onSubmit }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TodoPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit({
        title: trimmed,
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate || undefined,
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setDueDate('');
      setTags('');
      setExpanded(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="todo-form__main">
        <input
          className="todo-form__input"
          type="text"
          placeholder="What needs to be done?"
          value={title}
          maxLength={200}
          onChange={(event) => setTitle(event.target.value)}
          onFocus={() => setExpanded(true)}
          aria-label="Task title"
        />
        <button
          type="submit"
          className="button button--primary"
          disabled={!title.trim() || submitting}
        >
          <PlusIcon />
          <span>Add task</span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            className="todo-form__details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
          >
            <div className="todo-form__details-inner">
              <textarea
                className="todo-form__textarea"
                placeholder="Add more detail (optional)"
                value={description}
                maxLength={2000}
                rows={2}
                onChange={(event) => setDescription(event.target.value)}
                aria-label="Task description"
              />

              <div className="todo-form__row">
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

                <label className="field field--grow">
                  <span className="field__label">Tags</span>
                  <input
                    className="field__control"
                    type="text"
                    placeholder="work, urgent"
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                  />
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
