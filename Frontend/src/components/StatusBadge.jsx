// ═══════════════════════════════════════════════
// Skill Xchange — Status Badge Component
// ═══════════════════════════════════════════════

export default function StatusBadge({ status, className = '' }) {
  const styles = {
    pending: 'bg-warning-50 text-warning-600',
    accepted: 'bg-success-50 text-success-600',
    rejected: 'bg-danger-50 text-danger-600',
    scheduled: 'bg-primary-50 text-primary-600',
    completed: 'bg-success-50 text-success-600',
    cancelled: 'bg-surface-100 text-surface-500',
    earned: 'bg-success-50 text-success-600',
    spent: 'bg-danger-50 text-danger-600',
    bonus: 'bg-accent-50 text-accent-600',
  };

  const labels = {
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    scheduled: 'Scheduled',
    completed: 'Completed',
    cancelled: 'Cancelled',
    earned: 'Earned',
    spent: 'Spent',
    bonus: 'Bonus',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        styles[status] || 'bg-surface-100 text-surface-500'
      } ${className}`}
    >
      {labels[status] || status}
    </span>
  );
}
