// ═══════════════════════════════════════════════
// Skill Xchange — Chat Service
// Integrates with backend REST APIs at /api/chat
// ═══════════════════════════════════════════════

import { api } from './api';
import { getConversationKey } from '../data/messages';

function normalizeMessage(msg) {
  if (!msg) return null;
  const senderId = msg.sender?._id ? msg.sender._id.toString() : (msg.sender?.id || msg.sender || msg.senderId);
  const recipientId = msg.recipient?._id ? msg.recipient._id.toString() : (msg.recipient?.id || msg.recipient || msg.recipientId);

  return {
    ...msg,
    senderId,
    recipientId,
    timestamp: msg.createdAt || msg.timestamp || new Date().toISOString(),
  };
}

export const chatService = {
  /**
   * Get all active conversation threads for current user
   * @returns {Promise<Array<{ partner: Object, lastMessage: Object, unreadCount: number }>>}
   */
  async getConversations() {
    try {
      const data = await api.get('/chat/conversations');
      return (data?.conversations || []).map((c) => ({
        ...c,
        lastMessage: normalizeMessage(c.lastMessage),
      }));
    } catch (err) {
      console.warn('Failed to fetch conversations from API:', err.message);
      return [];
    }
  },

  /**
   * Get chronological message history with a specific partner
   * @param {string} partnerId
   * @param {number} [page=1]
   * @param {number} [limit=100]
   */
  async getMessages(partnerId, page = 1, limit = 100) {
    if (!partnerId) return { messages: [], partner: null };
    try {
      const data = await api.get(`/chat/${partnerId}?page=${page}&limit=${limit}`);
      return {
        partner: data?.partner || null,
        messages: (data?.messages || []).map(normalizeMessage),
        total: data?.total || 0,
        page: data?.page || 1,
        pages: data?.pages || 1,
      };
    } catch (err) {
      console.warn(`Failed to fetch messages for partner ${partnerId}:`, err.message);
      return { messages: [], partner: null };
    }
  },

  /**
   * Send a new message to a specific partner
   * @param {string} partnerId
   * @param {string} text
   */
  async sendMessage(partnerId, text) {
    if (!partnerId || !text?.trim()) {
      throw new Error('Recipient and message text are required');
    }
    const data = await api.post(`/chat/${partnerId}`, {
      text: text.trim(),
    });
    return normalizeMessage(data?.message);
  },

  getConversationKey,

  /**
   * Synchronous / fallback helpers for legacy components
   */
  resetMessages() {
    localStorage.removeItem('skillxchange_messages');
  },
};

export default chatService;
