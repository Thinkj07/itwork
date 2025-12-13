import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { 
  FiSearch, FiFilter, FiCheckCircle, FiXCircle, FiTrash2, FiEye,
  FiChevronLeft, FiChevronRight, FiBriefcase
} from 'react-icons/fi';
import './JobModeration.css';

const JobModeration = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const limit = 10;

  // Modal
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const categories = [
    'Frontend', 'Backend', 'Mobile', 'AI / Data', 'DevOps', 
    'QA / Tester', 'Product Manager', 'Finance / Accounting', 'Marketing', 'Other'
  ];

  useEffect(() => {
    fetchJobs();
  }, [currentPage, statusFilter, categoryFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit,
        status: statusFilter,
        category: categoryFilter,
        search: search
      };

      const response = await adminAPI.getJobs(params);
      setJobs(response.data);
      setTotalPages(response.pagination.pages);
      setTotalJobs(response.pagination.total);
      setError(null);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchJobs();
  };

  const handleApproveJob = async (jobId) => {
    if (!window.confirm('Bạn có chắc muốn duyệt job này?')) {
      return;
    }

    try {
      setActionLoading(true);
      await adminAPI.updateJobStatus(jobId, { 
        status: 'active',
        reason: 'Approved by admin'
      });
      fetchJobs();
      alert('Đã duyệt job thành công');
    } catch (err) {
      alert(err.message || 'Có lỗi xảy ra');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectJob = async (jobId) => {
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason) return;

    try {
      setActionLoading(true);
      await adminAPI.updateJobStatus(jobId, { 
        status: 'closed',
        reason 
      });
      fetchJobs();
      alert('Đã từ chối job thành công');
    } catch (err) {
      alert(err.message || 'Có lỗi xảy ra');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Bạn có chắc muốn xóa job này? Hành động này không thể hoàn tác!')) {
      return;
    }

    try {
      setActionLoading(true);
      const reason = prompt('Nhập lý do xóa:') || 'Violation of terms';
      await adminAPI.deleteJob(jobId, { reason });
      fetchJobs();
      alert('Đã xóa job thành công');
    } catch (err) {
      alert(err.message || 'Có lỗi xảy ra');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = async (jobId) => {
    try {
      const response = await adminAPI.getJobDetails(jobId);
      setSelectedJob(response.data);
      setShowDetailsModal(true);
    } catch (err) {
      alert(err.message || 'Không thể tải thông tin job');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'badge-active';
      case 'paused': return 'badge-paused';
      case 'closed': return 'badge-closed';
      default: return 'badge-default';
    }
  };

  const formatSalary = (job) => {
    if (job.salaryNegotiable) return 'Thỏa thuận';
    if (!job.salaryFrom && !job.salaryTo) return 'Không cung cấp';
    
    const currency = job.salaryCurrency === 'USD' ? '$' : 'VND';
    if (job.salaryFrom && job.salaryTo) {
      return `${job.salaryFrom.toLocaleString()} - ${job.salaryTo.toLocaleString()} ${currency}`;
    }
    return `${(job.salaryFrom || job.salaryTo).toLocaleString()} ${currency}`;
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải danh sách jobs...</p>
      </div>
    );
  }

  return (
    <div className="job-moderation">
      <div className="page-header">
        <div>
          <h1>Quản lý Jobs</h1>
          <p className="page-subtitle">Tổng số: {totalJobs} jobs</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <FiSearch />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề, mô tả..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-search">Tìm kiếm</button>
        </form>

        <div className="filter-group">
          <FiFilter />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
          </select>

          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}>
            <option value="all">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
          <button onClick={fetchJobs}>Thử lại</button>
        </div>
      )}

      {/* Jobs Table */}
      <div className="table-container">
        <table className="jobs-table">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Công ty</th>
              <th>Danh mục</th>
              <th>Lương</th>
              <th>Trạng thái</th>
              <th>Ngày đăng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job._id}>
                <td>
                  <div className="job-title-cell">
                    <FiBriefcase />
                    <span>{job.title}</span>
                  </div>
                </td>
                <td>
                  <div className="company-cell">
                    {job.company?.companyLogo && (
                      <img 
                        src={job.company.companyLogo} 
                        alt={job.company.companyName}
                        className="company-logo-tiny"
                      />
                    )}
                    <span>{job.company?.companyName || 'N/A'}</span>
                  </div>
                </td>
                <td>
                  <span className="badge badge-category">{job.category}</span>
                </td>
                <td className="salary-cell">{formatSalary(job)}</td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(job.status)}`}>
                    {job.status}
                  </span>
                </td>
                <td>{new Date(job.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon btn-view"
                      onClick={() => handleViewDetails(job._id)}
                      title="Xem chi tiết"
                    >
                      <FiEye />
                    </button>
                    
                    {job.status !== 'active' && (
                      <button
                        className="btn-icon btn-approve"
                        onClick={() => handleApproveJob(job._id)}
                        disabled={actionLoading}
                        title="Duyệt"
                      >
                        <FiCheckCircle />
                      </button>
                    )}
                    
                    {job.status === 'active' && (
                      <button
                        className="btn-icon btn-reject"
                        onClick={() => handleRejectJob(job._id)}
                        disabled={actionLoading}
                        title="Từ chối"
                      >
                        <FiXCircle />
                      </button>
                    )}
                    
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDeleteJob(job._id)}
                      disabled={actionLoading}
                      title="Xóa"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {jobs.length === 0 && !loading && (
          <div className="no-data">
            <p>Không tìm thấy job nào</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            <FiChevronLeft /> Trước
          </button>
          
          <span className="pagination-info">
            Trang {currentPage} / {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Sau <FiChevronRight />
          </button>
        </div>
      )}

      {/* Job Details Modal */}
      {showDetailsModal && selectedJob && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết Job</h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="job-detail-section">
                <h3>{selectedJob.title}</h3>
                <div className="job-meta">
                  <span className={`badge ${getStatusBadgeClass(selectedJob.status)}`}>
                    {selectedJob.status}
                  </span>
                  <span className="badge badge-category">{selectedJob.category}</span>
                  <span className="badge badge-level">{selectedJob.experienceLevel}</span>
                </div>
              </div>

              <div className="job-detail-grid">
                <div className="detail-item">
                  <label>Công ty:</label>
                  <span>{selectedJob.company?.companyName}</span>
                </div>

                <div className="detail-item">
                  <label>Email công ty:</label>
                  <span>{selectedJob.company?.email}</span>
                </div>

                <div className="detail-item">
                  <label>Mức lương:</label>
                  <span>{formatSalary(selectedJob)}</span>
                </div>

                <div className="detail-item">
                  <label>Loại công việc:</label>
                  <span>{selectedJob.jobType}</span>
                </div>

                <div className="detail-item">
                  <label>Hình thức:</label>
                  <span>{selectedJob.workMode}</span>
                </div>

                <div className="detail-item">
                  <label>Số lượt xem:</label>
                  <span>{selectedJob.views || 0}</span>
                </div>

                <div className="detail-item">
                  <label>Số đơn ứng tuyển:</label>
                  <span>{selectedJob.applicationCount || 0}</span>
                </div>

                <div className="detail-item">
                  <label>Ngày đăng:</label>
                  <span>{new Date(selectedJob.createdAt).toLocaleString('vi-VN')}</span>
                </div>
              </div>

              <div className="job-detail-section">
                <h4>Mô tả công việc</h4>
                <div className="job-description">
                  {selectedJob.description}
                </div>
              </div>

              <div className="job-detail-section">
                <h4>Yêu cầu</h4>
                <div className="job-description">
                  {selectedJob.requirements}
                </div>
              </div>

              {selectedJob.benefits && (
                <div className="job-detail-section">
                  <h4>Quyền lợi</h4>
                  <div className="job-description">
                    {selectedJob.benefits}
                  </div>
                </div>
              )}

              {selectedJob.skills && selectedJob.skills.length > 0 && (
                <div className="job-detail-section">
                  <h4>Kỹ năng yêu cầu</h4>
                  <div className="skills-list">
                    {selectedJob.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedJob.location && (
                <div className="job-detail-section">
                  <h4>Địa điểm làm việc</h4>
                  <p>
                    {selectedJob.location.address && `${selectedJob.location.address}, `}
                    {selectedJob.location.district && `${selectedJob.location.district}, `}
                    {selectedJob.location.city}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobModeration;
