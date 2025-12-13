import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RoleSelection from './pages/RoleSelection';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Companies from './pages/Companies';
import CompanyProfile from './pages/CompanyProfile';

// Candidate Pages
import CandidateProfile from './pages/candidate/Profile';
import MyApplications from './pages/candidate/MyApplications';
import SavedJobs from './pages/candidate/SavedJobs';

// Employer Pages
import EmployerDashboard from './pages/employer/Dashboard';
import CreateJob from './pages/employer/CreateJob';
import EditJob from './pages/employer/EditJob';
import ManageJobs from './pages/employer/ManageJobs';
import Applicants from './pages/employer/Applicants';
import EmployerProfile from './pages/employer/Profile';

// Admin Pages
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import JobModeration from './pages/admin/JobModeration';
import AuditLogs from './pages/admin/AuditLogs';

import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:id" element={<CompanyProfile />} />
          
          {/* Candidate Routes */}
          <Route 
            path="/candidate/profile" 
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <CandidateProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/candidate/applications" 
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <MyApplications />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/candidate/saved-jobs" 
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <SavedJobs />
              </ProtectedRoute>
            } 
          />
          
          {/* Employer Routes */}
          <Route 
            path="/employer/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <EmployerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employer/profile" 
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <EmployerProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employer/create-job" 
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <CreateJob />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employer/jobs/:jobId/edit" 
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <EditJob />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employer/jobs" 
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <ManageJobs />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employer/jobs/:jobId/applicants" 
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <Applicants />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout>
                  <UserManagement />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/jobs" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout>
                  <JobModeration />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/audit-logs" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout>
                  <AuditLogs />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
