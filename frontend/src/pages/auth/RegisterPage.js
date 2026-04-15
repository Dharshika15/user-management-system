import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email is required';
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) errs.password = 'Must include uppercase, lowercase and number';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsLoading(true);
    try {
      const { authAPI } = await import('../../api/auth');
      const res = await authAPI.register({ name: form.name, email: form.email, password: form.password });
      const { accessToken, user } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      await login({ email: form.email, password: form.password });
      toast.success(`Welcome, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backgroundImage: `
        radial-gradient(ellipse at 15% 50%, rgba(245,158,11,0.06) 0%, transparent 60%),
        radial-gradient(ellipse at 85% 20%, rgba(59,130,246,0.06) 0%, transparent 60%)
      `,
    }}>
      <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeIn 0.4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'var(--accent-primary)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: 'var(--shadow-accent)',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0d1424" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: '800', letterSpacing: '-0.03em' }}>
            Create Account
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
            Join UserVault today
          </p>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          boxShadow: 'var(--shadow-card)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <FormField label="Full name" name="name" value={form.name} onChange={handleChange} error={errors.name} placeholder="John Doe" required />
            <FormField label="Email address" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="you@example.com" required autoComplete="email" />
            <FormField
              label="Password" name="password" type="password" value={form.password}
              onChange={handleChange} error={errors.password} placeholder="Min 8 chars, A-Z, a-z, 0-9" required
              hint="Must contain uppercase, lowercase and a number"
            />
            <FormField label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="Repeat password" required />
            <Button type="submit" isLoading={isLoading} fullWidth size="lg" style={{ marginTop: '4px' }}>
              Create Account
            </Button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
