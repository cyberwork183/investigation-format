import React from 'react';

/**
 * Reusable list component for additional accused persons (Accused #2, #3, ...)
 */
export function AdditionalAccusedList({
  additionalAccused = [],
  onChange,
  showAlias = false,
  showFather = false
}) {
  const handleAdd = () => {
    onChange([
      ...additionalAccused,
      { accusedName: '', accusedAlias: '', accusedFather: '', accusedAge: '', accusedAddress: '' }
    ]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...additionalAccused];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleRemove = (index) => {
    const updated = additionalAccused.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  return (
    <div className="additional-accused-container" style={{ marginTop: '1rem', width: '100%', gridColumn: 'span 2' }}>
      {additionalAccused.map((acc, idx) => {
        const accusedNum = idx + 2;
        return (
          <div
            key={idx}
            className="additional-accused-card"
            style={{
              marginBottom: '1rem',
              padding: '1rem',
              background: 'var(--bg-subtle, #f8fafc)',
              border: '1px solid var(--border-subtle, #e2e8f0)',
              borderRadius: 'var(--radius-md, 8px)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
                borderBottom: '1px solid var(--border-subtle, #e2e8f0)',
                paddingBottom: '0.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'var(--gov-blue-700, #1e3a8a)',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}
                >
                  {accusedNum}
                </span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--primary-900)' }}>
                  Accused #{accusedNum} <span className="marathi-label" style={{ fontWeight: 500, color: 'var(--text-light)' }}>(आरोपी क्रमांक {accusedNum})</span>
                </strong>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleRemove(idx)}
                style={{
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.8rem',
                  color: 'var(--danger-700, #b91c1c)',
                  borderColor: 'var(--border-strong, #cbd5e1)'
                }}
                title={`Remove Accused #${accusedNum} / आरोपी क्रमांक ${accusedNum} काढा`}
              >
                Remove
              </button>
            </div>

            <div className="form-grid">
              <div className="form-group col-span-2">
                <label className="form-label" htmlFor={`accusedName_${idx}`}>
                  Full Name of Accused <span className="marathi-label">(आरोपीचे पूर्ण नाव)</span> <span className="req">*</span>
                </label>
                <input
                  type="text"
                  id={`accusedName_${idx}`}
                  name={`accusedName_${idx}`}
                  className="form-control"
                  placeholder="e.g., आरोपीचे नाव"
                  value={acc.accusedName || ''}
                  onChange={(e) => handleChange(idx, 'accusedName', e.target.value)}
                  required
                />
              </div>

              {showAlias && (
                <div className="form-group">
                  <label className="form-label" htmlFor={`accusedAlias_${idx}`}>
                    Alias / Other Name <span className="marathi-label">(टोपण नाव)</span>
                  </label>
                  <input
                    type="text"
                    id={`accusedAlias_${idx}`}
                    name={`accusedAlias_${idx}`}
                    className="form-control"
                    placeholder="e.g., टोपण नाव"
                    value={acc.accusedAlias || ''}
                    onChange={(e) => handleChange(idx, 'accusedAlias', e.target.value)}
                  />
                </div>
              )}

              {showFather && (
                <div className="form-group">
                  <label className="form-label" htmlFor={`accusedFather_${idx}`}>
                    Father's / Guardian's Name <span className="marathi-label">(वडील / पालकाचे नाव)</span>
                  </label>
                  <input
                    type="text"
                    id={`accusedFather_${idx}`}
                    name={`accusedFather_${idx}`}
                    className="form-control"
                    placeholder="e.g., वडील/पालकाचे नाव"
                    value={acc.accusedFather || ''}
                    onChange={(e) => handleChange(idx, 'accusedFather', e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor={`accusedAge_${idx}`}>
                  Age in Years <span className="marathi-label">(वय वर्षे)</span>
                </label>
                <input
                  type="text"
                  id={`accusedAge_${idx}`}
                  name={`accusedAge_${idx}`}
                  className="form-control"
                  placeholder="e.g., ३५"
                  value={acc.accusedAge || ''}
                  onChange={(e) => handleChange(idx, 'accusedAge', e.target.value)}
                />
              </div>

              <div className="form-group col-span-2">
                <label className="form-label" htmlFor={`accusedAddress_${idx}`}>
                  Complete Residential Address <span className="marathi-label">(संपूर्ण राहण्याचा पत्ता)</span>
                </label>
                <textarea
                  rows={2}
                  id={`accusedAddress_${idx}`}
                  name={`accusedAddress_${idx}`}
                  className="form-control"
                  placeholder="e.g., संपूर्ण राहण्याचा पत्ता"
                  value={acc.accusedAddress || ''}
                  onChange={(e) => handleChange(idx, 'accusedAddress', e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      })}

      <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-start' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleAdd}
          style={{
            padding: '0.45rem 0.9rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
          title="Add another accused person / आणखी आरोपी जोडा"
        >
          <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span> Add Accused
        </button>
      </div>
    </div>
  );
}

export default function SharedAccusedFields({
  formData,
  onChange,
  errors = {},
  showAlias = true,
  showFather = true,
  title = 'Particulars of Accused',
  marathiTitle = 'आरोपीचा तपशील',
  sectionNum = '2',
  allowMultiple = true
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

        {allowMultiple && (
          <AdditionalAccusedList
            additionalAccused={formData.additionalAccused || []}
            onChange={(nextList) => onChange('additionalAccused', nextList)}
            showAlias={showAlias}
            showFather={showFather}
          />
        )}
      </div>
    </div>
  );
}

