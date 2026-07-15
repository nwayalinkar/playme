import { CONFIG } from './config.js';

// Parses the Supabase URL and appends the correct REST endpoint
const getBaseUrl = () => {
  let url = CONFIG.SUPABASE_URL.trim();
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  // If user pasted raw domain, append the rest/v1 paths
  if (!url.endsWith('/rest/v1')) {
    url = `${url}/rest/v1`;
  }
  return `${url}/scores`;
};

const BASE_URL = getBaseUrl();
const HEADERS = {
  'Content-Type': 'application/json',
  'apikey': CONFIG.SUPABASE_KEY,
  'Authorization': `Bearer ${CONFIG.SUPABASE_KEY}`
};

/**
 * Fetches all high scores from Supabase cloud database.
 * @returns {Promise<Array>} Sorted array of score objects.
 */
export async function getScores() {
  try {
    const response = await fetch(`${BASE_URL}?select=name,score,date&order=score.desc,date.desc&limit=${CONFIG.MAX_SCORES}`, {
      method: 'GET',
      headers: HEADERS
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch scores:', error);
    throw error;
  }
}

/**
 * Submits a new score to Supabase database.
 * @param {string} name - Player name.
 * @param {number} score - Score value.
 */
export async function submitScore(name, score) {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        ...HEADERS,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        name: String(name).trim().slice(0, 15),
        score: parseInt(score, 10)
      })
    });
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result[0];
  } catch (error) {
    console.error('Failed to submit score:', error);
    throw error;
  }
}
