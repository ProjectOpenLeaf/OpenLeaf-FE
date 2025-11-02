describe('Find Therapist Tests', () => {
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

    cy.visit('/find-therapist');
  });

  it('should display available therapists', () => {
    cy.intercept('GET', '**/api/user-profiles/therapists', {
      statusCode: 200,
      body: [
        {
          id: 'therapist-1',
          name: 'Dr. Sarah Smith',
          specialization: 'Anxiety and Depression',
          bio: 'Experienced therapist with 10 years of practice'
        },
        {
          id: 'therapist-2',
          name: 'Dr. John Davis',
          specialization: 'Cognitive Behavioral Therapy',
          bio: 'Specializes in CBT techniques'
        }
      ]
    }).as('getTherapists');

    cy.wait('@getTherapists');
    cy.contains('Dr. Sarah Smith').should('be.visible');
    cy.contains('Dr. John Davis').should('be.visible');
  });

  it('should search for therapists by specialization', () => {
    cy.intercept('GET', '**/api/user-profiles/therapists?search=*', {
      statusCode: 200,
      body: [
        {
          id: 'therapist-1',
          name: 'Dr. Sarah Smith',
          specialization: 'Anxiety and Depression',
          bio: 'Experienced therapist'
        }
      ]
    }).as('searchTherapists');

    cy.get('input[type="search"]').type('Anxiety');
    cy.wait('@searchTherapists');
    cy.contains('Dr. Sarah Smith').should('be.visible');
    cy.contains('Dr. John Davis').should('not.exist');
  });

  it('should navigate to book appointment with selected therapist', () => {
    cy.intercept('GET', '**/api/user-profiles/therapists', {
      statusCode: 200,
      body: [
        {
          id: 'therapist-1',
          name: 'Dr. Sarah Smith',
          specialization: 'Anxiety and Depression'
        }
      ]
    }).as('getTherapists');

    cy.wait('@getTherapists');
    cy.contains('Book Appointment').first().click();
    cy.url().should('include', '/book-appointment/');
  });
});

describe('Delete Account Tests', () => {
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

    cy.visit('/delete-account');
  });

  it('should display the delete account page', () => {
    cy.url().should('include', '/delete-account');
    cy.contains('Delete Account').should('be.visible');
  });

  it('should show confirmation dialog', () => {
    cy.contains('button', 'Delete My Account').click();
    cy.get('.confirmation-dialog').should('be.visible');
  });

  it('should require confirmation text to delete account', () => {
    cy.contains('button', 'Delete My Account').click();
    cy.get('input[type="text"]').type('WRONG TEXT');
    cy.contains('button', 'Confirm Delete').click();
    cy.contains('Please type "DELETE MY ACCOUNT" to confirm').should('be.visible');
  });

  it('should delete account with correct confirmation', () => {
    cy.intercept('DELETE', '**/api/user-profiles/patient-kc-123', {
      statusCode: 204
    }).as('deleteAccount');

    cy.contains('button', 'Delete My Account').click();
    cy.get('input[type="text"]').type('DELETE MY ACCOUNT');
    cy.contains('button', 'Confirm Delete').click();
    cy.wait('@deleteAccount');
  });

  it('should cancel account deletion', () => {
    cy.contains('button', 'Delete My Account').click();
    cy.contains('button', 'Cancel').click();
    cy.get('.confirmation-dialog').should('not.exist');
  });
});