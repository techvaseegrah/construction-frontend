// contract/frontend/src/App.js
import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext'; // Import AuthContext
import LoginPage from './pages/Auth/LoginPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageProjects from './pages/Admin/ManageProjects';
import ManageWorkers from './pages/Admin/ManageWorkers';
import ManageRolesSalaries from './pages/Admin/ManageRolesSalaries';
import AttendanceOverview from './pages/Admin/AttendanceOverview';
import SalaryAdvanceLogs from './pages/Admin/SalaryAdvanceLogs';
import RawMaterialLogs from './pages/Admin/RawMaterialLogs';
import DailyActivityLogs from './pages/Admin/DailyActivityLogs';
import ReportGenerator from './pages/Admin/ReportGenerator';
import AdminSettings from './pages/Admin/AdminSettings';

import SupervisorDashboard from './pages/Supervisor/SupervisorDashboard';
import MySites from './pages/Supervisor/MySites';
import MarkAttendance from './pages/Supervisor/MarkAttendance';
import LogRawMaterials from './pages/Supervisor/LogRawMaterials';
import LogDailyActivities from './pages/Supervisor/LogDailyActivities';
import ManageAdvances from './pages/Supervisor/ManageAdvances';
import SupervisorGenerateReports from './pages/Supervisor/GenerateReports'; // Renamed to avoid conflict

import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';

// ProtectedRoute component to handle authentication and role-based access
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext); // Get user and loading from AuthContext

  if (loading) {
    // Optionally render a loading spinner or skeleton screen
    return <div className="flex justify-center items-center h-screen text-xl">Loading application...</div>;
  }

  if (!user) {
    // If no user is logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // If user is logged in but role is not allowed, redirect to a forbidden page or dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // You might want a specific Forbidden page or redirect to their allowed dashboard
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/supervisor/dashboard'} replace />;
  }

  return children;
};

function App() {
  const { user } = useContext(AuthContext); // Get user from AuthContext

  return (
    <div className="flex h-screen bg-gray-100 font-inter">
      {user && <Sidebar role={user.role} />} {/* Show sidebar only if user is logged in */}
      <div className="flex flex-col flex-1">
        {user && <Navbar user={user} />} {/* Show navbar only if user is logged in */}
        <main className="flex-1 overflow-y-auto p-4">
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Admin Routes */}
            <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><AdminRoutes /></ProtectedRoute>} />

            {/* Supervisor Routes */}
            <Route path="/supervisor/*" element={<ProtectedRoute allowedRoles={['supervisor']}><SupervisorRoutes /></ProtectedRoute>} />

            {/* Default redirect based on login status and role */}
            <Route path="/" element={user ? (user.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/supervisor/dashboard" />) : <Navigate to="/login" />} />
             {/* Fallback for unknown routes */}
            <Route path="*" element={<Navigate to={user ? (user.role === 'admin' ? '/admin/dashboard' : '/supervisor/dashboard') : '/login'} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// Separate components for Admin and Supervisor routes for better organization
const AdminRoutes = () => (
  <Routes>
    <Route path="dashboard" element={<AdminDashboard />} />
    <Route path="projects" element={<ManageProjects />} />
    <Route path="workers" element={<ManageWorkers />} />
    <Route path="roles-salaries" element={<ManageRolesSalaries />} />
    <Route path="attendance-overview" element={<AttendanceOverview />} />
    <Route path="salary-advance-logs" element={<SalaryAdvanceLogs />} />
    <Route path="raw-material-logs" element={<RawMaterialLogs />} />
    <Route path="daily-activity-logs" element={<DailyActivityLogs />} />
    <Route path="report-generator" element={<ReportGenerator />} />
    <Route path="settings" element={<AdminSettings />} />
    <Route path="*" element={<Navigate to="dashboard" replace />} /> {/* Default admin dashboard */}
  </Routes>
);

const SupervisorRoutes = () => (
  <Routes>
    <Route path="dashboard" element={<SupervisorDashboard />} />
    <Route path="my-sites" element={<MySites />} />
    <Route path="mark-attendance" element={<MarkAttendance />} />
    <Route path="log-raw-materials" element={<LogRawMaterials />} />
    <Route path="log-daily-activities" element={<LogDailyActivities />} />
    <Route path="manage-advances" element={<ManageAdvances />} />
    <Route path="generate-reports" element={<SupervisorGenerateReports />} />
    <Route path="*" element={<Navigate to="dashboard" replace />} /> {/* Default supervisor dashboard */}
  </Routes>
);


export default App;