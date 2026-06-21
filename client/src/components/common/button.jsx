'use client';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:   'bg-blue-600 hover:bg-blue-700 text-white active:scale-95',
  secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 active:scale-95',
  danger:    'bg-red-600 hover:bg-red-700 text-white active:scale-95',
  ghost:     'text-gray-600 hover:bg-gray-100',
  success:   'bg-green-600 hover:bg-green-700 text-white active:scale-95',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  disabled = false,
  icon,
  onClick,
  type     = 'button',
  className = '',
  fullWidth = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-medium transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}