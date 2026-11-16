// ═══════════════════════════════════════════════
// Skill Xchange — Request Service
// Integrates with real backend APIs at /api/requests
// ═══════════════════════════════════════════════

import { api } from './api';
import { initialRequests } from '../data/requests';

export const requestService = {
  /**
   * Fetch all requests for current user (incoming & outgoing)
   */
  async getAllRequests(type) {
    try {
      const endpoint = type ? `/requests?type=${type}` : '/requests';
      const data = await api.get(endpoint);
      return data;
    } catch (err) {
      console.warn('Failed to fetch requests from API:', err.message);
      return { requests: [], incoming: [], outgoing: [] };
    }
  },

  /**
   * Fetch incoming requests
   */
  async getIncomingRequests() {
    try {
      const data = await api.get('/requests?type=incoming');
      return data?.incoming || [];
    } catch (err) {
      console.warn('Failed to fetch incoming requests:', err.message);
      return [];
    }
  },

  /**
   * Fetch outgoing requests
   */
  async getOutgoingRequests() {
    try {
      const data = await api.get('/requests?type=outgoing');
      return data?.outgoing || [];
    } catch (err) {
      console.warn('Failed to fetch outgoing requests:', err.message);
      return [];
    }
  },

  /**
   * Send a new skill exchange request
   * @param {Object} data { toUserId, skillOffered, skillWanted, message }
   */
  async sendRequest({ toUserId, skillOffered, skillWanted, message }) {
    try {
      const data = await api.post('/requests', {
        toUserId,
        skillOffered,
        skillWanted,
        message,
      });
      return data.request;
    } catch (err) {
      return { error: err.message || 'Failed to send exchange request' };
    }
  },

  /**
   * Accept an incoming request
   */
  async acceptRequest(requestId) {
    try {
      const data = await api.patch(`/requests/${requestId}/accept`);
      return data.request;
    } catch (err) {
      throw new Error(err.message || 'Failed to accept request');
    }
  },

  /**
   * Reject an incoming request
   */
  async rejectRequest(requestId) {
    try {
      const data = await api.patch(`/requests/${requestId}/reject`);
      return data.request;
    } catch (err) {
      throw new Error(err.message || 'Failed to reject request');
    }
  },

  /**
   * Synchronous / fallback helpers for legacy components
   */
  getStoredRequests() {
    return [...initialRequests];
  },
};

export default requestService;
