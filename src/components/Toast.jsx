import React from 'react';

export default function Toast({ message, isSuccess = true, isVisible = false }) {
  return (
    <div
      className={`toast-msg ${isVisible ? 'show' : ''}`}
      id="toastMsg"
      role="alert"
      aria-live="polite"
    >
      <span id="toastIcon">{isSuccess ? '✓' : '⚠'}</span>
      <span id="toastText">{message}</span>
    </div>
  );
}
