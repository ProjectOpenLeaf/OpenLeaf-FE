describe('Journal Tests (Patient)', () => {
  beforeEach(() => {
    // Mock authenticated patient
    cy.intercept('GET', '**/api/user-profiles/me', {
      statusCode: 200,
      body: {
        id: 'patient-123',
        keycloakId: 'patient-kc-123',
        role: 'PATIENT',
        email: 'patient@test.com'
      }
    }).as('getProfile');

    cy.visit('/dashboard');
  });

  it('should display the journal list page', () => {
    cy.visit('/journals');
    cy.url().should('include', '/journals');
  });

  it('should navigate to create journal page', () => {
    cy.visit('/journals');
    cy.contains('Create').click();
    cy.url().should('include', '/journals/create');
  });

  it('should display journal creation form', () => {
    cy.visit('/journals/create');
    cy.get('form').should('be.visible');
    cy.get('textarea').should('exist');
  });

  it('should create a new journal entry', () => {
    cy.intercept('POST', '**/api/journals', {
      statusCode: 201,
      body: {
        id: 'journal-123',
        content: 'Test journal entry',
        createdAt: new Date().toISOString()
      }
    }).as('createJournal');

    cy.visit('/journals/create');
    cy.get('textarea').type('This is a test journal entry about my day');
    cy.contains('button', 'Save').click();

    cy.wait('@createJournal');
    cy.url().should('include', '/journals');
  });

  it('should search through journals', () => {
    cy.intercept('GET', '**/api/journals*', {
      statusCode: 200,
      body: [
        { id: '1', content: 'First journal entry', createdAt: '2025-01-01' },
        { id: '2', content: 'Second journal entry', createdAt: '2025-01-02' }
      ]
    }).as('getJournals');

    cy.visit('/journals');
    cy.get('input[type="search"]').type('First');
    cy.wait('@getJournals');
  });

  it('should view a specific journal entry', () => {
    const mockJournal = {
      id: 'journal-123',
      content: 'Test journal content',
      mood: 'HAPPY',
      createdAt: new Date().toISOString()
    };

    cy.intercept('GET', '**/api/journals/journal-123', {
      statusCode: 200,
      body: mockJournal
    }).as('getJournal');

    cy.visit('/journals/journal-123');
    cy.wait('@getJournal');
    cy.contains('Test journal content').should('be.visible');
  });
});