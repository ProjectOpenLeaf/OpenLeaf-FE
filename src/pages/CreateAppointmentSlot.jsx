import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAppointmentSlot } from '../services/SchedulingService';
import Navigation from '../components/Navigation';
import '../css/CreateAppointmentSlot.css';

export default function CreateAppointmentSlot({ keycloak }) {
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!startDate || !startTime || !endTime) {
      setError('Please fill in all required fields');
      return;
    }

    const startDateTime = `${startDate}T${startTime}:00`;
    const endDateTime = `${startDate}T${endTime}:00`;

    if (new Date(endDateTime) <= new Date(startDateTime)) {
      setError('End time must be after start time');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      
      await createAppointmentSlot(startDateTime, endDateTime, notes);
      
      alert('Appointment slot created successfully!');
      navigate('/my-appointments');
      
    } catch (err) {
      console.error('Error creating appointment slot:', err);
      if (err.response?.data) {
        setError(err.response.data);
      } else {
        setError('Failed to create appointment slot. Please try again.');
      }
    } finally {
      setCreating(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <Navigation keycloak={keycloak} />
      <div className="create-slot-container">
        <div className="create-slot-header">
          <h1>Create Appointment Slot</h1>
          <p className="subtitle">Set up a new available time slot for your patients</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="create-slot-form">
          <div className="form-group">
            <label htmlFor="startDate">Date *</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={today}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Start Time *</label>
              <input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endTime">End Time *</label>
              <input
                type="time"
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this appointment slot..."
              rows="4"
            />
            <small className="help-text">
              These notes will be visible to patients when they book this slot
            </small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate('/my-appointments')}
              disabled={creating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create Appointment Slot'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}