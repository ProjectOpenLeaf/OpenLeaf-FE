import { mockKeycloakTherapist, mockKeycloakPatient, injectKeycloakMock } from '../support/keycloak-mock';

describe('Appointment Scheduling Tests', () => {
  describe('Therapist - Create Appointment Slot', () => {
    beforeEach(() => {
      // Intercept API calls
      cy.intercept('GET', '**/api/user-profiles/me', {
        statusCode: 200,
        body: {
          id: 'therapist-123',
          keycloakId: 'therapist-kc-123',
          role: 'THERAPIST',
          email: 'therapist@test.com'
        }
      }).as('getProfile');

      // Visit with Keycloak mock injected
      cy.visit('/create-appointment-slot', {
        onBeforeLoad(win) {
          injectKeycloakMock(win, mockKeycloakTherapist);
        }
      });
    });

    it('should display the create appointment slot form', () => {
      cy.get('form').should('be.visible');
      cy.get('input[type="date"]').should('exist');
      cy.get('input[type="time"]').should('have.length', 2);
    });

    it('should create a new appointment slot', () => {
      cy.intercept('POST', '**/api/scheduling/slots', {
        statusCode: 201,
        body: {
          id: 'slot-123',
          therapistId: 'therapist-123',
          startTime: '2025-12-01T10:00:00',
          endTime: '2025-12-01T11:00:00',
          status: 'AVAILABLE'
        }
      }).as('createSlot');

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];

      cy.get('input[type="date"]').type(dateString);
      cy.get('input[type="time"]').first().type('10:00');
      cy.get('input[type="time"]').last().type('11:00');
      cy.get('textarea[name="notes"]').type('Available for consultation');
      cy.contains('button', 'Create').click();

      cy.wait('@createSlot');
    });

    it('should validate end time is after start time', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];

      cy.get('input[type="date"]').type(dateString);
      cy.get('input[type="time"]').first().type('11:00');
      cy.get('input[type="time"]').last().type('10:00');
      cy.contains('button', 'Create').click();

      cy.contains('End time must be after start time').should('be.visible');
    });
  });

  describe('Patient - Book Appointment', () => {
    beforeEach(() => {
      // Intercept API calls
      cy.intercept('GET', '**/api/user-profiles/me', {
        statusCode: 200,
        body: {
          id: 'patient-123',
          keycloakId: 'patient-kc-123',
          role: 'PATIENT',
          email: 'patient@test.com'
        }
      }).as('getProfile');
    });

    it('should display available appointment slots', () => {
      cy.intercept('GET', '**/api/scheduling/slots/therapist/**', {
        statusCode: 200,
        body: [
          {
            id: 'slot-1',
            therapistId: 'therapist-123',
            startTime: '2025-12-01T10:00:00',
            endTime: '2025-12-01T11:00:00',
            status: 'AVAILABLE'
          }
        ]
      }).as('getSlots');

      cy.visit('/book-appointment/therapist-123', {
        onBeforeLoad(win) {
          injectKeycloakMock(win, mockKeycloakPatient);
        }
      });

      cy.wait('@getSlots');
      cy.contains('10:00').should('be.visible');
    });

    it('should book an appointment', () => {
      cy.intercept('GET', '**/api/scheduling/slots/therapist/**', {
        statusCode: 200,
        body: [
          {
            id: 'slot-1',
            therapistId: 'therapist-123',
            startTime: '2025-12-01T10:00:00',
            endTime: '2025-12-01T11:00:00',
            status: 'AVAILABLE'
          }
        ]
      }).as('getSlots');

      cy.intercept('POST', '**/api/scheduling/appointments', {
        statusCode: 201,
        body: {
          id: 'appointment-123',
          slotId: 'slot-1',
          patientId: 'patient-123',
          therapistId: 'therapist-123',
          status: 'CONFIRMED'
        }
      }).as('bookAppointment');

      cy.visit('/book-appointment/therapist-123', {
        onBeforeLoad(win) {
          injectKeycloakMock(win, mockKeycloakPatient);
        }
      });

      cy.wait('@getSlots');
      cy.contains('button', 'Book').first().click();
      cy.wait('@bookAppointment');
    });

    it('should view my appointments', () => {
      cy.intercept('GET', '**/api/scheduling/appointments/my-appointments', {
        statusCode: 200,
        body: [
          {
            id: 'appointment-1',
            therapistName: 'Dr. Smith',
            startTime: '2025-12-01T10:00:00',
            endTime: '2025-12-01T11:00:00',
            status: 'CONFIRMED'
          }
        ]
      }).as('getMyAppointments');

      cy.visit('/my-appointments', {
        onBeforeLoad(win) {
          injectKeycloakMock(win, mockKeycloakPatient);
        }
      });

      cy.wait('@getMyAppointments');
      cy.contains('Dr. Smith').should('be.visible');
      cy.contains('CONFIRMED').should('be.visible');
    });
  });
});