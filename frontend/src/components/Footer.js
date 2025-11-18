import React from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiFacebook, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <FiBriefcase size={32} />
              <span>ITWorks</span>
            </div>
            <p className="footer-desc">
              Nền tảng tuyển dụng IT hàng đầu Việt Nam. 
              Kết nối nhà tuyển dụng với ứng viên IT chất lượng cao.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link"><FiFacebook /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link"><FiTwitter /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link"><FiLinkedin /></a>
              <a href="mailto:contact@itworks.com" className="social-link"><FiMail /></a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Dành cho ứng viên</h4>
            <ul className="footer-links">
              <li><Link to="/jobs">Tìm việc làm</Link></li>
              <li><Link to="/companies">Danh sách công ty</Link></li>
              <li><Link to="/candidate/profile">Quản lý hồ sơ</Link></li>
              <li><Link to="/candidate/applications">Việc đã ứng tuyển</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Dành cho nhà tuyển dụng</h4>
            <ul className="footer-links">
              <li><Link to="/employer/dashboard">Dashboard</Link></li>
              <li><Link to="/employer/create-job">Đăng tin tuyển dụng</Link></li>
              <li><Link to="/employer/jobs">Quản lý tin đăng</Link></li>
              <li><Link to="/employer/profile">Hồ sơ công ty</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Liên hệ</h4>
            <ul className="footer-links">
              <li>Email: contact@itworks.com</li>
              <li>Hotline: 1900 xxxx</li>
              <li>Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh, Việt Nam</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 ITWorks. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

