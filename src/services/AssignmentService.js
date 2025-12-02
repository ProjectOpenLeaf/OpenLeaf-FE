import axios from 'axios';
import keycloak from '../components/keycloak.js';

const API_BASE_URL = 'https://localhost:8443/api/assignments';

/**
 * Assign a therapist to a patient (Admin only)
 */
export const assignTherapist = async (patientKeycloakId, therapistKeycloakId, notes) => {
  const response = await axios.post(
    `${API_BASE_URL}/assign`,
    {
      patientKeycloakId,
      therapistKeycloakId,
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
 * Get all patients assigned to a therapist
 */
export const getTherapistPatients = async (therapistKeycloakId) => {
  const response = await axios.get(
    `${API_BASE_URL}/therapist/${therapistKeycloakId}/patients`,
    {
      headers: {
        'Authorization': `Bearer ${keycloak.token}`
      }
    }
  );
  
  return response.data;
};

/**
 * Check if a therapist is authorized to access a patient's data
 */
export const checkAuthorization = async (therapistKeycloakId, patientKeycloakId) => {
  const response = await axios.get(
    `${API_BASE_URL}/check`,
    {
      params: {
        therapistId: therapistKeycloakId,
        patientId: patientKeycloakId
      },
      headers: {
        'Authorization': `Bearer ${keycloak.token}`
      }
    }
  );
  
  return response.data;
};

/**
 * Unassign a therapist from a patient (Admin only)
 */
export const unassignTherapist = async (assignmentId) => {
  const response = await axios.delete(
    `${API_BASE_URL}/${assignmentId}`,
    {
      headers: {
        'Authorization': `Bearer ${keycloak.token}`
      }
    }
  );
  
  return response.data;
};

export const getPatientTherapist = async (patientKeycloakId) => {
  const response = await axios.get(
    `${API_BASE_URL}/patient/${patientKeycloakId}/therapist`,
    {
      headers: {
        'Authorization': `Bearer ${keycloak.token}`
      }
    }
  );
  
  return response.data;
};

const assignmentService = {
  assignTherapist,
  getTherapistPatients,
  checkAuthorization,
  unassignTherapist,
  getPatientTherapist
};

export default assignmentService;