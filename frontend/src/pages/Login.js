import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { FiArrowLeft, FiMail, FiLock } from 'react-icons/fi';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  
  const { login, loading } = useAuthStore();
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

    try {
      const data = await login(formData);
      if (data.user.role === 'candidate') {
        navigate('/jobs');
      } else {
        navigate('/employer/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-overlay">
          <h1 className="login-title">ITWorks</h1>
          <p className="login-subtitle">Kết nối nhân tài IT với doanh nghiệp hàng đầu</p>
        </div>
      </div>

      <div className="login-right">
        <button className="home-button" onClick={handleGoHome}>
          <FiArrowLeft /> Quay về trang chủ
        </button>
        <div className="login-card">
          <h2 className="auth-title">Chào mừng bạn trở lại</h2>
          <p className="auth-subtitle">Đăng nhập để tiếp tục</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
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
                />
              </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? '⏳ Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="auth-footer">
            Chưa có tài khoản? <Link to="/signup">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
