import React from 'react';

export default function SecurityBanner() {
  return (
    <aside className="security-banner" aria-label="Privacy and local storage notice">
      <span className="security-badge">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        100% Client-Side Privacy: Form data never leaves your browser. No external servers or databases.
      </span>
      <span className="security-badge">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        Master Template Protected: Preserves official margins, fonts, borders, tables, and bilingual text.
      </span>
    </aside>
  );
}
