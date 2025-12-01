import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import JobCard from '../../components/JobCard';
import { userAPI } from '../../services/api';
import { FiBookmark } from 'react-icons/fi';
import './SavedJobs.css';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const data = await userAPI.getSavedJobs();
      setSavedJobs(data.data || []);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveJob = async (jobId) => {
    try {
      await userAPI.toggleSaveJob(jobId);
      setSavedJobs(savedJobs.filter(job => job._id !== jobId));
    } catch (error) {
      console.error('Error unsaving job:', error);
    }
  };

  return (
    <div className="saved-jobs-page">
      <Header />

      <div className="container">
        <div className="page-title">
          <h1>Việc đã lưu</h1>
          <p>Các công việc bạn đã lưu để xem sau</p>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : savedJobs.length > 0 ? (
          <div className="jobs-grid">
            {savedJobs.map(job => (
              <JobCard
                key={job._id}
                job={job}
                onSave={handleUnsaveJob}
                isSaved={true}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FiBookmark size={64} color="#9ca3af" />
            <h3>Chưa có việc làm đã lưu</h3>
            <p>Lưu các công việc yêu thích để xem lại sau</p>
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

export default SavedJobs;

