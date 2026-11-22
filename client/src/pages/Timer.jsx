import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pause, Play, RotateCcw, SkipForward, Coffee, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import TimerDisplay from '../components/timer/TimerDisplay';
import TimerModeTabs from '../components/timer/TimerModeTabs';
import { getSubjects } from '../api/subjects';
import { createLog } from '../api/logs';

const MODES = [
  { id: 'focus', label: 'Focus', minutes: 25 },
  { id: 'short', label: 'Short Break', minutes: 5 },
  { id: 'long', label: 'Long Break', minutes: 15 },
];

const Timer = () => {
  const queryClient = useQueryClient();
  const [activeMode, setActiveMode] = useState('focus');
  const [duration, setDuration] = useState(25 * 60);
  const [seconds, setSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sessions, setSessions] = useState([]);
  const endTimestampRef = useRef(null);

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: getSubjects,
  });

  const saveSessionMutation = useMutation({
    mutationFn: createLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      queryClient.invalidateQueries({ queryKey: ['logStats'] });
      toast.success('Study session saved');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not save session'),
  });

  useEffect(() => {
    if (!isRunning) return undefined;

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((endTimestampRef.current - Date.now()) / 1000));
      setSeconds(remaining);
      if (remaining === 0) {
        setIsRunning(false);
        toast.success(activeMode === 'focus' ? 'Focus session complete!' : 'Break complete!');
        if (activeMode === 'focus') {
          const minutes = Math.round(duration / 60);
          setSessions((current) => [
            { id: Date.now(), mode: 'Focus', minutes, time: new Date() },
            ...current,
          ].slice(0, 5));
        }
      }
    };

    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [isRunning, activeMode, duration]);

  const changeMode = (modeId) => {
    const mode = MODES.find((item) => item.id === modeId);
    if (!mode) return;
    setIsRunning(false);
    setActiveMode(modeId);
    setDuration(mode.minutes * 60);
    setSeconds(mode.minutes * 60);
  };

  const toggleTimer = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      if (seconds === 0) {
        setSeconds(duration);
      }
      endTimestampRef.current = Date.now() + (seconds === 0 ? duration : seconds) * 1000;
      setIsRunning(true);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(duration);
  };

  const skipTimer = () => {
    const nextMode = activeMode === 'focus' ? 'short' : 'focus';
    changeMode(nextMode);
  };

  const finishAndSave = () => {
    if (!selectedSubject) {
      toast.error('Select a subject before saving');
      return;
    }
    const elapsedSeconds = duration - seconds;
    const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    if (activeMode !== 'focus') {
      toast.error('Finish a focus session before saving');
      return;
    }
    saveSessionMutation.mutate({
      subjectId: selectedSubject,
      durationMinutes: elapsedMinutes,
      questionsAttempted: 0,
      questionsCorrect: 0,
      questionsIncorrect: 0,
      difficulty: 'Medium',
      notes: 'Logged with the study timer',
    });
  };

  const activeModeLabel = MODES.find((mode) => mode.id === activeMode)?.label;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-[var(--primary)]">Stay consistent</p>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Study Timer</h1>
        </div>
        <TimerModeTabs
          modes={MODES}
          activeMode={activeMode}
          onChange={changeMode}
          disabled={isRunning}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="flex min-h-[520px] flex-col items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
              {activeMode === 'focus' ? <CheckCircle2 size={14} /> : <Coffee size={14} />}
              {activeModeLabel}
            </span>
          </div>

          <TimerDisplay seconds={seconds} totalSeconds={duration} isRunning={isRunning} />

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={resetTimer}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
              aria-label="Reset timer"
            >
              <RotateCcw size={20} />
            </button>
            <button
              type="button"
              onClick={toggleTimer}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] shadow-lg shadow-indigo-500/20 transition-transform hover:scale-105"
              aria-label={isRunning ? 'Pause timer' : 'Start timer'}
            >
              {isRunning ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
            </button>
            <button
              type="button"
              onClick={skipTimer}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
              aria-label="Skip to next mode"
            >
              <SkipForward size={20} />
            </button>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
            <h2 className="font-semibold text-[var(--foreground)]">Current Session</h2>
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-[var(--muted-foreground)]">Subject</label>
              <select
                value={selectedSubject}
                onChange={(event) => setSelectedSubject(event.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              >
                <option value="">Select a subject</option>
                {subjects?.map((subject) => (
                  <option key={subject._id} value={subject._id}>{subject.name}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={finishAndSave}
              disabled={saveSessionMutation.isPending}
              className="mt-4 w-full rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition-opacity disabled:opacity-60"
            >
              {saveSessionMutation.isPending ? 'Saving...' : 'Finish & Save'}
            </button>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-[var(--foreground)]">Recent Sessions</h2>
              <span className="rounded-full bg-[var(--accent)] px-2.5 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
                {sessions.length}
              </span>
            </div>
            {sessions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--border)] px-4 py-8 text-center">
                <p className="text-sm text-[var(--muted-foreground)]">Completed sessions will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between rounded-lg bg-[var(--accent)] px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{session.mode}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{session.minutes} minutes</p>
                    </div>
                    <CheckCircle2 size={18} className="text-[var(--success)]" />
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
};

export default Timer;
