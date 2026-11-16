// ═══════════════════════════════════════════════
// Skill Xchange — Credit / Wallet Service
// Integrates with backend APIs at /api/credits
// ═══════════════════════════════════════════════

import { api } from './api';
import { initialTransactions } from '../data/transactions';

export const creditService = {
  /**
   * Get wallet summary: available balance, total earned, total spent, recent transactions
   */
  async getWalletSummary() {
    try {
      const data = await api.get('/credits');
      return {
        balance: data?.balance ?? 0,
        totalEarned: data?.totalEarned ?? 0,
        totalSpent: data?.totalSpent ?? 0,
        welcomeBonus: data?.welcomeBonus ?? 0,
        recentTransactions: data?.recentTransactions || [],
      };
    } catch (err) {
      console.warn('Failed to fetch wallet summary from API:', err.message);
      return {
        balance: 100,
        totalEarned: 100,
        totalSpent: 0,
        welcomeBonus: 100,
        recentTransactions: initialTransactions.slice(0, 5),
      };
    }
  },

  /**
   * Get current available credit balance
   */
  async getBalance() {
    const summary = await this.getWalletSummary();
    return summary.balance;
  },

  /**
   * Get full chronological transaction history
   */
  async getTransactionHistory() {
    try {
      const data = await api.get('/credits/transactions');
      return data?.transactions || [];
    } catch (err) {
      console.warn('Failed to fetch transaction history from API:', err.message);
      return initialTransactions;
    }
  },

  /**
   * Synchronous / fallback helpers for legacy components
   */
  resetCredits() {
    localStorage.removeItem('skillxchange_transactions');
    localStorage.removeItem('skillxchange_credits');
  },
};

export default creditService;
