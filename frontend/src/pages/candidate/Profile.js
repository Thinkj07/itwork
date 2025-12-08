import React, { useState, useEffect, useRef } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { userAPI, authAPI } from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import { FiEdit2, FiPlus, FiX, FiUpload, FiLink } from 'react-icons/fi';
import './Profile.css';

const CandidateProfile = () => {
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit states for each section
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  const [editingEducation, setEditingEducation] = useState(false);
  const [editingCV, setEditingCV] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);

  // Form data states
  const [avatarData, setAvatarData] = useState({ type: 'url', value: '' });
  const [contactData, setContactData] = useState({ email: '', phone: '' });
  const [educationData, setEducationData] = useState([]);
  const [cvData, setCvData] = useState({ type: 'url', value: '' });
  const [aboutData, setAboutData] = useState('');
  const [skillsData, setSkillsData] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  // File input refs
  const avatarFileRef = useRef(null);
  const cvFileRef = useRef(null);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await userAPI.getProfile(user.id);
      setProfile(data.data);
      setContactData({
        email: data.data.email || '',
        phone: data.data.phone || ''
      });
      setEducationData(data.data.education || []);
      setAboutData(data.data.bio || '');
      setSkillsData(data.data.skills || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Avatar handlers
  const handleAvatarSave = async () => {
    try {
      if (avatarData.type === 'file' && avatarFileRef.current?.files[0]) {
        const formData = new FormData();
        formData.append('avatar', avatarFileRef.current.files[0]);
        await userAPI.uploadAvatar(formData);
      } else if (avatarData.type === 'url' && avatarData.value) {
        const formData = new FormData();
        formData.append('avatarUrl', avatarData.value);
        await userAPI.uploadAvatar(formData);
      }
      await fetchProfile();
      // Refresh user data in store to update Header
      const updatedUser = await authAPI.getMe();
      setUser(updatedUser.data);
      setEditingAvatar(false);
      setAvatarData({ type: 'url', value: '' });
      alert('Cập nhật avatar thành công!');
    } catch (error) {
      alert('Cập nhật avatar thất bại: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  // Contact handlers
  const handleContactSave = async () => {
    try {
      await userAPI.updateProfile(contactData);
      await fetchProfile();
      // Refresh user data in store
      const updatedUser = await authAPI.getMe();
      setUser(updatedUser.data);
      setEditingContact(false);
      alert('Cập nhật thông tin liên hệ thành công!');
    } catch (error) {
      alert('Cập nhật thất bại: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  // Education handlers
  const handleAddEducation = () => {
    setEducationData([...educationData, {
      school: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      description: ''
    }]);
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...educationData];
    newEducation[index][field] = value;
    setEducationData(newEducation);
  };

  const handleRemoveEducation = (index) => {
    const newEducation = educationData.filter((_, i) => i !== index);
    setEducationData(newEducation);
  };

  const handleEducationSave = async () => {
    try {
      await userAPI.updateEducation({ education: educationData });
      await fetchProfile();
      // Refresh user data in store
      const updatedUser = await authAPI.getMe();
      setUser(updatedUser.data);
      setEditingEducation(false);
      alert('Cập nhật học vấn thành công!');
    } catch (error) {
      alert('Cập nhật thất bại: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  // CV handlers
  const handleCVSave = async () => {
    try {
      if (cvData.type === 'file' && cvFileRef.current?.files[0]) {
        const formData = new FormData();
        formData.append('cv', cvFileRef.current.files[0]);
        await userAPI.uploadCV(formData);
      } else if (cvData.type === 'url' && cvData.value) {
        const formData = new FormData();
        formData.append('cvUrl', cvData.value);
        await userAPI.uploadCV(formData);
      }
      await fetchProfile();
      // Refresh user data in store
      const updatedUser = await authAPI.getMe();
      setUser(updatedUser.data);
      setEditingCV(false);
      setCvData({ type: 'url', value: '' });
      alert('Cập nhật CV thành công!');
    } catch (error) {
      alert('Cập nhật CV thất bại: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  // About handlers
  const handleAboutSave = async () => {
    try {
      await userAPI.updateProfile({ bio: aboutData });
      await fetchProfile();
      // Refresh user data in store
      const updatedUser = await authAPI.getMe();
      setUser(updatedUser.data);
      setEditingAbout(false);
      alert('Cập nhật giới thiệu thành công!');
    } catch (error) {
      alert('Cập nhật thất bại: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  // Skills handlers
  const handleAddSkill = () => {
    if (newSkill.trim() && !skillsData.includes(newSkill.trim())) {
      setSkillsData([...skillsData, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index) => {
    setSkillsData(skillsData.filter((_, i) => i !== index));
  };

  const handleSkillsSave = async () => {
    try {
      await userAPI.updateProfile({ skills: skillsData });
      await fetchProfile();
      // Refresh user data in store
      const updatedUser = await authAPI.getMe();
      setUser(updatedUser.data);
      setEditingSkills(false);
      alert('Cập nhật kỹ năng thành công!');
    } catch (error) {
      alert('Cập nhật thất bại: ' + (error.message || 'Lỗi không xác định'));
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
    <div className="profile-page">
      <Header />

      {/* Avatar Edit Modal - Moved outside to prevent hover effects */}
      {editingAvatar && (
        <div className="edit-modal-overlay" onClick={() => setEditingAvatar(false)}>
          <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Cập nhật Avatar</h3>
            <div className="upload-options">
              <label className="radio-option">
                <input
                  type="radio"
                  checked={avatarData.type === 'file'}
                  onChange={() => setAvatarData({ ...avatarData, type: 'file' })}
                />
                <FiUpload /> Tải lên từ máy
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  checked={avatarData.type === 'url'}
                  onChange={() => setAvatarData({ ...avatarData, type: 'url' })}
                />
                <FiLink /> Nhập URL
              </label>
            </div>
            {avatarData.type === 'file' ? (
              <input
                ref={avatarFileRef}
                type="file"
                accept="image/*"
                className="form-input"
              />
            ) : (
              <input
                type="text"
                placeholder="https://example.com/avatar.jpg"
                value={avatarData.value}
                onChange={(e) => setAvatarData({ ...avatarData, value: e.target.value })}
                className="form-input"
              />
            )}
            <div className="form-actions">
              <button onClick={() => setEditingAvatar(false)} className="btn btn-secondary">
                Hủy
              </button>
              <button onClick={handleAvatarSave} className="btn btn-primary">
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container">
        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="profile-card">
              {/* Avatar Section */}
              <div className="profile-avatar-large">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt={profile.fullName} />
                ) : (
                  <div className="avatar-placeholder">
                    {profile?.fullName?.charAt(0) || 'U'}
                  </div>
                )}
                <button className="edit-avatar-btn" onClick={() => setEditingAvatar(true)}>
                  <FiEdit2 />
                </button>
              </div>

              <h2>{profile?.fullName || 'Chưa cập nhật tên'}</h2>
              
              {/* Contact Info Section */}
              <div className="contact-info">
                {editingContact ? (
                  <div className="edit-contact">
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={contactData.email}
                        onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Số điện thoại</label>
                      <input
                        type="tel"
                        value={contactData.phone}
                        onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-actions">
                      <button onClick={() => setEditingContact(false)} className="btn btn-secondary btn-sm">
                        Hủy
                      </button>
                      <button onClick={handleContactSave} className="btn btn-primary btn-sm">
                        Lưu
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="contact-display">
                    <p><strong>Email:</strong> {profile?.email || 'Chưa cập nhật'}</p>
                    <p><strong>SĐT:</strong> {profile?.phone || 'Chưa cập nhật'}</p>
                    <button className="btn-icon" onClick={() => setEditingContact(true)}>
                      <FiEdit2 /> Chỉnh sửa
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>

          <main className="profile-content">
            {/* Education Section */}
            <div className="card">
              <div className="card-header">
                <h3>Education</h3>
                <button className="btn-icon" onClick={() => setEditingEducation(!editingEducation)}>
                  <FiEdit2 />
                </button>
              </div>

              {editingEducation ? (
                <div className="education-edit">
                  {educationData.map((edu, index) => (
                    <div key={index} className="education-item-edit">
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveEducation(index)}
                      >
                        <FiX />
                      </button>
                      <div className="form-group">
                        <label>Trường học</label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                          className="form-input education-form-input"
                          placeholder="Đại học Bách Khoa"
                        />
                      </div>
                      <div className="form-group">
                        <label>Bằng cấp</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                          className="form-input education-form-input"
                          placeholder="Cử nhân"
                        />
                      </div>
                      <div className="form-group">
                        <label>Chuyên ngành</label>
                        <input
                          type="text"
                          value={edu.field}
                          onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                          className="form-input education-form-input"
                          placeholder="Khoa học máy tính"
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Năm bắt đầu</label>
                          <input
                            type="date"
                            value={edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label>Năm kết thúc</label>
                          <input
                            type="date"
                            value={edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                            className="form-input"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Mô tả</label>
                        <textarea
                          value={edu.description}
                          onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                          className="form-textarea"
                          rows="2"
                        />
                      </div>
                    </div>
                  ))}
                  <button className="btn btn-secondary" onClick={handleAddEducation}>
                    <FiPlus /> Thêm học vấn
                  </button>
                  <div className="form-actions">
                    <button onClick={() => setEditingEducation(false)} className="btn btn-secondary">
                      Hủy
                    </button>
                    <button onClick={handleEducationSave} className="btn btn-primary">
                      Lưu
                    </button>
                  </div>
                </div>
              ) : (
                <div className="education-display">
                  {profile?.education && profile.education.length > 0 ? (
                    profile.education.map((edu, index) => (
                      <div key={index} className="education-item">
                        <h4>{edu.school}</h4>
                        <p className="degree">{edu.degree} - {edu.field}</p>
                        <p className="date">
                          {edu.startDate ? new Date(edu.startDate).getFullYear() : 'N/A'} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Hiện tại'}
                        </p>
                        {edu.description && <p className="description">{edu.description}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="empty-state">Chưa có thông tin học vấn</p>
                  )}
                </div>
              )}
            </div>

            {/* CV Section */}
            <div className="card">
              <div className="card-header">
                <h3>CV / Resume</h3>
                <button className="btn-icon" onClick={() => setEditingCV(!editingCV)}>
                  <FiEdit2 />
                </button>
              </div>

              {editingCV ? (
                <div className="cv-edit">
                  <div className="upload-options">
                    <label className="radio-option">
                      <input
                        type="radio"
                        checked={cvData.type === 'file'}
                        onChange={() => setCvData({ ...cvData, type: 'file' })}
                      />
                      <FiUpload /> Tải lên từ máy
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        checked={cvData.type === 'url'}
                        onChange={() => setCvData({ ...cvData, type: 'url' })}
                      />
                      <FiLink /> Nhập URL
                    </label>
                  </div>
                  {cvData.type === 'file' ? (
                    <input
                      ref={cvFileRef}
                      type="file"
                      accept=".pdf,image/*"
                      className="form-input"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="https://example.com/cv.pdf"
                      value={cvData.value}
                      onChange={(e) => setCvData({ ...cvData, value: e.target.value })}
                      className="form-input"
                    />
                  )}
                  <div className="form-actions">
                    <button onClick={() => setEditingCV(false)} className="btn btn-secondary">
                      Hủy
                    </button>
                    <button onClick={handleCVSave} className="btn btn-primary">
                      Lưu
                    </button>
                  </div>
                </div>
              ) : (
                <div className="cv-section">
                  {profile?.cvUrl ? (
                    <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer" className="cv-link">
                      📄 Xem CV hiện tại
                    </a>
                  ) : (
                    <p className="empty-state">Chưa có CV. Vui lòng tải lên CV của bạn.</p>
                  )}
                </div>
              )}
            </div>

            {/* About Section */}
            <div className="card">
              <div className="card-header">
                <h3>About</h3>
                <button className="btn-icon" onClick={() => setEditingAbout(!editingAbout)}>
                  <FiEdit2 />
                </button>
              </div>

              {editingAbout ? (
                <div className="about-edit">
                  <textarea
                    value={aboutData}
                    onChange={(e) => setAboutData(e.target.value)}
                    className="form-textarea"
                    rows="6"
                    placeholder="Giới thiệu về bản thân..."
                  />
                  <div className="form-actions">
                    <button onClick={() => setEditingAbout(false)} className="btn btn-secondary">
                      Hủy
                    </button>
                    <button onClick={handleAboutSave} className="btn btn-primary">
                      Lưu
                    </button>
                  </div>
                </div>
              ) : (
                <p className="about-text">
                  {profile?.bio || 'Chưa có thông tin giới thiệu'}
                </p>
              )}
            </div>

            {/* Skills Section */}
            <div className="card">
              <div className="card-header">
                <h3>Skills</h3>
                <button className="btn-icon" onClick={() => setEditingSkills(!editingSkills)}>
                  <FiEdit2 />
                </button>
              </div>

              {editingSkills ? (
                <div className="skills-edit">
                  <div className="skills-input-group">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                      className="form-input"
                      placeholder="Nhập kỹ năng..."
                    />
                    <button className="btn btn-icon-primary" onClick={handleAddSkill}>
                      <FiPlus />
                    </button>
                  </div>
                  <div className="skills-list-edit">
                    {skillsData.map((skill, index) => (
                      <span key={index} className="skill-badge-edit">
                        {skill}
                        <button onClick={() => handleRemoveSkill(index)} className="remove-skill-btn">
                          <FiX />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="form-actions">
                    <button onClick={() => setEditingSkills(false)} className="btn btn-secondary">
                      Hủy
                    </button>
                    <button onClick={handleSkillsSave} className="btn btn-primary">
                      Lưu
                    </button>
                  </div>
                </div>
              ) : (
                <div className="skills-display">
                  {profile?.skills && profile.skills.length > 0 ? (
                    profile.skills.map((skill, index) => (
                      <span key={index} className="skill-badge">{skill}</span>
                    ))
                  ) : (
                    <p className="empty-state">Chưa có kỹ năng</p>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CandidateProfile;
