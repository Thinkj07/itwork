import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { jobAPI, applicationAPI } from '../../services/api';
import { FiMail, FiPhone, FiUser, FiFileText, FiArrowLeft } from 'react-icons/fi';
import './Applicants.css';

const Applicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const fetchData = async () => {
    try {
      const [jobData, applicationsData] = await Promise.all([
        jobAPI.getJob(jobId),
        applicationAPI.getJobApplications(jobId)
      ]);

      setJob(jobData.data);
      setApplications(applicationsData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await applicationAPI.updateStatus(applicationId, { status: newStatus });
      setApplications(applications.map(app =>
        app._id === applicationId ? { ...app, status: newStatus } : app
      ));
      alert('Cập nhật trạng thái thành công! Ứng viên sẽ nhận được thông báo.');
    } catch (error) {
      alert('Cập nhật thất bại. Vui lòng thử lại.');
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

  return (
    <div className="applicants-page">
      <Header />

      <div className="container">
        <div className="page-header-section">
          <button onClick={() => navigate(-1)} className="back-btn">
            <FiArrowLeft style={{ marginBottom: '2px' }} /> Quay lại
          </button>
          <h1>{job?.title}</h1>
          <p className="job-subtitle">Danh sách ứng viên ({applications.length})</p>
        </div>

        <div className="applicants-layout">
          <div className="applicants-list">
            {applications.length > 0 ? (
              applications.map(application => (
                <div
                  key={application._id}
                  className={`applicant-card ${selectedApplicant?._id === application._id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedApplicant(prev =>
                      prev?._id === application._id ? null : application
                    );
                  }}
                >
                  <div className="applicant-header">
                    <div className="applicant-avatar">
                      {application.candidate?.avatar ? (
                        <img src={application.candidate.avatar} alt={application.candidate.fullName} />
                      ) : (
                        <FiUser size={24} />
                      )}
                    </div>
                    <div className="applicant-info">
                      <h4>{application.candidate?.fullName || 'Nguyễn Lyy'}</h4>
                      <p>{application.candidate?.email || 'can@gmail.com'}</p>
                    </div>
                  </div>

                  <div className="applicant-date">
                    Ngày nộp: {new Date(application.appliedAt).toLocaleDateString('vi-VN')}
                  </div>

                  <div className="applicant-status">
                    <select
                      value={application.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusChange(application._id, e.target.value);
                      }}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="interview">Interview</option>
                      <option value="rejected">Rejected</option>
                      <option value="hired">Hired</option>
                    </select>
                  </div>

                  <div className="applicant-actions">
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        const cvUrl = application.cvUrl || application.candidate?.cvUrl;
                        if (cvUrl) {
                          window.open(cvUrl, '_blank');
                        } else {
                          alert('Ứng viên chưa cập nhật CV');
                        }
                      }}
                    >
                      Xem CV
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-applicants">
                <FiFileText size={64} color="#9ca3af" />
                <h3>Chưa có ứng viên</h3>
                <p>Chưa có ai ứng tuyển vào vị trí này</p>
              </div>
            )}
          </div>

          {selectedApplicant && (
            <div className="applicant-detail-panel">
              <h2>Chi tiết ứng viên</h2>

              <div className="detail-section">
                <h3>Thông tin cá nhân</h3>
                <div className="detail-item">
                  <FiUser />
                  <span>{selectedApplicant.candidate?.fullName}</span>
                </div>
                <div className="detail-item">
                  <FiMail />
                  <span>{selectedApplicant.candidate?.email}</span>
                </div>
                <div className="detail-item">
                  <FiPhone />
                  <span>{selectedApplicant.candidate?.phone || 'Chưa cập nhật'}</span>
                </div>
              </div>

              {selectedApplicant.coverLetter && (
                <div className="detail-section">
                  <h3>Cover Letter</h3>
                  <p>{selectedApplicant.coverLetter}</p>
                </div>
              )}

              <div className="detail-section">
                <h3>CV</h3>
                {(selectedApplicant.cvUrl || selectedApplicant.candidate?.cvUrl) ? (
                  <a 
                    href={selectedApplicant.cvUrl || selectedApplicant.candidate?.cvUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    Xem CV
                  </a>
                ) : (
                  <p style={{color: '#9ca3af'}}>Ứng viên chưa cập nhật CV</p>
                )}
              </div>

              <div className="detail-section">
                <h3>Kỹ năng</h3>
                <div className="skills-list">
                  {selectedApplicant.candidate?.skills?.length > 0 ? (
                    selectedApplicant.candidate.skills.map((skill, index) => (
                      <span key={index} className="skill-badge">{skill}</span>
                    ))
                  ) : (
                    <p style={{color: '#9ca3af'}}>Chưa cập nhật kỹ năng</p>
                  )}
                </div>
              </div>

              {selectedApplicant.candidate?.education?.length > 0 && (
                <div className="detail-section">
                  <h3>Học vấn</h3>
                  {selectedApplicant.candidate.education.map((edu, index) => (
                    <div key={index} style={{marginBottom: '15px'}}>
                      <h4 style={{fontSize: '16px', marginBottom: '5px'}}>{edu.school}</h4>
                      <p style={{color: '#6b7280', marginBottom: '3px'}}>
                        {edu.degree} - {edu.field}
                      </p>
                      <p style={{color: '#9ca3af', fontSize: '14px'}}>
                        {edu.startDate && new Date(edu.startDate).getFullYear()} - {edu.endDate && new Date(edu.endDate).getFullYear()}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {selectedApplicant.candidate?.experience?.length > 0 && (
                <div className="detail-section">
                  <h3>Kinh nghiệm</h3>
                  {selectedApplicant.candidate.experience.map((exp, index) => (
                    <div key={index} style={{marginBottom: '15px'}}>
                      <h4 style={{fontSize: '16px', marginBottom: '5px'}}>{exp.position}</h4>
                      <p style={{color: '#6b7280', marginBottom: '3px'}}>{exp.company}</p>
                      <p style={{color: '#9ca3af', fontSize: '14px'}}>
                        {exp.startDate && new Date(exp.startDate).toLocaleDateString('vi-VN')} - {exp.isCurrent ? 'Hiện tại' : exp.endDate && new Date(exp.endDate).toLocaleDateString('vi-VN')}
                      </p>
                      {exp.description && <p style={{marginTop: '8px'}}>{exp.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Applicants;

