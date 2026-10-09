import React from 'react';

export default function Header({ onFillSample, onExportDraft, onOpenClearModal }) {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-brand">
          <img src="/assets/emblem.svg" alt="Official Emblem" width="44" height="44" />
          <div className="header-title-block">
            <h1>
              FORM III — ARREST / COURT SURRENDER FORM
              <span className="marathi-title">
                (अटकेचा पंचनामा / न्यायालयाच्या स्वाधीन होण्याचा नमुना)
              </span>
            </h1>
            <p>Official High-Fidelity DOCX Generator • Client-Side &amp; Vercel Ready</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            type="button"
            id="btnFillSample"
            className="btn btn-sample"
            title="Fill fictitious test data for demonstration"
            onClick={onFillSample}
          >
            Fill Sample Test Data
          </button>
          <button
            type="button"
            id="btnExportJson"
            className="btn btn-header-secondary"
            title="Export draft data as JSON file"
            onClick={onExportDraft}
          >
            Export Draft
          </button>
          <button
            type="button"
            id="btnClearForm"
            className="btn btn-danger-outline"
            title="Clear all entered fields"
            onClick={onOpenClearModal}
          >
            Clear Form
          </button>
        </div>
      </div>
    </header>
  );
}
