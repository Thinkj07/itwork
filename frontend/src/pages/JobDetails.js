import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { jobAPI, applicationAPI, userAPI, authAPI } from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { FiMapPin, FiDollarSign, FiBriefcase, FiClock, FiUsers, FiCheckCircle, FiBookmark } from 'react-icons/fi';
import './JobDetails.css';

const JobDetails = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savingJob, setSavingJob] = useState(false);

  useEffect(() => {
    fetchJobDetails();
    if (isAuthenticated && user?.role === 'candidate') {
      checkApplicationStatus();
      checkSavedStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated, user]);

  const fetchJobDetails = async () => {
    try {
      const data = await jobAPI.getJob(id);
      setJob(data.data);
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    // Chỉ check nếu user đã login và là candidate
    if (!isAuthenticated || user?.role !== 'candidate') {
      return;
    }

    try {
      const data = await applicationAPI.getMyApplications();
      const applications = data.data || [];
      
      // Check xem có application nào cho job này không
      const hasAppliedToThisJob = applications.some(
        app => app.job?._id === id
      );
      
      setHasApplied(hasAppliedToThisJob);
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const checkSavedStatus = () => {
    if (user?.savedJobs) {
      setIsSaved(user.savedJobs.includes(id));
    }
  };

  const handleToggleSaveJob = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'candidate') {
      alert('Chỉ ứng viên mới có thể lưu công việc');
      return;
    }

    setSavingJob(true);
    try {
      await userAPI.toggleSaveJob(id);
      setIsSaved(!isSaved);
      // Update user in store
      const updatedUser = await authAPI.getMe();
      useAuthStore.getState().setUser(updatedUser.data);
    } catch (error) {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSavingJob(false);
    }
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'candidate') {
      alert('Chỉ ứng viên mới có thể ứng tuyển');
      return;
    }

    setShowApplyModal(true);
  };

  const submitApplication = async (e) => {
    e.preventDefault();

    // Check if user has CV in profile
    if (!user?.cvUrl) {
      alert('Bạn chưa có CV trong hồ sơ. Vui lòng cập nhật CV trong phần hồ sơ của bạn trước khi ứng tuyển.');
      setShowApplyModal(false);
      navigate('/candidate/profile');
      return;
    }

    setApplying(true);

    try {
      await applicationAPI.apply({
        jobId: id,
        cvType: 'profile',
        cvUrl: user.cvUrl,
        coverLetter: e.target.coverLetter.value
      });

      setHasApplied(true);
      setShowApplyModal(false);
      alert('Ứng tuyển thành công!');
    } catch (error) {
      alert(error.message || 'Ứng tuyển thất bại');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div>
        <Header />
        <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
          <h2>Không tìm thấy công việc</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="job-details-page">
      <Header />

      <div className="container">
        <div className="job-details-layout">
          <main className="job-main">
            <div className="job-header-section">
              <div className="company-info">
                <div className="company-logo-lg">
                  {job.company?.companyLogo ? (
                    <img src={job.company.companyLogo} alt={job.company.companyName} />
                  ) : (
                    <div className="logo-placeholder">{job.company?.companyName?.charAt(0)}</div>
                  )}
                </div>
                <div>
                  <h1 className="job-title-lg">{job.title}</h1>
                  <Link to={`/companies/${job.company?._id}`} className="company-link">
                    {job.company?.companyName}
                  </Link>
                </div>
              </div>

              <div className="job-meta-grid">
                <div className="meta-item">
                  <FiMapPin />
                  <div>
                    <p className="meta-label">Địa điểm</p>
                    <p className="meta-value">{job.location?.city || 'Remote'}</p>
                  </div>
                </div>
                <div className="meta-item">
                  <FiDollarSign />
                  <div>
                    <p className="meta-label">Mức lương</p>
                    <p className="meta-value">
                      {job.salaryFrom && job.salaryTo
                        ? `${job.salaryFrom / 1000000}-${job.salaryTo / 1000000} triệu VND`
                        : 'Thương lượng'}
                    </p>
                  </div>
                </div>
                <div className="meta-item">
                  <FiBriefcase />
                  <div>
                    <p className="meta-label">Kinh nghiệm</p>
                    <p className="meta-value">{job.experienceLevel}</p>
                  </div>
                </div>
                <div className="meta-item">
                  <FiClock />
                  <div>
                    <p className="meta-label">Loại hình</p>
                    <p className="meta-value">{job.jobType}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="job-section">
              <h2>Mô tả công việc</h2>
              <div className="content-text" dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br>') }} />
            </div>

            <div className="job-section">
              <h2>Yêu cầu công việc</h2>
              <div className="content-text" dangerouslySetInnerHTML={{ __html: job.requirements.replace(/\n/g, '<br>') }} />
            </div>

            {job.benefits && (
              <div className="job-section">
                <h2>Phúc lợi</h2>
                <div className="content-text" dangerouslySetInnerHTML={{ __html: job.benefits.replace(/\n/g, '<br>') }} />
              </div>
            )}

            <div className="job-section">
              <h2>Kỹ năng yêu cầu</h2>
              <div className="skills-list">
                {job.skills?.map((skill, index) => (
                  <span key={index} className="skill-badge">{skill}</span>
                ))}
              </div>
            </div>
          </main>

          <aside className="job-sidebar">
            <div className="apply-card">
              {hasApplied ? (
                <div className="applied-message">
                  <FiCheckCircle size={48} color="#10b981" />
                  <h3>Đã ứng tuyển</h3>
                  <p>Bạn đã ứng tuyển vào vị trí này</p>
                </div>
              ) : (
                <>
                  <button onClick={handleApply} className="btn btn-primary btn-lg">
                    Apply Now
                  </button>
                  {isAuthenticated && user?.role === 'candidate' && (
                    <button 
                      onClick={handleToggleSaveJob} 
                      className={`btn btn-lg ${isSaved ? 'btn-primary' : 'btn-outline'}`}
                      disabled={savingJob}
                      style={{marginTop: '10px'}}
                    >
                      <FiBookmark style={{marginRight: '8px'}} />
                      {isSaved ? 'Đã lưu' : 'Lưu công việc'}
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="info-card">
              <h3>Thông tin công ty</h3>
              <div className="company-details">
                <p><strong>Ngành:</strong> {job.company?.industry}</p>
                <p><strong>Quy mô:</strong> {job.company?.companySize} nhân viên</p>
                {job.company?.companyWebsite && (
                  <p>
                    <strong>Website:</strong>{' '}
                    <a href={job.company.companyWebsite} target="_blank" rel="noopener noreferrer">
                      {job.company.companyWebsite}
                    </a>
                  </p>
                )}
              </div>
            </div>

            <div className="info-card">
              <h3>Thông tin tuyển dụng</h3>
              <div className="job-stats">
                <div className="stat">
                  <FiUsers />
                  <span>{job.applicationCount} ứng viên</span>
                </div>
                <div className="stat">
                  <FiClock />
                  <span>Đăng {new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Apply for {job.title}</h2>
            <p>at {job.company?.companyName}</p>

            <form onSubmit={submitApplication}>
              <div className="form-group">
                <label>CV của bạn</label>
                {user?.cvUrl ? (
                  <div className="cv-info">
                    <p className="help-text" style={{color: '#059669', marginBottom: '10px'}}>
                      ✓ Sử dụng CV hiện có trong hồ sơ
                    </p>
                    <a href={user.cvUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{display: 'inline-block'}}>
                      Xem CV của bạn
                    </a>
                  </div>
                ) : (
                  <p className="help-text" style={{color: '#dc2626'}}>
                    ⚠ Bạn chưa có CV trong hồ sơ. Vui lòng cập nhật CV trong phần hồ sơ của bạn trước khi ứng tuyển.
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>Cover letter (Optional)</label>
                <textarea
                  name="coverLetter"
                  placeholder="Write a short cover letter..."
                  rows="5"
                  className="form-textarea"
                ></textarea>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={applying || !user?.cvUrl}
                >
                  {applying ? 'Đang gửi...' : 'Gửi đơn ứng tuyển'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default JobDetails;

