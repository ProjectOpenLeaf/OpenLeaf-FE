describe('Therapist Dashboard Tests', () => {
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

    cy.visit('/therapist/dashboard');
  });

  it('should display the therapist dashboard', () => {
    cy.url().should('include', '/therapist/dashboard');
    cy.contains('Dashboard').should('be.visible');
  });

  it('should display list of patients', () => {
    cy.intercept('GET', '**/api/user-profiles/therapist/patients', {
      statusCode: 200,
      body: [
        {
          id: 'patient-1',
          name: 'John Doe',
          email: 'john@test.com',
          lastJournalDate: '2025-11-01'
        }
      ]
    }).as('getPatients');

    cy.wait('@getPatients');
    cy.contains('John Doe').should('be.visible');
  });

  it('should view patient journals', () => {
    cy.intercept('GET', '**/api/journals/patient/**', {
      statusCode: 200,
      body: [
        {
          id: 'journal-1',
          patientId: 'patient-1',
          content: 'Patient journal entry',
          mood: 'HAPPY',
          createdAt: '2025-11-01T10:00:00'
        }
      ]
    }).as('getPatientJournals');

    cy.contains('View Journals').first().click();
    cy.wait('@getPatientJournals');
    cy.contains('Patient journal entry').should('be.visible');
  });

  it('should add comments to patient journals', () => {
    cy.intercept('GET', '**/api/journals/journal-1', {
      statusCode: 200,
      body: {
        id: 'journal-1',
        content: 'Patient journal entry',
        mood: 'HAPPY',
        createdAt: '2025-11-01T10:00:00',
        comments: []
      }
    }).as('getJournal');

    cy.intercept('POST', '**/api/journals/journal-1/comments', {
      statusCode: 201,
      body: {
        id: 'comment-1',
        content: 'Great progress!',
        therapistId: 'therapist-123',
        createdAt: new Date().toISOString()
      }
    }).as('addComment');

    cy.visit('/journals/journal-1');
    cy.wait('@getJournal');
    cy.get('textarea[name="comment"]').type('Great progress!');
    cy.contains('button', 'Add Comment').click();
    cy.wait('@addComment');
  });

  it('should request AI summary of patient journals', () => {
    cy.intercept('POST', '**/api/journals/ai-summary', {
      statusCode: 200,
      body: {
        summary: 'Patient shows consistent improvement in mood and engagement.',
        keyThemes: ['progress', 'mood improvement', 'engagement'],
        period: '30 days'
      }
    }).as('getAISummary');

    cy.contains('AI Summary').click();
    cy.wait('@getAISummary');
    cy.contains('Patient shows consistent improvement').should('be.visible');
  });
});