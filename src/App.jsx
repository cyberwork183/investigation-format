import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import SecurityBanner from './components/SecurityBanner';
import Dashboard from './components/Dashboard';
import DocumentTopBar from './components/shared/DocumentTopBar';
import ClearModal from './components/ClearModal';
import Toast from './components/Toast';

// Dedicated Forms
import Form3Wizard from './components/forms/Form3Wizard';
import RemandForm from './components/forms/RemandForm';
import MedicalLetterForm from './components/forms/MedicalLetterForm';
import LockupPsForm from './components/forms/LockupPsForm';
import LockupAcpForm from './components/forms/LockupAcpForm';
import CustodyTransferForm from './components/forms/CustodyTransferForm';
import ArrestPermissionForm from './components/forms/ArrestPermissionForm';

import { DOCUMENT_TYPES, getDocumentTypeById } from './utils/documentTypes';
import {
  getDefaultForm3Data,
  getSampleForm3Data,
  saveForm3Draft,
  loadForm3Draft,
  clearForm3Draft,
  getDefaultRemandData,
  getSampleRemandData,
  getDefaultMedicalData,
  getSampleMedicalData,
  getDefaultLockupPsData,
  getSampleLockupPsData,
  getDefaultLockupAcpData,
  getSampleLockupAcpData,
  getDefaultCustodyTransferData,
  getSampleCustodyTransferData,
  getDefaultArrestPermissionData,
  getSampleArrestPermissionData,
  saveDocDraft,
  loadDocDraft,
  clearDocDraft,
  exportDocDraftJson
} from './utils/documentSchemas';

import {
  getStoredSharedDetails,
  saveStoredSharedDetails,
  extractSharedDetailsFromDoc,
  applySharedDetailsToDoc
} from './utils/shareDetails';

