import { defineConfig } from 'cypress';

export default defineConfig({
  waitForAnimations: false,
  animationDistanceThreshold: 50,

  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
