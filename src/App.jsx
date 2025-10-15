import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx"; // Create this component
import TokenManager from "./services/TokenManager.js";

function PrivateRoute({ children, keycloak }) {
  return keycloak.authenticated ? children : <Navigate to="/" />;
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

  return (
    <Router>
      <Routes>
        {/* Redirect root to dashboard since user is already authenticated */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route
          path="/dashboard"
          element={
            <PrivateRoute keycloak={keycloak}>
              <Dashboard keycloak={keycloak} />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
