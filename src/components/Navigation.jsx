import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isTherapist } from '../utils/roleUtils';
import '../css/Navigation.css';

export default function Navigation({ keycloak }) {
  const navigate = useNavigate();
  const location = useLocation();
  const userIsTherapist = isTherapist(keycloak);

  const handleLogout = () => {
    keycloak.logout();
  };

  const goHome = () => {
    if (userIsTherapist) {
      navigate('/therapist/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="navigation-bar-redesign">
      <div className="nav-container">
        <div className="nav-left">
          <div className="nav-logo" onClick={goHome}>
            <span className="logo-icon">🍃</span>
            <span className="logo-text">OpenLeaf</span>
          </div>
        </div>

        <div className="nav-center">
          {!userIsTherapist && (
            <div className="nav-links">
              <button 
                className={`nav-link ${isActive('/dashboard') && location.pathname === '/dashboard' ? 'active' : ''}`}
                onClick={goHome}
              >
                Home
              </button>
              <button 
                className={`nav-link ${isActive('/journals') ? 'active' : ''}`}
                onClick={() => navigate('/journals')}
              >
                Journals
              </button>
              <button 
                className={`nav-link ${isActive('/my-appointments') ? 'active' : ''}`}
                onClick={() => navigate('/my-appointments')}
              >
                Appointments
              </button>
              <button 
                className={`nav-link ${isActive('/find-therapist') ? 'active' : ''}`}
                onClick={() => navigate('/find-therapist')}
              >
                Therapists
              </button>
            </div>
          )}
          {userIsTherapist && (
            <div className="nav-links">
              <button 
                className={`nav-link ${isActive('/therapist/dashboard') ? 'active' : ''}`}
                onClick={goHome}
              >
                Dashboard
              </button>
              <button 
                className={`nav-link ${isActive('/my-appointments') ? 'active' : ''}`}
                onClick={() => navigate('/my-appointments')}
              >
                Appointments
              </button>
              <button 
                className={`nav-link ${isActive('/create-appointment-slot') ? 'active' : ''}`}
                onClick={() => navigate('/create-appointment-slot')}
              >
                Create Slot
              </button>
            </div>
          )}
        </div>

        <div className="nav-right">
          <div className="user-info">
            <span className="user-icon">👤</span>
            <span className="username">{keycloak.tokenParsed?.preferred_username}</span>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}