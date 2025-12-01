import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { jobAPI, applicationAPI } from '../../services/api';
import { FiBriefcase, FiUsers, FiEye, FiPlus } from 'react-icons/fi';
import './Dashboard.css';

const EmployerDashboard = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [jobsData, applicationsData] = await Promise.all([
        jobAPI.getMyJobs(),
        applicationAPI.getEmployerApplications()
      ]);

      const jobs = jobsData.data || [];
      const applications = applicationsData.data || [];

      setStats({
        totalJobs: jobs.length,
        activeJobs: jobs.filter(j => j.status === 'active').length,
        totalApplications: applications.length,
        pendingApplications: applications.filter(a => a.status === 'pending').length
      });

      setRecentJobs(jobs.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <Header />

      <div className="container">
        <div className="dashboard-header">
          <h1>Company Dashboard</h1>
          <Link to="/employer/create-job" className="btn btn-primary">
            <FiPlus /> Đăng Tin Mới
          </Link>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#dbeafe' }}>
                  <FiBriefcase color="#2563eb" />
                </div>
                <div className="stat-info">
                  <p className="stat-label">Tổng số tin</p>
                  <h3 className="stat-value">{stats.totalJobs}</h3>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#d1fae5' }}>
                  <FiEye color="#059669" />
                </div>
                <div className="stat-info">
                  <p className="stat-label">Tin đang hoạt động</p>
                  <h3 className="stat-value">{stats.activeJobs}</h3>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#fef3c7' }}>
                  <FiUsers color="#d97706" />
                </div>
                <div className="stat-info">
                  <p className="stat-label">Tổng ứng viên</p>
                  <h3 className="stat-value">{stats.totalApplications}</h3>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#fce7f3' }}>
                  <FiUsers color="#be185d" />
                </div>
                <div className="stat-info">
                  <p className="stat-label">Ứng viên chờ duyệt</p>
                  <h3 className="stat-value">{stats.pendingApplications}</h3>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Quản lý Tin Tuyển Dụng Đã Đăng ({stats.totalJobs})</h3>
                <div className="filter-dropdown">
                  <select>
                    <option>Tất cả</option>
                    <option>Active</option>
                    <option>Closed</option>
                  </select>
                  <Link to="/employer/create-job" className="btn btn-primary">
                    + Đăng Tin Mới
                  </Link>
                </div>
              </div>

              <div className="jobs-table">
                {recentJobs.map(job => (
                  <div key={job._id} className="job-row">
                    <div className="job-info-col">
                      <h4>{job.title}</h4>
                      <div className="job-meta-tags">
                        <span className="meta-tag">{job.category}</span>
                      </div>
                    </div>

                    <div className="job-stats-col">
                      <div className="stat-item-small">
                        <span className="stat-label-small">Mức lương</span>
                        <span className="stat-value-small">
                          {job.salaryNegotiable ? 'Thương lượng' : `${job.salaryFrom / 1000000}-${job.salaryTo / 1000000} triệu VND`}
                        </span>
                      </div>
                      <div className="stat-item-small">
                        <span className="stat-label-small">Địa điểm</span>
                        <span className="stat-value-small">{job.location?.city || '—'}</span>
                      </div>
                      <div className="stat-item-small">
                        <span className="stat-label-small">Kinh nghiệm</span>
                        <span className="stat-value-small">{job.experienceLevel}</span>
                      </div>
                    </div>

                    <div className="job-actions-col">
                      <Link to={`/employer/jobs/${job._id}/applicants`} className="btn btn-sm btn-outline">
                        Xem Ứng Viên ({job.applicationCount})
                      </Link>
                      <span className={`badge ${job.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                        {job.status === 'active' ? 'ACTIVE' : 'CLOSED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default EmployerDashboard;

