import { Fragment } from 'react';
import { ArrowLeft, Home, Check } from 'lucide-react';

const SIGNUP_STEPS = [
  { id: 1, label: '기본 정보' },
  { id: 2, label: '선호 정보' },
];

const SignupStepHeader = ({ currentStep = 1, onBack, onExit }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-semibold text-gray-500 md:text-sm">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-gray-600 transition hover:bg-gray-50"
        >
          <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
          이전으로
        </button>
        <span className="text-gray-600">
          STEP {currentStep} / {SIGNUP_STEPS.length}
        </span>
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-gray-600 transition hover:bg-gray-50"
        >
          홈으로
          <Home className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
        {SIGNUP_STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isLast = index === SIGNUP_STEPS.length - 1;

          return (
            <Fragment key={step.id}>
              <div className="flex flex-1 items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition ${
                    isCompleted
                      ? 'border-primary bg-primary text-white'
                      : isActive
                      ? 'border-primary bg-white text-primary'
                      : 'border-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="text-xs uppercase tracking-wide text-gray-400">STEP {stepNumber}</span>
                  <span className={`text-sm font-semibold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.label}
                  </span>
                </div>
              </div>
              {!isLast && (
                <div
                  className={`hidden h-0.5 flex-1 rounded-full md:block ${
                    isCompleted ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default SignupStepHeader;

