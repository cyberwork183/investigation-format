import React from 'react';

export default function Step6CustodyArticles({
  formData,
  onChange,
  onArticleChange,
  onArticlesNilToggle,
  onPrev,
  onNext
}) {
  const articles = formData.articles || ['', '', '', '', '', ''];
  const isNil = formData.articlesNil || false;

  return (
    <div className="section-panel active" id="panelStep6" data-panel="6">
      <div className="panel-header">
        <h2>
          Section 8, 9 &amp; 10 — Custody, Articles &amp; Intimation
          <span className="marathi-header">(ताब्यात घेणे, अंगझडती व खबर)</span>
        </h2>
        <p>Arrest confirmation, physical search property seized, and family notification.</p>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="custodyDate">
            8. Custody Date <span className="marathi-label">(ताब्यात घेतल्याची तारीख)</span>
          </label>
          <input
            type="date"
            id="custodyDate"
            name="custodyDate"
            className="form-control"
            value={formData.custodyDate || ''}
            onChange={(e) => onChange('custodyDate', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="custodyTime">
            Custody Time <span className="marathi-label">(वेळ)</span>
          </label>
          <input
            type="text"
            id="custodyTime"
            name="custodyTime"
            className="form-control"
            placeholder="e.g., 14:30 hrs"
            value={formData.custodyTime || ''}
            onChange={(e) => onChange('custodyTime', e.target.value)}
          />
        </div>

        <div className="form-group col-span-2">
          <label className="form-label" htmlFor="custodyPlace">
            Custody Place <span className="marathi-label">(ठिकाण)</span>
          </label>
          <input
            type="text"
            id="custodyPlace"
            name="custodyPlace"
            className="form-control"
            placeholder="e.g., Cyber Police Station, Nagpur"
            value={formData.custodyPlace || ''}
            onChange={(e) => onChange('custodyPlace', e.target.value)}
          />
        </div>
      </div>

      {/* Section 9: Articles Found */}
      <div style={{ margin: '1.5rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-800)' }}>
            Articles Found on Physical Search <span className="marathi-label">(अंगझडतीत सापडलेल्या वस्तू १ ते ६)</span>
          </h3>
          <label style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              id="articlesNil"
              name="articlesNil"
              checked={isNil}
              onChange={(e) => onArticlesNilToggle(e.target.checked)}
            />{' '}
            <strong>NIL (नाही)</strong>
          </label>
        </div>
        <p className="field-hint" style={{ marginBottom: '0.8rem' }}>
          If no articles were found, check "NIL" or enter NIL. Explanatory dignity and identification text is strictly preserved in the DOCX.
        </p>

        <div className="form-grid" id="articlesInputsGrid">
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className="form-group">
              <label className="form-label" htmlFor={`article_${idx + 1}`}>
                Article {idx + 1}
              </label>
              <input
                type="text"
                id={`article_${idx + 1}`}
                className="form-control article-input"
                placeholder={idx === 0 ? 'e.g., Mobile Phone (Samsung)' : idx === 1 ? 'e.g., Cash Rs. 500/-' : idx === 2 ? 'e.g., Wallet with ID card' : idx === 3 ? 'e.g., Wrist watch' : idx === 4 ? 'e.g., Key bunch' : 'e.g., Belt'}
                value={isNil ? 'NIL' : articles[idx] || ''}
                disabled={isNil}
                onChange={(e) => onArticleChange(idx, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Section 10: Intimation */}
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-800)', margin: '1.5rem 0 0.5rem' }}>
        Intimation to Relative / Friend <span className="marathi-label">(यांना खबर देण्यात आली)</span>
      </h3>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="intimationName">
            Name of Relative / Friend <span className="marathi-label">(नाव)</span>
          </label>
          <input
            type="text"
            id="intimationName"
            name="intimationName"
            className="form-control"
            placeholder="Full name of notified person"
            value={formData.intimationName || ''}
            onChange={(e) => onChange('intimationName', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="intimationRelation">
            Relationship <span className="marathi-label">(नाते)</span>
          </label>
          <input
            type="text"
            id="intimationRelation"
            name="intimationRelation"
            className="form-control"
            placeholder="e.g., Brother / Father / Wife"
            value={formData.intimationRelation || ''}
            onChange={(e) => onChange('intimationRelation', e.target.value)}
          />
        </div>

        <div className="form-group col-span-2">
          <label className="form-label" htmlFor="intimationAddress">
            Address of Notified Person <span className="marathi-label">(पत्ता)</span>
          </label>
          <textarea
            id="intimationAddress"
            name="intimationAddress"
            className="form-control"
            rows={2}
            placeholder="Residential address where intimation was sent"
            value={formData.intimationAddress || ''}
            onChange={(e) => onChange('intimationAddress', e.target.value)}
          />
        </div>
      </div>

      <div className="panel-footer">
        <button type="button" className="btn btn-secondary btn-prev" data-prev="5" onClick={onPrev}>
          &larr; Previous
        </button>
        <button type="button" className="btn btn-primary btn-next" data-next="7" onClick={onNext}>
          Next: Socio-Economic &amp; Records &rarr;
        </button>
      </div>
    </div>
  );
}
