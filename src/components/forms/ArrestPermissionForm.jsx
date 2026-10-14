import React, { useState } from 'react';
import StepNavigation from '../StepNavigation';
import SharedCaseFields from '../shared/SharedCaseFields.jsx';
import SharedOfficerFields from '../shared/SharedOfficerFields.jsx';
import { validateArrestPermissionData } from '../../utils/documentValidation.js';
import { generateArrestPermissionDocx } from '../../utils/docxGenerators/generateArrestPermissionDocx.js';
import { downloadDocumentDocx } from '../../utils/docxGenerators/index.js';
import { AdditionalAccusedList } from '../shared/SharedAccusedFields.jsx';

const PERMISSION_STEPS = [
  { num: 1, label: 'Court & Header Details', marathi: 'न्यायालय व मथळा' },
  { num: 2, label: 'Case Registration Info', marathi: 'गुन्हा नोंदणी तपशील' },
  { num: 3, label: 'Production Warrant & Accused', marathi: 'प्रोडक्शन वॉरंट व आरोपी' },
  { num: 4, label: 'Grounds, Officer & Review', marathi: 'अटक कारणे, अधिकारी व डाऊनलोड' }
];

export default function ArrestPermissionForm({
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
    if (stepNumber < 1 || stepNumber > PERMISSION_STEPS.length) return;
    setCurrentStep(stepNumber);
    const card = document.querySelector('.form-content-card');
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleGenerate = async () => {
    const val = validateArrestPermissionData(formData);
    setErrors(val.errors);

    const sErrors = {};
    if (val.errors.courtName || val.errors.letterDate) sErrors[1] = ['Missing fields'];
    if (val.errors.crimeNo || val.errors.actsSections) sErrors[2] = ['Missing fields'];
    if (val.errors.producedAccusedName) sErrors[3] = ['Missing fields'];
    setSectionErrors(sErrors);

    if (!val.isValid) {
      showToast('Please fill all required fields / कृपया आवश्यक रकाने भरा', false);
      if (sErrors[1]) handleGoToStep(1);
      else if (sErrors[2]) handleGoToStep(2);
      else if (sErrors[3]) handleGoToStep(3);
      return;
    }

    setIsGeneratingDocx(true);
    try {
      const blob = await generateArrestPermissionDocx(formData);
      downloadDocumentDocx('arrest_permission', blob, formData);
      showToast('Permission to Arrest Application DOCX generated and downloaded successfully!');
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
        steps={PERMISSION_STEPS}
        currentStep={currentStep}
        onStepChange={handleGoToStep}
        sectionErrors={sectionErrors}
        title="Arrest Permission"
        marathiTitle="अटकेची परवानगी अर्ज"
      />

      <section className="form-content-card">
        <form noValidate onSubmit={(e) => e.preventDefault()}>
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="section-panel active">
              <div className="panel-header">
                <h2>
                  Section 1 — Court & Header Details
                  <span className="marathi-header">(न्यायालय व मथळा तपशील)</span>
                </h2>
                <p>Enter the jurisdiction court name, date, header station, and applicant reporter.</p>
              </div>

              <div className="form-grid">
                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="policeStationHeader">
                    Police Station Header <span className="marathi-label">(पोलीस ठाणे मथळा)</span> <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="policeStationHeader"
                    name="policeStationHeader"
                    className="form-control"
                    value={formData.policeStationHeader || ''}
                    onChange={(e) => handleFieldChange('policeStationHeader', e.target.value)}
                    placeholder="e.g., पोलीस ठाणे सायबर नागपूर शहर"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="letterDate">
                    Application Date <span className="marathi-label">(अर्जाची तारीख)</span> <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="letterDate"
                    name="letterDate"
                    className="form-control"
                    value={formData.letterDate || ''}
                    onChange={(e) => handleFieldChange('letterDate', e.target.value)}
                    placeholder="e.g., 29-07-2026 or २९-०७-२०२६"
                    required
                  />
                  {errors.letterDate && <span className="field-error">{errors.letterDate}</span>}
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="courtName">
                    Competent Court Name & Jurisdiction <span className="marathi-label">(मा. न्यायालय नाव व पद)</span> <span className="req">*</span>
                  </label>
                  <textarea
                    rows={2}
                    id="courtName"
                    name="courtName"
                    className="form-control"
                    value={formData.courtName || ''}
                    onChange={(e) => handleFieldChange('courtName', e.target.value)}
                    placeholder="e.g., माननीय न्यायदंडाधिकारी, प्रथम वर्ग, न्यायालय क्रमांक 10, नागपूर शहर"
                    required
                  />
                  {errors.courtName && <span className="field-error">{errors.courtName}</span>}
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="reporter">
                    Applicant / Reporter IO <span className="marathi-label">(प्रतिवेदक तपास अधिकारी)</span>
                  </label>
                  <input
                    type="text"
                    id="reporter"
                    name="reporter"
                    className="form-control"
                    value={formData.reporter || ''}
                    onChange={(e) => handleFieldChange('reporter', e.target.value)}
                    placeholder="e.g., सुरेश डांबरे, वरीष्ठ पोलीस निरीक्षक, पोलीस ठाणे सायबर, नागपूर शहर"
                  />
                </div>
              </div>

              <div className="panel-footer">
                <div></div>
                <button type="button" className="btn btn-primary" onClick={() => handleGoToStep(2)}>
                  Next: Case Registration Info &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="section-panel active">
              <div className="panel-header">
                <h2>
                  Section 2 — Case Registration Details
                  <span className="marathi-header">(गुन्हा नोंदणी तपशील)</span>
                </h2>
                <p>Specify the police station, crime number, and statutory sections.</p>
              </div>

              <SharedCaseFields
                formData={formData}
                onChange={handleFieldChange}
                errors={errors}
                psFieldName="policeStationHeader"
                showDate={false}
                sectionNum="2"
              />

              <div className="panel-footer">
                <button type="button" className="btn btn-secondary" onClick={() => handleGoToStep(1)}>
                  &larr; Previous: Court Details
                </button>
                <button type="button" className="btn btn-primary" onClick={() => handleGoToStep(3)}>
                  Next: Production & Accused &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="section-panel active">
              <div className="panel-header">
                <h2>
                  Section 3 — Production Warrant & Accused Particulars
                  <span className="marathi-header">(प्रोडक्शन वॉरंट व आरोपी तपशील)</span>
                </h2>
                <p>Enter the list of identified co-accused, prior jail custody background, and the produced accused.</p>
              </div>

              <div className="form-grid">
                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="accusedListText">
                    All Identified Accused List <span className="marathi-label">(गुन्ह्यातील सर्व निष्पन्न आरोपींची यादी व पत्ते)</span>
                  </label>
                  <textarea
                    rows={3}
                    id="accusedListText"
                    name="accusedListText"
                    className="form-control"
                    value={formData.accusedListText || ''}
                    onChange={(e) => handleFieldChange('accusedListText', e.target.value)}
                    placeholder="e.g., १) संदीप भानुदास मोरे, वय ४२ वर्षे, पत्ता – इंदौर\n२) अजय सिंह तोमर, वय ३२ वर्षे..."
                  />
                  <span className="field-hint">
                    Separate multiple accused with numbers or new lines. (एकापेक्षा जास्त आरोपी असल्यास क्रमांक देऊन लिहा).
                  </span>
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="priorCaseDetails">
                    Prior Case Details & Jail History <span className="marathi-label">(इतर गुन्ह्यातील अटक व प्रोडक्शन वॉरंट इतिहास)</span>
                  </label>
                  <textarea
                    rows={3}
                    id="priorCaseDetails"
                    name="priorCaseDetails"
                    className="form-control"
                    value={formData.priorCaseDetails || ''}
                    onChange={(e) => handleFieldChange('priorCaseDetails', e.target.value)}
                    placeholder="e.g., आरोपींना सायबर क्राइम पोलीस ठाणे गौतम बुद्ध नगर FIR 34/2026 मध्ये अटक केली होती व न्यायालयाच्या प्रोडक्शन वॉरंटनुसार हजर करण्यात आले आहे..."
                  />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="producedAccusedName">
                    Currently Produced Accused Name & Address <span className="marathi-label">(सध्या न्यायालयात हजर केलेला आरोपी)</span> <span className="req">*</span>
                  </label>
                  <textarea
                    rows={2}
                    id="producedAccusedName"
                    name="producedAccusedName"
                    className="form-control"
                    value={formData.producedAccusedName || ''}
                    onChange={(e) => handleFieldChange('producedAccusedName', e.target.value)}
                    placeholder="e.g., संदीप भानुदास मोरे, वय ४२ वर्षे, पत्ता – हाऊस नं. ७५८/९, इंदौर"
                    required
                  />
                  {errors.producedAccusedName && <span className="field-error">{errors.producedAccusedName}</span>}
                </div>

                <AdditionalAccusedList
                  additionalAccused={formData.additionalAccused || []}
                  onChange={(arr) => handleFieldChange('additionalAccused', arr)}
                  showAlias={false}
                  showFather={false}
                />

                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="producingAuthority">
                    Producing Escort / Prison Authority <span className="marathi-label">(हजर करणारी कारागृह संस्था)</span>
                  </label>
                  <input
                    type="text"
                    id="producingAuthority"
                    name="producingAuthority"
                    className="form-control"
                    value={formData.producingAuthority || ''}
                    onChange={(e) => handleFieldChange('producingAuthority', e.target.value)}
                    placeholder="e.g., कारागृह पोलीस, तिहार कारागृह, दिल्ली"
                  />
                </div>
              </div>

              <div className="panel-footer">
                <button type="button" className="btn btn-secondary" onClick={() => handleGoToStep(2)}>
                  &larr; Previous: Case Info
                </button>
                <button type="button" className="btn btn-primary" onClick={() => handleGoToStep(4)}>
                  Next: Grounds & Review &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {currentStep === 4 && (
            <div className="section-panel active">
              <div className="panel-header">
                <h2>
                  Section 4 — Grounds for Arrest & Document Generation
                  <span className="marathi-header">(अटक कारणे, अधिकारी व डाऊनलोड)</span>
                </h2>
                <p>State the specific grounds for custody handover and review signatory officer details.</p>
              </div>

              <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="groundsText">
                    Formal Grounds & Prayer for Arrest Permission <span className="marathi-label">(अटक परवानगी मागणी विनंती मजकूर)</span>
                  </label>
                  <textarea
                    rows={3}
                    id="groundsText"
                    name="groundsText"
                    className="form-control"
                    value={formData.groundsText || ''}
                    onChange={(e) => handleFieldChange('groundsText', e.target.value)}
                    placeholder="e.g., सदर आरोपीस पोलीस ठाणे सायबर, नागपूर शहर अपराध क्रमांक 38/2026 मध्ये अटक करुन त्याचेकडे तपास करणे आवश्यक असल्याने आरोपीचा ताबा आमचेकडे देऊन त्यास नमुद गुन्ह्यात अटक करण्याची परवानगी मिळण्यास विनंती आहे."
                  />
                </div>
              </div>

              <SharedOfficerFields
                formData={formData}
                onChange={handleFieldChange}
                errors={errors}
                sectionNum="4.2"
              />

              {/* Review Summary */}
              <div className="review-card" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-900)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>📋</span>
                  Application Summary / अर्जाचा सारांश
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.88rem' }}>
                  <div><strong>Court:</strong> {formData.courtName || '—'}</div>
                  <div><strong>Date:</strong> {formData.letterDate || '—'}</div>
                  <div><strong>Crime No:</strong> {formData.crimeNo || '—'}</div>
                  <div><strong>Produced Accused:</strong> {formData.producedAccusedName || '—'}</div>
                  <div><strong>Escort:</strong> {formData.producingAuthority || '—'}</div>
                  <div><strong>Officer:</strong> {formData.ioName || '—'} ({formData.ioRank || 'वरीष्ठ पोलीस निरीक्षक'}{formData.ioBuckleNo ? ', ' + formData.ioBuckleNo : ''})</div>
                </div>
              </div>

              <div className="panel-footer" style={{ justifyContent: 'space-between' }}>
                <button type="button" className="btn btn-secondary" onClick={() => handleGoToStep(3)}>
                  &larr; Previous: Accused &amp; Production
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
                        <span>Generate &amp; Download Arrest Permission (.docx)</span>
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
