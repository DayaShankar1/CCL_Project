import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PortalProvider } from './context/PortalContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Page components imports
import { Dashboard } from './pages/Dashboard';
import { EmployeeDirectory } from './pages/EmployeeDirectory';
import { EmployeeProfile } from './pages/EmployeeProfile';
import { NewMedicalRecord } from './pages/NewMedicalRecord';
import { ReportsDocuments } from './pages/ReportsDocuments';
import { PmeTracker } from './pages/PmeTracker';
import { RiskAssessment } from './pages/RiskAssessment';
import { Analytics } from './pages/Analytics';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { AddEmployee } from './pages/AddEmployee';

import { RoleProtectedRoute } from './components/RoleProtectedRoute';
import { AccessDenied } from './pages/AccessDenied';

export default function App() {
  return (
    <AuthProvider>
      <PortalProvider>
        <Router>
          <Routes>
            {/* Unprotected Auth routes */}
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />

            {/* Protected Portal routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                {/* Dashboard page */}
                <Route index element={<Dashboard />} />
                
                {/* Employee Directory */}
                <Route path="employees" element={<EmployeeDirectory />} />

                {/* Add New Employee Registration */}
                <Route path="add-employee" element={<AddEmployee />} />
                
                {/* Employee Profile (specific employee and fallback default) */}
                <Route path="profile/:employeeId" element={<EmployeeProfile />} />
                
                {/* Access Denied page */}
                <Route path="access-denied" element={<AccessDenied />} />

                {/* Restricted to Doctor & Medical Staff */}
                <Route element={<RoleProtectedRoute allowedRoles={['Doctor', 'Medical Staff']} />}>
                  {/* New Medical Examination Record Form O */}
                  <Route path="new-record" element={<NewMedicalRecord />} />
                </Route>

                {/* Restricted to Doctor & Admin */}
                <Route element={<RoleProtectedRoute allowedRoles={['Doctor', 'Admin']} />}>
                  {/* PME Batch Schedule and Compliance Countdowns */}
                  <Route path="tracker" element={<PmeTracker />} />
                </Route>
                
                {/* Restricted to Doctor only */}
                <Route element={<RoleProtectedRoute allowedRoles={['Doctor']} />}>
                  {/* Risk Assessment, Trajectory, and Protocols */}
                  <Route path="risk-assessment" element={<RiskAssessment />} />
                </Route>
                
                {/* Restricted to Doctor & Admin */}
                <Route element={<RoleProtectedRoute allowedRoles={['Doctor', 'Admin']} />}>
                  {/* Charts and Disease Trends Analytics */}
                  <Route path="analytics" element={<Analytics />} />
                </Route>

                {/* Reports and Document browser with Side previews */}
                <Route path="documents" element={<ReportsDocuments />} />
              </Route>
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </PortalProvider>
    </AuthProvider>
  );
}
