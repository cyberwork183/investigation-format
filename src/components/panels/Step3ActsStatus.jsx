import React from 'react';

const ARREST_STATUS_OPTIONS = [
  {
    value: 0,
    en: 'Arrested and forward',
    mr: 'अटक केली व न्यायालयात पाठविले'
  },
  {
    value: 1,
    en: 'Arrested and released on bail or PR bound',
    mr: 'अटक केली व जामीनावर सोडले किंवा वैयक्तीक जात मुचलक्यावर सोडले'
  },
  {
    value: 2,
    en: 'Arrested but released on anticipatory bail',
    mr: 'अटक केली व अटकपुर्व जामीनावर सोडले'
  },
  {
    value: 3,
    en: 'Arrested and remanded to Police Custody',
    mr: 'अटक केले व पोलीस कोठडीत पाठविले'
  },
  {
    value: 4,
    en: 'Surrendered in court and bailed out',
    mr: 'न्यायालयाचे स्वाधिन व जामीनावर'
  },
  {
    value: 5,
    en: 'Surrendered in court and sent to judicial Custody',
    mr: 'न्यायालयाचे स्वाधिन व न्यायालयीन कोठडीत पाठविले'
  },
  {
    value: 6,
    en: 'Surrendered in court and remanded to Police Custody',
    mr: 'न्यायालयाचे स्वाधिन व पोलीस कोठडीत पाठविले'
  }
];

export default function Step3ActsStatus({ formData, onChange, errors = {}, onPrev, onNext }) {
  return (
    <div className="section-panel active" id="panelStep3" data-panel="3">
      <div className="panel-header">
        <h2>
          Section 4 &amp; 5 — Acts, Sections &amp; Arrest Status
          <span className="marathi-header">(अधिनियम, कलमे व स्थिती)</span>
        </h2>
        <p>Applicable penal laws and legal custody status as per Form III.</p>
      </div>

      <div className="form-grid grid-1">
        <div className="form-group">
          <label className="form-label" htmlFor="actsSections">
            4. Acts and Sections (English) <span className="marathi-label">(अधिनियम व कलमे)</span> <span className="req">*</span>
          </label>
          <textarea
            id="actsSections"
            name="actsSections"
            className="form-control"
            rows="3"
            placeholder="e.g., Sec 318(2), 318(4), 319(2) Bharatiya Nyaya Sanhita (BNS) r/w Sec 66(C), 66(D) Information Technology Act, 2000"
            value={formData.actsSections || ''}
            onChange={(e) => onChange('actsSections', e.target.value)}
            required
          />
          {errors.actsSections && <span className="field-error" id="err_actsSections">{errors.actsSections}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="actsSectionsMr">
            Acts and Sections (Marathi representation if required) <span className="marathi-label">(अधिनियम व कलमे - मराठीत)</span>
          </label>
          <input
            type="text"
            id="actsSectionsMr"
            name="actsSectionsMr"
            className="form-control"
            placeholder="e.g., माहिती तंत्रज्ञान कायदा कलम ६६(क), ६६(ड) व बी.एन.एस. कलमे"
            value={formData.actsSectionsMr || ''}
            onChange={(e) => onChange('actsSectionsMr', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            5. Arrest / Surrender Status <span className="marathi-label">(लागु असेल त्या भागावर &radic; अशी खुण करावी)</span> <span className="req">*</span>
          </label>
          <span className="field-hint">
            Select the applicable legal condition. The generated DOCX places an official [ &radic; ] tick mark at the corresponding position.
          </span>
          {errors.arrestStatus && <span className="field-error" id="err_arrestStatus">{errors.arrestStatus}</span>}

          <div className="option-list" id="arrestStatusList">
            {ARREST_STATUS_OPTIONS.map((opt) => {
              const isSelected = formData.arrestStatus === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`option-card ${isSelected ? 'selected' : ''}`}
                  htmlFor={`status_${opt.value}`}
                >
                  <input
                    type="radio"
                    id={`status_${opt.value}`}
                    name="arrestStatus"
                    value={opt.value}
                    checked={isSelected}
                    onChange={() => onChange('arrestStatus', opt.value)}
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

      <div className="panel-footer">
        <button type="button" className="btn btn-secondary btn-prev" data-prev="2" onClick={onPrev}>
          &larr; Previous
        </button>
        <button type="button" className="btn btn-primary btn-next" data-next="4" onClick={onNext}>
          Next: Particulars of Accused &rarr;
        </button>
      </div>
    </div>
  );
}
