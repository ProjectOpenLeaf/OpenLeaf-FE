import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTherapistPatients } from '../services/AssignmentService';
import { getUserId } from '../utils/roleUtils';
import '../css/TherapistDashboard.css';

export default function TherapistDashboard({ keycloak }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const therapistId = getUserId(keycloak);
      const data = await getTherapistPatients(therapistId);
      setPatients(data);
      setError(null);
    } catch (err) {
      console.error('Error loading patients:', err);
      setError('Failed to load your assigned patients');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    keycloak.logout();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="therapist-dashboard-container">
        <div className="loading">Loading your patients...</div>
      </div>
    );
  }

  return (
    <div className="therapist-dashboard-container">
      <header className="therapist-header">
        <div className="header-content">
          <h1>Therapist Dashboard</h1>
          <p className="welcome-text">
            Welcome, Dr. {keycloak.tokenParsed?.preferred_username}
          </p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={loadPatients}>Retry</button>
        </div>
      )}

      <div className="dashboard-content">
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{patients.length}</h3>
              <p>Assigned Patients</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>0</h3>
              <p>Pending Reviews</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-info">
              <h3>0</h3>
              <p>Unread Messages</p>
            </div>
          </div>
        </div>

        <div className="patients-section">
          <div className="section-header">
            <h2>Your Patients</h2>
          </div>

          {patients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👤</div>
              <h3>No Patients Assigned Yet</h3>
              <p>You don't have any patients assigned to you at the moment.</p>
              <p>Contact your administrator to get patients assigned.</p>
            </div>
          ) : (
            <div className="patients-grid">
              {patients.map((patient) => (
                <div 
                  key={patient.assignmentId} 
                  className="patient-card"
                  onClick={() => navigate(`/therapist/patient/${patient.patientKeycloakId}`)}
                >
                  <div className="patient-avatar">
                    <span className="avatar-icon">👤</span>
                  </div>
                  <div className="patient-info">
                    <h3>Patient ID: {patient.patientKeycloakId.substring(0, 8)}...</h3>
                    <p className="assigned-date">
                      Assigned: {formatDate(patient.assignedAt)}
                    </p>
                    {patient.notes && (
                      <p className="patient-notes">
                        <strong>Notes:</strong> {patient.notes}
                      </p>
                    )}
                  </div>
                  <div className="patient-actions">
                    <button className="action-btn">View Journals →</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
<div className="actions-grid">
  <button 
    className="action-card"
    onClick={() => navigate('/create-appointment-slot')}
  >
    <span className="action-icon">📅</span>
    <span>Create Appointment</span>
  </button>
  
  <button 
    className="action-card"
    onClick={() => navigate('/my-appointments')}
  >
    <span className="action-icon">🗓️</span>
    <span>My Appointments</span>
  </button>
  
  <button className="action-card" disabled>
    <span className="action-icon">📝</span>
    <span>Review Journals</span>
  </button>
  
  <button className="action-card" disabled>
    <span className="action-icon">💬</span>
    <span>Send Message</span>
  </button>
</div>
          <p className="coming-soon-note">
            These features are coming soon!
          </p>
        </div>
      </div>
    </div>
  );
}