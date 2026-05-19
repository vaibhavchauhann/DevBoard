import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Projects from './pages/projects/Projects';
import ProjectDetail from './pages/projects/ProjectDetail';
import Sprints from './pages/sprints/Sprints';
import Board from './pages/board/Board';
import Standups from './pages/standups/Standups';
import Team from './pages/team/Team';
import Analytics from './pages/analytics/Analytics';

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/sprints" element={<Sprints />} />
          <Route path="/board" element={<Board />} />
          <Route path="/standups" element={<Standups />} />
          <Route path="/team" element={<Team />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
