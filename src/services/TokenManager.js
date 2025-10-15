import axios from "axios";
import {jwtDecode} from "jwt-decode";

const TokenManager = {

    interceptor: axios.interceptors.request.use(config => {

      const accessToken = TokenManager.getAccessToken();
      if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
      }
  
      return config;
  }),

    getAccessToken: () => localStorage.getItem('accessToken'),

    getClaims: () => {
        if (!localStorage.getItem('claims')) {
            return undefined;
        }
        return JSON.parse(localStorage.getItem('claims'));
    },

    setAccessToken: (token) => {
        localStorage.setItem('accessToken', token);
        const claims = jwtDecode(token);
        localStorage.setItem('claims', JSON.stringify(claims));

        return claims;
    },

    clear: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('claims');
        axios.interceptors.request.eject(TokenManager.interceptor);
        
    },
};

export default TokenManager;
