import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { jobAPI } from '../../services/api';
import { FiEdit, FiTrash2, FiEye, FiUsers } from 'react-icons/fi';
import './ManageJobs.css';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await jobAPI.getMyJobs();
      setJobs(data.data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Bạn có chắc muốn xóa tin tuyển dụng này?')) {
      try {
        await jobAPI.deleteJob(jobId);
        setJobs(jobs.filter(job => job._id !== jobId));
        alert('Xóa thành công');
      } catch (error) {
        alert('Xóa thất bại');
      }
    }
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
              <div key={job._id} className="job-manage-card">
                <div className="job-manage-header">
                  <h3>{job.title}</h3>
                  <span className={`badge ${job.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                    {job.status.toUpperCase()}
                  </span>
                </div>

                <div className="job-manage-meta">
                  <span><strong>Category:</strong> {job.category}</span>
                  <span><strong>Location:</strong> {job.location?.city || 'Remote'}</span>
                  <span><strong>Type:</strong> {job.jobType}</span>
                </div>

                <div className="job-manage-stats">
                  <div className="stat-badge">
                    <FiUsers /> {job.applicationCount} ứng viên
                  </div>
                  <div className="stat-badge">
                    <FiEye /> {job.views} lượt xem
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
                  <button onClick={() => handleDelete(job._id)} className="btn btn-sm btn-outline danger">
                    <FiTrash2 /> Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ManageJobs;

