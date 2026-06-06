import React from 'react';
import kitchenImg from '@/assets/kitchen.png';
import './AuthLayout.css';

// ─── 1. AuthInput ──────────────────────────────────────────
interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  rightLabel?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export const AuthInput: React.FC<AuthInputProps> = ({ label, rightLabel, endAdornment, ...props }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{
          fontSize: '13px', color: '#0B735F', fontWeight: '600',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          {label}
        </label>
        {rightLabel}
      </div>
      <div
        style={{
          position: 'relative',
          width: '100%',
        }}
      >
        <input
          {...props}
          style={{
            width: '100%',
            padding: endAdornment ? '14px 48px 14px 20px' : '14px 20px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #EEF3F0',
            borderRadius: '12px',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: '#171D1A',
            ...props.style,
          }}
        />
        {endAdornment && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              right: '14px',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {endAdornment}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── 2. AuthButton ─────────────────────────────────────────
interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ children, ...props }) => {
  return (
    <button
      {...props}
      style={{
        width: '100%',
        padding: '15px',
        backgroundColor: '#4D9A80',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '700',
        letterSpacing: '1px',
        cursor: 'pointer',
        marginTop: '8px',
        transition: 'opacity 0.2s, background 0.2s',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        ...props.style,
      }}
    >
      {children}
    </button>
  );
};

// ─── 3. AuthLayout ─────────────────────────────────────────
interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="al-viewport">
      <div className="al-card">

        {/* Cột trái: Branding + ảnh bếp */}
        <div className="al-left">
          <div className="al-brand">
            <div className="al-logo-row">
              <div className="al-logo-mark" />
              <span className="al-logo-text">FIZA</span>
            </div>
            <div className="al-welcome">
              <h1 className="al-headline">Chào mừng bạn đến với Fiza</h1>
              <p className="al-slogan">Fiza gắn kết - Bếp nhà gọn hết</p>
            </div>
          </div>

          <div className="al-illustration">
            <img src={kitchenImg} alt="Hình ảnh bếp Fiza" />
          </div>
        </div>

        {/* Cột phải: Form */}
        <div className="al-right">
          <div className="al-form-wrap">
            <header className="al-form-header">
              <h2 className="al-form-title">{title}</h2>
              <p className="al-form-subtitle">{subtitle}</p>
            </header>
            {children}
          </div>
        </div>

      </div>

      {/* Footer ngoài card */}
      <div className="al-footer">
        <span>© 2024 FIZA Smart Kitchen Systems</span>
        <div className="al-footer-links">
          <span>Chính sách</span>
          <span>Tư vấn khách hàng</span>
          <span>Trở thành Fiza-ers</span>
        </div>
      </div>
    </div>
  );
};
