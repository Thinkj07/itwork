// frontend/src/pages/employer/ManageJobs.js

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { jobAPI } from '../../services/api';
import { FiEdit, FiTrash2, FiEye, FiUsers, FiLock } from 'react-icons/fi';
import './ManageJobs.css';

// Smooth scroll với easing function
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

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);   // ✅ thêm
  const [jobToClose, setJobToClose] = useState(null);            // ✅ thêm
  const location = useLocation();
  const jobRefs = useRef({});
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  // Scroll to job when coming from notification
  useEffect(() => {
    // eslint-disable-next-line no-restricted-globals
    if (!loading && jobs.length > 0 && location.state && !hasScrolledRef.current) {
      const { scrollToJob } = location.state;
      
      const scrollTimeout = setTimeout(() => {
        let element = null;
        
        if (scrollToJob) {
          element = jobRefs.current[scrollToJob];
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, location.state, jobs]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      hasScrolledRef.current = false;
      const data = await jobAPI.getMyJobs();
      setJobs(data.data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (job) => {
    setJobToDelete(job);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;

    setDeleting(true);
    try {
      await jobAPI.deleteJob(jobToDelete._id);
      setJobs(jobs.filter(job => job._id !== jobToDelete._id));
      setShowDeleteModal(false);
      setJobToDelete(null);
      alert('Xóa thành công');
    } catch (error) {
      alert('Xóa thất bại: ' + (error.message || ''));
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setJobToDelete(null);
  };

  const handleCloseClick = (job) => {
    if (job.status === 'closed') {
      alert('Công việc này đã được đóng rồi');
      return;
    }
    setJobToClose(job);
    setShowCloseModal(true);
  };
  
  const handleConfirmClose = async () => {
    if (!jobToClose) return;
  
    setClosing(true);
    try {
      await jobAPI.closeJob(jobToClose._id);
      setJobs(jobs.map(j =>
        j._id === jobToClose._id ? { ...j, status: 'closed' } : j
      ));
      setShowCloseModal(false);
      setJobToClose(null);
      alert('Đã đóng công việc thành công');
    } catch (error) {
      alert('Đóng công việc thất bại: ' + (error.message || ''));
    } finally {
      setClosing(false);
    }
  };
  
  const handleCancelClose = () => {
    setShowCloseModal(false);
    setJobToClose(null);
  };

  return (
    <div className="manage-jobs-page">
      <Header />

      <div className="container">
        <div className="page-header">
          <h1>Quản lý tin đăng</h1>
          <Link to="/employer/create-job" className="btn btn-primary">
            + Đăng tin mới
          </Link>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="jobs-list-manage">
            {jobs.map(job => (
              <div 
                key={job._id} 
                className="job-manage-card"
                ref={(el) => {
                  if (el) {
                    jobRefs.current[job._id] = el;
                  }
                }}
              >
                <div className="job-manage-header">
                  <h3>{job.title}</h3>
                  <span className={`badge ${job.status === 'active' ? 'badge-success' : job.status === 'closed' ? 'badge-danger' : 'badge-warning'}`}>
                    {job.status === 'active' ? 'ACTIVE' : job.status === 'closed' ? 'CLOSED' : job.status.toUpperCase()}
                  </span>
                </div>

                <div className="job-manage-meta">
                  <span><strong>Category:</strong> {job.category}</span>
                  <span><strong>Location:</strong> {job.location?.city || 'Remote'}</span>
                  <span><strong>Type:</strong> {job.jobType}</span>
                </div>

                <div className="job-manage-stats">
                  <div className="stat-badge">
                    <FiUsers /> {job.applicationCount || 0} ứng viên
                  </div>
                  <div className="stat-badge">
                    <FiEye /> {job.views || 0} lượt xem
                  </div>
                </div>

                <div className="job-manage-actions">
                  <Link to={`/jobs/${job._id}`} className="btn btn-sm btn-outline">
                    <FiEye /> Xem
                  </Link>
                  <Link to={`/employer/jobs/${job._id}/applicants`} className="btn btn-sm btn-outline">
                    <FiUsers /> Ứng viên
                  </Link>
                  <Link to={`/employer/jobs/${job._id}/edit`} className="btn btn-sm btn-outline">
                    <FiEdit /> Sửa
                  </Link>
                  {job.status !== 'closed' && (
                    <button 
                      onClick={() => handleCloseClick(job)}  // ✅ đổi sang handleCloseClick
                      className="btn btn-sm btn-outline btn-close"
                      disabled={closing}
                    >
                      <FiLock /> Đóng
                    </button>
                  )}
                  <button onClick={() => handleDeleteClick(job)} className="btn btn-sm btn-outline danger">
                    <FiTrash2 /> Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && jobToDelete && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Xác nhận xóa tin tuyển dụng</h2>
            <p>
              Bạn có chắc chắn muốn xóa tin tuyển dụng <strong>"{jobToDelete.title}"</strong>?
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '12px' }}>
              Hành động này không thể hoàn tác. Tin tuyển dụng và tất cả đơn ứng tuyển liên quan sẽ bị xóa vĩnh viễn.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                onClick={handleCancelDelete}
                className="btn btn-secondary"
                disabled={deleting}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="btn btn-primary"
                disabled={deleting}
                style={{ backgroundColor: 'var(--error)' }}
              >
                {deleting ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCloseModal && jobToClose && (
        <div className="modal-overlay" onClick={handleCancelClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Xác nhận đóng tin tuyển dụng</h2>
            <p>
              Bạn có chắc chắn muốn <strong>đóng</strong> tin tuyển dụng <strong>"{jobToClose.title}"</strong>?
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '12px' }}>
              Ứng viên sẽ không thể ứng tuyển thêm vào tin này, nhưng tin vẫn hiển thị trong hệ thống để bạn quản lý.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                onClick={handleCancelClose}
                className="btn btn-secondary"
                disabled={closing}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmClose}
                className="btn btn-primary"
                disabled={closing}
                style={{ backgroundColor: '#F59E0B' }}
              >
                {closing ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ManageJobs;