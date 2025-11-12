import { useState, useEffect, useRef } from 'react';
import { Timer, Scale, Clock, Info, CheckCircle2, Circle, Star, Heart, Save, X } from '../shared/Icons.jsx';

const SourdoughBread = ({ preferences, updatePreference }) => {
    const [scale, setScale] = useState(1);
    const [activeTimers, setActiveTimers] = useState({});
    const [completedSteps, setCompletedSteps] = useState({});
    const [startTime, setStartTime] = useState(null);
    const [completedTimers, setCompletedTimers] = useState({});
    const [notificationPermission, setNotificationPermission] = useState('default');
    const [favorites, setFavorites] = useState([]);
    const [favoriteName, setFavoriteName] = useState('');
    const [showFavoritesModal, setShowFavoritesModal] = useState(false);
    const audioRef = useRef(null);

    // Load persisted state from localStorage
    useEffect(() => {
        const savedSteps = localStorage.getItem('sourdoughCompletedSteps');
        if (savedSteps) {
            try {
                setCompletedSteps(JSON.parse(savedSteps));
            } catch (e) {
                console.error('Failed to load completed steps');
            }
        }

        const savedTimers = localStorage.getItem('sourdoughActiveTimers');
        if (savedTimers) {
            try {
                setActiveTimers(JSON.parse(savedTimers));
            } catch (e) {
                console.error('Failed to load active timers');
            }
        }

        const savedScale = localStorage.getItem('sourdoughScale');
        if (savedScale) {
            setScale(parseFloat(savedScale));
        }

        const savedStartTime = localStorage.getItem('sourdoughStartTime');
        if (savedStartTime) {
            setStartTime(savedStartTime);
        }

        const savedFavorites = localStorage.getItem('sourdoughFavorites');
        if (savedFavorites) {
            try {
                setFavorites(JSON.parse(savedFavorites));
            } catch (e) {
                console.error('Failed to load favorites');
            }
        }

        // Request notification permission
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
        }
    }, []);

    // Save completed steps to localStorage
    useEffect(() => {
        localStorage.setItem('sourdoughCompletedSteps', JSON.stringify(completedSteps));
    }, [completedSteps]);

    // Save active timers to localStorage
    useEffect(() => {
        localStorage.setItem('sourdoughActiveTimers', JSON.stringify(activeTimers));
    }, [activeTimers]);

    // Save scale to localStorage
    useEffect(() => {
        localStorage.setItem('sourdoughScale', scale.toString());
    }, [scale]);

    // Add page unload warning if timers are active
    useEffect(() => {
        const hasActiveTimers = Object.keys(activeTimers).length > 0;

        const handleBeforeUnload = (e) => {
            if (hasActiveTimers) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        };

        if (hasActiveTimers) {
            window.addEventListener('beforeunload', handleBeforeUnload);
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [activeTimers]);

    // Request notification permission on first timer start
    const requestNotificationPermission = async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
        }
    };

    const baseRecipe = {
        flour: 500,
        starter: 105,
        water: 342,
        salt: 11
    };

    const getScaledAmount = (base) => Math.round(base * scale);

    const getBakersPercent = (ingredient) => {
        return ((baseRecipe[ingredient] / baseRecipe.flour) * 100).toFixed(1);
    };

    const startTimer = async (id, duration) => {
        await requestNotificationPermission();
        const endTime = Date.now() + duration * 60 * 1000;
        setActiveTimers(prev => ({ ...prev, [id]: endTime }));
        setCompletedTimers(prev => ({ ...prev, [id]: false }));
    };

    const stopTimer = (id) => {
        setActiveTimers(prev => {
            const newTimers = { ...prev };
            delete newTimers[id];
            return newTimers;
        });
        setCompletedTimers(prev => {
            const newCompleted = { ...prev };
            delete newCompleted[id];
            return newCompleted;
        });
    };

    const toggleStep = (stepId) => {
        setCompletedSteps(prev => ({ ...prev, [stepId]: !prev[stepId] }));
    };

    const saveFavorite = () => {
        if (!favoriteName.trim()) {
            alert('Please enter a name for your favorite');
            return;
        }

        const newFavorite = {
            id: Date.now(),
            name: favoriteName.trim(),
            settings: { scale, startTime }
        };

        const updatedFavorites = [...favorites, newFavorite];
        setFavorites(updatedFavorites);
        localStorage.setItem('sourdoughFavorites', JSON.stringify(updatedFavorites));
        setFavoriteName('');
        setShowFavoritesModal(false);
    };

    const loadFavorite = (favorite) => {
        setScale(favorite.settings.scale);
        setStartTime(favorite.settings.startTime);
        localStorage.setItem('sourdoughScale', favorite.settings.scale.toString());
        localStorage.setItem('sourdoughStartTime', favorite.settings.startTime || '');
    };

    const deleteFavorite = (favoriteId) => {
        if (!window.confirm('Are you sure you want to delete this favorite?')) {
            return;
        }

        const updatedFavorites = favorites.filter(f => f.id !== favoriteId);
        setFavorites(updatedFavorites);
        localStorage.setItem('sourdoughFavorites', JSON.stringify(updatedFavorites));
    };

    // Find the first uncompleted step to highlight
    const getNextUncompletedStep = () => {
        const stepOrder = ['prep1', 'mix1', 'mix2', 'sf1', 'sf2', 'sf3', 'bulk', 'shape1', 'shape2', 'shape3', 'proof', 'preheat', 'score', 'bake1', 'bake2'];
        return stepOrder.find(stepId => !completedSteps[stepId]);
    };

    const nextStep = getNextUncompletedStep();

    const TimerDisplay = ({ id, label, duration }) => {
        const [timeLeft, setTimeLeft] = useState(0);
        const endTime = activeTimers[id];
        const isCompleted = completedTimers[id];

        useEffect(() => {
            if (!endTime) {
                setTimeLeft(0);
                return;
            }

            const interval = setInterval(() => {
                const remaining = Math.max(0, endTime - Date.now());
                setTimeLeft(remaining);

                if (remaining === 0 && !completedTimers[id]) {
                    // Play audio
                    if (audioRef.current) {
                        audioRef.current.play();
                    }

                    // Show browser notification
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('Timer Complete! ⏰', {
                            body: `${label} - Your timer has finished!`,
                            icon: '🍞',
                            tag: id,
                            requireInteraction: true
                        });
                    }

                    // Mark as completed
                    setCompletedTimers(prev => ({ ...prev, [id]: true }));
                }
            }, 1000);

            return () => clearInterval(interval);
        }, [endTime, id, label]);

        const formatTime = (ms) => {
            const hours = Math.floor(ms / 3600000);
            const minutes = Math.floor((ms % 3600000) / 60000);
            const seconds = Math.floor((ms % 60000) / 1000);
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        const isActive = !!endTime;
        const isFinished = isActive && timeLeft === 0;

        return (
            <div className={`p-3 rounded-lg mt-2 transition-all ${
                isFinished ? 'bg-green-100 border-2 border-green-500 animate-pulse' : 'bg-gray-100'
            }`}>
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{label}</span>
                    {endTime ? (
                        <div className="flex items-center gap-2">
                            <span
                                className={`text-lg font-mono ${isFinished ? 'text-green-700 font-bold' : ''}`}
                                role="timer"
                                aria-live="polite"
                                aria-label={`${label} time remaining: ${formatTime(timeLeft)}`}
                            >
                                {isFinished ? '✓ Done!' : formatTime(timeLeft)}
                            </span>
                            <button
                                onClick={() => stopTimer(id)}
                                className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 min-h-[44px] min-w-[60px]"
                                aria-label={`Stop ${label} timer`}
                            >
                                Stop
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => startTimer(id, duration)}
                            className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 flex items-center gap-1 min-h-[44px]"
                            aria-label={`Start ${label} timer for ${duration} minutes`}
                        >
                            <Timer className="w-4 h-4" />
                            Start {duration}min
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const calculateTimeline = () => {
        // Use start time if set, otherwise use current time as "suggested"
        const start = startTime ? new Date(startTime) : new Date();
        const timeline = [
            { time: start, event: "Mix dough & start autolyse", step: 'mix1' },
            { time: new Date(start.getTime() + 30 * 60000), event: "First stretch & fold", step: 'sf1' },
            { time: new Date(start.getTime() + 60 * 60000), event: "Second stretch & fold", step: 'sf2' },
            { time: new Date(start.getTime() + 90 * 60000), event: "Third stretch & fold", step: 'sf3' },
            { time: new Date(start.getTime() + 9 * 3600000), event: "Check bulk fermentation", step: 'bulk' },
            { time: new Date(start.getTime() + 24 * 3600000), event: "Shape & final proof", step: 'shape1' },
            { time: new Date(start.getTime() + 36 * 3600000), event: "Bake!", step: 'preheat' }
        ];

        return timeline;
    };

    // Determine which timeline item is current
    const getCurrentTimelineStep = () => {
        const timeline = calculateTimeline();
        const now = new Date();

        // Find the last timeline item that has passed
        for (let i = timeline.length - 1; i >= 0; i--) {
            if (now >= timeline[i].time) {
                return i;
            }
        }
        return 0; // If no items have passed, we're at the first one
    };

    // Central timer summary
    const activeTimerCount = Object.keys(activeTimers).length;
    const timerLabels = {
        'autolyse': 'Autolyse',
        'sf1': 'Rest before 2nd stretch & fold',
        'sf2': 'Rest before 3rd stretch & fold',
        'bulk': 'Bulk fermentation check',
        'benchrest': 'Bench rest',
        'preheat': 'Preheat oven',
        'bake1': 'Covered bake',
        'bake2': 'Uncovered bake'
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCuBzvLTiTYIG2m98OScTgwOUamt7blmFgU2k9n1unEiBC13yO/eizEIHWq+8+OWT" />

            {/* Active Timer Summary Bar */}
            {activeTimerCount > 0 && (
                <div className="mb-4 bg-purple-600 text-white p-4 rounded-lg shadow-lg sticky top-0 z-10" role="region" aria-label="Active timers">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold flex items-center gap-2">
                            <Timer className="w-5 h-5" />
                            Active Timers ({activeTimerCount})
                        </h3>
                        {notificationPermission === 'default' && (
                            <button
                                onClick={requestNotificationPermission}
                                className="text-xs bg-white text-purple-600 px-3 py-2 rounded hover:bg-purple-50 min-h-[44px]"
                                aria-label="Enable browser notifications for timers"
                            >
                                Enable Notifications
                            </button>
                        )}
                    </div>
                    <div className="space-y-1 text-sm">
                        {Object.entries(activeTimers).map(([id, endTime]) => {
                            const remaining = Math.max(0, endTime - Date.now());
                            const hours = Math.floor(remaining / 3600000);
                            const minutes = Math.floor((remaining % 3600000) / 60000);
                            const seconds = Math.floor((remaining % 60000) / 1000);
                            const timeStr = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                            const isFinished = remaining === 0;

                            return (
                                <div key={id} className={`flex justify-between items-center ${isFinished ? 'font-bold' : ''}`}>
                                    <span>{timerLabels[id] || id}</span>
                                    <span className="font-mono">{isFinished ? '✓ Done!' : timeStr}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Beginner's Sourdough Bread</h2>
                <p className="text-gray-600">Step-by-step guide with interactive timers and tracking</p>
            </div>

            {/* Controls */}
            <div className="bg-purple-50 p-4 rounded-lg mb-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <Scale className="w-4 h-4" />
                            Recipe Scale
                        </label>
                        <div className="flex items-center gap-2 mb-2">
                            <input
                                type="range"
                                min="0.5"
                                max="4"
                                step="0.25"
                                value={scale}
                                onChange={(e) => setScale(parseFloat(e.target.value))}
                                className="flex-1"
                                aria-label={`Recipe scale: ${scale} times the base recipe`}
                                aria-valuemin="0.5"
                                aria-valuemax="4"
                                aria-valuenow={scale}
                            />
                            <span className="font-mono bg-white px-3 py-1 rounded" aria-hidden="true">
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
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <Clock className="w-4 h-4" />
                            Start Time
                        </label>
                        <input
                            type="datetime-local"
                            value={startTime || ''}
                            onChange={(e) => {
                                setStartTime(e.target.value);
                                localStorage.setItem('sourdoughStartTime', e.target.value);
                            }}
                            className="w-full px-3 py-2 border rounded min-h-[44px]"
                            aria-label="Set recipe start time for timeline calculation"
                        />
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
                                Current: {scale}x scale, {startTime ? new Date(startTime).toLocaleString() : 'no start time'}
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
                                                        Scale: {favorite.settings.scale}x
                                                        {favorite.settings.startTime && (
                                                            <span className="ml-2">
                                                                • Start: {new Date(favorite.settings.startTime).toLocaleDateString()} {new Date(favorite.settings.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

            {/* Ingredients */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Ingredients</h3>

                {/* Yield Indicator */}
                {(() => {
                    const totalWeight = getScaledAmount(baseRecipe.flour + baseRecipe.starter + baseRecipe.water + baseRecipe.salt);

                    // Calculate yield description based on weight
                    const getYieldDescription = (weight) => {
                        if (weight <= 500) return { loaves: "1 small loaf or 2 baguettes", servings: "4-6 servings" };
                        if (weight <= 1100) return { loaves: "1 large loaf", servings: "8-12 servings" };
                        if (weight <= 1600) return { loaves: "1 extra-large loaf or 2 medium loaves", servings: "12-18 servings" };
                        if (weight <= 2200) return { loaves: "2 large loaves", servings: "16-24 servings" };
                        if (weight <= 3000) return { loaves: "3 large loaves", servings: "24-36 servings" };
                        return { loaves: "4 large loaves", servings: "32-48 servings" };
                    };

                    const yieldInfo = getYieldDescription(totalWeight);

                    return (
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-300 p-4 rounded-lg mb-4 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="bg-purple-600 text-white p-2 rounded-lg">
                                        <Scale className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-purple-700 font-medium">Recipe Yield</div>
                                        <div className="text-lg font-bold text-purple-900">{yieldInfo.loaves}</div>
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
                            <span>All-purpose flour</span>
                            <span className="font-mono font-semibold">
                                {getScaledAmount(baseRecipe.flour)}g
                                {preferences.showBakersPercent && <span className="text-gray-500 ml-2">(100%)</span>}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Active starter</span>
                            <span className="font-mono font-semibold">
                                {getScaledAmount(baseRecipe.starter)}g
                                {preferences.showBakersPercent && <span className="text-gray-500 ml-2">({getBakersPercent('starter')}%)</span>}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Water</span>
                            <span className="font-mono font-semibold">
                                {getScaledAmount(baseRecipe.water)}g
                                {preferences.showBakersPercent && <span className="text-gray-500 ml-2">({getBakersPercent('water')}%)</span>}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Salt</span>
                            <span className="font-mono font-semibold">
                                {getScaledAmount(baseRecipe.salt)}g
                                {preferences.showBakersPercent && <span className="text-gray-500 ml-2">({getBakersPercent('salt')}%)</span>}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">
                        {startTime ? 'Your Timeline' : 'Suggested Timeline'}
                    </h3>
                    {!startTime && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Set start time above to personalize
                        </span>
                    )}
                </div>
                {(() => {
                    const timeline = calculateTimeline();
                    const currentIdx = startTime ? getCurrentTimelineStep() : -1;

                    return (
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg space-y-2 border border-blue-200">
                            {timeline.map((item, idx) => {
                                const isCurrent = startTime && idx === currentIdx;
                                const isPast = startTime && idx < currentIdx;
                                const isFuture = startTime && idx > currentIdx;

                                return (
                                    <div
                                        key={idx}
                                        className={`flex justify-between items-center text-sm p-2 rounded transition-all duration-300 ${
                                            isCurrent ? 'bg-green-100 border-2 border-green-500 shadow-md font-semibold' :
                                            isPast ? 'opacity-50' :
                                            'bg-white/50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {isCurrent && (
                                                <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                                    NOW
                                                </span>
                                            )}
                                            {isPast && <span className="text-green-600">✓</span>}
                                            <span className={isCurrent ? 'font-bold' : ''}>{item.event}</span>
                                        </div>
                                        <span className={`font-mono ${isCurrent ? 'font-bold text-green-700' : ''}`}>
                                            {item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                );
                            })}
                            {!startTime && (
                                <div className="mt-3 text-xs text-blue-700 bg-blue-100 p-2 rounded flex items-center gap-2">
                                    <Info className="w-4 h-4" />
                                    <span>💡 Tip: Times shown assume you start now. Set a start time above for a personalized schedule.</span>
                                </div>
                            )}
                        </div>
                    );
                })()}
            </div>

            {/* Process Steps */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h3 className="text-xl font-semibold">Process Steps</h3>
                    <div className="flex items-center gap-3">
                        <div className="text-sm">
                            {(() => {
                                const totalSteps = 15;
                                const completedCount = Object.values(completedSteps).filter(Boolean).length;
                                const percentage = Math.round((completedCount / totalSteps) * 100);
                                return (
                                    <span className="font-medium text-purple-700">
                                        {completedCount} of {totalSteps} completed ({percentage}%)
                                    </span>
                                );
                            })()}
                        </div>
                        {Object.values(completedSteps).some(Boolean) && (
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to clear all completed steps? This cannot be undone.')) {
                                        setCompletedSteps({});
                                    }
                                }}
                                className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors font-medium min-h-[44px]"
                                aria-label="Clear all completed steps"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                {(() => {
                    const totalSteps = 15;
                    const completedCount = Object.values(completedSteps).filter(Boolean).length;
                    const percentage = Math.round((completedCount / totalSteps) * 100);
                    return (
                        <div className="mb-4 bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-purple-500 to-purple-700 h-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                                style={{ width: `${percentage}%` }}
                                role="progressbar"
                                aria-valuenow={percentage}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={`Recipe progress: ${percentage}% complete`}
                            >
                                {percentage > 10 && (
                                    <span className="text-white text-xs font-bold">{percentage}%</span>
                                )}
                            </div>
                        </div>
                    );
                })()}

                <div className="space-y-6">
                    {/* Preparation */}
                    <div className={`border-l-4 border-purple-600 pl-4 transition-all duration-300 ${
                        completedSteps.prep1 ? 'opacity-60' : nextStep === 'prep1' ? 'bg-yellow-50 -ml-2 pl-6 py-3 rounded-lg border-2 border-yellow-400 shadow-md' : ''
                    }`}>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            Preparation
                            {nextStep === 'prep1' && <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full font-bold">NEXT STEP</span>}
                        </h4>
                        <div className="flex items-start gap-3">
                            <button
                                onClick={() => toggleStep('prep1')}
                                className="mt-1 min-w-[44px] min-h-[44px] hover:scale-110 transition-transform flex items-center justify-center"
                                role="checkbox"
                                aria-checked={completedSteps.prep1 || false}
                                aria-label="Mark preparation step as complete"
                                tabIndex={0}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        toggleStep('prep1');
                                    }
                                }}
                            >
                                {completedSteps.prep1 ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <Circle className="w-6 h-6 text-gray-400" />}
                            </button>
                            <div className="flex-1">
                                <p>Feed starter 4-12 hours before (it should be active and bubbly)</p>
                            </div>
                        </div>
                    </div>

                    {/* Mixing */}
                    <div className="border-l-4 border-purple-600 pl-4">
                        <h4 className="font-semibold mb-3">Mixing & Autolyse</h4>
                        <div className="space-y-3">
                            <div className={`flex items-start gap-3 p-2 -ml-2 rounded transition-all duration-300 ${
                                completedSteps.mix1 ? 'opacity-60' : nextStep === 'mix1' ? 'bg-yellow-50 border-2 border-yellow-400 shadow-md' : ''
                            }`}>
                                <button
                                    onClick={() => toggleStep('mix1')}
                                    className="mt-1 min-w-[44px] min-h-[44px] hover:scale-110 transition-transform flex items-center justify-center"
                                    role="checkbox"
                                    aria-checked={completedSteps.mix1 || false}
                                    aria-label="Mark mixing step as complete"
                                    tabIndex={0}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            toggleStep('mix1');
                                        }
                                    }}
                                >
                                    {completedSteps.mix1 ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <Circle className="w-6 h-6 text-gray-400" />}
                                </button>
                                <div className="flex-1">
                                    <p className="flex items-center gap-2">
                                        Combine water, starter, salt, and flour in a large bowl
                                        {nextStep === 'mix1' && <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">NEXT</span>}
                                    </p>
                                </div>
                            </div>
                            <div className={`flex items-start gap-3 p-2 -ml-2 rounded transition-all duration-300 ${
                                completedSteps.mix2 ? 'opacity-60' : nextStep === 'mix2' ? 'bg-yellow-50 border-2 border-yellow-400 shadow-md' : ''
                            }`}>
                                <button
                                    onClick={() => toggleStep('mix2')}
                                    className="mt-1 min-w-[44px] min-h-[44px] hover:scale-110 transition-transform flex items-center justify-center"
                                    role="checkbox"
                                    aria-checked={completedSteps.mix2 || false}
                                    aria-label="Mark autolyse rest as complete"
                                    tabIndex={0}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            toggleStep('mix2');
                                        }
                                    }}
                                >
                                    {completedSteps.mix2 ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <Circle className="w-6 h-6 text-gray-400" />}
                                </button>
                                <div className="flex-1">
                                    <p className="flex items-center gap-2 flex-wrap">
                                        Cover and let rest (<span className="border-b border-dotted border-gray-500 cursor-help" title="Autolyse: A resting period where flour and water are mixed and allowed to rest before adding salt. This allows the flour to fully hydrate and begins gluten development, resulting in better dough structure and easier handling.">autolyse</span>)
                                        {nextStep === 'mix2' && <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">NEXT</span>}
                                    </p>
                                    <TimerDisplay id="autolyse" label="Autolyse" duration={30} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stretch and Folds */}
                    <div className="border-l-4 border-purple-600 pl-4">
                        <h4 className="font-semibold mb-3"><span className="border-b border-dotted border-gray-500 cursor-help" title="Stretch and Folds: A gentle technique to develop gluten structure without kneading. Wet your hand, grab one side of the dough, stretch it up, and fold it over to the opposite side. Rotate the bowl 90° and repeat 3 more times.">Stretch and Folds</span></h4>
                        <div className="space-y-3">
                            <div className="bg-purple-50 p-3 rounded-lg text-sm flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                Perform 4 stretch and folds per round, turning bowl 1/4 turn each time
                            </div>
                            <div className={`flex items-start gap-3 p-2 -ml-2 rounded transition-all duration-300 ${
                                completedSteps.sf1 ? 'opacity-60' : nextStep === 'sf1' ? 'bg-yellow-50 border-2 border-yellow-400 shadow-md' : ''
                            }`}>
                                <button
                                    onClick={() => toggleStep('sf1')}
                                    className="mt-1 min-w-[44px] min-h-[44px] hover:scale-110 transition-transform flex items-center justify-center"
                                    role="checkbox"
                                    aria-checked={completedSteps.sf1 || false}
                                    aria-label="Mark first stretch and fold as complete"
                                    tabIndex={0}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            toggleStep('sf1');
                                        }
                                    }}
                                >
                                    {completedSteps.sf1 ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <Circle className="w-6 h-6 text-gray-400" />}
                                </button>
                                <div className="flex-1">
                                    <p className="flex items-center gap-2">
                                        First round of stretch and folds
                                        {nextStep === 'sf1' && <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">NEXT</span>}
                                    </p>
                                    <TimerDisplay id="sf1" label="Rest before 2nd round" duration={30} />
                                </div>
                            </div>
                            <div className={`flex items-start gap-3 p-2 -ml-2 rounded transition-all duration-300 ${
                                completedSteps.sf2 ? 'opacity-60' : nextStep === 'sf2' ? 'bg-yellow-50 border-2 border-yellow-400 shadow-md' : ''
                            }`}>
                                <button
                                    onClick={() => toggleStep('sf2')}
                                    className="mt-1 min-w-[44px] min-h-[44px] hover:scale-110 transition-transform flex items-center justify-center"
                                    role="checkbox"
                                    aria-checked={completedSteps.sf2 || false}
                                    aria-label="Mark second stretch and fold as complete"
                                    tabIndex={0}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            toggleStep('sf2');
                                        }
                                    }}
                                >
                                    {completedSteps.sf2 ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <Circle className="w-6 h-6 text-gray-400" />}
                                </button>
                                <div className="flex-1">
                                    <p className="flex items-center gap-2">
                                        Second round of stretch and folds
                                        {nextStep === 'sf2' && <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">NEXT</span>}
                                    </p>
                                    <TimerDisplay id="sf2" label="Rest before 3rd round" duration={30} />
                                </div>
                            </div>
                            <div className={`flex items-start gap-3 p-2 -ml-2 rounded transition-all duration-300 ${
                                completedSteps.sf3 ? 'opacity-60' : nextStep === 'sf3' ? 'bg-yellow-50 border-2 border-yellow-400 shadow-md' : ''
                            }`}>
                                <button
                                    onClick={() => toggleStep('sf3')}
                                    className="mt-1 min-w-[44px] min-h-[44px] hover:scale-110 transition-transform flex items-center justify-center"
                                    role="checkbox"
                                    aria-checked={completedSteps.sf3 || false}
                                    aria-label="Mark third stretch and fold as complete"
                                    tabIndex={0}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            toggleStep('sf3');
                                        }
                                    }}
                                >
                                    {completedSteps.sf3 ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <Circle className="w-6 h-6 text-gray-400" />}
                                </button>
                                <div className="flex-1">
                                    <p className="flex items-center gap-2">
                                        Third round of stretch and folds
                                        {nextStep === 'sf3' && <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">NEXT</span>}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bulk Fermentation */}
                    <div className="border-l-4 border-purple-600 pl-4">
                        <h4 className="font-semibold mb-3"><span className="border-b border-dotted border-gray-500 cursor-help" title="Bulk Fermentation: The first rise of the dough after mixing, where the entire batch ferments together. The dough should roughly double in size and show visible bubbles on the surface. This develops flavor and structure.">Bulk Fermentation</span></h4>
                        <div className={`flex items-start gap-3 p-2 -ml-2 rounded transition-all duration-300 ${
                            completedSteps.bulk ? 'opacity-60' : nextStep === 'bulk' ? 'bg-yellow-50 border-2 border-yellow-400 shadow-md' : ''
                        }`}>
                            <button
                                onClick={() => toggleStep('bulk')}
                                className="mt-1 min-w-[44px] min-h-[44px] hover:scale-110 transition-transform flex items-center justify-center"
                                role="checkbox"
                                aria-checked={completedSteps.bulk || false}
                                aria-label="Mark bulk fermentation as complete"
                                tabIndex={0}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        toggleStep('bulk');
                                    }
                                }}
                            >
                                {completedSteps.bulk ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <Circle className="w-6 h-6 text-gray-400" />}
                            </button>
                            <div className="flex-1">
                                <p className="flex items-center gap-2">
                                    Cover and let bulk ferment until doubled (6-12 hours)
                                    {nextStep === 'bulk' && <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">NEXT</span>}
                                </p>
                                <div className="mt-2 bg-yellow-100 border-2 border-yellow-400 p-3 rounded-lg text-sm flex items-start gap-2 shadow-sm">
                                    <span className="text-lg" role="img" aria-label="important">⚡</span>
                                    <div>
                                        <strong className="font-bold text-yellow-900">Important:</strong>
                                        <span className="text-yellow-900"> Time varies based on temperature and starter strength</span>
                                    </div>
                                </div>
                                <TimerDisplay id="bulk" label="Bulk fermentation check" duration={360} />
                            </div>
                        </div>
                    </div>

                    {/* Shaping */}
                    <div className="border-l-4 border-purple-600 pl-4">
                        <h4 className="font-semibold mb-3">Shaping</h4>
                        <div className="space-y-3">
                            <div className={`flex items-start gap-3 p-2 -ml-2 rounded transition-all duration-300 ${
                                completedSteps.shape1 ? 'opacity-60' : nextStep === 'shape1' ? 'bg-yellow-50 border-2 border-yellow-400 shadow-md' : ''
                            }`}>
                                <button
                                    onClick={() => toggleStep('shape1')}
                                    className="mt-1 min-w-[44px] min-h-[44px] hover:scale-110 transition-transform flex items-center justify-center"
                                    role="checkbox"
                                    aria-checked={completedSteps.shape1 || false}
                                    aria-label="Mark pre-shaping as complete"
                                    tabIndex={0}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            toggleStep('shape1');
                                        }
                                    }}
                                >
                                    {completedSteps.shape1 ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <Circle className="w-6 h-6 text-gray-400" />}
                                </button>
                                <div className="flex-1">
                                    <p className="flex items-center gap-2">
                                        Pre-shape: fold dough and form into a ball
                                        {nextStep === 'shape1' && <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">NEXT</span>}
                                    </p>
                                </div>
                            </div>
                            <div className={`flex items-start gap-3 p-2 -ml-2 rounded transition-all duration-300 ${
                                completedSteps.shape2 ? 'opacity-60' : nextStep === 'shape2' ? 'bg-yellow-50 border-2 border-yellow-400 shadow-md' : ''
                            }`}>
                                <button
                                    onClick={() => toggleStep('shape2')}
                                    className="mt-1 min-w-[44px] min-h-[44px] hover:scale-110 transition-transform flex items-center justify-center"
                                    role="checkbox"
                                    aria-checked={completedSteps.shape2 || false}
                                    aria-label="Mark bench rest as complete"
                                    tabIndex={0}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            toggleStep('shape2');
                                        }
                                    }}
                                >
                                    {completedSteps.shape2 ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <Circle className="w-6 h-6 text-gray-400" />}
                                </button>
                                <div className="flex-1">
                                    <p className="flex items-center gap-2 flex-wrap">
                                        Optional: Let rest uncovered
                                        {nextStep === 'shape2' && <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">NEXT</span>}
                                    </p>
                                    <TimerDisplay id="benchrest" label="Bench rest" duration={20} />
                                </div>
                            </div>
                            <div className={`flex items-start gap-3 p-2 -ml-2 rounded transition-all duration-300 ${
                                completedSteps.shape3 ? 'opacity-60' : nextStep === 'shape3' ? 'bg-yellow-50 border-2 border-yellow-400 shadow-md' : ''
                            }`}>
                                <button
                                    onClick={() => toggleStep('shape3')}
                                    className="mt-1 min-w-[44px] min-h-[44px] hover:scale-110 transition-transform flex items-center justify-center"
                                    role="checkbox"
                                    aria-checked={completedSteps.shape3 || false}
                                    aria-label="Mark final shaping as complete"
                                    tabIndex={0}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            toggleStep('shape3');
                                        }
                                    }}
                                >
                                    {completedSteps.shape3 ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <Circle className="w-6 h-6 text-gray-400" />}
                                </button>
                                <div className="flex-1">
                                    <p className="flex items-center gap-2">
                                        Final shape: fold sides to create tension
                                        {nextStep === 'shape3' && <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">NEXT</span>}
                                    </p>
                                </div>
                            </div>
                            <div className={`flex items-start gap-3 p-2 -ml-2 rounded transition-all duration-300 ${
                                completedSteps.proof ? 'opacity-60' : nextStep === 'proof' ? 'bg-yellow-50 border-2 border-yellow-400 shadow-md' : ''
                            }`}>
                                <button
                                    onClick={() => toggleStep('proof')}
                                    className="mt-1 min-w-[44px] min-h-[44px] hover:scale-110 transition-transform flex items-center justify-center"
                                    role="checkbox"
                                    aria-checked={completedSteps.proof || false}
                                    aria-label="Mark final proofing as complete"
                                    tabIndex={0}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            toggleStep('proof');
                                        }
                                    }}
                                >
                                    {completedSteps.proof ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <Circle className="w-6 h-6 text-gray-400" />}
                                </button>
                                <div className="flex-1">
                                    <p className="flex items-center gap-2 flex-wrap">
                                        Transfer to <span className="border-b border-dotted border-gray-500 cursor-help" title="Banneton: A proofing basket, traditionally made from cane or rattan, used for the final rise. It supports the dough's shape and creates attractive rings on the crust. Can substitute with a bowl lined with a well-floured towel.">banneton</span> (seam up), cover, and refrigerate 12-15 hours
                                        {nextStep === 'proof' && <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">NEXT</span>}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Baking */}
                    <div className="border-l-4 border-purple-600 pl-4">
                        <h4 className="font-semibold mb-3">Baking</h4>
                        <div className="space-y-3">
                            <div className={`flex items-start gap-3 p-2 -ml-2 rounded transition-all duration-300 ${
                                completedSteps.preheat ? 'opacity-60' : nextStep === 'preheat' ? 'bg-yellow-50 border-2 border-yellow-400 shadow-md' : ''
                            }`}>
                                <button
                                    onClick={() => toggleStep('preheat')}
                                    className="mt-1 min-w-[44px] min-h-[44px] hover:scale-110 transition-transform flex items-center justify-center"
                                    role="checkbox"
                                    aria-checked={completedSteps.preheat || false}
                                    aria-label="Mark oven preheating as complete"
                                    tabIndex={0}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            toggleStep('preheat');
                                        }
                                    }}
                                >
                                    {completedSteps.preheat ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <Circle className="w-6 h-6 text-gray-400" />}
                                </button>
                                <div className="flex-1">
                                    <p className="flex items-center gap-2">
                                        Preheat Dutch oven to 260°C (500°F)
                                        {nextStep === 'preheat' && <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">NEXT</span>}
                                    </p>
                                    <TimerDisplay id="preheat" label="Preheat" duration={60} />
                                </div>
                            </div>
                            <div className={`flex items-start gap-3 p-2 -ml-2 rounded transition-all duration-300 ${
                                completedSteps.score ? 'opacity-60' : nextStep === 'score' ? 'bg-yellow-50 border-2 border-yellow-400 shadow-md' : ''
                            }`}>
                                <button
                                    onClick={() => toggleStep('score')}
                                    className="mt-1 min-w-[44px] min-h-[44px] hover:scale-110 transition-transform flex items-center justify-center"
                                    role="checkbox"
                                    aria-checked={completedSteps.score || false}
                                    aria-label="Mark dough scoring as complete"
                                    tabIndex={0}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            toggleStep('score');
                                        }
                                    }}
                                >
                                    {completedSteps.score ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <Circle className="w-6 h-6 text-gray-400" />}
                                </button>
                                <div className="flex-1">
                                    <p className="flex items-center gap-2 flex-wrap">
                                        Remove from fridge, place on parchment, dust with flour, and score
                                        {nextStep === 'score' && <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">NEXT</span>}
                                    </p>
                                </div>
                            </div>
                            <div className={`flex items-start gap-3 p-2 -ml-2 rounded transition-all duration-300 ${
                                completedSteps.bake1 ? 'opacity-60' : nextStep === 'bake1' ? 'bg-yellow-50 border-2 border-yellow-400 shadow-md' : ''
                            }`}>
                                <button
                                    onClick={() => toggleStep('bake1')}
                                    className="mt-1 min-w-[44px] min-h-[44px] hover:scale-110 transition-transform flex items-center justify-center"
                                    role="checkbox"
                                    aria-checked={completedSteps.bake1 || false}
                                    aria-label="Mark covered baking as complete"
                                    tabIndex={0}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            toggleStep('bake1');
                                        }
                                    }}
                                >
                                    {completedSteps.bake1 ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <Circle className="w-6 h-6 text-gray-400" />}
                                </button>
                                <div className="flex-1">
                                    <p className="flex items-center gap-2">
                                        Bake covered at 260°C
                                        {nextStep === 'bake1' && <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">NEXT</span>}
                                    </p>
                                    <TimerDisplay id="bake1" label="Covered bake" duration={20} />
                                </div>
                            </div>
                            <div className={`flex items-start gap-3 p-2 -ml-2 rounded transition-all duration-300 ${
                                completedSteps.bake2 ? 'opacity-60' : nextStep === 'bake2' ? 'bg-yellow-50 border-2 border-yellow-400 shadow-md' : ''
                            }`}>
                                <button
                                    onClick={() => toggleStep('bake2')}
                                    className="mt-1 min-w-[44px] min-h-[44px] hover:scale-110 transition-transform flex items-center justify-center"
                                    role="checkbox"
                                    aria-checked={completedSteps.bake2 || false}
                                    aria-label="Mark uncovered baking as complete"
                                    tabIndex={0}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            toggleStep('bake2');
                                        }
                                    }}
                                >
                                    {completedSteps.bake2 ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <Circle className="w-6 h-6 text-gray-400" />}
                                </button>
                                <div className="flex-1">
                                    <p className="flex items-center gap-2 flex-wrap">
                                        Remove lid, reduce to 245°C (475°F), bake until golden
                                        {nextStep === 'bake2' && <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">NEXT</span>}
                                    </p>
                                    <TimerDisplay id="bake2" label="Uncovered bake" duration={20} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tips */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Pro Tips
                </h4>
                <ul className="space-y-1 text-sm">
                    <li>• Your starter should pass the float test before using</li>
                    <li>• If dough seems dry, resist adding water - use wet hands during folding</li>
                    <li>• Bulk fermentation time varies greatly with temperature</li>
                    <li>• A kitchen scale ensures consistent results</li>
                    <li>• The fridge rise improves scoring and oven spring</li>
                </ul>
            </div>
        </div>
    );
};

export default SourdoughBread;
