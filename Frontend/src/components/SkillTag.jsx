// ═══════════════════════════════════════════════
// Skill Xchange — Skill Tag Component
// ═══════════════════════════════════════════════

import { getSkillColor } from '../data/skills';

export default function SkillTag({ name, size = 'sm', removable, onRemove, className = '' }) {
  const { color, bgColor } = getSkillColor(name);

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium transition-all duration-200 hover:shadow-sm ${sizes[size]} ${className}`}
      style={{ backgroundColor: bgColor, color: color }}
    >
      {name}
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.(name);
          }}
          className="ml-0.5 hover:opacity-70 transition-opacity"
          style={{ color }}
        >
          ×
        </button>
      )}
    </span>
  );
}
