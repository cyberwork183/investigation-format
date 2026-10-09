import React, { useState } from 'react';
import StepNavigation from '../StepNavigation';
import SharedCaseFields from '../shared/SharedCaseFields.jsx';
import SharedAccusedFields from '../shared/SharedAccusedFields.jsx';
import SharedOfficerFields from '../shared/SharedOfficerFields.jsx';
import { validateMedicalData } from '../../utils/documentValidation.js';
import { generateMedicalDocx } from '../../utils/docxGenerators/generateMedicalDocx.js';
import { downloadDocumentDocx } from '../../utils/docxGenerators/index.js';

const MEDICAL_STEPS = [
  { num: 1, label: 'Addressee & Custody Status', marathi: 'प्रति व कोठडी स्थिती' },
  { num: 2, label: 'Case & Accused Details', marathi: 'गुन्हा व आरोपीचा तपशील' },
  { num: 3, label: 'Officer & Review / Download', marathi: 'तपास अधिकारी व डाऊनलोड' }
];

export default function MedicalLetterForm({
  formData,
  setFormData,
  showToast,
  onShareDetails
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [sectionErrors, setSectionErrors] = useState({});
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleGoToStep = (stepNumber) => {
    if (stepNumber < 1 || stepNumber > MEDICAL_STEPS.length) return;
    setCurrentStep(stepNumber);
    const card = document.querySelector('.form-content-card');
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleGenerate = async () => {
    const val = validateMedicalData(formData);
    setErrors(val.errors);

    const sErrors = {};
    if (val.errors.letterDate || val.errors.addresseeHospital) sErrors[1] = ['Required fields missing'];
    if (val.errors.crimeNo || val.errors.actsSections || val.errors.accusedName) sErrors[2] = ['Required fields missing'];
    setSectionErrors(sErrors);

    if (!val.isValid) {
      showToast('Please fill all required fields / कृपया आवश्यक रकाने भरा', false);
      if (sErrors[1]) handleGoToStep(1);
      else if (sErrors[2]) handleGoToStep(2);
      return;
    }

    setIsGeneratingDocx(true);
    try {
      const blob = await generateMedicalDocx(formData);
      downloadDocumentDocx('medical', blob, formData);
      showToast('Medical Examination Letter DOCX generated and downloaded successfully!');
    } catch (err) {
      console.error(err);
      showToast(`Generation failed: ${err.message}`, false);
    } finally {
      setIsGeneratingDocx(false);
    }
  };

  return (
    <div className="main-layout">
      <StepNavigation
        steps={MEDICAL_STEPS}
        currentStep={currentStep}
        onStepChange={handleGoToStep}
        sectionErrors={sectionErrors}
        title="Medical Letter"
        marathiTitle="वैद्यकीय तपासणी पत्र"
      />

      <section className="form-content-card">
        <form noValidate onSubmit={(e) => e.preventDefault()}>
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="section-panel active">
              <div className="panel-header">
                <h2>
                  Section 1 — Addressee & Custody Status
                  <span className="marathi-header">(प्रति व कोठडी स्थिती)</span>
                </h2>
                <p>Enter the hospital addressee, date, and accused custody status for medical examination.</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="letterDate">
                    Letter Date <span className="marathi-label">(पत्राची तारीख)</span> <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="letterDate"
                    name="letterDate"
                    className="form-control"
                    value={formData.letterDate || ''}
                    onChange={(e) => handleFieldChange('letterDate', e.target.value)}
                    placeholder="e.g., ३०-०३-२०२६ or 30-03-2026"
                    required
                  />
                  {errors.letterDate && <span className="field-error">{errors.letterDate}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="addresseeOfficer">
                    Addressee Officer <span className="marathi-label">(प्रति अधिकारी)</span>
                  </label>
                  <input
                    type="text"
                    id="addresseeOfficer"
                    name="addresseeOfficer"
                    className="form-control"
                    value={formData.addresseeOfficer || 'वैद्यकीय अधिकारी,'}
                    onChange={(e) => handleFieldChange('addresseeOfficer', e.target.value)}
                  />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="addresseeHospital">
                    Hospital Name & Address <span className="marathi-label">(रुग्णालय व पत्ता)</span> <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="addresseeHospital"
                    name="addresseeHospital"
                    className="form-control"
                    value={formData.addresseeHospital || ''}
                    onChange={(e) => handleFieldChange('addresseeHospital', e.target.value)}
                    placeholder="e.g., जिल्हा सामान्य रुग्णालय, नागपूर शहर"
                    required
                  />
                  {errors.addresseeHospital && <span className="field-error">{errors.addresseeHospital}</span>}
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="addresseeCity">
                    City / Jurisdiction <span className="marathi-label">(शहर / कार्यक्षेत्र)</span>
                  </label>
                  <input
                    type="text"
                    id="addresseeCity"
                    name="addresseeCity"
                    className="form-control"
                    value={formData.addresseeCity || ''}
                    onChange={(e) => handleFieldChange('addresseeCity', e.target.value)}
                    placeholder="e.g., नागपूर शहर"
                  />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label">
                    Accused Custody Status <span className="marathi-label">(आरोपीची सध्याची स्थिती)</span> <span className="req">*</span>
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.4rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input
                        type="radio"
                        name="accusedStatus"
                        value="in_custody"
                        checked={formData.accusedStatus !== 'to_be_arrested'}
                        onChange={() => handleFieldChange('accusedStatus', 'in_custody')}
                      />
                      <span>
                        <strong>In Police Custody</strong> / अटक करण्यात आलेले असून सध्या पोलीस कोठडीत आहे
                      </span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input
                        type="radio"
                        name="accusedStatus"
                        value="to_be_arrested"
                        checked={formData.accusedStatus === 'to_be_arrested'}
                        onChange={() => handleFieldChange('accusedStatus', 'to_be_arrested')}
                      />
                      <span>
                        <strong>Prior to Arrest / Examination</strong> / आरोपीस अटक करावयाची आहे (पूर्व वैद्यकीय तपासणी)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="panel-footer">
                <div></div>
                <button type="button" className="btn btn-primary" onClick={() => handleGoToStep(2)}>
                  Next: Case & Accused Details &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="section-panel active">
              <div className="panel-header">
                <h2>
                  Section 2 — Case & Accused Details
                  <span className="marathi-header">(गुन्हा व आरोपीचा तपशील)</span>
                </h2>
                <p>Fill in the crime registration numbers and complete accused particulars.</p>
              </div>

              <SharedCaseFields
                formData={formData}
                onChange={handleFieldChange}
                errors={errors}
                showDate={false}
                sectionNum="2.1"
              />

              <SharedAccusedFields
                formData={formData}
                onChange={handleFieldChange}
                errors={errors}
                sectionNum="2.2"
              />

              <div className="panel-footer">
                <button type="button" className="btn btn-secondary" onClick={() => handleGoToStep(1)}>
                  &larr; Previous: Addressee
                </button>
                <button type="button" className="btn btn-primary" onClick={() => handleGoToStep(3)}>
                  Next: Officer & Generate &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="section-panel active">
              <div className="panel-header">
                <h2>
                  Section 3 — Investigating Officer & Document Review
                  <span className="marathi-header">(तपास अधिकारी व पत्र डाऊनलोड)</span>
                </h2>
                <p>Review the medical examination letter parameters and generate the official Word (.docx) document.</p>
              </div>

              <SharedOfficerFields
                formData={formData}
                onChange={handleFieldChange}
                errors={errors}
                sectionNum="3.1"
              />

              {/* Review summary box */}
              <div className="review-card" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-900)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>📋</span>
                  Letter Summary / पत्राचा सारांश
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.88rem' }}>
                  <div><strong>Letter Date:</strong> {formData.letterDate || '—'}</div>
                  <div><strong>Hospital:</strong> {formData.addresseeHospital || '—'}</div>
                  <div><strong>Crime No:</strong> {formData.crimeNo || '—'}</div>
                  <div><strong>Accused:</strong> {formData.accusedName || '—'} {formData.accusedAlias ? `(${formData.accusedAlias})` : ''}</div>
                  <div><strong>Status:</strong> {formData.accusedStatus === 'to_be_arrested' ? 'Prior to Arrest' : 'In Police Custody'}</div>
                  <div><strong>Officer:</strong> {formData.ioName || '—'} ({formData.ioRank || 'पोलीस निरीक्षक'})</div>
                </div>
              </div>

              <div className="panel-footer" style={{ justifyContent: 'space-between' }}>
                <button type="button" className="btn btn-secondary" onClick={() => handleGoToStep(2)}>
                  &larr; Previous: Accused Details
                </button>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {onShareDetails && (
                    <button
                      type="button"
                      className="btn btn-share-details"
                      title="Share currently entered non-empty details with all other documents"
                      onClick={() => onShareDetails(formData)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                      </svg>
                      <span>Share Details</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleGenerate}
                    disabled={isGeneratingDocx}
                  >
                    {isGeneratingDocx ? (
                      <>
                        <span>Generating DOCX...</span>
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        <span>Generate &amp; Download Medical Letter (.docx)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
