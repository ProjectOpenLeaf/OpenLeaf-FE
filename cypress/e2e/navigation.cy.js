describe('Navigation Tests', () => {
  beforeEach(() => {
    // Mock Keycloak authentication
    cy.visit('/', {
      onBeforeLoad(win) {
        // Mock authenticated state
        win.localStorage.setItem('kc_token', 'mock-token');
      }
    });
  });

  it('should display the navigation bar', () => {
    cy.get('nav').should('be.visible');
  });

  it('should navigate to dashboard when Dashboard button is clicked', () => {
    cy.contains('Dashboard').click();
    cy.url().should('include', '/dashboard');
  });

  it('should navigate to appointments page', () => {
    cy.contains('Appointments').click();
    cy.url().should('include', '/my-appointments');
  });

  it('should display user information in navigation', () => {
    cy.get('.user-info').should('be.visible');
    cy.get('.username').should('exist');
  });

  it('should have a logout button', () => {
    cy.get('.logout-button').should('be.visible').and('contain', 'Logout');
  });
});