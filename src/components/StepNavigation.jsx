import React from 'react';

const STEPS = [
  { num: 1, label: 'Case Information' },
  { num: 2, label: 'Arrest & Court Details' },
  { num: 3, label: 'Acts & Status' },
  { num: 4, label: 'Particulars of Accused' },
  { num: 5, label: 'Physical Features (1–25)' },
  { num: 6, label: 'Custody, Search & Intimation' },
  { num: 7, label: 'Socio-Economic & Police Record' },
  { num: 8, label: 'Witnesses, Officer & Review' }
];

export default function StepNavigation({
  steps = STEPS,
  currentStep,
  onStepChange,
  onGoToStep,
  sectionErrors = {},
  validatedSteps = {},
  title = 'Form Sections',
  marathiTitle = 'अर्जाचे विभाग'
}) {
  const stepList = steps && steps.length > 0 ? steps : STEPS;
  const progressPercent = Math.min(100, Math.round((currentStep / stepList.length) * 100));

  const handleStepClick = (stepNum) => {
    if (typeof onStepChange === 'function') {
      onStepChange(stepNum);
    } else if (typeof onGoToStep === 'function') {
      onGoToStep(stepNum);
    }
  };

  return (
    <aside className="step-nav-card" aria-label="Section navigation">
      <h2>
        {title}
        {marathiTitle && <span className="marathi-header" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-light)', marginTop: '2px' }}>({marathiTitle})</span>}
      </h2>
      <div className="progress-bar-container">
        <div className="progress-info">
          <span>Completion Progress</span>
          <span id="progressText">Step {currentStep} of {stepList.length}</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            id="progressFill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <nav>
        <ul className="step-list" id="stepList">
          {stepList.map((s) => {
            const hasError = sectionErrors[s.num] && sectionErrors[s.num].length > 0;
            const isValidated = validatedSteps[s.num];
            let itemClass = 'step-item';
            if (s.num === currentStep) itemClass += ' active';
            if (hasError) {
              itemClass += ' invalid';
            } else if (isValidated) {
              itemClass += ' valid';
            }

            return (
              <li
                key={s.num}
                className={itemClass}
                data-step={s.num}
                onClick={() => handleStepClick(s.num)}
                style={{ cursor: 'pointer' }}
              >
                <span className="step-number">{s.num}</span>
                <span style={{ display: 'flex', flexDirection: 'column' }}>
                  <span>{s.label}</span>
                  {s.marathi && (
                    <span className="marathi-subtext" style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 'normal' }}>
                      {s.marathi}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
