// ═══════════════════════════════════════════════
// Skill Xchange — Auth Context
// ═══════════════════════════════════════════════

import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { users } from '../data/users';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    const user = authService.getCurrentAuth();
    if (user) {
      setCurrentUser(user);
    }
    setIsLoading(false);
  }, []);

  const login = (email, password) => {
    const user = authService.login(email, password);
    if (user) {
      setCurrentUser(user);
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const loginAs = (userId) => {
    const user = authService.loginAs(userId);
    if (user) {
      setCurrentUser(user);
      return { success: true };
    }
    return { success: false };
  };

  const register = (userData) => {
    const user = authService.register(userData);
    setCurrentUser(user);
    return { success: true };
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const switchUser = (userId) => {
    return loginAs(userId);
  };

  const value = {
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    login,
    loginAs,
    register,
    logout,
    switchUser,
    allUsers: users,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
