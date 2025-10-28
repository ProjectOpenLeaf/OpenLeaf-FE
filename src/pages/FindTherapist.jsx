import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assignTherapist } from '../services/AssignmentService';
import { getTherapists } from '../services/UserService';
import { getUserId } from '../utils/roleUtils';
import '../css/FindTherapist.css';

export default function FindTherapist({ keycloak }) {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadTherapists();
  }, []);

  const loadTherapists = async () => {
    try {
      setLoading(true);
      
      // Fetch all users from backend
      const allUsers = await getTherapists();
      
      // For now, we show all users
      // In a real implementation, you'd filter by role on backend
      // Or add a 'role' column to your database
      setTherapists(allUsers);
      
      setError(null);
    } catch (err) {
      console.error('Error loading therapists:', err);
      setError('Failed to load therapists');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (therapistKeycloakId) => {
    try {
      setConnecting(therapistKeycloakId);
      setError(null);
      
      const patientId = getUserId(keycloak);
      
      await assignTherapist(patientId, therapistKeycloakId, 'Patient self-assigned');
      
      alert('Successfully connected with therapist!');
      navigate('/dashboard');
      
    } catch (err) {
      console.error('Error connecting with therapist:', err);
      
      if (err.response?.data?.message?.includes('already exists')) {
        setError('You are already connected with this therapist');
      } else {
        setError('Failed to connect with therapist. Please try again.');
      }
    } finally {
      setConnecting(null);
    }
  };

  if (loading) {
    return (
      <div className="find-therapist-container">
        <div className="loading">Loading therapists...</div>
      </div>
    );
  }

  return (
    <div className="find-therapist-container">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Find Your Therapist</h1>
        <p className="subtitle">Choose a therapist to start your journey</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="therapists-grid">
        {therapists.map((therapist) => (
          <div key={therapist.keycloakId} className="therapist-card">
            <div className="therapist-avatar">
              <span className="avatar-icon">👨‍⚕️</span>
            </div>
            
            <div className="therapist-info">
              <h3>{therapist.firstName} {therapist.lastName}</h3>
              <p className="username">@{therapist.username}</p>
              
              <div className="therapist-details">
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{therapist.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Member since:</span>
                  <span className="detail-value">
                    {new Date(therapist.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <button
              className="connect-btn"
              onClick={() => handleConnect(therapist.keycloakId)}
              disabled={connecting === therapist.keycloakId}
            >
              {connecting === therapist.keycloakId ? 'Connecting...' : 'Connect with Therapist'}
            </button>
          </div>
        ))}

        {therapists.length === 0 && (
          <div className="empty-state">
            <h3>No Therapists Available</h3>
            <p>Please check back later or contact support.</p>
          </div>
        )}
      </div>
    </div>
  );
}