export default function App() {
  // activeDocId is null for Dashboard, or 'form3', 'remand', 'medical', etc.
  const [activeDocId, setActiveDocId] = useState(null);

  // Initialize document states from localStorage drafts, populated with shared pool if available
  const [form3Data, setForm3Data] = useState(() => {
    const draft = loadForm3Draft() || getDefaultForm3Data();
    const shared = getStoredSharedDetails();
    return applySharedDetailsToDoc('form3', draft, shared);
  });

  const [remandData, setRemandData] = useState(() => {
    const draft = loadDocDraft('remand') || getDefaultRemandData();
    const shared = getStoredSharedDetails();
    return applySharedDetailsToDoc('remand', draft, shared);
  });

  const [medicalData, setMedicalData] = useState(() => {
    const draft = loadDocDraft('medical') || getDefaultMedicalData();
    const shared = getStoredSharedDetails();
    return applySharedDetailsToDoc('medical', draft, shared);
  });

  const [lockupPsData, setLockupPsData] = useState(() => {
    const draft = loadDocDraft('lockup_ps') || getDefaultLockupPsData();
    const shared = getStoredSharedDetails();
    return applySharedDetailsToDoc('lockup_ps', draft, shared);
  });

  const [lockupAcpData, setLockupAcpData] = useState(() => {
    const draft = loadDocDraft('lockup_acp') || getDefaultLockupAcpData();
    const shared = getStoredSharedDetails();
    return applySharedDetailsToDoc('lockup_acp', draft, shared);
  });

  const [custodyTransferData, setCustodyTransferData] = useState(() => {
    const draft = loadDocDraft('custody_transfer') || getDefaultCustodyTransferData();
    const shared = getStoredSharedDetails();
    return applySharedDetailsToDoc('custody_transfer', draft, shared);
  });

  const [arrestPermissionData, setArrestPermissionData] = useState(() => {
    const draft = loadDocDraft('arrest_permission') || getDefaultArrestPermissionData();
    const shared = getStoredSharedDetails();
    return applySharedDetailsToDoc('arrest_permission', draft, shared);
  });

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

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

  // Auto-save drafts with debounce per document
  const autoSaveTimerRef = useRef(null);
  useEffect(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      if (activeDocId === 'form3') saveForm3Draft(form3Data);
      else if (activeDocId === 'remand') saveDocDraft('remand', remandData);
      else if (activeDocId === 'medical') saveDocDraft('medical', medicalData);
      else if (activeDocId === 'lockup_ps') saveDocDraft('lockup_ps', lockupPsData);
      else if (activeDocId === 'lockup_acp') saveDocDraft('lockup_acp', lockupAcpData);
      else if (activeDocId === 'custody_transfer') saveDocDraft('custody_transfer', custodyTransferData);
      else if (activeDocId === 'arrest_permission') saveDocDraft('arrest_permission', arrestPermissionData);
    }, 500);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [activeDocId, form3Data, remandData, medicalData, lockupPsData, lockupAcpData, custodyTransferData, arrestPermissionData]);

  /**
   * Share Details Action:
   * Collects all currently entered non-empty values from source form,
   * stores them locally, and populates matching empty fields in all other forms.
   * Preserves existing non-empty values in other forms.
   */
  const handleShareDetails = (sourceDocId, currentFormData) => {
    const extracted = extractSharedDetailsFromDoc(sourceDocId, currentFormData);
    const keyCount = Object.keys(extracted).length;

    if (keyCount === 0) {
      showToast('No non-empty details to share yet / शेअर करण्यासाठी कोणतीही माहिती भरलेली नाही', false);
      return;
    }

    const currentStored = getStoredSharedDetails();
    const updatedSharedPool = { ...currentStored, ...extracted };
    saveStoredSharedDetails(updatedSharedPool);

    // Apply to all document forms (only fills empty fields, preserves existing non-empty data)
    setForm3Data((prev) => {
      const updated = sourceDocId === 'form3' ? currentFormData : applySharedDetailsToDoc('form3', prev, updatedSharedPool);
      saveForm3Draft(updated);
      return updated;
    });

    setRemandData((prev) => {
      const updated = sourceDocId === 'remand' ? currentFormData : applySharedDetailsToDoc('remand', prev, updatedSharedPool);
      saveDocDraft('remand', updated);
      return updated;
    });

    setMedicalData((prev) => {
      const updated = sourceDocId === 'medical' ? currentFormData : applySharedDetailsToDoc('medical', prev, updatedSharedPool);
      saveDocDraft('medical', updated);
      return updated;
    });

    setLockupPsData((prev) => {
      const updated = sourceDocId === 'lockup_ps' ? currentFormData : applySharedDetailsToDoc('lockup_ps', prev, updatedSharedPool);
      saveDocDraft('lockup_ps', updated);
      return updated;
    });

    setLockupAcpData((prev) => {
      const updated = sourceDocId === 'lockup_acp' ? currentFormData : applySharedDetailsToDoc('lockup_acp', prev, updatedSharedPool);
      saveDocDraft('lockup_acp', updated);
      return updated;
    });

    setCustodyTransferData((prev) => {
      const updated = sourceDocId === 'custody_transfer' ? currentFormData : applySharedDetailsToDoc('custody_transfer', prev, updatedSharedPool);
      saveDocDraft('custody_transfer', updated);
      return updated;
    });

    setArrestPermissionData((prev) => {
      const updated = sourceDocId === 'arrest_permission' ? currentFormData : applySharedDetailsToDoc('arrest_permission', prev, updatedSharedPool);
      saveDocDraft('arrest_permission', updated);
      return updated;
    });

    showToast(`Details shared! ${keyCount} field(s) available to all other forms. / माहिती इतर फॉर्ममध्ये उपलब्ध केली.`);
  };

  // Fill sample data for active document
  const handleFillSample = () => {
    if (activeDocId === 'form3') {
      const s = getSampleForm3Data();
      setForm3Data(s);
      saveForm3Draft(s);
    } else if (activeDocId === 'remand') {
      const s = getSampleRemandData();
      setRemandData(s);
      saveDocDraft('remand', s);
    } else if (activeDocId === 'medical') {
      const s = getSampleMedicalData();
      setMedicalData(s);
      saveDocDraft('medical', s);
    } else if (activeDocId === 'lockup_ps') {
      const s = getSampleLockupPsData();
      setLockupPsData(s);
      saveDocDraft('lockup_ps', s);
    } else if (activeDocId === 'lockup_acp') {
      const s = getSampleLockupAcpData();
      setLockupAcpData(s);
      saveDocDraft('lockup_acp', s);
    } else if (activeDocId === 'custody_transfer') {
      const s = getSampleCustodyTransferData();
      setCustodyTransferData(s);
      saveDocDraft('custody_transfer', s);
    } else if (activeDocId === 'arrest_permission') {
      const s = getSampleArrestPermissionData();
      setArrestPermissionData(s);
      saveDocDraft('arrest_permission', s);
    }
    showToast('Sample test data loaded successfully');
  };

  // Export draft JSON
  const handleExportDraft = () => {
    let dataToExport = null;
    if (activeDocId === 'form3') dataToExport = form3Data;
    else if (activeDocId === 'remand') dataToExport = remandData;
    else if (activeDocId === 'medical') dataToExport = medicalData;
    else if (activeDocId === 'lockup_ps') dataToExport = lockupPsData;
    else if (activeDocId === 'lockup_acp') dataToExport = lockupAcpData;
    else if (activeDocId === 'custody_transfer') dataToExport = custodyTransferData;
    else if (activeDocId === 'arrest_permission') dataToExport = arrestPermissionData;

    if (dataToExport) {
      exportDocDraftJson(activeDocId, dataToExport);
      showToast('Draft JSON exported');
    }
  };

  // Clear current document form
  const handleConfirmClear = () => {
    if (activeDocId === 'form3') {
      clearForm3Draft();
      setForm3Data(getDefaultForm3Data());
    } else if (activeDocId === 'remand') {
      clearDocDraft('remand');
      setRemandData(getDefaultRemandData());
    } else if (activeDocId === 'medical') {
      clearDocDraft('medical');
      setMedicalData(getDefaultMedicalData());
    } else if (activeDocId === 'lockup_ps') {
      clearDocDraft('lockup_ps');
      setLockupPsData(getDefaultLockupPsData());
    } else if (activeDocId === 'lockup_acp') {
      clearDocDraft('lockup_acp');
      setLockupAcpData(getDefaultLockupAcpData());
    } else if (activeDocId === 'custody_transfer') {
      clearDocDraft('custody_transfer');
      setCustodyTransferData(getDefaultCustodyTransferData());
    } else if (activeDocId === 'arrest_permission') {
      clearDocDraft('arrest_permission');
      setArrestPermissionData(getDefaultArrestPermissionData());
    }
    setIsClearModalOpen(false);
    showToast('Form cleared successfully');
  };

  // When opening a document from dashboard, ensure any stored shared details populate empty fields
  const handleSelectDoc = (id) => {
    const shared = getStoredSharedDetails();
    if (Object.keys(shared).length > 0) {
      if (id === 'form3') setForm3Data((prev) => applySharedDetailsToDoc('form3', prev, shared));
      else if (id === 'remand') setRemandData((prev) => applySharedDetailsToDoc('remand', prev, shared));
      else if (id === 'medical') setMedicalData((prev) => applySharedDetailsToDoc('medical', prev, shared));
      else if (id === 'lockup_ps') setLockupPsData((prev) => applySharedDetailsToDoc('lockup_ps', prev, shared));
      else if (id === 'lockup_acp') setLockupAcpData((prev) => applySharedDetailsToDoc('lockup_acp', prev, shared));
      else if (id === 'custody_transfer') setCustodyTransferData((prev) => applySharedDetailsToDoc('custody_transfer', prev, shared));
      else if (id === 'arrest_permission') setArrestPermissionData((prev) => applySharedDetailsToDoc('arrest_permission', prev, shared));
    }
    setActiveDocId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeDocType = activeDocId ? getDocumentTypeById(activeDocId) : null;

  return (
    <div className="app-root">
      <Header
        activeDocType={activeDocType}
        onBackToDashboard={activeDocId ? () => setActiveDocId(null) : null}
        onFillSample={activeDocId ? handleFillSample : null}
        onExportDraft={activeDocId ? handleExportDraft : null}
        onOpenClearModal={activeDocId ? () => setIsClearModalOpen(true) : null}
      />

      <SecurityBanner />

      <main className="main-content-wrapper">
        {/* If no document selected, show Dashboard */}
        {!activeDocId && (
          <Dashboard
            onSelectDoc={handleSelectDoc}
          />
        )}

        {/* If a document is selected, render its dedicated form */}
        {activeDocId && (
          <div className="active-doc-view">
            <DocumentTopBar
              docType={activeDocType}
              onBackToDashboard={() => setActiveDocId(null)}
              onFillSample={handleFillSample}
              onExportDraft={handleExportDraft}
              onOpenClearModal={() => setIsClearModalOpen(true)}
            />

            {activeDocId === 'form3' && (
              <Form3Wizard
                formData={form3Data}
                setFormData={setForm3Data}
                showToast={showToast}
                onShareDetails={(data) => handleShareDetails('form3', data)}
              />
            )}

            {activeDocId === 'remand' && (
              <RemandForm
                formData={remandData}
                setFormData={setRemandData}
                showToast={showToast}
                docType={activeDocType}
                onShareDetails={(data) => handleShareDetails('remand', data)}
              />
            )}

            {activeDocId === 'medical' && (
              <MedicalLetterForm
                formData={medicalData}
                setFormData={setMedicalData}
                showToast={showToast}
                docType={activeDocType}
                onShareDetails={(data) => handleShareDetails('medical', data)}
              />
            )}

            {activeDocId === 'lockup_ps' && (
              <LockupPsForm
                formData={lockupPsData}
                setFormData={setLockupPsData}
                showToast={showToast}
                docType={activeDocType}
                onShareDetails={(data) => handleShareDetails('lockup_ps', data)}
              />
            )}

            {activeDocId === 'lockup_acp' && (
              <LockupAcpForm
                formData={lockupAcpData}
                setFormData={setLockupAcpData}
                showToast={showToast}
                docType={activeDocType}
                onShareDetails={(data) => handleShareDetails('lockup_acp', data)}
              />
            )}

            {activeDocId === 'custody_transfer' && (
              <CustodyTransferForm
                formData={custodyTransferData}
                setFormData={setCustodyTransferData}
                showToast={showToast}
                docType={activeDocType}
                onShareDetails={(data) => handleShareDetails('custody_transfer', data)}
              />
            )}

            {activeDocId === 'arrest_permission' && (
              <ArrestPermissionForm
                formData={arrestPermissionData}
                setFormData={setArrestPermissionData}
                showToast={showToast}
                docType={activeDocType}
                onShareDetails={(data) => handleShareDetails('arrest_permission', data)}
              />
            )}
          </div>
        )}
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
