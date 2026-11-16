// ═══════════════════════════════════════════════
// Skill Xchange — Auth Context
// Manages real backend authentication state and session
// ═══════════════════════════════════════════════

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { users } from '../data/users';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(authService.getCurrentAuth());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const user = await authService.getMe();
        if (isMounted) {
          setCurrentUser(user);
        }
      } catch (err) {
        console.warn('Failed to load user session on mount:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    try {
      const user = await authService.login(email, password);
      setCurrentUser(user);
      return { success: true, user };
    } catch (err) {
      return { success: false, error: err.message || 'Invalid email or password' };
    }
  };

  const loginAs = async (userId) => {
    try {
      const user = await authService.loginAs(userId);
      setCurrentUser(user);
      return { success: true, user };
    } catch (err) {
      return { success: false, error: err.message || 'Demo login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const user = await authService.register(userData);
      setCurrentUser(user);
      return { success: true, user };
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const switchUser = async (userId) => {
    return loginAs(userId);
  };

  const updateCurrentUser = useCallback((updatedUser) => {
    setCurrentUser((prev) => ({ ...prev, ...updatedUser }));
  }, []);

  const reloadUser = useCallback(async () => {
    try {
      const user = await authService.getMe();
      if (user) {
        setCurrentUser(user);
      }
      return user;
    } catch (err) {
      console.warn('Failed to reload current user:', err);
      return null;
    }
  }, []);

  const value = {
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    login,
    loginAs,
    register,
    logout,
    switchUser,
    updateCurrentUser,
    reloadUser,
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
