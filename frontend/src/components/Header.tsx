import { motion } from 'framer-motion';
import type { Theme } from '../hooks/useTheme';
import { CheckIcon, MoonIcon, SunIcon } from './icons';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <motion.span
          className="app-header__logo"
          initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        >
          <CheckIcon size={22} />
        </motion.span>
        <div>
          <h1 className="app-header__title">TaskFlow</h1>
          <p className="app-header__subtitle">{today}</p>
        </div>
      </div>

      <button
        type="button"
        className="icon-button icon-button--lg"
        onClick={onToggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
    </header>
  );
}
