import { Timer } from '../../shared/Icons.jsx';
import { formatTime } from '../TimerDisplay.jsx';

// Names shown in the active timer summary and notifications
export const timerLabels = {
    autolyse: 'Autolyse',
    sf1: 'Rest before 2nd stretch & fold',
    sf2: 'Rest before 3rd stretch & fold',
    bulk: 'Bulk fermentation check',
    benchrest: 'Bench rest',
    preheat: 'Preheat oven',
    bake1: 'Covered bake',
    bake2: 'Uncovered bake',
};

// Sticky summary of every running timer
const ActiveTimersBar = ({ activeTimers, now, notificationPermission, onEnableNotifications }) => {
    const activeTimerCount = Object.keys(activeTimers).length;
    if (activeTimerCount === 0) return null;

    return (
        <div className="mb-4 bg-purple-600 text-white p-4 rounded-lg shadow-lg sticky top-0 z-10" role="region" aria-label="Active timers">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold flex items-center gap-2">
                    <Timer className="w-5 h-5" />
                    Active Timers ({activeTimerCount})
                </h3>
                {notificationPermission === 'default' && (
                    <button
                        onClick={onEnableNotifications}
                        className="text-xs bg-white text-purple-600 px-3 py-2 rounded hover:bg-purple-50 min-h-[44px]"
                        aria-label="Enable browser notifications for timers"
                    >
                        Enable Notifications
                    </button>
                )}
            </div>
            <div className="space-y-1 text-sm">
                {Object.entries(activeTimers).map(([id, endTime]) => {
                    const remaining = Math.max(0, endTime - now);
                    const timeStr = formatTime(remaining);
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
    );
};

export default ActiveTimersBar;
