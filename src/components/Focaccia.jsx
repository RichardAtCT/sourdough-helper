import { useState, useEffect } from 'react';
import { Scale, Info, Star, Heart, Save, X } from '../shared/Icons.jsx';

const Focaccia = ({ preferences, updatePreference }) => {
  const [scale, setScale] = useState(1);
  const [hydration, setHydration] = useState(81);
  const [yeastType, setYeastType] = useState('commercial');
  const [fermentationTime, setFermentationTime] = useState(16);
  const [favorites, setFavorites] = useState([]);
  const [favoriteName, setFavoriteName] = useState('');
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  const baseRecipe = {
    flour: 500,
    oil: 54,
    sweetener: 5,
    salt: 10,
    yeast: 4,
    starter: 70,
    oilStep1: 15,
    oilStep2: 39
  };

  // Load persisted state from localStorage
  useEffect(() => {
    const savedFocacciaState = localStorage.getItem('focacciaState');
    if (savedFocacciaState) {
      try {
        const state = JSON.parse(savedFocacciaState);
        if (state.scale !== undefined) setScale(state.scale);
        if (state.hydration !== undefined) setHydration(state.hydration);
        if (state.yeastType !== undefined) setYeastType(state.yeastType);
        if (state.fermentationTime !== undefined) setFermentationTime(state.fermentationTime);
      } catch (e) {
        console.error('Failed to load focaccia state');
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const state = { scale, hydration, yeastType, fermentationTime };
    localStorage.setItem('focacciaState', JSON.stringify(state));
  }, [scale, hydration, yeastType, fermentationTime]);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('focacciaFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to load favorites');
      }
    }
  }, []);

  const calculateWaterAmount = () => {
    let flourAmount = baseRecipe.flour * scale;
    if (yeastType === 'sourdough') {
      const starterAmount = baseRecipe.starter * scale;
      flourAmount -= starterAmount / 2;
    }
    const totalWater = (flourAmount * hydration) / 100;
    if (yeastType === 'sourdough') {
      const starterAmount = baseRecipe.starter * scale;
      return Math.round(totalWater - starterAmount / 2);
    }
    return Math.round(totalWater);
  };

  const calculateYeastAmount = () => {
    const exponent = (fermentationTime - 16) / 16;
    return (baseRecipe.yeast * Math.pow(0.5, exponent) * scale).toFixed(1);
  };

  const saveFavorite = () => {
    if (!favoriteName.trim()) {
      alert('Please enter a name for your favorite');
      return;
    }

    const newFavorite = {
      id: Date.now(),
      name: favoriteName.trim(),
      settings: { scale, hydration, yeastType, fermentationTime }
    };

    const updatedFavorites = [...favorites, newFavorite];
    setFavorites(updatedFavorites);
    localStorage.setItem('focacciaFavorites', JSON.stringify(updatedFavorites));
    setFavoriteName('');
    setShowFavoritesModal(false);
  };

  const loadFavorite = (favorite) => {
    setScale(favorite.settings.scale);
    setHydration(favorite.settings.hydration);
    setYeastType(favorite.settings.yeastType);
    setFermentationTime(favorite.settings.fermentationTime);
  };

  const deleteFavorite = (favoriteId) => {
    if (!window.confirm('Are you sure you want to delete this favorite?')) {
      return;
    }

    const updatedFavorites = favorites.filter(f => f.id !== favoriteId);
    setFavorites(updatedFavorites);
    localStorage.setItem('focacciaFavorites', JSON.stringify(updatedFavorites));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Focaccia Bread</h2>
        <p className="text-gray-600">Italian flatbread with customizable hydration and fermentation</p>
      </div>

      {/* Method Selection */}
      <div className="bg-purple-50 p-4 rounded-lg mb-6 border border-purple-200">
        <h3 className="font-semibold mb-3">Leavening Method</h3>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setYeastType('commercial')}
            className={`px-6 py-3 rounded-lg font-medium min-h-[44px] ${
              yeastType === 'commercial'
                ? 'bg-purple-600 text-white'
                : 'bg-white border-2 border-purple-300 text-purple-700 hover:bg-purple-50'
            }`}
          >
            Commercial Yeast
          </button>
          <button
            onClick={() => setYeastType('sourdough')}
            className={`px-6 py-3 rounded-lg font-medium min-h-[44px] ${
              yeastType === 'sourdough'
                ? 'bg-green-600 text-white'
                : 'bg-white border-2 border-green-300 text-green-700 hover:bg-green-50'
            }`}
          >
            Sourdough Starter
          </button>
        </div>
        <div className="mt-3 text-sm text-gray-700">
          {yeastType === 'commercial' ? (
            <p><strong>Commercial Yeast:</strong> Quick and reliable • 12-16 hours total time • Consistent results</p>
          ) : (
            <p><strong>Sourdough Starter:</strong> Complex flavor • 18-24 hours total time • Artisan texture</p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Scale />
              Recipe Scale
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="range"
                min="0.25"
                max="4"
                step="0.25"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="font-mono bg-white px-3 py-1 rounded border">
                {scale}x
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setScale(0.5)}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all min-h-[44px] ${
                  scale === 0.5
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white border border-gray-300 hover:bg-purple-50'
                }`}
                aria-label="Set scale to half recipe"
              >
                Half (0.5x)
              </button>
              <button
                onClick={() => setScale(1)}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all min-h-[44px] ${
                  scale === 1
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white border border-gray-300 hover:bg-purple-50'
                }`}
                aria-label="Set scale to standard recipe"
              >
                Standard (1x)
              </button>
              <button
                onClick={() => setScale(2)}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all min-h-[44px] ${
                  scale === 2
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white border border-gray-300 hover:bg-purple-50'
                }`}
                aria-label="Set scale to double recipe"
              >
                Double (2x)
              </button>
            </div>
            <button
              onClick={() => setShowFavoritesModal(true)}
              className="mt-2 w-full px-3 py-2 bg-yellow-500 text-white rounded text-sm font-medium hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
              aria-label="Save current settings as favorite"
            >
              <Star className="w-4 h-4" />
              Save as Favorite
            </button>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Dough <span className="border-b border-dotted border-gray-500 cursor-help" title="Hydration: The ratio of water to flour in a dough, expressed as a percentage. Higher hydration (80%+) creates a wetter, stickier dough that results in a more open crumb with larger holes. Lower hydration makes a firmer, easier-to-handle dough.">Hydration</span>: {hydration}%
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="78"
                max="84"
                value={hydration}
                onChange={(e) => setHydration(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-600">
                {hydration <= 79 ? 'Firmer' : hydration >= 83 ? 'Softer' : 'Medium'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium flex items-center gap-2">
              Cold Fermentation: {fermentationTime} hours
              {yeastType === 'commercial' && (
                <span className="border-b border-dotted border-gray-500 cursor-help text-xs" title="Yeast Calculation: Longer fermentation = less yeast needed. The amount is automatically reduced using exponential decay (halves every 16 hours). 16h uses 4g yeast, 32h uses 2g, 48h uses 1g, etc. This gives better flavor development with slower fermentation.">
                  ⓘ
                </span>
              )}
            </label>
            <span className="text-xs font-semibold px-2 py-1 rounded" style={{
              backgroundColor: fermentationTime <= 16 ? '#dbeafe' : fermentationTime <= 28 ? '#fef3c7' : '#fecaca',
              color: fermentationTime <= 16 ? '#1e40af' : fermentationTime <= 28 ? '#92400e' : '#991b1b'
            }}>
              {fermentationTime <= 16 ? '⚡ Weeknight' : fermentationTime <= 28 ? '📅 Weekend' : '🌟 Maximum Flavor'}
            </span>
          </div>
          <input
            type="range"
            min="12"
            max="72"
            step="4"
            value={fermentationTime}
            onChange={(e) => setFermentationTime(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>12h</span>
            <span>72h</span>
          </div>
          <div className="mt-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="text-xs text-blue-900">
              <div className="flex items-start gap-2 mb-2">
                <Info />
                <div>
                  <strong className="block">Fermentation Time Guide:</strong>
                  <div className="mt-1 space-y-1">
                    <div><strong>12-16h (Weeknight):</strong> Quick & convenient, great for busy schedules</div>
                    <div><strong>20-28h (Weekend):</strong> Balanced flavor, traditional timing</div>
                    <div><strong>48-72h (Maximum):</strong> Complex flavor, artisan quality</div>
                  </div>
                  {yeastType === 'commercial' && (
                    <div className="mt-2 text-xs italic">
                      💡 Yeast auto-adjusts: {fermentationTime}h uses {calculateYeastAmount()}g
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferences.showBakersPercent}
              onChange={(e) => updatePreference('showBakersPercent', e.target.checked)}
              className="rounded w-5 h-5"
              aria-label="Toggle baker's percentages display"
            />
            <span className="text-sm">Show <span className="border-b border-dotted border-gray-500 cursor-help" title="Baker's Percentages: A way of expressing recipe ingredients as percentages of the flour weight. Flour is always 100%, and other ingredients are calculated relative to it. This makes it easy to scale recipes and compare formulas.">baker's percentages</span></span>
          </label>
        </div>
      </div>

      {/* Favorites Modal */}
      {showFavoritesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowFavoritesModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Recipe Favorites
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
                Current: {scale}x scale, {hydration}% hydration, {yeastType === 'commercial' ? 'Commercial Yeast' : 'Sourdough Starter'}, {fermentationTime}h fermentation
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
                            {favorite.settings.scale}x • {favorite.settings.hydration}% • {favorite.settings.yeastType === 'commercial' ? 'Commercial' : 'Sourdough'} • {favorite.settings.fermentationTime}h
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

      {/* Ingredients */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Ingredients</h3>

        {/* Yield Indicator */}
        {(() => {
          const flourAmount = yeastType === 'sourdough'
            ? (baseRecipe.flour * scale) - (baseRecipe.starter * scale / 2)
            : baseRecipe.flour * scale;
          const waterAmount = calculateWaterAmount();
          const oilAmount = baseRecipe.oil * scale;
          const sweetenerAmount = baseRecipe.sweetener * scale;
          const saltAmount = baseRecipe.salt * scale;
          const leavenAmount = yeastType === 'commercial'
            ? parseFloat(calculateYeastAmount())
            : baseRecipe.starter * scale;

          const totalWeight = Math.round(flourAmount + waterAmount + oilAmount + sweetenerAmount + saltAmount + leavenAmount);

          // Calculate yield description based on weight
          const getYieldDescription = (weight) => {
            if (weight <= 400) return { pan: "1 small pan (8x8\")", servings: "4-6 servings" };
            if (weight <= 700) return { pan: "1 standard pan (9x13\")", servings: "8-12 servings" };
            if (weight <= 1100) return { pan: "1 large pan or 2 small pans", servings: "12-16 servings" };
            if (weight <= 1800) return { pan: "2 standard pans (9x13\")", servings: "16-24 servings" };
            return { pan: "3 standard pans or multiple large pans", servings: "24+ servings" };
          };

          const yieldInfo = getYieldDescription(totalWeight);

          return (
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-300 p-4 rounded-lg mb-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-600 text-white p-2 rounded-lg">
                    <Scale />
                  </div>
                  <div>
                    <div className="text-sm text-purple-700 font-medium">Recipe Yield</div>
                    <div className="text-lg font-bold text-purple-900">{yieldInfo.pan}</div>
                  </div>
                </div>
                <div className="flex flex-col sm:items-end gap-1">
                  <div className="text-2xl font-bold text-purple-900 font-mono">{totalWeight}g</div>
                  <div className="text-sm text-purple-700">{yieldInfo.servings}</div>
                </div>
              </div>
            </div>
          );
        })()}

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>White Bread Flour</span>
              <span className="font-mono font-semibold">
                {yeastType === 'sourdough'
                  ? Math.round((baseRecipe.flour * scale) - (baseRecipe.starter * scale / 2))
                  : Math.round(baseRecipe.flour * scale)
                }g
                {preferences.showBakersPercent && <span className="text-gray-500 ml-2">(100%)</span>}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Water</span>
              <span className="font-mono font-semibold">
                {calculateWaterAmount()}g
                {preferences.showBakersPercent && <span className="text-gray-500 ml-2">({hydration}%)</span>}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Extra Virgin Olive Oil</span>
              <span className="font-mono font-semibold">
                {Math.round(baseRecipe.oil * scale)}g
                {preferences.showBakersPercent && <span className="text-gray-500 ml-2">(10.8%)</span>}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Honey/Sugar/Agave</span>
              <span className="font-mono font-semibold">
                {Math.round(baseRecipe.sweetener * scale)}g
                {preferences.showBakersPercent && <span className="text-gray-500 ml-2">(1%)</span>}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Fine Sea Salt</span>
              <span className="font-mono font-semibold">
                {Math.round(baseRecipe.salt * scale)}g
                {preferences.showBakersPercent && <span className="text-gray-500 ml-2">(2%)</span>}
              </span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span>{yeastType === 'commercial' ? 'Instant Yeast' : 'Sourdough Starter (100% hydration)'}</span>
              <span className="font-mono font-semibold">
                {yeastType === 'commercial'
                  ? calculateYeastAmount() + 'g'
                  : Math.round(baseRecipe.starter * scale) + 'g'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Instructions</h3>
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
            <h4 className="font-semibold mb-2">1. Prepare the Mixture</h4>
            <p className="text-sm">
              In a large bowl, combine {calculateWaterAmount()}g warm water, {Math.round(baseRecipe.oilStep1 * scale)}g olive oil,
              {Math.round(baseRecipe.sweetener * scale)}g honey/sugar, {Math.round(baseRecipe.salt * scale)}g salt, and{' '}
              {yeastType === 'commercial'
                ? `${calculateYeastAmount()}g instant yeast. Whisk and let sit 5 minutes.`
                : `${Math.round(baseRecipe.starter * scale)}g active sourdough starter. Whisk well and let sit 10-15 minutes.`
              }
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
            <h4 className="font-semibold mb-2">2. Add Flour</h4>
            <p className="text-sm">
              Add {yeastType === 'sourdough'
                ? Math.round((baseRecipe.flour * scale) - (baseRecipe.starter * scale / 2))
                : Math.round(baseRecipe.flour * scale)
              }g flour and mix until incorporated. The dough will be wet and sticky.
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
            <h4 className="font-semibold mb-2">3. Stretch and Fold</h4>
            <p className="text-sm">
              Perform 2-3 sets of stretch and folds, resting 10 minutes between each set.
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
            <h4 className="font-semibold mb-2">4. Cold Fermentation</h4>
            <p className="text-sm">
              Drizzle {Math.round(baseRecipe.oilStep2 * scale)}g olive oil over dough. Cover and refrigerate for {fermentationTime} hours at 4°C (39°F).
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
            <h4 className="font-semibold mb-2">5. Prepare and Final Rise</h4>
            <p className="text-sm">
              Line a {scale <= 0.5 ? '8x8 inch' : scale >= 2 ? 'two 9x13 inch' : '9x13 inch'} pan with parchment and oil.
              Transfer dough and let rest at room temperature for {yeastType === 'commercial' ? '2-3' : '3-4'} hours until puffy.
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
            <h4 className="font-semibold mb-2">6. Bake</h4>
            <p className="text-sm">
              Preheat oven to 220°C (425°F). Create dimples with oiled fingers, add toppings, and bake 20-25 minutes until golden.
            </p>
          </div>
        </div>
      </div>

      {/* Toppings */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Traditional Toppings</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { name: 'Classic', desc: 'Sea salt & rosemary' },
            { name: 'Olive', desc: 'Kalamata or green olives' },
            { name: 'Garlic', desc: 'Thinly sliced garlic' },
            { name: 'Tomato', desc: 'Cherry tomatoes' },
            { name: 'Onion', desc: 'Caramelized red onions' },
            { name: 'Herbs', desc: 'Thyme, oregano, sage' }
          ].map(topping => (
            <div key={topping.name} className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
              <div className="font-semibold text-blue-800">{topping.name}</div>
              <div className="text-xs text-gray-600">{topping.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Info />
          Pro Tips
        </h4>
        <ul className="space-y-1 text-sm">
          <li>• Use warm water around 38°C (100°F) for yeast activation</li>
          <li>• Don't skip cold fermentation - it develops the best flavor</li>
          <li>• Oil your hands when handling sticky dough</li>
          <li>• Be generous with olive oil for crispy crust</li>
          <li>• Make dimples deep enough to hold toppings</li>
        </ul>
      </div>
    </div>
  );
};

export default Focaccia;
