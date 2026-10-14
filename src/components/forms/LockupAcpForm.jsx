import React, { useState } from 'react';
import StepNavigation from '../StepNavigation';
import SharedCaseFields from '../shared/SharedCaseFields.jsx';
import SharedAccusedFields from '../shared/SharedAccusedFields.jsx';
import SharedOfficerFields from '../shared/SharedOfficerFields.jsx';
import { validateLockupAcpData } from '../../utils/documentValidation.js';
import { generateLockupAcpDocx } from '../../utils/docxGenerators/generateLockupAcpDocx.js';
import { downloadDocumentDocx } from '../../utils/docxGenerators/index.js';

const LOCKUP_ACP_STEPS = [
  { num: 1, label: 'Addressee ACP Office & Station', marathi: 'प्रति सहा. पोलीस आयुक्त व ठाणे' },
  { num: 2, label: 'Case & Accused Particulars', marathi: 'गुन्हा व आरोपी तपशील' },
  { num: 3, label: 'Intimation, Officer & Review', marathi: 'माहिती, अधिकारी व डाऊनलोड' }
];

export default function LockupAcpForm({
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
    if (stepNumber < 1 || stepNumber > LOCKUP_ACP_STEPS.length) return;
    setCurrentStep(stepNumber);
    const card = document.querySelector('.form-content-card');
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleGenerate = async () => {
    const val = validateLockupAcpData(formData);
    setErrors(val.errors);

    const sErrors = {};
    if (val.errors.letterDate || val.errors.addresseeOffice || val.errors.sendingStation) sErrors[1] = ['Missing fields'];
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
      const blob = await generateLockupAcpDocx(formData);
      downloadDocumentDocx('lockup_acp', blob, formData);
      showToast('Lockup Placement Intimation Letter (ACP) DOCX generated and downloaded successfully!');
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
        steps={LOCKUP_ACP_STEPS}
        currentStep={currentStep}
        onStepChange={handleGoToStep}
        sectionErrors={sectionErrors}
        title="ACP Intimation"
        marathiTitle="बंदिगृह माहिती पत्र (ACP)"
      />

      <section className="form-content-card">
        <form noValidate onSubmit={(e) => e.preventDefault()}>
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="section-panel active">
              <div className="panel-header">
                <h2>
                  Section 1 — Addressee ACP Office & Issuing Station
                  <span className="marathi-header">(प्रति सहा. पोलीस आयुक्त व ठाणे)</span>
                </h2>
                <p>Enter the supervisory ACP office address and issuing police station details.</p>
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
                    placeholder="e.g., २८-०३-२०२६ or 28-03-2026"
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
                    value={formData.addresseeRank || 'मा. सहा. पोलीस आयुक्त,'}
                    onChange={(e) => handleFieldChange('addresseeRank', e.target.value)}
                  />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="addresseeOffice">
                    Addressee Office <span className="marathi-label">(प्रति कार्यालय)</span> <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="addresseeOffice"
                    name="addresseeOffice"
                    className="form-control"
                    value={formData.addresseeOffice || ''}
                    onChange={(e) => handleFieldChange('addresseeOffice', e.target.value)}
                    placeholder="e.g., गुन्हे, नागपूर शहर"
                    required
                  />
                  {errors.addresseeOffice && <span className="field-error">{errors.addresseeOffice}</span>}
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
                    placeholder="e.g., पोलीस ठाणे सायबर, नागपूर शहर"
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
                <p>Provide the FIR details and full accused particulars.</p>
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
                  Section 3 — Placement Intimation Note & Officer Review
                  <span className="marathi-header">(माहिती, अधिकारी व डाऊनलोड)</span>
                </h2>
                <p>Review the formal intimation text and generate the official Word (.docx) document.</p>
              </div>

              {/* Reason / Intimation note */}
              <div className="form-section-card" style={{ marginBottom: '1.5rem' }}>
                <div className="panel-header" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-900)' }}>
                    <span style={{ color: 'var(--gov-blue-700)', marginRight: '0.5rem' }}>3.1.</span>
                    Placement Intimation Details
                    <span className="marathi-header" style={{ marginLeft: '0.5rem', color: 'var(--text-light)', fontWeight: 500 }}>
                      (बंदिगृहात ठेवल्याबाबत माहिती)
                    </span>
                  </h3>
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="reasonText">
                    Intimation Text <span className="marathi-label">(माहिती टिप्पणी)</span>
                  </label>
                  <textarea
                    rows={3}
                    id="reasonText"
                    name="reasonText"
                    className="form-control"
                    value={formData.reasonText || ''}
                    onChange={(e) => handleFieldChange('reasonText', e.target.value)}
                    placeholder="e.g., पोलीस ठाणे सायबर नागपूर शहर येथे बंदीगृह (लॉकअप) नसल्याने सुरक्षेच्या कारणास्तव नमुद आरोपीस सदर पोलीस ठाण्यातील बंदिगृहात (लॉकअपमध्ये) ठेवणेबाबत माहिती सादर आहे."
                  />
                </div>
              </div>

              <SharedOfficerFields
                formData={formData}
                onChange={handleFieldChange}
                errors={errors}
                sectionNum="3.2"
              />

              {/* Review Summary */}
              <div className="review-card" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-900)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>📋</span>
                  Intimation Summary / माहिती पत्राचा सारांश
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.88rem' }}>
                  <div><strong>Date:</strong> {formData.letterDate || '—'}</div>
                  <div><strong>To Office:</strong> {formData.addresseeOffice || '—'}</div>
                  <div><strong>From Station:</strong> {formData.sendingStation || '—'}</div>
                  <div><strong>Crime No:</strong> {formData.crimeNo || '—'}</div>
                  <div><strong>Accused:</strong> {formData.accusedName || '—'} {formData.accusedAlias ? `(${formData.accusedAlias})` : ''}</div>
                  <div><strong>Officer:</strong> {formData.ioName || '—'} ({formData.ioRank || 'पोलीस निरीक्षक'}{formData.ioBuckleNo ? ', ' + formData.ioBuckleNo : ''})</div>
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
                        <span>Generate &amp; Download ACP Intimation Letter (.docx)</span>
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
