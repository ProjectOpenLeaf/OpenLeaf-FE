import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import JournalList from "./pages/JournalList.jsx";
import CreateJournal from "./pages/CreateJournal.jsx";
import ViewJournal from "./pages/ViewJournal.jsx";
import FindTherapist from "./pages/FindTherapist.jsx";
import TherapistDashboard from "./pages/TherapistDashboard.jsx";
import { isPatient, isTherapist, isAdmin } from "./utils/roleUtils.js";

function PrivateRoute({ children, keycloak }) {
  return keycloak.authenticated ? children : <Navigate to="/" />;
}

function RoleRoute({ children, keycloak, allowedRoles }) {
  if (!keycloak.authenticated) {
    return <Navigate to="/" />;
  }

  const hasAccess = allowedRoles.some(role => {
    if (role === 'patient') return isPatient(keycloak);
    if (role === 'therapist') return isTherapist(keycloak);
    if (role === 'admin') return isAdmin(keycloak);
    return false;
  });

  return hasAccess ? children : <Navigate to="/unauthorized" />;
}

export default function App({ keycloak }) {
  const [authenticated, setAuthenticated] = useState(keycloak.authenticated);

  useEffect(() => {
    // Listen for token refresh or login status changes
    const interval = setInterval(() => {
      keycloak.updateToken(30).then((refreshed) => {
        setAuthenticated(keycloak.authenticated);
      }).catch(() => {
        setAuthenticated(false);
      });
    }, 60000); // refresh every minute

    return () => clearInterval(interval);
  }, [keycloak]);

  // Redirect to appropriate dashboard based on role
  const getDefaultRoute = () => {
    if (isAdmin(keycloak)) return "/admin";
    if (isTherapist(keycloak)) return "/therapist/dashboard";
    if (isPatient(keycloak)) return "/dashboard";
    return "/dashboard";
  };

  return (
    <Router>
      <Routes>
        {/* Redirect root based on user role */}
        <Route 
          path="/" 
          element={
            keycloak.authenticated ? 
              <Navigate to={getDefaultRoute()} replace /> : 
              <Navigate to="/dashboard" replace />
          } 
        />
        
        {/* Patient Routes */}
        <Route
          path="/dashboard"
          element={
            <RoleRoute keycloak={keycloak} allowedRoles={['patient']}>
              <Dashboard keycloak={keycloak} />
            </RoleRoute>
          }
        />

        <Route
          path="/journals"
          element={
            <RoleRoute keycloak={keycloak} allowedRoles={['patient']}>
              <JournalList />
            </RoleRoute>
          }
        />

        <Route
          path="/journals/create"
          element={
            <RoleRoute keycloak={keycloak} allowedRoles={['patient']}>
              <CreateJournal />
            </RoleRoute>
          }
        />

        <Route
          path="/journals/:id"
          element={
            <RoleRoute keycloak={keycloak} allowedRoles={['patient']}>
              <ViewJournal />
            </RoleRoute>
          }
        />

        <Route
          path="/find-therapist"
          element={
            <RoleRoute keycloak={keycloak} allowedRoles={['patient']}>
              <FindTherapist keycloak={keycloak} />
            </RoleRoute>
          }
        />

        {/* Therapist Routes */}
        <Route
          path="/therapist/dashboard"
          element={
            <RoleRoute keycloak={keycloak} allowedRoles={['therapist']}>
              <TherapistDashboard keycloak={keycloak} />
            </RoleRoute>
          }
        />

        {/* Unauthorized Page */}
        <Route
          path="/unauthorized"
          element={
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <h1 style={{ fontSize: '3rem', color: '#e74c3c' }}>⛔</h1>
              <h2>Access Denied</h2>
              <p>You don't have permission to access this page.</p>
              <button 
                onClick={() => window.location.href = getDefaultRoute()}
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Go to My Dashboard
              </button>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}