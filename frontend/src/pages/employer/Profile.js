import React, { useState, useEffect, useRef } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { userAPI, authAPI } from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import { FiEdit2, FiUpload, FiLink } from 'react-icons/fi';
import { formatWebsiteUrl } from '../../utils/url';
import './Profile.css';

const EmployerProfile = () => {
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit states for each section
  const [editingLogo, setEditingLogo] = useState(false);
  const [editingHeader, setEditingHeader] = useState(false);
  const [editingBasicInfo, setEditingBasicInfo] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);

  // Form data states
  const [logoData, setLogoData] = useState({ type: 'url', value: '' });
  const [headerData, setHeaderData] = useState({
    companyName: '',
    companyAddress: ''
  });
  const [basicInfoData, setBasicInfoData] = useState({
    companyAddress: '',
    companyName: '',
    industry: '',
    companyType: 'IT',
    companyWebsite: '',
    companySize: ''
  });
  const [aboutData, setAboutData] = useState('');

  // File input ref
  const logoFileRef = useRef(null);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await userAPI.getProfile(user.id);
      setProfile(data.data);
      setHeaderData({
        companyName: data.data.companyName || '',
        companyAddress: data.data.companyAddress || ''
      });
      setBasicInfoData({
        companyName: data.data.companyName || '',
        companyAddress: data.data.companyAddress || '',
        industry: data.data.industry || '',
        companyType: data.data.companyType || 'IT',
        companyWebsite: data.data.companyWebsite || '',
        companySize: data.data.companySize || ''
      });
      setAboutData(data.data.companyDescription || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Logo handlers
  const handleLogoSave = async () => {
    try {
      if (logoData.type === 'file' && logoFileRef.current?.files[0]) {
        const formData = new FormData();
        formData.append('avatar', logoFileRef.current.files[0]);
        await userAPI.uploadAvatar(formData);
      } else if (logoData.type === 'url' && logoData.value) {
        const formData = new FormData();
        formData.append('avatarUrl', logoData.value);
        await userAPI.uploadAvatar(formData);
      }
      await fetchProfile();
      // Refresh user data in store to update Header
      const updatedUser = await authAPI.getMe();
      setUser(updatedUser.data);
      setEditingLogo(false);
      setLogoData({ type: 'url', value: '' });
      alert('Cập nhật logo thành công!');
    } catch (error) {
      alert('Cập nhật logo thất bại: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  // Header handlers
  const handleHeaderSave = async () => {
    try {
      await userAPI.updateProfile(headerData);
      await fetchProfile();
      // Refresh user data in store
      const updatedUser = await authAPI.getMe();
      setUser(updatedUser.data);
      setEditingHeader(false);
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      alert('Cập nhật thất bại: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  // Basic Info handlers
  const handleBasicInfoSave = async () => {
    try {
      await userAPI.updateProfile(basicInfoData);
      await fetchProfile();
      // Refresh user data in store
      const updatedUser = await authAPI.getMe();
      setUser(updatedUser.data);
      setEditingBasicInfo(false);
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      alert('Cập nhật thất bại: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  // About handlers
  const handleAboutSave = async () => {
    try {
      await userAPI.updateProfile({ companyDescription: aboutData });
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
    <div className="employer-profile-page">
      <Header />

      {/* Logo Edit Modal - Moved outside to prevent hover effects */}
      {editingLogo && (
        <div className="edit-modal-overlay" onClick={() => setEditingLogo(false)}>
          <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Cập nhật Logo</h3>
            <div className="upload-options">
              <label className="radio-option">
                <input
                  type="radio"
                  checked={logoData.type === 'file'}
                  onChange={() => setLogoData({ ...logoData, type: 'file' })}
                />
                <FiUpload /> Tải lên từ máy
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  checked={logoData.type === 'url'}
                  onChange={() => setLogoData({ ...logoData, type: 'url' })}
                />
                <FiLink /> Nhập URL
              </label>
            </div>
            {logoData.type === 'file' ? (
              <input
                ref={logoFileRef}
                type="file"
                accept="image/*"
                className="form-input"
              />
            ) : (
              <input
                type="text"
                placeholder="https://example.com/logo.jpg"
                value={logoData.value}
                onChange={(e) => setLogoData({ ...logoData, value: e.target.value })}
                className="form-input"
              />
            )}
            <div className="form-actions">
              <button onClick={() => setEditingLogo(false)} className="btn btn-secondary">
                Hủy
              </button>
              <button onClick={handleLogoSave} className="btn btn-primary">
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container">
        <div className="employer-profile-layout">
          {/* Header Section with Logo and Name */}
          <div className="profile-header-card">
            <div className="profile-header-content">
              {/* Logo Section */}
              <div className="company-logo-section">
                <div className="company-logo-large">
                  {profile?.companyLogo ? (
                    <img src={profile.companyLogo} alt={profile.companyName} />
                  ) : (
                    <div className="logo-placeholder">
                      {profile?.companyName?.charAt(0) || 'C'}
                    </div>
                  )}
                </div>
                <button className="edit-logo-btn" onClick={() => setEditingLogo(true)}>
                  <FiEdit2 /> Edit
                </button>
              </div>

              {/* Company Name and Location */}
              <div className="company-header-info">
                {editingHeader ? (
                  <div className="header-edit-form">
                    <div className="form-group">
                      <input
                        type="text"
                        value={headerData.companyName}
                        onChange={(e) => setHeaderData({ ...headerData, companyName: e.target.value })}
                        className="form-input-header"
                        placeholder="Tên công ty"
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        value={headerData.companyAddress}
                        onChange={(e) => setHeaderData({ ...headerData, companyAddress: e.target.value })}
                        className="form-input-header-small"
                        placeholder="Địa chỉ"
                      />
                    </div>
                    <div className="header-actions">
                      <button onClick={() => setEditingHeader(false)} className="btn btn-secondary btn-sm">
                        Hủy
                      </button>
                      <button onClick={handleHeaderSave} className="btn btn-primary btn-sm">
                        Lưu
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="header-content">
                      <div>
                        <h1>{profile?.companyName || 'Company Name'}</h1>
                        <p className="company-location">{profile?.companyAddress || 'Address'}</p>
                      </div>
                      <button className="btn-icon" onClick={() => setEditingHeader(true)}>
                        <FiEdit2 />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Basic Information Section */}
          <div className="card">
            <div className="card-header">
              <h3>Basic Information</h3>
              <button className="btn-icon" onClick={() => setEditingBasicInfo(!editingBasicInfo)}>
                <FiEdit2 />
              </button>
            </div>

            {editingBasicInfo ? (
              <div className="basic-info-edit">
                <div className="form-row">
                <div className="form-group">
                    <label>Industry</label>
                  <input
                    type="text"
                      value={basicInfoData.industry}
                      onChange={(e) => setBasicInfoData({ ...basicInfoData, industry: e.target.value })}
                    className="form-input"
                      placeholder="Công nghệ thông tin"
                    />
                  </div>
                  <div className="form-group">
                    <label>Company Type</label>
                    <select
                      value={basicInfoData.companyType}
                      onChange={(e) => setBasicInfoData({ ...basicInfoData, companyType: e.target.value })}
                      className="form-input"
                    >
                      <option value="IT">IT</option>
                      <option value="Product">Product</option>
                      <option value="Service">Service</option>
                      <option value="Outsourcing">Outsourcing</option>
                      <option value="Startup">Startup</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                      value={basicInfoData.companyWebsite}
                      onChange={(e) => setBasicInfoData({ ...basicInfoData, companyWebsite: e.target.value })}
                    className="form-input"
                    placeholder="google.com"
                  />
                </div>
                <div className="form-group">
                    <label>Size</label>
                    <select
                      value={basicInfoData.companySize}
                      onChange={(e) => setBasicInfoData({ ...basicInfoData, companySize: e.target.value })}
                    className="form-input"
                  >
                    <option value="">—</option>
                    <option value="1-10">1-10 nhân viên</option>
                    <option value="11-50">11-50 nhân viên</option>
                    <option value="51-200">51-200 nhân viên</option>
                    <option value="201-500">201-500 nhân viên</option>
                    <option value="500+">500+ nhân viên</option>
                  </select>
                </div>
                </div>
                <div className="form-actions">
                  <button onClick={() => setEditingBasicInfo(false)} className="btn btn-secondary">
                    Hủy
                  </button>
                  <button onClick={handleBasicInfoSave} className="btn btn-primary">
                    Lưu
                  </button>
                </div>
              </div>
            ) : (
              <div className="basic-info-display">
                  <div className="info-grid">
                  <div className="info-item">
                      <span className="info-label">Industry</span>
                      <span className="info-value">{profile?.industry || 'Công nghệ thông tin'}</span>
                    </div>
                  <div className="info-item">
                      <span className="info-label">Company Type</span>
                    <span className="info-value">{profile?.companyType || 'IT'}</span>
                    </div>
                  <div className="info-item">
                      <span className="info-label">Website</span>
                      {profile?.companyWebsite ? (
                      <a 
                        href={formatWebsiteUrl(profile.companyWebsite)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="info-value info-link"
                      >
                        {profile.companyWebsite}
                      </a>
                    ) : (
                      <span className="info-value">—</span>
                    )}
                    </div>
                  <div className="info-item">
                      <span className="info-label">Size</span>
                      <span className="info-value">{profile?.companySize || '—'}</span>
                    </div>
                  </div>
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
                  placeholder="Giới thiệu về công ty..."
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
              <div className="about-display">
                <p className="about-text">
                  {profile?.companyDescription || 'Chưa có thông tin giới thiệu về công ty'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EmployerProfile;
