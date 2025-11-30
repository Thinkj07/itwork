import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiDollarSign, FiBriefcase, FiClock, FiBookmark } from 'react-icons/fi';
import './JobCard.css';

const JobCard = ({ job, onSave, isSaved }) => {
  const formatSalary = (from, to, currency) => {
    if (!from && !to) return 'Thương lượng';
    const format = (num) => {
      return `${num / 1000000} triệu`;
    };
    if (!currency) currency = 'VND';
    if (from && to) {
      return `${format(from)} - ${format(to)} ${currency}`;
    }
    return `Từ ${format(from || to)} ${currency}`;
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      năm: 31536000,
      tháng: 2592000,
      tuần: 604800,
      ngày: 86400,
      giờ: 3600,
      phút: 60
    };

    for (const [name, value] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / value);
      if (interval >= 1) {
        return `${interval} ${name} trước`;
      }
    }
    return 'Vừa xong';
  };

  return (
    <div className="job-card">
      {onSave && (
        <button 
          className={`save-btn ${isSaved ? 'saved' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            onSave(job._id);
          }}
        >
          <FiBookmark />
        </button>
      )}
      
      <Link to={`/jobs/${job._id}`} className="job-card-link">
        <div className="job-card-header">
          <div className="company-logo">
            {job.company?.companyLogo ? (
              <img src={job.company.companyLogo} alt={job.company.companyName} />
            ) : (
              <div className="logo-placeholder">{job.company?.companyName?.charAt(0)}</div>
            )}
          </div>
          <div className="job-info">
            <h3 className="job-title">{job.title}</h3>
            <p className="company-name">{job.company?.companyName}</p>
          </div>
        </div>

        <div className="job-details">
          <div className="job-detail-item">
            <FiMapPin />
            <span>{job.location?.city || 'Chưa xác định'}</span>
          </div>
          <div className="job-detail-item">
            <FiDollarSign />
            <span>{formatSalary(job.salaryFrom, job.salaryTo, job.salaryCurrency)}</span>
          </div>
          <div className="job-detail-item">
            <FiBriefcase />
            <span>{job.experienceLevel}</span>
          </div>
        </div>

        <div className="job-skills">
          {job.skills?.slice(0, 3).map((skill, index) => (
            <span key={index} className="skill-tag">{skill}</span>
          ))}
          {job.skills?.length > 3 && (
            <span className="skill-tag more">+{job.skills.length - 3}</span>
          )}
        </div>

        <div className="job-footer">
          <div className="job-meta">
            <span className="badge badge-primary">{job.category}</span>
            <span className="job-time">
              <FiClock size={14} />
              {getTimeAgo(job.createdAt)}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default JobCard;

