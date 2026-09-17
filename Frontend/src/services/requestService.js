// ═══════════════════════════════════════════════
// Skill Xchange — Request Service
// Currently uses localStorage. Replace with API calls later.
// ═══════════════════════════════════════════════

import { initialRequests } from '../data/requests';

const REQUESTS_KEY = 'skillxchange_requests';

function getRequests() {
  const data = localStorage.getItem(REQUESTS_KEY);
  return data ? JSON.parse(data) : [...initialRequests];
}

function saveRequests(requests) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
}

export const requestService = {
  getAllRequests() {
    return getRequests();
  },

  getIncomingRequests(userId) {
    return getRequests().filter((r) => r.toUserId === userId);
  },

  getOutgoingRequests(userId) {
    return getRequests().filter((r) => r.fromUserId === userId);
  },

  sendRequest({ fromUserId, toUserId, skillOffered, skillWanted, message }) {
    const requests = getRequests();
    // Check if request already exists
    const exists = requests.find(
      (r) =>
        r.fromUserId === fromUserId &&
        r.toUserId === toUserId &&
        r.status === 'pending'
    );
    if (exists) return { error: 'Request already sent' };

    const newRequest = {
      id: 'req_' + Date.now(),
      fromUserId,
      toUserId,
      skillOffered,
      skillWanted,
      message,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    requests.push(newRequest);
    saveRequests(requests);
    return newRequest;
  },

  acceptRequest(requestId) {
    const requests = getRequests();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index !== -1) {
      requests[index].status = 'accepted';
      saveRequests(requests);
      return requests[index];
    }
    return null;
  },

  rejectRequest(requestId) {
    const requests = getRequests();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index !== -1) {
      requests[index].status = 'rejected';
      saveRequests(requests);
      return requests[index];
    }
    return null;
  },

  /**
   * Get accepted connections for a user (for chat access)
   */
  getConnections(userId) {
    return getRequests()
      .filter(
        (r) =>
          r.status === 'accepted' &&
          (r.fromUserId === userId || r.toUserId === userId)
      )
      .map((r) => ({
        request: r,
        otherUserId: r.fromUserId === userId ? r.toUserId : r.fromUserId,
      }));
  },

  resetRequests() {
    localStorage.removeItem(REQUESTS_KEY);
  },
};
