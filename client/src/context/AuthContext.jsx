import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, loginUser, logoutUser, refreshSession, registerUser } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshSession();
        const userData = await getMe();
        setUser(userData.user || userData);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    const userData = await getMe();
    setUser(userData.user || userData);
    return data;
  };

  const register = async (name, email, password, targetExam) => {
    const data = await registerUser(name, email, password, targetExam);
    const userData = await getMe();
    setUser(userData.user || userData);
    return data;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
