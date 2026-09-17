// ═══════════════════════════════════════════════
// Skill Xchange — Notifications Page
// ═══════════════════════════════════════════════

import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Send,
  CheckCircle,
  Calendar,
  Coins,
  Star,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { getUserById } from '../data/users';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';

const typeIcons = {
  request_received: Send,
  request_accepted: CheckCircle,
  session_scheduled: Calendar,
  session_reminder: Calendar,
  credit_received: Coins,
  review_received: Star,
};

const typeColors = {
  request_received: 'bg-primary-50 text-primary-500',
  request_accepted: 'bg-success-50 text-success-500',
  session_scheduled: 'bg-accent-50 text-accent-500',
  session_reminder: 'bg-warning-50 text-warning-500',
  credit_received: 'bg-warning-50 text-warning-500',
  review_received: 'bg-warning-50 text-warning-500',
};

export default function Notifications() {
  const { currentUser } = useAuth();
  const { getNotifications, markNotificationRead, markAllNotificationsRead, refreshKey } = useApp();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const notifications = getNotifications(currentUser.id);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTime = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleClick = (notif) => {
    markNotificationRead(notif.id);
    if (notif.link) navigate(notif.link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 mb-1">Notifications</h1>
          <p className="text-surface-500">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllNotificationsRead(currentUser.id)}
            className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-2"
          >
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="bg-white rounded-xl border border-surface-200 divide-y divide-surface-100">
          {notifications.map((notif) => {
            const Icon = typeIcons[notif.type] || Bell;
            const colorClass = typeColors[notif.type] || 'bg-surface-50 text-surface-400';
            const fromUser = notif.fromUserId ? getUserById(notif.fromUserId) : null;

            return (
              <div
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={`flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-surface-50 transition-colors ${
                  !notif.read ? 'bg-primary-50/30' : ''
                }`}
              >
                <div className="relative">
                  {fromUser ? (
                    <Avatar src={fromUser.avatar} name={fromUser.name} size="md" />
                  ) : (
                    <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center`}>
                      <Icon size={18} />
                    </div>
                  )}
                  {!notif.read && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary-500 border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notif.read ? 'font-semibold text-surface-900' : 'text-surface-700'}`}>
                    {notif.title}
                  </p>
                  <p className="text-sm text-surface-500 mt-0.5">{notif.message}</p>
                  <p className="text-xs text-surface-400 mt-1">{formatTime(notif.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up! New notifications will appear here."
        />
      )}
    </div>
  );
}
