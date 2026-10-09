import React from 'react';

export default function SharedCaseFields({
  formData,
  onChange,
  errors = {},
  showYear = true,
  showDate = true,
  psFieldName = 'policeStation',
  crimeNoFieldName = 'crimeNo',
  actsFieldName = 'actsSections',
  dateFieldName = 'letterDate',
  sectionTitle = 'Case & Police Station Information',
  sectionMarathi = 'गुन्हा व पोलीस ठाणे तपशील',
  sectionNum = '1'
}) {
  return (
    <div className="form-section-card" style={{ marginBottom: '1.5rem' }}>
      <div className="panel-header" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-900)' }}>
          {sectionNum && <span style={{ color: 'var(--gov-blue-700)', marginRight: '0.5rem' }}>{sectionNum}.</span>}
          {sectionTitle}
          {sectionMarathi && <span className="marathi-header" style={{ marginLeft: '0.5rem', color: 'var(--text-light)', fontWeight: 500 }}>({sectionMarathi})</span>}
        </h3>
        <span className="shared-sync-tag" title="These fields automatically synchronize across all documents belonging to this case">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          <span>Synced with Case</span>
        </span>
      </div>

      <div className="form-grid">
        <div className="form-group col-span-2">
          <label className="form-label" htmlFor={psFieldName}>
            Police Station <span className="marathi-label">(पोलीस ठाणे)</span> <span className="req">*</span>
          </label>
          <input
            type="text"
            id={psFieldName}
            name={psFieldName}
            className="form-control"
            placeholder="e.g., पोलीस ठाणे सायबर, नागपूर शहर"
            value={formData[psFieldName] || ''}
            onChange={(e) => onChange(psFieldName, e.target.value)}
            required
          />
          {errors[psFieldName] && <span className="field-error">{errors[psFieldName]}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor={crimeNoFieldName}>
            Crime / FIR No. <span className="marathi-label">(अपराध क्र. / गुन्हा क्र.)</span> <span className="req">*</span>
          </label>
          <input
            type="text"
            id={crimeNoFieldName}
            name={crimeNoFieldName}
            className="form-control"
            placeholder="e.g., 38/2026 or 108/2025"
            value={formData[crimeNoFieldName] || ''}
            onChange={(e) => onChange(crimeNoFieldName, e.target.value)}
            required
          />
          {errors[crimeNoFieldName] && <span className="field-error">{errors[crimeNoFieldName]}</span>}
        </div>

        {showDate && (
          <div className="form-group">
            <label className="form-label" htmlFor={dateFieldName}>
              Letter / Event Date <span className="marathi-label">(दिनांक / तारीख)</span> <span className="req">*</span>
            </label>
            <input
              type="text"
              id={dateFieldName}
              name={dateFieldName}
              className="form-control"
              placeholder="e.g., २९-०७-२०२६ or 29-07-2026"
              value={formData[dateFieldName] || ''}
              onChange={(e) => onChange(dateFieldName, e.target.value)}
              required
            />
            {errors[dateFieldName] && <span className="field-error">{errors[dateFieldName]}</span>}
          </div>
        )}

        <div className="form-group col-span-2">
          <label className="form-label" htmlFor={actsFieldName}>
            Acts & Sections <span className="marathi-label">(अधिनियम व कलमे)</span> <span className="req">*</span>
          </label>
          <textarea
            rows={2}
            id={actsFieldName}
            name={actsFieldName}
            className="form-control"
            placeholder="e.g., कलम 318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS সহकलम 66(c), 66(d) IT Act"
            value={formData[actsFieldName] || ''}
            onChange={(e) => onChange(actsFieldName, e.target.value)}
            required
          />
          {errors[actsFieldName] && <span className="field-error">{errors[actsFieldName]}</span>}
        </div>
      </div>
    </div>
  );
}
