# Multi-Document Police Investigation Document Generator
## Complete Project Handover, System Architecture & Developer Documentation

> **Document Purpose**: This document serves as the authoritative, comprehensive technical manual and handover document for the **Multi-Document Police Investigation Document Generator (पोलीस तपासणी व कायदेशीर दस्तऐवज प्रणाली)**. Any engineer, maintainer, or AI system working on this codebase should refer to this document for understanding architecture, privacy guarantees, data flows, OpenXML document generation, and verification standards.

---

## 1. Executive Summary & Privacy Architecture

### 🔒 100% In-Browser Execution & Zero Data Transmission Guarantee

This application was engineered with a strict **Local-First, Zero-Trust Privacy Guarantee** designed specifically for law enforcement compliance:

1. **All Computation Happens in the User's Browser**:
   - **Form Rendering & State**: Fully managed in React client memory.
   - **Photo Processing & Canvas Normalization**: Handled in-memory via HTML5 Canvas API.
   - **OpenXML Parsing & Generation**: Performed entirely client-side using `JSZip` and DOMParser/XMLSerializer.
   - **Document Download**: Triggered directly in the browser via standard Blob URL creation (`URL.createObjectURL`).

2. **No Data Stored on Server or Database**:
   - There is **no backend server**, **no REST/GraphQL API**, **no cloud database (SQL/NoSQL)**, and **no remote file storage**.
   - No sensitive information (such as Accused Name, Address, Phone Numbers, FIR/Crime Numbers, Medical History, Seized Property, Bank Account & UTR Details, or Police Officers' Identifiers) is ever stored outside the local browser session.

3. **No Third-Party Transmission or Telemetry**:
   - **Zero external API calls**: The application makes **zero network requests** to third-party endpoints or telemetry trackers.
   - All master `.docx` templates are packaged directly inside the application bundle and embedded as Base64 strings in [`src/utils/allTemplatesBase64.js`](file:///c:/Project/Cyber-Cell/investigation-format/src/utils/allTemplatesBase64.js) for 100% offline capability.

4. **Session-Only Memory & Reset Isolation**:
   - Shared data across forms is held in transient browser memory and session storage (`sessionStorage`), which is immediately cleared when the user closes the browser or clicks the "नवीन फॉर्म / Clear" button.

---

## 2. Supported Documents & Dashboard Organization

The website supports **11 official statutory and investigation documents**, neatly arranged under **4 main dashboard categories**:

```
                                  [ MAIN DASHBOARD ]
                                          │
       ┌──────────────────┬───────────────┴───────────────┬──────────────────┐
       ▼                  ▼                               ▼                  ▼
┌──────────────┐   ┌──────────────┐               ┌──────────────┐   ┌──────────────┐
│  Category 1  │   │  Category 2  │               │  Category 3  │   │  Category 4  │
│  अटक व ताबा  │   │ पोलीस कोठडी  │               │ अटकेची       │   │  वैद्यकीय व  │
│  (Arrest &   │   │ रिमांड (PCR) │               │ परवानगी      │   │ बंदीगृह पत्रे│
│   Custody)   │   │              │               │(Permission)  │   │ (Med/Lockup) │
└──────┬───────┘   └──────┬───────┘               └──────┬───────┘   └──────┬───────┘
       │                  │                              │                  │
       ├─ Form III        └─ Remand Application          └─ Permission      ├─ Medical Letter
       ├─ Notice 35(2)       (११ कलमी गोषवारा)              to Arrest       ├─ Lockup Letter (PS)
       ├─ Atak Sanha                                                        ├─ Lockup Letter (ACP)
       ├─ Notice 47                                                         └─ Custody Transfer
       └─ Notice 48
```

### Detailed Document Index

| # | Document Name | Document ID | Category | Statutory Purpose |
|---|---|---|---|---|
| 1 | **Form III (Arrest Memo)** | `form3` | Arrest & Custody | Statutory 17-section arrest/surrender memo with 25 physical features and photo. |
| 2 | **३५(२) नोटीस चेकलिस्ट** | `notice_35_2` | Arrest & Custody | BNSS Section 35(2) procedural compliance checklist for cognizable offenses. |
| 3 | **अटक सान्हा** | `atak_sanha` | Arrest & Custody | Station diary general entry (Sanha) recording formal arrest. |
| 4 | **४७ नोटीस** | `notice_47` | Arrest & Custody | Intimation notice under Section 47 BNSS with money trail and court production. |
| 5 | **४८ नोटीस** | `notice_48` | Arrest & Custody | Statutory intimation notice under Section 48 BNSS. |
| 6 | **पोलीस कोठडी रिमांड अर्ज** | `remand` | Police Custody Remand | Magisterial court remand application with 11-point table and investigation grounds. |
| 7 | **अटकेची परवानगी अर्ज** | `arrest_permission` | Permission to Arrest | Application to the learned Magistrate seeking custody and arrest permission. |
| 8 | **वैद्यकीय तपासणी अर्ज** | `medical` | Medical & Custody | Formal requisition to Civil Surgeon / Medical Officer for medical fitness examination. |
| 9 | **बंदीगृह विनंती पत्र (PS)** | `lockup_ps` | Medical & Custody | Requisition to neighboring police station for accused lockup accommodation. |
| 10 | **माहिती पत्र (ACP)** | `lockup_acp` | Medical & Custody | Official lockup placement intimation to the Assistant Commissioner of Police. |
| 11 | **आरोपी ताबा मिळणे पत्र** | `custody_transfer` | Medical & Custody | Requisition to retrieve accused from another lockup for court presentation. |

---

## 3. Technology Stack

| Component | Library / Tool | Version | Responsibility |
|---|---|---|---|
| **UI Framework** | React | `^18.3.1` | Declarative UI, state management, controlled multi-step wizards |
| **DOM Renderer** | React DOM | `^18.3.1` | Mounting root tree in `index.html` |
| **Bundler / Server** | Vite | `^6.0.1` | Lightning-fast development server, HMR, and Rollup production bundling |
| **Babel/JSX Plugin** | `@vitejs/plugin-react` | `^4.3.4` | JSX compilation and React Fast Refresh |
| **DOCX Engine** | JSZip | `^3.10.1` | In-memory ZIP archive reading and writing for `.docx` OpenXML packages |
| **Styling** | Vanilla CSS | Custom | Institutional design system, responsive grid layout, accessible contrast |
| **Hosting Platform** | Vercel | Production | Static Jamstack zero-configuration global CDN hosting |

---

## 4. Repository Structure & Key Files

```
c:\Project\Cyber-Cell\investigation-format\
├── README.md                                 # User overview & quickstart
├── PROJECT_HANDOVER_AND_ARCHITECTURE.md     # This comprehensive handover guide
├── index.html                                # Main single-page entry point
├── package.json                              # Project dependencies and npm scripts
├── vite.config.js                            # Vite build and server config
├── vercel.json                               # Vercel deployment routing config
├── original_docx_templates/                  # Archived original source Word (.docx) templates
│   ├── arrest form_templete.docx
│   ├── medical letter 108-2025.docx
│   ├── अटक सान्हा.docx
│   ├── अटकेची परवानगी.docx
│   ├── पोलीस कोठडी रिमांड.docx
│   ├── ३५(२) नोटीस चेकलिस्ट.docx
│   ├── ४७ नोटीस.docx
│   └── ४८ नोटीस.docx
│
├── public/                                   # Static assets
│   ├── assets/
│   │   └── emblem.svg                        # Maharashtra / Police emblem SVG
│   └── template/                             # Master Word (.docx) templates
│       ├── arrest-form-master.docx           # Form III Master Template
│       ├── remand-application-master.docx    # PCR Remand Master Template
│       ├── arrest-permission-master.docx     # Arrest Permission Master Template
│       ├── medical-letter-master.docx        # Medical Examination Letter
│       ├── lockup-placement-ps-master.docx   # Lockup Request PS
│       ├── lockup-placement-acp-master.docx  # Lockup Intimation ACP
│       ├── custody-transfer-master.docx      # Custody Transfer Request
│       ├── notice-35-2-master.docx           # Notice 35(2) Checklist
│       ├── atak-sanha-master.docx            # Atak Sanha Master Template
│       ├── notice-47-master.docx             # Notice 47 Master Template
│       └── notice-48-master.docx             # Notice 48 Master Template
│
├── src/                                      # Application Source Code
│   ├── main.jsx                              # React root mounting
│   ├── App.jsx                               # Top-level state coordinator, routing, and sharing handler
│   ├── styles.css                            # Unified responsive CSS design system
│   │
│   ├── components/                           # UI Components
│   │   ├── Header.jsx                        # Institutional header with badge, navigation, and reset
│   │   ├── Dashboard.jsx                     # 4-category responsive dashboard and document selector
│   │   ├── StepNavigation.jsx                # Step indicator for multi-step wizards
│   │   ├── SecurityBanner.jsx                # In-browser privacy and local processing badge
│   │   ├── Toast.jsx                         # Floating notification toast
│   │   ├── ClearModal.jsx                    # Session reset confirmation dialog
│   │   │
│   │   ├── forms/                            # Dedicated document form components
│   │   │   ├── Form3Wizard.jsx               # Form III 8-step wizard
│   │   │   ├── RemandForm.jsx                # Remand 5-step application
│   │   │   ├── ArrestPermissionForm.jsx      # Permission to Arrest form
│   │   │   ├── MedicalLetterForm.jsx         # Medical Requisition form
│   │   │   ├── LockupPsForm.jsx              # Lockup PS form
│   │   │   ├── LockupAcpForm.jsx             # Lockup ACP form
│   │   │   ├── CustodyTransferForm.jsx       # Custody Transfer form
│   │   │   ├── Notice352Form.jsx             # Notice 35(2) Checklist form
│   │   │   ├── AtakSanhaForm.jsx             # Atak Sanha form
│   │   │   ├── Notice47Form.jsx              # Notice 47 form
│   │   │   └── Notice48Form.jsx              # Notice 48 form
│   │   │
│   │   └── panels/                           # Form III specific section panels (Steps 1 to 8)
│   │
│   └── utils/                                # Business logic and DOCX generators
│       ├── shareDetails.js                   # Central Share Details mapping, extraction & non-overwrite merge
│       ├── documentRegistry.js               # Metadata, category mapping, and default states for all 11 documents
│       ├── documentValidation.js             # Validation rules for each document type
│       ├── allTemplatesBase64.js             # Embedded Base64 strings of all 11 master templates (100% offline)
│       ├── imageHandler.js                   # Accused photo canvas normalization & ArrayBuffer conversion
│       ├── docxGenerator.js                  # Form III OpenXML builder
│       │
│       └── docxGenerators/                   # Dedicated OpenXML generators for all other documents
│           ├── commonDocxUtils.js            # Shared XML escaping, paragraph matching, and namespace integrity
│           ├── generateRemandDocx.js
│           ├── generateArrestPermissionDocx.js
│           ├── generateMedicalDocx.js
│           ├── generateLockupPsDocx.js
│           ├── generateLockupAcpDocx.js
│           ├── generateCustodyTransferDocx.js
│           ├── generateNotice352Docx.js
│           ├── generateAtakSanhaDocx.js
│           ├── generateNotice47Docx.js
│           ├── generateNotice48Docx.js
│           └── index.js                      # Centralized DOCX generation and download dispatcher
│
└── tests/                                    # Automated end-to-end verification suites
    └── test_share_details_full_audit.cjs     # End-to-end CDP test for Share Details, isolation & conflict protection
```

---

## 5. Share Details Engine Architecture

The Share Details system is implemented in [`src/utils/shareDetails.js`](file:///c:/Project/Cyber-Cell/investigation-format/src/utils/shareDetails.js):

### A. Bidirectional Data Flow
1. When a user clicks **Share Details (माहिती शेअर करा)** in any form:
   - `extractSharedDetailsFromDoc(docId, docData)` parses all non-empty fields into normalized keys.
   - `applySharedDetailsToDoc(targetDocId, currentTargetData, sharedPool)` merges compatible values **only into empty fields** in all other 10 document forms.
2. **Conflict / Non-Overwrite Protection**:
   - If a target form already contains a non-empty value (e.g. customized address or specific letter date), it is **never silently overwritten**.
3. **Partial Form Support**:
   - Sharing operates regardless of whether a form is partially or fully filled.

### B. Shared Canonical Fields
- **Case Information**: `crimeNo`, `policeStation`, `district`, `state`, `year`, `date`, `actsSections`, `courtName`.
- **Accused Particulars**: `accusedName`, `accusedAge`, `accusedAddress`, `accusedFather`, `accusedAlias`, `arrestDate`, `arrestTime`, `arrestDateTime`.
- **Investigating Officer**: `ioName`, `ioRank`, `ioStation`, `ioBeltNo`, `ioPhone`.
- **Complainant Particulars**: `complainantName`, `complainantAge`, `complainantProfession`, `complainantAddress`, `caseBrief`.
- **Financial & Money Trail**: `bankName`, `accountNo`, `branchName`, `txnId`, `txnAmount`, `accountName`, `accountAddress`, `companyName`, `directorsDetails`, `totalFraudAmount`.
- **Relatives & Production**: `relativeName`, `relation`, `relativeAddress`, `relativePhone`, `relativeIntimation`, `productionWarrantDetails`, `producedFromJail`, `courtProductionDate`.

---

## 6. OpenXML DOCX Generation & Layout Preservation

### OpenXML Standards Compliance
Official Marathi court and police documents require exact line-spacing, margins, Devanagari typography (`Mangal`, `Aparajita`), and borders. The generator operates directly on `word/document.xml`:

1. **Namespace Guarantee**: [`ensureXmlNamespaces`](file:///c:/Project/Cyber-Cell/investigation-format/src/utils/docxGenerators/commonDocxUtils.js) verifies all standard WordprocessingML schemas (`w`, `r`, `m`, `v`, `wp`, `w10`, `a`, `pic`, `w14`, `w15`, `mc`) exist on `<w:document>`.
2. **Style & Run Preservation**: `replaceParagraphTextByMatch` and `replaceTextInTable` preserve parent `<w:pPr>` (paragraph properties) and `<w:rPr>` (run properties).
3. **Photo Embedding**: In Form III, photos are scaled onto an in-memory canvas, converted to PNG ArrayBuffer, and injected into `word/media/image1.png` referencing `rId` relationship.

---

## 7. Operational Guidelines for Future Developers & AI Assistants

1. **Never Add Server Storage or External Network APIs**:
   All state, data extraction, and document generation must remain 100% inside the user's browser runtime.
2. **Maintain OpenXML Template Integrity**:
   Do not substitute `JSZip` OpenXML generation with HTML-to-PDF or HTML-to-Word libraries.
3. **Preserve Bidirectional Field Sharing**:
   When adding new fields or templates, register them in `src/utils/documentRegistry.js`, `src/utils/shareDetails.js`, and the corresponding generator in `src/utils/docxGenerators/`.
4. **Run Verification Before Committing**:
   - `node tests/test_share_details_full_audit.cjs`
   - `npm run build`
