/**
 * Utility functions for checking user roles
 */

/**
 * Get roles from Keycloak token
 * @param {Object} keycloak - Keycloak instance
 * @returns {Array} - Array of role strings
 */
export const getUserRoles = (keycloak) => {
  if (!keycloak.tokenParsed) return [];
  
  const resourceAccess = keycloak.tokenParsed.resource_access;
  const clientId = 'openleaf-rest-api'; // Your Keycloak client ID
  
  if (resourceAccess && resourceAccess[clientId]) {
    return resourceAccess[clientId].roles || [];
  }
  
  return [];
};

/**
 * Check if user has a specific role
 * @param {Object} keycloak - Keycloak instance
 * @param {string} role - Role to check
 * @returns {boolean}
 */
export const hasRole = (keycloak, role) => {
  const roles = getUserRoles(keycloak);
  return roles.includes(role);
};

/**
 * Check if user is an admin
 * @param {Object} keycloak - Keycloak instance
 * @returns {boolean}
 */
export const isAdmin = (keycloak) => {
  return hasRole(keycloak, 'admin');
};

/**
 * Check if user is a therapist
 * @param {Object} keycloak - Keycloak instance
 * @returns {boolean}
 */
export const isTherapist = (keycloak) => {
  return hasRole(keycloak, 'client_therapist');
};

/**
 * Check if user is a patient (has 'user' role in Keycloak)
 * @param {Object} keycloak - Keycloak instance
 * @returns {boolean}
 */
export const isPatient = (keycloak) => {
  return hasRole(keycloak, 'client_user');
};

/**
 * Get user's Keycloak ID
 * @param {Object} keycloak - Keycloak instance
 * @returns {string}
 */
export const getUserId = (keycloak) => {
  return keycloak.tokenParsed?.sub || '';
};

/**
 * Get user's username
 * @param {Object} keycloak - Keycloak instance
 * @returns {string}
 */
export const getUsername = (keycloak) => {
  return keycloak.tokenParsed?.preferred_username || '';
};

const roleUtils = {
  getUserRoles,
  hasRole,
  isAdmin,
  isTherapist,
  isPatient,
  getUserId,
  getUsername
};

export default roleUtils;