import type { Filters, PriorityFilter, StatusFilter } from '../hooks/useTodos';
import {
  PRIORITY_LABELS,
  PRIORITY_ORDER,
  STATUS_LABELS,
  STATUS_ORDER,
} from '../constants';
import { SearchIcon, TrashIcon } from './icons';

interface TodoFiltersProps {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  completedCount: number;
  onClearCompleted: () => void;
}

const STATUS_TABS: StatusFilter[] = ['ALL', ...STATUS_ORDER];

export function TodoFilters({
  filters,
  onChange,
  completedCount,
  onClearCompleted,
}: TodoFiltersProps) {
  return (
    <section className="filters" aria-label="Filter tasks">
      <div className="filters__row">
        <div className="segmented" role="tablist" aria-label="Status filter">
          {STATUS_TABS.map((status) => (
            <button
              key={status}
              role="tab"
              aria-selected={filters.status === status}
              className={`segmented__item ${
                filters.status === status ? 'segmented__item--active' : ''
              }`}
              onClick={() => onChange({ status })}
            >
              {status === 'ALL' ? 'All' : STATUS_LABELS[status]}
            </button>
          ))}
        </div>

        <div className="filters__search">
          <SearchIcon />
          <input
            type="search"
            placeholder="Search tasks…"
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            aria-label="Search tasks"
          />
        </div>
      </div>

      <div className="filters__row filters__row--secondary">
        <label className="field field--inline">
          <span className="field__label">Priority</span>
          <select
            className="field__control"
            value={filters.priority}
            onChange={(event) =>
              onChange({ priority: event.target.value as PriorityFilter })
            }
          >
            <option value="ALL">All priorities</option>
            {PRIORITY_ORDER.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </label>

        <label className="field field--inline">
          <span className="field__label">Sort by</span>
          <select
            className="field__control"
            value={filters.sortBy}
            onChange={(event) =>
              onChange({ sortBy: event.target.value as Filters['sortBy'] })
            }
          >
            <option value="createdAt">Newest</option>
            <option value="updatedAt">Recently updated</option>
            <option value="dueDate">Due date</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </label>

        <button
          type="button"
          className="icon-button icon-button--inline"
          onClick={() => onChange({ order: filters.order === 'asc' ? 'desc' : 'asc' })}
          aria-label="Toggle sort direction"
          title={filters.order === 'asc' ? 'Ascending' : 'Descending'}
        >
          {filters.order === 'asc' ? '↑' : '↓'}
        </button>

        <div className="filters__spacer" />

        {completedCount > 0 && (
          <button
            type="button"
            className="button button--ghost"
            onClick={onClearCompleted}
          >
            <TrashIcon size={15} />
            <span>Clear completed ({completedCount})</span>
          </button>
        )}
      </div>
    </section>
  );
}
