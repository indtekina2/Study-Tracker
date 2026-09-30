import api from './axios';

export const getSubjects = async () => {
  const { data } = await api.get('/subjects');
  return data.data;
};

export const createSubject = async (subjectData) => {
  const { data } = await api.post('/subjects', subjectData);
  return data.data;
};

export const updateSubject = async (id, subjectData) => {
  const { data } = await api.put(`/subjects/${id}`, subjectData);
  return data.data;
};

export const deleteSubject = async (id) => {
  const { data } = await api.delete(`/subjects/${id}`);
  return data.data;
};
