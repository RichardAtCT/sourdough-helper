import { useState, useEffect, useRef } from 'react';
import { ChefHat, Calculator, Download, Upload } from './shared/Icons.jsx';
import SourdoughBread from './components/SourdoughBread.jsx';
import Focaccia from './components/Focaccia.jsx';
import FermentationCalculator from './components/FermentationCalculator.jsx';
import { exportSettings, importSettings, loadPreferences, savePreferences } from './utils/storage.js';

function App() {
  const [activeTab, setActiveTab] = useState('sourdough');
  const [preferences, setPreferences] = useState({
    tempUnit: 'C',
    showBakersPercent: false
  });

  // Swipe gesture state
  const [swipeStartX, setSwipeStartX] = useState(null);
  const [swipeStartY, setSwipeStartY] = useState(null);
  const [swipeIndicatorText, setSwipeIndicatorText] = useState('');
  const [swipeIndicatorVisible, setSwipeIndicatorVisible] = useState(false);
  const contentRef = useRef(null);

  // Load preferences from localStorage
  useEffect(() => {
    const saved = loadPreferences();
    if (saved) {
      setPreferences(saved);
    }
  }, []);

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

  // Swipe gesture handlers
  const handleTouchStart = (e) => {
    // Don't interfere with inputs, buttons, or other interactive elements
    if (e.target.tagName === 'INPUT' ||
        e.target.tagName === 'BUTTON' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.closest('button') ||
        e.target.closest('input')) {
      return;
    }

    setSwipeStartX(e.touches[0].clientX);
    setSwipeStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (swipeStartX === null || swipeStartY === null) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = swipeStartX - currentX;
    const diffY = swipeStartY - currentY;

    // Only show indicator if horizontal swipe is more significant than vertical
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
      const tabs = ['sourdough', 'focaccia', 'calculator'];
      const currentIndex = tabs.indexOf(activeTab);

      if (diffX > 0 && currentIndex < tabs.length - 1) {
        // Swiping left - next tab
        const nextTab = tabs[currentIndex + 1];
        const tabNames = {
          'sourdough': 'Sourdough Bread',
          'focaccia': 'Focaccia',
          'calculator': 'Calculator'
        };
        setSwipeIndicatorText(`→ ${tabNames[nextTab]}`);
        setSwipeIndicatorVisible(true);
      } else if (diffX < 0 && currentIndex > 0) {
        // Swiping right - previous tab
        const prevTab = tabs[currentIndex - 1];
        const tabNames = {
          'sourdough': 'Sourdough Bread',
          'focaccia': 'Focaccia',
          'calculator': 'Calculator'
        };
        setSwipeIndicatorText(`← ${tabNames[prevTab]}`);
        setSwipeIndicatorVisible(true);
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (swipeStartX === null || swipeStartY === null) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = swipeStartX - endX;
    const diffY = swipeStartY - endY;

    // Only trigger if horizontal swipe is more significant than vertical
    // and the swipe distance is at least 50px
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      const tabs = ['sourdough', 'focaccia', 'calculator'];
      const currentIndex = tabs.indexOf(activeTab);

      if (diffX > 0 && currentIndex < tabs.length - 1) {
        // Swiping left - go to next tab
        setActiveTab(tabs[currentIndex + 1]);
        // Haptic feedback on mobile devices
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      } else if (diffX < 0 && currentIndex > 0) {
        // Swiping right - go to previous tab
        setActiveTab(tabs[currentIndex - 1]);
        // Haptic feedback on mobile devices
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      }
    }

    // Hide indicator
    setSwipeIndicatorVisible(false);
    setSwipeStartX(null);
    setSwipeStartY(null);
  };

  // Add touch event listeners
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    content.addEventListener('touchstart', handleTouchStart, { passive: true });
    content.addEventListener('touchmove', handleTouchMove, { passive: true });
    content.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      content.removeEventListener('touchstart', handleTouchStart);
      content.removeEventListener('touchmove', handleTouchMove);
      content.removeEventListener('touchend', handleTouchEnd);
    };
  }, [swipeStartX, swipeStartY, activeTab]);

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
        <nav className="bg-white rounded-lg shadow-md p-2 flex flex-wrap gap-2" role="navigation" aria-label="Recipe tabs">
          <button
            onClick={() => setActiveTab('sourdough')}
            className={`tab-button px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
              activeTab === 'sourdough'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            role="tab"
            aria-selected={activeTab === 'sourdough'}
            aria-label="View sourdough bread recipe"
          >
            <ChefHat size={20} />
            <span className="hidden sm:inline">Sourdough Bread</span>
            <span className="sm:hidden">Bread</span>
          </button>
          <button
            onClick={() => setActiveTab('focaccia')}
            className={`tab-button px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
              activeTab === 'focaccia'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            role="tab"
            aria-selected={activeTab === 'focaccia'}
            aria-label="View focaccia recipe"
          >
            <ChefHat size={20} />
            Focaccia
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`tab-button px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
              activeTab === 'calculator'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            role="tab"
            aria-selected={activeTab === 'calculator'}
            aria-label="View bulk fermentation calculator"
          >
            <Calculator size={20} />
            <span className="hidden md:inline">Bulk Fermentation Calculator</span>
            <span className="md:hidden">Calculator</span>
          </button>
        </nav>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="max-w-6xl mx-auto mt-6 px-4 swipeable-content"
      >
        {activeTab === 'sourdough' && <SourdoughBread preferences={preferences} updatePreference={updatePreference} />}
        {activeTab === 'focaccia' && <Focaccia preferences={preferences} updatePreference={updatePreference} />}
        {activeTab === 'calculator' && <FermentationCalculator preferences={preferences} updatePreference={updatePreference} />}
      </div>

      {/* Swipe Indicator */}
      <div className={`swipe-indicator ${swipeIndicatorVisible ? 'visible' : ''}`}>
        {swipeIndicatorText}
      </div>
    </div>
  );
}

export default App;
