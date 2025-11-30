import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import JobCard from '../components/JobCard';
import { companyAPI } from '../services/api';
import { FiMapPin, FiUsers, FiGlobe, FiStar } from 'react-icons/fi';
import { formatWebsiteUrl } from '../utils/url';
import './CompanyProfile.css';

const CompanyProfile = () => {
  const { id } = useParams();
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');


  useEffect(() => {
    fetchCompanyProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCompanyProfile = async () => {
    try {
      const data = await companyAPI.getCompany(id);
      setCompanyData(data.data);
    } catch (error) {
      console.error('Error fetching company:', error);
    } finally {
      setLoading(false);
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

  if (!companyData) {
    return (
      <div>
        <Header />
        <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
          <h2>Không tìm thấy công ty</h2>
        </div>
      </div>
    );
  }

  const { company, jobs, reviews, avgRating } = companyData;

  return (
    <div className="company-profile-page">
      <Header />

      {/* Company Header */}
      <div className="company-header">
        <div className="container">
          <div className="company-header-content">
            <div className="company-logo-xl">
              {company.companyLogo ? (
                <img src={company.companyLogo} alt={company.companyName} />
              ) : (
                <div className="logo-placeholder">{company.companyName?.charAt(0)}</div>
              )}
            </div>
            <div className="company-header-info">
              <h1>{company.companyName}</h1>
              <p className="company-tagline">{company.industry}</p>
              <div className="company-meta">
                <div className="meta-item">
                  <FiMapPin color="white"/>
                  <span>{company.companyAddress || 'Location not provided'}</span>
                </div>
                {company.companyWebsite && (
                  <div className="meta-item">
                    <FiGlobe color="white"/>
                    <a 
                      href={formatWebsiteUrl(company.companyWebsite)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {company.companyWebsite}
                    </a>
                  </div>
                )}
                <div className="meta-item">
                  <FiUsers color="white"/>
                  <span>{company.companySize || '—'} Size</span>
                </div>
                {reviews.length > 0 && (
                  <div className="meta-item">
                    <FiStar color="white"/>
                    <span>{avgRating} ({reviews.length} reviews)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="company-tabs">
        <div className="container">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              About
            </button>
            <button
              className={`tab ${activeTab === 'jobs' ? 'active' : ''}`}
              onClick={() => setActiveTab('jobs')}
            >
              Open Positions ({jobs.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container">
        <div className="company-content">
          {activeTab === 'about' && (
            <div className="about-section">
              <div className="card">
                <h2>About {company.companyName}</h2>
                <p className="company-description">
                  {company.companyDescription || 'Công ty FPT'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="jobs-section">
              {jobs.length > 0 ? (
                <div className="jobs-list">
                  {jobs.map(job => (
                    <JobCard key={job._id} job={{ ...job, company }} />
                  ))}
                </div>
              ) : (
                <div className="no-jobs">
                  <p>Công ty hiện không có vị trí tuyển dụng nào</p>
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

export default CompanyProfile;

