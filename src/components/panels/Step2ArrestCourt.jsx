import React from 'react';

export default function Step2ArrestCourt({ formData, onChange, errors = {}, onPrev, onNext }) {
  return (
    <div className="section-panel active" id="panelStep2" data-panel="2">
      <div className="panel-header">
        <h2>
          Section 2 &amp; 3 — Date, Time, Place of Arrest &amp; Court
          <span className="marathi-header">(अटकेची वेळ, जागा व न्यायालय)</span>
        </h2>
        <p>Details of when and where the accused was apprehended or surrendered.</p>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="arrestDate">
            Date of Arrest / Surrender <span className="marathi-label">(अटकेची / स्वाधीन होण्याची तारीख)</span> <span className="req">*</span>
          </label>
          <input
            type="date"
            id="arrestDate"
            name="arrestDate"
            className="form-control"
            value={formData.arrestDate || ''}
            onChange={(e) => onChange('arrestDate', e.target.value)}
            required
          />
          {errors.arrestDate && <span className="field-error" id="err_arrestDate">{errors.arrestDate}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="arrestTime">
            Time <span className="marathi-label">(वेळ)</span> <span className="req">*</span>
          </label>
          <input
            type="text"
            id="arrestTime"
            name="arrestTime"
            className="form-control"
            placeholder="e.g., 14:30 hrs"
            value={formData.arrestTime || ''}
            onChange={(e) => onChange('arrestTime', e.target.value)}
            required
          />
          {errors.arrestTime && <span className="field-error" id="err_arrestTime">{errors.arrestTime}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="gdNo">
            Station Diary / G.D. No. <span className="marathi-label">(ठाणे दैनंदीनी क्र.)</span>
          </label>
          <input
            type="text"
            id="gdNo"
            name="gdNo"
            className="form-control"
            placeholder="e.g., 42/2026"
            value={formData.gdNo || ''}
            onChange={(e) => onChange('gdNo', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="arrestPS">
            Place of Arrest: Police Station <span className="marathi-label">(अटकेची जागा : पोलीस ठाणे)</span> <span className="req">*</span>
          </label>
          <input
            type="text"
            id="arrestPS"
            name="arrestPS"
            className="form-control"
            placeholder="e.g., Cyber Police Station"
            value={formData.arrestPS || ''}
            onChange={(e) => onChange('arrestPS', e.target.value)}
            required
          />
          {errors.arrestPS && <span className="field-error" id="err_arrestPS">{errors.arrestPS}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="arrestDist">
            District <span className="marathi-label">(जिल्हा)</span>
          </label>
          <input
            type="text"
            id="arrestDist"
            name="arrestDist"
            className="form-control"
            placeholder="e.g., Nagpur City"
            value={formData.arrestDist || ''}
            onChange={(e) => onChange('arrestDist', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="arrestState">
            State <span className="marathi-label">(राज्य)</span>
          </label>
          <input
            type="text"
            id="arrestState"
            name="arrestState"
            className="form-control"
            placeholder="e.g., Maharashtra"
            value={formData.arrestState || ''}
            onChange={(e) => onChange('arrestState', e.target.value)}
          />
        </div>

        <div className="form-group col-span-2">
          <label className="form-label" htmlFor="courtName">
            3. Name of the Court (If surrendered) <span className="marathi-label">(न्यायालयाचे नाव - स्वाधीन झाल्यास)</span>
          </label>
          <input
            type="text"
            id="courtName"
            name="courtName"
            className="form-control"
            placeholder="Leave blank if arrested by police; enter Court name if surrendered"
            value={formData.courtName || ''}
            onChange={(e) => onChange('courtName', e.target.value)}
          />
          <span className="field-hint">
            If accused surrendered directly before a magistrate/court, specify the court name.
          </span>
        </div>
      </div>

      <div className="panel-footer">
        <button type="button" className="btn btn-secondary btn-prev" data-prev="1" onClick={onPrev}>
          &larr; Previous
        </button>
        <button type="button" className="btn btn-primary btn-next" data-next="3" onClick={onNext}>
          Next: Acts &amp; Status &rarr;
        </button>
      </div>
    </div>
  );
}
