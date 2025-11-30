import React from 'react';
import { FiStar, FiUser, FiCalendar } from 'react-icons/fi';
import './ReviewCard.css';

const ReviewCard = ({ review }) => {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={i < rating ? 'star filled' : 'star'}
        size={16}
      />
    ));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderRatingBar = (label, value) => {
    if (!value) return null;
    return (
      <div className="rating-bar-item">
        <span className="rating-label">{label}:</span>
        <div className="rating-bar">
          <div className="rating-bar-fill" style={{ width: `${(value / 5) * 100}%` }}></div>
        </div>
        <span className="rating-value">{value}/5</span>
      </div>
    );
  };

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="reviewer-info">
          <div className="reviewer-avatar">
            {review.isAnonymous ? (
              <FiUser size={24} />
            ) : review.candidate?.avatar ? (
              <img src={review.candidate.avatar} alt={review.candidate.fullName} />
            ) : (
              <FiUser size={24} />
            )}
          </div>
          <div className="reviewer-details">
            <h4 className="reviewer-name">
              {review.isAnonymous ? 'Người dùng ẩn danh' : (review.candidate?.fullName || 'Người dùng')}
            </h4>
            <div className="review-rating">
              {renderStars(review.rating)}
              <span className="rating-number">{review.rating}/5</span>
            </div>
          </div>
        </div>
        <div className="review-date">
          <FiCalendar size={14} />
          <span>{formatDate(review.createdAt)}</span>
        </div>
      </div>

      <div className="review-content">
        <h3 className="review-title">{review.title}</h3>
        <p className="review-comment">{review.comment}</p>

        {(review.pros || review.cons) && (
          <div className="review-pros-cons">
            {review.pros && (
              <div className="pros-cons-item pros">
                <strong>Điểm mạnh:</strong>
                <p>{review.pros}</p>
              </div>
            )}
            {review.cons && (
              <div className="pros-cons-item cons">
                <strong>Điểm yếu:</strong>
                <p>{review.cons}</p>
              </div>
            )}
          </div>
        )}

        {(review.workEnvironment || review.salary || review.benefits || review.management) && (
          <div className="review-details">
            {renderRatingBar('Môi trường làm việc', review.workEnvironment)}
            {renderRatingBar('Lương thưởng', review.salary)}
            {renderRatingBar('Phúc lợi', review.benefits)}
            {renderRatingBar('Quản lý', review.management)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;

