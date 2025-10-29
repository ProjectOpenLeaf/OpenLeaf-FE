import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAvailableSlots, bookAppointment } from '../services/SchedulingService';
import Navigation from '../components/Navigation';
import '../css/BookAppointment.css';

export default function BookAppointment({ keycloak }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingSlot, setBookingSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const { therapistId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadAvailableSlots();
  }, [therapistId]);

  const loadAvailableSlots = async () => {
    try {
      setLoading(true);
      const data = await getAvailableSlots(therapistId);
      
      const sortedSlots = data.sort((a, b) => 
        new Date(a.startTime) - new Date(b.startTime)
      );
      
      setSlots(sortedSlots);
      setError(null);
    } catch (err) {
      console.error('Error loading available slots:', err);
      setError('Failed to load available slots. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to book this appointment?')) {
      return;
    }

    try {
      setBookingSlot(appointmentId);
      await bookAppointment(appointmentId, notes);
      alert('Appointment booked successfully!');
      navigate('/my-appointments');
    } catch (err) {
      console.error('Error booking appointment:', err);
      if (err.response?.data) {
        alert(`Failed to book appointment: ${err.response.data}`);
      } else {
        alert('Failed to book appointment. Please try again.');
      }
    } finally {
      setBookingSlot(null);
      setNotes('');
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

  if (loading) {
    return (
      <>
        <Navigation keycloak={keycloak} />
        <div className="book-appointment-container">
          <div className="loading">Loading available appointments...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation keycloak={keycloak} />
      <div className="book-appointment-container">
        <div className="book-appointment-header">
          <h1>Book an Appointment</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        {slots.length === 0 ? (
          <div className="no-slots">
            <p>No available appointment slots at this time.</p>
            <p>Please check back later or contact your therapist.</p>
          </div>
        ) : (
          <div className="slots-list">
            {slots.map((slot) => (
              <div key={slot.id} className="slot-card">
                <div className="slot-info">
                  <div className="slot-time">
                    <span className="time-label">📅 </span>
                    {formatDateTime(slot.startTime)}
                  </div>
                  <div className="slot-duration">
                    <span className="duration-label">⏱️ </span>
                    {getDuration(slot.startTime, slot.endTime)}
                  </div>
                  {slot.notes && (
                    <div className="slot-notes">
                      <span className="notes-label">📝 </span>
                      {slot.notes}
                    </div>
                  )}
                </div>
                
                <div className="slot-actions">
                  <textarea
                    className="booking-notes"
                    placeholder="Add notes for your therapist (optional)..."
                    value={bookingSlot === slot.id ? notes : ''}
                    onChange={(e) => {
                      setBookingSlot(slot.id);
                      setNotes(e.target.value);
                    }}
                    rows="2"
                  />
                  <button
                    className="book-button"
                    onClick={() => handleBookSlot(slot.id)}
                    disabled={bookingSlot !== null}
                  >
                    {bookingSlot === slot.id ? 'Booking...' : 'Book Appointment'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}