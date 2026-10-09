import React, { useState } from 'react';
import StepNavigation from '../StepNavigation';
import Step1CaseInfo from '../panels/Step1CaseInfo';
import Step2ArrestCourt from '../panels/Step2ArrestCourt';
import Step3ActsStatus from '../panels/Step3ActsStatus';
import Step4AccusedParticulars from '../panels/Step4AccusedParticulars';
import Step5PhysicalFeatures from '../panels/Step5PhysicalFeatures';
import Step6CustodyArticles from '../panels/Step6CustodyArticles';
import Step7SocioEconomic from '../panels/Step7SocioEconomic';
import Step8WitnessesOfficerReview from '../panels/Step8WitnessesOfficerReview';
import { validateFormData } from '../../utils/validation';
import { processImageFile } from '../../utils/imageHandler';
import { generateOfficialDocx, downloadDocxBlob } from '../../utils/docxGenerator';

export default function Form3Wizard({
  formData,
  setFormData,
  showToast,
  onShareDetails
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [sectionErrors, setSectionErrors] = useState({});
  const [validatedSteps, setValidatedSteps] = useState({});

  const [photoBuffer, setPhotoBuffer] = useState(null);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [photoError, setPhotoError] = useState('');
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

  const handlePhysicalFeatureChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      physicalFeatures: {
        ...prev.physicalFeatures,
        [key]: value
      }
    }));
  };

  const handleArticleChange = (index, value) => {
    setFormData((prev) => {
      const newArticles = [...(prev.articles || ['', '', '', '', '', ''])];
      newArticles[index] = value;
      return { ...prev, articles: newArticles };
    });
  };

  const handleArticlesNilToggle = (checked) => {
    setFormData((prev) => ({
      ...prev,
      articlesNil: checked,
      articles: checked
        ? ['NIL', 'NIL', 'NIL', 'NIL', 'NIL', 'NIL']
        : ['', '', '', '', '', '']
    }));
  };

  const handleGoToStep = (stepNumber) => {
    if (stepNumber < 1 || stepNumber > 8) return;
    setCurrentStep(stepNumber);

    if (stepNumber === 8) {
      const res = validateFormData(formData);
      setErrors(res.errors);
      setSectionErrors(res.sectionErrors);
    }

    const card = document.querySelector('.form-content-card');
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleRefreshReview = () => {
    const res = validateFormData(formData);
    setErrors(res.errors);
    setSectionErrors(res.sectionErrors);
    showToast('Review data refreshed');
  };

  const handlePhotoUpload = async (file) => {
    try {
      setPhotoError('');
      const processed = await processImageFile(file);
      setPhotoBuffer(processed.arrayBuffer);
      setPhotoDataUrl(processed.dataUrl);
      showToast('Photograph uploaded and verified successfully');
    } catch (err) {
      setPhotoError(err.message);
      showToast(err.message, false);
    }
  };

  const handlePhotoRemove = () => {
    setPhotoBuffer(null);
    setPhotoDataUrl(null);
    setPhotoError('');
    showToast('Photograph removed');
  };

  const handleGenerateDocx = async () => {
    const validation = validateFormData(formData);
    setErrors(validation.errors);
    setSectionErrors(validation.sectionErrors);

    if (!validation.isValid) {
      showToast('Please fix required validation fields before generating DOCX', false);
      for (let s = 1; s <= 8; s++) {
        if (validation.sectionErrors[s] && validation.sectionErrors[s].length > 0) {
          handleGoToStep(s);
          break;
        }
      }
      return;
    }

    setIsGeneratingDocx(true);
    try {
      const docxBlob = await generateOfficialDocx(formData, photoBuffer);
      downloadDocxBlob(docxBlob, formData.accusedCode, formData.date);
      showToast('Official Form III DOCX generated and downloaded successfully!');
    } catch (err) {
      console.error('Error generating official Form III DOCX:', err);
      showToast(`Generation failed: ${err.message}`, false);
    } finally {
      setIsGeneratingDocx(false);
    }
  };

  return (
    <div className="main-layout">
      <StepNavigation
        currentStep={currentStep}
        onStepChange={handleGoToStep}
        sectionErrors={sectionErrors}
        validatedSteps={validatedSteps}
      />

      <section className="form-content-card">
        <form id="arrestForm" noValidate onSubmit={(e) => e.preventDefault()}>
          {currentStep === 1 && (
            <Step1CaseInfo
              formData={formData}
              onChange={handleFieldChange}
              errors={errors}
              onNext={() => handleGoToStep(2)}
            />
          )}

          {currentStep === 2 && (
            <Step2ArrestCourt
              formData={formData}
              onChange={handleFieldChange}
              errors={errors}
              onPrev={() => handleGoToStep(1)}
              onNext={() => handleGoToStep(3)}
            />
          )}

          {currentStep === 3 && (
            <Step3ActsStatus
              formData={formData}
              onChange={handleFieldChange}
              errors={errors}
              onPrev={() => handleGoToStep(2)}
              onNext={() => handleGoToStep(4)}
            />
          )}

          {currentStep === 4 && (
            <Step4AccusedParticulars
              formData={formData}
              onChange={handleFieldChange}
              errors={errors}
              onPrev={() => handleGoToStep(3)}
              onNext={() => handleGoToStep(5)}
            />
          )}

          {currentStep === 5 && (
            <Step5PhysicalFeatures
              formData={formData}
              onChange={handleFieldChange}
              onPhysicalFeatureChange={handlePhysicalFeatureChange}
              onPrev={() => handleGoToStep(4)}
              onNext={() => handleGoToStep(6)}
            />
          )}

          {currentStep === 6 && (
            <Step6CustodyArticles
              formData={formData}
              onChange={handleFieldChange}
              onArticleChange={handleArticleChange}
              onArticlesNilToggle={handleArticlesNilToggle}
              onPrev={() => handleGoToStep(5)}
              onNext={() => handleGoToStep(7)}
            />
          )}

          {currentStep === 7 && (
            <Step7SocioEconomic
              formData={formData}
              onChange={handleFieldChange}
              onPrev={() => handleGoToStep(6)}
              onNext={() => handleGoToStep(8)}
            />
          )}

          {currentStep === 8 && (
            <Step8WitnessesOfficerReview
              formData={formData}
              onChange={handleFieldChange}
              errors={errors}
              hasPhoto={!!photoBuffer}
              photoDataUrl={photoDataUrl}
              photoError={photoError}
              onPhotoUpload={handlePhotoUpload}
              onPhotoRemove={handlePhotoRemove}
              isGeneratingDocx={isGeneratingDocx}
              onGenerateDocx={handleGenerateDocx}
              onRefreshReview={handleRefreshReview}
              onGoToStep={handleGoToStep}
              onPrev={() => handleGoToStep(7)}
              onShareDetails={onShareDetails ? () => onShareDetails(formData) : null}
            />
          )}
        </form>
      </section>
    </div>
  );
}
