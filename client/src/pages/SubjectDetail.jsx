import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Edit2, Trash2, ChevronDown, ChevronUp, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { getSubjects } from '../api/subjects';
import { getChapters, createChapter, updateChapter, deleteChapter } from '../api/chapters';
import { cn } from '../lib/utils';

const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Completed', 'Revision Required'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

const STATUS_COLORS = {
  'Not Started': 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  'In Progress': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  'Completed': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  'Revision Required': 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
};

const PRIORITY_COLORS = {
  'Low': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'Medium': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  'High': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const SubjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    status: 'Not Started',
    priority: 'Medium',
    targetDate: '',
    subtopics: []
  });
  const [newSubtopic, setNewSubtopic] = useState('');

  // Fetch subject details
  const { data: subjects, isLoading: subjectLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: getSubjects
  });
  const subject = subjects?.find(s => s._id === id);

  // Fetch chapters for this subject
  const { data: chapters, isLoading: chaptersLoading } = useQuery({
    queryKey: ['chapters', id],
    queryFn: () => getChapters(id),
    enabled: !!id
  });

  const createMutation = useMutation({
    mutationFn: (data) => createChapter({ ...data, subjectId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['chapters', id]);
      queryClient.invalidateQueries(['subjects']); // Update chapter count
      toast.success('Chapter added successfully');
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add chapter')
  });

  const updateMutation = useMutation({
    mutationFn: ({ chapterId, data }) => updateChapter(chapterId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['chapters', id]);
      toast.success('Chapter updated successfully');
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update chapter')
  });

  const deleteMutation = useMutation({
    mutationFn: deleteChapter,
    onSuccess: () => {
      queryClient.invalidateQueries(['chapters', id]);
      queryClient.invalidateQueries(['subjects']);
      toast.success('Chapter deleted successfully');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete chapter')
  });

  const openModal = (chapter = null) => {
    if (chapter) {
      setEditingChapter(chapter);
      setFormData({
        title: chapter.title,
        status: chapter.status,
        priority: chapter.priority,
        targetDate: chapter.targetDate ? new Date(chapter.targetDate).toISOString().split('T')[0] : '',
        subtopics: chapter.subtopics?.map(st => ({ title: st.title, isCompleted: st.completed ?? st.isCompleted ?? false })) || []
      });
    } else {
      setEditingChapter(null);
      setFormData({
        title: '',
        status: 'Not Started',
        priority: 'Medium',
        targetDate: '',
        subtopics: []
      });
    }
    setNewSubtopic('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleAddSubtopic = (e) => {
    e.preventDefault();
    if (newSubtopic.trim()) {
      setFormData(prev => ({
        ...prev,
        subtopics: [...prev.subtopics, { title: newSubtopic.trim(), isCompleted: false }]
      }));
      setNewSubtopic('');
    }
  };

  const handleRemoveSubtopic = (index) => {
    setFormData(prev => ({
      ...prev,
      subtopics: prev.subtopics.filter((_, i) => i !== index)
    }));
  };

  const handleToggleSubtopicComplete = (index) => {
    setFormData(prev => {
      const newSubtopics = [...prev.subtopics];
      newSubtopics[index].isCompleted = !newSubtopics[index].isCompleted;
      return { ...prev, subtopics: newSubtopics };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) return toast.error('Chapter title is required');

    const submitData = {
      ...formData,
      targetDate: formData.targetDate || null
    };

    if (editingChapter) {
      updateMutation.mutate({ chapterId: editingChapter._id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (chapterId) => {
    if (window.confirm('Are you sure you want to delete this chapter?')) {
      deleteMutation.mutate(chapterId);
    }
  };

  const toggleSubtopicInline = (chapter, subtopicIndex) => {
    const newSubtopics = chapter.subtopics.map((st, idx) => ({
      title: st.title,
      completed: idx === subtopicIndex ? !(st.completed ?? st.isCompleted) : (st.completed ?? st.isCompleted ?? false)
    }));
    updateMutation.mutate({ chapterId: chapter._id, data: { subtopics: newSubtopics } });
  };

  if (subjectLoading || chaptersLoading) return <div className="p-8 text-center text-[var(--muted-foreground)]">Loading...</div>;
  if (!subject) return <div className="p-8 text-center text-[var(--muted-foreground)]">Subject not found</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/subjects')}
            className="p-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: subject.colorCode || 'var(--primary)' }} />
            <h1 className="text-2xl font-bold text-[var(--foreground)]">{subject.name}</h1>
          </div>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
        >
          <Plus size={20} />
          Add Chapter
        </button>
      </div>

      {/* Chapters List */}
      <div className="space-y-4">
        {chapters?.length === 0 ? (
          <div className="py-12 text-center text-[var(--muted-foreground)] border-2 border-dashed border-[var(--border)] rounded-xl bg-[var(--card)]">
            No chapters yet. Click "Add Chapter" to create one.
          </div>
        ) : (
          chapters?.map(chapter => {
            const accuracy = chapter.totalQuestionsSolved > 0 
              ? Math.round(chapter.accuracyPercent || ((chapter.correctQuestions / chapter.totalQuestionsSolved) * 100))
              : 0;

            return (
              <div key={chapter._id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
                <div 
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-[var(--accent)] hover:bg-opacity-50 transition-colors"
                  onClick={() => setExpandedChapter(expandedChapter === chapter._id ? null : chapter._id)}
                >
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                    <div className="flex items-center gap-3">
                      {expandedChapter === chapter._id ? <ChevronUp size={20} className="text-[var(--muted-foreground)]" /> : <ChevronDown size={20} className="text-[var(--muted-foreground)]" />}
                      <h3 className="font-semibold text-[var(--foreground)] text-lg">{chapter.title}</h3>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 pl-8 sm:pl-0">
                      <span className={cn("px-2.5 py-1 text-xs font-medium rounded-full border", STATUS_COLORS[chapter.status])}>
                        {chapter.status}
                      </span>
                      <span className={cn("px-2.5 py-1 text-xs font-medium rounded-full", PRIORITY_COLORS[chapter.priority])}>
                        {chapter.priority} Priority
                      </span>
                      {chapter.totalQuestionsSolved > 0 && (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--accent)] text-[var(--foreground)] border border-[var(--border)]">
                          Accuracy: {accuracy}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-8 sm:pl-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); openModal(chapter); }}
                      className="p-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--accent)] rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(chapter._id); }}
                      className="p-2 text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--accent)] rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Expanded Subtopics */}
                {expandedChapter === chapter._id && chapter.subtopics?.length > 0 && (
                  <div className="border-t border-[var(--border)] p-4 sm:p-5 bg-[var(--accent)] bg-opacity-20">
                    <h4 className="text-sm font-semibold text-[var(--foreground)] mb-3 pl-8">Subtopics</h4>
                    <ul className="space-y-2 pl-8">
                      {chapter.subtopics.map((subtopic, idx) => {
                        const isDone = subtopic.completed ?? subtopic.isCompleted;
                        return (
                          <li key={idx} className="flex items-center gap-3">
                            <button
                              onClick={() => toggleSubtopicInline(chapter, idx)}
                              className={cn(
                                "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                isDone 
                                  ? "bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)]" 
                                  : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]"
                              )}
                            >
                              {isDone && <CheckCircle size={14} />}
                            </button>
                            <span className={cn(
                              "text-sm",
                              isDone ? "text-[var(--muted-foreground)] line-through" : "text-[var(--foreground)]"
                            )}>
                              {subtopic.title}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[var(--card)] w-full max-w-lg rounded-xl shadow-xl overflow-hidden border border-[var(--border)] flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-[var(--border)] shrink-0">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {editingChapter ? 'Edit Chapter' : 'Add Chapter'}
              </h2>
              <button onClick={closeModal} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1">
              <form id="chapterForm" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    placeholder="e.g. Thermodynamics"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    >
                      {STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    >
                      {PRIORITY_OPTIONS.map(priority => <option key={priority} value={priority}>{priority}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Target Date</label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Subtopics</label>
                  
                  {/* Add Subtopic Input */}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newSubtopic}
                      onChange={(e) => setNewSubtopic(e.target.value)}
                      onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddSubtopic(e); } }}
                      className="flex-1 px-3 py-2 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] text-sm"
                      placeholder="Add a subtopic..."
                    />
                    <button
                      type="button"
                      onClick={handleAddSubtopic}
                      className="px-3 py-2 bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-lg text-sm font-medium hover:bg-opacity-80"
                    >
                      Add
                    </button>
                  </div>

                  {/* Subtopics List */}
                  {formData.subtopics.length > 0 && (
                    <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {formData.subtopics.map((subtopic, index) => (
                        <li key={index} className="flex items-center gap-2 bg-[var(--accent)] p-2 rounded-lg border border-[var(--border)]">
                          <button
                            type="button"
                            onClick={() => handleToggleSubtopicComplete(index)}
                            className={cn(
                              "w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors",
                              subtopic.isCompleted 
                                ? "bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)]" 
                                : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]"
                            )}
                          >
                            {subtopic.isCompleted && <CheckCircle size={14} />}
                          </button>
                          <span className={cn("flex-1 text-sm truncate", subtopic.isCompleted ? "line-through text-[var(--muted-foreground)]" : "text-[var(--foreground)]")}>
                            {subtopic.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubtopic(index)}
                            className="p-1 text-[var(--muted-foreground)] hover:text-[var(--destructive)] rounded"
                          >
                            <X size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-[var(--border)] flex gap-3 shrink-0">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 px-4 py-2 bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-lg font-medium hover:bg-opacity-80 transition-colors"
              >
                Cancel
              </button>
              <button
                form="chapterForm"
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-70"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Chapter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectDetail;
