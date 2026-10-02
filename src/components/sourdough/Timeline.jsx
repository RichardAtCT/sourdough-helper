import { Info } from '../../shared/Icons.jsx';

// Suggested schedule from the chosen start time, highlighting the current stage
const Timeline = ({ startTime }) => {
    const calculateTimeline = () => {
        // Use start time if set, otherwise use current time as "suggested"
        const start = startTime ? new Date(startTime) : new Date();
        const timeline = [
            { time: start, event: 'Mix dough & start autolyse', step: 'mix1' },
            { time: new Date(start.getTime() + 30 * 60000), event: 'First stretch & fold', step: 'sf1' },
            { time: new Date(start.getTime() + 60 * 60000), event: 'Second stretch & fold', step: 'sf2' },
            { time: new Date(start.getTime() + 90 * 60000), event: 'Third stretch & fold', step: 'sf3' },
            { time: new Date(start.getTime() + 9 * 3600000), event: 'Check bulk fermentation', step: 'bulk' },
            { time: new Date(start.getTime() + 24 * 3600000), event: 'Shape & final proof', step: 'shape1' },
            { time: new Date(start.getTime() + 36 * 3600000), event: 'Bake!', step: 'preheat' },
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

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{startTime ? 'Your Timeline' : 'Suggested Timeline'}</h3>
                {!startTime && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Set start time above to personalize</span>}
            </div>
            {(() => {
                const timeline = calculateTimeline();
                const currentIdx = startTime ? getCurrentTimelineStep() : -1;

                return (
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg space-y-2 border border-blue-200">
                        {timeline.map((item, idx) => {
                            const isCurrent = startTime && idx === currentIdx;
                            const isPast = startTime && idx < currentIdx;

                            return (
                                <div
                                    key={idx}
                                    className={`flex justify-between items-center text-sm p-2 rounded transition-all duration-300 ${
                                        isCurrent ? 'bg-green-100 border-2 border-green-500 shadow-md font-semibold' : isPast ? 'opacity-50' : 'bg-white/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {isCurrent && <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">NOW</span>}
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
    );
};

export default Timeline;
