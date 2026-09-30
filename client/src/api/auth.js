import api, { setAccessToken } from './axios';

export const loginUser = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  setAccessToken(data.token || data.accessToken);
  return data;
};

export const registerUser = async (name, email, password, targetExam) => {
  const { data } = await api.post('/auth/register', { name, email, password, targetExam });
  setAccessToken(data.token || data.accessToken);
  return data;
};

export const refreshSession = async () => {
  const { data } = await api.post('/auth/refresh');
  setAccessToken(data.token || data.accessToken);
  return data;
};

export const logoutUser = async () => {
  await api.post('/auth/logout');
  setAccessToken(null);
};

export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};
