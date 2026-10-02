import { useState } from 'react';
import { readStoredJSON } from '../utils/storage.js';

const STORAGE_KEY = 'recentCalculations';
const MAX_RECENT = 10;

// The calculator's most recent saved estimates, newest first
export const useRecentCalculations = () => {
  const [recentCalculations, setRecentCalculations] = useState(() => readStoredJSON(STORAGE_KEY, []));

  const addCalculation = (details) => {
    const calculation = { id: Date.now(), timestamp: new Date().toISOString(), ...details };
    const updated = [calculation, ...recentCalculations].slice(0, MAX_RECENT);
    setRecentCalculations(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearCalculations = () => {
    if (window.confirm('Clear all recent calculations? This cannot be undone.')) {
      setRecentCalculations([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return { recentCalculations, addCalculation, clearCalculations };
};
