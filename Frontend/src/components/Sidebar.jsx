// ═══════════════════════════════════════════════
// Skill Xchange — Sidebar Navigation
// ═══════════════════════════════════════════════

import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  MessageSquare,
  Send,
  Calendar,
  Wallet,
  Bell,
  Settings,
  LogOut,
  ArrowRightLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Avatar from './Avatar';
import CreditBadge from './CreditBadge';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/discover', icon: Compass, label: 'Discover' },
  { to: '/requests', icon: Send, label: 'Requests' },
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/sessions', icon: Calendar, label: 'Sessions' },
  { to: '/credits', icon: Wallet, label: 'Credits' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { currentUser, logout } = useAuth();
  const { getBalance, getUnreadCount, refreshKey } = useApp();

  if (!currentUser) return null;

  const balance = getBalance(currentUser.id);
  const unreadCount = getUnreadCount(currentUser.id);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-surface-200 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="px-5 py-5 border-b border-surface-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <ArrowRightLeft size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-surface-900 leading-tight">Skill Xchange</h1>
              <p className="text-[10px] text-surface-400 font-medium tracking-wide uppercase">Teach. Earn. Learn.</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-surface-100">
          <NavLink to={`/profile/${currentUser.id}`} onClick={onClose} className="flex items-center gap-3 group">
            <Avatar src={currentUser.avatar} name={currentUser.name} size="md" isOnline={true} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-surface-800 truncate group-hover:text-primary-600 transition-colors">
                {currentUser.name}
              </p>
              <p className="text-xs text-surface-400 truncate">{currentUser.title}</p>
            </div>
          </NavLink>
          <div className="mt-3">
            <CreditBadge amount={balance} size="sm" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto">
          <div className="space-y-0.5">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 shadow-sm'
                      : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                  }`
                }
              >
                <Icon size={18} />
                <span className="flex-1">{label}</span>
                {label === 'Notifications' && unreadCount > 0 && (
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-danger-500 text-white text-[10px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Logout */}
        <div className="px-3 py-3 border-t border-surface-100">
          <button
            onClick={() => { logout(); onClose?.(); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-500 hover:bg-danger-50 hover:text-danger-600 transition-colors w-full"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
