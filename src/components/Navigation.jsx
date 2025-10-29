import React from 'react';
import { useNavigate } from 'react-router-dom';
import { isTherapist } from '../utils/roleUtils';
import '../css/Navigation.css';

export default function Navigation({ keycloak }) {
  const navigate = useNavigate();
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

  return (
    <nav className="navigation-bar">
      <div className="nav-left">
        <button className="nav-button home-button" onClick={goHome}>
          🏠 Home
        </button>
        <button className="nav-button back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>
      
      <div className="nav-center">
        <h1 className="nav-title">OpenLeaf</h1>
      </div>

      <div className="nav-right">
        <span className="nav-user">👤 {keycloak.tokenParsed?.preferred_username}</span>
        <button className="nav-button logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}