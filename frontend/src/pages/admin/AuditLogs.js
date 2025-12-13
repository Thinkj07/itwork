import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { FiFilter, FiChevronLeft, FiChevronRight, FiFileText } from 'react-icons/fi';
import './AuditLogs.css';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [actionFilter, setActionFilter] = useState('all');
  const [targetTypeFilter, setTargetTypeFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const limit = 20;

  const actions = [
    'BLOCK_USER', 'UNBLOCK_USER', 'DELETE_USER', 'UPDATE_USER',
    'APPROVE_JOB', 'REJECT_JOB', 'DELETE_JOB', 'UPDATE_JOB',
    'VIEW_STATISTICS', 'OTHER'
  ];

  const targetTypes = ['User', 'Job', 'Application', 'Review', 'System'];

  useEffect(() => {
    fetchAuditLogs();
  }, [currentPage, actionFilter, targetTypeFilter]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit,
        action: actionFilter,
        targetType: targetTypeFilter
      };

      const response = await adminAPI.getAuditLogs(params);
      setLogs(response.data);
      setTotalPages(response.pagination.pages);
      setTotalLogs(response.pagination.total);
      setError(null);
    } catch (err) {
      setError(err.message || 'Không thể tải audit logs');
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeClass = (action) => {
    if (action.includes('DELETE') || action.includes('BLOCK')) return 'badge-danger';
    if (action.includes('APPROVE') || action.includes('UNBLOCK')) return 'badge-success';
    if (action.includes('UPDATE')) return 'badge-warning';
    return 'badge-info';
  };

  if (loading && logs.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải audit logs...</p>
      </div>
    );
  }

  return (
    <div className="audit-logs">
      <div className="page-header">
        <div>
          <h1>Audit Logs</h1>
          <p className="page-subtitle">Lịch sử hành động của Admin - Tổng: {totalLogs} logs</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <FiFilter />
          <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}>
            <option value="all">Tất cả hành động</option>
            {actions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>

          <select value={targetTypeFilter} onChange={(e) => { setTargetTypeFilter(e.target.value); setCurrentPage(1); }}>
            <option value="all">Tất cả đối tượng</option>
            {targetTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
          <button onClick={fetchAuditLogs}>Thử lại</button>
        </div>
      )}

      {/* Audit Logs List */}
      <div className="logs-container">
        {logs.map((log) => (
          <div key={log._id} className="log-item">
            <div className="log-icon">
              <FiFileText />
            </div>
            
            <div className="log-content">
              <div className="log-header">
                <span className={`badge ${getActionBadgeClass(log.action)}`}>
                  {log.action}
                </span>
                <span className="badge badge-type">{log.targetType}</span>
              </div>
              
              <p className="log-description">{log.description}</p>
              
              <div className="log-footer">
                <span className="log-admin">
                  👤 {log.admin?.email || 'Unknown Admin'}
                </span>
                <span className="log-time">
                  🕒 {new Date(log.timestamp).toLocaleString('vi-VN')}
                </span>
                {log.ipAddress && (
                  <span className="log-ip">📍 {log.ipAddress}</span>
                )}
              </div>

              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <details className="log-metadata">
                  <summary>Chi tiết metadata</summary>
                  <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                </details>
              )}
            </div>
          </div>
        ))}

        {logs.length === 0 && !loading && (
          <div className="no-data">
            <p>Chưa có audit log nào</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            <FiChevronLeft /> Trước
          </button>
          
          <span className="pagination-info">
            Trang {currentPage} / {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Sau <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
