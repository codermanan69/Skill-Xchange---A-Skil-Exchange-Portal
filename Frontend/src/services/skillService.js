// ═══════════════════════════════════════════════
// Skill Xchange — Skills Service
// Integrates with /api/skills and /api/skills/categories
// ═══════════════════════════════════════════════

import { api } from './api';
import { skills as defaultSkills, skillCategories as defaultCategories } from '../data/skills';

export const skillService = {
  /**
   * Get all skills from backend with fallback
   */
  async getSkills(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const endpoint = query ? `/skills?${query}` : '/skills';
      const data = await api.get(endpoint);
      return data?.skills || defaultSkills;
    } catch (err) {
      console.warn('Failed to fetch skills from API, using default skills:', err.message);
      return defaultSkills;
    }
  },

  /**
   * Get skill categories from backend with fallback
   */
  async getCategories() {
    try {
      const data = await api.get('/skills/categories');
      return data?.categories || defaultCategories;
    } catch (err) {
      console.warn('Failed to fetch categories from API, using default categories:', err.message);
      return defaultCategories;
    }
  },
};

export default skillService;
