// Custom commands for authentication and common operations

// Mock Keycloak authentication
Cypress.Commands.add('mockKeycloakAuth', (role = 'PATIENT') => {
  cy.window().then((win) => {
    // Mock Keycloak instance
    win.keycloak = {
      authenticated: true,
      token: 'mock-token-' + Date.now(),
      tokenParsed: {
        sub: role === 'PATIENT' ? 'patient-kc-123' : 'therapist-kc-123',
        preferred_username: role === 'PATIENT' ? 'john.doe' : 'dr.smith',
        email: role === 'PATIENT' ? 'patient@test.com' : 'therapist@test.com',
        given_name: role === 'PATIENT' ? 'John' : 'Dr. Sarah',
        family_name: role === 'PATIENT' ? 'Doe' : 'Smith',
        realm_access: {
          roles: [role.toLowerCase()]
        }
      },
      realmAccess: {
        roles: [role.toLowerCase()]
      },
      hasRealmRole: (roleName) => {
        return roleName.toLowerCase() === role.toLowerCase();
      },
      logout: cy.stub().as('keycloakLogout'),
      updateToken: cy.stub().resolves(true),
      loadUserProfile: cy.stub().resolves({
        username: role === 'PATIENT' ? 'john.doe' : 'dr.smith',
        email: role === 'PATIENT' ? 'patient@test.com' : 'therapist@test.com'
      })
    };

    // Store token in localStorage (if your app uses it)
    win.localStorage.setItem('kc_token', win.keycloak.token);
    win.localStorage.setItem('kc_authenticated', 'true');
  });
});

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

  cy.visit('/dashboard');
  cy.wait('@getProfile');
});

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

  cy.visit('/therapist/dashboard');
  cy.wait('@getProfile');
});

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

Cypress.Commands.add('mockAppointments', (appointments = []) => {
  const defaultAppointments = [
    {
      id: 'appointment-1',
      therapistId: 'therapist-123',
      therapistName: 'Dr. Sarah Smith',
      patientId: 'patient-123',
      startTime: '2025-12-01T10:00:00',
      endTime: '2025-12-01T11:00:00',
      status: 'CONFIRMED'
    }
  ];

  cy.intercept('GET', '**/api/scheduling/appointments/my-appointments', {
    statusCode: 200,
    body: appointments.length > 0 ? appointments : defaultAppointments
  }).as('getMyAppointments');
});

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
  cy.get('textarea').type(content);
  if (mood !== 'NEUTRAL') {
    cy.get(`select[name="mood"]`).select(mood);
  }
  cy.contains('button', 'Save').click();
  cy.wait('@createJournal');
});

// Command to check if an element is visible in viewport
Cypress.Commands.add('isInViewport', { prevSubject: true }, (subject) => {
  const rect = subject[0].getBoundingClientRect();
  
  expect(rect.top).to.be.at.least(0);
  expect(rect.left).to.be.at.least(0);
  expect(rect.bottom).to.be.lessThan(window.innerHeight);
  expect(rect.right).to.be.lessThan(window.innerWidth);
  
  return subject;
});