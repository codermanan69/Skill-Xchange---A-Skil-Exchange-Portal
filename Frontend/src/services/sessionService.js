// ═══════════════════════════════════════════════
// Skill Xchange — Session Service
// Currently uses localStorage. Replace with API calls later.
// ═══════════════════════════════════════════════

import { initialSessions } from '../data/sessions';

const SESSIONS_KEY = 'skillxchange_sessions';

function getSessions() {
  const data = localStorage.getItem(SESSIONS_KEY);
  return data ? JSON.parse(data) : [...initialSessions];
}

function saveSessions(sessions) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export const sessionService = {
  getAllSessions() {
    return getSessions();
  },

  getUserSessions(userId) {
    return getSessions().filter(
      (s) => s.teacherId === userId || s.learnerId === userId
    );
  },

  getUpcomingSessions(userId) {
    return this.getUserSessions(userId).filter((s) => s.status === 'scheduled');
  },

  getCompletedSessions(userId) {
    return this.getUserSessions(userId).filter((s) => s.status === 'completed');
  },

  createSession({ requestId, teacherId, learnerId, skill, topic, date, time, duration }) {
    const sessions = getSessions();
    const newSession = {
      id: 'ses_' + Date.now(),
      requestId,
      teacherId,
      learnerId,
      skill,
      topic,
      date,
      time,
      duration: duration || 60,
      status: 'scheduled',
      meetingLink: `https://meet.google.com/${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`,
      notes: '',
      rating: null,
      review: null,
      completedAt: null,
      creditsTransferred: 0,
    };
    sessions.push(newSession);
    saveSessions(sessions);
    return newSession;
  },

  completeSession(sessionId) {
    const sessions = getSessions();
    const index = sessions.findIndex((s) => s.id === sessionId);
    if (index !== -1) {
      sessions[index].status = 'completed';
      sessions[index].completedAt = new Date().toISOString();
      saveSessions(sessions);
      return sessions[index];
    }
    return null;
  },

  rateSession(sessionId, rating, review) {
    const sessions = getSessions();
    const index = sessions.findIndex((s) => s.id === sessionId);
    if (index !== -1) {
      sessions[index].rating = rating;
      sessions[index].review = review;
      saveSessions(sessions);
      return sessions[index];
    }
    return null;
  },

  transferCredits(sessionId, amount) {
    const sessions = getSessions();
    const index = sessions.findIndex((s) => s.id === sessionId);
    if (index !== -1) {
      sessions[index].creditsTransferred = amount;
      saveSessions(sessions);
      return sessions[index];
    }
    return null;
  },

  resetSessions() {
    localStorage.removeItem(SESSIONS_KEY);
  },
};
