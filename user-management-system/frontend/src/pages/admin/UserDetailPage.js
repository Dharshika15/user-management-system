import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser } from '../../hooks/useUsers';
import { usersAPI } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge, StatusBadge } from '../../components/common/Badges';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{value || '—'}</div>
    </div>
  );
}

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAdmin } = useAuth();
  const { user, isLoading, refetch } = useUser(id);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = () => {
    setForm({ name: user.name, email: user.email, role: user.role, status: user.status });
    setEditing(true);
  };

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await usersAPI.update(id, form);
      toast.success('User updated successfully');
      setEditing(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid var(--bg-overlay)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading user…</span>
    </div>
  );

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
      <h2 style={{ marginBottom: '8px' }}>User Not Found</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>This user doesn't exist or you don't have access.</p>
      <Button variant="ghost" onClick={() => navigate('/users')}>← Back to Users</Button>
    </div>
  );

  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const canEdit = isAdmin || (currentUser?.role === 'manager' && user.role === 'user');

  return (
    <div className="page-content">
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', fontSize: '13px', color: 'var(--text-muted)' }}>
        <Link to="/users" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Users</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)' }}>{user.name}</span>
      </div>

      {/* Profile header */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)', padding: '32px',
        marginBottom: '20px', boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '24px', color: '#fff',
              flexShrink: 0, boxShadow: 'var(--shadow-accent)',
            }}>{initials}</div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '6px' }}>{user.name}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '10px' }}>{user.email}</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <RoleBadge role={user.role} size="md" />
                <StatusBadge status={user.status} size="md" />
              </div>
            </div>
          </div>
          {canEdit && !editing && (
            <Button variant="secondary" onClick={startEdit}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit User
            </Button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Edit form or details */}
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)', padding: '24px',
        }}>
          <h3 style={{ fontSize: '14px', fontFamily: 'var(--font-display)', fontWeight: '700', marginBottom: '20px', color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {editing ? 'Edit Details' : 'Account Details'}
          </h3>

          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <FormField label="Full Name" name="name" value={form.name} onChange={handleChange} required />
              <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
              {isAdmin && (
                <FormField label="Role" name="role" type="select" value={form.role} onChange={handleChange}
                  options={[{ value: 'admin', label: 'Admin' }, { value: 'manager', label: 'Manager' }, { value: 'user', label: 'User' }]}
                />
              )}
              <FormField label="Status" name="status" type="select" value={form.status} onChange={handleChange}
                options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]}
              />
              <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                <Button onClick={handleSave} isLoading={isSaving}>Save Changes</Button>
                <Button variant="ghost" onClick={() => setEditing(false)} disabled={isSaving}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <InfoRow label="Full Name" value={user.name} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Role" value={<RoleBadge role={user.role} />} />
              <InfoRow label="Status" value={<StatusBadge status={user.status} />} />
            </div>
          )}
        </div>

        {/* Audit info */}
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)', padding: '24px',
        }}>
          <h3 style={{ fontSize: '14px', fontFamily: 'var(--font-display)', fontWeight: '700', marginBottom: '20px', color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Audit Trail
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <InfoRow label="Created At" value={user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy 'at' HH:mm") : '—'} />
            <InfoRow label="Created By" value={user.createdBy ? `${user.createdBy.name} (${user.createdBy.email})` : 'System'} />
            <InfoRow label="Last Updated" value={user.updatedAt ? format(new Date(user.updatedAt), "MMM d, yyyy 'at' HH:mm") : '—'} />
            <InfoRow label="Updated By" value={user.updatedBy ? `${user.updatedBy.name} (${user.updatedBy.email})` : '—'} />
            <InfoRow label="Last Login" value={user.lastLogin ? format(new Date(user.lastLogin), "MMM d, yyyy 'at' HH:mm") : 'Never'} />
          </div>
        </div>
      </div>
    </div>
  );
}
