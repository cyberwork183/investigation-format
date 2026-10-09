import React from 'react';

const INCOME_OPTIONS = [
  {
    val: 0,
    en: '(i) Lower Income (Below Rs. 25,000 P.Y.)',
    mr: 'कमी उत्पन्न (द. सा. रु. २५,००० पेक्षा कमी)'
  },
  {
    val: 1,
    en: '(ii) Lower Middle Income (from Rs. 25,001 to 50,000)',
    mr: 'कमी मध्यम उत्पन्न (२५,००१ ते रु. ५०,०००)'
  },
  {
    val: 2,
    en: '(iii) Middle Income (from Rs. 50,001 to 1,00,000)',
    mr: 'मध्यम उत्पन्न (५०,००१ ते रु. १,००,०००)'
  },
  {
    val: 3,
    en: '(iv) Upper Middle Income (from 1,00,000 to 2,00,000)',
    mr: 'उच्चमध्यम उत्पन्न (१,००,००० ते २,००,०००)'
  },
  {
    val: 4,
    en: '(v) Upper Middle Income (from 2,00,000 to 3,00,000)',
    mr: 'उच्च मध्यम उत्पन्न (२,००,००० ते ३,००,०००)'
  },
  {
    val: 5,
    en: '(vi) Upper Income (above 3,00,000)',
    mr: 'उच्च उत्पन्न (३,००,००० पेक्षा जास्त)'
  }
];

const POLICE_QUESTIONS = [
  { key: 'isDangerous', label: '(a) Is dangerous?', mr: '(धोकादायक आहे किंवा कसा?)' },
  { key: 'escapedBail', label: '(b) Previously escaped any bail?', mr: '(पुर्वी जामीनावर असतांना पळून गेला किंवा काय?)' },
  { key: 'isArmed', label: '(c) Is generally armed?', mr: '(नेहमी सशस्ञ असतो किंवा नसतो?)' },
  { key: 'operatesAccomplices', label: '(d) Operates with accomplices?', mr: '(साथीदारासह काम करतो किंवा कसा?)' },
  { key: 'pastRecords', label: '(e) Has past criminal records?', mr: '(गुन्हेगारी पाश्र्वभुमी आहे किंवा नाही?)' },
  { key: 'isRecidivist', label: '(f) Is recidivist?', mr: '(वारंवार अपराध करतो किंवा काय?)' },
  { key: 'likelyEscapeBail', label: '(g) Is likely to escape bail?', mr: '(जामीनावर असताना पळून जाण्याचा संभव आहे किंवा नाही?)' },
  { key: 'likelyCommitCrime', label: '(h) If released on bail, likely to commit crime or threaten witnesses?', mr: '(बळींना/साक्षीदारांना धाकदपटशा दाखवण्याचा संभव?)' },
  { key: 'wantedOtherCase', label: '(i) Is wanted in any other case?', mr: '(दुसऱ्‍या कोणत्याही प्रकरणात पाहिजे किंवा काय?)' }
];

