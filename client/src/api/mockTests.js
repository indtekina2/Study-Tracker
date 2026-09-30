import api from './axios';

export const getMockTests = async () => {
  const { data } = await api.get('/mock-tests');
  return data.data;
};

export const createMockTest = async (testData) => {
  const { data } = await api.post('/mock-tests', testData);
  return data.data;
};

export const deleteMockTest = async (id) => {
  const { data } = await api.delete(`/mock-tests/${id}`);
  return data.data;
};

export const getMockTestAnalytics = async () => {
  const { data } = await api.get('/mock-tests/analytics');
  return data.data;
};
