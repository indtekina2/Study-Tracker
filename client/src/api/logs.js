import api from './axios';

export const getLogs = async (params) => {
  const { data } = await api.get('/logs', { params });
  return data.data;
};

export const createLog = async (logData) => {
  const { data } = await api.post('/logs', logData);
  return data.data;
};

export const getLogStats = async () => {
  const { data } = await api.get('/logs/stats');
  return data.data;
};
