// ═══════════════════════════════════════════════
// Skill Xchange — Top Navbar
// ═══════════════════════════════════════════════

import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Avatar from './Avatar';

export default function Navbar({ onMenuClick, pageTitle }) {
  const { currentUser } = useAuth();
  const { getUnreadCount, refreshKey } = useApp();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const unreadCount = getUnreadCount(currentUser.id);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-surface-200">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-100 transition-colors text-surface-600"
          >
            <Menu size={20} />
          </button>
          {pageTitle && (
            <h2 className="text-lg font-semibold text-surface-900">{pageTitle}</h2>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <button
            onClick={() => navigate('/discover')}
            className="p-2 rounded-lg hover:bg-surface-100 transition-colors text-surface-500"
          >
            <Search size={20} />
          </button>

          {/* Notifications */}
          <button
            onClick={() => navigate('/notifications')}
            className="p-2 rounded-lg hover:bg-surface-100 transition-colors text-surface-500 relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full bg-danger-500 text-white text-[9px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Avatar */}
          <button
            onClick={() => navigate(`/profile/${currentUser.id}`)}
            className="ml-1"
          >
            <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" />
          </button>
        </div>
      </div>
    </header>
  );
}
