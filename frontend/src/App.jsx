import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import InternshipsPage from './pages/InternshipsPage'
import InternshipDetailPage from './pages/InternshipDetailPage'

// Student pages
import StudentDashboard from './pages/student/Dashboard'
import StudentProfile from './pages/student/Profile'
import StudentApplications from './pages/student/Applications'
import StudentSaved from './pages/student/Saved'

// Company pages
import CompanyDashboard from './pages/company/Dashboard'
import CompanyProfile from './pages/company/Profile'
import CompanyInternships from './pages/company/Internships'
import CompanyApplicants from './pages/company/Applicants'
import PostInternship from './pages/company/PostInternship'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminInternships from './pages/admin/Internships'

import LoadingSpinner from './components/common/LoadingSpinner'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) {
    const redirectMap = { student: '/dashboard', company: '/company/dashboard', admin: '/admin/dashboard' }
    return <Navigate to={redirectMap[user.role] || '/'} replace />
  }
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (user) {
    const redirectMap = { student: '/dashboard', company: '/company/dashboard', admin: '/admin/dashboard' }
    return <Navigate to={redirectMap[user.role] || '/'} replace />
  }
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/internships" element={<InternshipsPage />} />
      <Route path="/internships/:id" element={<InternshipDetailPage />} />

      {/* Auth routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Student routes */}
      <Route path="/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute roles={['student']}><StudentProfile /></ProtectedRoute>} />
      <Route path="/applications" element={<ProtectedRoute roles={['student']}><StudentApplications /></ProtectedRoute>} />
      <Route path="/saved" element={<ProtectedRoute roles={['student']}><StudentSaved /></ProtectedRoute>} />

      {/* Company routes */}
      <Route path="/company/dashboard" element={<ProtectedRoute roles={['company']}><CompanyDashboard /></ProtectedRoute>} />
      <Route path="/company/profile" element={<ProtectedRoute roles={['company']}><CompanyProfile /></ProtectedRoute>} />
      <Route path="/company/internships" element={<ProtectedRoute roles={['company']}><CompanyInternships /></ProtectedRoute>} />
      <Route path="/company/applicants" element={<ProtectedRoute roles={['company']}><CompanyApplicants /></ProtectedRoute>} />
      <Route path="/company/post" element={<ProtectedRoute roles={['company']}><PostInternship /></ProtectedRoute>} />
      <Route path="/company/edit/:id" element={<ProtectedRoute roles={['company']}><PostInternship /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/internships" element={<ProtectedRoute roles={['admin']}><AdminInternships /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  )
}
