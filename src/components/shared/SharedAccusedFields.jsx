import React from 'react';

export default function SharedAccusedFields({
  formData,
  onChange,
  errors = {},
  showAlias = true,
  showFather = true,
  title = 'Particulars of Accused',
  marathiTitle = 'आरोपीचा तपशील',
  sectionNum = '2'
}) {
  return (
    <div className="form-section-card" style={{ marginBottom: '1.5rem' }}>
      <div className="panel-header" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-900)' }}>
          {sectionNum && <span style={{ color: 'var(--gov-blue-700)', marginRight: '0.5rem' }}>{sectionNum}.</span>}
          {title}
          {marathiTitle && <span className="marathi-header" style={{ marginLeft: '0.5rem', color: 'var(--text-light)', fontWeight: 500 }}>({marathiTitle})</span>}
        </h3>
        <span className="shared-sync-tag" title="These accused fields automatically synchronize across all documents belonging to this case">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          <span>Synced with Case</span>
        </span>
      </div>

      <div className="form-grid">
        <div className="form-group col-span-2">
          <label className="form-label" htmlFor="accusedName">
            Full Name of Accused <span className="marathi-label">(आरोपीचे पूर्ण नाव)</span> <span className="req">*</span>
          </label>
          <input
            type="text"
            id="accusedName"
            name="accusedName"
            className="form-control"
            placeholder="e.g., संदीप भानुदास मोरे or Premsukh"
            value={formData.accusedName || ''}
            onChange={(e) => onChange('accusedName', e.target.value)}
            required
          />
          {errors.accusedName && <span className="field-error">{errors.accusedName}</span>}
        </div>

        {showAlias && (
          <div className="form-group">
            <label className="form-label" htmlFor="accusedAlias">
              Alias / Other Name <span className="marathi-label">(टोपण नाव)</span>
            </label>
            <input
              type="text"
              id="accusedAlias"
              name="accusedAlias"
              className="form-control"
              placeholder="e.g., प्रेम किंवा संजू"
              value={formData.accusedAlias || ''}
              onChange={(e) => onChange('accusedAlias', e.target.value)}
            />
          </div>
        )}

        {showFather && (
          <div className="form-group">
            <label className="form-label" htmlFor="accusedFather">
              Father's / Guardian's Name <span className="marathi-label">(वडील / पालकाचे नाव)</span>
            </label>
            <input
              type="text"
              id="accusedFather"
              name="accusedFather"
              className="form-control"
              placeholder="e.g., भाकरराम बिष्णोई"
              value={formData.accusedFather || ''}
              onChange={(e) => onChange('accusedFather', e.target.value)}
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="accusedAge">
            Age in Years <span className="marathi-label">(वय वर्षे)</span>
          </label>
          <input
            type="text"
            id="accusedAge"
            name="accusedAge"
            className="form-control"
            placeholder="e.g., ४२ or 20"
            value={formData.accusedAge || ''}
            onChange={(e) => onChange('accusedAge', e.target.value)}
          />
        </div>

        <div className="form-group col-span-2">
          <label className="form-label" htmlFor="accusedAddress">
            Complete Residential Address <span className="marathi-label">(संपूर्ण राहण्याचा पत्ता)</span>
          </label>
          <textarea
            rows={2}
            id="accusedAddress"
            name="accusedAddress"
            className="form-control"
            placeholder="e.g., हाऊस नं. ७५८/९, गल्ली नं. ९, अटल गेट, नेहरु नगर, इंदौर, मध्य प्रदेश"
            value={formData.accusedAddress || ''}
            onChange={(e) => onChange('accusedAddress', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
