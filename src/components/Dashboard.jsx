import React, { useState } from 'react';
import { MAIN_DASHBOARD_CARDS, MEDICAL_CUSTODY_LETTERS, getDocumentTypeById } from '../utils/documentTypes.js';
import { getStorageKeyForDoc } from '../utils/documentSchemas.js';

export default function Dashboard({
  onSelectDoc
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);

  const categories = ['All', 'Arrest & Custody', 'Court Remand', 'Court Permission', 'Medical & Custody'];

  const filteredCards = MAIN_DASHBOARD_CARDS.filter((card) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      card.title.toLowerCase().includes(query) ||
      card.titleMr.toLowerCase().includes(query) ||
      card.description.toLowerCase().includes(query) ||
      card.descriptionMr.toLowerCase().includes(query) ||
      (card.subDocIds && card.subDocIds.some(subId => {
        const sub = getDocumentTypeById(subId);
        return (
          sub.title.toLowerCase().includes(query) ||
          sub.titleMr.toLowerCase().includes(query)
        );
      }));

    const matchesCategory =
      selectedCategory === 'All' || card.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

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

  const handleCardClick = (card) => {
    if (card.isDirectDoc) {
      onSelectDoc(card.id);
    } else if (card.id === 'medical_custody') {
      setIsMedicalModalOpen(true);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Hero Welcome Banner */}
      <div className="dashboard-hero">
        <div className="hero-emblem-badge">
          <img
            src="/assets/emblem.svg"
            alt="Maharashtra Police Emblem"
            className="hero-emblem"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
        <div className="hero-text-content">
          <div className="hero-badge">महाराष्ट्र पोलीस तपास कागदपत्रे प्रणाली</div>
          <h1 className="hero-title">पोलीस तपास अधिकृत दस्तऐवज जनरेटर</h1>
          <p className="hero-subtitle">
            Police Investigation Official Document & Legal Form Generator — 100% Client-Side & High-Fidelity Word Processing
          </p>
          <div className="hero-tags">
            <span className="hero-tag">🔒 १००% गोपनीय (Browser Only)</span>
            <span className="hero-tag">📄 अधिकृत Word Templates (DOCX)</span>
            <span className="hero-tag">⚡ इन्स्टंट निर्मिती व डाऊनलोड</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="dashboard-filter-bar">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="दस्तऐवज शोधा / Search documents by name or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </div>

        <div className="category-chips">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'All' ? 'सर्व मुख्य दस्तऐवज (All)' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main 4 Document Cards Grid */}
      <div className="doc-cards-grid">
        {filteredCards.map((card) => {
          let hasDraft = false;
          if (card.isDirectDoc) {
            hasDraft = hasSavedDraft(card.id);
          } else if (card.subDocIds) {
            hasDraft = card.subDocIds.some(subId => hasSavedDraft(subId));
          }

          return (
            <div
              key={card.id}
              className="doc-card"
              onClick={() => handleCardClick(card)}
              style={{ cursor: 'pointer' }}
            >
              <div className="doc-card-header">
                <div className="doc-card-icon-wrap">
                  {card.icon === 'memo' && (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                  )}
                  {card.icon === 'gavel' && (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10"></path>
                      <path d="m16 16 6-6"></path>
                      <path d="m8 8 6-6"></path>
                      <path d="m9 7 8 8"></path>
                      <path d="m21 11-8-8"></path>
                    </svg>
                  )}
                  {card.icon === 'shield-check' && (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      <polyline points="9 11 12 14 22 4"></polyline>
                    </svg>
                  )}
                  {card.icon === 'folder-heart' && (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                      <line x1="12" y1="11" x2="12" y2="17"></line>
                      <line x1="9" y1="14" x2="15" y2="14"></line>
                    </svg>
                  )}
                </div>

                <div className="doc-card-badges">
                  <span className={`badge ${card.badgeClass}`}>{card.badge}</span>
                  {hasDraft && (
                    <span className="badge badge-draft">Draft Saved</span>
                  )}
                </div>
              </div>

              <div className="doc-card-body">
                <h3 className="doc-card-title-mr">{card.titleMr}</h3>
                <h4 className="doc-card-title-en">{card.title}</h4>
                <p className="doc-card-desc">{card.descriptionMr}</p>
                <p className="doc-card-desc-en">{card.description}</p>
              </div>

              <div className="doc-card-footer">
                <button
                  type="button"
                  className="btn btn-primary btn-fill-doc"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(card);
                  }}
                >
                  <span>
                    {card.isDirectDoc ? 'नमुना भरा / Fill Form' : 'पत्र निवडा / Select Letter (४ पत्रे)'}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCards.length === 0 && (
        <div className="no-results-box">
          <p>कोणताही मुख्य दस्तऐवज सापडला नाही / No matching document found for "{searchQuery}".</p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
          >
            सर्व दस्तऐवज दाखवा / Reset Filters
          </button>
        </div>
      )}

      {/* Medical & Custody Letters Selection Modal */}
      {isMedicalModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsMedicalModalOpen(false)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '680px' }}
          >
            <div className="modal-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-900)', margin: 0 }}>
                  Medical &amp; Custody Letters
                  <span className="marathi-header" style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-light)', fontWeight: 500, marginTop: '2px' }}>
                    (वैद्यकीय तपासणी व बंदिगृह पत्रे)
                  </span>
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Choose the specific letter template you wish to create:
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsMedicalModalOpen(false)}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '65vh', overflowY: 'auto' }}>
              {MEDICAL_CUSTODY_LETTERS.map((letter) => {
                const isDraft = hasSavedDraft(letter.id);

                return (
                  <div
                    key={letter.id}
                    onClick={() => {
                      setIsMedicalModalOpen(false);
                      onSelectDoc(letter.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem 1.25rem',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border-subtle)',
                      background: 'var(--bg-surface)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--gov-blue-600)';
                      e.currentTarget.style.background = 'var(--gov-blue-50)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.background = 'var(--bg-surface)';
                    }}
                  >
                    <div style={{ flex: 1, paddingRight: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--primary-900)' }}>
                          {letter.titleMr}
                        </strong>
                        <span className={`badge ${letter.badgeClass}`} style={{ fontSize: '11px', padding: '2px 6px' }}>
                          {letter.badge}
                        </span>
                        {isDraft && (
                          <span className="badge badge-draft" style={{ fontSize: '10px', padding: '1px 5px' }}>
                            Draft
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {letter.descMr}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ flexShrink: 0 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMedicalModalOpen(false);
                        onSelectDoc(letter.id);
                      }}
                    >
                      उघडा / Open &rarr;
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="modal-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsMedicalModalOpen(false)}
              >
                Close / बंद करा
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
