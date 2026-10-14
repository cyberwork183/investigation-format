import React, { useState } from 'react';
import StepNavigation from '../StepNavigation';
import { validateRemandData } from '../../utils/documentValidation.js';
import { generateRemandDocx } from '../../utils/docxGenerators/generateRemandDocx.js';
import { downloadDocumentDocx } from '../../utils/docxGenerators/index.js';
import { AdditionalAccusedList } from '../shared/SharedAccusedFields.jsx';

const REMAND_STEPS = [
  { num: 1, label: 'Court & Application Header', marathi: 'न्यायालय व मथळा तपशील' },
  { num: 2, label: '11-Point Summary Table', marathi: '११ कलमी गोषवारा तक्ता' },
  { num: 3, label: 'Facts & Grounds of Arrest', marathi: 'हकीकत व अटकेची कारणे' },
  { num: 4, label: 'Investigation Points', marathi: 'तपास मुद्दे व इतर तपशील' },
  { num: 5, label: 'Review & Download', marathi: 'पुनरावलोकन व डाऊनलोड' }
];

export default function RemandForm({
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

  const handleInvestigationPointChange = (index, value) => {
    setFormData((prev) => {
      const points = [...(prev.remainingInvestigationPoints || [])];
      points[index] = value;
      return { ...prev, remainingInvestigationPoints: points };
    });
  };

  const handleAddInvestigationPoint = () => {
    setFormData((prev) => ({
      ...prev,
      remainingInvestigationPoints: [...(prev.remainingInvestigationPoints || []), '']
    }));
  };

  const handleRemoveInvestigationPoint = (index) => {
    setFormData((prev) => {
      const points = (prev.remainingInvestigationPoints || []).filter((_, i) => i !== index);
      return { ...prev, remainingInvestigationPoints: points };
    });
  };

  const handleGoToStep = (stepNumber) => {
    if (stepNumber < 1 || stepNumber > REMAND_STEPS.length) return;
    setCurrentStep(stepNumber);
    const card = document.querySelector('.form-content-card');
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleGenerate = async () => {
    const val = validateRemandData(formData);
    setErrors(val.errors);

    const sErrors = {};
    if (val.errors.policeStationHeader || val.errors.courtName || val.errors.ioName || val.errors.remandDays) {
      sErrors[1] = ['Missing required header details'];
    }
    if (val.errors.crimeNo || val.errors.actsSections || val.errors.complainantName || val.errors.accusedName) {
      sErrors[2] = ['Missing required 11-point table fields'];
    }
    setSectionErrors(sErrors);

    if (!val.isValid) {
      showToast('Please fill all required fields / कृपया आवश्यक रकाने भरा', false);
      if (sErrors[1]) handleGoToStep(1);
      else if (sErrors[2]) handleGoToStep(2);
      return;
    }

    setIsGeneratingDocx(true);
    try {
      const blob = await generateRemandDocx(formData);
      downloadDocumentDocx('remand', blob, formData);
      showToast('पोलीस कोठडी रिमांड अर्ज DOCX यशस्वीरित्या तयार झाला! / Remand DOCX generated successfully');
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
        currentStep={currentStep}
        onGoToStep={handleGoToStep}
        sectionErrors={sectionErrors}
        steps={REMAND_STEPS}
      />

      <section className="form-content-card">
        <form onSubmit={(e) => e.preventDefault()} noValidate>

          {/* STEP 1: COURT & APPLICATION HEADER */}
          {currentStep === 1 && (
            <div className="section-panel active">
              <div className="panel-header">
                <h2>
                  Section 1 — Court & Application Header{' '}
                  <span className="marathi-header">(न्यायालय, अर्जदार व मथळा)</span>
                </h2>
                <p>Enter the magistrate details, police station header, remand days, and officer in charge.</p>
              </div>

              <div className="form-grid">
                <div className="form-group span-2">
                  <label className="form-label" htmlFor="remand-ps-header">
                    Police Station Header{' '}
                    <span className="marathi-label">(पोलीस ठाणे मथळा)</span>{' '}
                    <span className="req">*</span>
                  </label>
                  <input
                    id="remand-ps-header"
                    type="text"
                    className={`form-control ${errors.policeStationHeader ? 'is-invalid' : ''}`}
                    value={formData.policeStationHeader || ''}
                    onChange={(e) => handleFieldChange('policeStationHeader', e.target.value)}
                    placeholder="उदा. पोलीस ठाणे सायबर नागपूर शहर"
                  />
                  {errors.policeStationHeader && (
                    <span className="field-error">{errors.policeStationHeader}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="remand-letter-date">
                    Application Date{' '}
                    <span className="marathi-label">(अर्जाची तारीख)</span>{' '}
                    <span className="req">*</span>
                  </label>
                  <input
                    id="remand-letter-date"
                    type="text"
                    className="form-control"
                    value={formData.letterDate || ''}
                    onChange={(e) => handleFieldChange('letterDate', e.target.value)}
                    placeholder="उदा. २९-०७-२०२६"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="remand-days">
                    Remand Days Requested{' '}
                    <span className="marathi-label">(मागणी केलेले कोठडीचे दिवस)</span>{' '}
                    <span className="req">*</span>
                  </label>
                  <input
                    id="remand-days"
                    type="number"
                    min="1"
                    max="15"
                    className={`form-control ${errors.remandDays ? 'is-invalid' : ''}`}
                    value={formData.remandDays || '5'}
                    onChange={(e) => handleFieldChange('remandDays', e.target.value)}
                  />
                  {errors.remandDays && (
                    <span className="field-error">{errors.remandDays}</span>
                  )}
                </div>

                <div className="form-group span-2">
                  <label className="form-label" htmlFor="remand-court-name">
                    Court & Magistrate Details{' '}
                    <span className="marathi-label">(न्यायालय व दंडाधिकारी तपशील)</span>{' '}
                    <span className="req">*</span>
                  </label>
                  <textarea
                    id="remand-court-name"
                    rows={2}
                    className={`form-control ${errors.courtName ? 'is-invalid' : ''}`}
                    value={formData.courtName || ''}
                    onChange={(e) => handleFieldChange('courtName', e.target.value)}
                    placeholder="उदा. मा. प्रथम वर्ग न्यायदंडाधिकारी, न्यायालय क्र. १०, नागपूर शहर"
                  />
                  {errors.courtName && (
                    <span className="field-error">{errors.courtName}</span>
                  )}
                </div>

                <div className="form-group span-2">
                  <label className="form-label" htmlFor="remand-through">
                    Through Prosecutor{' '}
                    <span className="marathi-label">(मार्फत सरकारी अभियोक्ता)</span>
                  </label>
                  <input
                    id="remand-through"
                    type="text"
                    className="form-control"
                    value={formData.throughProsecutor || ''}
                    onChange={(e) => handleFieldChange('throughProsecutor', e.target.value)}
                    placeholder="उदा. सहा. सरकारी अभियोक्ता, न्यायालय प्रथमवर्ग क्रमांक 10, नागपुर शहर"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="remand-io-name">
                    Officer Name{' '}
                    <span className="marathi-label">(तपासी अधिकाऱ्याचे नाव)</span>{' '}
                    <span className="req">*</span>
                  </label>
                  <input
                    id="remand-io-name"
                    type="text"
                    className={`form-control ${errors.ioName ? 'is-invalid' : ''}`}
                    value={formData.ioName || ''}
                    onChange={(e) => handleFieldChange('ioName', e.target.value)}
                    placeholder="उदा. तपासी अधिकाऱ्याचे नाव"
                  />
                  {errors.ioName && (
                    <span className="field-error">{errors.ioName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="remand-io-rank">
                    Rank / Designation{' '}
                    <span className="marathi-label">(पदनाम)</span>
                  </label>
                  <input
                    id="remand-io-rank"
                    type="text"
                    className="form-control"
                    value={formData.ioRank || ''}
                    onChange={(e) => handleFieldChange('ioRank', e.target.value)}
                    placeholder="उदा. वरिष्ठ पोलीस निरीक्षक"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="remand-io-buckle">
                    Buckle / Identification Number{' '}
                    <span className="marathi-label">(बक्कल क्रमांक)</span>
                  </label>
                  <input
                    id="remand-io-buckle"
                    type="text"
                    className="form-control"
                    value={formData.ioBuckleNo || formData.ioBeltNo || formData.officerNo || ''}
                    onChange={(e) => handleFieldChange('ioBuckleNo', e.target.value)}
                    placeholder="उदा. ब.क्र. ७८४५ / B-1234"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="remand-io-station">
                    Police Station{' '}
                    <span className="marathi-label">(पोलीस ठाणे)</span>
                  </label>
                  <input
                    id="remand-io-station"
                    type="text"
                    className="form-control"
                    value={formData.ioStation || ''}
                    onChange={(e) => handleFieldChange('ioStation', e.target.value)}
                    placeholder="उदा. पोलीस ठाणे सायबर, नागपूर शहर"
                  />
                </div>
              </div>

              <div className="panel-footer">
                <div></div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleGoToStep(2)}
                >
                  Next: Summary Table &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: 11-POINT SUMMARY TABLE */}
          {currentStep === 2 && (
            <div className="section-panel active">
              <div className="panel-header">
                <h2>
                  Section 2 — 11-Point Summary Table{' '}
                  <span className="marathi-header">(११ कलमी गोषवारा तक्ता तपशील)</span>
                </h2>
                <p>Provide the statutory 11-point summary details required for remand application under CrPC / BNSS.</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="remand-crime-no">
                    (03) Crime Number{' '}
                    <span className="marathi-label">(गुन्हा क्रमांक)</span>{' '}
                    <span className="req">*</span>
                  </label>
                  <input
                    id="remand-crime-no"
                    type="text"
                    className={`form-control ${errors.crimeNo ? 'is-invalid' : ''}`}
                    value={formData.crimeNo || ''}
                    onChange={(e) => handleFieldChange('crimeNo', e.target.value)}
                    placeholder="उदा. 38/2026"
                  />
                  {errors.crimeNo && (
                    <span className="field-error">{errors.crimeNo}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="remand-ps-name">
                    (01) Police Station{' '}
                    <span className="marathi-label">(पोलीस स्टेशन)</span>
                  </label>
                  <input
                    id="remand-ps-name"
                    type="text"
                    className="form-control"
                    value={formData.psName || ''}
                    onChange={(e) => handleFieldChange('psName', e.target.value)}
                    placeholder="उदा. पोलीस स्टेशन सायबर, नागपूर शहर"
                  />
                </div>

                <div className="form-group span-2">
                  <label className="form-label" htmlFor="remand-acts">
                    Applicable Acts & Sections{' '}
                    <span className="marathi-label">(लागू कलमे व कायदे)</span>{' '}
                    <span className="req">*</span>
                  </label>
                  <textarea
                    id="remand-acts"
                    rows={2}
                    className={`form-control ${errors.actsSections ? 'is-invalid' : ''}`}
                    value={formData.actsSections || ''}
                    onChange={(e) => handleFieldChange('actsSections', e.target.value)}
                    placeholder="उदा. भा.न्या.सं. कलम 318(2), 318(4), 319(2), 336(2), 338 सह कलम 66(क), 66(ड) माहिती तंत्रज्ञान कायदा"
                  />
                  {errors.actsSections && (
                    <span className="field-error">{errors.actsSections}</span>
                  )}
                </div>

                <div className="form-group span-2">
                  <label className="form-label" htmlFor="remand-comp-name">
                    (04) Complainant Full Name{' '}
                    <span className="marathi-label">(फिर्यादीचे संपूर्ण नाव)</span>{' '}
                    <span className="req">*</span>
                  </label>
                  <input
                    id="remand-comp-name"
                    type="text"
                    className={`form-control ${errors.complainantName ? 'is-invalid' : ''}`}
                    value={formData.complainantName || ''}
                    onChange={(e) => handleFieldChange('complainantName', e.target.value)}
                    placeholder="उदा. श्रद्धा नथुजी झोडापे"
                  />
                  {errors.complainantName && (
                    <span className="field-error">{errors.complainantName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="remand-comp-age">
                    Complainant Age{' '}
                    <span className="marathi-label">(फिर्यादीचे वय)</span>
                  </label>
                  <input
                    id="remand-comp-age"
                    type="text"
                    className="form-control"
                    value={formData.complainantAge || ''}
                    onChange={(e) => handleFieldChange('complainantAge', e.target.value)}
                    placeholder="उदा. ५० वर्षे"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="remand-comp-prof">
                    Profession / Occupation{' '}
                    <span className="marathi-label">(फिर्यादीचा व्यवसाय)</span>
                  </label>
                  <input
                    id="remand-comp-prof"
                    type="text"
                    className="form-control"
                    value={formData.complainantProfession || ''}
                    onChange={(e) => handleFieldChange('complainantProfession', e.target.value)}
                    placeholder="उदा. प्राकृतिक चिकीत्सा"
                  />
                </div>

                <div className="form-group span-2">
                  <label className="form-label" htmlFor="remand-comp-addr">
                    Complainant Address{' '}
                    <span className="marathi-label">(फिर्यादीचा पत्ता)</span>
                  </label>
                  <input
                    id="remand-comp-addr"
                    type="text"
                    className="form-control"
                    value={formData.complainantAddress || ''}
                    onChange={(e) => handleFieldChange('complainantAddress', e.target.value)}
                    placeholder="उदा. ९३, बेसा, रेणुका कॉलेजजवळ, नागपूर ४४००३४"
                  />
                </div>

                <div className="form-group span-2">
                  <label className="form-label" htmlFor="remand-acc-name">
                    (05) Accused Full Name{' '}
                    <span className="marathi-label">(आरोपीचे संपूर्ण नाव)</span>{' '}
                    <span className="req">*</span>
                  </label>
                  <input
                    id="remand-acc-name"
                    type="text"
                    className={`form-control ${errors.accusedName ? 'is-invalid' : ''}`}
                    value={formData.accusedName || ''}
                    onChange={(e) => handleFieldChange('accusedName', e.target.value)}
                    placeholder="उदा. संदीप भानुदास मोरे"
                  />
                  {errors.accusedName && (
                    <span className="field-error">{errors.accusedName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="remand-acc-age">
                    Accused Age{' '}
                    <span className="marathi-label">(आरोपीचे वय)</span>
                  </label>
                  <input
                    id="remand-acc-age"
                    type="text"
                    className="form-control"
                    value={formData.accusedAge || ''}
                    onChange={(e) => handleFieldChange('accusedAge', e.target.value)}
                    placeholder="उदा. ४२ वर्षे"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="remand-arr-dt">
                    (06) Arrest Date & Time{' '}
                    <span className="marathi-label">(अटक तारीख व वेळ)</span>
                  </label>
                  <input
                    id="remand-arr-dt"
                    type="text"
                    className="form-control"
                    value={formData.arrestDateTime || ''}
                    onChange={(e) => handleFieldChange('arrestDateTime', e.target.value)}
                    placeholder="उदा. दिनांक २९-०७-२०२६ चे १४:०० वा."
                  />
                </div>

                <div className="form-group span-2">
                  <label className="form-label" htmlFor="remand-acc-addr">
                    Accused Address{' '}
                    <span className="marathi-label">(आरोपीचा संपूर्ण पत्ता)</span>
                  </label>
                  <textarea
                    id="remand-acc-addr"
                    rows={2}
                    className="form-control"
                    value={formData.accusedAddress || ''}
                    onChange={(e) => handleFieldChange('accusedAddress', e.target.value)}
                    placeholder="उदा. हाऊस नं. ७५८/९, गल्ली नं. ९, अटल गेट, नेहरु नगर, इंदौर, मध्य प्रदेश"
                  />
                </div>

                <AdditionalAccusedList
                  additionalAccused={formData.additionalAccused || []}
                  onChange={(arr) => handleFieldChange('additionalAccused', arr)}
                  showAlias={false}
                  showFather={false}
                />

                <div className="form-group span-2">
                  <label className="form-label" htmlFor="remand-crime-scene">
                    (07) Crime Scene / Place of Offense{' '}
                    <span className="marathi-label">(घटनास्थळ)</span>
                  </label>
                  <input
                    id="remand-crime-scene"
                    type="text"
                    className="form-control"
                    value={formData.crimeScene || ''}
                    onChange={(e) => handleFieldChange('crimeScene', e.target.value)}
                    placeholder="उदा. फिर्यादीचे राहते घरी, नागपूर"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="remand-inc-dt">
                    (08) Incident Date & Time{' '}
                    <span className="marathi-label">(घटना घडली तारीख व वेळ)</span>
                  </label>
                  <input
                    id="remand-inc-dt"
                    type="text"
                    className="form-control"
                    value={formData.incidentDateTime || ''}
                    onChange={(e) => handleFieldChange('incidentDateTime', e.target.value)}
                    placeholder="उदा. दि. 22/03/2026 चे 10:04 ते दि. 24/03/2026 चे 09:00 वा."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="remand-filing-dt">
                    (09) Filing Date & Time{' '}
                    <span className="marathi-label">(दाखल तारीख व वेळ)</span>
                  </label>
                  <input
                    id="remand-filing-dt"
                    type="text"
                    className="form-control"
                    value={formData.filingDateTime || ''}
                    onChange={(e) => handleFieldChange('filingDateTime', e.target.value)}
                    placeholder="उदा. दि. 27/03/2026"
                  />
                </div>
              </div>

              <div className="panel-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleGoToStep(1)}
                >
                  &larr; Previous
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleGoToStep(3)}
                >
                  Next: Facts, Grounds &amp; Reasons &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: FACTS & GROUNDS OF ARREST */}
          {currentStep === 3 && (
            <div className="section-panel active">
              <div className="panel-header">
                <h2>
                  Section 3 — Brief Facts &amp; Grounds of Arrest{' '}
                  <span className="marathi-header">(गुन्ह्याची हकीकत व अटकेची कारणे)</span>
                </h2>
                <p>Record the factual summary of the case and the grounds of arrest.</p>
              </div>

              <div className="form-grid">
                {/* A. Brief Facts of the Case */}
                <div className="form-group span-2">
                  <label className="form-label" htmlFor="remand-case-brief">
                    Brief Facts of the Case{' '}
                    <span className="marathi-label">(गुन्ह्याची थोडक्यात हकीकत)</span>
                  </label>
                  <textarea
                    id="remand-case-brief"
                    name="caseBrief"
                    rows={4}
                    className="form-control"
                    value={formData.caseBrief || ''}
                    onChange={(e) => handleFieldChange('caseBrief', e.target.value)}
                    placeholder="गुन्ह्याची थोडक्यात हकीकत (तक्रारदार, घटना, फसवणूक पद्धत इत्यादी)..."
                  />
                </div>

                {/* B. Grounds of Arrest */}
                <div className="form-group span-2">
                  <label className="form-label" htmlFor="remand-grounds-arrest">
                    Grounds of Arrest{' '}
                    <span className="marathi-label">(अटकेची कारणे)</span>
                  </label>
                  <textarea
                    id="remand-grounds-arrest"
                    name="groundsOfArrest"
                    rows={5}
                    className="form-control"
                    value={formData.groundsOfArrest || ''}
                    onChange={(e) => handleFieldChange('groundsOfArrest', e.target.value)}
                    placeholder="अटकेची कारणे (तपासादरम्यान निष्पन्न झालेला सहभाग, पुरावे जप्ती इत्यादी)..."
                  />
                </div>
              </div>

              <div className="panel-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleGoToStep(2)}
                >
                  &larr; Previous
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleGoToStep(4)}
                >
                  Next: Investigation Points &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PRIOR CUSTODY & INVESTIGATION POINTS */}
          {currentStep === 4 && (
            <div className="section-panel active">
              <div className="panel-header">
                <h2>
                  Section 4 — Prior Custody &amp; Investigation Points{' '}
                  <span className="marathi-header">(तपास मुद्दे व इतर तपशील)</span>
                </h2>
                <p>Customize prior custody notes, relative intimation, and pending investigation tasks.</p>
              </div>

              <div className="form-grid">
                <div className="form-group span-2">
                  <label className="form-label" htmlFor="remand-prior-prod">
                    Prior Production / Custody Reference (if applicable){' '}
                    <span className="marathi-label">(इतर गुन्ह्यातील अटक / प्रोडक्शन संदर्भ)</span>
                  </label>
                  <textarea
                    id="remand-prior-prod"
                    rows={3}
                    className="form-control"
                    value={formData.priorProductionDetails || ''}
                    onChange={(e) => handleFieldChange('priorProductionDetails', e.target.value)}
                    placeholder="उदा. आरोपीस इतर गुन्ह्यात अटक झाली असून प्रोडक्शन वॉरंटद्वारे हजर केले आहे..."
                  />
                </div>

                <div className="form-group span-2">
                  <label className="form-label" htmlFor="remand-rel-int">
                    Relative Intimation Note{' '}
                    <span className="marathi-label">(नातेवाईकांना अटकेची माहिती दिल्याबाबत नोंद)</span>
                  </label>
                  <input
                    id="remand-rel-int"
                    type="text"
                    className="form-control"
                    value={formData.relativeIntimation || ''}
                    onChange={(e) => handleFieldChange('relativeIntimation', e.target.value)}
                    placeholder="उदा. आरोपीचे नातेवाईक श्री. मंगेश मोरे यांना फोनद्वारे माहिती दिली."
                  />
                </div>

                <div className="form-group span-2">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      Pending Investigation Points{' '}
                      <span className="marathi-label">(तपास करणे बाकी असलेल्या बाबी)</span>
                    </label>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleAddInvestigationPoint}
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                      title="Add a new investigation point / नवीन तपास मुद्दा जोडा"
                    >
                      + Add Point
                    </button>
                  </div>
                  {(formData.remainingInvestigationPoints || []).map((point, idx) => (
                    <div key={idx} className="numbered-item-row" style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
                      <span className="numbered-badge" style={{ minWidth: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-primary-light, #e0e7ff)', color: 'var(--color-primary, #4338ca)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px', marginTop: '6px', flexShrink: 0 }}>
                        {idx + 1}
                      </span>
                      <textarea
                        rows={2}
                        className="form-control"
                        value={point}
                        placeholder={`तपास मुद्दा क्रमांक ${idx + 1}...`}
                        onChange={(e) => handleInvestigationPointChange(idx, e.target.value)}
                        style={{ flex: 1, resize: 'vertical' }}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{
                          marginTop: '4px',
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.8rem',
                          color: 'var(--danger-700, #b91c1c)',
                          borderColor: 'var(--border-strong, #cbd5e1)',
                          whiteSpace: 'nowrap'
                        }}
                        onClick={() => handleRemoveInvestigationPoint(idx)}
                        title={`Remove point ${idx + 1} / मुद्दा ${idx + 1} काढा`}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {(formData.remainingInvestigationPoints || []).length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleAddInvestigationPoint}
                        style={{
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                        title="Add a new investigation point / नवीन तपास मुद्दा जोडा"
                      >
                        + Add Point
                      </button>
                    </div>
                  )}
                  {(formData.remainingInvestigationPoints || []).length === 0 && (
                    <div style={{ padding: '12px', background: 'var(--bg-alt, #f1f5f9)', borderRadius: '6px', textAlign: 'center', color: 'var(--text-muted, #475569)', fontSize: '0.85rem' }}>
                      No investigation points added. Click "+ Add Point" to add a point.
                    </div>
                  )}
                </div>
              </div>

              <div className="panel-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleGoToStep(3)}
                >
                  &larr; Previous
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleGoToStep(5)}
                >
                  Next: Review & Download &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & GENERATE */}
          {currentStep === 5 && (
            <div className="section-panel active">
              <div className="panel-header">
                <h2>
                  Section 5 — Review & Download{' '}
                  <span className="marathi-header">(पुनरावलोकन व डाऊनलोड)</span>
                </h2>
                <p>Review the remand application details before generating the official Word document.</p>
              </div>

              <div className="review-section" style={{ background: 'var(--color-bg-alt, #f8fafc)', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-muted, #64748b)' }}>Court / न्यायालय:</strong>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{formData.courtName || '—'}</span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-muted, #64748b)' }}>Crime No & Acts / गुन्हा क्र. व कलमे:</strong>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{formData.crimeNo || '—'} | {formData.actsSections || '—'}</span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-muted, #64748b)' }}>Complainant / फिर्यादी:</strong>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{formData.complainantName || '—'}</span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-muted, #64748b)' }}>Accused / आरोपी:</strong>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{formData.accusedName || '—'}</span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-muted, #64748b)' }}>Requested Remand / मागणी केलेले दिवस:</strong>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary, #4338ca)' }}>{formData.remandDays || '5'} दिवस पोलीस कोठडी</span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-muted, #64748b)' }}>Investigating Officer / तपासी अधिकारी:</strong>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{formData.ioName || '—'} ({formData.ioRank || ''}{formData.ioBuckleNo ? ', ' + formData.ioBuckleNo : ''})</span>
                  </div>
                </div>
              </div>

              <div className="panel-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleGoToStep(4)}
                >
                  &larr; Previous
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
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ marginRight: '6px' }}></span>
                        Generating DOCX...
                      </>
                    ) : (
                      'Generate Remand DOCX / रिमांड अर्ज तयार करा'
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
