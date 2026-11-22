import React from 'react';

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const TimerDisplay = ({ seconds, totalSeconds, isRunning }) => {
  const radius = 132;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? seconds / totalSeconds : 0;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
      <svg className="-rotate-90" width="100%" height="100%" viewBox="0 0 300 300" aria-hidden="true">
        <circle
          cx="150"
          cy="150"
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth="12"
        />
        <circle
          cx="150"
          cy="150"
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
          {isRunning ? 'Stay focused' : 'Ready'}
        </p>
        <p className="text-6xl font-bold tabular-nums tracking-tight text-[var(--foreground)] sm:text-7xl">
          {formatTime(seconds)}
        </p>
      </div>
    </div>
  );
};

export { formatTime };
export default TimerDisplay;
