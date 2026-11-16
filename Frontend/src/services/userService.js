// ═══════════════════════════════════════════════
// Skill Xchange — User Service
// Integrates with real backend APIs at /api/users
// ═══════════════════════════════════════════════

import { api } from './api';
import { users as defaultUsers, getUserById as getDefaultUserById } from '../data/users';

export const userService = {
  /**
   * Get all discoverable users with skill matching
   * @param {Object} params { search, category }
   * @returns {Promise<{ users: Array, matches: Array }>}
   */
  async getDiscoverUsers(params = {}) {
    try {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      if (params.category && params.category !== 'all') searchParams.append('category', params.category);

      const queryStr = searchParams.toString();
      const endpoint = queryStr ? `/users/discover?${queryStr}` : '/users/discover';
      const data = await api.get(endpoint);

      return {
        users: data?.users || [],
        matches: data?.matches || [],
      };
    } catch (err) {
      console.warn('Failed to fetch discover users from API:', err.message);
      return {
        users: defaultUsers,
        matches: [],
      };
    }
  },

  /**
   * Get user profile by ID from backend with fallback
   * @param {string} id
   * @returns {Promise<Object>} user object
   */
  async getUserById(id) {
    if (!id) return null;
    try {
      const data = await api.get(`/users/${id}`);
      return data?.user || null;
    } catch (err) {
      // Fallback to local user data if MongoDB ID is not found or is mock ID
      const local = getDefaultUserById(id);
      if (local) return local;
      console.warn(`User ${id} not found on backend:`, err.message);
      return null;
    }
  },

  /**
   * Get current authenticated user profile
   */
  async getMyProfile() {
    const data = await api.get('/users/me');
    return data?.user || null;
  },

  /**
   * Update current user profile
   * @param {string} userId
   * @param {Object} updates
   * @returns {Promise<Object>} updated user object
   */
  async updateProfile(userId, updates) {
    const data = await api.patch('/users/me', updates);
    return data?.user || null;
  },

  /**
   * Synchronous / fallback helpers for legacy components
   */
  getAllUsers() {
    return [...defaultUsers];
  },

  getOtherUsers(currentUserId) {
    return defaultUsers.filter((u) => u.id !== currentUserId);
  },

  getSkillMatches(currentUserId) {
    const currentUser = getDefaultUserById(currentUserId);
    if (!currentUser) return [];

    return defaultUsers
      .filter((u) => u.id !== currentUserId)
      .map((u) => {
        const matchingSkills = (u.skillsTeaching || []).filter((skill) =>
          (currentUser.skillsLearning || []).includes(skill)
        );
        const reverseMatch = (currentUser.skillsTeaching || []).filter((skill) =>
          (u.skillsLearning || []).includes(skill)
        );
        return {
          user: u,
          matchingSkills,
          reverseMatch,
          matchScore: matchingSkills.length + reverseMatch.length,
        };
      })
      .filter((m) => m.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);
  },
};

export default userService;
