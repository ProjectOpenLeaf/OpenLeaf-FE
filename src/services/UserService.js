import axios from 'axios';
import keycloak from '../components/keycloak.js'

const API_BASE_URL = 'http://localhost:8081/api/users';

/**
 * Register user in the backend database
 */
export const registerUser = async () => {
  const tokenParsed = keycloak.tokenParsed;
  
  const response = await axios.post(
    `${API_BASE_URL}/register`,
    {
      keycloakId: tokenParsed.sub,
      username: tokenParsed.preferred_username,
      email: tokenParsed.email,
      firstName: tokenParsed.given_name,
      lastName: tokenParsed.family_name
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

const userService = {
  registerUser,
  getCurrentUser
};

export default userService;