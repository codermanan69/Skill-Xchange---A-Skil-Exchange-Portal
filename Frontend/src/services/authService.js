// ═══════════════════════════════════════════════
// Skill Xchange — Auth Service
// Integrates with real backend APIs at /api/auth
// ═══════════════════════════════════════════════

import { api, TOKEN_KEY, USER_KEY } from './api';
import { users } from '../data/users';

export const authService = {
  /**
   * Login with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} user object
   */
  async login(email, password) {
    const data = await api.post('/auth/login', {
      email: email.trim(),
      password,
    });
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }
    if (data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
    return data.user;
  },

  /**
   * Register a new user
   * @param {Object} userData
   * @returns {Promise<Object>} user object
   */
  async register(userData) {
    const data = await api.post('/auth/register', userData);
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }
    if (data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
    return data.user;
  },

  /**
   * Login directly with a user ID (for demo switcher)
   * Tries to login with demo credentials; registers first in backend if not yet present
   */
  async loginAs(userId) {
    const demoUser = users.find((u) => u.id === userId || u.email === userId);
    if (!demoUser) {
      throw new Error('Demo user not found');
    }

    const password = demoUser.password || 'demo123';

    try {
      return await this.login(demoUser.email, password);
    } catch (err) {
      // If user does not exist in backend yet, auto-register them
      if (err.message && (err.message.toLowerCase().includes('invalid') || err.status === 401)) {
        return await this.register({
          name: demoUser.name,
          email: demoUser.email,
          password: password,
          title: demoUser.title || '',
          bio: demoUser.bio || '',
          location: demoUser.location || '',
          skillsTeaching: demoUser.skillsTeaching || [],
          skillsLearning: demoUser.skillsLearning || [],
        });
      }
      throw err;
    }
  },

  /**
   * Get current authenticated user from backend
   */
  async getMe() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    try {
      const data = await api.get('/auth/me');
      if (data?.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return data.user;
      }
    } catch (err) {
      console.warn('Failed to fetch current user profile:', err.message);
      if (err.status === 401) {
        this.logout();
        return null;
      }
    }

    return this.getCurrentAuth();
  },

  /**
   * Logout
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Get cached user synchronously from localStorage
   */
  getCurrentAuth() {
    const data = localStorage.getItem(USER_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Check if token is present
   */
  isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};
