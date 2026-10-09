# Multi-Document Police Document Generator
## Complete Project Handover, System Architecture & Developer Documentation

> **Document Purpose**: This document provides an exhaustive, authoritative technical guide to the entire **Multi-Document Police Document Generator (पोलीस तपासणी दस्तऐवज प्रणाली)** project. Any developer or AI model continuing this work can read this document to understand the codebase, design principles, data models, document-generation engine, and deployment setup.

---

## 1. Project Overview & Business Logic

### What is the Multi-Document Police Document Generator?
In Indian law enforcement and criminal legal procedure (governed by the Bharatiya Nagarik Suraksha Sanhita (BNSS), Bharatiya Nyaya Sanhita (BNS), Information Technology Act, and State Police Acts), investigating police officers must prepare multiple statutory applications, panchanamas, and custody correspondence with strict formatting and precise legal details.

This web application provides a unified, institutional, 100% client-side platform to generate all official police investigation documents directly in Microsoft Word (`.docx`) format, ready for immediate printing, court submission, and hospital correspondence.

### Supported Document Categories (4 Main Dashboard Categories)

The application dashboard is structured into **4 main intuitive document categories**:

1. **Arrest & Custody (अटक व पंचनामा)**:
   - **Arrest / Court Surrender Form — Form III (अटकेचा पंचनामा)**: Full 17-section bilingual statutory memo with 25 physical features, property search, risk assessment, and embedded passport photograph.
2. **Court Remand (न्यायालयीन कोठडी)**:
   - **Police Custody Remand Application — PCR (पोलीस कोठडी रिमांड अर्ज)**: Official Marathi application for Magisterial court with bank transactions, crime brief, and remand prayer.
3. **Court Permission (अटकेची परवानगी)**:
   - **Permission to Arrest Application (अटकेची परवानगी मिळणेबाबत अर्ज)**: Official letter submitted to the learned Magistrate seeking formal custody and arrest permission.
4. **Medical & Custody Letters (वैद्यकीय तपासणी व बंदीगृह पत्रे)**:
   - **Medical Examination Request Letter (वैद्यकीय तपासणी अर्ज)**: Addressed to District Civil Surgeon / Medical Officer for pre/post-arrest medical fitness.
   - **Lockup Placement Request (पोलीस ठाणे बंदीगृह विनंती पत्र)**: Letter to neighboring Police Station Senior Inspector requesting lockup space when local lockup is unavailable.
   - **Lockup Placement Intimation (सहा. पोलीस आयुक्त माहिती पत्र)**: Intimation letter to the Assistant Commissioner of Police (ACP Crime).
   - **Accused Custody Transfer / Release Request (आरोपी ताबा मिळणे पत्र)**: Official request to retrieve accused from another station's lockup for court presentation.

---

## 2. Core Architecture Principles

