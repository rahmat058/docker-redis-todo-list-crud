import { motion } from 'framer-motion';
import type { TodoStats } from '../types/todo';

interface StatsCardsProps {
  stats: TodoStats | null;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    { key: 'total', label: 'Total tasks', value: stats?.total ?? 0, tone: 'indigo' },
    { key: 'active', label: 'Active', value: stats?.active ?? 0, tone: 'amber' },
    { key: 'completed', label: 'Completed', value: stats?.completed ?? 0, tone: 'green' },
    { key: 'overdue', label: 'Overdue', value: stats?.overdue ?? 0, tone: 'red' },
  ];

  return (
    <section className="stats" aria-label="Task statistics">
      {cards.map((card, index) => (
        <motion.div
          key={card.key}
          className={`stat-card stat-card--${card.tone}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          <span className="stat-card__value">{card.value}</span>
          <span className="stat-card__label">{card.label}</span>
        </motion.div>
      ))}
    </section>
  );
}
