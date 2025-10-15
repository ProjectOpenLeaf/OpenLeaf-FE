import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import keycloak from "./components/keycloak.js";
import TokenManager from "./services/TokenManager.js";
import axios from "axios";

function startApp() {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App keycloak={keycloak} />
    </React.StrictMode>
  );
}

function saveUser() {
    return axios.get(`http://localhost:8081/api/users/hello`,{
        withCredentials: true,
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    })
}


// Initialize Keycloak
keycloak.init({
  onLoad: "login-required",
  checkLoginIframe: false, // prevents re-triggering login
  pkceMethod: "S256",      // optional but recommended
}).then((authenticated) => {
  if (authenticated) {
        TokenManager.setAccessToken(keycloak.token);
        saveUser();
    startApp(); // only render app once logged in
  } else {
    keycloak.login(); // fallback, rarely used
  }
});