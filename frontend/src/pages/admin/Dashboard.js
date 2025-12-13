import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { 
  FiUsers, FiBriefcase, FiFileText, FiTrendingUp,
  FiUserCheck, FiUserX 
} from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu thống kê');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>❌ {error}</p>
        <button onClick={fetchDashboardStats}>Thử lại</button>
      </div>
    );
  }

  const { overview, weekly, monthly, topCompanies, recentActivities } = stats || {};

  const statCards = [
    {
      title: 'Tổng Users',
      value: overview?.totalUsers || 0,
      icon: <FiUsers />,
      color: '#667eea',
      subtitle: `${weekly?.newUsers || 0} mới tuần này`
    },
    {
      title: 'Ứng viên',
      value: overview?.totalCandidates || 0,
      icon: <FiUserCheck />,
      color: '#48bb78',
      subtitle: `${overview?.activeUsers || 0} đang hoạt động`
    },
    {
      title: 'Nhà tuyển dụng',
      value: overview?.totalEmployers || 0,
      icon: <FiBriefcase />,
      color: '#ed8936',
      subtitle: `${overview?.blockedUsers || 0} bị khóa`
    },
    {
      title: 'Công việc',
      value: overview?.totalJobs || 0,
      icon: <FiBriefcase />,
      color: '#3182ce',
      subtitle: `${overview?.activeJobs || 0} đang active`
    },
    {
      title: 'Đơn ứng tuyển',
      value: overview?.totalApplications || 0,
      icon: <FiFileText />,
      color: '#805ad5',
      subtitle: `${weekly?.newApplications || 0} mới tuần này`
    },
    {
      title: 'Tài khoản bị khóa',
      value: overview?.blockedUsers || 0,
      icon: <FiUserX />,
      color: '#e53e3e',
      subtitle: 'Tổng số bị khóa'
    }
  ];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">Tổng quan hệ thống tuyển dụng IT</p>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards">
        {statCards.map((card, index) => (
          <div 
            key={index} 
            className="stat-card"
            style={{ borderTopColor: card.color }}
          >
            <div className="stat-icon" style={{ backgroundColor: `${card.color}20` }}>
              <span style={{ color: card.color }}>{card.icon}</span>
            </div>
            <div className="stat-content">
              <h3>{card.title}</h3>
              <p className="stat-value">{card.value.toLocaleString()}</p>
              <p className="stat-subtitle">{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Growth Section */}
      <div className="dashboard-grid">
        {/* Weekly Stats */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Thống kê tuần này</h3>
            <FiTrendingUp />
          </div>
          <div className="growth-stats">
            <div className="growth-item">
              <span className="growth-label">Users mới</span>
              <span className="growth-value">{weekly?.newUsers || 0}</span>
            </div>
            <div className="growth-item">
              <span className="growth-label">Jobs mới</span>
              <span className="growth-value">{weekly?.newJobs || 0}</span>
            </div>
            <div className="growth-item">
              <span className="growth-label">Đơn ứng tuyển</span>
              <span className="growth-value">{weekly?.newApplications || 0}</span>
            </div>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Thống kê tháng này</h3>
            <FiTrendingUp />
          </div>
          <div className="growth-stats">
            <div className="growth-item">
              <span className="growth-label">Users mới</span>
              <span className="growth-value">{monthly?.newUsers || 0}</span>
            </div>
            <div className="growth-item">
              <span className="growth-label">Jobs mới</span>
              <span className="growth-value">{monthly?.newJobs || 0}</span>
            </div>
            <div className="growth-item">
              <span className="growth-label">Đơn ứng tuyển</span>
              <span className="growth-value">{monthly?.newApplications || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Companies */}
      <div className="dashboard-card">
        <div className="card-header">
          <h3>Top 10 Công ty</h3>
        </div>
        <div className="top-companies">
          {topCompanies && topCompanies.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Công ty</th>
                  <th>Số Jobs</th>
                  <th>Số đơn ứng tuyển</th>
                </tr>
              </thead>
              <tbody>
                {topCompanies.map((company, index) => (
                  <tr key={company.companyId}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="company-info">
                        {company.companyLogo && (
                          <img 
                            src={company.companyLogo} 
                            alt={company.companyName}
                            className="company-logo-small"
                          />
                        )}
                        <span>{company.companyName}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-primary">{company.jobCount}</span>
                    </td>
                    <td>
                      <span className="badge badge-success">{company.applicationCount}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">Chưa có dữ liệu</p>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="dashboard-card">
        <div className="card-header">
          <h3>Hoạt động gần đây</h3>
        </div>
        <div className="recent-activities">
          {recentActivities && recentActivities.length > 0 ? (
            <div className="activity-list">
              {recentActivities.map((activity) => (
                <div key={activity._id} className="activity-item">
                  <div className="activity-icon">
                    <FiFileText />
                  </div>
                  <div className="activity-content">
                    <p className="activity-description">{activity.description}</p>
                    <p className="activity-meta">
                      <span className="activity-admin">
                        {activity.admin?.email || 'Unknown Admin'}
                      </span>
                      <span className="activity-time">
                        {new Date(activity.timestamp).toLocaleString('vi-VN')}
                      </span>
                    </p>
                  </div>
                  <span className={`activity-badge ${activity.action.toLowerCase()}`}>
                    {activity.action}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">Chưa có hoạt động nào</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
