import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiX, FiCheck } from 'react-icons/fi';
import { notificationAPI } from '../services/api';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnreadCount();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sửa trong Notifications.js

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications();
      // Sửa: Bỏ một lớp .data vì interceptor đã trả về response.data
      setNotifications(response?.data || response || []);
      setUnreadCount(response?.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      // Sửa: Bỏ một lớp .data
      setUnreadCount(response?.count || response || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    }
  };

// frontend/src/components/Notifications.js

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await notificationAPI.markAsRead(notification._id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev =>
          prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
        );
      }
      
      setIsOpen(false);
      
      // fix
      const applicationId = notification.relatedApplication?._id || notification.relatedApplication;
      const jobId = notification.relatedJob?._id || notification.relatedJob;
      
      console.log('Notification clicked:', {
        notification,
        applicationId,
        jobId,
        relatedApplication: notification.relatedApplication,
        relatedJob: notification.relatedJob
      });
      
      navigate('/candidate/applications', {
        state: {
          scrollToApplication: applicationId,
          scrollToJob: jobId
        }
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await notificationAPI.deleteNotification(notificationId);
      const deletedNotif = notifications?.find(n => n._id === notificationId);
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotifications(prev => (prev || []).filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
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

    for (const [unit, value] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / value);
      if (interval >= 1) {
        return `${interval} ${unit} trước`;
      }
    }
    
    return 'Vừa xong';
  };

  return (
    <div className="notifications-container" ref={dropdownRef}>
      <button 
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Thông báo"
      >
        <FiBell />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Thông báo</h3>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
              >
                <FiCheck /> Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>

          <div className="notifications-list">
            {loading ? (
              <div className="notifications-loading">
                <div className="spinner"></div>
              </div>
            ) : !notifications || notifications.length === 0 ? (
              <div className="no-notifications">
                <FiBell size={48} />
                <p>Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {getTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                  <button
                    className="delete-notification-btn"
                    onClick={(e) => handleDeleteNotification(e, notification._id)}
                    aria-label="Xóa thông báo"
                  >
                    <FiX />
                  </button>
                </div>
              ))
            )}
          </div>

          {notifications && notifications.length > 0 && (
            <div className="notifications-footer">
              <span>{notifications.length} thông báo</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;

