import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiBriefcase } from 'react-icons/fi';
import './Auth.css';

const Signup = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate('/role-selection', { state: { role } });
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
          <h1 className="auth-title">Tham gia với tư cách là<br />Ứng viên hoặc Nhà tuyển dụng</h1>
          <p className="auth-subtitle">Chọn vai trò của bạn để bắt đầu hành trình cùng ITWorks</p>

          <div className="role-cards">
            <div className="role-card" onClick={() => handleRoleSelect('candidate')}>
              <div className="role-icon-wrapper">
                <FiUser />
              </div>
              <span className="role-title">Tôi là Ứng viên</span>
              <span className="role-description">tôi đang tìm kiếm việc làm IT.</span>
            </div>
            
            <div className="role-card" onClick={() => handleRoleSelect('employer')}>
              <div className="role-icon-wrapper">
                <FiBriefcase />
              </div>
              <span className="role-title">Tôi là Nhà tuyển dụng</span>
              <span className="role-description">tôi đang tìm kiếm nhân tài IT.</span>
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
