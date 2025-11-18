import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { applicationAPI } from '../../services/api';
import { FiClock, FiCheckCircle, FiXCircle, FiFileText } from 'react-icons/fi';
import './MyApplications.css';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await applicationAPI.getMyApplications();
      setApplications(data.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Pending', className: 'badge-warning', icon: FiClock },
      reviewing: { label: 'Under Review', className: 'badge-primary', icon: FiFileText },
      interview: { label: 'Interview', className: 'badge-primary', icon: FiCheckCircle },
      rejected: { label: 'Rejected', className: 'badge-danger', icon: FiXCircle },
      hired: { label: 'Hired', className: 'badge-success', icon: FiCheckCircle }
    };

    const config = statusMap[status] || statusMap.pending;
    const Icon = config.icon;

    return (
      <span className={`badge ${config.className}`}>
        <Icon size={14} /> {config.label}
      </span>
    );
  };

  return (
    <div className="my-applications-page">
      <Header />

      <div className="container">
        <div className="page-title">
          <h1>Việc đã ứng tuyển</h1>
          <p>Theo dõi trạng thái các đơn ứng tuyển của bạn</p>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : applications.length > 0 ? (
          <div className="applications-list">
            {applications.map(application => (
              <div key={application._id} className="application-card">
                <div className="application-header">
                  <div className="job-company-info">
                    <div className="company-logo">
                      {application.company?.companyLogo ? (
                        <img src={application.company.companyLogo} alt={application.company.companyName} />
                      ) : (
                        <div className="logo-placeholder">
                          {application.company?.companyName?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <Link to={`/jobs/${application.job?._id}`} className="job-title-link">
                        {application.job?.title}
                      </Link>
                      <p className="company-name">{application.company?.companyName}</p>
                    </div>
                  </div>
                  {getStatusBadge(application.status)}
                </div>

                <div className="application-info">
                  <div className="info-item">
                    <span className="label">Ngày ứng tuyển:</span>
                    <span>{new Date(application.appliedAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Địa điểm:</span>
                    <span>{application.job?.location?.city || 'Remote'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Loại hình:</span>
                    <span>{application.job?.category}</span>
                  </div>
                </div>

                {application.coverLetter && (
                  <div className="cover-letter-preview">
                    <strong>Cover Letter:</strong>
                    <p>{application.coverLetter.substring(0, 150)}...</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FiFileText size={64} color="#9ca3af" />
            <h3>Chưa có đơn ứng tuyển nào</h3>
            <p>Bắt đầu tìm kiếm và ứng tuyển vào các công việc phù hợp</p>
            <Link to="/jobs" className="btn btn-primary">
              Tìm việc ngay
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyApplications;

