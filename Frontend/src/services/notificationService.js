// ═══════════════════════════════════════════════
// Skill Xchange — Notifications Service
// Integrates with backend APIs at /api/notifications
// ═══════════════════════════════════════════════

import { api } from './api';
import { initialNotifications } from '../data/notifications';

function normalizeNotification(notif) {
  if (!notif) return null;
  const fromUserId = notif.fromUser?._id
    ? notif.fromUser._id.toString()
    : (notif.fromUser?.id || notif.fromUser || notif.fromUserId);

  return {
    ...notif,
    fromUserId,
    createdAt: notif.createdAt || new Date().toISOString(),
  };
}

export const notificationService = {
  /**
   * Get user's notifications and unread count
   * @param {number} [page=1]
   * @param {number} [limit=50]
   */
  async getNotifications(page = 1, limit = 50) {
    try {
      const data = await api.get(`/notifications?page=${page}&limit=${limit}`);
      return {
        notifications: (data?.notifications || []).map(normalizeNotification),
        unreadCount: data?.unreadCount ?? 0,
        total: data?.total ?? 0,
        page: data?.page ?? 1,
        pages: data?.pages ?? 1,
      };
    } catch (err) {
      console.warn('Failed to fetch notifications from API:', err.message);
      return {
        notifications: initialNotifications.map(normalizeNotification),
        unreadCount: initialNotifications.filter((n) => !n.read).length,
        total: initialNotifications.length,
        page: 1,
        pages: 1,
      };
    }
  },

  /**
   * Mark a single notification as read
   * @param {string} notificationId
   */
  async markAsRead(notificationId) {
    if (!notificationId) return null;
    const data = await api.patch(`/notifications/${notificationId}/read`);
    return normalizeNotification(data?.notification);
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    const data = await api.patch('/notifications/read-all');
    return data;
  },
};

export default notificationService;
