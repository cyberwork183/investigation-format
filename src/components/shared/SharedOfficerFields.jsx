import React from 'react';

export default function SharedOfficerFields({
  formData,
  onChange,
  errors = {},
  title = 'Investigating Officer Details',
  marathiTitle = 'तपासी अधिकारी तपशील',
  sectionNum = '3'
}) {
  return (
    <div className="form-section-card" style={{ marginBottom: '1.5rem' }}>
      <div className="panel-header" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-900)' }}>
          {sectionNum && <span style={{ color: 'var(--gov-blue-700)', marginRight: '0.5rem' }}>{sectionNum}.</span>}
          {title}
          {marathiTitle && <span className="marathi-header" style={{ marginLeft: '0.5rem', color: 'var(--text-light)', fontWeight: 500 }}>({marathiTitle})</span>}
        </h3>
        <span className="shared-sync-tag" title="These investigating officer fields automatically synchronize across all documents belonging to this case">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          <span>Synced with Case</span>
        </span>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="ioName">
            Officer Name <span className="marathi-label">(अधिकाऱ्याचे नाव)</span>
          </label>
          <input
            type="text"
            id="ioName"
            name="ioName"
            className="form-control"
            placeholder="e.g., सुरेश डांबरे or सुधीर पाटील"
            value={formData.ioName || ''}
            onChange={(e) => onChange('ioName', e.target.value)}
          />
          {errors.ioName && <span className="field-error">{errors.ioName}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="ioRank">
            Rank / Designation <span className="marathi-label">(पदनाम / हुद्दा)</span>
          </label>
          <input
            type="text"
            id="ioRank"
            name="ioRank"
            className="form-control"
            placeholder="e.g., वरीष्ठ पोलीस निरीक्षक / पोलीस निरीक्षक"
            value={formData.ioRank || ''}
            onChange={(e) => onChange('ioRank', e.target.value)}
          />
        </div>

        <div className="form-group col-span-2">
          <label className="form-label" htmlFor="ioStation">
            Police Station / Unit <span className="marathi-label">(पोलीस ठाणे / शाखा)</span>
          </label>
          <input
            type="text"
            id="ioStation"
            name="ioStation"
            className="form-control"
            placeholder="e.g., पोलीस ठाणे सायबर, नागपूर शहर"
            value={formData.ioStation || ''}
            onChange={(e) => onChange('ioStation', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
