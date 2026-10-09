import React from 'react';

export default function DocumentReviewCard({
  docType,
  formData,
  onGenerateDocx,
  isGeneratingDocx = false,
  onEditSection
}) {
  const renderValue = (val) => {
    if (val === undefined || val === null || val === '') {
      return <span className="review-empty">—</span>;
    }
    if (Array.isArray(val)) {
      return (
        <ul className="review-list">
          {val.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    }
    return <span className="review-value-text">{String(val)}</span>;
  };

  return (
    <div className="review-summary-container">
      <div className="review-header">
        <div className="review-header-badge">
          <span className="badge badge-primary">Review & Generate</span>
        </div>
        <h3 className="review-main-title">{docType.titleMr}</h3>
        <p className="review-subtitle">
          दस्तऐवज जनरेट करण्यापूर्वी खालील सर्व माहिती तपासा. चूक असल्यास त्वरित बदल करता येईल.
        </p>
      </div>

      <div className="review-grid-card">
        <table className="review-table">
          <tbody>
            {Object.entries(formData).map(([key, val]) => {
              if (typeof val === 'object' && !Array.isArray(val)) return null;
              // Format key name nicely
              const label = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (str) => str.toUpperCase());

              return (
                <tr key={key}>
                  <td className="review-field-label">{label}</td>
                  <td className="review-field-value">{renderValue(val)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="review-action-footer">
        <button
          type="button"
          className="btn btn-primary btn-lg btn-generate"
          onClick={onGenerateDocx}
          disabled={isGeneratingDocx}
        >
          {isGeneratingDocx ? (
            <>
              <div className="spinner-sm"></div>
              <span>DOCX तयार होत आहे... / Generating Official DOCX...</span>
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>अधिकृत DOCX डाऊनलोड करा / Download Official DOCX</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
