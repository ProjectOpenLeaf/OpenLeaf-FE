import { mockKeycloakTherapist, mockKeycloakPatient, injectKeycloakMock } from '../support/keycloak-mock';

describe('Appointment Scheduling Tests', () => {
  describe('Therapist - Create Appointment Slot', () => {
    beforeEach(() => {
      // Mock therapist profile
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

      // Visit with Keycloak mock injected
      cy.visit('/create-appointment-slot', {
        onBeforeLoad(win) {
          injectKeycloakMock(win, mockKeycloakTherapist);
        }
      });
    });

    it('should display the create appointment slot form', () => {
      cy.get('h1').contains('Create Appointment Slot').should('be.visible');
      cy.get('form').should('be.visible');
      cy.get('input[type="date"]').should('exist');
      cy.get('input[type="time"]').should('have.length', 2);
      cy.get('textarea[placeholder*="notes"]').should('exist');
    });

    it('should create a new appointment slot successfully', () => {
      // Mock the API endpoint for creating appointment slots
      cy.intercept('POST', '**/api/appointments', {
        statusCode: 201,
        body: {
          id: 'slot-123',
          therapistKeycloakId: 'therapist-kc-123',
          startTime: '2025-12-01T10:00:00',
          endTime: '2025-12-01T11:00:00',
          status: 'AVAILABLE',
          notes: 'Available for consultation'
        }
      }).as('createSlot');

      // Fill in the form
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];

      cy.get('input[type="date"]').type(dateString);
      cy.get('input[type="time"]').first().type('10:00');
      cy.get('input[type="time"]').last().type('11:00');
      cy.get('textarea').type('Available for consultation');
      cy.contains('button', 'Create Appointment Slot').click(); // Fixed button text

      cy.wait('@createSlot');
      
      // Should show alert and redirect
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Appointment slot created successfully');
      });
      cy.url().should('include', '/my-appointments');
    });

    it('should validate that end time is after start time', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];

      cy.get('input[type="date"]').type(dateString);
      cy.get('input[type="time"]').first().type('11:00');
      cy.get('input[type="time"]').last().type('10:00');
      cy.contains('button', 'Create Appointment Slot').click(); // Fixed button text

      cy.get('.error-message').contains('End time must be after start time').should('be.visible');
    });

    it('should prevent creating slots in the past', () => {
      // The date input has min=today attribute, so we can't type a past date
      // Instead, let's test that the min attribute is set correctly
      const today = new Date().toISOString().split('T')[0];
      cy.get('input[type="date"]').should('have.attr', 'min', today);
  });

//   describe('Patient - Book Appointment', () => {
//     const therapistId = 'therapist-kc-123';
    
//     beforeEach(() => {
//       // Mock patient profile
//       cy.intercept('GET', '**/api/user-profiles/me', {
//         statusCode: 200,
//         body: {
//           id: 'patient-123',
//           keycloakId: 'patient-kc-123',
//           role: 'PATIENT',
//           email: 'patient@test.com',
//           firstName: 'John',
//           lastName: 'Doe'
//         }
//       }).as('getProfile');

//       // Mock getting assigned therapist
//       cy.intercept('GET', '**/api/appointments/patient/patient-kc-123/therapist', {
//         statusCode: 200,
//         body: {
//           assignmentId: 1,
//           therapistKeycloakId: therapistId,
//           assignedAt: '2025-01-01T10:00:00',
//           notes: 'Assigned for anxiety treatment'
//         }
//       }).as('getTherapist');
//     });

//     it('should display available appointment slots for assigned therapist', () => {
//       // Mock getting available slots
//       cy.intercept('GET', `**/api/appointments/therapist/${therapistId}/available`, {
//         statusCode: 200,
//         body: [
//           {
//             id: 'slot-1',
//             therapistKeycloakId: therapistId,
//             startTime: '2025-12-01T10:00:00',
//             endTime: '2025-12-01T11:00:00',
//             status: 'AVAILABLE',
//             notes: 'Morning session available'
//           },
//           {
//             id: 'slot-2',
//             therapistKeycloakId: therapistId,
//             startTime: '2025-12-01T14:00:00',
//             endTime: '2025-12-01T15:00:00',
//             status: 'AVAILABLE',
//             notes: 'Afternoon session available'
//           }
//         ]
//       }).as('getAvailableSlots');

//       cy.visit(`/book-appointment/${therapistId}`, {
//         onBeforeLoad(win) {
//           injectKeycloakMock(win, mockKeycloakPatient);
//         }
//       });

