// ═══════════════════════════════════════════════
// Skill Xchange — Star Rating Component
// ═══════════════════════════════════════════════

import { Star } from 'lucide-react';
import { useState } from 'react';

export default function StarRating({
  rating = 0,
  maxRating = 5,
  size = 18,
  interactive = false,
  onChange,
  showValue = false,
  className = '',
}) {
  const [hovered, setHovered] = useState(0);

  const displayRating = hovered || rating;

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className="flex gap-0.5">
        {Array.from({ length: maxRating }, (_, i) => (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform duration-150`}
            onClick={() => interactive && onChange?.(i + 1)}
            onMouseEnter={() => interactive && setHovered(i + 1)}
            onMouseLeave={() => interactive && setHovered(0)}
          >
            <Star
              size={size}
              className={
                i < displayRating
                  ? 'fill-warning-500 text-warning-500'
                  : 'fill-none text-surface-300'
              }
            />
          </button>
        ))}
      </div>
      {showValue && (
        <span className="ml-1 text-sm font-medium text-surface-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
