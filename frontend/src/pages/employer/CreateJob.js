import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { jobAPI } from '../../services/api';
import './CreateJob.css';

const CreateJob = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    benefits: '',
    category: 'Frontend',
    skills: [],
    salaryFrom: '',
    salaryTo: '',
    jobType: 'Full-time',
    workMode: 'On-site',
    city: '',
    experienceLevel: 'Junior'
  });
  const [skillInput, setSkillInput] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const jobData = {
        ...formData,
        location: { city: formData.city },
        salaryFrom: parseInt(formData.salaryFrom) * 1000000 || 0,
        salaryTo: parseInt(formData.salaryTo) * 1000000 || 0
      };

      await jobAPI.createJob(jobData);
      alert('Đăng tin thành công!');
      navigate('/employer/dashboard');
    } catch (error) {
      alert('Đăng tin thất bại: ' + (error.message || ''));
    }
  };

  return (
    <div className="create-job-page">
      <Header />

      <div className="container">
        <div className="page-header-section">
          <button onClick={() => navigate(-1)} className="back-btn">
            ← Quay lại
          </button>
          <h1>Đăng tin mới</h1>
        </div>

        <form onSubmit={handleSubmit} className="job-form">
          <div className="card">
            <h2>Thông tin cơ bản</h2>

            <div className="form-group">
              <label>Tiêu đề công việc *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Loại công việc</label>
                <select name="jobType" value={formData.jobType} onChange={handleChange} className="form-select">
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div className="form-group">
                <label>Chế độ làm việc</label>
                <select name="workMode" value={formData.workMode} onChange={handleChange} className="form-select">
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Địa điểm</label>
              <input
                type="text"
                name="city"
                placeholder="Select location"
                value={formData.city}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Mức lương từ (VND)</label>
                <input
                  type="number"
                  name="salaryFrom"
                  value={formData.salaryFrom}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Triệu VNĐ"
                />
              </div>

              <div className="form-group">
                <label>Mức lương đến (VND)</label>
                <input
                  type="number"
                  name="salaryTo"
                  value={formData.salaryTo}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Triệu VNĐ"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h2>Danh mục & Kỹ năng</h2>

            <div className="form-group">
              <label>Danh mục *</label>
              <select name="category" value={formData.category} onChange={handleChange} className="form-select">
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

            <div className="form-group">
              <label>Kỹ năng</label>
              <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={handleSkillKeyPress}
                  className="form-input"
                  placeholder="Nhập kỹ năng..."
                  style={{flex: 1}}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="btn btn-primary"
                  style={{padding: '10px 20px', minWidth: '50px'}}
                >
                  +
                </button>
              </div>
              {formData.skills.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  marginTop: '15px'
                }}>
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      style={{
                        position: 'relative',
                        background: '#e0f2fe',
                        color: '#0369a1',
                        padding: '8px 30px 8px 12px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Trình độ kinh nghiệm</label>
              <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className="form-select">
                <option value="Intern">Intern</option>
                <option value="Fresher">Fresher</option>
                <option value="Junior">Junior</option>
                <option value="Middle">Middle</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
              </select>
            </div>
          </div>

          <div className="card">
            <h2>Mô tả công việc</h2>

            <div className="form-group">
              <label>Mô tả *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
                rows="8"
                required
              />
            </div>

            <div className="form-group">
              <label>Yêu cầu *</label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                className="form-textarea"
                rows="8"
                required
              />
            </div>

            <div className="form-group">
              <label>Quyền lợi</label>
              <textarea
                name="benefits"
                value={formData.benefits}
                onChange={handleChange}
                className="form-textarea"
                rows="6"
              />
            </div>
          </div>

          <div className="form-actions-bottom">
            <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              Đăng tin
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default CreateJob;

