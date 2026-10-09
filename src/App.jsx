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
import Notice352Form from './components/forms/Notice352Form';
import AtakSanhaForm from './components/forms/AtakSanhaForm';
import Notice47Form from './components/forms/Notice47Form';
import Notice48Form from './components/forms/Notice48Form';

import { DOCUMENT_TYPES, getDocumentTypeById } from './utils/documentTypes';
import {
  getDefaultForm3Data,
  getSampleForm3Data,
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
  getDefaultNotice352Data,
  getSampleNotice352Data,
  getDefaultAtakSanhaData,
  getSampleAtakSanhaData,
  getDefaultNotice47Data,
  getSampleNotice47Data,
  getDefaultNotice48Data,
  getSampleNotice48Data,
  exportDocDraftJson
} from './utils/documentSchemas';

import {
  getStoredSharedDetails,
  saveStoredSharedDetails,
  extractSharedDetailsFromDoc,
  applySharedDetailsToDoc
} from './utils/shareDetails';

export default function App() {
  // activeDocId is null for Dashboard, or 'form3', 'remand', 'medical', 'notice_35_2', etc.
  const [activeDocId, setActiveDocId] = useState(null);

  // Form III initializes with predefined sample data as per requirement
  const [form3Data, setForm3Data] = useState(() => {
    return getSampleForm3Data();
  });

  // All other forms open empty by default
  const [remandData, setRemandData] = useState(() => getDefaultRemandData());
  const [medicalData, setMedicalData] = useState(() => getDefaultMedicalData());
  const [lockupPsData, setLockupPsData] = useState(() => getDefaultLockupPsData());
  const [lockupAcpData, setLockupAcpData] = useState(() => getDefaultLockupAcpData());
  const [custodyTransferData, setCustodyTransferData] = useState(() => getDefaultCustodyTransferData());
  const [arrestPermissionData, setArrestPermissionData] = useState(() => getDefaultArrestPermissionData());
  const [notice352Data, setNotice352Data] = useState(() => getDefaultNotice352Data());
  const [atakSanhaData, setAtakSanhaData] = useState(() => getDefaultAtakSanhaData());
  const [notice47Data, setNotice47Data] = useState(() => getDefaultNotice47Data());
  const [notice48Data, setNotice48Data] = useState(() => getDefaultNotice48Data());

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

  /**
   * Share Details Action:
   * Collects all currently entered non-empty values from source form,
   * stores them in session pool, and populates matching empty fields in all other forms.
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
    setForm3Data((prev) => (sourceDocId === 'form3' ? currentFormData : applySharedDetailsToDoc('form3', prev, updatedSharedPool)));
    setRemandData((prev) => (sourceDocId === 'remand' ? currentFormData : applySharedDetailsToDoc('remand', prev, updatedSharedPool)));
    setMedicalData((prev) => (sourceDocId === 'medical' ? currentFormData : applySharedDetailsToDoc('medical', prev, updatedSharedPool)));
    setLockupPsData((prev) => (sourceDocId === 'lockup_ps' ? currentFormData : applySharedDetailsToDoc('lockup_ps', prev, updatedSharedPool)));
    setLockupAcpData((prev) => (sourceDocId === 'lockup_acp' ? currentFormData : applySharedDetailsToDoc('lockup_acp', prev, updatedSharedPool)));
    setCustodyTransferData((prev) => (sourceDocId === 'custody_transfer' ? currentFormData : applySharedDetailsToDoc('custody_transfer', prev, updatedSharedPool)));
    setArrestPermissionData((prev) => (sourceDocId === 'arrest_permission' ? currentFormData : applySharedDetailsToDoc('arrest_permission', prev, updatedSharedPool)));
    setNotice352Data((prev) => (sourceDocId === 'notice_35_2' ? currentFormData : applySharedDetailsToDoc('notice_35_2', prev, updatedSharedPool)));
    setAtakSanhaData((prev) => (sourceDocId === 'atak_sanha' ? currentFormData : applySharedDetailsToDoc('atak_sanha', prev, updatedSharedPool)));
    setNotice47Data((prev) => (sourceDocId === 'notice_47' ? currentFormData : applySharedDetailsToDoc('notice_47', prev, updatedSharedPool)));
    setNotice48Data((prev) => (sourceDocId === 'notice_48' ? currentFormData : applySharedDetailsToDoc('notice_48', prev, updatedSharedPool)));

    showToast(`Details shared! ${keyCount} field(s) available to other forms. / माहिती इतर फॉर्ममध्ये उपलब्ध केली.`);
  };

  // Fill sample data for active document
  const handleFillSample = () => {
    if (activeDocId === 'form3') {
      const s = getSampleForm3Data();
      setForm3Data(s);
    } else if (activeDocId === 'remand') {
      const s = getSampleRemandData();
      setRemandData(s);
    } else if (activeDocId === 'medical') {
      const s = getSampleMedicalData();
      setMedicalData(s);
    } else if (activeDocId === 'lockup_ps') {
      const s = getSampleLockupPsData();
      setLockupPsData(s);
    } else if (activeDocId === 'lockup_acp') {
      const s = getSampleLockupAcpData();
      setLockupAcpData(s);
    } else if (activeDocId === 'custody_transfer') {
      const s = getSampleCustodyTransferData();
      setCustodyTransferData(s);
    } else if (activeDocId === 'arrest_permission') {
      const s = getSampleArrestPermissionData();
      setArrestPermissionData(s);
    } else if (activeDocId === 'notice_35_2') {
      const s = getSampleNotice352Data();
      setNotice352Data(s);
    } else if (activeDocId === 'atak_sanha') {
      const s = getSampleAtakSanhaData();
      setAtakSanhaData(s);
    } else if (activeDocId === 'notice_47') {
      const s = getSampleNotice47Data();
      setNotice47Data(s);
    } else if (activeDocId === 'notice_48') {
      const s = getSampleNotice48Data();
      setNotice48Data(s);
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
    else if (activeDocId === 'notice_35_2') dataToExport = notice352Data;
    else if (activeDocId === 'atak_sanha') dataToExport = atakSanhaData;
    else if (activeDocId === 'notice_47') dataToExport = notice47Data;
    else if (activeDocId === 'notice_48') dataToExport = notice48Data;

    if (dataToExport) {
      exportDocDraftJson(activeDocId, dataToExport);
      showToast('Draft JSON exported');
    }
  };

  // Clear current document form
  const handleConfirmClear = () => {
    if (activeDocId === 'form3') {
      setForm3Data(getDefaultForm3Data());
    } else if (activeDocId === 'remand') {
      setRemandData(getDefaultRemandData());
    } else if (activeDocId === 'medical') {
      setMedicalData(getDefaultMedicalData());
    } else if (activeDocId === 'lockup_ps') {
      setLockupPsData(getDefaultLockupPsData());
    } else if (activeDocId === 'lockup_acp') {
      setLockupAcpData(getDefaultLockupAcpData());
    } else if (activeDocId === 'custody_transfer') {
      setCustodyTransferData(getDefaultCustodyTransferData());
    } else if (activeDocId === 'arrest_permission') {
      setArrestPermissionData(getDefaultArrestPermissionData());
    } else if (activeDocId === 'notice_35_2') {
      setNotice352Data(getDefaultNotice352Data());
    } else if (activeDocId === 'atak_sanha') {
      setAtakSanhaData(getDefaultAtakSanhaData());
    } else if (activeDocId === 'notice_47') {
      setNotice47Data(getDefaultNotice47Data());
    } else if (activeDocId === 'notice_48') {
      setNotice48Data(getDefaultNotice48Data());
    }
    setIsClearModalOpen(false);
    showToast('Form cleared successfully');
  };

  const dashboardScrollPosRef = useRef(0);

  // When opening a document from dashboard, ensure any stored shared details populate empty fields
  const handleSelectDoc = (id) => {
    dashboardScrollPosRef.current = window.scrollY || window.pageYOffset || 0;
    const shared = getStoredSharedDetails();
    if (Object.keys(shared).length > 0) {
      if (id === 'form3') setForm3Data((prev) => applySharedDetailsToDoc('form3', prev, shared));
      else if (id === 'remand') setRemandData((prev) => applySharedDetailsToDoc('remand', prev, shared));
      else if (id === 'medical') setMedicalData((prev) => applySharedDetailsToDoc('medical', prev, shared));
      else if (id === 'lockup_ps') setLockupPsData((prev) => applySharedDetailsToDoc('lockup_ps', prev, shared));
      else if (id === 'lockup_acp') setLockupAcpData((prev) => applySharedDetailsToDoc('lockup_acp', prev, shared));
      else if (id === 'custody_transfer') setCustodyTransferData((prev) => applySharedDetailsToDoc('custody_transfer', prev, shared));
      else if (id === 'arrest_permission') setArrestPermissionData((prev) => applySharedDetailsToDoc('arrest_permission', prev, shared));
      else if (id === 'notice_35_2') setNotice352Data((prev) => applySharedDetailsToDoc('notice_35_2', prev, shared));
      else if (id === 'atak_sanha') setAtakSanhaData((prev) => applySharedDetailsToDoc('atak_sanha', prev, shared));
      else if (id === 'notice_47') setNotice47Data((prev) => applySharedDetailsToDoc('notice_47', prev, shared));
      else if (id === 'notice_48') setNotice48Data((prev) => applySharedDetailsToDoc('notice_48', prev, shared));
    }
    setActiveDocId(id);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleBackToDashboard = () => {
    setActiveDocId(null);
    setTimeout(() => {
      window.scrollTo({ top: dashboardScrollPosRef.current, behavior: 'smooth' });
    }, 40);
  };

  const activeDocType = activeDocId ? getDocumentTypeById(activeDocId) : null;

  return (
    <div className="app-root">
      <Header
        activeDocType={activeDocType}
        onBackToDashboard={activeDocId ? handleBackToDashboard : null}
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
              onBackToDashboard={handleBackToDashboard}
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

            {activeDocId === 'notice_35_2' && (
              <Notice352Form
                formData={notice352Data}
                setFormData={setNotice352Data}
                showToast={showToast}
                docType={activeDocType}
                onShareDetails={(data) => handleShareDetails('notice_35_2', data)}
              />
            )}

            {activeDocId === 'atak_sanha' && (
              <AtakSanhaForm
                formData={atakSanhaData}
                setFormData={setAtakSanhaData}
                showToast={showToast}
                docType={activeDocType}
                onShareDetails={(data) => handleShareDetails('atak_sanha', data)}
              />
            )}

            {activeDocId === 'notice_47' && (
              <Notice47Form
                formData={notice47Data}
                setFormData={setNotice47Data}
                showToast={showToast}
                docType={activeDocType}
                onShareDetails={(data) => handleShareDetails('notice_47', data)}
              />
            )}

            {activeDocId === 'notice_48' && (
              <Notice48Form
                formData={notice48Data}
                setFormData={setNotice48Data}
                showToast={showToast}
                docType={activeDocType}
                onShareDetails={(data) => handleShareDetails('notice_48', data)}
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

