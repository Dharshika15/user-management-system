import React from 'react';

const variants = {
  primary: {
    background: 'var(--accent-primary)',
    color: '#0d1424',
    border: 'none',
    hover: '#d97706',
  },
  secondary: {
    background: 'var(--bg-overlay)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-default)',
    hover: 'var(--bg-hover)',
  },
  danger: {
    background: 'var(--danger-dim)',
    color: 'var(--danger)',
    border: '1px solid rgba(239,68,68,0.3)',
    hover: 'rgba(239,68,68,0.25)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-default)',
    hover: 'var(--bg-elevated)',
  },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  style = {},
  ...rest
}) {
  const v = variants[variant] || variants.primary;
  const sizes = {
    sm: { padding: '6px 14px', fontSize: '13px', height: '32px' },
    md: { padding: '10px 20px', fontSize: '14px', height: '40px' },
    lg: { padding: '13px 28px', fontSize: '15px', height: '48px' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: s.padding,
        height: s.height,
        fontSize: s.fontSize,
        fontWeight: '600',
        fontFamily: 'var(--font-display)',
        borderRadius: 'var(--radius-md)',
        background: v.background,
        color: v.color,
        border: v.border || 'none',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all var(--transition)',
        width: fullWidth ? '100%' : 'auto',
        whiteSpace: 'nowrap',
        letterSpacing: '0.01em',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.background = v.hover;
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.background = v.background;
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
      {...rest}
    >
      {isLoading ? (
        <>
          <span style={{
            width: '14px', height: '14px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }} />
          Loading…
        </>
      ) : children}
    </button>
  );
}
