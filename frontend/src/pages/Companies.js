import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { companyAPI } from '../services/api';
import { FiSearch } from 'react-icons/fi';
import './Companies.css';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const data = await companyAPI.getCompanies();
      setCompanies(data.data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCompanies();
  };

  const filteredCompanies = companies.filter(company =>
    company.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="companies-page">
      <Header />

      <div className="page-header">
        <div className="container">
          <h1>Company Review</h1>
          <form onSubmit={handleSearch} className="search-bar">
            <FiSearch />
            <input
              type="text"
              placeholder="Company name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Find
            </button>
          </form>
        </div>
      </div>

      <div className="container">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="companies-grid-large">
            {filteredCompanies.map(company => (
              <Link 
                key={company._id} 
                to={`/companies/${company._id}`} 
                className="company-card-large"
              >
                <div className="company-logo-container">
                  {company.companyLogo ? (
                    <img src={company.companyLogo} alt={company.companyName} />
                  ) : (
                    <div className="logo-placeholder">{company.companyName?.charAt(0)}</div>
                  )}
                </div>
                <div className="company-info-text">
                  <h3>{company.companyName}</h3>
                  <p className="industry">{company.industry || 'Công nghệ thông tin'}</p>
                  <p className="location">{company.companyAddress || 'Address'}</p>
                  <p className="size">{company.companySize || '50-200'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Companies;

