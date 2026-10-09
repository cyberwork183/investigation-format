import React from 'react';

export default function Step1CaseInfo({ formData, onChange, errors = {}, onNext }) {
  return (
    <div className="section-panel active" id="panelStep1" data-panel="1">
      <div className="panel-header">
        <h2>
          Section 1 — Case Information
          <span className="marathi-header">(तपासाची माहिती)</span>
        </h2>
        <p>Enter the jurisdiction and registration details corresponding to Form III header.</p>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="state">
            State <span className="marathi-label">(राज्य)</span> <span className="req">*</span>
          </label>
          <input
            type="text"
            id="state"
            name="state"
            className="form-control"
            value={formData.state || ''}
            onChange={(e) => onChange('state', e.target.value)}
            required
          />
          {errors.state && <span className="field-error" id="err_state">{errors.state}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="district">
            District <span className="marathi-label">(जिल्हा)</span> <span className="req">*</span>
          </label>
          <input
            type="text"
            id="district"
            name="district"
            className="form-control"
            placeholder="e.g., Nagpur City"
            value={formData.district || ''}
            onChange={(e) => onChange('district', e.target.value)}
            required
          />
          {errors.district && <span className="field-error" id="err_district">{errors.district}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="policeStation">
            Police Station <span className="marathi-label">(पोलीस ठाणे)</span> <span className="req">*</span>
          </label>
          <input
            type="text"
            id="policeStation"
            name="policeStation"
            className="form-control"
            placeholder="e.g., Cyber Police Station"
            value={formData.policeStation || ''}
            onChange={(e) => onChange('policeStation', e.target.value)}
            required
          />
          {errors.policeStation && <span className="field-error" id="err_policeStation">{errors.policeStation}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="firNo">
            FIR / Proceeding / G.D. No. <span className="marathi-label">(पहिली खबर क्र./कार्यवाही क्र.)</span> <span className="req">*</span>
          </label>
          <input
            type="text"
            id="firNo"
            name="firNo"
            className="form-control"
            placeholder="e.g., 57/2026"
            value={formData.firNo || ''}
            onChange={(e) => onChange('firNo', e.target.value)}
            required
          />
          {errors.firNo && <span className="field-error" id="err_firNo">{errors.firNo}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="year">
            Year <span className="marathi-label">(वर्ष)</span> <span className="req">*</span>
          </label>
          <input
            type="text"
            id="year"
            name="year"
            className="form-control"
            maxLength={4}
            placeholder="e.g., 2026"
            value={formData.year || ''}
            onChange={(e) => onChange('year', e.target.value)}
            required
          />
          {errors.year && <span className="field-error" id="err_year">{errors.year}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="date">
            Date <span className="marathi-label">(तारीख)</span> <span className="req">*</span>
          </label>
          <input
            type="date"
            id="date"
            name="date"
            className="form-control"
            value={formData.date || ''}
            onChange={(e) => onChange('date', e.target.value)}
            required
          />
          {errors.date && <span className="field-error" id="err_date">{errors.date}</span>}
        </div>

        <div className="form-group col-span-2">
          <label className="form-label" htmlFor="accusedCode">
            Alphanumeric Code of the Accused <span className="marathi-label">(आरोपीचा सांकेतीक क्रमांक)</span> <span className="req">*</span>
          </label>
          <input
            type="text"
            id="accusedCode"
            name="accusedCode"
            className="form-control"
            placeholder="A1 to A9 for first 9 persons, B1 for 10th person, etc."
            value={formData.accusedCode || ''}
            onChange={(e) => onChange('accusedCode', e.target.value)}
            required
          />
          <span className="field-hint">
            Official standard: Write A1 to A9 for the first 9 persons, B1 for 10th person and so on. (पहिल्या ९ व्यक्तींसाठी अ१ ते अ९, दहाव्या व्यक्तीसाठी ब१).
          </span>
          {errors.accusedCode && <span className="field-error" id="err_accusedCode">{errors.accusedCode}</span>}
        </div>
      </div>

      <div className="panel-footer">
        <div></div>
        <button type="button" className="btn btn-primary btn-next" data-next="2" onClick={onNext}>
          Next: Arrest Details &rarr;
        </button>
      </div>
    </div>
  );
}
