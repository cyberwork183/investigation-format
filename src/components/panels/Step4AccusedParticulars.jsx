import React from 'react';

export default function Step4AccusedParticulars({ formData, onChange, errors = {}, onPrev, onNext }) {
  return (
    <div className="section-panel active" id="panelStep4" data-panel="4">
      <div className="panel-header">
        <h2>
          Section 6 — Particulars of the Accused
          <span className="marathi-header">(आरोपीचा तपशिल)</span>
        </h2>
        <p>Personal identification, address, and demographic records.</p>
      </div>

      <div className="form-grid">
        <div className="form-group col-span-2">
          <label className="form-label" htmlFor="accusedName">
            (i) Name of Accused <span className="marathi-label">(नाव)</span> <span className="req">*</span>
          </label>
          <input
            type="text"
            id="accusedName"
            name="accusedName"
            className="form-control"
            placeholder="Full name of accused"
            value={formData.accusedName || ''}
            onChange={(e) => onChange('accusedName', e.target.value)}
            required
          />
          {errors.accusedName && <span className="field-error" id="err_accusedName">{errors.accusedName}</span>}
        </div>

        <div className="form-group col-span-2">
          <label className="form-label" htmlFor="fatherName">
            (ii) Father's / Husband's / Guardian's Name <span className="marathi-label">(पित्याचे/पतीचे/पालकाचे नाव)</span> <span className="req">*</span>
          </label>
          <input
            type="text"
            id="fatherName"
            name="fatherName"
            className="form-control"
            placeholder="Father's or Guardian's name"
            value={formData.fatherName || ''}
            onChange={(e) => onChange('fatherName', e.target.value)}
            required
          />
          {errors.fatherName && <span className="field-error" id="err_fatherName">{errors.fatherName}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="firstAlias">
            (iii) First Alias <span className="marathi-label">(पहिले टोपण नाव)</span>
          </label>
          <input
            type="text"
            id="firstAlias"
            name="firstAlias"
            className="form-control"
            placeholder="First alias / nickname (or Nil)"
            value={formData.firstAlias || ''}
            onChange={(e) => onChange('firstAlias', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="secondAlias">
            (iv) Second Alias <span className="marathi-label">(दुसरे टोपण नाव)</span>
          </label>
          <input
            type="text"
            id="secondAlias"
            name="secondAlias"
            className="form-control"
            placeholder="Second alias (or Nil)"
            value={formData.secondAlias || ''}
            onChange={(e) => onChange('secondAlias', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="nationality">
            (v) Nationality <span className="marathi-label">(राष्ट्रीयत्व)</span>
          </label>
          <input
            type="text"
            id="nationality"
            name="nationality"
            className="form-control"
            value={formData.nationality || ''}
            onChange={(e) => onChange('nationality', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="voterId">
            (vi)(a) Voter ID Card No. <span className="marathi-label">(ओळखपत्र क्रमांक)</span>
          </label>
          <input
            type="text"
            id="voterId"
            name="voterId"
            className="form-control"
            placeholder="e.g., ABC1234567"
            value={formData.voterId || ''}
            onChange={(e) => onChange('voterId', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="passportNo">
            (vi)(b) Passport No. <span className="marathi-label">(पारपत्र क्रमांक)</span>
          </label>
          <input
            type="text"
            id="passportNo"
            name="passportNo"
            className="form-control"
            placeholder="Passport number if available"
            value={formData.passportNo || ''}
            onChange={(e) => onChange('passportNo', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="passportIssueDate">
            (c) Date of Issue <span className="marathi-label">(दिल्याची तारीख)</span>
          </label>
          <input
            type="date"
            id="passportIssueDate"
            name="passportIssueDate"
            className="form-control"
            value={formData.passportIssueDate || ''}
            onChange={(e) => onChange('passportIssueDate', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="passportIssuePlace">
            (d) Place of Issue <span className="marathi-label">(दिल्याची जागा)</span>
          </label>
          <input
            type="text"
            id="passportIssuePlace"
            name="passportIssuePlace"
            className="form-control"
            placeholder="e.g., Mumbai / Nagpur"
            value={formData.passportIssuePlace || ''}
            onChange={(e) => onChange('passportIssuePlace', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="religion">
            (vii) Religion <span className="marathi-label">(धर्म)</span>
          </label>
          <input
            type="text"
            id="religion"
            name="religion"
            className="form-control"
            placeholder="e.g., Hindu / Muslim / Christian / Sikh / Buddhist"
            value={formData.religion || ''}
            onChange={(e) => onChange('religion', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="caste">
            (viii) *Caste / Tribe <span className="marathi-label">(जात / जमात)</span>
          </label>
          <input
            type="text"
            id="caste"
            name="caste"
            className="form-control"
            placeholder="Caste or Tribe name"
            value={formData.caste || ''}
            onChange={(e) => onChange('caste', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="category">
            (ix) SC / ST / OBC <span className="marathi-label">(अनु.जा./अनु.जमात/इ.मा.व.)</span>
          </label>
          <input
            type="text"
            id="category"
            name="category"
            className="form-control"
            placeholder="SC / ST / OBC / Open"
            value={formData.category || ''}
            onChange={(e) => onChange('category', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="occupation">
            (x) *Occupation <span className="marathi-label">(व्यवसाय)</span>
          </label>
          <input
            type="text"
            id="occupation"
            name="occupation"
            className="form-control"
            placeholder="e.g., Business / Labourer / Service / Farmer"
            value={formData.occupation || ''}
            onChange={(e) => onChange('occupation', e.target.value)}
          />
        </div>

        {/* Permanent Address */}
        <div className="form-group col-span-2">
          <label className="form-label" htmlFor="permanentAddress">
            (xi) Permanent Address <span className="marathi-label">(कायमचा पत्ता)</span> <span className="req">*</span>
          </label>
          <textarea
            id="permanentAddress"
            name="permanentAddress"
            className="form-control"
            rows="2"
            placeholder="House No, Street, Village/City, PIN Code"
            value={formData.permanentAddress || ''}
            onChange={(e) => onChange('permanentAddress', e.target.value)}
            required
          />
          {errors.permanentAddress && <span className="field-error" id="err_permanentAddress">{errors.permanentAddress}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="permState">
            Permanent State <span className="marathi-label">(कायमचे राज्य)</span>
          </label>
          <input
            type="text"
            id="permState"
            name="permState"
            className="form-control"
            placeholder="e.g., Maharashtra"
            value={formData.permState || ''}
            onChange={(e) => onChange('permState', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="permDist">
            Permanent District <span className="marathi-label">(कायमचा जिल्हा)</span>
          </label>
          <input
            type="text"
            id="permDist"
            name="permDist"
            className="form-control"
            placeholder="e.g., Nagpur"
            value={formData.permDist || ''}
            onChange={(e) => onChange('permDist', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="permPS">
            Permanent Police Station <span className="marathi-label">(कायमचे पोलीस ठाणे)</span>
          </label>
          <input
            type="text"
            id="permPS"
            name="permPS"
            className="form-control"
            placeholder="e.g., Sadar"
            value={formData.permPS || ''}
            onChange={(e) => onChange('permPS', e.target.value)}
          />
        </div>

        {/* Present Address */}
        <div className="form-group col-span-2">
          <label className="form-label" htmlFor="presentAddress">
            (xi) Present Address <span className="marathi-label">(सध्याचा पत्ता)</span>
          </label>
          <textarea
            id="presentAddress"
            name="presentAddress"
            className="form-control"
            rows="2"
            placeholder="Current residential address if different from permanent"
            value={formData.presentAddress || ''}
            onChange={(e) => onChange('presentAddress', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="presState">
            Present State <span className="marathi-label">(सध्याचे राज्य)</span>
          </label>
          <input
            type="text"
            id="presState"
            name="presState"
            className="form-control"
            placeholder="e.g., Maharashtra"
            value={formData.presState || ''}
            onChange={(e) => onChange('presState', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="presDist">
            Present District <span className="marathi-label">(सध्याचा जिल्हा)</span>
          </label>
          <input
            type="text"
            id="presDist"
            name="presDist"
            className="form-control"
            placeholder="e.g., Nagpur"
            value={formData.presDist || ''}
            onChange={(e) => onChange('presDist', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="presPS">
            Present Police Station <span className="marathi-label">(सध्याचे पोलीस ठाणे)</span>
          </label>
          <input
            type="text"
            id="presPS"
            name="presPS"
            className="form-control"
            placeholder="e.g., Dhantoli"
            value={formData.presPS || ''}
            onChange={(e) => onChange('presPS', e.target.value)}
          />
        </div>
      </div>

      <div className="panel-footer">
        <button type="button" className="btn btn-secondary btn-prev" data-prev="3" onClick={onPrev}>
          &larr; Previous
        </button>
        <button type="button" className="btn btn-primary btn-next" data-next="5" onClick={onNext}>
          Next: Physical Features &rarr;
        </button>
      </div>
    </div>
  );
}
