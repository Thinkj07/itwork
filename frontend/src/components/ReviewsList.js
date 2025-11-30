import React, { useState, useEffect } from 'react';
import { reviewAPI } from '../services/api';
import ReviewCard from './ReviewCard';
import { FiStar } from 'react-icons/fi';
import './ReviewsList.css';

const ReviewsList = ({ companyId, onStatsUpdate }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewAPI.getCompanyReviews(companyId);
      setReviews(data.data || []);
      setStats(data.stats || null);
      
      // Notify parent component about stats update
      if (onStatsUpdate && data.stats) {
        onStatsUpdate(data.stats);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="stars-display">
        {Array.from({ length: 5 }, (_, i) => {
          if (i < fullStars) {
            return <FiStar key={i} className="star filled" size={20} />;
          } else if (i === fullStars && hasHalfStar) {
            return <FiStar key={i} className="star half" size={20} />;
          } else {
            return <FiStar key={i} className="star" size={20} />;
          }
        })}
        <span className="rating-text">{parseFloat(rating).toFixed(1)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="reviews-list-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="reviews-list">
      {/* Stats Section */}
      {stats && stats.totalReviews > 0 && (
        <div className="reviews-stats">
          <div className="stats-header">
            <h3>Đánh giá tổng quan</h3>
            <div className="overall-rating">
              {renderStars(parseFloat(stats.avgRating))}
              <p className="total-reviews">{stats.totalReviews} đánh giá</p>
            </div>
          </div>

          {stats.avgWorkEnvironment || stats.avgSalary || stats.avgBenefits || stats.avgManagement ? (
            <div className="stats-details">
              <h4>Đánh giá chi tiết</h4>
              <div className="stats-grid">
                {stats.avgWorkEnvironment && (
                  <div className="stat-item">
                    <span className="stat-label">Môi trường làm việc</span>
                    <div className="stat-rating">
                      {renderStars(parseFloat(stats.avgWorkEnvironment))}
                    </div>
                  </div>
                )}
                {stats.avgSalary && (
                  <div className="stat-item">
                    <span className="stat-label">Lương thưởng</span>
                    <div className="stat-rating">
                      {renderStars(parseFloat(stats.avgSalary))}
                    </div>
                  </div>
                )}
                {stats.avgBenefits && (
                  <div className="stat-item">
                    <span className="stat-label">Phúc lợi</span>
                    <div className="stat-rating">
                      {renderStars(parseFloat(stats.avgBenefits))}
                    </div>
                  </div>
                )}
                {stats.avgManagement && (
                  <div className="stat-item">
                    <span className="stat-label">Quản lý</span>
                    <div className="stat-rating">
                      {renderStars(parseFloat(stats.avgManagement))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Reviews List */}
      <div className="reviews-content">
        <div className="reviews-header">
          <h3>
            {reviews.length > 0 
              ? `${reviews.length} đánh giá` 
              : 'Chưa có đánh giá nào'}
          </h3>
        </div>

        {reviews.length > 0 ? (
          <div className="reviews-grid">
            {reviews.map(review => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        ) : (
          <div className="no-reviews">
            <FiStar size={64} color="#D1D5DB" />
            <h4>Chưa có đánh giá nào</h4>
            <p>Hãy là người đầu tiên đánh giá công ty này</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsList;

