// src/context/AuthContext.jsx
import { useState, useEffect } from 'react';
import authService from '../services/authService';
import { AuthContext } from './AuthContextBase';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const storedUser = authService.getUser();
      if (storedUser) {
        setUser(storedUser);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Грешка при влизане',
      };
    }
  };

  // const register = async (userData) => {
  //   try {
  //     const data = await authService.register(userData);
  //     setUser(data.user);
  //     return { success: true, data };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       error: error.response?.data?.message || 'Грешка при регистрация',
  //     };
  //   }
  // };

  const register = async (userData) => {
  try {
    const data = await authService.register(userData);
    setUser(data.user);
    return { success: true, data };
  } catch (error) {
    console.error('REGISTER ERROR:', error?.response || error); // 👈 добави това

    return {
      success: false,
      error:
        error?.response?.data?.message ||
        error?.response?.data?.error || // често backend връща "error"
        'Грешка при регистрация',
    };
  }
};

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAuthenticated = () => !!user;
  const hasRole = (role) => user?.role === role;

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
