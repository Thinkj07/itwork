// frontend/src/pages/candidate/MyApplications.js

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { applicationAPI } from '../../services/api';
import { FiClock, FiCheckCircle, FiXCircle, FiFileText } from 'react-icons/fi';
import './MyApplications.css';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const applicationRefs = useRef({});
  const hasScrolledRef = useRef(false); // Prevent multiple scrolls

  useEffect(() => {
    fetchApplications();
  }, []);

  // Scroll to application when coming from notification
  useEffect(() => {
    if (!loading && applications.length > 0 && location.state && !hasScrolledRef.current) {
      const { scrollToApplication, scrollToJob } = location.state;
      
      console.log('Scroll attempt:', { scrollToApplication, scrollToJob, applicationsCount: applications.length });
      console.log('Available refs:', Object.keys(applicationRefs.current));
      
      const scrollTimeout = setTimeout(() => {
        let element = null;
        let foundKey = null;
        
        if (scrollToApplication) {
          element = applicationRefs.current[scrollToApplication];
          if (element) foundKey = scrollToApplication;
        }
        
        if (!element && scrollToJob) {
          const jobKey = `job-${scrollToJob}`;
          element = applicationRefs.current[jobKey];
          if (element) foundKey = jobKey;
        }
        
        if (!element && scrollToJob) {
          const matchingApp = applications.find(app => app.job?._id === scrollToJob);
          if (matchingApp) {
            element = applicationRefs.current[matchingApp._id];
            if (element) foundKey = matchingApp._id;
          }
        }
        
        if (element) {
          console.log('Found element, scrolling to:', foundKey);
          
          const headerHeight = 80; // Adjust based on your header height
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - headerHeight - (window.innerHeight / 2) + (element.offsetHeight / 2);
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          element.style.transition = 'all 0.3s ease';
          element.style.boxShadow = '0 8px 24px rgba(0, 201, 167, 0.3)';
          element.style.borderColor = 'var(--secondary)';
          element.style.borderWidth = '2px';
          
          setTimeout(() => {
            element.style.boxShadow = '';
            element.style.borderColor = '';
            element.style.borderWidth = '';
          }, 1500);
          
          hasScrolledRef.current = true;
        } else {
          console.warn('Element not found for scroll:', { scrollToApplication, scrollToJob });
        }
      }, 500);
      

      setTimeout(() => {
        window.history.replaceState({}, document.title);
      }, 1000);
      
      return () => clearTimeout(scrollTimeout);
    }
  }, [loading, location.state, applications]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      hasScrolledRef.current = false; // Reset scroll flag when fetching new data
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