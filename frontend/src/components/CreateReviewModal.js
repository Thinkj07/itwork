import React, { useState } from 'react';
import { reviewAPI } from '../services/api';
import { FiStar, FiX } from 'react-icons/fi';
import './CreateReviewModal.css';

const CreateReviewModal = ({ isOpen, onClose, companyId, companyName, jobId, onSuccess }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    pros: '',
    cons: '',
    workEnvironment: 0,
    salary: 0,
    benefits: 0,
    management: 0,
    isAnonymous: false
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleCategoryRatingClick = (category, rating) => {
    setFormData(prev => ({ ...prev, [category]: rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.rating || formData.rating === 0) {
      setError('Vui lòng chọn điểm đánh giá tổng thể');
      return;
    }

    if (!formData.title.trim()) {
      setError('Vui lòng nhập tiêu đề đánh giá');
      return;
    }

    if (!formData.comment.trim()) {
      setError('Vui lòng nhập nội dung đánh giá');
      return;
    }

    setSubmitting(true);

    try {
      const reviewData = {
        companyId,
        jobId: jobId || null,
        rating: parseInt(formData.rating),
        title: formData.title.trim(),
        comment: formData.comment.trim(),
        pros: formData.pros.trim() || null,
        cons: formData.cons.trim() || null,
        workEnvironment: formData.workEnvironment > 0 ? parseInt(formData.workEnvironment) : null,
        salary: formData.salary > 0 ? parseInt(formData.salary) : null,
        benefits: formData.benefits > 0 ? parseInt(formData.benefits) : null,
        management: formData.management > 0 ? parseInt(formData.management) : null,
        isAnonymous: formData.isAnonymous
      };

      await reviewAPI.createReview(reviewData);
      
      // Reset form
      setFormData({
        rating: 0,
        title: '',
        comment: '',
        pros: '',
        cons: '',
        workEnvironment: 0,
        salary: 0,
        benefits: 0,
        management: 0,
        isAnonymous: false
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tạo đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarRating = (currentRating, onRatingClick, hovered = 0) => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      const isFilled = starValue <= (hovered || currentRating);
      
      return (
        <button
          key={i}
          type="button"
          className={`star-button ${isFilled ? 'filled' : ''}`}
          onClick={() => onRatingClick(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
        >
          <FiStar size={24} />
        </button>
      );
    });
  };

  const renderCategoryRating = (category, label, currentRating) => {
    return (
      <div className="category-rating">
        <label className="category-label">{label}</label>
        <div className="category-stars">
          {Array.from({ length: 5 }, (_, i) => {
            const starValue = i + 1;
            const isFilled = starValue <= currentRating;
            
            return (
              <button
                key={i}
                type="button"
                className={`star-button small ${isFilled ? 'filled' : ''}`}
                onClick={() => handleCategoryRatingClick(category, starValue)}
              >
                <FiStar size={18} />
              </button>
            );
          })}
          {currentRating > 0 && (
            <span className="category-rating-value">{currentRating}/5</span>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Đánh giá {companyName}</h2>
          <button type="button" className="close-button" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Overall Rating */}
          <div className="form-group">
            <label className="form-label required">
              Đánh giá tổng thể <span className="required-mark">*</span>
            </label>
            <div className="rating-input">
              {renderStarRating(formData.rating, handleRatingClick, hoveredRating)}
              {formData.rating > 0 && (
                <span className="rating-text">{formData.rating}/5</span>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label required">
              Tiêu đề đánh giá <span className="required-mark">*</span>
            </label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="Ví dụ: Môi trường làm việc tuyệt vời"
              value={formData.title}
              onChange={handleChange}
              maxLength={200}
              required
            />
          </div>

          {/* Comment */}
          <div className="form-group">
            <label className="form-label required">
              Nội dung đánh giá <span className="required-mark">*</span>
            </label>
            <textarea
              name="comment"
              className="form-textarea"
              placeholder="Chia sẻ trải nghiệm của bạn về công ty này..."
              value={formData.comment}
              onChange={handleChange}
              rows={6}
              maxLength={2000}
              required
            />
            <div className="char-count">
              {formData.comment.length}/2000 ký tự
            </div>
          </div>

          {/* Pros */}
          <div className="form-group">
            <label className="form-label">Điểm mạnh (tùy chọn)</label>
            <textarea
              name="pros"
              className="form-textarea"
              placeholder="Những điều bạn thích về công ty..."
              value={formData.pros}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* Cons */}
          <div className="form-group">
            <label className="form-label">Điểm yếu (tùy chọn)</label>
            <textarea
              name="cons"
              className="form-textarea"
              placeholder="Những điều cần cải thiện..."
              value={formData.cons}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* Category Ratings */}
          <div className="form-group">
            <label className="form-label">Đánh giá chi tiết (tùy chọn)</label>
            <div className="category-ratings">
              {renderCategoryRating('workEnvironment', 'Môi trường làm việc', formData.workEnvironment)}
              {renderCategoryRating('salary', 'Lương thưởng', formData.salary)}
              {renderCategoryRating('benefits', 'Phúc lợi', formData.benefits)}
              {renderCategoryRating('management', 'Quản lý', formData.management)}
            </div>
          </div>

          {/* Anonymous */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleChange}
              />
              <span>Đánh giá ẩn danh</span>
            </label>
            <p className="help-text">
              Tên của bạn sẽ không được hiển thị trong đánh giá này
            </p>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReviewModal;