export default function Step7SocioEconomic({ formData, onChange, onPrev, onNext }) {
  return (
    <div className="section-panel active" id="panelStep7" data-panel="7">
      <div className="panel-header">
        <h2>
          Section 10, 11 &amp; 12 — Socio-Economic &amp; Police Observation
          <span className="marathi-header">(सामाजिक-आर्थिक स्थिती व पोलीस नोंद)</span>
        </h2>
        <p>Fingerprints, background status, and mandatory risk assessments.</p>
      </div>

      <div className="form-grid">
        {/* Fingerprint */}
        <div className="form-group">
          <label className="form-label">
            10. Whether finger-print taken or not? <span className="marathi-label">(बोटांचे ठसे घेतले आहेत किंवा नाही?)</span>
          </label>
          <div className="yes-no-group" style={{ marginTop: '0.35rem' }}>
            <label>
              <input
                type="radio"
                name="fingerprintTaken"
                value="yes"
                checked={formData.fingerprintTaken === 'yes'}
                onChange={() => onChange('fingerprintTaken', 'yes')}
              />{' '}
              Yes (होय)
            </label>
            <label>
              <input
                type="radio"
                name="fingerprintTaken"
                value="no"
                checked={formData.fingerprintTaken === 'no'}
                onChange={() => onChange('fingerprintTaken', 'no')}
              />{' '}
              No (नाही)
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="fingerprintDetail">
            Fingerprint No. or Reason if not taken <span className="marathi-label">(क्रमांक किंवा कारण)</span>
          </label>
          <input
            type="text"
            id="fingerprintDetail"
            name="fingerprintDetail"
            className="form-control"
            placeholder="e.g., FP Slip No. 45/2026 or Reason"
            value={formData.fingerprintDetail || ''}
            onChange={(e) => onChange('fingerprintDetail', e.target.value)}
          />
        </div>

        {/* Socio Economic */}
        <div className="form-group col-span-2">
          <label className="form-label" htmlFor="livingStatus">
            11(a) Living Status <span className="marathi-label">(राहणीमान)</span>
          </label>
          <select
            id="livingStatus"
            name="livingStatus"
            className="form-control"
            value={formData.livingStatus || 'Living with Family'}
            onChange={(e) => onChange('livingStatus', e.target.value)}
          >
            <option value="Living with Family">Living with Family (कुटुंबीयांसोबत)</option>
            <option value="Living alone">Living alone (एकटा)</option>
            <option value="with Associate in Pucca House">With Associate in Pucca House (सहकारी यांच्या पक्क्या घरात)</option>
            <option value="Hotel">Hotel (हॉटेलात)</option>
            <option value="Hostel">Hostel (वसतीगृहात)</option>
            <option value="Kachcha House">Kachcha House (कच्च्या घरात)</option>
            <option value="That ched House">Thatched House (गवती छप्पराच्या झोपडीत)</option>
            <option value="Slim">Slum (गलिच्छ वस्तीत)</option>
            <option value="Homeless">Homeless (बेघर)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="education">
            (b) Educational Qualification <span className="marathi-label">(शैक्षणिक अर्हता)</span>
          </label>
          <input
            type="text"
            id="education"
            name="education"
            className="form-control"
            placeholder="e.g., 10th / 12th / Graduate"
            value={formData.education || ''}
            onChange={(e) => onChange('education', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="socioOccupation">
            (c) Occupation <span className="marathi-label">(व्यवसाय)</span>
          </label>
          <input
            type="text"
            id="socioOccupation"
            name="socioOccupation"
            className="form-control"
            placeholder="e.g., Private Service / Trader"
            value={formData.socioOccupation || ''}
            onChange={(e) => onChange('socioOccupation', e.target.value)}
          />
        </div>

        {/* Income Group */}
        <div className="form-group col-span-2">
          <label className="form-label">
            (d) Income Group <span className="marathi-label">(उत्पन्न गट)</span>
          </label>
          <div className="option-list">
            {INCOME_OPTIONS.map((opt) => {
              const isSelected = formData.incomeGroup === opt.val;
              return (
                <label
                  key={opt.val}
                  className={`option-card ${isSelected ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="incomeGroup"
                    value={opt.val}
                    checked={isSelected}
                    onChange={() => onChange('incomeGroup', opt.val)}
                  />
                  <div className="option-card-label">
                    <span>{opt.en}</span>
                    <span className="marathi-opt">{opt.mr}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 12: Police Observation Yes/No Questions Table */}
      <h3 style={{ fontSize: '1rem', color: 'var(--gov-blue-800)', margin: '1.5rem 0 0.75rem' }}>
        12. Observation and Known Police Records (निरीक्षणावरुन आणि पोलीस अभिलेखानुसार आरोपी)
      </h3>

      <div className="table-responsive">
        <table className="table-custom">
          <thead>
            <tr>
              <th style={{ width: '70%' }}>Official Question / Parameter</th>
              <th style={{ width: '30%', textAlign: 'center' }}>Response (Yes / No)</th>
            </tr>
          </thead>
          <tbody>
            {POLICE_QUESTIONS.map((q) => (
              <tr key={q.key}>
                <td>
                  {q.label} <span className="marathi-label">{q.mr}</span>
                </td>
                <td className="align-center">
                  <div className="yes-no-group">
                    <label>
                      <input
                        type="radio"
                        name={q.key}
                        value="yes"
                        checked={formData[q.key] === 'yes'}
                        onChange={() => onChange(q.key, 'yes')}
                      />{' '}
                      Yes (होय)
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={q.key}
                        value="no"
                        checked={formData[q.key] === 'no'}
                        onChange={() => onChange(q.key, 'no')}
                      />{' '}
                      No (नाही)
                    </label>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="form-group" style={{ marginTop: '1rem' }}>
        <label className="form-label" htmlFor="otherCaseDetail">
          If yes, give case reference &amp; sections <span className="marathi-label">(जर होय असेल तर त्या प्रकरणाचा संदर्भ व कलमे)</span>
        </label>
        <input
          type="text"
          id="otherCaseDetail"
          name="otherCaseDetail"
          className="form-control"
          placeholder="e.g., Cr. No. 12/2024 u/s 379 IPC at Cyber PS"
          value={formData.otherCaseDetail || ''}
          onChange={(e) => onChange('otherCaseDetail', e.target.value)}
        />
      </div>

      <div className="panel-footer">
        <button type="button" className="btn btn-secondary btn-prev" data-prev="6" onClick={onPrev}>
          &larr; Previous
        </button>
        <button type="button" className="btn btn-primary btn-next" data-next="8" onClick={onNext}>
          Next: Witnesses &amp; Officer &rarr;
        </button>
      </div>
    </div>
  );
}
