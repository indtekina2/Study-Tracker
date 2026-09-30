import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../api/subjects';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'];

const Subjects = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({ name: '', colorCode: COLORS[0] });
  
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: subjects, isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: getSubjects
  });

  const createMutation = useMutation({
    mutationFn: createSubject,
    onSuccess: () => {
      queryClient.invalidateQueries(['subjects']);
      toast.success('Subject created successfully');
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to create subject')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateSubject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['subjects']);
      toast.success('Subject updated successfully');
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update subject')
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSubject,
    onSuccess: () => {
      queryClient.invalidateQueries(['subjects']);
      toast.success('Subject deleted successfully');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to delete subject')
  });

  const openModal = (subject = null) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({ name: subject.name, colorCode: subject.colorCode || COLORS[0] });
    } else {
      setEditingSubject(null);
      setFormData({ name: '', colorCode: COLORS[0] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
    setFormData({ name: '', colorCode: COLORS[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error('Name is required');
    
    if (editingSubject) {
      updateMutation.mutate({ id: editingSubject._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation(); // Prevent card click
    if (window.confirm('Are you sure you want to delete this subject? All related chapters and logs will be affected.')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-[var(--muted-foreground)]">Loading subjects...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Subjects</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
        >
          <Plus size={20} />
          Add Subject
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects?.map((subject) => {
          const totalChapters = subject.chapterCount ?? (subject.chapters?.length || 0);
          const completedChapters = subject.completedChapters ?? (subject.chapters?.filter(c => c.status === 'Completed').length || 0);
          const progress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

          return (
            <div
              key={subject._id}
              onClick={() => navigate(`/subjects/${subject._id}`)}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: subject.colorCode || 'var(--primary)' }} 
                  />
                  <h3 className="font-semibold text-lg text-[var(--foreground)]">{subject.name}</h3>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); openModal(subject); }}
                    className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--accent)] rounded-md"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, subject._id)}
                    className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--accent)] rounded-md"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm text-[var(--muted-foreground)]">
                  <span>{totalChapters} Chapters</span>
                  <span>{progress}% Complete</span>
                </div>
                <div className="w-full h-2 bg-[var(--accent)] rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: subject.colorCode || 'var(--primary)'
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
        {(!subjects || subjects.length === 0) && (
          <div className="col-span-full py-12 text-center text-[var(--muted-foreground)] border-2 border-dashed border-[var(--border)] rounded-xl">
            No subjects found. Click "Add Subject" to get started.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[var(--card)] w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-[var(--border)]">
            <div className="flex justify-between items-center p-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {editingSubject ? 'Edit Subject' : 'Add Subject'}
              </h2>
              <button onClick={closeModal} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Subject Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  placeholder="e.g. Physics"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Color</label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, colorCode: color })}
                      className={`w-8 h-8 rounded-full focus:outline-none transition-transform ${
                        formData.colorCode === color ? 'scale-125 ring-2 ring-offset-2 ring-offset-[var(--card)] ring-[var(--foreground)]' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-lg font-medium hover:bg-opacity-80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-70"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;