1. **100% Client-Side Privacy & Offline Capability**:
   - Zero server-side databases or backend APIs.
   - All case data and photos reside strictly in the user's browser memory and local storage (`localStorage`).
   - Master Word templates (`.docx`) are loaded via local fetch or embedded Base64 strings in [`src/utils/allTemplatesBase64.js`](file:///c:/Project/Api_sir_Work/investigation-format/src/utils/allTemplatesBase64.js) for 100% offline generation.
2. **Master Design System Consistency**:
   - All document forms follow the exact institutional layout, typography, section banners, card containers, input controls, and bilingual labels pioneered by the Form III master design.
3. **High-Fidelity OpenXML DOCX Generation**:
   - Does NOT use lossy HTML-to-Word converters.
   - Manipulates the true WordprocessingML XML (`word/document.xml`) of official master templates using [JSZip](https://stuk.github.io/jszip/).
   - Preserves all official police tables, borders, font metrics (Aparajita / Mangal / Times New Roman), court headers, and seals.
4. **Zero-Friction "Share Details" Synchronizer**:
   - Single "Share Details" button available on every form.
   - Collects common fields (Police Station, Crime No., Year, Acts/Sections, Accused Name, Age, Address, Investigating Officer Name & Rank) into a shared profile.
   - Automatically pre-populates matching fields across all other document forms.

---

## 3. Technology Stack & Dependencies

| Layer | Technology | Version | Purpose |
|:---|:---|:---|:---|
| **Frontend Framework** | React | `^18.3.1` | Reactive UI, controlled form inputs, modular components |
| **DOM Renderer** | React DOM | `^18.3.1` | Mounts React application into `#root` in `index.html` |
| **Build Tool & Bundler** | Vite | `^6.0.1` | High-speed local dev server, production bundling with Rollup |
| **Vite Plugin** | `@vitejs/plugin-react` | `^4.3.4` | Fast Refresh and JSX transformation |
| **DOCX Packaging** | JSZip | `^3.10.1` | Browser-side unzipping and packing of OpenXML `.docx` files |
| **Styling** | Vanilla CSS (`src/styles.css`) | Custom | Institutional design system, responsive grid, accessible theme |
| **Deployment Target** | Vercel | Production | Static Jamstack deployment |

---

## 4. Repository Structure

```
c:\Project\Api_sir_Work\investigation-format\
├── .gitignore                      # Excludes node_modules/, dist/, environment and log files
├── index.html                      # Root HTML entry point
├── package.json                    # Project metadata, dependencies, scripts
├── package-lock.json               # Locked dependency tree
├── PROJECT_HANDOVER_AND_ARCHITECTURE.md  # Comprehensive handover & architecture doc
├── README.md                       # Quickstart guide
├── start.bat                       # One-click Windows startup script (auto-opens browser)
├── vercel.json                     # Vercel deployment configuration
├── vite.config.js                  # Vite configuration file
│
├── public/                         # Static assets served at root /
│   ├── assets/
│   │   └── emblem.svg              # Official state/police seal emblem icon
│   └── template/                   # Master official Word templates
│       ├── arrest-form-master.docx
│       ├── arrest-permission-master.docx
│       ├── custody-transfer-master.docx
│       ├── lockup-placement-acp-master.docx
│       ├── lockup-placement-ps-master.docx
│       ├── medical-letter-master.docx
│       ├── medical-pre-arrest-master.docx
│       └── remand-application-master.docx
│
├── src/                            # Application React source code
│   ├── main.jsx                    # Application entry point (ReactDOM.createRoot)
│   ├── App.jsx                     # Top-level state coordinator, router, and modal manager
│   ├── styles.css                  # Institutional design system CSS
│   │
│   ├── components/                 # UI components
│   │   ├── Header.jsx              # Institutional header with logo, title, Home & Clear actions
│   │   ├── DocumentDashboard.jsx   # 4-card document selector dashboard
│   │   ├── StepNavigation.jsx      # Multi-step navigation sidebar for Form III
│   │   ├── SecurityBanner.jsx      # Privacy & local processing banner
│   │   ├── ClearModal.jsx          # Reset confirmation dialog
│   │   ├── Toast.jsx               # Floating toast alert notification
│   │   │
│   │   ├── forms/                  # Dedicated form screens for each document
│   │   │   ├── Form3Wizard.jsx             # Form III full 8-step wizard
│   │   │   ├── RemandForm.jsx              # Police Custody Remand (PCR) form
│   │   │   ├── ArrestPermissionForm.jsx    # Permission to Arrest application form
│   │   │   └── MedicalAndCustodyView.jsx   # Category 4 selector + sub-forms for Medical/Lockup letters
│   │   │
│   │   └── panels/                 # Form III 8-step wizard panels
│   │       ├── Step1CaseInfo.jsx
│   │       ├── Step2ArrestCourt.jsx
│   │       ├── Step3ActsStatus.jsx
│   │       ├── Step4AccusedParticulars.jsx
│   │       ├── Step5PhysicalFeatures.jsx
│   │       ├── Step6CustodyArticles.jsx
│   │       ├── Step7SocioEconomic.jsx
│   │       └── Step8WitnessesOfficerReview.jsx
│   │
│   └── utils/                      # Core business logic and document generators
│       ├── caseManager.js          # Cross-form Share Details synchronization engine
│       ├── formData.js             # Form III data schema and defaults
│       ├── validation.js           # Form validation rules
│       ├── imageHandler.js         # Passport photo scaling, canvas conversion & ArrayBuffer builder
│       ├── allTemplatesBase64.js   # Embedded Base64 strings of all 7 master templates
│       ├── docxGenerator.js        # Form III OpenXML generator & photo injector
│       │
│       └── docxGenerators/         # Generator modules for all legal letters
│           ├── commonDocxUtils.js              # XML escaping, namespace integrity, run/break replacer
│           ├── generateRemandDocx.js           # PCR application generator
│           ├── generateArrestPermissionDocx.js # Permission to arrest generator
│           ├── generateMedicalDocx.js          # Medical examination letter generator
│           ├── generateLockupPsDocx.js         # Lockup placement to PS generator
│           ├── generateLockupAcpDocx.js        # Lockup placement to ACP generator
│           └── generateCustodyTransferDocx.js  # Custody transfer/release generator
│
└── tests/                          # Automated verification and XML regression test suite
    ├── test_all_docx.cjs           # End-to-end XML validity test for all 7 generators
    └── ...
```

---

## 5. Share Details System Architecture

In [`src/utils/caseManager.js`](file:///c:/Project/Api_sir_Work/investigation-format/src/utils/caseManager.js):
- **Storage Key**: `SHARED_CASE_PROFILE`.
- **Functionality**:
  - `saveSharedProfile(data)`: Extracts non-empty canonical fields (`policeStation`, `crimeNo`, `crimeYear`, `actsSections`, `accusedName`, `accusedAge`, `accusedAddress`, `accusedFather`, `accusedAlias`, `ioName`, `ioRank`, `ioStation`, `letterDate`) and persists them.
  - `loadSharedProfile()`: Returns the latest shared dictionary.
  - `populateFromShared(targetFormState)`: Merges shared profile values into the target form without overwriting existing non-empty unique fields.
- **UI Interaction**:
  - Every form includes a **"🔗 Share Details"** button alongside the Primary Generate/Download action. Clicking it syncs values immediately and displays a confirmation toast.

---

## 6. Official DOCX Generation Engine & OpenXML Integrity

### XML Namespace Standard Compliance
All generated documents adhere strictly to standard WordprocessingML schemas. The utility [`ensureXmlNamespaces`](file:///c:/Project/Api_sir_Work/investigation-format/src/utils/docxGenerators/commonDocxUtils.js) ensures the `<w:document>` root element contains all required namespace declarations:
```xml
<w:document 
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" 
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" 
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" 
  xmlns:v="urn:schemas-microsoft-com:vml" 
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" 
  xmlns:w10="urn:schemas-microsoft-com:office:word" 
  xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" 
  xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
  xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006">
```
*This eliminates Microsoft Word startup errors ("Word experienced an error trying to open the file").*

### High-Fidelity Replacement Strategy
1. **Paragraph-Level Match & Replace**:
   - `replaceParagraphTextByMatch(docXml, predicateOrSnippet, newText)` extracts `<w:pPr>` and `<w:rPr>` to preserve original font styles, weights, alignment, and spacing.
   - Formats multi-line text cleanly with `<w:r>${rPr}<w:br/><w:t ...>` elements.
2. **Passport Photo Embedding (Form III)**:
   - In [`src/utils/imageHandler.js`](file:///c:/Project/Api_sir_Work/investigation-format/src/utils/imageHandler.js), photos are normalized onto a canvas (white background), resized to passport dimensions, and injected into `word/media/image1.png` with a DrawingML inline shape (`cx = 1097280`, `cy = 1371600` EMUs).

---

## 7. How to Run, Build & Deploy

### A. One-Click Launch (Windows)
Double-click [`start.bat`](file:///c:/Project/Api_sir_Work/investigation-format/start.bat) in the project root. It will verify Node.js, install dependencies if missing, start Vite, and open `http://localhost:3000` automatically.

### B. Command Line Operations
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run automated DOCX XML validation suite
node tests/test_all_docx.cjs

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### C. Deploy to Vercel
1. Push repository to GitHub: `https://github.com/cyberwork183/investigation-format.git`.
2. Link project to [Vercel](https://vercel.com).
3. Vercel automatically detects [`vercel.json`](file:///c:/Project/Api_sir_Work/investigation-format/vercel.json) and builds using `npm run build` outputting to `dist/`.

---

## 8. Golden Rules for Future Developers & AI Models

1. **DO NOT Replace OpenXML Engine with HTML-to-Word/PDF Converters**:
   Court memos and police registers require pixel-perfect margins, official Devanagari typography, and specific legal layouts. Always manipulate the official master Word XML.
2. **DO NOT Introduce a Server-Side Database**:
   Police FIR and accused particulars are legally confidential. The entire application MUST remain 100% client-side.
3. **Preserve Master Template Immutability**:
   Always keep master template files in `public/template/` synchronized with their Base64 fallbacks in [`src/utils/allTemplatesBase64.js`](file:///c:/Project/Api_sir_Work/investigation-format/src/utils/allTemplatesBase64.js).
4. **Maintain 4-Card Dashboard Hierarchy**:
   Keep top-level navigation organized into the 4 core categories: (1) Arrest Form III, (2) Court Remand PCR, (3) Court Permission, (4) Medical & Custody Letters.
5. **Always Run XML Validation Before Commits**:
   Ensure `node tests/test_all_docx.cjs` and `npm run build` pass cleanly.
