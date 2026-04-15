import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUserStats } from '../../hooks/useUsers';
import { RoleBadge, StatusBadge } from '../../components/common/Badges';
import { format } from 'date-fns';

function StatCard({ label, value, icon, color, sub }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxShadow: 'var(--shadow-card)',
      transition: 'border-color var(--transition)',
      position: 'relative',
      overflow: 'hidden',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = color + '60'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
    >
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '80px', height: '80px',
        background: color + '08',
        borderRadius: '0 0 0 80px',
      }} />
      <div style={{
        width: '40px', height: '40px',
        borderRadius: 'var(--radius-md)',
        background: color + '20',
        border: `1px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: '800', lineHeight: 1 }}>
          {value ?? '—'}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</div>
        {sub && <div style={{ fontSize: '11px', color, marginTop: '4px', fontWeight: '600' }}>{sub}</div>}
      </div>
    </div>
  );
}

function QuickAction({ to, icon, label, desc, color }) {
  return (
    <Link to={to} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '18px 20px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      textDecoration: 'none',
      transition: 'all var(--transition)',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = color + '60'; e.currentTarget.style.background = color + '08'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
      <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{desc}</div>
      </div>
      <svg style={{ marginLeft: 'auto', color: 'var(--text-muted)', flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </Link>
  );
}

export default function DashboardPage() {
  const { user, isAdmin, isAdminOrManager } = useAuth();
  const { stats, isLoading } = useUserStats();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '30px', fontWeight: '800', letterSpacing: '-0.03em' }}>
              {greeting()},{' '}
              <span style={{ color: 'var(--accent-primary)' }}>{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '14px' }}>
              {format(new Date(), "EEEE, MMMM d, yyyy")} · Here's what's happening today.
            </p>
          </div>
          <RoleBadge role={user?.role} size="md" />
        </div>
      </div>

      {/* Stats — Admin/Manager only */}
      {isAdminOrManager && (
        <>
          <h2 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Overview
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '36px' }}>
            <StatCard
              label="Total Users" value={isLoading ? '…' : stats?.total}
              color="var(--accent-primary)"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
            />
            <StatCard
              label="Active Users" value={isLoading ? '…' : stats?.byStatus?.active ?? 0}
              color="var(--status-active)"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
            />
            <StatCard
              label="Admins" value={isLoading ? '…' : stats?.byRole?.admin ?? 0}
              color="var(--role-admin)"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
            />
            <StatCard
              label="Managers" value={isLoading ? '…' : stats?.byRole?.manager ?? 0}
              color="var(--role-manager)"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>}
            />
          </div>
        </>
      )}

      {/* Quick Actions */}
      <h2 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
        Quick Actions
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '36px' }}>
        {isAdminOrManager && (
          <QuickAction
            to="/users" label="Manage Users" desc="View, search and filter all users"
            color="var(--accent-secondary)"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          />
        )}
        {isAdmin && (
          <QuickAction
            to="/users/new" label="Create New User" desc="Add a new user to the system"
            color="var(--accent-primary)"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>}
          />
        )}
        <QuickAction
          to="/profile" label="My Profile" desc="View and update your account details"
          color="var(--role-manager)"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
        />
      </div>

      {/* Account info */}
      <h2 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
        Your Account
      </h2>
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)', padding: '24px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px',
      }}>
        {[
          { label: 'Name', value: user?.name },
          { label: 'Email', value: user?.email },
          { label: 'Role', value: <RoleBadge role={user?.role} /> },
          { label: 'Status', value: <StatusBadge status={user?.status} /> },
          { label: 'Member since', value: user?.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '—' },
          { label: 'Last login', value: user?.lastLogin ? format(new Date(user.lastLogin), 'MMM d, yyyy HH:mm') : '—' },
        ].map(({ label, value }) => (
          <div key={label}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500' }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
