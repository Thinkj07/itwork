import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import { 
  FiSearch, FiFilter, FiLock, FiUnlock, FiTrash2, FiEye,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 10;

  // Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit,
        role: roleFilter,
        status: statusFilter,
        search: search
      };

      const response = await adminAPI.getUsers(params);
      setUsers(response.data);
      setTotalPages(response.pagination.pages);
      setTotalUsers(response.pagination.total);
      setError(null);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, roleFilter, statusFilter, search, limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    if (!window.confirm(`Bạn có chắc muốn ${currentStatus ? 'khóa' : 'mở khóa'} tài khoản này?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const reason = prompt('Nhập lý do (tùy chọn):');
      await adminAPI.toggleUserStatus(userId, { reason });
      fetchUsers();
      alert(`Đã ${currentStatus ? 'khóa' : 'mở khóa'} tài khoản thành công`);
    } catch (err) {
      alert(err.message || 'Có lỗi xảy ra');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc muốn xóa user này? Hành động này không thể hoàn tác!')) {
      return;
    }

    try {
      setActionLoading(true);
      const reason = prompt('Nhập lý do xóa:') || 'Không có lý do';
      await adminAPI.deleteUser(userId, { reason });
      fetchUsers();
      alert('Đã xóa user thành công');
    } catch (err) {
      alert(err.message || 'Có lỗi xảy ra');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = async (userId) => {
    try {
      const response = await adminAPI.getUserDetails(userId);
      setSelectedUser(response.data);
      setShowDetailsModal(true);
    } catch (err) {
      alert(err.message || 'Không thể tải thông tin user');
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'badge-admin';
      case 'employer': return 'badge-employer';
      case 'candidate': return 'badge-candidate';
      default: return 'badge-default';
    }
  };

  const getStatusBadgeClass = (isActive) => {
    return isActive ? 'badge-active' : 'badge-blocked';
  };

  if (loading && users.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải danh sách users...</p>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <div>
          <h1>Quản lý Users</h1>
          <p className="page-subtitle">Tổng số: {totalUsers} users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <FiSearch />
            <input
              type="text"
              placeholder="Tìm theo email, tên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-search">Tìm kiếm</button>
        </form>

        <div className="filter-group">
          <FiFilter />
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}>
            <option value="all">Tất cả Role</option>
            <option value="candidate">Candidate</option>
            <option value="employer">Employer</option>
            <option value="admin">Admin</option>
          </select>

          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="blocked">Bị khóa</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
          <button onClick={fetchUsers}>Thử lại</button>
        </div>
      )}

      {/* Users Table */}
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Tên</th>
              <th>Role</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.email}</td>
                <td>
                  {user.role === 'candidate' 
                    ? user.fullName || 'Chưa cập nhật' 
                    : user.companyName || 'Chưa cập nhật'}
                </td>
                <td>
                  <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(user.isActive)}`}>
                    {user.isActive ? 'Active' : 'Blocked'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon btn-view"
                      onClick={() => handleViewDetails(user._id)}
                      title="Xem chi tiết"
                    >
                      <FiEye />
                    </button>
                    
                    {user.role !== 'admin' && (
                      <>
                        <button
                          className={`btn-icon ${user.isActive ? 'btn-lock' : 'btn-unlock'}`}
                          onClick={() => handleToggleStatus(user._id, user.isActive)}
                          disabled={actionLoading}
                          title={user.isActive ? 'Khóa' : 'Mở khóa'}
                        >
                          {user.isActive ? <FiLock /> : <FiUnlock />}
                        </button>
                        
                        {!user.isSystemAccount && (
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDeleteUser(user._id)}
                            disabled={actionLoading}
                            title="Xóa"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && !loading && (
          <div className="no-data">
            <p>Không tìm thấy user nào</p>
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

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết User</h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="user-detail-grid">
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{selectedUser.email}</span>
                </div>
                
                <div className="detail-item">
                  <label>Role:</label>
                  <span className={`badge ${getRoleBadgeClass(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </div>
                
                <div className="detail-item">
                  <label>Trạng thái:</label>
                  <span className={`badge ${getStatusBadgeClass(selectedUser.isActive)}`}>
                    {selectedUser.isActive ? 'Active' : 'Blocked'}
                  </span>
                </div>

                {selectedUser.role === 'candidate' && (
                  <>
                    <div className="detail-item">
                      <label>Họ tên:</label>
                      <span>{selectedUser.fullName || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Số đơn ứng tuyển:</label>
                      <span>{selectedUser.applicationCount || 0}</span>
                    </div>
                    <div className="detail-item">
                      <label>Số review:</label>
                      <span>{selectedUser.reviewCount || 0}</span>
                    </div>
                  </>
                )}

                {selectedUser.role === 'employer' && (
                  <>
                    <div className="detail-item">
                      <label>Tên công ty:</label>
                      <span>{selectedUser.companyName || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Số job đã đăng:</label>
                      <span>{selectedUser.jobCount || 0}</span>
                    </div>
                    <div className="detail-item">
                      <label>Job đang active:</label>
                      <span>{selectedUser.activeJobCount || 0}</span>
                    </div>
                    <div className="detail-item">
                      <label>Tổng đơn ứng tuyển:</label>
                      <span>{selectedUser.totalApplications || 0}</span>
                    </div>
                  </>
                )}

                <div className="detail-item">
                  <label>Ngày tạo:</label>
                  <span>{new Date(selectedUser.createdAt).toLocaleString('vi-VN')}</span>
                </div>

                {selectedUser.phone && (
                  <div className="detail-item">
                    <label>Điện thoại:</label>
                    <span>{selectedUser.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
