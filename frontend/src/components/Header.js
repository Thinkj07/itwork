import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import Notifications from './Notifications';
import { FiBriefcase, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import './Header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo" style={{ marginTop: '5px' }}>
            <FiBriefcase size={28} />
            <span>ITWorks</span>
          </Link>

          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <Link to="/jobs" className="nav-link">Tìm việc</Link>
            <Link to="/companies" className="nav-link">Công ty</Link>
            
            {isAuthenticated ? (
              <>
                {user?.role === 'candidate' && (
                  <>
                    <Link to="/candidate/profile" className="nav-link">Hồ sơ</Link>
                    <Link to="/candidate/applications" className="nav-link">Ứng tuyển</Link>
                    <Link to="/candidate/saved-jobs" className="nav-link">Việc đã lưu</Link>
                  </>
                )}
                
                {user?.role === 'employer' && (
                  <>
                    <Link to="/employer/dashboard" className="nav-link">Dashboard</Link>
                    <Link to="/employer/jobs" className="nav-link">Quản lý tin</Link>
                    <Link to="/employer/profile" className="nav-link">Hồ sơ công ty</Link>
                  </>
                )}
                
                <Notifications />
                
                <div className="user-menu">
                  <div className="user-info">
                    <div className="user-avatar">
                      {(user?.role === 'candidate' && user?.avatar) || (user?.role === 'employer' && user?.companyLogo) ? (
                        <img src={user?.role === 'candidate' ? user.avatar : user.companyLogo} alt={user.fullName || user.companyName} />
                      ) : (
                        <FiUser size={20} />
                      )}
                    </div>
                    <span>{user?.fullName || user?.companyName}</span>
                  </div>
                  <button onClick={handleLogout} className="btn-logout">
                    <FiLogOut /> Đăng xuất
                  </button>
                </div>
              </>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline">Đăng nhập</Link>
                <Link to="/signup" className="btn btn-primary">Đăng ký</Link>
              </div>
            )}
          </nav>

          <button 
            className="menu-toggle" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

