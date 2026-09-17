// ═══════════════════════════════════════════════
// Skill Xchange — Empty State Component
// ═══════════════════════════════════════════════

import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description = '',
  action,
  actionLabel,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
        <Icon size={28} className="text-surface-400" />
      </div>
      <h3 className="text-lg font-semibold text-surface-700 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-surface-500 max-w-sm mb-4">{description}</p>
      )}
      {action && actionLabel && (
        <button
          onClick={action}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
