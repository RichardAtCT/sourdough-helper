import { useState, useEffect } from 'react';
import { Thermometer, Info, Clock, History, Trash2, Star, Heart, Save, X } from '../shared/Icons.jsx';
import {
  bilinearInterpolate,
  fermentationData,
  calculateCompletionTime,
  convertFtoC,
  convertCtoF
} from '../utils/calculations.js';

const FermentationCalculator = ({ preferences, updatePreference }) => {
  const [temperature, setTemperature] = useState(70);
  const [starterPercent, setStarterPercent] = useState(15);
  const [riseTarget, setRiseTarget] = useState(100);
  const [startTime, setStartTime] = useState('');
  const [recentCalculations, setRecentCalculations] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [favoriteName, setFavoriteName] = useState('');
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  // Load persisted state from localStorage
  useEffect(() => {
    const savedCalculatorState = localStorage.getItem('calculatorState');
    if (savedCalculatorState) {
      try {
        const state = JSON.parse(savedCalculatorState);
        if (state.temperature !== undefined) setTemperature(state.temperature);
        if (state.starterPercent !== undefined) setStarterPercent(state.starterPercent);
        if (state.riseTarget !== undefined) setRiseTarget(state.riseTarget);
        if (state.startTime !== undefined) setStartTime(state.startTime);
      } catch (e) {
        console.error('Failed to load calculator state');
      }
    }

    const savedRecentCalculations = localStorage.getItem('recentCalculations');
    if (savedRecentCalculations) {
      try {
        setRecentCalculations(JSON.parse(savedRecentCalculations));
      } catch (e) {
        console.error('Failed to load recent calculations');
      }
    }

    const savedFavorites = localStorage.getItem('calculatorFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to load favorites');
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const state = { temperature, starterPercent, riseTarget, startTime };
    localStorage.setItem('calculatorState', JSON.stringify(state));
  }, [temperature, starterPercent, riseTarget, startTime]);

  const tempC = preferences.tempUnit === 'C' ? temperature : convertFtoC(temperature);
  const tempF = preferences.tempUnit === 'F' ? temperature : convertCtoF(temperature);

  const estimatedHours = bilinearInterpolate(tempF, starterPercent, riseTarget);
  const hours = Math.floor(estimatedHours);
  const minutes = Math.round((estimatedHours - hours) * 60);

  const minTime = estimatedHours * 0.9;
  const maxTime = estimatedHours * 1.1;
  const minHours = Math.floor(minTime);
  const minMinutes = Math.round((minTime - minHours) * 60);
  const maxHours = Math.floor(maxTime);
  const maxMinutes = Math.round((maxTime - maxHours) * 60);

  const completionTime = calculateCompletionTime(startTime, estimatedHours);

  // Save current calculation to history
  const saveCalculation = () => {
    const calculation = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      temperature: tempF,
      temperatureC: tempC,
      starterPercent,
      riseTarget,
      estimatedHours,
      hours,
      minutes
    };

    const updated = [calculation, ...recentCalculations.slice(0, 9)]; // Keep last 10
    setRecentCalculations(updated);
    localStorage.setItem('recentCalculations', JSON.stringify(updated));
  };

  // Load a saved calculation
  const loadCalculation = (calc) => {
    setTemperature(preferences.tempUnit === 'F' ? calc.temperature : calc.temperatureC);
    setStarterPercent(calc.starterPercent);
    setRiseTarget(calc.riseTarget);
  };

  // Clear recent calculations
  const clearRecentCalculations = () => {
    if (window.confirm('Clear all recent calculations? This cannot be undone.')) {
      setRecentCalculations([]);
      localStorage.removeItem('recentCalculations');
    }
  };

  // Save current settings as favorite
  const saveFavorite = () => {
    if (!favoriteName.trim()) {
      alert('Please enter a name for your favorite');
      return;
    }

    const newFavorite = {
      id: Date.now(),
      name: favoriteName.trim(),
      settings: { temperature, starterPercent, riseTarget, startTime }
    };

    const updatedFavorites = [...favorites, newFavorite];
    setFavorites(updatedFavorites);
    localStorage.setItem('calculatorFavorites', JSON.stringify(updatedFavorites));
    setFavoriteName('');
    setShowFavoritesModal(false);
  };

  // Load a favorite
  const loadFavorite = (favorite) => {
    setTemperature(favorite.settings.temperature);
    setStarterPercent(favorite.settings.starterPercent);
    setRiseTarget(favorite.settings.riseTarget);
    setStartTime(favorite.settings.startTime);
  };

  // Delete a favorite
  const deleteFavorite = (favoriteId) => {
    if (!window.confirm('Are you sure you want to delete this favorite?')) {
      return;
    }

    const updatedFavorites = favorites.filter(f => f.id !== favoriteId);
    setFavorites(updatedFavorites);
    localStorage.setItem('calculatorFavorites', JSON.stringify(updatedFavorites));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Bulk Fermentation Calculator</h2>
        <p className="text-gray-600">Estimate fermentation time based on temperature and starter percentage</p>
        <p className="text-xs text-gray-500 mt-1">Based on data from The Sourdough Journey</p>
      </div>

      {/* Temperature Unit Toggle */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Primary Unit for Slider</span>
          <div className="flex gap-2">
            <button
              onClick={() => updatePreference('tempUnit', 'F')}
              className={`px-3 py-2 rounded text-xs min-h-[44px] ${
                preferences.tempUnit === 'F'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-300'
              }`}
            >
              °F
            </button>
            <button
              onClick={() => updatePreference('tempUnit', 'C')}
              className={`px-3 py-2 rounded text-xs min-h-[44px] ${
                preferences.tempUnit === 'C'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-300'
              }`}
            >
              °C
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-600">Both units are always displayed below</p>
      </div>

      {/* Preset Scenarios */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Quick Scenarios
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => {
              setTemperature(preferences.tempUnit === 'F' ? 68 : 20);
              setStarterPercent(15);
            }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 p-4 rounded-lg hover:shadow-md transition-all text-left min-h-[44px]"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">❄️</span>
              <span className="font-bold text-blue-900">Cool Kitchen</span>
            </div>
            <div className="text-xs text-blue-700">68°F (20°C) • 15% starter</div>
            <div className="text-xs text-gray-600 mt-1">Typical winter temperatures</div>
          </button>
          <button
            onClick={() => {
              setTemperature(preferences.tempUnit === 'F' ? 72 : 22);
              setStarterPercent(15);
            }}
            className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 p-4 rounded-lg hover:shadow-md transition-all text-left min-h-[44px]"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🌤️</span>
              <span className="font-bold text-orange-900">Warm Kitchen</span>
            </div>
            <div className="text-xs text-orange-700">72°F (22°C) • 15% starter</div>
            <div className="text-xs text-gray-600 mt-1">Comfortable room temp</div>
          </button>
          <button
            onClick={() => {
              setTemperature(preferences.tempUnit === 'F' ? 76 : 24);
              setStarterPercent(20);
            }}
            className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 p-4 rounded-lg hover:shadow-md transition-all text-left min-h-[44px]"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🔥</span>
              <span className="font-bold text-red-900">Proofing Box</span>
            </div>
            <div className="text-xs text-red-700">76°F (24°C) • 20% starter</div>
            <div className="text-xs text-gray-600 mt-1">Accelerated fermentation</div>
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-purple-50 p-4 rounded-lg">
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Thermometer className="w-4 h-4" />
            Dough Temperature
          </label>
          <div className="text-center mb-3">
            <div className="text-2xl font-bold text-purple-800">
              {tempF}°F / {tempC}°C
            </div>
            <div className="text-xs text-gray-600 mt-1">
              (Adjust slider in {preferences.tempUnit === 'F' ? 'Fahrenheit' : 'Celsius'})
            </div>
          </div>
          <input
            type="range"
            min={preferences.tempUnit === 'F' ? 60 : 15}
            max={preferences.tempUnit === 'F' ? 80 : 27}
            value={temperature}
            onChange={(e) => setTemperature(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>{preferences.tempUnit === 'F' ? '60°F (15°C)' : '15°C (59°F)'}</span>
            <span>{preferences.tempUnit === 'F' ? '80°F (27°C)' : '27°C (81°F)'}</span>
          </div>
          {(tempF < 66 || tempF > 74) && (
            <div className="mt-3 text-sm text-orange-800 bg-orange-100 border-2 border-orange-400 p-3 rounded-lg shadow-sm">
              <div className="flex items-start gap-2">
                <span className="text-xl" role="img" aria-label="warning">⚠️</span>
                <div>
                  <strong className="block font-bold">Outside Tested Range</strong>
                  <span className="text-xs">Temperature outside 66-74°F (19-23°C). Results are extrapolated.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <label className="text-sm font-medium mb-3 block">
            Starter Percentage: {starterPercent}%
          </label>
          <input
            type="range"
            min="5"
            max="30"
            value={starterPercent}
            onChange={(e) => setStarterPercent(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex gap-2 mt-2">
            {[5, 10, 15, 20].map(val => (
              <button
                key={val}
                onClick={() => setStarterPercent(val)}
                className={`px-2 py-1 text-xs rounded ${
                  starterPercent === val
                    ? 'bg-purple-600 text-white'
                    : 'bg-white border border-gray-300'
                }`}
              >
                {val}%
              </button>
            ))}
          </div>
          {starterPercent > 20 && (
            <div className="mt-3 text-sm text-orange-800 bg-orange-100 border-2 border-orange-400 p-3 rounded-lg shadow-sm">
              <div className="flex items-start gap-2">
                <span className="text-xl" role="img" aria-label="warning">⚠️</span>
                <div>
                  <strong className="block font-bold">Outside Tested Range</strong>
                  <span className="text-xs">Starter percentage outside 5-20%. Results are extrapolated.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rise Target */}
      <div className="bg-purple-50 p-4 rounded-lg mb-6">
        <label className="text-sm font-medium mb-3 block">Rise Target</label>
        <div className="flex gap-4">
          <button
            onClick={() => setRiseTarget(75)}
            className={`flex-1 px-4 py-3 rounded-lg font-medium min-h-[44px] ${
              riseTarget === 75
                ? 'bg-purple-600 text-white'
                : 'bg-white border-2 border-purple-300 text-purple-700 hover:bg-purple-50'
            }`}
          >
            75% Rise
          </button>
          <button
            onClick={() => setRiseTarget(100)}
            className={`flex-1 px-4 py-3 rounded-lg font-medium min-h-[44px] ${
              riseTarget === 100
                ? 'bg-purple-600 text-white'
                : 'bg-white border-2 border-purple-300 text-purple-700 hover:bg-purple-50'
            }`}
          >
            100% Rise (Doubled)
          </button>
        </div>
      </div>

      {/* Start Time */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <Clock className="w-4 h-4" />
          Start Time (Optional)
        </label>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      {/* Results */}
      <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-6 rounded-lg border-2 border-purple-300 mb-6">
        <h3 className="text-lg font-semibold mb-4">Estimated Fermentation Time</h3>
        <div className="text-center mb-4">
          <div className="text-5xl font-bold text-purple-800 mb-2">
            {hours}h {minutes}m
          </div>
          <div className="text-sm text-gray-700">
            Range: {minHours}h {minMinutes}m - {maxHours}h {maxMinutes}m (±10%)
          </div>
        </div>
        {completionTime && (
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600 mb-1">Estimated Completion</div>
            <div className="text-xl font-semibold text-purple-800">
              {completionTime.toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </div>
          </div>
        )}
        <div className="mt-4 space-y-2">
          <button
            onClick={saveCalculation}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg min-h-[44px]"
            aria-label="Save current calculation to history"
          >
            💾 Save This Calculation
          </button>
          <button
            onClick={() => setShowFavoritesModal(true)}
            className="w-full px-4 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            aria-label="Save current settings as favorite"
          >
            <Star className="w-4 h-4" />
            Save as Favorite
          </button>
        </div>
      </div>

      {/* Favorites Modal */}
      {showFavoritesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowFavoritesModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Calculator Favorites
              </h3>
              <button
                onClick={() => setShowFavoritesModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close favorites modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Save New Favorite */}
            <div className="mb-6 bg-purple-50 p-4 rounded-lg">
              <label className="block text-sm font-medium mb-2">
                Save Current Settings
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={favoriteName}
                  onChange={(e) => setFavoriteName(e.target.value)}
                  placeholder="Enter favorite name..."
                  className="flex-1 px-3 py-2 border rounded min-h-[44px]"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      saveFavorite();
                    }
                  }}
                />
                <button
                  onClick={saveFavorite}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-2 min-h-[44px]"
                  aria-label="Save favorite"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                Current: {tempF}°F ({tempC}°C) • {starterPercent}% starter • {riseTarget}% rise
                {startTime && (
                  <span className="ml-1">
                    • Start: {new Date(startTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
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
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h5 className="font-semibold text-sm">{favorite.name}</h5>
                          <div className="text-xs text-gray-600 mt-1">
                            {preferences.tempUnit === 'F' ? favorite.settings.temperature : convertFtoC(favorite.settings.temperature)}°{preferences.tempUnit} • {favorite.settings.starterPercent}% starter • {favorite.settings.riseTarget}% rise
                            {favorite.settings.startTime && (
                              <span className="block mt-1">
                                Start: {new Date(favorite.settings.startTime).toLocaleDateString()} {new Date(favorite.settings.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            loadFavorite(favorite);
                            setShowFavoritesModal(false);
                          }}
                          className="flex-1 px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors min-h-[44px]"
                          aria-label={`Load favorite: ${favorite.name}`}
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteFavorite(favorite.id)}
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
              onClick={() => setShowFavoritesModal(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors min-h-[44px]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Recent Calculations */}
      {recentCalculations.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <History className="w-4 h-4" />
              Recent Calculations
            </h3>
            <button
              onClick={clearRecentCalculations}
              className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 px-2 py-1 hover:bg-red-50 rounded min-h-[44px]"
              aria-label="Clear all recent calculations"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
          <div className="space-y-2">
            {recentCalculations.map((calc) => (
              <button
                key={calc.id}
                onClick={() => loadCalculation(calc)}
                className="w-full text-left p-3 bg-white rounded border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all min-h-[44px]"
                aria-label={`Load calculation: ${calc.temperature}°F, ${calc.starterPercent}% starter, ${calc.riseTarget}% rise`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {calc.temperature}°F ({calc.temperatureC}°C) • {calc.starterPercent}% starter • {calc.riseTarget}% rise
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {new Date(calc.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-lg font-bold text-purple-700">
                      {calc.hours}h {calc.minutes}m
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Educational Content */}
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            How It Works
          </h4>
          <p className="text-sm text-gray-700">
            This calculator uses <span className="border-b border-dotted border-gray-500 cursor-help" title="Bilinear Interpolation: A mathematical method to estimate values between known data points. The calculator uses this to predict fermentation times for temperature and starter combinations that fall between the tested values, providing smooth, accurate estimates.">bilinear interpolation</span> on empirical fermentation data.
            Higher temperatures and more starter percentage result in faster fermentation.
            The calculation is based on controlled testing with 90% King Arthur Bread Flour and 10% whole wheat.
          </p>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Important Notes
          </h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• These are estimates - always check dough visually for proper rise</li>
            <li>• Actual times vary with flour type, starter strength, and other factors</li>
            <li>• The tested range is 66-74°F with 5-20% starter</li>
            <li>• Look for 20-50% increase in volume and visible bubbles</li>
            <li>• Perform the <span className="border-b border-dotted border-gray-500 cursor-help" title="Poke Test: Gently press your finger about 1/2 inch into the dough. If properly fermented, the indentation should spring back slowly (2-3 seconds) but leave a slight impression. If it springs back quickly, it needs more time. If it doesn't spring back at all, it may be over-fermented.">"poke test"</span> - dough should spring back slowly</li>
          </ul>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Pro Tips
          </h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Use a dough thermometer for accurate temperature readings</li>
            <li>• Mark your container to track rise percentage easily</li>
            <li>• Warmer environments speed fermentation significantly</li>
            <li>• A 75% rise is great for pan loaves, 100% for free-form loaves</li>
            <li>• Consider using a proofing box for consistent temperature</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FermentationCalculator;
