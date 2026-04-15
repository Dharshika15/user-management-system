import React from 'react';

export default function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg-base)',
      flexDirection: 'column',
      gap: '20px',
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '3px solid var(--bg-overlay)',
        borderTop: '3px solid var(--accent-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{
        fontFamily: 'var(--font-display)',
        color: 'var(--text-muted)',
        fontSize: '14px',
        letterSpacing: '0.05em',
      }}>
        Loading…
      </span>
    </div>
  );
}
