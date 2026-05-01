import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthInput, AuthButton } from '@/components/auth/AuthComponents';

const Register: React.FC = () => {
  const navigate = useNavigate();
  
  // State quản lý dữ liệu form
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    gender: 'Nam',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // State quản lý lỗi để hiển thị cảnh báo
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Xóa lỗi khi người dùng bắt đầu nhập lại
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Check SĐT Việt Nam (Bắt đầu bằng 0 hoặc +84, theo sau là 9 chữ số)
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "SĐT chưa đúng định dạng VN (10 số).";
    }

    // Check Email
    if (!formData.email.includes('@')) {
      newErrors.email = "Email phải có ký tự '@'.";
    }

    // Check Mật khẩu (VD: tối thiểu 6 ký tự)
    if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      console.log("Dữ liệu hợp lệ, gửi lên Backend:", formData);
      // Gọi API đăng ký ở đây
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.backgroundLayer} />

      <div style={styles.modalContent}>
        <button onClick={() => navigate(-1)} style={styles.closeBtn}>✕</button>

        <div style={styles.header}>
          <div style={styles.logoContainer}>
             <span style={styles.logoText}>FIZA</span>
          </div>
          <h1 style={styles.title}>Đăng ký tài khoản Fiza</h1>
          <p style={styles.subtitle}>Gia nhập bếp nhà thông minh</p>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          <AuthInput 
            label="HỌ TÊN" 
            name="fullName"
            placeholder="VD: Nguyễn Văn A" 
            value={formData.fullName}
            onChange={handleInputChange}
          />
          
          <AuthInput 
            label="SDT" 
            name="phone"
            placeholder="Số điện thoại của bạn"
            value={formData.phone}
            onChange={handleInputChange}
            style={errors.phone ? { border: '1px solid #EF4444' } : {}}
          />
          {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1vh' }}>
            <label style={styles.labelCaps}>GIỚI TÍNH</label>
            <div style={{ display: 'flex', gap: '2vw', paddingLeft: '8px' }}>
              {['Nam', 'Nữ', 'Khác'].map((g) => (
                <label key={g} style={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="gender" 
                    checked={formData.gender === g} 
                    onChange={() => setFormData(prev => ({ ...prev, gender: g }))} 
                    style={styles.radioInput} 
                  />
                  {g}
                </label>
              ))}
            </div>
          </div>

          <AuthInput 
            label="EMAIL" 
            name="email"
            placeholder="user@fiza.vn"
            value={formData.email}
            onChange={handleInputChange}
            style={errors.email ? { border: '1px solid #EF4444' } : {}}
          />
          {errors.email && <span style={styles.errorText}>{errors.email}</span>}

          <div style={styles.grid}>
            <div>
              <AuthInput 
                label="MẬT KHẨU" 
                name="password"
                type="password" 
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleInputChange}
                style={errors.password ? { border: '1px solid #EF4444' } : {}}
              />
              {errors.password && <span style={styles.errorText}>{errors.password}</span>}
            </div>
            <div>
              <AuthInput 
                label="XÁC NHẬN" 
                name="confirmPassword"
                type="password" 
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                style={errors.confirmPassword ? { border: '1px solid #EF4444' } : {}}
              />
              {errors.confirmPassword && <span style={styles.errorText}>{errors.confirmPassword}</span>}
            </div>
          </div>

          <AuthButton type="submit" style={styles.submitBtn}>GỬI ĐĂNG KÝ</AuthButton>
        </form>

        <div style={styles.footer}>
          <span style={{ color: '#718096' }}>Đã có tài khoản? </span>
          <span onClick={() => navigate('/login')} style={styles.loginLink}>Đăng nhập ngay</span>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  // ... Giữ nguyên các style cũ của ông ...
  overlay: { position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2vh 20px', overflowY: 'auto', backgroundColor: '#101413' },
  backgroundLayer: { position: 'fixed', inset: 0, zIndex: -1, backgroundImage: `linear-gradient(0deg, rgba(11, 115, 95, 0.7), rgba(11, 115, 95, 0.7)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuA4-TInmSLAoMB_Ym4eqE7Ft-QgMTj0q2rY2uwxPu20LWKOOEJuX0CzOefxNglmMiH8U8BRZhMotVuMj-UYwLs9UPCcuB-KW_19t9ZFpzC3nqDwd86H5zojBENic6bBd__htuBYx_iQ3i-jMA2w-qbRHWNiDgzadKt9BD6egbChYYiev2HmkV6Q4XL6S_9KfYuy3DPVKpJtM30jViVkU6I5wy0JbOoFRjJ2CPj-TPJNf63_t32y5bDUwivG3Zzkgnipo73bAd1748PF')`, backgroundSize: 'cover', backgroundPosition: 'center' },
  modalContent: { backgroundColor: 'white', width: '95%', maxWidth: '550px', borderRadius: '32px', padding: '4vh 5%', position: 'relative', boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.5)', margin: 'auto', display: 'flex', flexDirection: 'column' },
  closeBtn: { position: 'absolute', top: '2.5vh', right: '2.5vh', background: 'none', border: 'none', fontSize: '24px', color: '#0B735F', cursor: 'pointer', zIndex: 10 },
  header: { textAlign: 'center', marginBottom: '3vh' },
  logoContainer: { display: 'flex', justifyContent: 'center', marginBottom: '1vh' },
  logoText: { fontSize: '32px', fontWeight: '800', color: '#0B735F', letterSpacing: '3px', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  title: { fontSize: '24px', fontWeight: '600', color: '#0B735F', marginBottom: '0.5vh' },
  subtitle: { fontSize: '14px', color: '#718096' },
  form: { display: 'flex', flexDirection: 'column', gap: '2vh' },
  labelCaps: { fontSize: '12px', fontWeight: '700', color: '#0B735F', letterSpacing: '1px' },
  radioLabel: { display: 'flex', alignItems: 'center', gap: '8px', color: '#4A5568', cursor: 'pointer', fontSize: '14px' },
  radioInput: { accentColor: '#0B735F', width: '18px', height: '18px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
  submitBtn: { marginTop: '1vh', padding: '18px', fontSize: '16px', boxShadow: '0px 10px 15px -3px rgba(11, 115, 95, 0.2)' },
  footer: { marginTop: '3vh', textAlign: 'center', fontSize: '14px' },
  loginLink: { color: '#0B735F', fontWeight: '700', cursor: 'pointer', marginLeft: '4px' },
  // Style mới cho text báo lỗi
  errorText: { color: '#EF4444', fontSize: '12px', marginTop: '-1.5vh', marginLeft: '4px' }
};

export default Register;