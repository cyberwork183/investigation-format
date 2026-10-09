import React from 'react';

const PF_ITEMS = [
  // Row 1 (1 to 10)
  { num: '1. Sex (लिंग)', key: 'sex', placeholder: 'Male / Female / Other' },
  { num: '2. Date / Year of Birth (जन्मतारीख/वर्ष)', key: 'dob', placeholder: 'e.g., 1990 (Age 36)' },
  { num: '3. Build (बांधा)', key: 'build', placeholder: 'e.g., Slim / Medium / Heavy' },
  { num: '4. Height in Cms. (उंची से.मी.)', key: 'height', placeholder: 'e.g., 170 cm' },
  { num: '5. Complexion (वर्ण)', key: 'complexion', placeholder: 'e.g., Fair / Wheatish / Dark' },
  { num: '6. Identification Mark (ओळख चिन्हे)', key: 'idMark', placeholder: 'e.g., Mole on right collarbone' },
  { num: '7. Deformities Peculiarities (व्यंग वैशिष्ट्य)', key: 'deformities', placeholder: 'e.g., None / Limp' },
  { num: '8. Teeth (दात)', key: 'teeth', placeholder: 'e.g., Normal / Irregular' },
  { num: '9. Hair (केस)', key: 'hair', placeholder: 'e.g., Black / Grey / Curly' },
  { num: '10. Eye (डोळे)', key: 'eye', placeholder: 'e.g., Normal / Brown / Black' },

  // Row 2 (11 to 20)
  { num: '11. Habits (सवयी)', key: 'habits', placeholder: 'e.g., Tobacco / None' },
  { num: '12. Dress Habits (पोषाखाच्या सवयी)', key: 'dressHabits', placeholder: 'e.g., Shirt and Pant' },
  { num: '13. Languages (बोली / भाषा)', key: 'languages', placeholder: 'e.g., Marathi, Hindi, English' },
  { num: '14. Burn Mark (भाजल्याच्या खुणा)', key: 'burnMark', placeholder: 'e.g., Nil / On left hand' },
  { num: '15. Leucoderma (कोड)', key: 'leucoderma', placeholder: 'e.g., Nil' },
  { num: '16. Mole (तीळ)', key: 'mole', placeholder: 'e.g., Mole on chest / right arm' },
  { num: '17. Scar (व्रण)', key: 'scar', placeholder: 'e.g., Old linear scar on forearm' },
  { num: '18. Tattoo (गोंदण)', key: 'tattoo', placeholder: 'e.g., Nil / Name on wrist' },
  { num: '19. Forehead (कपाळ)', key: 'forehead', placeholder: 'e.g., Normal / Broad / Narrow' },
  { num: '20. Ear (कान)', key: 'ear', placeholder: 'e.g., Normal / Pierced' },

  // Row 3 (21 to 25)
  { num: '21. Nose (नाक)', key: 'nose', placeholder: 'e.g., Normal / Sharp / Flat' },
  { num: '22. Moustaches (मिशी)', key: 'moustaches', placeholder: 'e.g., Trimmed / Thick / None' },
  { num: '23. Speech / Voice (बोलण्याची पध्दत)', key: 'speech', placeholder: 'e.g., Normal / Stammer / Soft' },
  { num: '24. Face (चेहरा)', key: 'face', placeholder: 'e.g., Oval / Round / Square' },
  { num: '25. Lips (ओठ)', key: 'lips', placeholder: 'e.g., Normal / Thick / Thin' }
];

export default function Step5PhysicalFeatures({ formData, onChange, onPhysicalFeatureChange, onPrev, onNext }) {
  const pf = formData.physicalFeatures || {};

  return (
    <div className="section-panel active" id="panelStep5" data-panel="5">
      <div className="panel-header">
        <h2>
          Section 7, 9 &amp; 12 — Physical Features Table &amp; Injuries
          <span className="marathi-header">(शारीरिक वैशिष्ट्ये व जखमा)</span>
        </h2>
        <p>Reproducing all 25 numbered physical attributes in the exact official order of Form III's table.</p>
      </div>

      {/* Section 7: Injuries */}
      <div className="form-grid grid-1" style={{ marginBottom: '2rem' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="injuriesDetails">
            7. Injuries, cause of injuries and physical condition <span className="marathi-label">(जखमा, जखमांची कारणे आणि शारीरिक अवस्था)</span>
          </label>
          <textarea
            id="injuriesDetails"
            name="injuriesDetails"
            className="form-control"
            rows={2}
            placeholder="Describe injuries or enter: 'No external injuries noted on physical examination'"
            value={formData.injuriesDetails || ''}
            onChange={(e) => onChange('injuriesDetails', e.target.value)}
          />
        </div>
      </div>

      {/* Physical Features Heading */}
      <h3 style={{ fontSize: '1rem', color: 'var(--gov-blue-800)', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>
        9. Physical Features, Deformities &amp; Other Details (शारीरिक वैशिष्ट्ये)
      </h3>

      <div className="pf-grid">
        {PF_ITEMS.map((item) => (
          <div key={item.key} className="pf-card">
            <div className="pf-num">{item.num}</div>
            <input
              type="text"
              id={`pf_${item.key}`}
              className="form-control"
              placeholder={item.placeholder}
              value={pf[item.key] || ''}
              onChange={(e) => onPhysicalFeatureChange(item.key, e.target.value)}
            />
          </div>
        ))}

        <div className="pf-card">
          <div className="pf-num">Other Features, if any (इतर वैशिष्ट्ये)</div>
          <input
            type="text"
            id="otherFeatures"
            name="otherFeatures"
            className="form-control"
            placeholder="Any distinctive feature (or Nil)"
            value={formData.otherFeatures || ''}
            onChange={(e) => onChange('otherFeatures', e.target.value)}
          />
        </div>
      </div>

      <div className="panel-footer">
        <button type="button" className="btn btn-secondary btn-prev" data-prev="4" onClick={onPrev}>
          &larr; Previous
        </button>
        <button type="button" className="btn btn-primary btn-next" data-next="6" onClick={onNext}>
          Next: Custody &amp; Articles &rarr;
        </button>
      </div>
    </div>
  );
}
