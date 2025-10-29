/**
 * Check if the current user is a therapist
 */
export const isTherapist = (keycloak) => {
  if (!keycloak.tokenParsed) {
    return false;
  }
  
  const clientRoles = keycloak.tokenParsed?.resource_access?.['openleaf-rest-api']?.roles || [];
  return clientRoles.includes('client_therapist');
};

/**
 * Check if the current user is a patient
 */
export const isPatient = (keycloak) => {
  if (!keycloak.tokenParsed) {
    return false;
  }
  
  const clientRoles = keycloak.tokenParsed?.resource_access?.['openleaf-rest-api']?.roles || [];
    console.log(clientRoles)
  return clientRoles.includes('client_user');
};

/**
 * Get the current user's Keycloak ID
 */
export const getUserId = (keycloak) => {
  return keycloak.tokenParsed?.sub || null;
};

/**
 * Get the current user's roles
 */
export const getUserRoles = (keycloak) => {
  if (!keycloak.tokenParsed) {
    return [];
  }
  
  return keycloak.tokenParsed?.resource_access?.['openleaf-rest-api']?.roles || [];
};