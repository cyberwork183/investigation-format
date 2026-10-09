# Form III — Arrest / Court Surrender Form Generator
## Complete Project Handover, System Architecture & Developer Documentation
> **Document Purpose**: This document provides an exhaustive, authoritative technical guide to the entire **Arrest / Court Surrender Form (Form III) Generator (अटकेचा पंचनामा)** project. Any developer or AI model continuing this work can read this document to understand the codebase, design principles, data models, document-generation engine, and deployment setup.

---

## 1. Project Overview & Business Logic

### What is Form III?
In Indian law enforcement and legal procedure, **Form III** is the official statutory **Arrest / Court Surrender Memo (अटकेचा पंचनामा / न्यायालयाच्या स्वाधीन होण्याचा नमुना)**. It is a legally sensitive, official document created by investigating police officers when an accused person is arrested, surrendered before court, or remanded to custody.

### Core Problem Solved
Historically, police officers had to manually type or handwrite multiple copies of Form III onto physical pre-printed forms or edit fragile Word documents. Any slight mistake in Word formatting or table layout breaks margins, shifts legal tables, or introduces blank pages.
This web application provides:
1. An **accessible, institutional, bilingual (English & Marathi) multi-step web interface**.
2. **100% Client-Side Privacy**: No server-side storage, databases, or external APIs. All case and accused data remains strictly in the user's browser.
3. **High-Fidelity Official DOCX Generation**: Directly manipulates the official WordprocessingML XML structure of the original master Word template (`arrest-form-master.docx`). It preserves all official borders, fonts, bilingual labels, table dimensions, signatures, and embeds accused photographs.

---

## 2. Project Evolution & Major Milestones

### Phase 1: Initial Vanilla Implementation
- Originally built using vanilla HTML5 (`index.html`), CSS3 (`styles.css`), and JavaScript (`js/` directory).
- Utilized client-side JSZip to unpack the master template and update XML nodes.

### Phase 2: DOCX Layout & Page Break Diagnosis
- Investigated empty gaps and awkward page breaks in the generated DOCX.
- Discovered that the raw template contained hard page breaks (`<w:br w:type="page"/>`) after Section 7 (Injuries) and Section 9 (Physical Features table). When user text expanded, sections overflowed slightly, triggering artificial cliff page breaks.
- Verified document integrity with Microsoft Word COM automation and Python OpenXML analysis.

### Phase 3: Frontend Migration to React 18 + Vite
- Performed migration from vanilla HTML/CSS/JS to **React 18 + Vite** using modern functional components and React Hooks.
- **Strictly preserved 100% of the UI design, color palette, typography, form fields, and responsive layout**.
- Modularized panels into dedicated step components (`Step1CaseInfo` through `Step8WitnessesOfficerReview`).
- Migrated data utilities into clean ES modules under `src/utils/`.

### Phase 4: Vercel Deployment Configuration
- Configured project for zero-configuration deployment on **Vercel**:
  - `vite.config.js` sets build output to `dist/`.
  - `vercel.json` declares the Vite framework.
  - Master template and emblem moved to `public/` for reliable static asset serving at the root URL.

