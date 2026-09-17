// ═══════════════════════════════════════════════
// Skill Xchange — Modal Component
// ═══════════════════════════════════════════════

import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* Content */}
      <div
        className={`relative ${sizes[size]} w-full bg-white rounded-2xl shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
            <h3 className="text-lg font-semibold text-surface-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors text-surface-400 hover:text-surface-600"
            >
              <X size={20} />
            </button>
          </div>
        )}
        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
