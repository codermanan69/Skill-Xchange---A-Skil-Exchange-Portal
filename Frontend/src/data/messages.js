// ═══════════════════════════════════════════════
// Skill Xchange — Messages Mock Data
// ═══════════════════════════════════════════════

export const initialMessages = {
  // Conversation between Neha (user_3) and Arjun (user_4)
  'user_3_user_4': [
    { id: 'msg_1', senderId: 'user_4', text: 'Hey Neha! Thanks for accepting my request!', timestamp: '2024-09-10T14:30:00Z' },
    { id: 'msg_2', senderId: 'user_3', text: 'Hi Arjun! Happy to help. When would you like to start learning Python?', timestamp: '2024-09-10T14:32:00Z' },
    { id: 'msg_3', senderId: 'user_4', text: 'How about this weekend? I can also start teaching you SEO basics.', timestamp: '2024-09-10T14:35:00Z' },
    { id: 'msg_4', senderId: 'user_3', text: 'Sounds great! Saturday 3 PM works for me.', timestamp: '2024-09-10T14:38:00Z' },
    { id: 'msg_5', senderId: 'user_4', text: 'Perfect! I\'ll set up a session. Looking forward to it! 🚀', timestamp: '2024-09-10T14:40:00Z' },
  ],
  // Conversation between Priya (user_5) and Aman (user_2)
  'user_2_user_5': [
    { id: 'msg_6', senderId: 'user_5', text: 'Hi Aman! Thanks for connecting. I\'m excited to learn UI/UX from you!', timestamp: '2024-09-08T10:00:00Z' },
    { id: 'msg_7', senderId: 'user_2', text: 'Hey Priya! Welcome aboard. Let\'s start with the fundamentals of user research.', timestamp: '2024-09-08T10:05:00Z' },
    { id: 'msg_8', senderId: 'user_5', text: 'That sounds perfect. I already have a strong visual design foundation, so I think the research and process part will be really valuable.', timestamp: '2024-09-08T10:10:00Z' },
  ],
};

export function getConversationKey(userId1, userId2) {
  return [userId1, userId2].sort().join('_');
}
