import React, { useState } from 'react';
import StepNavigation from '../StepNavigation';
import SharedCaseFields from '../shared/SharedCaseFields.jsx';
import SharedOfficerFields from '../shared/SharedOfficerFields.jsx';
import { validateNotice352Data } from '../../utils/documentValidation.js';
import { generateNotice352Docx } from '../../utils/docxGenerators/generateNotice352Docx.js';
import { downloadDocumentDocx } from '../../utils/docxGenerators/index.js';

const NOTICE352_STEPS = [
  { num: 1, label: 'Court & Case Registration', marathi: 'न्यायालय व गुन्हा नोंदणी' },
  { num: 2, label: 'Complainant & Crime Brief', marathi: 'फिर्यादी व गुन्ह्याची हकीकत' },
  { num: 3, label: 'Bank & Money Trail', marathi: 'बँक खाते व फसवणूक रक्कम' },
  { num: 4, label: 'Accused, Arrest & Generate', marathi: 'आरोपी, अटक माहिती व डाऊनलोड' }
];

export default function Notice352Form({
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
    if (stepNumber < 1 || stepNumber > NOTICE352_STEPS.length) return;
    setCurrentStep(stepNumber);
    const card = document.querySelector('.form-content-card');
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleGenerate = async () => {
    const val = validateNotice352Data(formData);
    setErrors(val.errors);

    const sErrors = {};
    if (val.errors.letterDate || val.errors.courtName || val.errors.crimeNo) sErrors[1] = ['Missing fields'];
    if (val.errors.accusedName) sErrors[4] = ['Missing fields'];
    setSectionErrors(sErrors);

    if (!val.isValid) {
      showToast('Please fill all required fields / कृपया आवश्यक रकाने भरा', false);
      if (sErrors[1]) handleGoToStep(1);
      else if (sErrors[4]) handleGoToStep(4);
      return;
    }

    setIsGeneratingDocx(true);
    try {
      const blob = await generateNotice352Docx(formData);
      downloadDocumentDocx('notice_35_2', blob, formData);
      showToast('Section 35(2) Notice Checklist DOCX generated and downloaded successfully!');
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
        steps={NOTICE352_STEPS}
        currentStep={currentStep}
        onStepChange={handleGoToStep}
        sectionErrors={sectionErrors}
        title="35(2) Notice Checklist"
        marathiTitle="३५(२) नोटीस चेकलिस्ट"
      />

      <section className="form-content-card">
        <form noValidate onSubmit={(e) => e.preventDefault()}>
          {/* STEP 1: Court & Case */}
          {currentStep === 1 && (
            <div className="section-panel active">
              <div className="panel-header">
                <h2>
                  Section 1 — Court &amp; Case Registration Details
                  <span className="marathi-header">(मा. न्यायालय व गुन्हा नोंदणी)</span>
                </h2>
                <p>Enter the competent jurisdiction court, checklist date, and police station case number.</p>
              </div>

              <div className="form-grid">
                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="courtName">
                    Competent Court Name <span className="marathi-label">(मा. न्यायालय नाव व पद)</span> <span className="req">*</span>
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

                <div className="form-group">
                  <label className="form-label" htmlFor="letterDate">
                    Checklist Date <span className="marathi-label">(चेकलिस्ट दिनांक)</span> <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="letterDate"
                    name="letterDate"
                    className="form-control"
                    value={formData.letterDate || ''}
                    onChange={(e) => handleFieldChange('letterDate', e.target.value)}
                    placeholder="e.g., २९-०७-२०२६"
                    required
                  />
                  {errors.letterDate && <span className="field-error">{errors.letterDate}</span>}
                </div>
              </div>

              <SharedCaseFields
                formData={formData}
                onChange={handleFieldChange}
                errors={errors}
                psFieldName="psName"
                showDate={false}
                sectionNum="1.2"
              />

              <div className="panel-footer">
                <div></div>
                <button type="button" className="btn btn-primary" onClick={() => handleGoToStep(2)}>
                  Next: Complainant &amp; Crime Brief &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Complainant & Crime Brief */}
          {currentStep === 2 && (
            <div className="section-panel active">
              <div className="panel-header">
                <h2>
                  Section 2 — Complainant Particulars &amp; Crime Brief
                  <span className="marathi-header">(फिर्यादी व गुन्ह्याची हकीकत)</span>
                </h2>
                <p>Provide details of the complainant and a concise summary of the cyber crime modus operandi.</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="complainantName">
                    Complainant Name <span className="marathi-label">(फिर्यादीचे नाव)</span>
                  </label>
                  <input
                    type="text"
                    id="complainantName"
                    name="complainantName"
                    className="form-control"
                    value={formData.complainantName || ''}
                    onChange={(e) => handleFieldChange('complainantName', e.target.value)}
                    placeholder="e.g., श्रद्धा नथुजी झोडापे"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="complainantAge">
                    Complainant Age <span className="marathi-label">(वय)</span>
                  </label>
                  <input
                    type="text"
                    id="complainantAge"
                    name="complainantAge"
                    className="form-control"
                    value={formData.complainantAge || ''}
                    onChange={(e) => handleFieldChange('complainantAge', e.target.value)}
                    placeholder="e.g., ५० वर्षे"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="complainantProfession">
                    Profession / Occupation <span className="marathi-label">(व्यवसाय)</span>
                  </label>
                  <input
                    type="text"
                    id="complainantProfession"
                    name="complainantProfession"
                    className="form-control"
                    value={formData.complainantProfession || ''}
                    onChange={(e) => handleFieldChange('complainantProfession', e.target.value)}
                    placeholder="e.g., प्राकृतिक चिकीत्सा"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="totalFraudAmount">
                    Total Fraud Amount <span className="marathi-label">(एकूण फसवणूक रक्कम)</span>
                  </label>
                  <input
                    type="text"
                    id="totalFraudAmount"
                    name="totalFraudAmount"
                    className="form-control"
                    value={formData.totalFraudAmount || ''}
                    onChange={(e) => handleFieldChange('totalFraudAmount', e.target.value)}
                    placeholder="e.g., ₹13,00,100/-"
                  />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="complainantAddress">
                    Complainant Address <span className="marathi-label">(फिर्यादीचा पत्ता)</span>
                  </label>
                  <input
                    type="text"
                    id="complainantAddress"
                    name="complainantAddress"
                    className="form-control"
                    value={formData.complainantAddress || ''}
                    onChange={(e) => handleFieldChange('complainantAddress', e.target.value)}
                    placeholder="e.g., ९३, बेसा, रेणुका कॉलेजजवळ, नागपूर ४४००३४"
                  />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="caseBrief">
                    Crime Modus Operandi &amp; Case Brief <span className="marathi-label">(गुन्ह्याची थोडक्यात हकीकत)</span>
                  </label>
                  <textarea
                    rows={4}
                    id="caseBrief"
                    name="caseBrief"
                    className="form-control"
                    value={formData.caseBrief || ''}
                    onChange={(e) => handleFieldChange('caseBrief', e.target.value)}
                    placeholder="Enter brief of cyber fraud / digital arrest incident..."
                  />
                </div>
              </div>

              <div className="panel-footer">
                <button type="button" className="btn btn-secondary" onClick={() => handleGoToStep(1)}>
                  &larr; Previous: Court &amp; Case
                </button>
                <button type="button" className="btn btn-primary" onClick={() => handleGoToStep(3)}>
                  Next: Bank &amp; Money Trail &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Bank Account & Money Trail */}
          {currentStep === 3 && (
            <div className="section-panel active">
              <div className="panel-header">
                <h2>
                  Section 3 — Fraudulent Beneficiary Bank &amp; Company
                  <span className="marathi-header">(बँक खाते व फसवणूक रक्कम)</span>
                </h2>
                <p>Enter beneficiary bank account details, transaction ID/UTR, and company directors info.</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="bankName">
                    Beneficiary Bank Name <span className="marathi-label">(बँकेचे नाव)</span>
                  </label>
                  <input
                    type="text"
                    id="bankName"
                    name="bankName"
                    className="form-control"
                    value={formData.bankName || ''}
                    onChange={(e) => handleFieldChange('bankName', e.target.value)}
                    placeholder="e.g., IndusInd Bank"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="accountNo">
                    Account Number <span className="marathi-label">(खाते क्रमांक)</span>
                  </label>
                  <input
                    type="text"
                    id="accountNo"
                    name="accountNo"
                    className="form-control"
                    value={formData.accountNo || ''}
                    onChange={(e) => handleFieldChange('accountNo', e.target.value)}
                    placeholder="e.g., 259109855949"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="branchName">
                    Branch Name <span className="marathi-label">(शाखा)</span>
                  </label>
                  <input
                    type="text"
                    id="branchName"
                    name="branchName"
                    className="form-control"
                    value={formData.branchName || ''}
                    onChange={(e) => handleFieldChange('branchName', e.target.value)}
                    placeholder="e.g., Indore"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="txnId">
                    Transaction ID / UTR <span className="marathi-label">(व्यवहार UTR / Txn ID)</span>
                  </label>
                  <input
                    type="text"
                    id="txnId"
                    name="txnId"
                    className="form-control"
                    value={formData.txnId || ''}
                    onChange={(e) => handleFieldChange('txnId', e.target.value)}
                    placeholder="e.g., CNRBR52026032380902224"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="txnAmount">
                    Transferred Amount <span className="marathi-label">(हस्तांतरित रक्कम)</span>
                  </label>
                  <input
                    type="text"
                    id="txnAmount"
                    name="txnAmount"
                    className="form-control"
                    value={formData.txnAmount || ''}
                    onChange={(e) => handleFieldChange('txnAmount', e.target.value)}
                    placeholder="e.g., 13,00,000/-"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="accountName">
                    Account Holder / Entity Name <span className="marathi-label">(खातेदाराचे नाव)</span>
                  </label>
                  <input
                    type="text"
                    id="accountName"
                    name="accountName"
                    className="form-control"
                    value={formData.accountName || ''}
                    onChange={(e) => handleFieldChange('accountName', e.target.value)}
                    placeholder="e.g., Annkutgrains Private Limited"
                  />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="accountAddress">
                    Bank Account Registered Address <span className="marathi-label">(बँक खात्याचा पत्ता)</span>
                  </label>
                  <input
                    type="text"
                    id="accountAddress"
                    name="accountAddress"
                    className="form-control"
                    value={formData.accountAddress || ''}
                    onChange={(e) => handleFieldChange('accountAddress', e.target.value)}
                    placeholder="e.g., Shop no. 105 to 108, 24/2 Modi tower, M.G Road, Indore..."
                  />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="directorsDetails">
                    Company Directors / Partners Details <span className="marathi-label">(कंपनीचे संचालक / भागीदार तपशील)</span>
                  </label>
                  <textarea
                    rows={3}
                    id="directorsDetails"
                    name="directorsDetails"
                    className="form-control"
                    value={formData.directorsDetails || ''}
                    onChange={(e) => handleFieldChange('directorsDetails', e.target.value)}
                    placeholder="१) संदीप भानुदास मोरे, वय ४२ वर्षे...\n२) अजय पि. पुरुषोत्तम सिंह तोमर..."
                  />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="productionWarrantDetails">
                    Production Warrant &amp; Prior Jail Background <span className="marathi-label">(प्रोडक्शन वॉरंट व कारागृह पार्श्वभूमी)</span>
                  </label>
                  <textarea
                    rows={3}
                    id="productionWarrantDetails"
                    name="productionWarrantDetails"
                    className="form-control"
                    value={formData.productionWarrantDetails || ''}
                    onChange={(e) => handleFieldChange('productionWarrantDetails', e.target.value)}
                    placeholder="e.g., सदर आरोपींना सायबर क्राइम पोलीस ठाणे गौतम बुद्ध नगर FIR 34/2026 मध्ये अटक केली होती..."
                  />
                </div>
              </div>

              <div className="panel-footer">
                <button type="button" className="btn btn-secondary" onClick={() => handleGoToStep(2)}>
                  &larr; Previous: Complainant Details
                </button>
                <button type="button" className="btn btn-primary" onClick={() => handleGoToStep(4)}>
                  Next: Accused, Arrest &amp; Download &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Accused, Arrest & Signatures */}
          {currentStep === 4 && (
            <div className="section-panel active">
              <div className="panel-header">
                <h2>
                  Section 4 — Accused Particulars, Arrest &amp; Signatures
                  <span className="marathi-header">(आरोपी, अटक माहिती, अधिकारी व डाऊनलोड)</span>
                </h2>
                <p>Provide accused details, arrest date/time, relative intimation, and signatory officer.</p>
              </div>

              <div className="form-grid">
                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="accusedName">
                    Accused Full Name <span className="marathi-label">(आरोपीचे पूर्ण नाव)</span> <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="accusedName"
                    name="accusedName"
                    className="form-control"
                    value={formData.accusedName || ''}
                    onChange={(e) => handleFieldChange('accusedName', e.target.value)}
                    placeholder="e.g., संदीप भानुदास मोरे"
                    required
                  />
                  {errors.accusedName && <span className="field-error">{errors.accusedName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="accusedAge">
                    Accused Age <span className="marathi-label">(आरोपीचे वय)</span>
                  </label>
                  <input
                    type="text"
                    id="accusedAge"
                    name="accusedAge"
                    className="form-control"
                    value={formData.accusedAge || ''}
                    onChange={(e) => handleFieldChange('accusedAge', e.target.value)}
                    placeholder="e.g., ४२ वर्षे"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="producedFromJail">
                    Produced From Jail / Escort <span className="marathi-label">(हजर केलेले कारागृह)</span>
                  </label>
                  <input
                    type="text"
                    id="producedFromJail"
                    name="producedFromJail"
                    className="form-control"
                    value={formData.producedFromJail || ''}
                    onChange={(e) => handleFieldChange('producedFromJail', e.target.value)}
                    placeholder="e.g., तिहार कारागृह, दिल्ली"
                  />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="accusedAddress">
                    Accused Full Address <span className="marathi-label">(आरोपीचा पूर्ण पत्ता)</span>
                  </label>
                  <input
                    type="text"
                    id="accusedAddress"
                    name="accusedAddress"
                    className="form-control"
                    value={formData.accusedAddress || ''}
                    onChange={(e) => handleFieldChange('accusedAddress', e.target.value)}
                    placeholder="e.g., हाऊस नं. ७५८/९, गल्ली नं. ९, अटल गेट, नेहरु नगर, इंदौर, मध्य प्रदेश"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="arrestDate">
                    Arrest Date <span className="marathi-label">(अटक दिनांक)</span>
                  </label>
                  <input
                    type="text"
                    id="arrestDate"
                    name="arrestDate"
                    className="form-control"
                    value={formData.arrestDate || ''}
                    onChange={(e) => handleFieldChange('arrestDate', e.target.value)}
                    placeholder="e.g., २९-०७-२०२६"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="arrestTime">
                    Arrest Time <span className="marathi-label">(अटक वेळ)</span>
                  </label>
                  <input
                    type="text"
                    id="arrestTime"
                    name="arrestTime"
                    className="form-control"
                    value={formData.arrestTime || ''}
                    onChange={(e) => handleFieldChange('arrestTime', e.target.value)}
                    placeholder="e.g., ११:३० वा."
                  />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="relativeIntimation">
                    Relative Intimated <span className="marathi-label">(अटक माहिती दिलेले नातेवाईक)</span>
                  </label>
                  <input
                    type="text"
                    id="relativeIntimation"
                    name="relativeIntimation"
                    className="form-control"
                    value={formData.relativeIntimation || ''}
                    onChange={(e) => handleFieldChange('relativeIntimation', e.target.value)}
                    placeholder="e.g., पत्नी सौ. सीमा मोरे, मो. ९८२२००००००"
                  />
                </div>
              </div>

              <SharedOfficerFields
                formData={formData}
                onChange={handleFieldChange}
                errors={errors}
                sectionNum="4.2"
              />

              {/* Review Card */}
              <div className="review-card" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-900)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>📋</span>
                  Notice 35(2) Summary / चेकलिस्ट सारांश
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.88rem' }}>
                  <div><strong>Court:</strong> {formData.courtName || '—'}</div>
                  <div><strong>Checklist Date:</strong> {formData.letterDate || '—'}</div>
                  <div><strong>Crime No:</strong> {formData.crimeNo || '—'}</div>
                  <div><strong>Accused:</strong> {formData.accusedName || '—'}</div>
                  <div><strong>Bank Account:</strong> {formData.accountNo ? `${formData.bankName} (${formData.accountNo})` : '—'}</div>
                  <div><strong>Officer:</strong> {formData.ioName || '—'} ({formData.ioRank || 'वरीष्ठ पोलीस निरीक्षक'})</div>
                </div>
              </div>

              <div className="panel-footer" style={{ justifyContent: 'space-between' }}>
                <button type="button" className="btn btn-secondary" onClick={() => handleGoToStep(3)}>
                  &larr; Previous: Bank Details
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
                      <span>Generating DOCX...</span>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        <span>Generate &amp; Download 35(2) Checklist (.docx)</span>
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
