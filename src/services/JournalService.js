import axios from 'axios';
import keycloak from '../components/keycloak.js';

const API_BASE_URL = 'http://localhost:8081/api/journals';

/**
 * Create a new journal entry
 */
export const createJournal = async (content) => {
  const response = await axios.post(
    `${API_BASE_URL}/create`,
    {
      content: content
    },
    {
      headers: {
        'Authorization': `Bearer ${keycloak.token}`
      }
    }
  );
  
  return response.data;
};

export const getMyJournals = async () => {
  const response = await axios.get(
    API_BASE_URL,
    {
      headers: {
        'Authorization': `Bearer ${keycloak.token}`
      }
    }
  );
  
  return response.data;
};

const journalService = {
  createJournal,
  getMyJournals
};

export default journalService;