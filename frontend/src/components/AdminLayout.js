import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiHome, FiUsers, FiBriefcase, FiFileText, 
  FiLogOut, FiMenu, FiX 
} from 'react-icons/fi';
import useAuthStore from '../store/useAuthStore';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { path: '/admin/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { path: '/admin/users', icon: <FiUsers />, label: 'Quản lý Users' },
    { path: '/admin/jobs', icon: <FiBriefcase />, label: 'Quản lý Jobs' },
    { path: '/admin/audit-logs', icon: <FiFileText />, label: 'Audit Logs' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-info">
            {sidebarOpen && (
              <>
                <p className="admin-email">{user?.email}</p>
                <span className="admin-badge">Admin</span>
              </>
            )}
          </div>
          <button 
            className="logout-btn"
            onClick={handleLogout}
            title="Đăng xuất"
          >
            <FiLogOut />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`admin-content ${sidebarOpen ? '' : 'expanded'}`}>
        <div className="content-header">
          <button 
            className="mobile-menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FiMenu />
          </button>
        </div>
        
        <div className="content-body">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