//       cy.wait('@getAvailableSlots');
      
//       // The app formats the datetime, so check for the formatted time
//       cy.get('.slot-card').should('have.length', 2);
//       cy.get('.slot-time').first().should('contain', '10:00');
//     //   cy.get('.slot-time').last().should('contain', '14:00');
//       cy.contains('Morning session available').should('be.visible');
//       cy.contains('Afternoon session available').should('be.visible');
//     });

//     it('should book an appointment successfully', () => {
//       cy.intercept('GET', `**/api/appointments/therapist/${therapistId}/available`, {
//         statusCode: 200,
//         body: [
//           {
//             id: 'slot-1',
//             therapistKeycloakId: therapistId,
//             startTime: '2025-12-01T10:00:00',
//             endTime: '2025-12-01T11:00:00',
//             status: 'AVAILABLE'
//           }
//         ]
//       }).as('getAvailableSlots');

//       // Mock booking endpoint
//       cy.intercept('POST', '**/api/appointments/slot-1/book', {
//         statusCode: 200,
//         body: {
//           id: 'appointment-123',
//           appointmentId: 'slot-1',
//           patientKeycloakId: 'patient-kc-123',
//           therapistKeycloakId: therapistId,
//           startTime: '2025-12-01T10:00:00',
//           endTime: '2025-12-01T11:00:00',
//           status: 'CONFIRMED',
//           notes: 'Need to discuss recent anxiety episodes'
//         }
//       }).as('bookAppointment');

//       cy.visit(`/book-appointment/${therapistId}`, {
//         onBeforeLoad(win) {
//           injectKeycloakMock(win, mockKeycloakPatient);
//         }
//       });

//       cy.wait('@getAvailableSlots');
      
//       // Add optional notes for the therapist
//       cy.get('textarea.booking-notes').type('Need to discuss recent anxiety episodes');
      
//       // Click book button for the first slot
// cy.get('.slot-card').first().within(() => {
//   cy.get('.book-button').click({ force: true });
// });
      
//       // Confirm in dialog if present
//       cy.on('window:confirm', () => true);
      
//       cy.wait('@bookAppointment');
      
//       // Should show alert and redirect
//       cy.on('window:alert', (text) => {
//         expect(text).to.contains('Appointment booked successfully');
//       });
//       cy.url().should('include', '/my-appointments');
//     });

//     it('should show message when no slots are available', () => {
//       cy.intercept('GET', `**/api/appointments/therapist/${therapistId}/available`, {
//         statusCode: 200,
//         body: []
//       }).as('getAvailableSlots');

//       cy.visit(`/book-appointment/${therapistId}`, {
//         onBeforeLoad(win) {
//           injectKeycloakMock(win, mockKeycloakPatient);
//         }
//       });

//       cy.wait('@getAvailableSlots');
      
