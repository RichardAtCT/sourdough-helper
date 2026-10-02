import { useState, useEffect, useRef } from 'react';
import { Scale, Clock, Info, Star } from '../shared/Icons.jsx';
import { readStoredJSON } from '../utils/storage.js';
import { useFavorites } from '../hooks/useFavorites.js';
import FavoritesModal from './FavoritesModal.jsx';
import { unlockAlarm, playAlarm } from '../utils/alarm.js';
import ActiveTimersBar, { timerLabels } from './sourdough/ActiveTimersBar.jsx';
import Timeline from './sourdough/Timeline.jsx';
import ProcessSteps from './sourdough/ProcessSteps.jsx';


const SourdoughBread = ({ preferences, updatePreference }) => {
    const [scale, setScale] = useState(() => parseFloat(localStorage.getItem('sourdoughScale')) || 1);
    const [activeTimers, setActiveTimers] = useState(() => readStoredJSON('sourdoughActiveTimers', {}));
    const [completedSteps, setCompletedSteps] = useState(() => readStoredJSON('sourdoughCompletedSteps', {}));
    const [startTime, setStartTime] = useState(() => localStorage.getItem('sourdoughStartTime') || null);
    // Timers already alarmed, keyed by id and end time, so each alarm fires once
    const alarmedTimersRef = useRef(new Set());
    const [now, setNow] = useState(() => Date.now());
    const [notificationPermission, setNotificationPermission] = useState(() =>
        'Notification' in window ? Notification.permission : 'default'
    );
    const { favorites, addFavorite, deleteFavorite } = useFavorites('sourdoughFavorites');
    const [showFavoritesModal, setShowFavoritesModal] = useState(false);

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
        unlockAlarm();
        await requestNotificationPermission();
        const endTime = Date.now() + duration * 60 * 1000;
        setNow(Date.now());
        setActiveTimers(prev => ({ ...prev, [id]: endTime }));
    };

    const stopTimer = (id) => {
        setActiveTimers(prev => {
            const newTimers = { ...prev };
            delete newTimers[id];
            return newTimers;
        });
    };

    const loadFavorite = (favorite) => {
        setScale(favorite.settings.scale);
        setStartTime(favorite.settings.startTime);
        localStorage.setItem('sourdoughScale', favorite.settings.scale.toString());
        localStorage.setItem('sourdoughStartTime', favorite.settings.startTime || '');
    };


    const activeTimerCount = Object.keys(activeTimers).length;

    // Tick once a second while any timer is running
    useEffect(() => {
        if (activeTimerCount === 0) return;
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, [activeTimerCount]);

    // Sound the alarm and notify once for each timer that has finished
    useEffect(() => {
        const finished = Object.entries(activeTimers)
            .filter(([id, endTime]) => endTime <= now && !alarmedTimersRef.current.has(`${id}:${endTime}`));
        if (finished.length === 0) return;

        finished.forEach(([id, endTime]) => alarmedTimersRef.current.add(`${id}:${endTime}`));
        playAlarm();
        if ('Notification' in window && Notification.permission === 'granted') {
            finished.forEach(([id]) => {
                new Notification('Timer Complete! ⏰', {
                    body: `${timerLabels[id] || id} - Your timer has finished!`,
                    tag: id,
                    requireInteraction: true
                });
            });
        }
    }, [now, activeTimers]);

    const timerProps = { activeTimers, now, onStart: startTimer, onStop: stopTimer };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">

            <ActiveTimersBar
                activeTimers={activeTimers}
                now={now}
                notificationPermission={notificationPermission}
                onEnableNotifications={requestNotificationPermission}
            />

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

            {showFavoritesModal && (
                <FavoritesModal
                    favorites={favorites}
                    currentSummary={`${scale}x scale, ${startTime ? new Date(startTime).toLocaleString() : 'no start time'}`}
                    describe={(favorite) => {
                        const start = favorite.settings.startTime;
                        return (
                            <>
                                Scale: {favorite.settings.scale}x
                                {start && (
                                    <span className="ml-2">
                                        • Start: {new Date(start).toLocaleDateString()} {new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </>
                        );
                    }}
                    onSave={(name) => addFavorite(name, { scale, startTime })}
                    onLoad={loadFavorite}
                    onDelete={deleteFavorite}
                    onClose={() => setShowFavoritesModal(false)}
                />
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

            <Timeline startTime={startTime} />

            <ProcessSteps completedSteps={completedSteps} setCompletedSteps={setCompletedSteps} timerProps={timerProps} />

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
