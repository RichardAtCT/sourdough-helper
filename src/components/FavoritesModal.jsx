import { useState } from 'react';
import { Star, Save, X } from '../shared/Icons.jsx';

// Dialog for saving the current settings as a named favorite and loading or
// deleting saved ones. `currentSummary` describes the settings that would be
// saved; `describe(favorite)` summarizes a saved favorite.
const FavoritesModal = ({ title = 'Recipe Favorites', favorites, currentSummary, describe, onSave, onLoad, onDelete, onClose }) => {
  const [name, setName] = useState('');

  const save = () => {
    if (!name.trim()) {
      alert('Please enter a name for your favorite');
      return;
    }
    onSave(name.trim());
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="favorites-title"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 id="favorites-title" className="text-xl font-bold flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close favorites modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save New Favorite */}
        <div className="mb-6 bg-purple-50 p-4 rounded-lg">
          <label className="block text-sm font-medium mb-2" htmlFor="favorite-name">
            Save Current Settings
          </label>
          <div className="flex gap-2">
            <input
              id="favorite-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter favorite name..."
              className="flex-1 min-w-0 px-3 py-2 border rounded min-h-[44px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  save();
                }
              }}
            />
            <button
              onClick={save}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-2 min-h-[44px]"
              aria-label="Save favorite"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            Current: {currentSummary}
          </div>
        </div>

        {/* Existing Favorites List */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Saved Favorites</h4>
          {favorites.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              No favorites saved yet. Save your current settings above!
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
                >
                  <div className="mb-2">
                    <h5 className="font-semibold text-sm">{favorite.name}</h5>
                    <div className="text-xs text-gray-600 mt-1">{describe(favorite)}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onLoad(favorite);
                        onClose();
                      }}
                      className="flex-1 px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors min-h-[44px]"
                      aria-label={`Load favorite: ${favorite.name}`}
                    >
                      Load
                    </button>
                    <button
                      onClick={() => onDelete(favorite.id)}
                      className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors min-h-[44px]"
                      aria-label={`Delete favorite: ${favorite.name}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors min-h-[44px]"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default FavoritesModal;
