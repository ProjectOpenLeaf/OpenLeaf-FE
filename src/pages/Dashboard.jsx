import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatientTherapist } from '../services/AssignmentService';
import { getUserId } from '../utils/roleUtils';
import '../css/Dashboard.css';

export default function Dashboard({ keycloak }) {
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState(null);
  const [loadingTherapist, setLoadingTherapist] = useState(true);

  useEffect(() => {
    checkTherapistAssignment();
  }, []);

  const checkTherapistAssignment = async () => {
    try {
      const patientId = getUserId(keycloak);
      const therapistData = await getPatientTherapist(patientId);
      setTherapist(therapistData);
    } catch (err) {
      console.log('No therapist assigned yet');
      setTherapist(null);
    } finally {
      setLoadingTherapist(false);
    }
  };

  const handleLogout = () => {
    keycloak.logout();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome to OpenLeaf</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Hello, {keycloak.tokenParsed?.preferred_username}!</h2>
          <p>Your personal journaling space</p>
        </div>

        <div className="dashboard-cards">
          <div className="dashboard-card" onClick={() => navigate('/journals')}>
            <div className="card-icon">📔</div>
            <h3>My Journals</h3>
            <p>View and manage your journal entries</p>
            <button className="card-button">View Journals →</button>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/journals/create')}>
            <div className="card-icon">✍️</div>
            <h3>New Entry</h3>
            <p>Start writing a new journal entry</p>
            <button className="card-button">Create Entry →</button>
          </div>

          {!loadingTherapist && !therapist && (
            <div className="dashboard-card" onClick={() => navigate('/find-therapist')}>
              <div className="card-icon">👨‍⚕️</div>
              <h3>Find Therapist</h3>
              <p>Connect with a therapist</p>
              <button className="card-button">Find Therapist →</button>
            </div>
          )}

          {!loadingTherapist && therapist && (
            <>
              <div className="dashboard-card" onClick={() => navigate(`/book-appointment/${therapist.therapistKeycloakId}`)}>
                <div className="card-icon">📅</div>
                <h3>Book Appointment</h3>
                <p>Schedule a session with your therapist</p>
                <button className="card-button">Book Now →</button>
              </div>

              <div className="dashboard-card" onClick={() => navigate('/my-appointments')}>
                <div className="card-icon">🗓️</div>
                <h3>My Appointments</h3>
                <p>View and manage your appointments</p>
                <button className="card-button">View Appointments →</button>
              </div>
            </>
          )}

          <div className="dashboard-card coming-soon">
            <div className="card-icon">📊</div>
            <h3>Insights</h3>
            <p>View your journaling statistics</p>
            <span className="coming-soon-badge">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}