import React from 'react';

export default function Header({
  activeDocType,
  onBackToDashboard,
  onFillSample,
  onExportDraft,
  onOpenClearModal
}) {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-brand" onClick={onBackToDashboard} style={{ cursor: 'pointer' }}>
          <img src="/assets/emblem.svg" alt="Official Emblem" width="44" height="44" />
          <div className="header-title-block">
            {activeDocType ? (
              <>
                <h1>
                  {activeDocType.title}
                  <span className="marathi-title">
                    ({activeDocType.titleMr})
                  </span>
                </h1>
                <p>Official High-Fidelity DOCX Generator • Client-Side &amp; 100% Private</p>
              </>
            ) : (
              <>
                <h1>
                  POLICE INVESTIGATION DOCUMENT GENERATOR
                  <span className="marathi-title">
                    (पोलीस तपास अधिकृत दस्तऐवज प्रणाली)
                  </span>
                </h1>
                <p>Official High-Fidelity DOCX Generator Suite • 100% Client-Side</p>
              </>
            )}
          </div>
        </div>

        <div className="header-actions">
          {activeDocType && onBackToDashboard && (
            <button
              type="button"
              className="btn btn-header-secondary"
              onClick={onBackToDashboard}
              title="Return to documents dashboard"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Dashboard</span>
            </button>
          )}

          {activeDocType && onFillSample && (
            <button
              type="button"
              id="btnFillSample"
              className="btn btn-sample"
              title="Fill fictitious test data for demonstration"
              onClick={onFillSample}
            >
              Fill Sample Data
            </button>
          )}

          {activeDocType && onExportDraft && (
            <button
              type="button"
              id="btnExportJson"
              className="btn btn-header-secondary"
              title="Export draft data as JSON file"
              onClick={onExportDraft}
            >
              Export Draft
            </button>
          )}

          {activeDocType && onOpenClearModal && (
            <button
              type="button"
              id="btnClearForm"
              className="btn btn-header-danger"
              title="Clear all entered fields"
              onClick={onOpenClearModal}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>Clear Form</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
