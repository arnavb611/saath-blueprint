import { useState, useEffect, useCallback } from 'react';
import { User, getCurrentUser, login as authLogin, logout as authLogout, register as authRegister } from '@/lib/storage';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = useCallback((email: string, password: string): boolean => {
    const loggedInUser = authLogin(email, password);
    if (loggedInUser) {
      setUser(loggedInUser);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  const register = useCallback((email: string, password: string, name: string): boolean => {
    const newUser = authRegister(email, password, name);
    if (newUser) {
      setUser(newUser);
      return true;
    }
    return false;
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    register,
  };
};
