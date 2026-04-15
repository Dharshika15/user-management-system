import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usersAPI } from '../../api/users';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import toast from 'react-hot-toast';

const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
  let pwd = 'Aa1';
  for (let i = 0; i < 9; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd.split('').sort(() => Math.random() - 0.5).join('');
};

export default function CreateUserPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user', status: 'active' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
    if (!form.password || form.password.length < 8) errs.password = 'Min 8 characters required';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) errs.password = 'Must include upper, lower and number';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsLoading(true);
    try {
      await usersAPI.create(form);
      toast.success(`User "${form.name}" created successfully!`);
      navigate('/users');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create user';
      toast.error(msg);
      if (msg.toLowerCase().includes('email')) setErrors({ email: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-content" style={{ maxWidth: '600px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', fontSize: '13px', color: 'var(--text-muted)' }}>
        <Link to="/users" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Users</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)' }}>New User</span>
      </div>

      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.03em' }}>Create New User</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Add a new user account to the system.</p>
      </div>

      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)', padding: '32px',
        boxShadow: 'var(--shadow-card)',
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <FormField label="Full Name" name="name" value={form.name} onChange={handleChange} error={errors.name} placeholder="Jane Smith" required />
          <FormField label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="jane@example.com" required />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', fontFamily: 'var(--font-display)', color: errors.password ? 'var(--danger)' : 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Password <span style={{ color: 'var(--accent-primary)' }}>*</span>
              </label>
              <button type="button" onClick={() => { const p = generatePassword(); setForm(f => ({ ...f, password: p })); setShowPassword(true); setErrors(e => ({ ...e, password: '' })); }}
                style={{ fontSize: '11px', color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: '600' }}>
                ⚡ Auto-generate
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min 8 chars, A-Z, a-z, 0-9"
                style={{
                  width: '100%', padding: '10px 44px 10px 14px',
                  background: 'var(--bg-elevated)', border: `1.5px solid ${errors.password ? 'var(--danger)' : 'var(--border-default)'}`,
                  borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                  fontSize: '14px', fontFamily: 'var(--font-body)', outline: 'none',
                }}
              />
              <button type="button" onClick={() => setShowPassword(p => !p)} style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              }}>
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>⚠ {errors.password}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormField label="Role" name="role" type="select" value={form.role} onChange={handleChange}
              options={[{ value: 'user', label: 'User' }, { value: 'manager', label: 'Manager' }, { value: 'admin', label: 'Admin' }]}
            />
            <FormField label="Status" name="status" type="select" value={form.status} onChange={handleChange}
              options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]}
            />
          </div>

          {/* Info box */}
          <div style={{ background: 'var(--accent-secondary-dim)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 'var(--radius-md)', padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--accent-secondary)' }}>Note:</strong> The user will be able to log in immediately with these credentials. Share them securely.
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
            <Button type="submit" isLoading={isLoading}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              Create User
            </Button>
            <Button variant="ghost" type="button" onClick={() => navigate('/users')}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
