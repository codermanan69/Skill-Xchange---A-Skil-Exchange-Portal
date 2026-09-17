// ═══════════════════════════════════════════════
// Skill Xchange — Chat Service
// Currently uses localStorage. Replace with WebSocket/API later.
// ═══════════════════════════════════════════════

import { initialMessages, getConversationKey } from '../data/messages';

const MESSAGES_KEY = 'skillxchange_messages';

function getMessages() {
  const data = localStorage.getItem(MESSAGES_KEY);
  return data ? JSON.parse(data) : { ...initialMessages };
}

function saveMessages(messages) {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

export const chatService = {
  getConversation(userId1, userId2) {
    const key = getConversationKey(userId1, userId2);
    const messages = getMessages();
    return messages[key] || [];
  },

  sendMessage(fromUserId, toUserId, text) {
    const key = getConversationKey(fromUserId, toUserId);
    const messages = getMessages();
    if (!messages[key]) {
      messages[key] = [];
    }
    const newMessage = {
      id: 'msg_' + Date.now(),
      senderId: fromUserId,
      text,
      timestamp: new Date().toISOString(),
    };
    messages[key].push(newMessage);
    saveMessages(messages);
    return newMessage;
  },

  getConversationKey,

  resetMessages() {
    localStorage.removeItem(MESSAGES_KEY);
  },
};
