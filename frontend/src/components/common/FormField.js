import React, { useState } from 'react';

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required,
  disabled,
  hint,
  options, // for select
  autoComplete,
}) {
  const [focused, setFocused] = useState(false);
  const isSelect = type === 'select';

  const baseStyle = {
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    fontFamily: 'var(--font-body)',
    background: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
    border: `1.5px solid ${error ? 'var(--danger)' : focused ? 'var(--border-focus)' : 'var(--border-default)'}`,
    borderRadius: 'var(--radius-md)',
    outline: 'none',
    transition: 'border-color var(--transition), box-shadow var(--transition)',
    boxShadow: focused ? (error ? '0 0 0 3px rgba(239,68,68,0.15)' : '0 0 0 3px rgba(59,130,246,0.15)') : 'none',
    cursor: disabled ? 'not-allowed' : 'auto',
    opacity: disabled ? 0.6 : 1,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{
          fontSize: '12px',
          fontWeight: '600',
          fontFamily: 'var(--font-display)',
          color: error ? 'var(--danger)' : 'var(--text-secondary)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          {label} {required && <span style={{ color: 'var(--accent-primary)' }}>*</span>}
        </label>
      )}

      {isSelect ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...baseStyle, cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: 'var(--bg-elevated)' }}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={baseStyle}
        />
      )}

      {error && (
        <span style={{ fontSize: '12px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          ⚠ {error}
        </span>
      )}
      {hint && !error && (
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{hint}</span>
      )}
    </div>
  );
}
