import React from 'react';

export default function ClearModal({ isOpen, onCancel, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" id="clearModal">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Confirm Clear Form</h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Are you sure you want to clear all entered form information? All fields will be reset to blank.
        </p>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            id="btnCancelClear"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger-outline"
            id="btnConfirmClear"
            onClick={onConfirm}
          >
            Yes, Clear All
          </button>
        </div>
      </div>
    </div>
  );
}
