// Local storage utilities and data import/export functions

export const exportSettings = () => {
  const allSettings = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    preferences: JSON.parse(localStorage.getItem('sourdoughPreferences') || '{}'),
    sourdough: {
      completedSteps: JSON.parse(localStorage.getItem('sourdoughCompletedSteps') || '{}'),
      scale: localStorage.getItem('sourdoughScale'),
      startTime: localStorage.getItem('sourdoughStartTime')
    },
    focaccia: JSON.parse(localStorage.getItem('focacciaState') || '{}'),
    calculator: JSON.parse(localStorage.getItem('calculatorState') || '{}'),
    recentCalculations: JSON.parse(localStorage.getItem('recentCalculations') || '[]'),
    favorites: {
      sourdough: JSON.parse(localStorage.getItem('sourdoughFavorites') || '[]'),
      focaccia: JSON.parse(localStorage.getItem('focacciaFavorites') || '[]'),
      calculator: JSON.parse(localStorage.getItem('calculatorFavorites') || '[]')
    }
  };

  const blob = new Blob([JSON.stringify(allSettings, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sourdough-helper-settings-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importSettings = (event, setPreferences) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const settings = JSON.parse(e.target.result);

      // Import preferences
      if (settings.preferences) {
        localStorage.setItem('sourdoughPreferences', JSON.stringify(settings.preferences));
        setPreferences(settings.preferences);
      }

      // Import sourdough state
      if (settings.sourdough) {
        if (settings.sourdough.completedSteps) {
          localStorage.setItem('sourdoughCompletedSteps', JSON.stringify(settings.sourdough.completedSteps));
        }
        if (settings.sourdough.scale) {
          localStorage.setItem('sourdoughScale', settings.sourdough.scale);
        }
        if (settings.sourdough.startTime) {
          localStorage.setItem('sourdoughStartTime', settings.sourdough.startTime);
        }
      }

      // Import focaccia state
      if (settings.focaccia) {
        localStorage.setItem('focacciaState', JSON.stringify(settings.focaccia));
      }

      // Import calculator state
      if (settings.calculator) {
        localStorage.setItem('calculatorState', JSON.stringify(settings.calculator));
      }

      // Import recent calculations
      if (settings.recentCalculations) {
        localStorage.setItem('recentCalculations', JSON.stringify(settings.recentCalculations));
      }

      // Import favorites
      if (settings.favorites) {
        if (settings.favorites.sourdough) {
          localStorage.setItem('sourdoughFavorites', JSON.stringify(settings.favorites.sourdough));
        }
        if (settings.favorites.focaccia) {
          localStorage.setItem('focacciaFavorites', JSON.stringify(settings.favorites.focaccia));
        }
        if (settings.favorites.calculator) {
          localStorage.setItem('calculatorFavorites', JSON.stringify(settings.favorites.calculator));
        }
      }

      alert('Settings imported successfully! Please refresh the page to see changes.');
    } catch (error) {
      alert('Failed to import settings. Please check the file format.');
      console.error('Import error:', error);
    }
  };
  reader.readAsText(file);
};

export const loadPreferences = () => {
  const saved = localStorage.getItem('sourdoughPreferences');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load preferences');
      return null;
    }
  }
  return null;
};

export const savePreferences = (preferences) => {
  localStorage.setItem('sourdoughPreferences', JSON.stringify(preferences));
};
