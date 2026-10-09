import { useState, useEffect, useRef } from 'react';
import { ChefHat, Calculator, Download, Upload } from './shared/Icons.jsx';
import SourdoughBread from './components/SourdoughBread.jsx';
import Focaccia from './components/Focaccia.jsx';
import FermentationCalculator from './components/FermentationCalculator.jsx';
import { exportSettings, importSettings, loadPreferences, savePreferences } from './utils/storage.js';

// Tab order also defines swipe order. Responsive label classes are spelled out
// in full so Tailwind can find them.
const TABS = [
  {
    id: 'sourdough',
    Component: SourdoughBread,
    Icon: ChefHat,
    label: 'Sourdough Bread',
    shortLabel: 'Bread',
    labelClass: 'hidden sm:inline',
    shortLabelClass: 'sm:hidden',
    ariaLabel: 'View sourdough bread recipe'
  },
  {
    id: 'focaccia',
    Component: Focaccia,
    Icon: ChefHat,
    label: 'Focaccia',
    ariaLabel: 'View focaccia recipe'
  },
  {
    id: 'calculator',
    Component: FermentationCalculator,
    Icon: Calculator,
    label: 'Bulk Fermentation Calculator',
    shortLabel: 'Calculator',
    labelClass: 'hidden md:inline',
    shortLabelClass: 'md:hidden',
    ariaLabel: 'View bulk fermentation calculator'
  }
];

// Minimum horizontal travel (px) to show the swipe hint and to switch tabs
const SWIPE_HINT_DISTANCE = 30;
const SWIPE_SWITCH_DISTANCE = 50;

function App() {
  const [activeTab, setActiveTab] = useState('sourdough');
  const [preferences, setPreferences] = useState(() => ({
    tempUnit: 'C',
    showBakersPercent: false,
    ...loadPreferences()
  }));

  const [swipeHint, setSwipeHint] = useState(null);
  const swipeStartRef = useRef(null);
  const contentRef = useRef(null);

  // Save preferences to localStorage
  const updatePreference = (key, value) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    savePreferences(newPrefs);
  };

  // Handle import settings with state update
  const handleImportSettings = (event) => {
    importSettings(event, setPreferences);
  };

  // Tab a horizontal swipe would move to, or null when there isn't one
  const swipeTarget = (touch) => {
    const start = swipeStartRef.current;
    if (!start) return null;
    const diffX = start.x - touch.clientX;
    const diffY = start.y - touch.clientY;
    if (Math.abs(diffX) <= Math.abs(diffY)) return null;

    const index = TABS.findIndex(tab => tab.id === activeTab) + (diffX > 0 ? 1 : -1);
    const tab = TABS[index];
    return tab ? { tab, forward: diffX > 0, distance: Math.abs(diffX) } : null;
  };

  const handleTouchStart = (e) => {
    // Don't interfere with inputs, buttons, or other interactive elements
    if (e.target.closest('input, button, textarea, select, label')) {
      swipeStartRef.current = null;
      return;
    }
    swipeStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = (e) => {
    const target = swipeTarget(e.touches[0]);
    if (target && target.distance > SWIPE_HINT_DISTANCE) {
      const name = target.tab.shortLabel ?? target.tab.label;
      setSwipeHint(target.forward ? `→ ${name}` : `← ${name}`);
    }
  };

  const handleTouchEnd = (e) => {
    const target = swipeTarget(e.changedTouches[0]);
    if (target && target.distance > SWIPE_SWITCH_DISTANCE) {
      setActiveTab(target.tab.id);
      // Haptic feedback on mobile devices
      navigator.vibrate?.(10);
    }
    setSwipeHint(null);
    swipeStartRef.current = null;
  };

  // Scroll to top and add fade animation when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const content = contentRef.current;
    if (content) {
      content.classList.add('fade-transition');
      const timer = setTimeout(() => {
        content.classList.remove('fade-transition');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Complete Sourdough Helper</h1>
              <p className="text-purple-100">Recipes, calculators, and timers for sourdough baking</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportSettings}
                className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all flex items-center gap-2 min-h-[44px]"
                aria-label="Export all settings to file"
                title="Export all your settings and progress"
              >
                <Download size={20} />
                <span className="hidden md:inline">Export</span>
              </button>
              <label className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer min-h-[44px]">
                <Upload size={20} />
                <span className="hidden md:inline">Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportSettings}
                  className="hidden"
                  aria-label="Import settings from file"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto mt-6 px-4">
        <nav className="bg-white rounded-lg shadow-md p-2 flex flex-wrap gap-2" role="tablist" aria-label="Recipe tabs">
          {TABS.map(({ id, Icon, label, shortLabel, labelClass, shortLabelClass, ariaLabel }) => (
            <button
              key={id}
              id={`tab-${id}`}
              onClick={() => setActiveTab(id)}
              className={`tab-button px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
                activeTab === id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              role="tab"
              aria-selected={activeTab === id}
              aria-controls={`panel-${id}`}
              aria-label={ariaLabel}
            >
              <Icon size={20} />
              {shortLabel ? (
                <>
                  <span className={labelClass}>{label}</span>
                  <span className={shortLabelClass}>{shortLabel}</span>
                </>
              ) : label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="max-w-6xl mx-auto mt-6 px-4 swipeable-content"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* All tabs stay mounted so running timers keep ticking (and alarms fire) on any tab */}
        {TABS.map(({ id, Component }) => (
          <div key={id} id={`panel-${id}`} role="tabpanel" aria-labelledby={`tab-${id}`} hidden={activeTab !== id}>
            <Component preferences={preferences} updatePreference={updatePreference} />
          </div>
        ))}
      </div>

      {/* Swipe Indicator */}
      <div className={`swipe-indicator ${swipeHint ? 'visible' : ''}`} aria-hidden="true">
        {swipeHint}
      </div>
    </div>
  );
}

export default App;
