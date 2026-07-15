import { CONFIG } from './config.js';

const BASE_URL = `https://api.jsonbin.io/v3/b/${CONFIG.JSONBIN_BIN_ID}`;
const HEADERS = {
  'Content-Type': 'application/json',
  'X-Master-Key': CONFIG.JSONBIN_API_KEY
};

/**
 * Fetches all high scores from JSONBin cloud storage.
 * @returns {Promise<Array>} Sorted array of score objects.
 */
export async function getScores() {
  if (CONFIG.JSONBIN_BIN_ID === 'PASTE_YOUR_BIN_ID_HERE') {
    console.warn('JSONBin not configured. See js/config.js for setup instructions.');
    return [];
  }
  try {
    const response = await fetch(`${BASE_URL}/latest`, { headers: HEADERS });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const scores = Array.isArray(data.record) ? data.record : [];
    return scores.sort((a, b) => b.score - a.score).slice(0, CONFIG.MAX_SCORES);
  } catch (error) {
    console.error('Failed to fetch scores:', error);
    throw error;
  }
}

/**
 * Submits a new score to JSONBin cloud storage.
 * Reads current scores, appends new one, sorts and trims, then saves.
 * @param {string} name - Player name.
 * @param {number} score - Score value.
 */
export async function submitScore(name, score) {
  if (CONFIG.JSONBIN_BIN_ID === 'PASTE_YOUR_BIN_ID_HERE') {
    throw new Error('JSONBin not configured. See js/config.js for setup instructions.');
  }
  try {
    // 1. Read existing scores
    const existing = await getScores();

    // 2. Append new entry
    const newEntry = {
      name: String(name).trim().slice(0, 15),
      score: parseInt(score, 10),
      date: new Date().toISOString()
    };
    const updated = [...existing, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, CONFIG.MAX_SCORES);

    // 3. PUT full array back to JSONBin
    const response = await fetch(BASE_URL, {
      method: 'PUT',
      headers: HEADERS,
      body: JSON.stringify(updated)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return newEntry;
  } catch (error) {
    console.error('Failed to submit score:', error);
    throw error;
  }
}
