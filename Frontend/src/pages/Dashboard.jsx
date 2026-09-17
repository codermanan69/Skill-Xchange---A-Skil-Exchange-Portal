// ═══════════════════════════════════════════════
// Skill Xchange — Dashboard Page
// ═══════════════════════════════════════════════

import { useNavigate } from 'react-router-dom';
import {
  Coins,
  TrendingUp,
  Calendar,
  ArrowRightLeft,
  Star,
  Users,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { userService } from '../services/userService';
import Avatar from '../components/Avatar';
import SkillTag from '../components/SkillTag';
import CreditBadge from '../components/CreditBadge';
import StatusBadge from '../components/StatusBadge';
import { getUserById } from '../data/users';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const {
    getBalance,
    getIncomingRequests,
    getUpcomingSessions,
    getCompletedSessions,
    getTransactionHistory,
    refreshKey,
  } = useApp();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const balance = getBalance(currentUser.id);
  const incoming = getIncomingRequests(currentUser.id).filter((r) => r.status === 'pending');
  const upcoming = getUpcomingSessions(currentUser.id);
  const completed = getCompletedSessions(currentUser.id);
  const matches = userService.getSkillMatches(currentUser.id);
  const recentTxns = getTransactionHistory(currentUser.id).slice(0, 3);

  const stats = [
    { label: 'Skill Credits', value: balance, icon: Coins, color: 'from-warning-400 to-warning-500', textColor: 'text-warning-600' },
    { label: 'Sessions Done', value: completed.length, icon: BookOpen, color: 'from-success-400 to-success-500', textColor: 'text-success-600' },
    { label: 'Pending Requests', value: incoming.length, icon: TrendingUp, color: 'from-primary-400 to-primary-500', textColor: 'text-primary-600' },
    { label: 'Upcoming', value: upcoming.length, icon: Calendar, color: 'from-accent-400 to-accent-500', textColor: 'text-accent-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-20 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="text-warning-300" />
            <span className="text-sm text-white/80 font-medium">Welcome back</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {currentUser.name.split(' ')[0]}, ready to exchange skills?
          </h1>
          <p className="text-white/70 text-sm sm:text-base max-w-md">
            You have <strong className="text-white">{incoming.length} pending request{incoming.length !== 1 ? 's' : ''}</strong> and{' '}
            <strong className="text-white">{upcoming.length} upcoming session{upcoming.length !== 1 ? 's' : ''}</strong>.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <button onClick={() => navigate('/discover')}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm flex items-center gap-2">
              <Users size={16} /> Discover People
            </button>
            {incoming.length > 0 && (
              <button onClick={() => navigate('/requests')}
                className="px-4 py-2 bg-white text-primary-700 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors flex items-center gap-2">
                View Requests <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-surface-200 p-4 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon size={18} className="text-white" />
              </div>
            </div>
            <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
            <p className="text-xs text-surface-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Matches */}
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-surface-900 flex items-center gap-2">
              <ArrowRightLeft size={16} className="text-primary-500" />
              Skill Matches
            </h3>
            <button onClick={() => navigate('/discover')} className="text-xs text-primary-600 font-medium hover:underline">
              View all
            </button>
          </div>
          {matches.length > 0 ? (
            <div className="space-y-3">
              {matches.slice(0, 3).map(({ user, matchingSkills, reverseMatch }) => (
                <div
                  key={user.id}
                  onClick={() => navigate(`/profile/${user.id}`)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-50 transition-colors cursor-pointer group"
                >
                  <Avatar src={user.avatar} name={user.name} size="md" isOnline={user.isOnline} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-800 group-hover:text-primary-600 transition-colors truncate">{user.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {matchingSkills.slice(0, 2).map((s) => (
                        <SkillTag key={s} name={s} size="xs" />
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-primary-500 font-medium shrink-0">
                    {matchingSkills.length + reverseMatch.length} match{matchingSkills.length + reverseMatch.length !== 1 ? 'es' : ''}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-surface-400 text-center py-8">No matches found. Try adding more skills!</p>
          )}
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-surface-900 flex items-center gap-2">
              <Calendar size={16} className="text-accent-500" />
              Upcoming Sessions
            </h3>
            <button onClick={() => navigate('/sessions')} className="text-xs text-primary-600 font-medium hover:underline">
              View all
            </button>
          </div>
          {upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.slice(0, 3).map((session) => {
                const other = getUserById(
                  session.teacherId === currentUser.id ? session.learnerId : session.teacherId
                );
                return (
                  <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-50 transition-colors cursor-pointer"
                    onClick={() => navigate('/sessions')}>
                    <Avatar src={other?.avatar} name={other?.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-800 truncate">{session.topic || session.skill}</p>
                      <p className="text-xs text-surface-400">
                        with {other?.name} • {session.date} at {session.time}
                      </p>
                    </div>
                    <StatusBadge status={session.status} />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-surface-400 text-center py-8">No upcoming sessions.</p>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-surface-900 flex items-center gap-2">
              <Coins size={16} className="text-warning-500" />
              Recent Transactions
            </h3>
            <button onClick={() => navigate('/credits')} className="text-xs text-primary-600 font-medium hover:underline">
              View all
            </button>
          </div>
          {recentTxns.length > 0 ? (
            <div className="space-y-3">
              {recentTxns.map((txn) => (
                <div key={txn.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    txn.type === 'earned' ? 'bg-success-50' : txn.type === 'bonus' ? 'bg-accent-50' : 'bg-danger-50'
                  }`}>
                    <Coins size={14} className={
                      txn.type === 'earned' ? 'text-success-500' : txn.type === 'bonus' ? 'text-accent-500' : 'text-danger-500'
                    } />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-surface-700 truncate">{txn.description}</p>
                    <p className="text-xs text-surface-400">{new Date(txn.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-sm font-semibold ${
                    txn.type === 'spent' ? 'text-danger-500' : 'text-success-500'
                  }`}>
                    {txn.type === 'spent' ? '-' : '+'}{txn.amount}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-surface-400 text-center py-8">No transactions yet.</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <h3 className="text-base font-semibold text-surface-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Discover', icon: Users, path: '/discover', color: 'from-primary-500 to-primary-600' },
              { label: 'My Profile', icon: Star, path: `/profile/${currentUser.id}`, color: 'from-warning-500 to-warning-600' },
              { label: 'Chat', icon: BookOpen, path: '/chat', color: 'from-success-500 to-success-600' },
              { label: 'Credits', icon: Coins, path: '/credits', color: 'from-accent-500 to-accent-600' },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex items-center gap-3 p-3 rounded-xl border border-surface-200 hover:shadow-md hover:border-primary-200 transition-all duration-200 group"
              >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <action.icon size={16} className="text-white" />
                </div>
                <span className="text-sm font-medium text-surface-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
