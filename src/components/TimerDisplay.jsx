import { Timer } from '../shared/Icons.jsx';

export const formatTime = (ms) => {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// A start/stop countdown for one recipe step. Stateless: the parent owns the
// timers and the ticking clock, so re-renders never reset the countdown.
const TimerDisplay = ({ id, label, duration, activeTimers, now, onStart, onStop }) => {
  const endTime = activeTimers[id];
  const timeLeft = endTime ? Math.max(0, endTime - now) : 0;
  const isFinished = !!endTime && timeLeft === 0;

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
              onClick={() => onStop(id)}
              className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 min-h-[44px] min-w-[60px]"
              aria-label={`Stop ${label} timer`}
            >
              Stop
            </button>
          </div>
        ) : (
          <button
            onClick={() => onStart(id, duration)}
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

export default TimerDisplay;
