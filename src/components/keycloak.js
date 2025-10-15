import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8080",
  realm: "OpenLeaf",
  clientId: "openleaf-rest-api"
});

export default keycloak;
