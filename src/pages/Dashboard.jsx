import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyJournals } from '../services/JournalService';
import { getPatientTherapist } from '../services/AssignmentService';
import { getUserId } from '../utils/roleUtils';
import Navigation from '../components/Navigation';
import '../css/Dashboard.css';

export default function Dashboard({ keycloak }) {
  const navigate = useNavigate();
  const [recentJournals, setRecentJournals] = useState([]);
  const [therapist, setTherapist] = useState(null);
  const [loadingJournals, setLoadingJournals] = useState(true);
  const [loadingTherapist, setLoadingTherapist] = useState(true);

  useEffect(() => {
    loadRecentJournals();
    checkTherapistAssignment();
  }, []);

  const loadRecentJournals = async () => {
    try {
      const data = await getMyJournals();
      const sortedJournals = data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecentJournals(sortedJournals.slice(0, 3));
    } catch (err) {
      console.error('Error loading journals:', err);
    } finally {
      setLoadingJournals(false);
    }
  };

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="dashboard-redesign-container">
      <Navigation keycloak={keycloak} />
      
      <div className="dashboard-content">
        <div className="welcome-section">
          <h1>Welcome back, <span className="username">{keycloak.tokenParsed?.preferred_username}</span></h1>
          <p className="subtitle">Your mental wellness journey</p>
        </div>

        {/* Quick Actions Bar */}
        <div className="quick-actions">
          <button 
            className="action-btn primary-action"
            onClick={() => navigate('/journals/create')}
          >
            <span className="action-icon">✍️</span>
            <span>New Entry</span>
          </button>
          <button 
            className="action-btn"
            onClick={() => navigate('/journals')}
          >
            <span className="action-icon">📖</span>
            <span>All Journals</span>
          </button>
          <button 
            className="action-btn"
            onClick={() => navigate('/my-appointments')}
          >
            <span className="action-icon">📅</span>
            <span>Appointments</span>
          </button>
          {!therapist && (
            <button 
              className="action-btn"
              onClick={() => navigate('/find-therapist')}
            >
              <span className="action-icon">👨‍⚕️</span>
              <span>Find Therapist</span>
            </button>
          )}
        </div>

        {/* Recent Journals Section */}
        <div className="recent-journals-section">
          <div className="section-header">
            <h2>Recent Journals</h2>
            <button 
              className="view-all-link"
              onClick={() => navigate('/journals')}
            >
              View All →
            </button>
          </div>

          {loadingJournals ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading your journals...</p>
            </div>
          ) : recentJournals.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No journal entries yet</h3>
              <p>Start your wellness journey by writing your first entry</p>
              <button 
                className="create-first-btn"
                onClick={() => navigate('/journals/create')}
              >
                Create Your First Entry
              </button>
            </div>
          ) : (
            <div className="journals-preview-grid">
              {recentJournals.map(journal => (
                <div 
                  key={journal.id}
                  className="journal-preview-card"
                  onClick={() => navigate(`/journals/${journal.id}`)}
                >
                  <div className="journal-preview-date">
                    {formatDate(journal.createdAt)}
                  </div>
                  <div className="journal-preview-content">
                    <p>{truncateContent(journal.content)}</p>
                  </div>
                  <div className="journal-preview-footer">
                    <span className="read-more">Read more →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Therapist Info Card */}
        {therapist && (
          <div className="therapist-info-card">
            <div className="therapist-header">
              <span className="therapist-icon">👨‍⚕️</span>
              <h3>Your Therapist</h3>
            </div>
            <div className="therapist-details">
              <p className="therapist-name">{therapist.name}</p>
              <p className="therapist-email">{therapist.email}</p>
            </div>
            <button 
              className="contact-therapist-btn"
              onClick={() => navigate('/book-appointment')}
            >
              Book Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}