import React, { useEffect, useState } from "react";

export default function LogInPage({ keycloak }) {
  const [journals, setJournals] = useState([]);

  useEffect(() => {
    if (keycloak.authenticated) {
      console.log("Token:", keycloak.token);
      fetch("http://localhost:8081/api/journals", {
        headers: {
          "Authorization": "Bearer " + keycloak.token
        }
      })
        .then(res => res.json())
        .then(data => {
          console.log(data);
          setJournals(data);
        });
    }
  }, [keycloak]);

  return (
    <div>
      <h1>Log In Page</h1>
      <p>Authenticated: {keycloak.authenticated ? "Yes" : "No"}</p>
    </div>
  );
}