//       cy.contains('No available appointment slots').should('be.visible');
//       cy.contains('Please check back later').should('be.visible');
//     });
//   });

  describe('View My Appointments', () => {
    describe('As a Patient', () => {
      beforeEach(() => {
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

      it('should display booked appointments', () => {
        cy.intercept('GET', '**/api/appointments/user', {
          statusCode: 200,
          body: [
            {
              id: 'appointment-1',
              therapistKeycloakId: 'therapist-kc-123',
              patientKeycloakId: 'patient-kc-123',
              startTime: '2025-12-01T10:00:00',
              endTime: '2025-12-01T11:00:00',
              status: 'CONFIRMED',
              notes: 'Regular session'
            },
            {
              id: 'appointment-2',
              therapistKeycloakId: 'therapist-kc-123',
              patientKeycloakId: 'patient-kc-123',
              startTime: '2025-12-05T14:00:00',
              endTime: '2025-12-05T15:00:00',
              status: 'CONFIRMED',
              notes: 'Follow-up session'
            }
          ]
        }).as('getUserAppointments');

        cy.visit('/my-appointments', {
          onBeforeLoad(win) {
            injectKeycloakMock(win, mockKeycloakPatient);
          }
        });

        cy.wait('@getUserAppointments');
        
        cy.contains('My Appointments').should('be.visible');
        cy.contains('Dec 1, 2025').should('be.visible');
        cy.contains('10:00').should('be.visible');
        cy.contains('CONFIRMED').should('be.visible');
        cy.contains('Regular session').should('be.visible');
      });

      it('should cancel an appointment', () => {
        cy.intercept('GET', '**/api/appointments/user', {
          statusCode: 200,
          body: [
            {
              id: 'appointment-1',
              therapistKeycloakId: 'therapist-kc-123',
              patientKeycloakId: 'patient-kc-123',
              startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow (cancellable)
              endTime: new Date(Date.now() + 90000000).toISOString(),
              status: 'CONFIRMED'
            }
          ]
        }).as('getUserAppointments');

        cy.intercept('DELETE', '**/api/appointments/appointment-1', {
          statusCode: 200,
          body: { message: 'Appointment cancelled successfully' }
        }).as('cancelAppointment');

        cy.visit('/my-appointments', {
          onBeforeLoad(win) {
            injectKeycloakMock(win, mockKeycloakPatient);
          }
        });

        cy.wait('@getUserAppointments');
        
        // Click the Cancel Appointment button
        cy.contains('button', 'Cancel Appointment').click();
        
        // Stub the confirm dialog
        cy.on('window:confirm', () => true);
        
        cy.wait('@cancelAppointment');
        
        // Check for alert
        cy.on('window:alert', (text) => {
          expect(text).to.contains('Appointment cancelled successfully');
        });
        
        // Should reload appointments
        cy.wait('@getUserAppointments');
      });
    });

    describe('As a Therapist', () => {
      beforeEach(() => {
        cy.intercept('GET', '**/api/user-profiles/me', {
          statusCode: 200,
          body: {
            id: 'therapist-123',
            keycloakId: 'therapist-kc-123',
            role: 'THERAPIST',
            email: 'therapist@test.com'
          }
        }).as('getProfile');
      });

      it('should display created appointment slots and booked appointments', () => {
        cy.intercept('GET', '**/api/appointments/user', {
          statusCode: 200,
          body: [
            {
              id: 'slot-1',
              therapistKeycloakId: 'therapist-kc-123',
              patientKeycloakId: null,
              startTime: '2025-12-01T10:00:00',
              endTime: '2025-12-01T11:00:00',
              status: 'AVAILABLE',
              notes: 'Morning slot'
            },
            {
              id: 'appointment-2',
              therapistKeycloakId: 'therapist-kc-123',
              patientKeycloakId: 'patient-kc-123',
              startTime: '2025-12-01T14:00:00',
              endTime: '2025-12-01T15:00:00',
              status: 'CONFIRMED',
              notes: 'Session with John Doe'
            }
          ]
        }).as('getUserAppointments');

        cy.visit('/my-appointments', {
          onBeforeLoad(win) {
            injectKeycloakMock(win, mockKeycloakTherapist);
          }
        });

        cy.wait('@getUserAppointments');
        
        // Should see both available and booked slots  
        cy.get('.status-badge.status-available').contains('AVAILABLE').should('be.visible');
        cy.get('.status-badge').contains('CONFIRMED').should('be.visible');
        cy.contains('Morning slot').should('be.visible');
        // The patient ID is shown truncated
        cy.get('.detail-text').should('contain', 'Patient:');
      });

      it('should delete an available slot', () => {
        cy.intercept('GET', '**/api/appointments/user', {
          statusCode: 200,
          body: [
            {
              id: 'slot-1',
              therapistKeycloakId: 'therapist-kc-123',
              patientKeycloakId: null,
              startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
              endTime: new Date(Date.now() + 90000000).toISOString(),
              status: 'AVAILABLE'
            }
          ]
        }).as('getUserAppointments');

        cy.intercept('DELETE', '**/api/appointments/slot-1', {
          statusCode: 200,
          body: { message: 'Appointment slot deleted successfully' }
        }).as('deleteSlot');

        cy.visit('/my-appointments', {
          onBeforeLoad(win) {
            injectKeycloakMock(win, mockKeycloakTherapist);
          }
        });

        cy.wait('@getUserAppointments');
        
        // For available slots as therapist, there should be a Cancel button
        cy.get('.appointment-card').within(() => {
          cy.contains('button', 'Cancel Appointment').click();
        });
        
        // Stub the confirm dialog
        cy.on('window:confirm', () => true);
        
        cy.wait('@deleteSlot');
        
        // Check for alert
        cy.on('window:alert', (text) => {
          expect(text).to.contains('cancelled successfully');
        });
        
        // Should reload appointments
        cy.wait('@getUserAppointments');
      });
    });
  });
})})