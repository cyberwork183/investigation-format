import React, { useState } from 'react';
import {
  DOCUMENT_TYPES,
  DASHBOARD_CATEGORIES,
  getDocumentTypeById
} from '../utils/documentTypes.js';
import { getStorageKeyForDoc } from '../utils/documentSchemas.js';

export default function Dashboard({
  onSelectDoc
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categoryChips = [
    { label: 'सर्व दस्तऐवज (All)', value: 'All' },
    { label: '१. अटक व ताबा (Arrest & Custody)', value: 'Arrest & Custody' },
    { label: '२. न्यायालयीन रिमांड (Court Remand)', value: 'Court Remand' },
    { label: '३. न्यायालयीन परवानगी (Court Permission)', value: 'Court Permission' },
    { label: '४. वैद्यकीय व बंदीगृह (Medical & Custody)', value: 'Medical & Custody' }
  ];

  const hasSavedDraft = (docId) => {
    try {
      if (docId === 'form3') {
        return !!localStorage.getItem('ARREST_FORM_III_DRAFT');
      }
      return !!localStorage.getItem(getStorageKeyForDoc(docId));
    } catch (e) {
      return false;
    }
  };

  const matchesSearch = (doc, query) => {
    if (!query) return true;
    const q = query.toLowerCase().trim();
    return (
      doc.id.toLowerCase().includes(q) ||
      doc.title.toLowerCase().includes(q) ||
      doc.titleMr.toLowerCase().includes(q) ||
      (doc.description && doc.description.toLowerCase().includes(q)) ||
      (doc.descriptionMr && doc.descriptionMr.toLowerCase().includes(q)) ||
      (doc.badge && doc.badge.toLowerCase().includes(q)) ||
      (doc.category && doc.category.toLowerCase().includes(q)) ||
      (doc.categoryMr && doc.categoryMr.toLowerCase().includes(q))
    );
  };

  // Filter sections and calculate matching documents
  const filteredSections = DASHBOARD_CATEGORIES.map((section) => {
    const isCategorySelected =
      selectedCategory === 'All' || section.category === selectedCategory;

    if (!isCategorySelected) {
      return null;
    }

    const sectionDocs = section.docIds
      .map((id) => getDocumentTypeById(id))
      .filter((doc) => doc && matchesSearch(doc, searchQuery));

    return {
      ...section,
      docs: sectionDocs
    };
  }).filter((section) => section !== null && section.docs.length > 0);

  const totalMatchingDocs = filteredSections.reduce(
    (sum, section) => sum + section.docs.length,
    0
  );

  return (
    <div className="dashboard-container">
      {/* Hero Welcome Banner */}
      <div className="dashboard-hero">
        <div className="hero-emblem-badge">
          <img
            src="/assets/emblem.svg"
            alt="Maharashtra Police Emblem"
            className="hero-emblem"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <div className="hero-text-content">
          <div className="hero-badge">महाराष्ट्र पोलीस तपास कागदपत्रे प्रणाली</div>
          <h1 className="hero-title">पोलीस तपास अधिकृत दस्तऐवज जनरेटर</h1>
          <p className="hero-subtitle">
            Police Investigation Official Document & Legal Form Generator — 100% In-Browser & High-Fidelity Word Processing
          </p>
          <div className="hero-tags">
            <span className="hero-tag">🔒 १००% स्थानिक व गोपनीय (In-Browser Only)</span>
            <span className="hero-tag">📄 अधिकृत ११ Word Templates (DOCX)</span>
            <span className="hero-tag">⚡ इन्स्टंट निर्मिती व माहिती शेअर</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="dashboard-filter-bar">
        <div className="search-input-wrapper">
          <svg
            className="search-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="दस्तऐवज शोधा / Search any document by name, section, act, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="category-chips">
          {categoryChips.map((chip) => (
            <button
              key={chip.value}
              type="button"
              className={`category-chip ${selectedCategory === chip.value ? 'active' : ''}`}
              onClick={() => setSelectedCategory(chip.value)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Search Summary (if search query is active) */}
      {searchQuery.trim() && (
        <div className="search-summary-banner">
          <div>
            <span>शोध परिणाम / Search Results for "<strong>{searchQuery}</strong>":</span>{' '}
            <span>{totalMatchingDocs} दस्तऐवज उपलब्ध / {totalMatchingDocs} document(s) found</span>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setSearchQuery('')}
            style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}
          >
            शोध रीसेट करा / Clear
          </button>
        </div>
      )}

      {/* Continuous Sections: All 11 Document Cards on One Continuous Page */}
      <div className="dashboard-sections-container">
        {filteredSections.map((section) => (
          <section key={section.id} className="dashboard-section" id={`section-${section.id}`}>
            {/* Section Header */}
            <div className="dashboard-section-header">
              <div className="dashboard-section-title-wrap">
                <div className="dashboard-section-icon">
                  {section.icon === 'memo' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                  )}
                  {section.icon === 'gavel' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10"></path>
                      <path d="m16 16 6-6"></path>
                      <path d="m8 8 6-6"></path>
                      <path d="m9 7 8 8"></path>
                      <path d="m21 11-8-8"></path>
                    </svg>
                  )}
                  {section.icon === 'shield-check' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      <polyline points="9 11 12 14 22 4"></polyline>
                    </svg>
                  )}
                  {section.icon === 'folder-heart' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                      <line x1="12" y1="11" x2="12" y2="17"></line>
                      <line x1="9" y1="14" x2="15" y2="14"></line>
                    </svg>
                  )}
                </div>

                <div>
                  <h2 className="dashboard-section-title">
                    <span>{section.titleMr}</span>
                    <span className="dashboard-section-badge">{section.badge}</span>
                  </h2>
                  <div className="dashboard-section-title-en">{section.titleEn}</div>
                  <p className="dashboard-section-desc">{section.descriptionMr}</p>
                </div>
              </div>
            </div>

            {/* 3-Column Responsive Grid of Individual Cards */}
            <div className="category-docs-grid">
              {section.docs.map((doc) => {
                const isDraft = hasSavedDraft(doc.id);
                const desc = doc.descriptionMr || doc.description;

                return (
                  <div
                    key={doc.id}
                    className="doc-card category-doc-card"
                    data-doc-id={doc.id}
                    onClick={() => onSelectDoc(doc.id)}
                  >
                    <div className="category-doc-card-header">
                      <span className={`badge ${doc.badgeClass || 'badge-primary'}`}>
                        {doc.badge}
                      </span>
                      {isDraft && (
                        <span className="badge badge-draft">Draft Saved</span>
                      )}
                    </div>

                    <div className="category-doc-card-body">
                      <h3 className="category-doc-card-title-mr">{doc.titleMr}</h3>
                      <h4 className="category-doc-card-title-en">{doc.title}</h4>
                      <p className="category-doc-card-desc">{desc}</p>
                    </div>

                    <div className="category-doc-card-footer">
                      <button
                        type="button"
                        className="btn btn-primary btn-fill-doc"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDoc(doc.id);
                        }}
                      >
                        <span>उघडा / Open Form</span>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                        >
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* No Results State */}
      {filteredSections.length === 0 && (
        <div className="no-results-box">
          <p>कोणताही दस्तऐवज सापडला नाही / No matching documents found for "{searchQuery}".</p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
          >
            सर्व दस्तऐवज दाखवा / Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
