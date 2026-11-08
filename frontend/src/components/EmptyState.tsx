interface EmptyStateProps {
  filtered: boolean;
}

export function EmptyState({ filtered }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__art" aria-hidden="true">
        <span className="empty-state__circle" />
        <span className="empty-state__check">✓</span>
      </div>
      <h2 className="empty-state__title">
        {filtered ? 'No tasks match your filters' : 'You’re all caught up'}
      </h2>
      <p className="empty-state__text">
        {filtered
          ? 'Try adjusting the filters or search terms.'
          : 'Add your first task above to get started.'}
      </p>
    </div>
  );
}
