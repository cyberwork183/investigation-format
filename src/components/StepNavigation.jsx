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

export default function StepNavigation({ currentStep, onStepChange, sectionErrors = {}, validatedSteps = {} }) {
  const progressPercent = (currentStep / STEPS.length) * 100;

  return (
    <aside className="step-nav-card" aria-label="Section navigation">
      <h2>Form Sections</h2>
      <div className="progress-bar-container">
        <div className="progress-info">
          <span>Completion Progress</span>
          <span id="progressText">Step {currentStep} of {STEPS.length}</span>
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
          {STEPS.map((s) => {
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
                onClick={() => onStepChange(s.num)}
                style={{ cursor: 'pointer' }}
              >
                <span className="step-number">{s.num}</span>
                <span>{s.label}</span>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
