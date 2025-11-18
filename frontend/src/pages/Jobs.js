import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import JobCard from '../components/JobCard';
import { jobAPI, userAPI } from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { FiFilter } from 'react-icons/fi';
import './Jobs.css';

const Jobs = () => {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);
  const { isAuthenticated, user } = useAuthStore();
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    jobType: '',
    experienceLevel: ''
  });

  useEffect(() => {
    fetchJobs();
    if (isAuthenticated && user?.role === 'candidate') {
      fetchSavedJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await jobAPI.getJobs(filters);
      setJobs(data.data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const data = await userAPI.getSavedJobs();
      setSavedJobs(data.data.map(job => job._id));
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    }
  };

  const handleSaveJob = async (jobId) => {
    try {
      await userAPI.toggleSaveJob(jobId);
      if (savedJobs.includes(jobId)) {
        setSavedJobs(savedJobs.filter(id => id !== jobId));
      } else {
        setSavedJobs([...savedJobs, jobId]);
      }
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="jobs-page">
      <Header />
      
      <div className="container-wide">
        <div className="jobs-layout">
          {/* Filters Sidebar */}
          <aside className="filters-sidebar">
            <div className="filter-header">
              <FiFilter />
              <h3>Filter Jobs</h3>
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select name="category" value={filters.category} onChange={handleFilterChange}>
                <option value="">All Categories</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Mobile">Mobile</option>
                <option value="AI / Data">AI / Data</option>
                <option value="DevOps">DevOps</option>
                <option value="QA / Tester">QA / Tester</option>
                <option value="Product Manager">Product Manager</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Job Type</label>
              <select name="jobType" value={filters.jobType} onChange={handleFilterChange}>
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Remote">Remote</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Experience Level</label>
              <select name="experienceLevel" value={filters.experienceLevel} onChange={handleFilterChange}>
                <option value="">All Levels</option>
                <option value="Intern">Intern</option>
                <option value="Fresher">Fresher</option>
                <option value="Junior">Junior</option>
                <option value="Middle">Middle</option>
                <option value="Senior">Senior</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                placeholder="TP. Hồ Chí Minh"
                value={filters.location}
                onChange={handleFilterChange}
              />
            </div>
          </aside>

          {/* Jobs List */}
          <main className="jobs-content">
            <div className="jobs-header">
              <h2>
                {loading ? 'Đang tải...' : `${jobs.length} việc làm`}
                {filters.search && ` cho "${filters.search}"`}
              </h2>
            </div>

            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
              </div>
            ) : jobs.length > 0 ? (
              <div className="jobs-list">
                {jobs.map(job => (
                  <JobCard
                    key={job._id}
                    job={job}
                    onSave={isAuthenticated && user?.role === 'candidate' ? handleSaveJob : null}
                    isSaved={savedJobs.includes(job._id)}
                  />
                ))}
              </div>
            ) : (
              <div className="no-results">
                <h3>Không tìm thấy việc làm phù hợp</h3>
                <p>Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Jobs;

