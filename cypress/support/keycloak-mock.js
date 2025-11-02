// Keycloak Mock Helper
// This file provides utilities to mock Keycloak authentication in Cypress tests

// Create a valid JWT token format (header.payload.signature)
// This is a mock token that jwt-decode can parse
const createMockJWT = (payload) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadStr = btoa(JSON.stringify(payload));
  const signature = 'mock-signature';
  return `${header}.${payloadStr}.${signature}`;
};

const patientPayload = {
  sub: 'patient-kc-123',
  preferred_username: 'john.doe',
  email: 'patient@test.com',
  given_name: 'John',
  family_name: 'Doe',
  realm_access: {
    roles: ['patient']
  },
  resource_access: {
    'openleaf-rest-api': {
      roles: ['client_user'] // ✅ This is the key - your app checks for 'client_user'
    }
  },
  exp: Math.floor(Date.now() / 1000) + 3600,
  iat: Math.floor(Date.now() / 1000)
};

const therapistPayload = {
  sub: 'therapist-kc-123',
  preferred_username: 'dr.smith',
  email: 'therapist@test.com',
  given_name: 'Dr. Sarah',
  family_name: 'Smith',
  realm_access: {
    roles: ['therapist']
  },
  resource_access: {
    'openleaf-rest-api': {
      roles: ['client_therapist'] // ✅ This is the key - your app checks for 'client_therapist'
    }
  },
  exp: Math.floor(Date.now() / 1000) + 3600,
  iat: Math.floor(Date.now() / 1000)
};

export const mockKeycloakPatient = {
  authenticated: true,
  token: createMockJWT(patientPayload),
  refreshToken: createMockJWT({ ...patientPayload, typ: 'Refresh' }),
  idToken: createMockJWT(patientPayload),
  tokenParsed: patientPayload,
  realmAccess: {
    roles: ['patient']
  },
  resourceAccess: {
    'openleaf-rest-api': {
      roles: ['client_user']
    }
  },
  hasRealmRole: (role) => role === 'patient',
  hasResourceRole: (resource, role) => {
    if (resource === 'openleaf-rest-api') {
      return role === 'client_user';
    }
    return false;
  },
  logout: () => {
    console.log('Mock logout called');
  },
  updateToken: () => {
    console.log('Mock updateToken called');
    return Promise.resolve(true);
  },
  clearToken: () => {
    console.log('Mock clearToken called');
  },
  loadUserProfile: () => Promise.resolve({
    username: 'john.doe',
    email: 'patient@test.com',
    firstName: 'John',
    lastName: 'Doe'
  }),
  init: () => {
    console.log('Mock init called');
    return Promise.resolve(true);
  }
};

export const mockKeycloakTherapist = {
  authenticated: true,
  token: createMockJWT(therapistPayload),
  refreshToken: createMockJWT({ ...therapistPayload, typ: 'Refresh' }),
  idToken: createMockJWT(therapistPayload),
  tokenParsed: therapistPayload,
  realmAccess: {
    roles: ['therapist']
  },
  resourceAccess: {
    'openleaf-rest-api': {
      roles: ['client_therapist']
    }
  },
  hasRealmRole: (role) => role === 'therapist',
  hasResourceRole: (resource, role) => {
    if (resource === 'openleaf-rest-api') {
      return role === 'client_therapist';
    }
    return false;
  },
  logout: () => {
    console.log('Mock logout called');
  },
  updateToken: () => {
    console.log('Mock updateToken called');
    return Promise.resolve(true);
  },
  clearToken: () => {
    console.log('Mock clearToken called');
  },
  loadUserProfile: () => Promise.resolve({
    username: 'dr.smith',
    email: 'therapist@test.com',
    firstName: 'Dr. Sarah',
    lastName: 'Smith'
  }),
  init: () => {
    console.log('Mock init called');
    return Promise.resolve(true);
  }
};

// Function to inject Keycloak mock into window
export function injectKeycloakMock(win, keycloakMock) {
  // Set immediately as window.keycloak
  win.keycloak = keycloakMock;
  
  // Also set in localStorage if your app checks there
  win.localStorage.setItem('kc_token', keycloakMock.token);
  win.localStorage.setItem('kc_authenticated', 'true');
  
  // Mock the Keycloak constructor
  win.Keycloak = function() {
    return keycloakMock;
  };
  
  console.log('✅ Keycloak mock injected:', {
    authenticated: keycloakMock.authenticated,
    username: keycloakMock.tokenParsed.preferred_username,
    realmRoles: keycloakMock.realmAccess.roles,
    clientRoles: keycloakMock.tokenParsed.resource_access?.['openleaf-rest-api']?.roles,
    tokenValid: keycloakMock.token.split('.').length === 3
  });
}