### Phase 5: One-Click Startup Automation
- Created [`start.bat`](file:///c:/Project/Arrest%20Form/start.bat) for Windows users: checks for Node.js, auto-installs dependencies if missing, starts the Vite development server, and automatically opens the browser at `http://localhost:3000`.

### Phase 6: Code Cleanup & GitHub Push
- Removed legacy scratch and test files.
- Added [`.gitignore`](file:///c:/Project/Arrest%20Form/.gitignore) to protect `node_modules/` and build artifacts.
- Committed and pushed to GitHub: [https://github.com/cyberwork183/investigation-format.git](https://github.com/cyberwork183/investigation-format.git).

---

## 3. Technology Stack & Key Dependencies

| Layer | Technology | Version | Purpose |
|:---|:---|:---|:---|
| **Framework** | React | `^18.3.1` | Reactive UI, controlled form inputs, state synchronization |
| **DOM Renderer** | React DOM | `^18.3.1` | Mounts React application into `#root` in `index.html` |
| **Build Tool & Server** | Vite | `^6.0.1` | Ultra-fast local dev server, production bundling with Rollup |
| **Vite Plugin** | `@vitejs/plugin-react` | `^4.3.4` | Fast Refresh and JSX transformation |
| **DOCX Zip Engine** | JSZip | `^3.10.1` | Browser-side unzipping and packaging of OpenXML `.docx` files |
| **Styling** | Vanilla CSS (`src/styles.css`) | Custom | Institutional design system, accessible colors, responsive layout |
| **Deployment Target** | Vercel | Production | Static Jamstack deployment |

**Deliberate Constraints**:
- **No Tailwind CSS**: The institutional design system uses curated CSS variables and custom utility classes.
- **No UI Component Libraries** (MUI, AntD, Chakra): Keeps bundle lightweight and styling faithful to government guidelines.
- **No Backend / Database**: Keeps the entire application serverless and private.

---

## 4. Repository Directory Structure

```
c:\Project\Arrest Form\
├── .gitignore                      # Excludes node_modules/, dist/, environment and log files
├── arrest form_templete.docx       # Original master template (Source of Truth reference)
├── index.html                      # Root HTML entry point for Vite mounting #root
├── package.json                    # Project metadata, dependencies, scripts
├── package-lock.json               # Locked dependency tree
├── PROJECT_HANDOVER_AND_ARCHITECTURE.md  # This comprehensive handover document
├── README.md                       # Repository overview and quickstart guide
├── start.bat                       # One-click Windows startup script (auto-opens browser)
├── vercel.json                     # Vercel deployment configuration
├── vite.config.js                  # Vite configuration file
│
├── public/                         # Static assets served at root /
│   ├── assets/
│   │   └── emblem.svg              # Official state/police seal emblem icon
│   └── template/
│       └── arrest-form-master.docx # Master Word template loaded by the browser generator
│
├── src/                            # Application React source code
│   ├── main.jsx                    # Application entry point (ReactDOM.createRoot)
│   ├── App.jsx                     # Top-level state coordinator and lifecycle manager
│   ├── styles.css                  # Institutional design system CSS
│   │
│   ├── components/                 # UI components
│   │   ├── Header.jsx              # Header with logo, title, Sample Data & Export buttons
│   │   ├── SecurityBanner.jsx      # Privacy & Master Template notice banner
│   │   ├── StepNavigation.jsx      # 8-step sidebar navigation with progress bar
│   │   ├── ReviewSummary.jsx       # Comprehensive summary screen with jump-to-edit links
│   │   ├── ClearModal.jsx          # Form reset confirmation dialog
│   │   ├── Toast.jsx               # Floating toast alert notification
│   │   │
│   │   └── panels/                 # Step-by-step form panels
│   │       ├── Step1CaseInfo.jsx               # Section 1: Jurisdiction, FIR, Year, Accused Code
│   │       ├── Step2ArrestCourt.jsx            # Section 2 & 3: Arrest Time, Station, Court
│   │       ├── Step3ActsStatus.jsx             # Section 4 & 5: Acts/Sections & 7 Legal Statuses
│   │       ├── Step4AccusedParticulars.jsx     # Section 6: Accused particulars, IDs, addresses
│   │       ├── Step5PhysicalFeatures.jsx       # Section 7 & 9: Injuries & 25 Physical Features
│   │       ├── Step6CustodyArticles.jsx        # Section 8, 9 & 10: Custody, Search & Intimation
│   │       ├── Step7SocioEconomic.jsx          # Section 11 & 12: Socio-Economic & Risk Assessment
│   │       └── Step8WitnessesOfficerReview.jsx # Section 13 & 14: Witnesses, Photo, Officer & Review
│   │
│   └── utils/                      # Core business logic and document generators
│       ├── formData.js             # Data schema, defaults, sample test data, localStorage persistence
│       ├── validation.js           # Section validation rules and accused code format regex
│       ├── imageHandler.js         # Passport photo scaling, canvas conversion, ArrayBuffer builder
│       ├── templateBase64.js       # Base64 fallback for the master DOCX template
│       └── docxGenerator.js        # Core OpenXML DOM manipulator and DOCX generator
│
└── dist/                           # Production build output generated by 'npm run build'
```

---

## 5. Form Structure & Section Mapping

Form III comprises 17 official statutory sections organized into 8 intuitive wizard steps:

### Step 1: Case Information (`Step1CaseInfo.jsx`)
- **State (`state`)**: Default `Maharashtra`.
- **District (`district`)**: e.g., `Nagpur City`.
- **Police Station (`policeStation`)**: e.g., `Cyber Police Station`.
- **FIR / Proceeding / G.D. No. (`firNo`)**: e.g., `89/2026`.
- **Year (`year`)**: 4-digit year.
- **Date (`date`)**: Registration date.
- **Alphanumeric Code of the Accused (`accusedCode`)**: Official format `A1` to `A9` for first 9 persons, `B1` for 10th person, etc. Validated via regex `^[A-Z][0-9]+$` or Marathi `^[\u0900-\u097F][0-9\u0966-\u096F]+$`.

### Step 2: Arrest & Court Details (`Step2ArrestCourt.jsx`)
- **Date of Arrest (`arrestDate`)** & **Time (`arrestTime`)**.
- **Station Diary / G.D. No. (`gdNo`)**.
- **Place of Arrest (`arrestPS`, `arrestDist`, `arrestState`)**.
- **Name of the Court (`courtName`)**: If surrendered directly before magistrate/court.

### Step 3: Acts, Sections & Arrest Status (`Step3ActsStatus.jsx`)
- **Acts and Sections (English) (`actsSections`)**: Applicable penal laws (e.g., BNS, IT Act).
- **Acts and Sections (Marathi) (`actsSectionsMr`)**.
- **Arrest / Surrender Status (`arrestStatus`)**: Index 0 to 6 representing one of 7 official legal conditions. In DOCX generation, placing `[√]` tick on the chosen status.

### Step 4: Particulars of the Accused (`Step4AccusedParticulars.jsx`)
- **Accused Name (`accusedName`)** & **Father's/Guardian's Name (`fatherName`)**.
- **Aliases (`firstAlias`, `secondAlias`)**.
- **Nationality (`nationality`)**: Default `Indian / भारतीय`.
- **Voter ID (`voterId`)** & **Passport (`passportNo`, `passportIssueDate`, `passportIssuePlace`)**.
- **Religion (`religion`)**, **Caste (`caste`)**, **Category (`category`)**, **Occupation (`occupation`)**.
- **Permanent Address (`permanentAddress`, `permState`, `permDist`, `permPS`)**.
- **Present Address (`presentAddress`, `presState`, `presDist`, `presPS`)**.

### Step 5: Physical Features Table & Injuries (`Step5PhysicalFeatures.jsx`)
- **Section 7: Injuries Details (`injuriesDetails`)**.
- **Section 9: Physical Features Grid (All 25 attributes mapped to table `TBL58`)**:
  1. `sex`, 2. `dob`, 3. `build`, 4. `height`, 5. `complexion`, 6. `idMark`, 7. `deformities`, 8. `teeth`, 9. `hair`, 10. `eye`, 11. `habits`, 12. `dressHabits`, 13. `languages`, 14. `burnMark`, 15. `leucoderma`, 16. `mole`, 17. `scar`, 18. `tattoo`, 19. `forehead`, 20. `ear`, 21. `nose`, 22. `moustaches`, 23. `speech`, 24. `face`, 25. `lips`.
- **Other Features (`otherFeatures`)**.

### Step 6: Custody, Search Articles & Intimation (`Step6CustodyArticles.jsx`)
- **Custody Confirmation (`custodyDate`, `custodyTime`, `custodyPlace`)**.
- **Articles Found on Physical Search (Articles 1 to 6) (`articles`)**:
  - `articlesNil` toggle: Checking "NIL" sets all 6 inputs to 'NIL' and disables them.
- **Intimation to Relative / Friend (`intimationName`, `intimationRelation`, `intimationAddress`)**.

### Step 7: Socio-Economic Profile & Police Observation (`Step7SocioEconomic.jsx`)
- **Fingerprint Taken? (`fingerprintTaken`, `fingerprintDetail`)**.
- **Living Status (`livingStatus`)**: 9 official options (Family, Alone, Pucca house, Hotel, Hostel, Kachcha, Thatched, Slum, Homeless).
- **Education (`education`)** & **Occupation (`socioOccupation`)**.
- **Income Group (`incomeGroup`)**: 6 income brackets (0 to 5).
- **Police Observation Yes/No Questions (9 parameters)**:
  `isDangerous`, `escapedBail`, `isArmed`, `operatesAccomplices`, `pastRecords`, `isRecidivist`, `likelyEscapeBail`, `likelyCommitCrime`, `wantedOtherCase`, and `otherCaseDetail`.

### Step 8: Witnesses, Officer Details & Review (`Step8WitnessesOfficerReview.jsx`)
- **Witness / Pancha 1 (`witness1Name`, `witness1Address`)**: Mandatory by law.
- **Witness / Pancha 2 (`witness2Name`, `witness2Address`)**: Optional.
- **Accused Photograph Upload Area**: Drag-and-drop or file selector, live preview, removal button.
- **Investigation Officer (`officerName`, `officerRank`, `officerNo`, `place`, `finalDate`)**.
- **Review Summary**: Full summary card rendering all entered data with jump-to-step Edit buttons.
- **Action Buttons**: Back to Edit Form & Generate Official DOCX.

---

## 6. Official DOCX Generation Engine Architecture

The document generator in [`src/utils/docxGenerator.js`](file:///c:/Project/Arrest%20Form/src/utils/docxGenerator.js) is the most critical subsystem.

### OpenXML WordprocessingML Namespaces
```javascript
const W_NS  = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const R_NS  = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const WP_NS = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing';
const A_NS  = 'http://schemas.openxmlformats.org/drawingml/2006/main';
const PIC_NS= 'http://schemas.openxmlformats.org/drawingml/2006/picture';
const CT_NS = 'http://schemas.openxmlformats.org/package/2006/content-types';
```

### Loading Strategy
1. Tries to fetch `/template/arrest-form-master.docx` from `public/`.
2. Fallback to `template/arrest-form-master.docx`.
3. If offline or on `file://`, falls back to embedded base64 in [`src/utils/templateBase64.js`](file:///c:/Project/Arrest%20Form/src/utils/templateBase64.js).

### Data Injection Methodology
- Unzips `word/document.xml`.
- Parses into a DOM tree using `DOMParser`.
- Identifies exact element indexes in `w:body` (elements 5, 7, 9, 11, 13, 15, 17, 21-38, 39, 41, 45-47, 52-53, 58, 59, 62, 65-75, 78-87, 91-96, 100-105).
- Updates run text `<w:t>` preserving existing run properties `<w:rPr>` (bold, font size, language fonts).
- Replaces placeholder dashes (`---`) or injects clean text runs.
- Places `[√]` checkmarks beside selected legal statuses and income groups.
- Updates table cells `<w:tc>` in Table 58 for physical features.

### Accused Photograph Injection
When a photograph is uploaded:
1. Adds `word/media/image1.png` to the zip file using the image's `ArrayBuffer`.
2. Modifies `[Content_Types].xml` to ensure PNG default extension is declared.
3. Modifies `word/_rels/document.xml.rels` to add a relationship:
   `<Relationship Id="rIdPhoto" Type=".../relationships/image" Target="media/image1.png"/>`.
4. Creates an inline DrawingML element (`<wp:inline>`) with exact passport dimensions:
   `cx = 1097280`, `cy = 1371600` EMUs (~3.5cm x 4.5cm).
5. Inserts the drawing run into the photo signature box (Element 101/102).

---

## 7. Image Processing Pipeline

In [`src/utils/imageHandler.js`](file:///c:/Project/Arrest%20Form/src/utils/imageHandler.js):
- **Validation**:
  - Maximum size: 5 MB (`MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024`).
  - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`.
- **Scaling & Normalization**:
  - Scales proportionally to max bounds (480 x 600 px).
  - Renders onto an HTML5 canvas with a white background (`#ffffff`) to avoid black borders on transparent PNGs.
  - Generates PNG DataURL (`canvas.toDataURL('image/png', 0.92)`).
  - Converts DataURL to an `ArrayBuffer` for byte-level injection into JSZip.

---

## 8. State Persistence & Privacy

- **Local Storage Key**: `ARREST_FORM_III_DRAFT`.
- **Debounced Auto-Save**: Whenever user modifies any field, saving to `localStorage` is debounced by 600ms.
- **Session Restoration**: When the user opens or refreshes the page, any active draft is loaded automatically.
- **Export Draft**: Allows saving the current form state as a standalone `.json` file (`Arrest_Form_Draft_<AccusedCode>_<Date>.json`).
- **Clear Form**: Modal confirmation clears localStorage and resets all fields to clean defaults.
- **Zero Network Transmission**: No form data is ever sent to any external server.

---

## 9. How to Run, Build & Deploy

### A. One-Click Launch (Windows)
Double-click [`start.bat`](file:///c:/Project/Arrest%20Form/start.bat) in the project root. It will install dependencies if needed, start the dev server, and open `http://localhost:3000`.

### B. Manual Commands (Terminal / CLI)
```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### C. Deploy to Vercel
1. Push repository to GitHub: `https://github.com/cyberwork183/investigation-format.git`.
2. Connect repository to [Vercel](https://vercel.com).
3. Vercel automatically detects [`vercel.json`](file:///c:/Project/Arrest%20Form/vercel.json):
   - **Framework**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Deployment completes in seconds.

---

## 10. Golden Rules for Future Developers & AI Models

1. **NEVER Replace DOCX Generator with HTML-to-DOCX**:
   Do not use libraries like `html-to-docx` or `html2pdf`. Form III is an official legal format with strict court and police requirements. It must always manipulate the master template XML.
2. **Do Not Introduce a Backend or Database**:
   The entire application is intentionally 100% client-side for strict legal privacy and zero server overhead.
3. **Preserve Master Template Immutability**:
   Do not delete or overwrite [`arrest form_templete.docx`](file:///c:/Project/Arrest%20Form/arrest%20form_templete.docx) or [`public/template/arrest-form-master.docx`](file:///c:/Project/Arrest%20Form/public/template/arrest-form-master.docx).
4. **Preserve Bilingual Typography**:
   All labels have Marathi Devanagari equivalents (e.g., `कायमचा पत्ता`, `अटकेची तारीख`). Ensure Marathi text and font encodings are preserved.
5. **Always Verify Builds**:
   Before committing, verify that `npm run build` succeeds cleanly.
