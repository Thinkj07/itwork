import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Signup = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate('/role-selection', { state: { role } });
  };
  // Thêm nút quay về trang chủ
  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="auth-page">
      <button className="home-button" onClick={handleGoHome}>Quay về trang chủ</button>
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Tham gia với tư cách là Ứng viên hoặc Nhà tuyển dụng</h1>

          <div className="role-cards">
            <div className="role-card" onClick={() => handleRoleSelect('candidate')}>
              <div className="role-icon">👨‍💻</div>
              <h3>Tôi là Ứng viên, tôi đang tìm kiếm việc làm.</h3>
            </div>
            <div className="role-card" onClick={() => handleRoleSelect('employer')}>
              <div className="role-icon">🏢</div>
              <h3>Tôi là Nhà tuyển dụng, tôi đang tuyển dụng cho một việc làm.</h3>
            </div>
          </div>

          <p className="auth-footer">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

