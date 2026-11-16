// ═══════════════════════════════════════════════
// Skill Xchange — App Context
// Centralized state for requests, sessions, credits, chat, notifications
// ═══════════════════════════════════════════════

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { requestService } from '../services/requestService';
import { sessionService } from '../services/sessionService';
import { creditService } from '../services/creditService';
import { chatService } from '../services/chatService';
import { notificationService } from '../services/notificationService';
import { TOKEN_KEY } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { currentUser } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [walletBalance, setWalletBalance] = useState(100);
  const [connections, setConnections] = useState([]);

  // Increment key to trigger reactive re-fetching across consumers
  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Sync background metrics (unread notifications, wallet balance, accepted connections)
  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem(TOKEN_KEY);
    const currentUserId = currentUser?.id || currentUser?._id;

    if (!token || !currentUserId) {
      setWalletBalance(100);
      setUnreadCount(0);
      setConnections([]);
      return;
    }

    if (typeof currentUser?.credits === 'number') {
      setWalletBalance(currentUser.credits);
    }

    async function loadGlobalMetrics() {
      try {
        const [notifData, walletData, reqData] = await Promise.allSettled([
          notificationService.getNotifications(1, 10),
          creditService.getWalletSummary(),
          requestService.getAllRequests(),
        ]);

        if (isMounted) {
          if (notifData.status === 'fulfilled') {
            setUnreadCount(notifData.value?.unreadCount ?? 0);
          }
          if (walletData.status === 'fulfilled') {
            setWalletBalance(walletData.value?.balance ?? currentUser?.credits ?? 100);
          }
          if (reqData.status === 'fulfilled') {
            const allReqs = reqData.value?.requests || [];
            const accepted = allReqs.filter((r) => r.status === 'accepted');
            setConnections(accepted);
          }
        }
      } catch (err) {
        console.warn('Failed to load global metrics:', err);
      }
    }

    loadGlobalMetrics();

    return () => {
      isMounted = false;
    };
  }, [refreshKey, currentUser?.id, currentUser?._id, currentUser?.credits]);

  // ── Requests ──
  const sendRequest = async (data) => {
    const result = await requestService.sendRequest(data);
    refresh();
    return result;
  };

  const acceptRequest = async (requestId) => {
    const result = await requestService.acceptRequest(requestId);
    refresh();
    return result;
  };

  const rejectRequest = async (requestId) => {
    const result = await requestService.rejectRequest(requestId);
    refresh();
    return result;
  };

  const getIncomingRequests = (userId) => requestService.getIncomingRequests(userId);
  const getOutgoingRequests = (userId) => requestService.getOutgoingRequests(userId);

  const getConnections = useCallback((userId) => {
    return connections.map((r) => {
      const fromId = r.fromUser?._id ? r.fromUser._id.toString() : (r.fromUser?.id || r.fromUser || r.fromUserId);
      const toId = r.toUser?._id ? r.toUser._id.toString() : (r.toUser?.id || r.toUser || r.toUserId);
      const otherUser = fromId === userId ? r.toUser : r.fromUser;
      const otherUserId = fromId === userId ? toId : fromId;
      return {
        request: r,
        otherUserId,
        otherUser: typeof otherUser === 'object' ? otherUser : null,
      };
    });
  }, [connections]);

  // ── Sessions ──
  const createSession = async (data) => {
    const result = await sessionService.createSession(data);
    refresh();
    return result;
  };

  const completeSession = async (sessionId, details = {}) => {
    const result = await sessionService.completeSession(sessionId, details);
    refresh();
    return result;
  };

  const cancelSession = async (sessionId) => {
    const result = await sessionService.cancelSession(sessionId);
    refresh();
    return result;
  };

  const rateSession = async (sessionId, rating, review) => {
    const result = await sessionService.rateSession(sessionId, rating, review);
    refresh();
    return result;
  };

  const getUserSessions = (userId) => sessionService.getSessions();
  const getUpcomingSessions = (userId) => sessionService.getUpcomingSessions();
  const getCompletedSessions = (userId) => sessionService.getCompletedSessions();

  // ── Credits ──
  const getBalance = (userId) => {
    const currentUserId = currentUser?.id || currentUser?._id;
    if (!userId || userId === currentUserId) {
      return walletBalance;
    }
    return 100;
  };

  const transferCredits = async (data) => {
    // When completed via session completion, credits settle through completeSession
    refresh();
    return { success: true };
  };

  const getTransactionHistory = (userId) => creditService.getTransactionHistory();

  // ── Chat ──
  const getConversation = (userId1, userId2) => chatService.getMessages(userId2);

  const sendMessage = async (fromUserId, toUserId, text) => {
    const result = await chatService.sendMessage(toUserId, text);
    refresh();
    return result;
  };

  // ── Notifications ──
  const getNotifications = (userId) => notificationService.getNotifications();
  const getUnreadCount = (userId) => unreadCount;

  const markNotificationRead = async (notifId) => {
    const result = await notificationService.markAsRead(notifId);
    setUnreadCount((prev) => Math.max(0, prev - 1));
    refresh();
    return result;
  };

  const markAllNotificationsRead = async (userId) => {
    const result = await notificationService.markAllAsRead();
    setUnreadCount(0);
    refresh();
    return result;
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
    cancelSession,
    rateSession,
    getUserSessions,
    getUpcomingSessions,
    getCompletedSessions,
    // Credits
    getBalance,
    walletBalance,
    transferCredits,
    getTransactionHistory,
    // Chat
    getConversation,
    sendMessage,
    // Notifications
    unreadCount,
    getNotifications,
    getUnreadCount,
    markNotificationRead,
    markAllNotificationsRead,
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
