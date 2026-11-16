// ═══════════════════════════════════════════════
// Skill Xchange — Sessions Service
// Integrates with backend APIs at /api/sessions
// ═══════════════════════════════════════════════

import { api } from './api';
import { initialSessions } from '../data/sessions';

export const sessionService = {
  /**
   * Fetch all user sessions (filtered by status or all)
   * @param {string} [status] 'scheduled' | 'completed' | 'cancelled'
   */
  async getSessions(status) {
    try {
      const endpoint = status ? `/sessions?status=${status}` : '/sessions';
      const data = await api.get(endpoint);
      return {
        sessions: data?.sessions || [],
        upcoming: data?.upcoming || [],
        completed: data?.completed || [],
      };
    } catch (err) {
      console.warn('Failed to fetch sessions from API:', err.message);
      return {
        sessions: initialSessions,
        upcoming: initialSessions.filter((s) => s.status === 'scheduled'),
        completed: initialSessions.filter((s) => s.status === 'completed'),
      };
    }
  },

  /**
   * Fetch upcoming scheduled sessions
   */
  async getUpcomingSessions() {
    const res = await this.getSessions('scheduled');
    return res.upcoming || [];
  },

  /**
   * Fetch completed sessions
   */
  async getCompletedSessions() {
    const res = await this.getSessions('completed');
    return res.completed || [];
  },

  /**
   * Fetch a single session by ID
   */
  async getSessionById(sessionId) {
    const data = await api.get(`/sessions/${sessionId}`);
    return data?.session || null;
  },

  /**
   * Schedule a new session
   * @param {Object} data { requestId, partnerId, teacherId, learnerId, skill, topic, date, time, duration }
   */
  async createSession(data) {
    const payload = {
      ...data,
      duration: Number(data.duration) || 60,
    };
    const res = await api.post('/sessions', payload);
    return res?.session;
  },

  /**
   * Update or reschedule a session
   */
  async updateSession(sessionId, updates) {
    const res = await api.patch(`/sessions/${sessionId}`, updates);
    return res?.session;
  },

  /**
   * Complete a session and settle credits
   * @param {string} sessionId
   * @param {Object} [details] { creditAmount, rating, review }
   */
  async completeSession(sessionId, details = {}) {
    const res = await api.patch(`/sessions/${sessionId}/complete`, details);
    return res?.session;
  },

  /**
   * Cancel a scheduled session
   */
  async cancelSession(sessionId) {
    const res = await api.patch(`/sessions/${sessionId}/cancel`);
    return res?.session;
  },

  /**
   * Submit review and rating for a completed session
   */
  async rateSession(sessionId, rating, review) {
    const res = await api.post(`/sessions/${sessionId}/review`, { rating, review });
    return res?.session;
  },

  /**
   * Fallback reset
   */
  resetSessions() {
    localStorage.removeItem('skillxchange_sessions');
  },
};

export default sessionService;
