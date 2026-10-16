import React, { useState, useEffect } from 'react';
import { SINGLE_ACCUSED_DOCS } from '../../utils/shareDetails';

/**
 * ShareDetailsModal.jsx
 * Professional selection UI for Smart Share Details.
 * Allows choosing between Single-Accused and Multiple-Accused sharing modes.
 */
export default function ShareDetailsModal({
  isOpen,
  onClose,
  onConfirm,
  sourceDocId
}) {
  const [selectedMode, setSelectedMode] = useState('single');

  // Set initial recommended mode based on the source document
  useEffect(() => {
    if (isOpen) {
      if (sourceDocId && SINGLE_ACCUSED_DOCS.includes(sourceDocId)) {
        setSelectedMode('single');
      } else {
        setSelectedMode('multiple');
      }
    }
  }, [isOpen, sourceDocId]);

  // Handle keyboard shortcuts (Escape to close, Enter to confirm)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm(selectedMode);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedMode, onClose, onConfirm]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay active"
      id="shareDetailsModal"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div
        className="modal-card share-details-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="share-modal-header">
          <div className="share-modal-title-wrap">
            <div className="share-modal-icon-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </div>
            <div>
              <h3 id="share-modal-title">Share Details</h3>
              <span className="share-modal-subtitle-mr">माहिती शेअर करा — पद्धत निवडा</span>
            </div>
          </div>
          <button
            type="button"
            className="share-modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
            title="Cancel and close"
          >
            &times;
          </button>
        </div>

        <p className="share-modal-prompt">
          Choose how accused details should be shared across investigation documents:
        </p>

        {/* MODE SELECTION OPTIONS */}
        <div className="share-mode-options" role="radiogroup" aria-label="Accused sharing mode">
          {/* OPTION 1: SINGLE ACCUSED */}
          <div
            className={`share-mode-card ${selectedMode === 'single' ? 'selected' : ''}`}
            onClick={() => setSelectedMode('single')}
            role="radio"
            aria-checked={selectedMode === 'single'}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setSelectedMode('single');
              }
            }}
          >
            <div className="share-mode-radio-wrap">
              <span className={`share-mode-radio-circle ${selectedMode === 'single' ? 'active' : ''}`}>
                {selectedMode === 'single' && <span className="share-mode-radio-dot" />}
              </span>
            </div>

            <div className="share-mode-icon-box">
              {/* Single User Icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            <div className="share-mode-info">
              <div className="share-mode-title-line">
                <span className="share-mode-title">Single Accused</span>
                <span className="share-mode-badge single">Form III • Sec. 47 & 48</span>
              </div>
              <p className="share-mode-desc">
                Share one accused person's details across the single-accused forms.
              </p>
              <span className="share-mode-desc-mr">
                एका आरोपीचे नाव, वय व पत्ता केवळ फॉर्म ३, कलम ४७ व ४८ नोटीस मध्येच शेअर होईल.
              </span>
            </div>
          </div>

          {/* OPTION 2: MULTIPLE ACCUSED */}
          <div
            className={`share-mode-card ${selectedMode === 'multiple' ? 'selected' : ''}`}
            onClick={() => setSelectedMode('multiple')}
            role="radio"
            aria-checked={selectedMode === 'multiple'}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setSelectedMode('multiple');
              }
            }}
          >
            <div className="share-mode-radio-wrap">
              <span className={`share-mode-radio-circle ${selectedMode === 'multiple' ? 'active' : ''}`}>
                {selectedMode === 'multiple' && <span className="share-mode-radio-dot" />}
              </span>
            </div>

            <div className="share-mode-icon-box">
              {/* Multiple Users Icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>

            <div className="share-mode-info">
              <div className="share-mode-title-line">
                <span className="share-mode-title">Multiple Accused</span>
                <span className="share-mode-badge multi">PCR • Notice 35(2) • Sanha • Medical...</span>
              </div>
              <p className="share-mode-desc">
                Keep each accused person's details separate across multiple-accused forms.
              </p>
              <span className="share-mode-desc-mr">
                सर्व आरोपींची स्वतंत्र नावे व माहिती मल्टिपल आरोपी दस्तऐवजांमध्ये सुरक्षित ठेवली जाईल.
              </span>
            </div>
          </div>
        </div>

        {/* COMMON CASE DETAILS BANNER */}
        <div className="share-common-note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>
            <strong>Note:</strong> Crime number, police station, acts &amp; sections, and IO details are always shared across all forms in both modes.
          </span>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="share-modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary btn-confirm-share"
            onClick={() => onConfirm(selectedMode)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            <span>Confirm &amp; Share Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}
