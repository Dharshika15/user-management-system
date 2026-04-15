import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUsers } from '../../hooks/useUsers';
import { usersAPI } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge, StatusBadge } from '../../components/common/Badges';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function ConfirmModal({ user, onConfirm, onCancel, isLoading }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '24px', backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)', padding: '32px', maxWidth: '400px', width: '100%',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
          background: 'var(--danger-dim)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', marginBottom: '20px',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '8px' }}>Delete User</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong>?
          This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>Delete User</Button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { users, pagination, isLoading, params, updateParams, refetch } = useUsers();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    if (e.target.value === '' || e.target.value.length > 2) {
      updateParams({ search: e.target.value, page: 1 });
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await usersAPI.delete(deleteTarget._id);
      toast.success(`${deleteTarget.name} has been deleted`);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const FilterBtn = ({ label, filterKey, value }) => {
    const active = params[filterKey] === value;
    return (
      <button onClick={() => updateParams({ [filterKey]: active ? undefined : value, page: 1 })} style={{
        padding: '5px 12px', borderRadius: '999px', fontSize: '12px',
        fontFamily: 'var(--font-display)', fontWeight: '600', cursor: 'pointer',
        transition: 'all var(--transition)',
        background: active ? 'var(--accent-primary)' : 'var(--bg-elevated)',
        color: active ? '#0d1424' : 'var(--text-secondary)',
        border: active ? 'none' : '1px solid var(--border-default)',
      }}>{label}</button>
    );
  };

  return (
    <div className="page-content">
      {deleteTarget && (
        <ConfirmModal
          user={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isLoading={isDeleting}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.03em' }}>User Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            {pagination ? `${pagination.total} total users` : 'Loading…'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => navigate('/users/new')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New User
          </Button>
        )}
      </div>

      {/* Filters bar */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)', padding: '16px 20px',
        display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap',
        marginBottom: '20px',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
          <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={handleSearch}
            placeholder="Search by name or email…"
            style={{
              width: '100%', padding: '9px 12px 9px 36px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
              fontSize: '13px', fontFamily: 'var(--font-body)', outline: 'none',
            }}
          />
        </div>
        {/* Role filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Role:</span>
          <FilterBtn label="Admin" filterKey="role" value="admin" />
          <FilterBtn label="Manager" filterKey="role" value="manager" />
          <FilterBtn label="User" filterKey="role" value="user" />
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status:</span>
          <FilterBtn label="Active" filterKey="status" value="active" />
          <FilterBtn label="Inactive" filterKey="status" value="inactive" />
        </div>
        {(params.role || params.status || params.search) && (
          <button onClick={() => { setSearch(''); updateParams({ role: undefined, status: undefined, search: '', page: 1 }); }} style={{
            fontSize: '12px', color: 'var(--danger)', background: 'transparent',
            border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: '600',
          }}>Clear all</button>
        )}
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 2fr 100px 90px 120px 100px',
          padding: '12px 20px',
          borderBottom: '1px solid var(--border-default)',
          background: 'var(--bg-elevated)',
        }}>
          {['Name', 'Email', 'Role', 'Status', 'Created', 'Actions'].map(h => (
            <div key={h} style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</div>
          ))}
        </div>

        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid var(--bg-overlay)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            Loading users…
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No users found matching your criteria.</p>
          </div>
        ) : (
          users.map((u, i) => (
            <div key={u._id} style={{
              display: 'grid', gridTemplateColumns: '2fr 2fr 100px 90px 120px 100px',
              padding: '14px 20px', alignItems: 'center',
              borderBottom: i < users.length - 1 ? '1px solid var(--border-default)' : 'none',
              transition: 'background var(--transition)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '12px', color: '#fff',
                }}>
                  {u.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <span style={{ fontSize: '14px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
              <div><RoleBadge role={u.role} /></div>
              <div><StatusBadge status={u.status} /></div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '—'}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <Link to={`/users/${u._id}`} style={{
                  padding: '5px 10px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent-secondary-dim)', color: 'var(--accent-secondary)',
                  fontSize: '12px', fontFamily: 'var(--font-display)', fontWeight: '600',
                  border: '1px solid rgba(59,130,246,0.2)', textDecoration: 'none',
                  transition: 'all var(--transition)',
                }}>View</Link>
                {isAdmin && (
                  <button onClick={() => setDeleteTarget(u)} style={{
                    padding: '5px 10px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--danger-dim)', color: 'var(--danger)',
                    fontSize: '12px', fontFamily: 'var(--font-display)', fontWeight: '600',
                    border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer',
                    transition: 'all var(--transition)',
                  }}>Del</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => updateParams({ page: params.page - 1 })}
            style={{
              padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)',
              background: 'var(--bg-surface)', color: pagination.hasPrevPage ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: pagination.hasPrevPage ? 'pointer' : 'not-allowed', fontSize: '13px',
              fontFamily: 'var(--font-display)', fontWeight: '600',
            }}>← Prev</button>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '0 8px' }}>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            disabled={!pagination.hasNextPage}
            onClick={() => updateParams({ page: params.page + 1 })}
            style={{
              padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)',
              background: 'var(--bg-surface)', color: pagination.hasNextPage ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed', fontSize: '13px',
              fontFamily: 'var(--font-display)', fontWeight: '600',
            }}>Next →</button>
        </div>
      )}
    </div>
  );
}
