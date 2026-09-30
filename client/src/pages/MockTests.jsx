import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { getMockTests, createMockTest, deleteMockTest, getMockTestAnalytics } from '../api/mockTests';
import { getSubjects } from '../api/subjects';
import ScoreLineChart from '../components/charts/ScoreLineChart';
import { cn } from '../lib/utils';

const MockTests = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    testName: '', provider: '', date: format(new Date(), 'yyyy-MM-dd'),
    totalScore: '', obtainedScore: '', subjectScores: []
  });

  // Queries
  const { data: tests, isLoading: testsLoading } = useQuery({ queryKey: ['mockTests'], queryFn: getMockTests });
  const { data: analytics } = useQuery({ queryKey: ['mockTestAnalytics'], queryFn: getMockTestAnalytics });
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: getSubjects });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createMockTest,
    onSuccess: () => {
      queryClient.invalidateQueries(['mockTests']);
      queryClient.invalidateQueries(['mockTestAnalytics']);
      toast.success('Mock test added successfully');
      setIsFormOpen(false);
      resetForm();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add mock test')
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMockTest,
    onSuccess: () => {
      queryClient.invalidateQueries(['mockTests']);
      queryClient.invalidateQueries(['mockTestAnalytics']);
      toast.success('Mock test deleted');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete mock test')
  });

  const resetForm = () => {
    setFormData({
      testName: '', provider: '', date: format(new Date(), 'yyyy-MM-dd'),
      totalScore: '', obtainedScore: '', subjectScores: []
    });
  };

  const handleAddSubjectScore = () => {
    setFormData(prev => ({
      ...prev,
      subjectScores: [...prev.subjectScores, { subject: '', score: '', maxScore: '' }]
    }));
  };

  const handleRemoveSubjectScore = (index) => {
    setFormData(prev => ({
      ...prev,
      subjectScores: prev.subjectScores.filter((_, i) => i !== index)
    }));
  };

  const handleSubjectScoreChange = (index, field, value) => {
    const newScores = [...formData.subjectScores];
    newScores[index][field] = value;
    setFormData(prev => ({ ...prev, subjectScores: newScores }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.testName || !formData.date || !formData.totalScore || !formData.obtainedScore) {
      return toast.error('Please fill all required basic details');
    }

    const payload = {
      ...formData,
      totalScore: Number(formData.totalScore),
      obtainedScore: Number(formData.obtainedScore),
      subjectScores: formData.subjectScores.filter(s => s.subject && s.score).map(s => ({
        subjectId: s.subject,
        score: Number(s.score),
        maxScore: Number(s.maxScore) || 0
      }))
    };

    createMutation.mutate(payload);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this test record?')) {
      deleteMutation.mutate(id);
    }
  };

  // Chart Data preparation
  const scoreData = analytics?.scoreTrend?.map(item => ({
    date: format(new Date(item.date), 'MMM dd'),
    percentage: Math.round(item.percentage),
    testName: item.testName
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Mock Tests</h1>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
        >
          {isFormOpen ? <X size={20} /> : <Plus size={20} />}
          {isFormOpen ? 'Cancel' : 'Add Test'}
        </button>
      </div>

      {/* Chart */}
      {!isFormOpen && (
        <div className="bg-[var(--card)] p-5 rounded-xl border border-[var(--border)] shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Performance Trend</h2>
          <div className="h-64">
            <ScoreLineChart data={scoreData} />
          </div>
        </div>
      )}

      {/* Add Test Form */}
      {isFormOpen && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4">
          <div className="p-4 border-b border-[var(--border)] bg-[var(--accent)] bg-opacity-20">
            <h2 className="font-semibold text-[var(--foreground)]">Add Mock Test Record</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Test Name *</label>
                <input
                  type="text"
                  value={formData.testName}
                  onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  placeholder="e.g. Full Syllabus Test 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Provider/Coaching</label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  placeholder="e.g. Allen, Aakash"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Total Max Score *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.totalScore}
                  onChange={(e) => setFormData({ ...formData, totalScore: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Obtained Score *</label>
                <input
                  type="number"
                  value={formData.obtainedScore}
                  onChange={(e) => setFormData({ ...formData, obtainedScore: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-[var(--foreground)]">Subject-wise Scores (Optional)</label>
                <button
                  type="button"
                  onClick={handleAddSubjectScore}
                  className="text-sm text-[var(--primary)] font-medium hover:underline flex items-center gap-1"
                >
                  <Plus size={16} /> Add Subject
                </button>
              </div>
              
              {formData.subjectScores.length > 0 && (
                <div className="space-y-3">
                  {formData.subjectScores.map((ss, idx) => (
                    <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-[var(--accent)] bg-opacity-20 p-3 rounded-lg border border-[var(--border)]">
                      <select
                        value={ss.subject}
                        onChange={(e) => handleSubjectScoreChange(idx, 'subject', e.target.value)}
                        className="flex-1 min-w-[150px] px-3 py-2 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                      >
                        <option value="">Select Subject</option>
                        {subjects?.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                      </select>
                      <input
                        type="number"
                        placeholder="Obtained"
                        value={ss.score}
                        onChange={(e) => handleSubjectScoreChange(idx, 'score', e.target.value)}
                        className="w-24 px-3 py-2 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                      />
                      <span className="text-[var(--muted-foreground)]">/</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={ss.maxScore}
                        onChange={(e) => handleSubjectScoreChange(idx, 'maxScore', e.target.value)}
                        className="w-24 px-3 py-2 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSubjectScore(idx)}
                        className="p-2 text-[var(--muted-foreground)] hover:text-[var(--destructive)] rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-[var(--border)]">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-6 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-70"
              >
                {createMutation.isPending ? 'Saving...' : 'Save Record'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History */}
      <div className="grid gap-4">
        {testsLoading ? (
          <div className="text-center py-8 text-[var(--muted-foreground)]">Loading...</div>
        ) : tests?.length === 0 ? (
          <div className="text-center py-12 text-[var(--muted-foreground)] bg-[var(--card)] border border-[var(--border)] rounded-xl">
            No mock tests recorded yet.
          </div>
        ) : (
          tests?.map(test => (
            <div key={test._id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">{test.testName}</h3>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded text-xs font-bold",
                    test.percentage >= 70 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    test.percentage >= 50 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  )}>
                    {test.percentage}%
                  </span>
                </div>
                <div className="text-sm text-[var(--muted-foreground)] flex items-center gap-4">
                  <span>{format(new Date(test.date), 'MMMM dd, yyyy')}</span>
                  {test.provider && <span>Provider: {test.provider}</span>}
                </div>
                
                {test.subjectScores?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {test.subjectScores.map((ss, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-[var(--accent)] text-[var(--foreground)] rounded-md border border-[var(--border)]">
                        <span className="font-medium mr-1">{ss.subjectId?.name || ss.subject?.name || 'Unknown'}:</span>
                        {ss.score}/{ss.maxScore}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-[var(--border)] pt-4 md:pt-0 md:pl-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--foreground)]">
                    {test.obtainedScore} <span className="text-base text-[var(--muted-foreground)] font-normal">/ {test.totalScore}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(test._id)}
                  className="p-2 text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--accent)] rounded-lg transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MockTests;
