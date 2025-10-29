import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assignTherapist, getPatientTherapist } from '../services/AssignmentService';
import { getTherapists } from '../services/UserService';
import { getUserId } from '../utils/roleUtils';
import Navigation from '../components/Navigation';
import '../css/FindTherapist.css';

export default function FindTherapist({ keycloak }) {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [myTherapist, setMyTherapist] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Check if patient already has a therapist
      const patientId = getUserId(keycloak);
      try {
        const therapistData = await getPatientTherapist(patientId);
        setMyTherapist(therapistData);
      } catch (err) {
        console.log('No therapist assigned yet');
      }
      
      // Load all therapists
      const allUsers = await getTherapists();
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
      navigate(`/book-appointment/${therapistKeycloakId}`);
      
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

  const handleBookAppointment = (therapistKeycloakId) => {
    navigate(`/book-appointment/${therapistKeycloakId}`);
  };

  if (loading) {
    return (
      <>
        <Navigation keycloak={keycloak} />
        <div className="find-therapist-container">
          <div className="loading">Loading therapists...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation keycloak={keycloak} />
      <div className="find-therapist-container">
        <div className="find-therapist-header">
          <h1>Find a Therapist</h1>
          {myTherapist && (
            <div className="current-therapist-notice">
              ✓ You are currently connected with a therapist
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {therapists.length === 0 ? (
          <div className="no-therapists">
            <p>No therapists available at this time.</p>
          </div>
        ) : (
          <div className="therapists-list">
            {therapists.map((therapist) => {
              const isMyTherapist = myTherapist?.therapistKeycloakId === therapist.keycloakId;
              
              return (
                <div key={therapist.keycloakId} className="therapist-card">
                  <div className="therapist-info">
                    <div className="therapist-avatar">👨‍⚕️</div>
                    <div className="therapist-details">
                      <h3>{therapist.username}</h3>
                      <p>{therapist.email}</p>
                      {isMyTherapist && (
                        <span className="my-therapist-badge">Your Therapist</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="therapist-actions">
                    {isMyTherapist ? (
                      <button
                        className="book-button"
                        onClick={() => handleBookAppointment(therapist.keycloakId)}
                      >
                        📅 Book Appointment
                      </button>
                    ) : myTherapist ? (
                      <button className="connect-button" disabled>
                        Already Assigned
                      </button>
                    ) : (
                      <button
                        className="connect-button"
                        onClick={() => handleConnect(therapist.keycloakId)}
                        disabled={connecting !== null}
                      >
                        {connecting === therapist.keycloakId ? 'Connecting...' : 'Connect'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}