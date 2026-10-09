# Form III — Arrest / Court Surrender Form Generator
### (अटकेचा पंचनामा / न्यायालयाच्या स्वाधीन होण्याचा नमुना)

A web application designed for police officers and authorized personnel to complete official **Form III (Arrest / Court Surrender Memo)** through a modern web interface while generating **official Microsoft Word (.docx) documents with 100% structure, table, border, typography, and page layout preservation**.

---

## 🏛️ Core Principles & Architecture

1. **Master Template Immutability**:
   - The master template (`template/arrest-form-master.docx` and the original `arrest form_templete.docx`) is **strictly read-only** and never overwritten.
   - The document is generated directly in the browser by loading the template in memory, parsing its internal WordprocessingML XML via `DOMParser`, injecting data into the designated runs and table cells, and generating the final output archive with `JSZip`.
   
2. **Document Fidelity (No HTML-to-Word Conversion)**:
   - Does **NOT** attempt HTML-to-DOCX conversion.
   - Preserves all 3 pages, bilingual (English/Marathi) headings, margins, section breaks, `<w:br w:type="page"/>` page breaks, and the 25-attribute physical features table (`TBL58`).
   - Inserts official check marks `[√]` on selected legal status and observation options without altering neighboring formatting.

3. **100% Client-Side & GitHub Pages Ready**:
   - Zero backend required. No Node.js, Python, or FastAPI server needed in production.
   - All vendor dependencies (`jszip.min.js`) are bundled locally.
   - Zero external API dependencies or trackers. Sensitive case and accused personal data remains strictly inside the user's browser session.
   - Includes embedded Base64 master fallback (`js/template-base64.js`) so the application works even when opened directly as a local `file:///` URL without running a local web server.

---

## 📁 Repository Structure

```
/
├── index.html                  # Institutional, responsive Form III user interface
├── styles.css                  # Institutional styling, accessible contrast, responsive layout
├── app.js                      # Application coordinator and event lifecycle bootstrap
│
├── js/
│   ├── form-data.js            # Form state models, default values, draft persistence & export
│   ├── validation.js           # Client-side inline validation for required legal fields
│   ├── image-handler.js        # Accused photo validation, aspect scaling, and ArrayBuffer conversion
│   ├── docx-generator.js       # Core WordprocessingML / XML manipulation and DOCX builder
│   ├── template-base64.js      # Protected master template fallback for offline file:// protocol
│   ├── ui.js                   # 8-step wizard navigation, review screen renderer, toast alerts
│   └── vendor/
│       └── jszip.min.js        # Bundled JSZip library for client-side ZIP/DOCX packaging
│
├── assets/
│   └── emblem.svg              # Institutional state/police emblem icon
│
├── template/
│   └── arrest-form-master.docx # Protected master DOCX template
│
├── tests/                      # Automated fidelity & end-to-end testing suite
│   ├── fidelity_test.py        # Structural XML fidelity validator
│   ├── fidelity_report.txt     # Output of fidelity check
│   └── test_cdp_automation.js  # Headless browser automation via Chrome CDP
│
├── arrest form_templete.docx   # Original master template (Source of Truth)
└── README.md                   # System documentation & deployment guide
```

---

## 🚀 Running Locally

### Option 1: Direct File Launch (No Server Needed)
Simply double-click `index.html` in your file explorer. It will open in your browser (Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari) and run completely offline using the embedded master template.

### Option 2: Using Local HTTP Server
Run any lightweight static HTTP server:

```powershell
# Using Python
python -m http.server 8080

# Using Node.js
npx serve .
```

Open `http://localhost:8080` in your web browser.

---

## 🌐 Deploying to GitHub Pages

1. Push this repository to GitHub.
2. In your repository on GitHub, navigate to **Settings** &rarr; **Pages**.
3. Under **Branch**, select `main` (or `master`) and folder `/ (root)`.
4. Click **Save**.
5. Within 1–2 minutes, your website is live at:
   `https://<your-username>.github.io/<repository-name>/`

**No build steps, no npm install, and no environment variables required.**

---

## 📝 Form Sections & Field Mapping

| Step | Section Name | Official Form Elements Mapped |
|:---:|:---|:---|
| **1** | **Case Information** | State, District, Police Station, FIR / Proceeding / G.D. No., Year, Date, Alphanumeric Accused Code (`A1`–`A9`, `B1`, etc.) |
| **2** | **Arrest & Court Details** | Date, Time, Station Diary G.D. No., Place of Arrest (P.S., District, State), Court Name (if surrendered) |
| **3** | **Acts & Status** | Acts and Sections (English & Marathi), 7 selectable official arrest/surrender status options with `[√]` tick mark |
| **4** | **Particulars of Accused** | Accused Name, Father/Husband/Guardian Name, Aliases 1 & 2, Nationality, Voter ID, Passport No., Issue Date & Place, Religion, Caste/Tribe, Category, Occupation, Permanent Address, Present Address |
| **5** | **Physical Features (1–25)** | Injuries & Medical Exam details, all 25 official attributes from Form III's table (Sex, DOB, Build, Height, Complexion, ID Mark, Deformities, Teeth, Hair, Eye, Habits, Dress Habits, Languages, Burn Mark, Leucoderma, Mole, Scar, Tattoo, Forehead, Ear, Nose, Moustaches, Speech/Voice, Face, Lips), Other features |
| **6** | **Custody, Search & Intimation** | Custody Date, Time & Place, Articles 1 to 6 (or NIL), Dignity & Caution notices, Intimation Name, Relationship, Address |
| **7** | **Socio-Economic & Police Record** | Fingerprint (Yes/No + Number/Reason), Living Status options, Educational Qualification, Occupation, Income Group (6 official brackets), 9 Risk observation Yes/No questions + Other cases reference |
| **8** | **Witnesses, Officer & Review** | Pancha Witness 1 (Mandatory), Witness 2 (Optional), Accused Photograph upload with preview & inline Word embedding, Investigation Officer Name, Rank, Number, Place, Date |

---

## 🧪 Output Fidelity Testing

To guarantee that the generated DOCX matches the master template without layout corruption, run the automated fidelity test:

```powershell
python tests/fidelity_test.py
```

### Verification Criteria Passed:
- [x] **Page Count**: Exactly 3 pages matching the master template.
- [x] **Page Breaks**: `<w:br w:type="page"/>` explicitly preserved after Section 7 and Section 9.
- [x] **Table Integrity**: Table with 9 rows and exact cell counts `[10, 10, 10, 10, 10, 10, 7, 7, 7]`.
- [x] **Bilingual Content**: All Marathi and English static text, section labels, and numbers intact.
- [x] **Typography & Styling**: Clean font sizing and bold highlights for injected values.
- [x] **Photo Embedding**: Passport photo scaled proportionally using DrawingML without shifting tables or overflowing margins.

---

## 🔒 Privacy & Security

- **Zero Cloud Storage**: All form data and uploaded images are processed entirely in memory in the user's browser.
- **No Third-Party Analytics**: No external tracking scripts, advertising SDKs, or remote telemetry.
- **Safe Filenames**: Automatically generates standardized filenames: `Arrest_Form_<AccusedCode>_<Date>.docx`.
- **Local Draft Recovery**: Drafts are stored solely in the browser's `localStorage` and can be exported as `.json` or cleared at any time.

---

*Form III (Rule 11.2) — Government of Maharashtra / State Police Documentation System*
