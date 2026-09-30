import api from './axios';

export const getChapters = async (subjectId) => {
  const url = subjectId ? `/chapters?subjectId=${subjectId}` : '/chapters';
  const { data } = await api.get(url);
  return data.data;
};

export const createChapter = async (chapterData) => {
  const { data } = await api.post('/chapters', chapterData);
  return data.data;
};

export const updateChapter = async (id, chapterData) => {
  const { data } = await api.put(`/chapters/${id}`, chapterData);
  return data.data;
};

export const deleteChapter = async (id) => {
  const { data } = await api.delete(`/chapters/${id}`);
  return data.data;
};
