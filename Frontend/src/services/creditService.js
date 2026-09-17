// ═══════════════════════════════════════════════
// Skill Xchange — Credit Service
// Currently uses localStorage. Replace with API calls later.
// ═══════════════════════════════════════════════

import { initialTransactions } from '../data/transactions';
import { users } from '../data/users';

const TRANSACTIONS_KEY = 'skillxchange_transactions';
const CREDITS_KEY = 'skillxchange_credits';

function getTransactions() {
  const data = localStorage.getItem(TRANSACTIONS_KEY);
  return data ? JSON.parse(data) : [...initialTransactions];
}

function saveTransactions(txns) {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txns));
}

function getCreditsMap() {
  const data = localStorage.getItem(CREDITS_KEY);
  if (data) return JSON.parse(data);
  // Initialize from users data
  const map = {};
  users.forEach((u) => { map[u.id] = u.credits; });
  return map;
}

function saveCredits(map) {
  localStorage.setItem(CREDITS_KEY, JSON.stringify(map));
}

export const creditService = {
  getBalance(userId) {
    const map = getCreditsMap();
    return map[userId] || 0;
  },

  getTransactionHistory(userId) {
    return getTransactions()
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  transferCredits({ fromUserId, toUserId, amount, description, sessionId }) {
    const map = getCreditsMap();
    const currentBalance = map[fromUserId] || 0;

    if (currentBalance < amount) {
      return { error: 'Insufficient credits' };
    }

    // Update balances
    map[fromUserId] = currentBalance - amount;
    map[toUserId] = (map[toUserId] || 0) + amount;
    saveCredits(map);

    // Create transaction records
    const txns = getTransactions();
    const spentTxn = {
      id: 'txn_' + Date.now(),
      userId: fromUserId,
      type: 'spent',
      amount,
      description,
      fromUserId: toUserId,
      sessionId,
      createdAt: new Date().toISOString(),
    };
    const earnedTxn = {
      id: 'txn_' + (Date.now() + 1),
      userId: toUserId,
      type: 'earned',
      amount,
      description: description.replace('Learned', 'Taught'),
      fromUserId,
      sessionId,
      createdAt: new Date().toISOString(),
    };
    txns.push(spentTxn, earnedTxn);
    saveTransactions(txns);

    return { success: true, newBalance: map[fromUserId] };
  },

  getAllBalances() {
    return getCreditsMap();
  },

  resetCredits() {
    localStorage.removeItem(TRANSACTIONS_KEY);
    localStorage.removeItem(CREDITS_KEY);
  },
};
