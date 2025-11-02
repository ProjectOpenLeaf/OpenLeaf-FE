// ***********************************************
// This file is processed and loaded automatically before test files.
// You can change the location of this file or turn off processing it by
// modifying the `supportFile` config option.
// ***********************************************

// Import keycloak mocking utilities
import './keycloak-mock';

// Custom command to login as patient
Cypress.Commands.add('loginAsPatient', () => {
  cy.intercept('GET', '**/api/user-profiles/me', {
    statusCode: 200,
    body: {
      id: 'patient-123',
      keycloakId: 'patient-kc-123',
      role: 'PATIENT',
      email: 'patient@test.com',
      firstName: 'John',
      lastName: 'Doe'
    }
  }).as('getProfile');

  cy.setupKeycloakMock('patient');
  cy.visit('/dashboard');
  cy.wait('@getProfile');
});

// Custom command to login as therapist
Cypress.Commands.add('loginAsTherapist', () => {
  cy.intercept('GET', '**/api/user-profiles/me', {
    statusCode: 200,
    body: {
      id: 'therapist-123',
      keycloakId: 'therapist-kc-123',
      role: 'THERAPIST',
      email: 'therapist@test.com',
      firstName: 'Dr. Sarah',
      lastName: 'Smith'
    }
  }).as('getProfile');

  cy.setupKeycloakMock('therapist');
  cy.visit('/therapist/dashboard');
  cy.wait('@getProfile');
});

// Custom command to mock journals
Cypress.Commands.add('mockJournals', (journals = []) => {
  const defaultJournals = [
    {
      id: 'journal-1',
      content: 'Today was a good day. I felt productive and energized.',
      mood: 'HAPPY',
      createdAt: '2025-11-01T10:00:00',
      tags: ['productivity', 'energy']
    },
    {
      id: 'journal-2',
      content: 'Feeling a bit anxious about the upcoming presentation.',
      mood: 'ANXIOUS',
      createdAt: '2025-11-02T14:30:00',
      tags: ['anxiety', 'work']
    }
  ];

  cy.intercept('GET', '**/api/journals*', {
    statusCode: 200,
    body: journals.length > 0 ? journals : defaultJournals
  }).as('getJournals');
});

// Custom command to mock appointments
Cypress.Commands.add('mockAppointments', (appointments = []) => {
  const defaultAppointments = [
    {
      id: 'appointment-1',
      therapistKeycloakId: 'therapist-kc-123',
      patientKeycloakId: 'patient-kc-123',
      startTime: '2025-12-01T10:00:00',
      endTime: '2025-12-01T11:00:00',
      status: 'CONFIRMED'
    }
  ];

  cy.intercept('GET', '**/api/appointments/user', {
    statusCode: 200,
    body: appointments.length > 0 ? appointments : defaultAppointments
  }).as('getUserAppointments');
});

// Custom command to create a journal entry
Cypress.Commands.add('createJournal', (content, mood = 'NEUTRAL') => {
  cy.intercept('POST', '**/api/journals', {
    statusCode: 201,
    body: {
      id: `journal-${Date.now()}`,
      content: content,
      mood: mood,
      createdAt: new Date().toISOString()
    }
  }).as('createJournal');

  cy.visit('/journals/create');
  cy.get('textarea[name="content"]').type(content);
  if (mood !== 'NEUTRAL') {
    cy.get('select[name="mood"]').select(mood);
  }
  cy.contains('button', 'Save').click();
  cy.wait('@createJournal');
});

// Custom command to create an appointment slot (therapist)
Cypress.Commands.add('createAppointmentSlot', (date, startTime, endTime, notes = '') => {
  cy.intercept('POST', '**/api/appointments', {
    statusCode: 201,
    body: {
      id: `slot-${Date.now()}`,
      therapistKeycloakId: 'therapist-kc-123',
      startTime: `${date}T${startTime}:00`,
      endTime: `${date}T${endTime}:00`,
      status: 'AVAILABLE',
      notes: notes
    }
  }).as('createSlot');

  cy.visit('/create-appointment-slot');
  cy.get('input[type="date"]').type(date);
  cy.get('input[type="time"]').first().type(startTime);
  cy.get('input[type="time"]').last().type(endTime);
  if (notes) {
    cy.get('textarea').type(notes);
  }
  cy.contains('button', 'Create Slot').click();
  cy.wait('@createSlot');
});

// Custom command to book an appointment (patient)
Cypress.Commands.add('bookAppointment', (slotId, notes = '') => {
  cy.intercept('POST', `**/api/appointments/${slotId}/book`, {
    statusCode: 200,
    body: {
      id: `appointment-${Date.now()}`,
      appointmentId: slotId,
      patientKeycloakId: 'patient-kc-123',
      therapistKeycloakId: 'therapist-kc-123',
      status: 'CONFIRMED',
      notes: notes
    }
  }).as('bookAppointment');

  if (notes) {
    cy.get('textarea[placeholder*="notes"]').type(notes);
  }
  cy.contains('button', 'Book Appointment').click();
  cy.wait('@bookAppointment');
});

// Command to check if element is visible in viewport
Cypress.Commands.add('isInViewport', { prevSubject: true }, (subject) => {
  const rect = subject[0].getBoundingClientRect();
  
  expect(rect.top).to.be.at.least(0);
  expect(rect.left).to.be.at.least(0);
  expect(rect.bottom).to.be.lessThan(window.innerHeight);
  expect(rect.right).to.be.lessThan(window.innerWidth);
  
  return subject;
});

// Global beforeEach to set up common intercepts
beforeEach(() => {
  // Intercept health checks or common API calls
  cy.intercept('GET', '**/health', { statusCode: 200 }).as('healthCheck');
  
  // Intercept Keycloak configuration if needed
  cy.intercept('GET', '**/keycloak.json', {
    statusCode: 200,
    body: {
      realm: 'openleaf',
      'auth-server-url': 'http://localhost:8080/auth/',
      'ssl-required': 'external',
      resource: 'openleaf-frontend',
      'public-client': true,
      'confidential-port': 0
    }
  }).as('getKeycloakConfig');
});

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore ResizeObserver errors which can occur in some browsers
  if (err.message.includes('ResizeObserver')) {
    return false;
  }
  // Ignore Keycloak related errors in tests
  if (err.message.includes('keycloak')) {
    return false;
  }
  // Let other errors fail the test
  return true;
});