export function LoadingState() {
  return (
    <ul className="todo-list" aria-hidden="true">
      {[0, 1, 2, 3].map((row) => (
        <li key={row} className="todo-item todo-item--skeleton">
          <span className="skeleton skeleton--circle" />
          <div className="todo-item__body">
            <span className="skeleton skeleton--line" style={{ width: '55%' }} />
            <span className="skeleton skeleton--line" style={{ width: '80%' }} />
            <div className="todo-item__meta">
              <span className="skeleton skeleton--chip" />
              <span className="skeleton skeleton--chip" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
