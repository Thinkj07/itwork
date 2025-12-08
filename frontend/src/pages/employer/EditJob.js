import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { jobAPI } from '../../services/api';
import './CreateJob.css';
import { FiArrowLeft } from 'react-icons/fi';

const EditJob = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchJobDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const response = await jobAPI.getJob(jobId);
      const job = response.data;
      
      setFormData({
        title: job.title || '',
        description: job.description || '',
        requirements: job.requirements || '',
        benefits: job.benefits || '',
        category: job.category || 'Frontend',
        skills: job.skills || [],
        salaryFrom: job.salaryFrom ? job.salaryFrom / 1000000 : '',
        salaryTo: job.salaryTo ? job.salaryTo / 1000000 : '',
        jobType: job.jobType || 'Full-time',
        workMode: job.workMode || 'On-site',
        city: job.location?.city || '',
        experienceLevel: job.experienceLevel || 'Junior'
      });
    } catch (error) {
      alert('Không thể tải thông tin công việc');
      navigate('/employer/jobs');
    } finally {
      setLoading(false);
    }
  };

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

      await jobAPI.updateJob(jobId, jobData);
      alert('Cập nhật tin thành công!');
      navigate('/employer/jobs');
    } catch (error) {
      alert('Cập nhật thất bại: ' + (error.message || ''));
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

  return (
    <div className="create-job-page">
      <Header />

      <div className="container">
        <div className="page-header-section">
          <button onClick={() => navigate(-1)} className="back-btn">
            <FiArrowLeft style={{ marginBottom: '0px' }} /> Quay lại
          </button>
          <h1>Edit Job</h1>
        </div>

        <form onSubmit={handleSubmit} className="job-form">
          <div className="card">
            <h2>Basic Information</h2>

            <div className="form-group">
              <label>Job Title *</label>
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
                <label>Job Type</label>
                <select name="jobType" value={formData.jobType} onChange={handleChange} className="form-select">
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div className="form-group">
                <label>Work Mode</label>
                <select name="workMode" value={formData.workMode} onChange={handleChange} className="form-select">
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Location</label>
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
                <label>Salary From (VND)</label>
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
                <label>Salary To (VND)</label>
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
            <h2>Category & Skills</h2>

            <div className="form-group">
              <label>Category *</label>
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
              <label>Skills</label>
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
              <label>Experience Level</label>
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
            <h2>Job Description</h2>

            <div className="form-group">
              <label>Description *</label>
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
              <label>Requirements *</label>
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
              <label>Benefits</label>
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
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Cập nhật
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default EditJob;

