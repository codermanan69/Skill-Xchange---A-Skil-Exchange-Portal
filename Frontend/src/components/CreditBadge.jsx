// ═══════════════════════════════════════════════
// Skill Xchange — Credit Badge Component
// ═══════════════════════════════════════════════

import { Coins } from 'lucide-react';

export default function CreditBadge({ amount, size = 'md', className = '' }) {
  const sizes = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  const iconSizes = { sm: 12, md: 14, lg: 18 };

  return (
    <span
      className={`inline-flex items-center rounded-full bg-warning-50 text-warning-600 font-semibold ${sizes[size]} ${className}`}
    >
      <Coins size={iconSizes[size]} />
      {amount}
    </span>
  );
}
