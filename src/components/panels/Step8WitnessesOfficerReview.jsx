import React, { useRef } from 'react';
import ReviewSummary from '../ReviewSummary';

export default function Step8WitnessesOfficerReview({
  formData,
  onChange,
  errors = {},
  hasPhoto,
  photoDataUrl,
  photoError,
  onPhotoUpload,
  onPhotoRemove,
  isGeneratingDocx,
  onGenerateDocx,
  onRefreshReview,
  onGoToStep,
  onPrev
}) {
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onPhotoUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="section-panel active" id="panelStep8" data-panel="8">
      <div className="panel-header">
        <h2>
          Section 13 &amp; 14 — Witnesses, Officer Details &amp; Review
          <span className="marathi-header">(पंच, तपासीक अधिकारी व पुनरावलोकन)</span>
        </h2>
        <p>Mandatory Pancha witnesses, photo attachment, and official DOCX generation.</p>
      </div>

      {/* Section 13: Witnesses */}
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-800)', marginBottom: '0.5rem' }}>
        13. Pancha / Witnesses Details <span className="marathi-label">(पंचाची नावे व सहया - किमान एक पंच आवश्यक)</span>
      </h3>
      <p className="field-hint" style={{ marginBottom: '1rem' }}>Official legal requirement: At least one witness is mandatory.</p>

      <div className="form-grid">
        <div className="form-group col-span-2">
          <label className="form-label" htmlFor="witness1Name">
            Witness / Pancha 1 Name <span className="marathi-label">(पंच क्र. १ चे नाव)</span> <span className="req">*</span>
          </label>
          <input
            type="text"
            id="witness1Name"
            name="witness1Name"
            className="form-control"
            placeholder="Full name of Witness 1"
            value={formData.witness1Name || ''}
            onChange={(e) => onChange('witness1Name', e.target.value)}
            required
          />
          {errors.witness1Name && <span className="field-error" id="err_witness1Name">{errors.witness1Name}</span>}
        </div>

        <div className="form-group col-span-2">
          <label className="form-label" htmlFor="witness1Address">
            Witness 1 Address <span className="marathi-label">(पत्ता)</span> <span className="req">*</span>
          </label>
          <textarea
            id="witness1Address"
            name="witness1Address"
            className="form-control"
            rows={2}
            placeholder="Residential address of Witness 1"
            value={formData.witness1Address || ''}
            onChange={(e) => onChange('witness1Address', e.target.value)}
            required
          />
          {errors.witness1Address && <span className="field-error" id="err_witness1Address">{errors.witness1Address}</span>}
        </div>

        <div className="form-group col-span-2">
          <label className="form-label" htmlFor="witness2Name">
            Witness / Pancha 2 Name <span className="marathi-label">(पंच क्र. २ चे नाव - ऐच्छिक)</span>
          </label>
          <input
            type="text"
            id="witness2Name"
            name="witness2Name"
            className="form-control"
            placeholder="Full name of Witness 2 (Optional)"
            value={formData.witness2Name || ''}
            onChange={(e) => onChange('witness2Name', e.target.value)}
          />
        </div>

        <div className="form-group col-span-2">
          <label className="form-label" htmlFor="witness2Address">
            Witness 2 Address <span className="marathi-label">(पत्ता)</span>
          </label>
          <textarea
            id="witness2Address"
            name="witness2Address"
            className="form-control"
            rows={2}
            placeholder="Residential address of Witness 2"
            value={formData.witness2Address || ''}
            onChange={(e) => onChange('witness2Address', e.target.value)}
          />
        </div>
      </div>

      {/* Photo Upload Area */}
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-800)', margin: '1.5rem 0 0.5rem' }}>
        Accused Photograph <span className="marathi-label">(आरोपीचा फोटो)</span>
      </h3>
      <p className="field-hint" style={{ marginBottom: '1rem' }}>
        Upload passport-size photo. Proportional scaling preserves Word document layout without shifting tables.
      </p>

      <div
        className="photo-uploader"
        id="photoDropArea"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="photo-preview-wrap">
          {!photoDataUrl && (
            <div id="photoPlaceholder" className="photo-placeholder" style={{ display: 'flex' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>No Photo Uploaded</span>
            </div>
          )}
          {photoDataUrl && (
            <img
              id="photoPreviewImg"
              className="photo-preview-img"
              src={photoDataUrl}
              alt="Accused Photo Preview"
              style={{ display: 'block' }}
            />
          )}
        </div>

        <div>
          <input
            type="file"
            id="photoFileInput"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onPhotoUpload(e.target.files[0]);
              }
            }}
          />
          <button
            type="button"
            className="btn btn-secondary"
            id="btnChoosePhoto"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            {photoDataUrl ? 'Change Photograph (JPEG / PNG)' : 'Choose Photograph (JPEG / PNG)'}
          </button>
          {photoDataUrl && (
            <button
              type="button"
              className="btn btn-danger-outline"
              id="btnRemovePhoto"
              onClick={onPhotoRemove}
              style={{ display: 'inline-flex', marginLeft: '0.5rem' }}
            >
              Remove Photo
            </button>
          )}
        </div>
        {photoError && <span className="field-error" id="err_photo" style={{ display: 'block', marginTop: '0.4rem' }}>{photoError}</span>}
      </div>

      {/* Section 14: Officer Details */}
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-800)', margin: '1.5rem 0 0.5rem' }}>
        14. Investigation Officer Details <span className="marathi-label">(तपासीक अधिकाऱ्‍याचा तपशिल)</span>
      </h3>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="officerName">
            Officer Name <span className="marathi-label">(तपासणी अधिकाऱ्‍याचे नाव)</span> <span className="req">*</span>
          </label>
          <input
            type="text"
            id="officerName"
            name="officerName"
            className="form-control"
            placeholder="e.g., S. G. Pandhare"
            value={formData.officerName || ''}
            onChange={(e) => onChange('officerName', e.target.value)}
            required
          />
          {errors.officerName && <span className="field-error" id="err_officerName">{errors.officerName}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="officerRank">
            Rank / Designation <span className="marathi-label">(पदनाम)</span> <span className="req">*</span>
          </label>
          <input
            type="text"
            id="officerRank"
            name="officerRank"
            className="form-control"
            placeholder="e.g., Asst. Police Inspector / PSI"
            value={formData.officerRank || ''}
            onChange={(e) => onChange('officerRank', e.target.value)}
            required
          />
          {errors.officerRank && <span className="field-error" id="err_officerRank">{errors.officerRank}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="officerNo">
            Badge / Identification No. <span className="marathi-label">(क्रमांक)</span>
          </label>
          <input
            type="text"
            id="officerNo"
            name="officerNo"
            className="form-control"
            placeholder="e.g., B-1234"
            value={formData.officerNo || ''}
            onChange={(e) => onChange('officerNo', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="place">
            Place <span className="marathi-label">(ठिकाण)</span>
          </label>
          <input
            type="text"
            id="place"
            name="place"
            className="form-control"
            placeholder="e.g., Cyber Police Station, Nagpur"
            value={formData.place || ''}
            onChange={(e) => onChange('place', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="finalDate">
            Date <span className="marathi-label">(तारीख)</span>
          </label>
          <input
            type="date"
            id="finalDate"
            name="finalDate"
            className="form-control"
            value={formData.finalDate || ''}
            onChange={(e) => onChange('finalDate', e.target.value)}
          />
        </div>
      </div>

      {/* REVIEW SUMMARY CARD */}
      <div style={{ marginTop: '2.5rem', padding: '1.5rem', backgroundColor: 'var(--bg-alt)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gov-blue-800)' }}>
            Document Verification &amp; Final Review
          </h3>
          <button
            type="button"
            className="btn btn-secondary"
            id="btnRefreshReview"
            onClick={onRefreshReview}
          >
            Refresh Review Data
          </button>
        </div>

        {Object.keys(errors).length > 0 && (
          <div id="validationAlertBox" className="review-validation-alert" style={{ display: 'block', marginBottom: '1rem' }}>
            <h4>Please address the following required fields before generation:</h4>
            <ul id="validationErrorsList">
              {Object.entries(errors).map(([k, msg]) => (
                <li key={k}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        <ReviewSummary
          formData={formData}
          hasPhoto={hasPhoto}
          onGoToStep={onGoToStep}
        />

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-prev"
            data-prev="7"
            onClick={onPrev}
          >
            &larr; Back to Edit Form
          </button>
          <button
            type="button"
            className="btn btn-success"
            id="btnGenerateDocx"
            disabled={isGeneratingDocx}
            onClick={onGenerateDocx}
          >
            {isGeneratingDocx ? (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="spin-icon"
                  style={{ marginRight: '0.4rem' }}
                >
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                </svg>
                Generating Official DOCX...
              </>
            ) : (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  style={{ marginRight: '0.35rem' }}
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Generate &amp; Download Official DOCX
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
