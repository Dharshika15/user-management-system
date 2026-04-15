import React from 'react';

const roleConfig = {
  admin: { label: 'Admin', color: 'var(--role-admin)', bg: 'var(--role-admin-dim)' },
  manager: { label: 'Manager', color: 'var(--role-manager)', bg: 'var(--role-manager-dim)' },
  user: { label: 'User', color: 'var(--role-user)', bg: 'var(--role-user-dim)' },
};

const statusConfig = {
  active: { label: 'Active', color: 'var(--status-active)', bg: 'var(--status-active-dim)' },
  inactive: { label: 'Inactive', color: 'var(--status-inactive)', bg: 'var(--status-inactive-dim)' },
};

export function RoleBadge({ role, size = 'sm' }) {
  const config = roleConfig[role] || { label: role, color: 'var(--text-muted)', bg: 'transparent' };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: size === 'sm' ? '2px 8px' : '4px 12px',
      borderRadius: '999px',
      fontSize: size === 'sm' ? '11px' : '13px',
      fontWeight: '600',
      fontFamily: 'var(--font-display)',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: config.color,
      background: config.bg,
      border: `1px solid ${config.color}30`,
    }}>
      {config.label}
    </span>
  );
}

export function StatusBadge({ status, size = 'sm' }) {
  const config = statusConfig[status] || { label: status, color: 'var(--text-muted)', bg: 'transparent' };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: size === 'sm' ? '2px 8px' : '4px 12px',
      borderRadius: '999px',
      fontSize: size === 'sm' ? '11px' : '13px',
      fontWeight: '500',
      color: config.color,
      background: config.bg,
      border: `1px solid ${config.color}30`,
    }}>
      <span style={{
        width: '5px', height: '5px', borderRadius: '50%',
        background: config.color, flexShrink: 0,
      }} />
      {config.label}
    </span>
  );
}
