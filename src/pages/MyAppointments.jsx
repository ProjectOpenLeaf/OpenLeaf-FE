import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserAppointments, cancelAppointment } from '../services/SchedulingService';
import { getUserId, isTherapist } from '../utils/roleUtils';
import Navigation from '../components/Navigation';
import '../css/MyAppointments.css';

export default function MyAppointments({ keycloak }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const navigate = useNavigate();

  const userIsTherapist = isTherapist(keycloak);
  const userId = getUserId(keycloak);
  const username = keycloak.tokenParsed.preferred_username

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await getUserAppointments();
      
      const sortedAppointments = data.sort((a, b) => 
        new Date(a.startTime) - new Date(b.startTime)
      );
      
      setAppointments(sortedAppointments);
      setError(null);
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      setCancelling(appointmentId);
      await cancelAppointment(appointmentId);
      alert('Appointment cancelled successfully');
      loadAppointments();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      if (err.response?.data) {
        alert(`Failed to cancel appointment: ${err.response.data}`);
      } else {
        alert('Failed to cancel appointment. Please try again.');
      }
    } finally {
      setCancelling(null);
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMinutes = (end - start) / (1000 * 60);
    return `${durationMinutes} minutes`;
  };

  const getStatusBadgeClass = (status) => {
    const baseClass = 'status-badge';
    switch (status) {
      case 'AVAILABLE':
        return `${baseClass} status-available`;
      case 'BOOKED':
        return `${baseClass} status-booked`;
      case 'CANCELLED':
        return `${baseClass} status-cancelled`;
      case 'COMPLETED':
        return `${baseClass} status-completed`;
      default:
        return baseClass;
    }
  };

  const canCancel = (appointment) => {
    if (appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED') {
      return false;
    }
    return new Date(appointment.startTime) > new Date();
  };

  if (loading) {
    return (
      <>
        <Navigation keycloak={keycloak} />
        <div className="my-appointments-container">
          <div className="loading">Loading appointments...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation keycloak={keycloak} />
      <div className="my-appointments-container">
        <div className="appointments-header">
          <h1>My Appointments</h1>
          {userIsTherapist && (
            <button 
              className="create-button"
              onClick={() => navigate('/create-appointment-slot')}
            >
              + Create Appointment Slot
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {appointments.length === 0 ? (
          <div className="no-appointments">
            <p>You don't have any appointments yet.</p>
            {userIsTherapist ? (
              <p>Create appointment slots to allow patients to book sessions with you.</p>
            ) : (
              <p>Browse available therapists to book your first appointment.</p>
            )}
          </div>
        ) : (
          <div className="appointments-list">
            {appointments.map((appointment) => {
              const isMyAppointmentAsTherapist = 
                userIsTherapist && appointment.therapistKeycloakId === userId;
              const isMyAppointmentAsPatient = 
                !userIsTherapist && appointment.patientKeycloakId === userId;

              return (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-header-row">
                    <div className="appointment-time">
                      <span className="time-icon">📅</span>
                      {formatDateTime(appointment.startTime)}
                    </div>
                    <span className={getStatusBadgeClass(appointment.status)}>
                      {appointment.status}
                    </span>
                  </div>

                  <div className="appointment-details">
                    <div className="detail-row">
                      <span className="detail-icon">⏱️</span>
                      <span className="detail-text">
                        {getDuration(appointment.startTime, appointment.endTime)}
                      </span>
                    </div>

                    {appointment.notes && (
                      <div className="detail-row">
                        <span className="detail-icon">📝</span>
                        <span className="detail-text">{appointment.notes}</span>
                      </div>
                    )}

                    {isMyAppointmentAsTherapist && appointment.patientKeycloakId && (
                      <div className="detail-row">
                        <span className="detail-icon">👤</span>
                        <span className="detail-text">
                          Patient: {appointment.patientKeycloakId.substring(0, 8)}...
                        </span>
                      </div>
                    )}

                    {isMyAppointmentAsPatient && (
                      <div className="detail-row">
                        <span className="detail-icon">👨‍⚕️</span>
                        <span className="detail-text">
                          Therapist: {appointment.therapistKeycloakId.substring(0, 8)}...
                        </span>
                      </div>
                    )}
                  </div>

                  {canCancel(appointment) && (
                    <div className="appointment-actions">
                      <button
                        className="cancel-button"
                        onClick={() => handleCancelAppointment(appointment.id)}
                        disabled={cancelling === appointment.id}
                      >
                        {cancelling === appointment.id ? 'Cancelling...' : 'Cancel Appointment'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}