import React from 'react';

export default function DocumentTopBar({
  docType,
  onBackToDashboard,
  onFillSample,
  onExportDraft,
  onOpenClearModal
}) {
  return (
    <div className="doc-top-bar">
      <div className="doc-top-bar-left">
        <button
          type="button"
          className="btn-back-dashboard"
          onClick={onBackToDashboard}
          title="Return to documents dashboard"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>डॅशबोर्ड / Dashboard</span>
        </button>

        <div className="doc-title-wrapper">
          <div className="doc-badge-row">
            <span className={`badge ${docType.badgeClass}`}>{docType.badge}</span>
            <span className="doc-category-badge">{docType.categoryMr}</span>
          </div>
          <h2 className="doc-page-title">{docType.titleMr}</h2>
          <span className="doc-page-subtitle">{docType.title}</span>
        </div>
      </div>

      <div className="doc-top-bar-actions">
        {onFillSample && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onFillSample}
            title="Load sample demonstration data"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Sample Data</span>
          </button>
        )}

        {onExportDraft && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onExportDraft}
            title="Export draft as JSON file"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Export Draft</span>
          </button>
        )}

        {onOpenClearModal && (
          <button
            type="button"
            className="btn btn-danger-outline btn-sm"
            onClick={onOpenClearModal}
            title="Reset and clear all entered fields"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span>Clear</span>
          </button>
        )}
      </div>
    </div>
  );
}
