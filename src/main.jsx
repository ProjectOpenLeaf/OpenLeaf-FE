import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import keycloak from "./components/keycloak.js";
import TokenManager from "./services/TokenManager.js";
import userService from "./services/UserService.js";

function startApp() {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App keycloak={keycloak} />
    </React.StrictMode>
  );
}

// Check if running in Cypress
const isCypress = window.Cypress;

if (isCypress) {
  // In Cypress tests, skip Keycloak init and use the mocked keycloak object
  console.log('🧪 Running in Cypress - Using mocked Keycloak');
  
  // Wait for Cypress to inject the mock
  const checkKeycloakMock = setInterval(() => {
    if (window.keycloak) {
      clearInterval(checkKeycloakMock);
      
      // Use the mocked keycloak from Cypress
      const mockedKeycloak = window.keycloak;
      
      // Set token if available
      if (mockedKeycloak.token) {
        TokenManager.setAccessToken(mockedKeycloak.token);
      }
      
      // Start the app with mocked keycloak
      ReactDOM.createRoot(document.getElementById("root")).render(
        <React.StrictMode>
          <App keycloak={mockedKeycloak} />
        </React.StrictMode>
      );
    }
  }, 100);
  
  // Timeout after 5 seconds
  setTimeout(() => {
    clearInterval(checkKeycloakMock);
    if (!window.keycloak) {
      console.error('❌ Keycloak mock not found - tests may fail');
      startApp(); // Start anyway with original keycloak
    }
  }, 5000);
  
} else {
  // Normal production/dev initialization
  keycloak.init({
    onLoad: "login-required",
    checkLoginIframe: false,
    pkceMethod: "S256",
  }).then(async (authenticated) => {
    if (authenticated) {
      // Store token
      TokenManager.setAccessToken(keycloak.token);
      
      // Register user in backend
      try {
        const userData = await userService.registerUser();
        console.log("✅ User registered:", userData);
      } catch (error) {
        console.error("❌ Registration failed:", error);
      }
      
      // Start app
      startApp();
    } else {
      keycloak.login();
    }
  }).catch((error) => {
    console.error("❌ Keycloak initialization failed:", error);
  });
}