import { Info } from '../../shared/Icons.jsx';
import TimerDisplay from '../TimerDisplay.jsx';
import { StepCheckbox, NextBadge, stepRowClass } from './Step.jsx';

const STEP_ORDER = ['prep1', 'mix1', 'mix2', 'sf1', 'sf2', 'sf3', 'bulk', 'shape1', 'shape2', 'shape3', 'proof', 'preheat', 'score', 'bake1', 'bake2'];

// The checklist of recipe steps, with progress and per-step timers
const ProcessSteps = ({ completedSteps, setCompletedSteps, timerProps }) => {
    const toggleStep = (stepId) => {
        setCompletedSteps((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
    };

    // The first uncompleted step is highlighted
    const nextStep = STEP_ORDER.find((stepId) => !completedSteps[stepId]);

    const totalSteps = STEP_ORDER.length;
    const completedCount = STEP_ORDER.filter((stepId) => completedSteps[stepId]).length;
    const percentage = Math.round((completedCount / totalSteps) * 100);

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h3 className="text-xl font-semibold">Process Steps</h3>
                <div className="flex items-center gap-3">
                    <div className="text-sm">
                        <span className="font-medium text-purple-700">
                            {completedCount} of {totalSteps} completed ({percentage}%)
                        </span>
                    </div>
                    {completedCount > 0 && (
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
                    {percentage > 10 && <span className="text-white text-xs font-bold">{percentage}%</span>}
                </div>
            </div>

            <div className="space-y-6">
                {/* Preparation */}
                <div
                    className={`border-l-4 border-purple-600 pl-4 transition-all duration-300 ${
                        completedSteps.prep1
                            ? 'opacity-60'
                            : nextStep === 'prep1'
                              ? 'bg-yellow-50 -ml-2 pl-6 py-3 rounded-lg border-2 border-yellow-400 shadow-md'
                              : ''
                    }`}
                >
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        Preparation
                        {nextStep === 'prep1' && <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full font-bold">NEXT STEP</span>}
                    </h4>
                    <div className="flex items-start gap-3">
                        <StepCheckbox id="prep1" label="Mark preparation step as complete" checked={!!completedSteps.prep1} onToggle={toggleStep} />
                        <div className="flex-1">
                            <p>Feed starter 4-12 hours before (it should be active and bubbly)</p>
                        </div>
                    </div>
                </div>

                {/* Mixing */}
                <div className="border-l-4 border-purple-600 pl-4">
                    <h4 className="font-semibold mb-3">Mixing & Autolyse</h4>
                    <div className="space-y-3">
                        <div className={stepRowClass(completedSteps.mix1, nextStep === 'mix1')}>
                            <StepCheckbox id="mix1" label="Mark mixing step as complete" checked={!!completedSteps.mix1} onToggle={toggleStep} />
                            <div className="flex-1">
                                <p className="flex items-center gap-2">
                                    Combine water, starter, salt, and flour in a large bowl
                                    <NextBadge show={nextStep === 'mix1'} />
                                </p>
                            </div>
                        </div>
                        <div className={stepRowClass(completedSteps.mix2, nextStep === 'mix2')}>
                            <StepCheckbox id="mix2" label="Mark autolyse rest as complete" checked={!!completedSteps.mix2} onToggle={toggleStep} />
                            <div className="flex-1">
                                <p className="flex items-center gap-2 flex-wrap">
                                    Cover and let rest (
                                    <span
                                        className="border-b border-dotted border-gray-500 cursor-help"
                                        title="Autolyse: A resting period where flour and water are mixed and allowed to rest before adding salt. This allows the flour to fully hydrate and begins gluten development, resulting in better dough structure and easier handling."
                                    >
                                        autolyse
                                    </span>
                                    )
                                    <NextBadge show={nextStep === 'mix2'} />
                                </p>
                                <TimerDisplay id="autolyse" label="Autolyse" duration={30} {...timerProps} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stretch and Folds */}
                <div className="border-l-4 border-purple-600 pl-4">
                    <h4 className="font-semibold mb-3">
                        <span
                            className="border-b border-dotted border-gray-500 cursor-help"
                            title="Stretch and Folds: A gentle technique to develop gluten structure without kneading. Wet your hand, grab one side of the dough, stretch it up, and fold it over to the opposite side. Rotate the bowl 90° and repeat 3 more times."
                        >
                            Stretch and Folds
                        </span>
                    </h4>
                    <div className="space-y-3">
                        <div className="bg-purple-50 p-3 rounded-lg text-sm flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Perform 4 stretch and folds per round, turning bowl 1/4 turn each time
                        </div>
                        <div className={stepRowClass(completedSteps.sf1, nextStep === 'sf1')}>
                            <StepCheckbox id="sf1" label="Mark first stretch and fold as complete" checked={!!completedSteps.sf1} onToggle={toggleStep} />
                            <div className="flex-1">
                                <p className="flex items-center gap-2">
                                    First round of stretch and folds
                                    <NextBadge show={nextStep === 'sf1'} />
                                </p>
                                <TimerDisplay id="sf1" label="Rest before 2nd round" duration={30} {...timerProps} />
                            </div>
                        </div>
                        <div className={stepRowClass(completedSteps.sf2, nextStep === 'sf2')}>
                            <StepCheckbox id="sf2" label="Mark second stretch and fold as complete" checked={!!completedSteps.sf2} onToggle={toggleStep} />
                            <div className="flex-1">
                                <p className="flex items-center gap-2">
                                    Second round of stretch and folds
                                    <NextBadge show={nextStep === 'sf2'} />
                                </p>
                                <TimerDisplay id="sf2" label="Rest before 3rd round" duration={30} {...timerProps} />
                            </div>
                        </div>
                        <div className={stepRowClass(completedSteps.sf3, nextStep === 'sf3')}>
                            <StepCheckbox id="sf3" label="Mark third stretch and fold as complete" checked={!!completedSteps.sf3} onToggle={toggleStep} />
                            <div className="flex-1">
                                <p className="flex items-center gap-2">
                                    Third round of stretch and folds
                                    <NextBadge show={nextStep === 'sf3'} />
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bulk Fermentation */}
                <div className="border-l-4 border-purple-600 pl-4">
                    <h4 className="font-semibold mb-3">
                        <span
                            className="border-b border-dotted border-gray-500 cursor-help"
                            title="Bulk Fermentation: The first rise of the dough after mixing, where the entire batch ferments together. The dough should roughly double in size and show visible bubbles on the surface. This develops flavor and structure."
                        >
                            Bulk Fermentation
                        </span>
                    </h4>
                    <div className={stepRowClass(completedSteps.bulk, nextStep === 'bulk')}>
                        <StepCheckbox id="bulk" label="Mark bulk fermentation as complete" checked={!!completedSteps.bulk} onToggle={toggleStep} />
                        <div className="flex-1">
                            <p className="flex items-center gap-2">
                                Cover and let bulk ferment until doubled (6-12 hours)
                                <NextBadge show={nextStep === 'bulk'} />
                            </p>
                            <div className="mt-2 bg-yellow-100 border-2 border-yellow-400 p-3 rounded-lg text-sm flex items-start gap-2 shadow-sm">
                                <span className="text-lg" role="img" aria-label="important">
                                    ⚡
                                </span>
                                <div>
                                    <strong className="font-bold text-yellow-900">Important:</strong>
                                    <span className="text-yellow-900"> Time varies based on temperature and starter strength</span>
                                </div>
                            </div>
                            <TimerDisplay id="bulk" label="Bulk fermentation check" duration={360} {...timerProps} />
                        </div>
                    </div>
                </div>

                {/* Shaping */}
                <div className="border-l-4 border-purple-600 pl-4">
                    <h4 className="font-semibold mb-3">Shaping</h4>
                    <div className="space-y-3">
                        <div className={stepRowClass(completedSteps.shape1, nextStep === 'shape1')}>
                            <StepCheckbox id="shape1" label="Mark pre-shaping as complete" checked={!!completedSteps.shape1} onToggle={toggleStep} />
                            <div className="flex-1">
                                <p className="flex items-center gap-2">
                                    Pre-shape: fold dough and form into a ball
                                    <NextBadge show={nextStep === 'shape1'} />
                                </p>
                            </div>
                        </div>
                        <div className={stepRowClass(completedSteps.shape2, nextStep === 'shape2')}>
                            <StepCheckbox id="shape2" label="Mark bench rest as complete" checked={!!completedSteps.shape2} onToggle={toggleStep} />
                            <div className="flex-1">
                                <p className="flex items-center gap-2 flex-wrap">
                                    Optional: Let rest uncovered
                                    <NextBadge show={nextStep === 'shape2'} />
                                </p>
                                <TimerDisplay id="benchrest" label="Bench rest" duration={20} {...timerProps} />
                            </div>
                        </div>
                        <div className={stepRowClass(completedSteps.shape3, nextStep === 'shape3')}>
                            <StepCheckbox id="shape3" label="Mark final shaping as complete" checked={!!completedSteps.shape3} onToggle={toggleStep} />
                            <div className="flex-1">
                                <p className="flex items-center gap-2">
                                    Final shape: fold sides to create tension
                                    <NextBadge show={nextStep === 'shape3'} />
                                </p>
                            </div>
                        </div>
                        <div className={stepRowClass(completedSteps.proof, nextStep === 'proof')}>
                            <StepCheckbox id="proof" label="Mark final proofing as complete" checked={!!completedSteps.proof} onToggle={toggleStep} />
                            <div className="flex-1">
                                <p className="flex items-center gap-2 flex-wrap">
                                    Transfer to{' '}
                                    <span
                                        className="border-b border-dotted border-gray-500 cursor-help"
                                        title="Banneton: A proofing basket, traditionally made from cane or rattan, used for the final rise. It supports the dough's shape and creates attractive rings on the crust. Can substitute with a bowl lined with a well-floured towel."
                                    >
                                        banneton
                                    </span>{' '}
                                    (seam up), cover, and refrigerate 12-15 hours
                                    <NextBadge show={nextStep === 'proof'} />
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Baking */}
                <div className="border-l-4 border-purple-600 pl-4">
                    <h4 className="font-semibold mb-3">Baking</h4>
                    <div className="space-y-3">
                        <div className={stepRowClass(completedSteps.preheat, nextStep === 'preheat')}>
                            <StepCheckbox id="preheat" label="Mark oven preheating as complete" checked={!!completedSteps.preheat} onToggle={toggleStep} />
                            <div className="flex-1">
                                <p className="flex items-center gap-2">
                                    Preheat Dutch oven to 260°C (500°F)
                                    <NextBadge show={nextStep === 'preheat'} />
                                </p>
                                <TimerDisplay id="preheat" label="Preheat" duration={60} {...timerProps} />
                            </div>
                        </div>
                        <div className={stepRowClass(completedSteps.score, nextStep === 'score')}>
                            <StepCheckbox id="score" label="Mark dough scoring as complete" checked={!!completedSteps.score} onToggle={toggleStep} />
                            <div className="flex-1">
                                <p className="flex items-center gap-2 flex-wrap">
                                    Remove from fridge, place on parchment, dust with flour, and score
                                    <NextBadge show={nextStep === 'score'} />
                                </p>
                            </div>
                        </div>
                        <div className={stepRowClass(completedSteps.bake1, nextStep === 'bake1')}>
                            <StepCheckbox id="bake1" label="Mark covered baking as complete" checked={!!completedSteps.bake1} onToggle={toggleStep} />
                            <div className="flex-1">
                                <p className="flex items-center gap-2">
                                    Bake covered at 260°C
                                    <NextBadge show={nextStep === 'bake1'} />
                                </p>
                                <TimerDisplay id="bake1" label="Covered bake" duration={20} {...timerProps} />
                            </div>
                        </div>
                        <div className={stepRowClass(completedSteps.bake2, nextStep === 'bake2')}>
                            <StepCheckbox id="bake2" label="Mark uncovered baking as complete" checked={!!completedSteps.bake2} onToggle={toggleStep} />
                            <div className="flex-1">
                                <p className="flex items-center gap-2 flex-wrap">
                                    Remove lid, reduce to 245°C (475°F), bake until golden
                                    <NextBadge show={nextStep === 'bake2'} />
                                </p>
                                <TimerDisplay id="bake2" label="Uncovered bake" duration={20} {...timerProps} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProcessSteps;
