import { useState } from 'react';
import { readStoredJSON } from '../utils/storage.js';

// Named presets for a tab, persisted to localStorage under storageKey
export const useFavorites = (storageKey) => {
  const [favorites, setFavorites] = useState(() => readStoredJSON(storageKey, []));

  const persist = (updated) => {
    setFavorites(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const addFavorite = (name, settings) => {
    persist([...favorites, { id: Date.now(), name, settings }]);
  };

  const deleteFavorite = (favoriteId) => {
    if (!window.confirm('Are you sure you want to delete this favorite?')) {
      return;
    }
    persist(favorites.filter(f => f.id !== favoriteId));
  };

  return { favorites, addFavorite, deleteFavorite };
};
