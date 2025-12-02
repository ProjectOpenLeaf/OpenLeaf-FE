import axios from 'axios';
import keycloak from '../components/keycloak.js'

const API_BASE_URL = 'https://localhost:8443/api/users';

/**
 * Register user in the backend database
 */
export const registerUser = async () => {
  const tokenParsed = keycloak.tokenParsed;

  // Extract roles for your client only
  const clientRoles =
    tokenParsed?.resource_access?.['openleaf-rest-api']?.roles || [];

  // Optional: flatten array to ensure no duplicates
  const roles = Array.from(new Set(clientRoles));

  // Send to backend
  const response = await axios.post(
    `${API_BASE_URL}/register`,
    {
      keycloakId: tokenParsed.sub,
      username: tokenParsed.preferred_username,
      email: tokenParsed.email,
      firstName: tokenParsed.given_name,
      lastName: tokenParsed.family_name,
      roles, // <- flat array here
    },
    {
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
      }
    }
  );

  return response.data;
};

/**
 * Get current user info (for future use)
 */
export const getCurrentUser = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/me`,
    {
      headers: {
        'Authorization': `Bearer ${keycloak.token}`
      }
    }
  );
  
  return response.data;
};

/**
 * Get all therapists
 * Note: Currently returns all users - you'll need to filter manually
 * or add role column to database in the future
 */
export const getTherapists = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/therapists`,
    {
      headers: {
        'Authorization': `Bearer ${keycloak.token}`
      }
    }
  );
  
  return response.data;
};

export const deleteUser = async (keycloakId, reason = 'User requested') => {
  const response = await axios.delete(
    `${API_BASE_URL}/${keycloakId}`,
    {
      params: { reason: reason },
      headers: { 'Authorization': `Bearer ${keycloak.token}` }
    }
  );
  return response.data;
};

const userService = {
  registerUser,
  getCurrentUser,
  getTherapists,
  deleteUser
};

export default userService;