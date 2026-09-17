// ═══════════════════════════════════════════════
// Skill Xchange — Avatar Component
// ═══════════════════════════════════════════════

export default function Avatar({ src, name, size = 'md', isOnline, className = '' }) {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  const statusSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
  };

  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name || 'User'}
          className={`${sizes[size]} rounded-full object-cover ring-2 ring-white`}
        />
      ) : (
        <div
          className={`${sizes[size]} rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold ring-2 ring-white`}
        >
          {initials}
        </div>
      )}
      {isOnline !== undefined && (
        <span
          className={`absolute bottom-0 right-0 ${statusSizes[size]} rounded-full border-2 border-white ${
            isOnline ? 'bg-success-500' : 'bg-surface-300'
          }`}
        />
      )}
    </div>
  );
}
