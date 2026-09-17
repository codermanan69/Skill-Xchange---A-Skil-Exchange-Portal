// ═══════════════════════════════════════════════
// Skill Xchange — Demo User Switcher
// Floating widget to switch between demo users during presentation
// ═══════════════════════════════════════════════

import { useState } from 'react';
import { Users, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Avatar from './Avatar';

export default function DemoSwitcher() {
  const { currentUser, switchUser, allUsers } = useAuth();
  const { resetAllData } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentUser) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Panel */}
      {isOpen && (
        <div className="mb-2 bg-white rounded-xl shadow-2xl border border-surface-200 overflow-hidden animate-slide-in-up w-64">
          <div className="px-4 py-3 bg-gradient-to-r from-primary-600 to-accent-500">
            <p className="text-white text-xs font-semibold uppercase tracking-wider">Demo Mode</p>
            <p className="text-white/80 text-[11px]">Switch between users</p>
          </div>
          <div className="p-2">
            {allUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  switchUser(user.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 ${
                  currentUser.id === user.id
                    ? 'bg-primary-50 border border-primary-200'
                    : 'hover:bg-surface-50'
                }`}
              >
                <Avatar src={user.avatar} name={user.name} size="sm" isOnline={user.isOnline} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    currentUser.id === user.id ? 'text-primary-700' : 'text-surface-800'
                  }`}>
                    {user.name}
                  </p>
                  <p className="text-[11px] text-surface-400 truncate">{user.title}</p>
                </div>
                {currentUser.id === user.id && (
                  <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                )}
              </button>
            ))}
          </div>
          <div className="px-2 pb-2">
            <button
              onClick={() => {
                resetAllData();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-surface-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
            >
              <RotateCcw size={12} />
              Reset All Demo Data
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <Users size={16} />
        <span className="text-sm font-medium">{currentUser.name.split(' ')[0]}</span>
        {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>
    </div>
  );
}
