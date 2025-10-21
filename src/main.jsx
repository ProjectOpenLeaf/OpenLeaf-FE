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

// Initialize Keycloak and register user
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