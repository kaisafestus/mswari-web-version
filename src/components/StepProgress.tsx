import React from 'react';

interface StepProgressProps {
  currentStep: 2 | 3;
}

export const StepProgress: React.FC<StepProgressProps> = ({ currentStep }) => {
  return (
    <div className="steps" role="list" aria-label="Hatua za maombi" id="steps-progress">
      {/* Step 1 */}
      <div className="step done" role="listitem">
        <span className="step-circle" aria-hidden="true">✓</span>
        <span className="step-label">Mkopo umechaguliwa</span>
      </div>
      <span className="step-line" aria-hidden="true"></span>

      {/* Step 2 */}
      <div className={`step ${currentStep === 2 ? 'active' : 'done'}`} role="listitem">
        <span className="step-circle" aria-hidden="true">
          {currentStep === 3 ? '✓' : '2'}
        </span>
        <span className="step-label">Maombi</span>
      </div>
      <span className="step-line" aria-hidden="true"></span>

      {/* Step 3 */}
      <div className={`step ${currentStep === 3 ? 'active' : ''}`} role="listitem">
        <span className="step-circle" aria-hidden="true">3</span>
        <span className="step-label">Uthibitisho</span>
      </div>
    </div>
  );
};
