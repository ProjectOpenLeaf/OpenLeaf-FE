import { mockKeycloakPatient, mockKeycloakTherapist, injectKeycloakMock } from '../support/keycloak-mock';

describe('Journal Tests', () => {
  describe('Patient Journal Management', () => {
    beforeEach(() => {
      // Mock patient profile
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

    it('should display the journal list page', () => {
      cy.intercept('GET', '**/api/journals', {
        statusCode: 200,
        body: []
      }).as('getJournals');

      cy.visit('/journals', {
        onBeforeLoad(win) {
          injectKeycloakMock(win, mockKeycloakPatient);
        }
      });

      cy.wait('@getJournals');
      cy.contains('My Journals').should('be.visible');
      cy.contains('button', 'Create New Journal').should('be.visible');
    });

    it('should navigate to create journal page', () => {
      cy.intercept('GET', '**/api/journals', {
        statusCode: 200,
        body: []
      }).as('getJournals');

      cy.visit('/journals', {
        onBeforeLoad(win) {
          injectKeycloakMock(win, mockKeycloakPatient);
        }
      });

      cy.wait('@getJournals');
      cy.contains('button', 'Create New Journal').click();
      cy.url().should('include', '/journals/create');
    });

    it('should create a new journal entry with mood', () => {
      cy.intercept('POST', '**/api/journals', (req) => {
        expect(req.body).to.have.property('content');
        expect(req.body).to.have.property('mood');
        req.reply({
          statusCode: 201,
          body: {
            id: 'journal-123',
            content: req.body.content,
            mood: req.body.mood,
            createdAt: new Date().toISOString(),
            patientKeycloakId: 'patient-kc-123'
          }
        });
      }).as('createJournal');

      cy.visit('/journals/create', {
        onBeforeLoad(win) {
          injectKeycloakMock(win, mockKeycloakPatient);
        }
      });

      // Fill in journal form
      cy.get('textarea[name="content"]').type('Today I had a therapy session and felt much better afterwards. We discussed coping strategies for my anxiety.');
      cy.get('select[name="mood"]').select('HAPPY');
      
      // Add tags if the feature exists
      cy.get('input[name="tags"]').type('therapy, progress, anxiety');
      
      cy.contains('button', 'Save Journal').click();

      cy.wait('@createJournal');
      
      // Should redirect to journals list
      cy.url().should('include', '/journals');
      cy.contains('Journal saved successfully').should('be.visible');
    });

    it('should validate journal content is required', () => {
      cy.visit('/journals/create', {
        onBeforeLoad(win) {
          injectKeycloakMock(win, mockKeycloakPatient);
        }
      });

      // Try to save without content
      cy.contains('button', 'Save Journal').click();
      
      cy.contains('Please write something in your journal').should('be.visible');
    });

    it('should display list of journal entries sorted by date', () => {
      cy.intercept('GET', '**/api/journals', {
        statusCode: 200,
        body: [
          {
            id: 'journal-1',
            content: 'First journal entry about my day',
            mood: 'NEUTRAL',
            createdAt: '2025-01-15T10:00:00',
            tags: ['daily', 'reflection']
          },
          {
            id: 'journal-2',
            content: 'Second entry - feeling better today',
            mood: 'HAPPY',
            createdAt: '2025-01-16T14:00:00',
            tags: ['progress']
          },
          {
            id: 'journal-3',
            content: 'Third entry - had some challenges',
            mood: 'SAD',
            createdAt: '2025-01-17T09:00:00',
            tags: ['challenges', 'work']
          }
        ]
      }).as('getJournals');

      cy.visit('/journals', {
        onBeforeLoad(win) {
          injectKeycloakMock(win, mockKeycloakPatient);
        }
      });

      cy.wait('@getJournals');

      // Should display journals in reverse chronological order
      cy.get('.journal-card').should('have.length', 3);
      cy.get('.journal-card').first().should('contain', 'Third entry');
      cy.get('.journal-card').last().should('contain', 'First journal');
      
      // Should show mood indicators
      cy.get('.journal-card').first().should('contain', 'SAD');
      cy.contains('HAPPY').should('be.visible');
      cy.contains('NEUTRAL').should('be.visible');
    });

    it('should search through journal entries', () => {
      cy.intercept('GET', '**/api/journals*', (req) => {
        const searchQuery = req.query.search || '';
        const allJournals = [
          {
            id: 'journal-1',
            content: 'Discussion about anxiety management',
            mood: 'NEUTRAL',
            createdAt: '2025-01-15T10:00:00'
          },
          {
            id: 'journal-2',
            content: 'Feeling happy about progress',
            mood: 'HAPPY',
            createdAt: '2025-01-16T14:00:00'
          }
        ];
        
        const filtered = searchQuery 
          ? allJournals.filter(j => j.content.toLowerCase().includes(searchQuery.toLowerCase()))
          : allJournals;
          
        req.reply({
          statusCode: 200,
          body: filtered
        });
      }).as('searchJournals');

      cy.visit('/journals', {
        onBeforeLoad(win) {
          injectKeycloakMock(win, mockKeycloakPatient);
        }
      });

      cy.wait('@searchJournals');
      
      // Search for specific content
      cy.get('input[type="search"]').type('anxiety');
      cy.wait('@searchJournals');
      
      // Should only show matching journal
      cy.get('.journal-card').should('have.length', 1);
      cy.contains('anxiety management').should('be.visible');
      cy.contains('happy about progress').should('not.exist');
    });

    it('should view a specific journal entry details', () => {
      const mockJournal = {
        id: 'journal-123',
        content: 'Detailed journal entry about my therapy session today. We discussed...',
        mood: 'HAPPY',
        createdAt: '2025-01-15T10:00:00',
        tags: ['therapy', 'progress'],
        patientKeycloakId: 'patient-kc-123'
      };

      cy.intercept('GET', '**/api/journals/journal-123', {
        statusCode: 200,
        body: mockJournal
      }).as('getJournal');

      cy.visit('/journals/journal-123', {
        onBeforeLoad(win) {
          injectKeycloakMock(win, mockKeycloakPatient);
        }
      });

      cy.wait('@getJournal');
      
      cy.contains('Detailed journal entry').should('be.visible');
      cy.contains('HAPPY').should('be.visible');
      cy.contains('therapy').should('be.visible');
      cy.contains('progress').should('be.visible');
    });

    it('should edit an existing journal entry', () => {
      cy.intercept('GET', '**/api/journals/journal-123', {
        statusCode: 200,
        body: {
          id: 'journal-123',
          content: 'Original content',
          mood: 'NEUTRAL',
          createdAt: '2025-01-15T10:00:00'
        }
      }).as('getJournal');

      cy.intercept('PUT', '**/api/journals/journal-123', {
        statusCode: 200,
        body: {
          id: 'journal-123',
          content: 'Updated content with more details',
          mood: 'HAPPY',
          createdAt: '2025-01-15T10:00:00',
          updatedAt: new Date().toISOString()
        }
      }).as('updateJournal');

      cy.visit('/journals/journal-123/edit', {
        onBeforeLoad(win) {
          injectKeycloakMock(win, mockKeycloakPatient);
        }
      });

      cy.wait('@getJournal');
      
      // Clear and update content
      cy.get('textarea[name="content"]').clear().type('Updated content with more details');
      cy.get('select[name="mood"]').select('HAPPY');
      
      cy.contains('button', 'Save Changes').click();
      cy.wait('@updateJournal');
      
      cy.contains('Journal updated successfully').should('be.visible');
      cy.url().should('include', '/journals');
    });

    it('should delete a journal entry', () => {
      cy.intercept('GET', '**/api/journals', {
        statusCode: 200,
        body: [
          {
            id: 'journal-123',
            content: 'Journal to be deleted',
            mood: 'NEUTRAL',
            createdAt: '2025-01-15T10:00:00'
          }
        ]
      }).as('getJournals');

      cy.intercept('DELETE', '**/api/journals/journal-123', {
        statusCode: 204
      }).as('deleteJournal');

      cy.visit('/journals', {
        onBeforeLoad(win) {
          injectKeycloakMock(win, mockKeycloakPatient);
        }
      });

      cy.wait('@getJournals');
      
      // Click delete button on journal card
      cy.contains('Journal to be deleted')
        .parent()
        .within(() => {
          cy.contains('button', 'Delete').click();
        });
      
      // Confirm deletion
      cy.on('window:confirm', () => true);
      
      cy.wait('@deleteJournal');
      cy.contains('Journal deleted successfully').should('be.visible');
    });
  });

  describe('Therapist - View Patient Journals', () => {
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

    it('should display patient journals for assigned patients only', () => {
      const patientId = 'patient-kc-123';
      
      // Mock assignment check
      cy.intercept('GET', `**/api/assignments/therapist/therapist-kc-123/patient/${patientId}`, {
        statusCode: 200,
        body: {
          assignmentId: 1,
          patientKeycloakId: patientId,
          therapistKeycloakId: 'therapist-kc-123',
          assignedAt: '2025-01-01T10:00:00'
        }
      }).as('checkAssignment');

      // Mock patient journals
      cy.intercept('GET', `**/api/journals/patient/${patientId}`, {
        statusCode: 200,
        body: [
          {
            id: 'journal-1',
            content: 'Patient journal entry 1',
            mood: 'ANXIOUS',
            createdAt: '2025-01-15T10:00:00',
            patientKeycloakId: patientId
          },
          {
            id: 'journal-2',
            content: 'Patient journal entry 2',
            mood: 'HAPPY',
            createdAt: '2025-01-16T14:00:00',
            patientKeycloakId: patientId
          }
        ]
      }).as('getPatientJournals');

      cy.visit(`/therapist/patient/${patientId}`, {
        onBeforeLoad(win) {
          injectKeycloakMock(win, mockKeycloakTherapist);
        }
      });

      cy.wait('@checkAssignment');
      cy.wait('@getPatientJournals');

      // Should display patient journals
      cy.contains('Patient Journals').should('be.visible');
      cy.contains('Patient journal entry 1').should('be.visible');
      cy.contains('Patient journal entry 2').should('be.visible');
      cy.contains('ANXIOUS').should('be.visible');
      cy.contains('HAPPY').should('be.visible');
    });

    it('should deny access to unassigned patient journals', () => {
      const unassignedPatientId = 'patient-kc-456';
      
      cy.intercept('GET', `**/api/assignments/therapist/therapist-kc-123/patient/${unassignedPatientId}`, {
        statusCode: 403,
        body: { message: 'Access denied: Patient not assigned to therapist' }
      }).as('checkAssignment');

      cy.visit(`/therapist/patient/${unassignedPatientId}`, {
        onBeforeLoad(win) {
          injectKeycloakMock(win, mockKeycloakTherapist);
        }
      });

      cy.wait('@checkAssignment');
      
      cy.contains('Access denied').should('be.visible');
      cy.contains('not assigned to you').should('be.visible');
    });

    it('should not allow therapist to edit patient journals', () => {
      const patientId = 'patient-kc-123';
      
      cy.intercept('GET', `**/api/assignments/therapist/therapist-kc-123/patient/${patientId}`, {
        statusCode: 200,
        body: {
          assignmentId: 1,
          patientKeycloakId: patientId,
          therapistKeycloakId: 'therapist-kc-123'
        }
      }).as('checkAssignment');

      cy.intercept('GET', `**/api/journals/patient/${patientId}`, {
        statusCode: 200,
        body: [
          {
            id: 'journal-1',
            content: 'Patient journal entry',
            mood: 'NEUTRAL',
            createdAt: '2025-01-15T10:00:00'
          }
        ]
      }).as('getPatientJournals');

      cy.visit(`/therapist/patient/${patientId}`, {
        onBeforeLoad(win) {
          injectKeycloakMock(win, mockKeycloakTherapist);
        }
      });

      cy.wait('@checkAssignment');
      cy.wait('@getPatientJournals');

      // Should not have edit or delete buttons
      cy.contains('button', 'Edit').should('not.exist');
      cy.contains('button', 'Delete').should('not.exist');
      
      // Should have read-only view
      cy.contains('Patient journal entry').should('be.visible');
    });
  });
});