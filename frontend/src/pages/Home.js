import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import JobCard from '../components/JobCard';
import { jobAPI, companyAPI } from '../services/api';
import { FiSearch, FiMapPin, FiBriefcase, FiUsers, FiTrendingUp } from 'react-icons/fi';
import './Home.css';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobsData, companiesData] = await Promise.all([
        jobAPI.getJobs({ limit: 6 }),
        companyAPI.getCompanies({ limit: 8 })
      ]);
      
      setFeaturedJobs(jobsData.data || []);
      setCompanies(companiesData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (location) params.append('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="home-page">
      <Header />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Nơi tài năng gặp cơ hội</h1>
            <p className="hero-subtitle">
            ITWorks là nền tảng tuyển dụng hiện đại giúp ứng viên và doanh nghiệp gặp nhau nhanh chóng, chính xác và hiệu quả. Với hàng nghìn cơ hội việc làm IT cùng các công ty hàng đầu, chúng tôi giúp bạn tiến gần hơn đến công việc mơ ước.
            </p>
            
            <form onSubmit={handleSearch} className="search-box">
              <div className="search-input-group">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="UI/UX Designer"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="search-input-group">
                <FiMapPin className="search-icon" />
                <input
                  type="text"
                  placeholder="Địa điểm"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <button type="submit" className="btn btn-primary btn-lg">
                 Tìm kiếm ngay
              </button>
            </form>

            {/* Popular Searches */}
            <div className="popular-searches">
              <span>Tìm kiếm phổ biến:</span>
              <div className="search-tags">
                <button onClick={() => { setSearchTerm('Backend'); handleSearch({ preventDefault: () => {} }); }}>
                  Backend
                </button>
                <button onClick={() => { setSearchTerm('AI / Data'); handleSearch({ preventDefault: () => {} }); }}>
                  AI / Data
                </button>
                <button onClick={() => { setSearchTerm('QA / Tester'); handleSearch({ preventDefault: () => {} }); }}>
                  QA / Tester
                </button>
                <button onClick={() => { setSearchTerm('Product Manager'); handleSearch({ preventDefault: () => {} }); }}>
                  Product Manager
                </button>
                <button onClick={() => { setSearchTerm('Marketing'); handleSearch({ preventDefault: () => {} }); }}>
                  Marketing
                </button>
              </div>
            </div>
          </div>

          <div className="hero-image">
            <div className="floating-card card-1">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop" alt="User" />
              <div>
                <p className="name">Wenda T</p>
                <p className="role">Graphic Designer</p>
              </div>
            </div>
            
            <div className="floating-card card-2">
              <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop" alt="User" />
              <div>
                <p className="name">John B</p>
                <p className="role">UI/UX Designer</p>
              </div>
            </div>

            <div className="floating-card card-3">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="User" />
              <div>
                <p className="name">John T.</p>
                <p className="role">Data Analyst</p>
              </div>
            </div>

            <div className="center-image">
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop" alt="Team working" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <FiBriefcase className="stat-icon" />
              <h3>1000+</h3>
              <p>Việc làm IT</p>
            </div>
            <div className="stat-item">
              <FiUsers className="stat-icon" />
              <h3>500+</h3>
              <p>Công ty hàng đầu</p>
            </div>
            <div className="stat-item">
              <FiTrendingUp className="stat-icon" />
              <h3>5000+</h3>
              <p>Ứng viên thành công</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Việc làm nổi bật</h2>
            <Link to="/jobs" className="view-all">Xem tất cả →</Link>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="jobs-grid">
              {featuredJobs.map(job => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Top Companies */}
      <section className="companies-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Công ty hàng đầu</h2>
            <Link to="/companies" className="view-all">Xem tất cả →</Link>
          </div>

          <div className="companies-grid">
            {companies.map(company => (
              <Link 
                key={company._id} 
                to={`/companies/${company._id}`} 
                className="company-card"
              >
                <div className="company-logo">
                  {company.companyLogo ? (
                    <img src={company.companyLogo} alt={company.companyName} />
                  ) : (
                    <div className="logo-placeholder">{company.companyName?.charAt(0)}</div>
                  )}
                </div>
                <h3>{company.companyName}</h3>
                <p className="company-industry">{company.industry}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;

