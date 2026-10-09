import React, { useState } from 'react';
import StepNavigation from '../StepNavigation';
import SharedCaseFields from '../shared/SharedCaseFields.jsx';
import SharedAccusedFields from '../shared/SharedAccusedFields.jsx';
import SharedOfficerFields from '../shared/SharedOfficerFields.jsx';
import { validateLockupPsData } from '../../utils/documentValidation.js';
import { generateLockupPsDocx } from '../../utils/docxGenerators/generateLockupPsDocx.js';
import { downloadDocumentDocx } from '../../utils/docxGenerators/index.js';

const LOCKUP_PS_STEPS = [
  { num: 1, label: 'Addressee & Sending Stations', marathi: 'प्रति व अर्जदार ठाणे' },
  { num: 2, label: 'Case & Accused Particulars', marathi: 'गुन्हा व आरोपी तपशील' },
  { num: 3, label: 'Reason, Officer & Review', marathi: 'कारण, अधिकारी व डाऊनलोड' }
];

export default function LockupPsForm({
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
    if (stepNumber < 1 || stepNumber > LOCKUP_PS_STEPS.length) return;
    setCurrentStep(stepNumber);
    const card = document.querySelector('.form-content-card');
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleGenerate = async () => {
    const val = validateLockupPsData(formData);
    setErrors(val.errors);

    const sErrors = {};
    if (val.errors.letterDate || val.errors.addresseeStation || val.errors.sendingStation) sErrors[1] = ['Missing fields'];
    if (val.errors.crimeNo || val.errors.actsSections || val.errors.accusedName) sErrors[2] = ['Missing fields'];
    setSectionErrors(sErrors);

    if (!val.isValid) {
      showToast('Please fill all required fields / कृपया आवश्यक रकाने भरा', false);
      if (sErrors[1]) handleGoToStep(1);
      else if (sErrors[2]) handleGoToStep(2);
      return;
    }

    setIsGeneratingDocx(true);
    try {
      const blob = await generateLockupPsDocx(formData);
      downloadDocumentDocx('lockup_ps', blob, formData);
      showToast('Lockup Placement Request Letter DOCX generated and downloaded successfully!');
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
        steps={LOCKUP_PS_STEPS}
        currentStep={currentStep}
        onStepChange={handleGoToStep}
        sectionErrors={sectionErrors}
        title="Lockup Requisition"
        marathiTitle="बंदिगृह मागणी पत्र (पो. ठाणे)"
      />

      <section className="form-content-card">
        <form noValidate onSubmit={(e) => e.preventDefault()}>
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="section-panel active">
              <div className="panel-header">
                <h2>
                  Section 1 — Addressee & Sending Station
                  <span className="marathi-header">(प्रति व अर्जदार पोलीस ठाणे)</span>
                </h2>
                <p>Specify the destination lockup station, rank of officer, and issuing police station.</p>
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
                    placeholder="e.g., २९-०३-२०२६ or 29-03-2026"
                    required
                  />
                  {errors.letterDate && <span className="field-error">{errors.letterDate}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="addresseeRank">
                    Addressee Officer Rank <span className="marathi-label">(प्रति पदनाम)</span>
                  </label>
                  <input
                    type="text"
                    id="addresseeRank"
                    name="addresseeRank"
                    className="form-control"
                    value={formData.addresseeRank || 'पोलीस निरीक्षक,'}
                    onChange={(e) => handleFieldChange('addresseeRank', e.target.value)}
                  />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="addresseeStation">
                    Destination Lockup Police Station <span className="marathi-label">(प्रति पोलीस ठाणे)</span> <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="addresseeStation"
                    name="addresseeStation"
                    className="form-control"
                    value={formData.addresseeStation || ''}
                    onChange={(e) => handleFieldChange('addresseeStation', e.target.value)}
                    placeholder="e.g., पोलीस ठाणे सदर,"
                    required
                  />
                  {errors.addresseeStation && <span className="field-error">{errors.addresseeStation}</span>}
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="addresseeCity">
                    City / Jurisdiction <span className="marathi-label">(शहर)</span>
                  </label>
                  <input
                    type="text"
                    id="addresseeCity"
                    name="addresseeCity"
                    className="form-control"
                    value={formData.addresseeCity || 'नागपूर शहर'}
                    onChange={(e) => handleFieldChange('addresseeCity', e.target.value)}
                    placeholder="e.g., नागपूर शहर"
                  />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="sendingStation">
                    Issuing / Sending Police Station <span className="marathi-label">(अर्जदार पोलीस ठाणे)</span> <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="sendingStation"
                    name="sendingStation"
                    className="form-control"
                    value={formData.sendingStation || ''}
                    onChange={(e) => handleFieldChange('sendingStation', e.target.value)}
                    placeholder="e.g., पोलीस ठाणे सायबर नागपूर शहर"
                    required
                  />
                  {errors.sendingStation && <span className="field-error">{errors.sendingStation}</span>}
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
                  Section 2 — Case & Accused Particulars
                  <span className="marathi-header">(गुन्हा व आरोपी तपशील)</span>
                </h2>
                <p>Enter the case registration numbers and accused identification data.</p>
              </div>

              <SharedCaseFields
                formData={formData}
                onChange={handleFieldChange}
                errors={errors}
                psFieldName="sendingStation"
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
                  Next: Reason & Officer &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="section-panel active">
              <div className="panel-header">
                <h2>
                  Section 3 — Lockup Requisition Reason & Officer Review
                  <span className="marathi-header">(कारण, अधिकारी व डाऊनलोड)</span>
                </h2>
                <p>Provide the statutory reason for lockup placement and review officer details.</p>
              </div>

              {/* Lockup Reason */}
              <div className="form-section-card" style={{ marginBottom: '1.5rem' }}>
                <div className="panel-header" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-900)' }}>
                    <span style={{ color: 'var(--gov-blue-700)', marginRight: '0.5rem' }}>3.1.</span>
                    Reason for Lockup Placement
                    <span className="marathi-header" style={{ marginLeft: '0.5rem', color: 'var(--text-light)', fontWeight: 500 }}>
                      (बंदिगृहात ठेवण्याचे कारण)
                    </span>
                  </h3>
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="reasonText">
                    Reason Text <span className="marathi-label">(कारणाचा तपशील)</span>
                  </label>
                  <textarea
                    rows={3}
                    id="reasonText"
                    name="reasonText"
                    className="form-control"
                    value={formData.reasonText || ''}
                    onChange={(e) => handleFieldChange('reasonText', e.target.value)}
                    placeholder="e.g., पोलीस ठाणे सायबर नागपूर शहर येथे बंदीगृह (लॉकअप) नसल्याने सुरक्षेच्या कारणास्तव नमुद आरोपीस आपल्या पोलीस ठाण्यातील बंदिगृहात (लॉकअपमध्ये) ठेवणेबाबत विनंती आहे."
                  />
                </div>
              </div>

              <SharedOfficerFields
                formData={formData}
                onChange={handleFieldChange}
                errors={errors}
                sectionNum="3.2"
              />

              {/* Summary Review */}
              <div className="review-card" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-900)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>📋</span>
                  Requisition Summary / मागणी पत्राचा सारांश
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.88rem' }}>
                  <div><strong>Date:</strong> {formData.letterDate || '—'}</div>
                  <div><strong>To Station:</strong> {formData.addresseeStation || '—'}</div>
                  <div><strong>From Station:</strong> {formData.sendingStation || '—'}</div>
                  <div><strong>Crime No:</strong> {formData.crimeNo || '—'}</div>
                  <div><strong>Accused:</strong> {formData.accusedName || '—'} {formData.accusedAlias ? `(${formData.accusedAlias})` : ''}</div>
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
                        <span>Generate &amp; Download Lockup PS Letter (.docx)</span>
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
