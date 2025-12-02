import axios from 'axios';
import keycloak from '../components/keycloak.js';

const API_BASE_URL = 'https://localhost:8443/api/appointments';

/**
 * Create an appointment slot (Therapist only)
 */
export const createAppointmentSlot = async (startTime, endTime, notes) => {
  const response = await axios.post(
    API_BASE_URL,
    {
      startTime,
      endTime,
      notes
    },
    {
      headers: {
        'Authorization': `Bearer ${keycloak.token}`
      }
    }
  );
  
  return response.data;
};

/**
 * Get available appointment slots for a therapist
 */
export const getAvailableSlots = async (therapistId) => {
  const response = await axios.get(
    `${API_BASE_URL}/therapist/${therapistId}/available`,
    {
      headers: {
        'Authorization': `Bearer ${keycloak.token}`
      }
    }
  );
  
  return response.data;
};

/**
 * Book an appointment (Patient only)
 */
export const bookAppointment = async (appointmentId, notes) => {
  const response = await axios.post(
    `${API_BASE_URL}/${appointmentId}/book`,
    notes ? { notes } : {},
    {
      headers: {
        'Authorization': `Bearer ${keycloak.token}`
      }
    }
  );
  
  return response.data;
};

/**
 * Cancel an appointment
 */
export const cancelAppointment = async (appointmentId) => {
  const response = await axios.delete(
    `${API_BASE_URL}/${appointmentId}`,
    {
      headers: {
        'Authorization': `Bearer ${keycloak.token}`
      }
    }
  );
  
  return response.data;
};

/**
 * Get all appointments for the current user
 */
export const getUserAppointments = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/user`,
    {
      headers: {
        'Authorization': `Bearer ${keycloak.token}`
      }
    }
  );
  
  return response.data;
};


const schedulingService = {
  createAppointmentSlot,
  getAvailableSlots,
  bookAppointment,
  cancelAppointment,
  getUserAppointments,
};

export default schedulingService;






