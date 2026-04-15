import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../api/users';
import { RoleBadge, StatusBadge } from '../../components/common/Badges';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function Section({ title, children }) {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)', padding: '28px', boxShadow: 'var(--shadow-card)',
    }}>
      <h3 style={{ fontSize: '13px', fontFamily: 'var(--font-display)', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-default)' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function MyProfilePage() {
  const { user, updateUser } = useAuth();
  const [nameForm, setNameForm] = useState({ name: user?.name || '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', password: '', confirmPassword: '' });
  const [nameErrors, setNameErrors] = useState({});
  const [pwdErrors, setPwdErrors] = useState({});
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingPwd, setIsSavingPwd] = useState(false);

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (!nameForm.name || nameForm.name.trim().length < 2) {
      setNameErrors({ name: 'Name must be at least 2 characters' });
      return;
    }
    setIsSavingName(true);
    try {
      const res = await usersAPI.updateMe({ name: nameForm.name });
      updateUser({ name: res.data.data.user.name });
      toast.success('Name updated successfully!');
      setNameErrors({});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setIsSavingName(false);
    }
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwdForm.currentPassword) errs.currentPassword = 'Current password is required';
    if (!pwdForm.password || pwdForm.password.length < 8) errs.password = 'Min 8 characters required';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwdForm.password)) errs.password = 'Must include upper, lower and number';
    if (pwdForm.password !== pwdForm.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length) { setPwdErrors(errs); return; }

    setIsSavingPwd(true);
    try {
      await usersAPI.updateMe({ currentPassword: pwdForm.currentPassword, password: pwdForm.password });
      toast.success('Password changed successfully!');
      setPwdForm({ currentPassword: '', password: '', confirmPassword: '' });
      setPwdErrors({});
    } catch (err) {
      const msg = err.response?.data?.message || 'Password update failed';
      toast.error(msg);
      if (msg.toLowerCase().includes('current')) setPwdErrors({ currentPassword: msg });
    } finally {
      setIsSavingPwd(false);
    }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="page-content">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.03em' }}>My Profile</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Manage your account information and password.</p>
      </div>

      {/* Avatar header */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)', padding: '28px', marginBottom: '20px',
        display: 'flex', alignItems: 'center', gap: '24px',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '28px', color: '#fff',
          boxShadow: 'var(--shadow-accent)',
        }}>{initials}</div>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '6px' }}>{user?.name}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '10px' }}>{user?.email}</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <RoleBadge role={user?.role} size="md" />
            <StatusBadge status={user?.status} size="md" />
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Member since</div>
          <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500' }}>
            {user?.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : '—'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '8px' }}>Last login</div>
          <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500' }}>
            {user?.lastLogin ? format(new Date(user.lastLogin), 'MMM d, yyyy HH:mm') : '—'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Update name */}
        <Section title="Personal Information">
          <form onSubmit={handleNameSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormField
              label="Full Name" name="name"
              value={nameForm.name} onChange={e => { setNameForm({ name: e.target.value }); setNameErrors({}); }}
              error={nameErrors.name} required
            />
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Email Address</label>
              <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', border: '1.5px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '14px' }}>
                {user?.email}
                <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-overlay)', padding: '2px 6px', borderRadius: '4px' }}>locked</span>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Role</label>
              <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', border: '1.5px solid var(--border-default)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}>
                <RoleBadge role={user?.role} />
              </div>
            </div>
            <Button type="submit" isLoading={isSavingName} style={{ alignSelf: 'flex-start' }}>
              Save Changes
            </Button>
          </form>
        </Section>

        {/* Change password */}
        <Section title="Change Password">
          <form onSubmit={handlePwdSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormField
              label="Current Password" name="currentPassword" type="password"
              value={pwdForm.currentPassword}
              onChange={e => { setPwdForm(p => ({ ...p, currentPassword: e.target.value })); setPwdErrors(p => ({ ...p, currentPassword: '' })); }}
              error={pwdErrors.currentPassword} placeholder="Your current password" required
            />
            <FormField
              label="New Password" name="password" type="password"
              value={pwdForm.password}
              onChange={e => { setPwdForm(p => ({ ...p, password: e.target.value })); setPwdErrors(p => ({ ...p, password: '' })); }}
              error={pwdErrors.password} placeholder="Min 8 chars, A-Z, a-z, 0-9"
              hint="Must contain uppercase, lowercase and a number" required
            />
            <FormField
              label="Confirm New Password" name="confirmPassword" type="password"
              value={pwdForm.confirmPassword}
              onChange={e => { setPwdForm(p => ({ ...p, confirmPassword: e.target.value })); setPwdErrors(p => ({ ...p, confirmPassword: '' })); }}
              error={pwdErrors.confirmPassword} placeholder="Repeat new password" required
            />
            <Button type="submit" isLoading={isSavingPwd} style={{ alignSelf: 'flex-start' }}>
              Update Password
            </Button>
          </form>
        </Section>
      </div>

      {/* Read-only note */}
      <div style={{ marginTop: '20px', padding: '14px 18px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--text-muted)' }}>
        🔒 Your role and email can only be changed by an administrator. Contact your admin if you need changes.
      </div>
    </div>
  );
}
