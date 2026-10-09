import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import SecurityBanner from './components/SecurityBanner';
import StepNavigation from './components/StepNavigation';
import ClearModal from './components/ClearModal';
import Toast from './components/Toast';

import Step1CaseInfo from './components/panels/Step1CaseInfo';
import Step2ArrestCourt from './components/panels/Step2ArrestCourt';
import Step3ActsStatus from './components/panels/Step3ActsStatus';
import Step4AccusedParticulars from './components/panels/Step4AccusedParticulars';
import Step5PhysicalFeatures from './components/panels/Step5PhysicalFeatures';
import Step6CustodyArticles from './components/panels/Step6CustodyArticles';
import Step7SocioEconomic from './components/panels/Step7SocioEconomic';
import Step8WitnessesOfficerReview from './components/panels/Step8WitnessesOfficerReview';

import {
  getDefaultFormData,
  getSampleFormData,
  saveDraftToLocalStorage,
  loadDraftFromLocalStorage,
  clearDraftFromLocalStorage,
  exportDraftAsJson
} from './utils/formData';
import { validateFormData } from './utils/validation';
import { processImageFile } from './utils/imageHandler';
import { generateOfficialDocx, downloadDocxBlob } from './utils/docxGenerator';

export default function App() {
  const [formData, setFormData] = useState(() => {
    const saved = loadDraftFromLocalStorage();
    return saved || getDefaultFormData();
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [sectionErrors, setSectionErrors] = useState({});
  const [validatedSteps, setValidatedSteps] = useState({});

  const [photoBuffer, setPhotoBuffer] = useState(null);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [photoError, setPhotoError] = useState('');

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);

  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    isSuccess: true
  });
  const toastTimerRef = useRef(null);

  const showToast = (message, isSuccess = true) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ isVisible: true, message, isSuccess });
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }));
    }, 3200);
  };

  // Show session restored toast if draft was found on initial mount
  useEffect(() => {
    const saved = loadDraftFromLocalStorage();
    if (saved) {
      showToast('Restored draft from previous session');
    }
  }, []);

  // Debounced draft auto-save
  const autoSaveTimerRef = useRef(null);
  useEffect(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      saveDraftToLocalStorage(formData);
    }, 600);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [formData]);

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

  const handleFillSample = () => {
    const sample = getSampleFormData();
    setFormData(sample);
    saveDraftToLocalStorage(sample);
    showToast('Sample test data loaded for demonstration');
    if (currentStep === 8) {
      const res = validateFormData(sample);
      setErrors(res.errors);
      setSectionErrors(res.sectionErrors);
    }
  };

  const handleExportDraft = () => {
    exportDraftAsJson(formData);
    showToast('Draft exported as JSON');
  };

  const handleConfirmClear = () => {
    clearDraftFromLocalStorage();
    const defaults = getDefaultFormData();
    setFormData(defaults);
    setPhotoBuffer(null);
    setPhotoDataUrl(null);
    setPhotoError('');
    setErrors({});
    setSectionErrors({});
    setValidatedSteps({});
    setIsClearModalOpen(false);
    setCurrentStep(1);
    showToast('Form cleared successfully');
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
      showToast('Official DOCX generated and downloaded successfully!');
    } catch (err) {
      console.error('Error generating official DOCX:', err);
      showToast(`Generation failed: ${err.message}`, false);
    } finally {
      setIsGeneratingDocx(false);
    }
  };

  return (
    <div className="app-root">
      <Header
        onFillSample={handleFillSample}
        onExportDraft={handleExportDraft}
        onOpenClearModal={() => setIsClearModalOpen(true)}
      />

      <SecurityBanner />

      <main className="main-layout">
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
              />
            )}
          </form>
        </section>
      </main>

      <ClearModal
        isOpen={isClearModalOpen}
        onCancel={() => setIsClearModalOpen(false)}
        onConfirm={handleConfirmClear}
      />

      <Toast
        message={toast.message}
        isSuccess={toast.isSuccess}
        isVisible={toast.isVisible}
      />
    </div>
  );
}
