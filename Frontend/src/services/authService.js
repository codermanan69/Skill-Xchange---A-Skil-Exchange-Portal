// ═══════════════════════════════════════════════
// Skill Xchange — Auth Service
// Currently uses localStorage. Replace with API calls later.
// ═══════════════════════════════════════════════

import { users, CURRENT_USER_KEY } from '../data/users';

const AUTH_KEY = 'skillxchange_auth';

export const authService = {
  /**
   * Login with email and password
   * @returns {Object|null} user object or null
   */
  login(email, password) {
    const user = users.find(
      (u) => u.email === email && u.password === password
    );
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify({ isLoggedIn: true, userId: user.id }));
      localStorage.setItem(CURRENT_USER_KEY, user.id);
      return { ...user };
    }
    return null;
  },

  /**
   * Login directly with a user ID (for demo switcher)
   */
  loginAs(userId) {
    const user = users.find((u) => u.id === userId);
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify({ isLoggedIn: true, userId: user.id }));
      localStorage.setItem(CURRENT_USER_KEY, user.id);
      return { ...user };
    }
    return null;
  },

  /**
   * Register a new user (simulated)
   */
  register(userData) {
    // In a real app, this would POST to /api/auth/register
    const newUser = {
      id: 'user_' + Date.now(),
      ...userData,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}&backgroundColor=b6e3f4`,
      rating: 0,
      totalReviews: 0,
      totalSessions: 0,
      credits: 100, // Welcome bonus
      isOnline: true,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify({ isLoggedIn: true, userId: newUser.id }));
    localStorage.setItem(CURRENT_USER_KEY, newUser.id);
    return newUser;
  },

  /**
   * Logout
   */
  logout() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  /**
   * Get current auth state
   */
  getCurrentAuth() {
    const data = localStorage.getItem(AUTH_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.isLoggedIn) {
        const user = users.find((u) => u.id === parsed.userId);
        return user ? { ...user } : null;
      }
    }
    return null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const data = localStorage.getItem(AUTH_KEY);
    if (data) {
      return JSON.parse(data).isLoggedIn === true;
    }
    return false;
  },
};
