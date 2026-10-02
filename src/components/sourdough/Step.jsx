import { CheckCircle2, Circle } from '../../shared/Icons.jsx';

// Checkbox for marking a recipe step done. A native <button> already toggles
// on Enter and Space, so no extra key handling is needed.
export const StepCheckbox = ({ id, label, checked, onToggle }) => (
    <button
        onClick={() => onToggle(id)}
        className="mt-1 min-w-[44px] min-h-[44px] hover:scale-110 transition-transform flex items-center justify-center"
        role="checkbox"
        aria-checked={checked}
        aria-label={label}
    >
        {checked ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <Circle className="w-6 h-6 text-gray-400" />}
    </button>
);

export const NextBadge = ({ show }) => show ? (
    <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">NEXT</span>
) : null;

// Row styling: dimmed when done, highlighted when it is the next step
export const stepRowClass = (done, isNext) =>
    `flex items-start gap-3 p-2 -ml-2 rounded transition-all duration-300 ${
        done ? 'opacity-60' : isNext ? 'bg-yellow-50 border-2 border-yellow-400 shadow-md' : ''
    }`;
