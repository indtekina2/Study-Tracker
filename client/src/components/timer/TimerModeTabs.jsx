import React from 'react';
import { cn } from '../../lib/utils';

const TimerModeTabs = ({ modes, activeMode, onChange, disabled }) => (
  <div className="inline-flex w-full rounded-xl border border-[var(--border)] bg-[var(--muted)] p-1 sm:w-auto" role="tablist">
    {modes.map((mode) => (
      <button
        key={mode.id}
        type="button"
        role="tab"
        aria-selected={activeMode === mode.id}
        disabled={disabled}
        onClick={() => onChange(mode.id)}
        className={cn(
          'flex-1 rounded-lg px-5 py-2 text-sm font-semibold transition-all sm:flex-none',
          activeMode === mode.id
            ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
            : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
          disabled && 'cursor-not-allowed opacity-60'
        )}
      >
        {mode.label}
      </button>
    ))}
  </div>
);

export default TimerModeTabs;
