import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import JobCard from '../components/JobCard';
import ReviewsList from '../components/ReviewsList';
import CreateReviewModal from '../components/CreateReviewModal';
import { companyAPI, applicationAPI, reviewAPI } from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { FiMapPin, FiUsers, FiGlobe, FiStar, FiEdit3 } from 'react-icons/fi';
import { formatWebsiteUrl } from '../utils/url';
import './CompanyProfile.css';

const CompanyProfile = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');
  const [showCreateReviewModal, setShowCreateReviewModal] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [hiredJobId, setHiredJobId] = useState(null);
  const [reviewsKey, setReviewsKey] = useState(0);


  useEffect(() => {
    fetchCompanyProfile();
    if (isAuthenticated && user?.role === 'candidate') {
      checkCanReview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated, user]);

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

  const checkCanReview = async () => {
    try {
      // Check if user has been hired by this company
      const applicationsData = await applicationAPI.getMyApplications();
      const applications = applicationsData.data || [];
      
      const hiredApplication = applications.find(
        app => app.company?._id === id && app.status === 'hired'
      );
      
      if (hiredApplication) {
        setCanReview(true);
        setHiredJobId(hiredApplication.job?._id || null);
        
        // Check if user has already reviewed this company
        try {
          const myReviewsData = await reviewAPI.getMyReviews();
          const myReviews = myReviewsData.data || [];
          const existingReview = myReviews.find(
            review => review.company?._id === id || review.company === id
          );
          
          if (existingReview) {
            setHasReviewed(true);
          }
        } catch (error) {
          console.error('Error checking existing review:', error);
        }
      }
    } catch (error) {
      console.error('Error checking can review:', error);
    }
  };

  const handleReviewSuccess = () => {
    setHasReviewed(true);
    // Refresh reviews list by updating key
    setReviewsKey(prev => prev + 1);
    // Also refresh company profile to update stats
    if (companyData) {
      fetchCompanyProfile();
    }
  };

  const handleStatsUpdate = (stats) => {
    // Update companyData with new stats
    if (companyData) {
      setCompanyData(prev => ({
        ...prev,
        avgRating: stats.avgRating,
        reviews: prev.reviews || []
      }));
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
                  <FiMapPin color="white" style={{ marginBottom: '2px' }}/>
                  <span>{company.companyAddress || 'Location not provided'}</span>
                </div>
                {company.companyWebsite && (
                  <div className="meta-item">
                    <FiGlobe color="white" style={{ marginBottom: '2px' }}/>
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
                  <FiUsers color="white" style={{ marginBottom: '2px' }}/>
                  <span>{company.companySize || '—'} Size</span>
                </div>
                {reviews.length > 0 && (
                  <div className="meta-item">
                    <FiStar color="white" style={{ marginBottom: '2px' }}/>
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
            <button
              className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({reviews.length})
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

          {activeTab === 'reviews' && (
            <div className="reviews-section">
              {canReview && !hasReviewed && (
                <div className="review-action-bar">
                  <button
                    onClick={() => setShowCreateReviewModal(true)}
                    className="btn btn-primary"
                  >
                    <FiEdit3 size={18} style={{ marginRight: '8px' }} />
                    Viết đánh giá
                  </button>
                </div>
              )}
              {hasReviewed && (
                <div className="review-notice">
                  <p>Bạn đã đánh giá công ty này rồi</p>
                </div>
              )}
              <ReviewsList 
                key={reviewsKey}
                companyId={id} 
                onStatsUpdate={handleStatsUpdate}
              />
            </div>
          )}
        </div>
      </div>

      {/* Create Review Modal */}
      {showCreateReviewModal && (
        <CreateReviewModal
          isOpen={showCreateReviewModal}
          onClose={() => setShowCreateReviewModal(false)}
          companyId={id}
          companyName={company.companyName}
          jobId={hiredJobId}
          onSuccess={handleReviewSuccess}
        />
      )}

      <Footer />
    </div>
  );
};

export default CompanyProfile;

