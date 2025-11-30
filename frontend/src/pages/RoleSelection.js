import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { FiArrowLeft, FiUser, FiBriefcase, FiMail, FiLock } from 'react-icons/fi';
import './Auth.css';

const RoleSelection = () => {
  const location = useLocation();
  const role = location.state?.role || 'candidate';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    companyName: '',
    role: role
  });
  const [error, setError] = useState('');
  
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      const data = await register(formData);
      
      // Redirect based on role
      if (data.user.role === 'candidate') {
        navigate('/candidate/profile');
      } else {
        navigate('/employer/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="auth-page">
      <button className="home-button" onClick={handleGoHome}>
        <FiArrowLeft /> Quay về trang chủ
      </button>
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">
            {role === 'candidate' ? 'Đăng ký tài khoản Ứng viên' : 'Đăng ký tài khoản Nhà tuyển dụng'}
          </h1>
          <p className="auth-subtitle">
            {role === 'candidate' 
              ? 'Tạo hồ sơ và tìm kiếm công việc IT phù hợp' 
              : 'Đăng tin tuyển dụng và tìm kiếm ứng viên IT'}
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {role === 'candidate' ? (
              <div className="form-group">
                <label className="form-label">
                  <FiUser style={{ marginRight: '8px', verticalAlign: 'middle', marginBottom: '3px' }} />
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="fullName"
                  className="form-input"
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">
                  <FiBriefcase style={{ marginRight: '8px', verticalAlign: 'middle', marginBottom: '3px' }} />
                  Tên công ty
                </label>
                <input
                  type="text"
                  name="companyName"
                  className="form-input"
                  placeholder="FPT Corporation"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                <FiMail style={{ marginRight: '8px', verticalAlign: 'middle', marginBottom: '3px' }} />
                Email
              </label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FiLock style={{ marginRight: '8px', verticalAlign: 'middle', marginBottom: '4px' }} />
                Mật khẩu
              </label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? '⏳ Đang đăng ký...' : 'Đăng ký ngay'}
            </button>
          </form>

          <p className="auth-footer">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
