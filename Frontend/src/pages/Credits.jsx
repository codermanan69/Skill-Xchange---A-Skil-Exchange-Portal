// ═══════════════════════════════════════════════
// Skill Xchange — Credits / Wallet Page
// ═══════════════════════════════════════════════

import { Coins, TrendingUp, TrendingDown, Gift, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { getUserById } from '../data/users';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';

export default function Credits() {
  const { currentUser } = useAuth();
  const { getBalance, getTransactionHistory, refreshKey } = useApp();

  if (!currentUser) return null;

  const balance = getBalance(currentUser.id);
  const transactions = getTransactionHistory(currentUser.id);

  const totalEarned = transactions.filter((t) => t.type === 'earned' || t.type === 'bonus').reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = transactions.filter((t) => t.type === 'spent').reduce((sum, t) => sum + t.amount, 0);

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earned': return <ArrowUpRight size={16} className="text-success-500" />;
      case 'spent': return <ArrowDownRight size={16} className="text-danger-500" />;
      case 'bonus': return <Gift size={16} className="text-accent-500" />;
      default: return <Coins size={16} className="text-surface-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 mb-1">Skill Credits</h1>
        <p className="text-surface-500">Your wallet and transaction history</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <p className="text-sm text-white/70 font-medium mb-1">Available Balance</p>
          <div className="flex items-center gap-3 mb-6">
            <Coins size={32} className="text-warning-300" />
            <span className="text-4xl sm:text-5xl font-bold">{balance}</span>
            <span className="text-lg text-white/70">credits</span>
          </div>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">Total Earned</p>
              <p className="text-xl font-semibold flex items-center gap-1">
                <TrendingUp size={16} className="text-green-300" />
                +{totalEarned}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">Total Spent</p>
              <p className="text-xl font-semibold flex items-center gap-1">
                <TrendingDown size={16} className="text-red-300" />
                -{totalSpent}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How Credits Work */}
      <div className="bg-white rounded-xl border border-surface-200 p-5">
        <h3 className="text-base font-semibold text-surface-900 mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-warning-500" />
          How Credits Work
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Gift, label: 'Welcome Bonus', desc: 'Get 100 credits when you join', color: 'text-accent-500' },
            { icon: TrendingUp, label: 'Teach & Earn', desc: 'Earn credits for every session you teach', color: 'text-success-500' },
            { icon: TrendingDown, label: 'Learn & Spend', desc: 'Spend credits to learn from others', color: 'text-primary-500' },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3 p-3 bg-surface-50 rounded-lg">
              <item.icon size={18} className={item.color} />
              <div>
                <p className="text-sm font-medium text-surface-800">{item.label}</p>
                <p className="text-xs text-surface-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl border border-surface-200">
        <div className="px-5 py-4 border-b border-surface-100">
          <h3 className="text-base font-semibold text-surface-900">Transaction History</h3>
        </div>
        {transactions.length > 0 ? (
          <div className="divide-y divide-surface-100">
            {transactions.map((txn) => {
              const otherUser = txn.fromUserId ? getUserById(txn.fromUserId) : null;
              return (
                <div key={txn.id} className="px-5 py-4 flex items-center gap-4 hover:bg-surface-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-surface-50 flex items-center justify-center">
                    {getTransactionIcon(txn.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-800 truncate">{txn.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {otherUser && (
                        <span className="text-xs text-surface-400 flex items-center gap-1">
                          <Avatar src={otherUser.avatar} name={otherUser.name} size="xs" />
                          {otherUser.name}
                        </span>
                      )}
                      <span className="text-xs text-surface-400">
                        {new Date(txn.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${
                      txn.type === 'spent' ? 'text-danger-500' : 'text-success-500'
                    }`}>
                      {txn.type === 'spent' ? '-' : '+'}{txn.amount}
                    </p>
                    <StatusBadge status={txn.type} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Coins}
            title="No transactions yet"
            description="Start teaching to earn your first credits!"
          />
        )}
      </div>
    </div>
  );
}
