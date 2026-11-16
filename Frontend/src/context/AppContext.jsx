// ═══════════════════════════════════════════════
// Skill Xchange — App Context
// Global state for requests, sessions, credits, notifications
// ═══════════════════════════════════════════════

import { createContext, useContext, useState, useCallback } from 'react';
import { requestService } from '../services/requestService';
import { sessionService } from '../services/sessionService';
import { creditService } from '../services/creditService';
import { chatService } from '../services/chatService';
import { initialNotifications } from '../data/notifications';

const AppContext = createContext(null);

const NOTIF_KEY = 'skillxchange_notifications';

function getStoredNotifications() {
  const data = localStorage.getItem(NOTIF_KEY);
  return data ? JSON.parse(data) : [...initialNotifications];
}

export function AppProvider({ children }) {
  const [refreshKey, setRefreshKey] = useState(0);

  // Force re-render by incrementing key — services read from localStorage
  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // ── Requests ──
  const sendRequest = async (data) => {
    const result = await requestService.sendRequest(data);
    refresh();
    return result;
  };

  const acceptRequest = async (requestId) => {
    try {
      const result = await requestService.acceptRequest(requestId);
      refresh();
      return result;
    } catch (err) {
      throw err;
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      const result = await requestService.rejectRequest(requestId);
      refresh();
      return result;
    } catch (err) {
      throw err;
    }
  };

  const getIncomingRequests = (userId) => requestService.getIncomingRequests(userId);
  const getOutgoingRequests = (userId) => requestService.getOutgoingRequests(userId);
  const getConnections = (userId) => requestService.getConnections ? requestService.getConnections(userId) : [];

  // ── Sessions ──
  const createSession = (data) => {
    const result = sessionService.createSession(data);
    if (result) {
      addNotification({
        userId: data.teacherId === data.learnerId ? data.learnerId : data.teacherId,
        type: 'session_scheduled',
        title: 'Session Scheduled',
        message: `A new session on ${data.skill} has been scheduled`,
        fromUserId: data.learnerId,
        link: '/sessions',
      });
    }
    refresh();
    return result;
  };

  const completeSession = (sessionId) => {
    const result = sessionService.completeSession(sessionId);
    refresh();
    return result;
  };

  const rateSession = (sessionId, rating, review) => {
    const result = sessionService.rateSession(sessionId, rating, review);
    refresh();
    return result;
  };

  const getUserSessions = (userId) => sessionService.getUserSessions(userId);
  const getUpcomingSessions = (userId) => sessionService.getUpcomingSessions(userId);
  const getCompletedSessions = (userId) => sessionService.getCompletedSessions(userId);

  // ── Credits ──
  const getBalance = (userId) => creditService.getBalance(userId);

  const transferCredits = (data) => {
    const result = creditService.transferCredits(data);
    if (result.success) {
      sessionService.transferCredits(data.sessionId, data.amount);
      addNotification({
        userId: data.toUserId,
        type: 'credit_received',
        title: 'Credits Received!',
        message: `You received ${data.amount} Skill Credits`,
        fromUserId: data.fromUserId,
        link: '/credits',
      });
    }
    refresh();
    return result;
  };

  const getTransactionHistory = (userId) => creditService.getTransactionHistory(userId);

  // ── Chat ──
  const getConversation = (userId1, userId2) => chatService.getConversation(userId1, userId2);

  const sendMessage = (fromUserId, toUserId, text) => {
    const result = chatService.sendMessage(fromUserId, toUserId, text);
    refresh();
    return result;
  };

  // ── Notifications ──
  const getNotifications = (userId) => {
    return getStoredNotifications()
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const getUnreadCount = (userId) => {
    return getStoredNotifications().filter(
      (n) => n.userId === userId && !n.read
    ).length;
  };

  const addNotification = ({ userId, type, title, message, fromUserId, link }) => {
    const notifs = getStoredNotifications();
    notifs.push({
      id: 'notif_' + Date.now(),
      userId,
      type,
      title,
      message,
      fromUserId,
      read: false,
      createdAt: new Date().toISOString(),
      link: link || '/',
    });
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
  };

  const markNotificationRead = (notifId) => {
    const notifs = getStoredNotifications();
    const idx = notifs.findIndex((n) => n.id === notifId);
    if (idx !== -1) {
      notifs[idx].read = true;
      localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
      refresh();
    }
  };

  const markAllNotificationsRead = (userId) => {
    const notifs = getStoredNotifications();
    notifs.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
    refresh();
  };

  // ── Reset all data ──
  const resetAllData = () => {
    requestService.resetRequests();
    sessionService.resetSessions();
    creditService.resetCredits();
    chatService.resetMessages();
    localStorage.removeItem(NOTIF_KEY);
    refresh();
  };

  const value = {
    refreshKey,
    refresh,
    // Requests
    sendRequest,
    acceptRequest,
    rejectRequest,
    getIncomingRequests,
    getOutgoingRequests,
    getConnections,
    // Sessions
    createSession,
    completeSession,
    rateSession,
    getUserSessions,
    getUpcomingSessions,
    getCompletedSessions,
    // Credits
    getBalance,
    transferCredits,
    getTransactionHistory,
    // Chat
    getConversation,
    sendMessage,
    // Notifications
    getNotifications,
    getUnreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    // Reset
    resetAllData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
