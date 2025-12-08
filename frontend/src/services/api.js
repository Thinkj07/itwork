import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const isLoginPage = window.location.pathname === '/login';

    // Chỉ redirect về /login nếu đang không ở trang login
    if (status === 401 && !isLoginPage) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// User APIs
export const userAPI = {
  getProfile: (id) => api.get(`/users/profile/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  updateEducation: (data) => api.put('/users/education', data),
  updateExperience: (data) => api.put('/users/experience', data),
  toggleSaveJob: (jobId) => api.post(`/users/saved-jobs/${jobId}`),
  getSavedJobs: () => api.get('/users/saved-jobs'),
  toggleFollowCompany: (companyId) => api.post(`/users/follow/${companyId}`),
  uploadAvatar: (formData) => {
    return axios.post(`${API_URL}/users/upload-avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then(res => res.data);
  },
  uploadCV: (formData) => {
    return axios.post(`${API_URL}/users/upload-cv`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then(res => res.data);
  }
};

// Job APIs
export const jobAPI = {
  getJobs: (params) => api.get('/jobs', { params }),
  getJob: (id) => api.get(`/jobs/${id}`),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  closeJob: (id) => api.patch(`/jobs/${id}/close`),
  getMyJobs: () => api.get('/jobs/my-jobs'),
  getJobsByCompany: (companyId) => api.get(`/jobs/company/${companyId}`)
};

// Application APIs
export const applicationAPI = {
  apply: (data) => api.post('/applications', data),
  getMyApplications: () => api.get('/applications/my-applications'),
  getJobApplications: (jobId) => api.get(`/applications/job/${jobId}`),
  getEmployerApplications: () => api.get('/applications/employer'),
  getApplication: (id) => api.get(`/applications/${id}`),
  updateStatus: (id, data) => api.put(`/applications/${id}/status`, data),
  withdrawApplication: (id) => api.delete(`/applications/${id}`),
  uploadApplicationCV: (formData) => {
    return axios.post(`${API_URL}/applications/upload-cv`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then(res => res.data);
  }
};

// Company APIs
export const companyAPI = {
  getCompanies: (params) => api.get('/companies', { params }),
  getCompany: (id) => api.get(`/companies/${id}`)
};

// Review APIs
export const reviewAPI = {
  createReview: (data) => api.post('/reviews', data),
  getCompanyReviews: (companyId) => api.get(`/reviews/company/${companyId}`),
  getMyReviews: () => api.get('/reviews/my-reviews')
};

// Notification APIs
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`)
};

export default api;

