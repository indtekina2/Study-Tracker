import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSubjects } from '../api/subjects';
import { getChapters } from '../api/chapters';
import { getLogs, createLog } from '../api/logs';
import { toast } from 'sonner';
import { format } from 'date-fns';

const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard'];

const StudyLog = () => {
  const queryClient = useQueryClient();
  const [subjectFilter, setSubjectFilter] = useState('');
  
  const [formData, setFormData] = useState({
    subject: '',
    chapter: '',
    duration: '',
    questionsAttempted: '',
    questionsCorrect: '',
    questionsIncorrect: '',
    difficulty: 'Medium',
    notes: ''
  });

  // Queries
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: getSubjects });
  const { data: chapters } = useQuery({ 
    queryKey: ['chapters', formData.subject], 
    queryFn: () => getChapters(formData.subject),
    enabled: !!formData.subject
  });
  const { data: logsData, isLoading: logsLoading } = useQuery({ 
    queryKey: ['logs', subjectFilter], 
    queryFn: () => getLogs({ subjectId: subjectFilter || undefined })
  });

  const createMutation = useMutation({
    mutationFn: createLog,
    onSuccess: () => {
      queryClient.invalidateQueries(['logs']);
      queryClient.invalidateQueries(['logStats']); // Update dashboard
      toast.success('Session logged successfully');
      setFormData({
        subject: '', chapter: '', duration: '', questionsAttempted: '', 
        questionsCorrect: '', questionsIncorrect: '', difficulty: 'Medium', notes: ''
      });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to log session')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.duration) {
      return toast.error('Please fill required fields (Subject, Duration)');
    }
    
    // Convert inputs to numbers
    const payload = {
      subjectId: formData.subject,
      chapterId: formData.chapter || undefined,
      durationMinutes: Number(formData.duration),
      questionsAttempted: formData.questionsAttempted ? Number(formData.questionsAttempted) : 0,
      questionsCorrect: formData.questionsCorrect ? Number(formData.questionsCorrect) : 0,
      questionsIncorrect: formData.questionsIncorrect ? Number(formData.questionsIncorrect) : 0,
      difficulty: formData.difficulty,
      notes: formData.notes
    };

    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Study Log</h1>

      {/* Log Session Form */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] bg-[var(--accent)] bg-opacity-20">
          <h2 className="font-semibold text-[var(--foreground)]">Log New Session</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Subject *</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value, chapter: '' })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              >
                <option value="">Select Subject</option>
                {subjects?.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Chapter</label>
              <select
                value={formData.chapter}
                onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                disabled={!formData.subject}
                className="w-full px-3 py-2 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-50"
              >
                <option value="">Select Chapter (Optional)</option>
                {chapters?.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Duration (mins) *</label>
              <input
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                placeholder="e.g. 60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Q's Attempted</label>
              <input
                type="number"
                min="0"
                value={formData.questionsAttempted}
                onChange={(e) => setFormData({ ...formData, questionsAttempted: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Q's Correct</label>
              <input
                type="number"
                min="0"
                value={formData.questionsCorrect}
                onChange={(e) => setFormData({ ...formData, questionsCorrect: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              >
                {DIFFICULTY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-y min-h-[80px]"
              placeholder="Any specific topics covered or areas to improve..."
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-6 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-70"
            >
              {createMutation.isPending ? 'Saving...' : 'Save Session'}
            </button>
          </div>
        </form>
      </div>

      {/* History */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="font-semibold text-[var(--foreground)]">Session History</h2>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none"
          >
            <option value="">All Subjects</option>
            {subjects?.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--accent)] bg-opacity-20 text-[var(--muted-foreground)]">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Chapter</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Questions</th>
                <th className="px-4 py-3 font-medium">Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {logsLoading ? (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-[var(--muted-foreground)]">Loading history...</td></tr>
              ) : logsData?.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-[var(--muted-foreground)]">No study sessions logged yet.</td></tr>
              ) : (
                logsData?.map(log => {
                  const accuracy = log.questionsAttempted > 0 ? Math.round((log.questionsCorrect / log.questionsAttempted) * 100) : 0;
                  return (
                    <tr key={log._id} className="hover:bg-[var(--accent)] hover:bg-opacity-20 transition-colors">
                      <td className="px-4 py-3 text-[var(--foreground)] whitespace-nowrap">
                        {format(new Date(log.date), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="px-4 py-3 text-[var(--foreground)]">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: log.subjectId?.colorCode || 'var(--primary)' }} />
                          {log.subjectId?.name || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--foreground)] truncate max-w-[200px]" title={log.chapterId?.title || 'General Session'}>
                        {log.chapterId?.title || '-'}
                      </td>
                      <td className="px-4 py-3 text-[var(--foreground)]">{log.durationMinutes} mins</td>
                      <td className="px-4 py-3 text-[var(--foreground)]">
                        {log.questionsAttempted > 0 ? (
                          <span>{log.questionsCorrect}/{log.questionsAttempted} <span className="text-xs text-[var(--muted-foreground)]">({log.difficulty})</span></span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-[var(--foreground)]">
                        {log.questionsAttempted > 0 ? (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            accuracy >= 70 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                            accuracy >= 40 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {accuracy}%
                          </span>
                        ) : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudyLog;
