import React from 'react';

const STATUS_LABELS = [
  'Arrested and forward (अटक केली व न्यायालयात पाठविले)',
  'Arrested and released on bail or PR bound (अटक केली व जामीनावर सोडले)',
  'Arrested but released on anticipatory bail (अटक केली व अटकपुर्व जामीनावर सोडले)',
  'Arrested and remanded to Police Custody (अटक केले व पोलीस कोठडीत पाठविले)',
  'Surrendered in court and bailed out (न्यायालयाचे स्वाधिन व जामीनावर)',
  'Surrendered in court and sent to judicial Custody (न्यायालयाचे स्वाधिन व न्यायालयीन कोठडीत)',
  'Surrendered in court and remanded to Police Custody (न्यायालयाचे स्वाधिन व पोलीस कोठडीत)'
];

const INCOME_LABELS = [
  'Lower Income (Below Rs. 25,000 P.Y.)',
  'Lower Middle Income (from Rs. 25,001 to 50,000)',
  'Middle Income (from Rs. 50,001 to 1,00,000)',
  'Upper Middle Income (from 1,00,000 to 2,00,000)',
  'Upper Middle Income (from 2,00,000 to 3,00,000)',
  'Upper Income (above 3,00,000)'
];

export default function ReviewSummary({ formData, hasPhoto, onGoToStep }) {
  const pf = formData.physicalFeatures || {};

  return (
    <div id="reviewContentArea" className="review-container">
      {/* Case Information */}
      <div className="review-section">
        <div className="review-section-header">
          <span>Section 1 — Case Information (तपासाची माहिती)</span>
          <button
            type="button"
            className="btn btn-header-secondary"
            style={{ color: '#0f172a', borderColor: '#cbd5e1' }}
            onClick={() => onGoToStep(1)}
          >
            Edit
          </button>
        </div>
        <div className="review-grid">
          <div className="review-item"><span className="review-label">State</span><span className="review-value">{formData.state || '-'}</span></div>
          <div className="review-item"><span className="review-label">District</span><span className="review-value">{formData.district || '-'}</span></div>
          <div className="review-item"><span className="review-label">Police Station</span><span className="review-value">{formData.policeStation || '-'}</span></div>
          <div className="review-item"><span className="review-label">FIR / G.D. No. &amp; Year</span><span className="review-value">{formData.firNo || '-'} / {formData.year || '-'}</span></div>
          <div className="review-item"><span className="review-label">Date</span><span className="review-value">{formData.date || '-'}</span></div>
          <div className="review-item"><span className="review-label">Accused Code</span><span className="review-value"><strong>{formData.accusedCode || '-'}</strong></span></div>
        </div>
      </div>

      {/* Arrest Details */}
      <div className="review-section">
        <div className="review-section-header">
          <span>Section 2 &amp; 3 — Arrest &amp; Court Details (अटकेची जागा व न्यायालय)</span>
          <button
            type="button"
            className="btn btn-header-secondary"
            style={{ color: '#0f172a', borderColor: '#cbd5e1' }}
            onClick={() => onGoToStep(2)}
          >
            Edit
          </button>
        </div>
        <div className="review-grid">
          <div className="review-item"><span className="review-label">Date &amp; Time of Arrest</span><span className="review-value">{formData.arrestDate || '-'} at {formData.arrestTime || '-'}</span></div>
          <div className="review-item"><span className="review-label">Station Diary / G.D. No.</span><span className="review-value">{formData.gdNo || '-'}</span></div>
          <div className="review-item"><span className="review-label">Place of Arrest (P.S., Dist, State)</span><span className="review-value">{[formData.arrestPS, formData.arrestDist, formData.arrestState].filter(Boolean).join(', ') || '-'}</span></div>
          <div className="review-item"><span className="review-label">Court Name (if surrendered)</span><span className="review-value">{formData.courtName || '(None / Arrested by Police)'}</span></div>
        </div>
      </div>

      {/* Acts & Status */}
      <div className="review-section">
        <div className="review-section-header">
          <span>Section 4 &amp; 5 — Acts &amp; Status (अधिनियम व स्थिती)</span>
          <button
            type="button"
            className="btn btn-header-secondary"
            style={{ color: '#0f172a', borderColor: '#cbd5e1' }}
            onClick={() => onGoToStep(3)}
          >
            Edit
          </button>
        </div>
        <div className="review-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="review-item"><span className="review-label">Acts and Sections</span><span className="review-value">{formData.actsSections || '-'}</span></div>
          <div className="review-item">
            <span className="review-label">Selected Arrest / Surrender Status</span>
            <span className="review-value">
              <strong>
                {formData.arrestStatus !== null && formData.arrestStatus !== undefined && formData.arrestStatus >= 0
                  ? STATUS_LABELS[formData.arrestStatus]
                  : <span style={{ color: 'var(--danger-700)' }}>Not Selected</span>}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Particulars of Accused */}
      <div className="review-section">
        <div className="review-section-header">
          <span>Section 6 — Particulars of the Accused (आरोपीचा तपशिल)</span>
          <button
            type="button"
            className="btn btn-header-secondary"
            style={{ color: '#0f172a', borderColor: '#cbd5e1' }}
            onClick={() => onGoToStep(4)}
          >
            Edit
          </button>
        </div>
        <div className="review-grid">
          <div className="review-item"><span className="review-label">Accused Name</span><span className="review-value"><strong>{formData.accusedName || '-'}</strong></span></div>
          <div className="review-item"><span className="review-label">Father's / Guardian's Name</span><span className="review-value">{formData.fatherName || '-'}</span></div>
          <div className="review-item"><span className="review-label">Aliases</span><span className="review-value">{[formData.firstAlias, formData.secondAlias].filter(Boolean).join(', ') || 'Nil'}</span></div>
          <div className="review-item"><span className="review-label">Nationality &amp; Voter ID</span><span className="review-value">{formData.nationality || '-'} | {formData.voterId || 'Nil'}</span></div>
          <div className="review-item"><span className="review-label">Religion &amp; Caste</span><span className="review-value">{formData.religion || '-'} | {formData.caste || '-'} ({formData.category || '-'})</span></div>
          <div className="review-item"><span className="review-label">Occupation</span><span className="review-value">{formData.occupation || '-'}</span></div>
          <div className="review-item" style={{ gridColumn: 'span 2' }}>
            <span className="review-label">Permanent Address</span>
            <span className="review-value">{formData.permanentAddress || '-'} [{[formData.permPS, formData.permDist, formData.permState].filter(Boolean).join(', ')}]</span>
          </div>
          <div className="review-item" style={{ gridColumn: 'span 2' }}>
            <span className="review-label">Present Address</span>
            <span className="review-value">{formData.presentAddress || '(Same as permanent)'}</span>
          </div>
        </div>
      </div>

      {/* Physical Features Summary */}
      <div className="review-section">
        <div className="review-section-header">
          <span>Section 7 &amp; 9 — Physical Features &amp; Injuries (शारीरिक वैशिष्ट्ये)</span>
          <button
            type="button"
            className="btn btn-header-secondary"
            style={{ color: '#0f172a', borderColor: '#cbd5e1' }}
            onClick={() => onGoToStep(5)}
          >
            Edit
          </button>
        </div>
        <div className="review-grid">
          <div className="review-item"><span className="review-label">Sex &amp; DOB</span><span className="review-value">{pf.sex || '-'}, {pf.dob || '-'}</span></div>
          <div className="review-item"><span className="review-label">Height &amp; Build</span><span className="review-value">{pf.height || '-'}, {pf.build || '-'}</span></div>
          <div className="review-item"><span className="review-label">Complexion</span><span className="review-value">{pf.complexion || '-'}</span></div>
          <div className="review-item"><span className="review-label">Identification Mark</span><span className="review-value">{pf.idMark || '-'}</span></div>
          <div className="review-item" style={{ gridColumn: 'span 2' }}>
            <span className="review-label">Injuries Details</span>
            <span className="review-value">{formData.injuriesDetails || 'Nil'}</span>
          </div>
        </div>
      </div>

      {/* Search Articles & Intimation */}
      <div className="review-section">
        <div className="review-section-header">
          <span>Section 8, 9 &amp; 10 — Articles Found &amp; Intimation (अंगझडती व खबर)</span>
          <button
            type="button"
            className="btn btn-header-secondary"
            style={{ color: '#0f172a', borderColor: '#cbd5e1' }}
            onClick={() => onGoToStep(6)}
          >
            Edit
          </button>
        </div>
        <div className="review-grid">
          <div className="review-item" style={{ gridColumn: 'span 2' }}>
            <span className="review-label">Articles Found on Person</span>
            <span className="review-value">{formData.articlesNil ? 'NIL (नाही)' : (formData.articles || []).filter(Boolean).join('; ') || 'Nil'}</span>
          </div>
          <div className="review-item"><span className="review-label">Intimation Given To</span><span className="review-value">{formData.intimationName || '-'} ({formData.intimationRelation || '-'})</span></div>
          <div className="review-item"><span className="review-label">Intimation Address</span><span className="review-value">{formData.intimationAddress || '-'}</span></div>
        </div>
      </div>

      {/* Socio-Economic & Police Records */}
      <div className="review-section">
        <div className="review-section-header">
          <span>Section 11 &amp; 12 — Socio-Economic &amp; Risk Observation (पोलीस नोंद)</span>
          <button
            type="button"
            className="btn btn-header-secondary"
            style={{ color: '#0f172a', borderColor: '#cbd5e1' }}
            onClick={() => onGoToStep(7)}
          >
            Edit
          </button>
        </div>
        <div className="review-grid">
          <div className="review-item"><span className="review-label">Fingerprint Taken?</span><span className="review-value">{formData.fingerprintTaken === 'yes' ? 'Yes (होय)' : 'No (नाही)'} {formData.fingerprintDetail ? `(${formData.fingerprintDetail})` : ''}</span></div>
          <div className="review-item"><span className="review-label">Living Status &amp; Education</span><span className="review-value">{formData.livingStatus || '-'}, {formData.education || '-'}</span></div>
          <div className="review-item"><span className="review-label">Income Group</span><span className="review-value">{formData.incomeGroup !== null && formData.incomeGroup !== undefined && formData.incomeGroup >= 0 ? INCOME_LABELS[formData.incomeGroup] : '-'}</span></div>
          <div className="review-item"><span className="review-label">Dangerous / Armed / Records?</span><span className="review-value">Dangerous: {(formData.isDangerous || 'no').toUpperCase()} | Armed: {(formData.isArmed || 'no').toUpperCase()} | Past: {(formData.pastRecords || 'no').toUpperCase()}</span></div>
        </div>
      </div>

      {/* Witnesses, Officer & Photo */}
      <div className="review-section">
        <div className="review-section-header">
          <span>Section 13 &amp; 14 — Witnesses, Officer &amp; Photo (पंच व अधिकारी)</span>
          <button
            type="button"
            className="btn btn-header-secondary"
            style={{ color: '#0f172a', borderColor: '#cbd5e1' }}
            onClick={() => onGoToStep(8)}
          >
            Edit
          </button>
        </div>
        <div className="review-grid">
          <div className="review-item">
            <span className="review-label">Witness 1 (Mandatory)</span>
            <span className="review-value"><strong>{formData.witness1Name || '-'}</strong><br /><small>{formData.witness1Address || '-'}</small></span>
          </div>
          <div className="review-item">
            <span className="review-label">Witness 2 (Optional)</span>
            <span className="review-value">{formData.witness2Name || 'None'}<br /><small>{formData.witness2Address || ''}</small></span>
          </div>
          <div className="review-item">
            <span className="review-label">Investigation Officer</span>
            <span className="review-value"><strong>{formData.officerName || '-'}</strong>, {formData.officerRank || '-'} ({formData.officerNo || '-'})</span>
          </div>
          <div className="review-item"><span className="review-label">Place &amp; Date</span><span className="review-value">{formData.place || '-'}, {formData.finalDate || '-'}</span></div>
          <div className="review-item" style={{ gridColumn: 'span 2' }}>
            <span className="review-label">Accused Photo Status</span>
            <span className="review-value">
              {hasPhoto ? (
                <span style={{ color: 'var(--success-700)' }}>&#10003; Attached and Ready for DOCX</span>
              ) : (
                'None (Template dashes preserved)'
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
