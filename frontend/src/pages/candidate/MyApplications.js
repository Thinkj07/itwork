import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { applicationAPI } from '../../services/api';
import { FiClock, FiCheckCircle, FiXCircle, FiFileText, FiX } from 'react-icons/fi';
import './MyApplications.css';

const smoothScrollTo = (element, offset = 0) => {
  const headerHeight = 80;
  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const targetPosition = elementPosition - headerHeight - (window.innerHeight / 2) + (element.offsetHeight / 2) + offset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  const duration = 800;
  let start = null;

  const easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const animation = (currentTime) => {
    if (start === null) start = currentTime;
    const timeElapsed = currentTime - start;
    const progress = Math.min(timeElapsed / duration, 1);
    
    window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));
    
    if (progress < 1) {
      requestAnimationFrame(animation);
    }
  };

  requestAnimationFrame(animation);
};

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [applicationToWithdraw, setApplicationToWithdraw] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const location = useLocation();
  const applicationRefs = useRef({});
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  // Scroll to application when coming from notification
  useEffect(() => {
    if (!loading && applications.length > 0 && location.state && !hasScrolledRef.current) {
      const { scrollToApplication, scrollToJob } = location.state;
      
      const scrollTimeout = setTimeout(() => {
        let element = null;
        
        if (scrollToApplication) {
          element = applicationRefs.current[scrollToApplication];
        }
        
        if (!element && scrollToJob) {
          const jobKey = `job-${scrollToJob}`;
          element = applicationRefs.current[jobKey];
        }
        
        if (!element && scrollToJob) {
          const matchingApp = applications.find(app => app.job?._id === scrollToJob);
          if (matchingApp) {
            element = applicationRefs.current[matchingApp._id];
          }
        }
        
        if (element) {
          // Smooth scroll với easing
          smoothScrollTo(element);
          
          // Thêm highlight class
          element.classList.add('highlight-notification');
          
          // Remove sau khi animation xong
          setTimeout(() => {
            element.classList.remove('highlight-notification');
          }, 1500);
          
          hasScrolledRef.current = true;
        }
      }, 400);
      
      setTimeout(() => {
        window.history.replaceState({}, document.title);
      }, 1500);
      
      return () => clearTimeout(scrollTimeout);
    }
  }, [loading, location.state, applications]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      hasScrolledRef.current = false;
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

  const handleWithdrawClick = (application) => {
    setApplicationToWithdraw(application);
    setShowWithdrawModal(true);
  };

  const handleConfirmWithdraw = async () => {
    if (!applicationToWithdraw) return;

    setWithdrawing(true);
    try {
      await applicationAPI.withdrawApplication(applicationToWithdraw._id);
      
      // Remove application from list
      setApplications(applications.filter(app => app._id !== applicationToWithdraw._id));
      
      // Close modal
      setShowWithdrawModal(false);
      setApplicationToWithdraw(null);
      
      // Show success message
      alert('Đã rút đơn ứng tuyển thành công');
    } catch (error) {
      console.error('Error withdrawing application:', error);
      alert(error.message || 'Có lỗi xảy ra khi rút đơn ứng tuyển');
    } finally {
      setWithdrawing(false);
    }
  };

  const handleCancelWithdraw = () => {
    setShowWithdrawModal(false);
    setApplicationToWithdraw(null);
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
              <div 
                key={application._id} 
                className="application-card" 
                ref={(el) => {
                  if (el) {
                    // Store ref by application ID
                    applicationRefs.current[application._id] = el;
                    
                    // Also store by job ID if available
                    if (application.job?._id) {
                      applicationRefs.current[`job-${application.job._id}`] = el;
                    }
                    
                    // Debug: Log when ref is assigned
                    if (location.state?.scrollToApplication === application._id || 
                        location.state?.scrollToJob === application.job?._id) {
                      console.log('Ref assigned for:', application._id, application.job?._id);
                    }
                  }
                }}
              >
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

                <div className="application-actions">
                  <button
                    onClick={() => handleWithdrawClick(application)}
                    className="btn-withdraw"
                    title="Rút đơn ứng tuyển"
                  >
                    <FiX size={16} />
                    Rút đơn
                  </button>
                </div>
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

      {/* Withdraw Confirmation Modal */}
      {showWithdrawModal && applicationToWithdraw && (
        <div className="modal-overlay" onClick={handleCancelWithdraw}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Xác nhận rút đơn ứng tuyển</h2>
            <p>
              Bạn có chắc chắn muốn rút đơn ứng tuyển cho vị trí <strong>"{applicationToWithdraw.job?.title}"</strong> tại <strong>{applicationToWithdraw.company?.companyName}</strong>?
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '12px' }}>
              Hành động này không thể hoàn tác. Đơn ứng tuyển sẽ bị xóa vĩnh viễn.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                onClick={handleCancelWithdraw}
                className="btn btn-secondary"
                disabled={withdrawing}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmWithdraw}
                className="btn btn-primary"
                disabled={withdrawing}
                style={{ backgroundColor: 'var(--error)' }}
              >
                {withdrawing ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MyApplications;