import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthInput, AuthButton, AuthLayout } from '@/components/auth/AuthComponents';

const Login: React.FC = () => {
  const navigate = useNavigate();
  
  // State quản lý thông tin nhập liệu
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // State quản lý lỗi hiển thị
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { identifier?: string; password?: string } = {};

    // 1. Kiểm tra Email/SĐT không được để trống
    if (!emailOrPhone.trim()) {
      newErrors.identifier = "Vui lòng nhập Email hoặc Số điện thoại.";
    } else {
      // 2. Nếu có nhập, kiểm tra xem có phải email không (nếu có dấu @)
      if (emailOrPhone.includes('@')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailOrPhone)) {
          newErrors.identifier = "Định dạng Email không hợp lệ.";
        }
      } 
      // 3. Nếu không phải email, kiểm tra định dạng SĐT Việt Nam
      else {
        const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
        if (!phoneRegex.test(emailOrPhone)) {
          newErrors.identifier = "SĐT chưa đúng định dạng VN (10 số).";
        }
      }
    }

    // 4. Kiểm tra mật khẩu (Không được để trống)
    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu.";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      console.log("Dữ liệu Login hợp lệ, đang gửi lên Backend:", { emailOrPhone, password });
      // TODO: Gọi API đăng nhập (auth.service.ts)
    }
  };

  return (
    <AuthLayout 
      title="Đăng nhập" 
      subtitle="Quản lý không gian bếp thông minh của bạn"
    >
      <form style={styles.form} onSubmit={handleLogin}>
        {/* Input Email/SĐT */}
        <div style={styles.inputGroup}>
          <AuthInput 
            label="Email/SĐT"
            placeholder="Nhập email hoặc số điện thoại"
            value={emailOrPhone}
            onChange={(e) => {
              setEmailOrPhone(e.target.value);
              if (errors.identifier) setErrors({ ...errors, identifier: '' });
            }}
            style={errors.identifier ? styles.inputError : {}}
          />
          {errors.identifier && <span style={styles.errorText}>{errors.identifier}</span>}
        </div>

        {/* Input Mật khẩu */}
        <div style={styles.inputGroup}>
          <AuthInput 
            label="Mật khẩu"
            type="password"
            placeholder="Nhập mật khẩu của bạn"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: '' });
            }}
            rightLabel={
              <span style={styles.forgotPass}>Quên mật khẩu?</span>
            }
            style={errors.password ? styles.inputError : {}}
          />
          {errors.password && <span style={styles.errorText}>{errors.password}</span>}
        </div>

        <AuthButton type="submit" style={{ marginTop: '8px' }}>
          ĐĂNG NHẬP
        </AuthButton>
      </form>

      <footer style={styles.footer}>
        <span style={{ color: 'var(--fiza-gray-500)' }}>Chưa có tài khoản?</span>
        <span 
          onClick={() => navigate('/register')} 
          style={styles.registerLink}
        >
          Đăng ký ngay
        </span>
      </footer>
    </AuthLayout>
  );
};

const styles: Record<string, React.CSSProperties> = {
  form: { display: 'flex', flexDirection: 'column', gap: '24px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  inputError: { border: '1px solid #EF4444' },
  errorText: { color: '#EF4444', fontSize: '12px', marginLeft: '4px' },
  forgotPass: { fontSize: '13px', color: '#4D9A80', cursor: 'pointer', fontWeight: '500' },
  footer: { 
    marginTop: '32px', 
    paddingTop: '24px', 
    borderTop: '1px solid #F0F4F2', 
    textAlign: 'center', 
    fontSize: '14px' 
  },
  registerLink: { 
    color: '#4D9A80', 
    fontWeight: '700', 
    marginLeft: '8px', 
    cursor: 'pointer' 
  }
};

export default Login;