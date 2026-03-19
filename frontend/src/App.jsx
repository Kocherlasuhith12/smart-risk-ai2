import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import AddProject from './pages/AddProject'
import ProjectDetail from './pages/ProjectDetail'
import Reports from './pages/Reports'
import History from './pages/History'
import DatasetAnalytics from './pages/DatasetAnalytics'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"       element={<Dashboard />} />
            <Route path="projects"        element={<Projects />} />
            <Route path="projects/:id"    element={<ProjectDetail />} />
            <Route path="add-project"     element={<AddProject />} />
            <Route path="reports"         element={<Reports />} />
            <Route path="history"         element={<History />} />
            <Route path="analytics"       element={<DatasetAnalytics />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
