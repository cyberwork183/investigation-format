# Police Investigation Document Generator
### (पोलीस तपासणी व कायदेशीर दस्तऐवज प्रणाली)

An institutional web application built for police officers, cyber crime investigators, and authorized law enforcement personnel to generate official, court-ready **Investigation & Legal Documents** directly in **Microsoft Word (.docx)** format with **100% typography, layout fidelity, and bilingual (Marathi/English) formatting**.

Hosted & Ready for **Vercel** • Powered by **React 18 + Vite** • **100% In-Browser Client-Side Privacy**

---

## 🔒 Absolute Data Privacy & Zero Third-Party Transmission

> ### ⚠️ STRICT CLIENT-SIDE ARCHITECTURE GUARANTEE
> 
> - **100% Local In-Browser Processing**: **ALL** data entry, business logic, form validation, photo processing, OpenXML `.docx` parsing, and document assembly happen **exclusively inside the user's web browser**.
> - **Zero Server Storage**: There is **NO backend server**, **NO cloud database**, **NO remote logging**, and **NO server-side data persistence**.
> - **NO Third-Party Transmission**: Absolutely **NO sensitive case details, FIR numbers, accused particulars, bank account details, or victim information are ever transmitted, sent, or uploaded to any third-party APIs, analytics, or external servers**.
> - **Session-Only Memory**: Shared form details and input states reside only in volatile browser memory / session storage and are never tracked or saved across persistent browser sessions.

---

## 📑 Supported Investigation Documents (11 Official Formats)

The application organizes 11 official police documents into **4 main dashboard categories**:

1. **अटक व ताबा (Arrest & Custody)**
   - **Form III — Arrest / Court Surrender Memo (अटकेचा पंचनामा / न्यायालयाच्या स्वाधीन होण्याचा नमुना)**: Full 17-section statutory memo with 25 physical features, property search, risk assessment, and embedded photograph.
   - **३५(२) नोटीस चेकलिस्ट (BNSS Section 35(2) Notice Checklist)**: Procedural compliance checklist for arrest under Section 35(2) BNSS.
   - **अटक सान्हा (Arrest Sanha / GD Entry Extract)**: Official station diary arrest sanha documentation.
   - **४७ नोटीस (Section 47 BNSS Notice)**: Statutory intimation notice under Section 47 BNSS with money trail & court production.
   - **४८ नोटीस (Section 48 BNSS Notice)**: Statutory intimation notice under Section 48 BNSS.

2. **पोलीस कोठडी रिमांड (Police Custody Remand - PCR)**
   - **पोलीस कोठडी रिमांड अर्ज (Police Custody Remand Application)**: Comprehensive Magisterial court remand application with 11-point summary table, money trail details, and statutory grounds.

3. **अटकेची परवानगी (Permission to Arrest)**
   - **अटकेची परवानगी मिळणेबाबत अर्ज (Permission to Arrest Application)**: Formal application submitted to the learned Magistrate seeking custody and arrest permission.

4. **वैद्यकीय तपासणी व बंदीगृह पत्रे (Medical & Custody Letters)**
   - **वैद्यकीय तपासणी अर्ज (Medical Examination Request Letter)**: Letter to District Civil Surgeon / Medical Officer for pre/post-arrest medical fitness.
   - **पोलीस ठाणे बंदीगृह विनंती पत्र (Lockup Placement Request - Police Station)**: Request letter to neighboring Police Station for lockup accommodation.
   - **सहा. पोलीस आयुक्त माहिती पत्र (Lockup Placement Intimation - ACP)**: Intimation letter to Assistant Commissioner of Police (ACP Crime).
   - **आरोपी ताबा मिळणे पत्र (Custody Transfer / Release Request)**: Request letter to retrieve accused from another station lockup for court presentation.

---

## 🚀 Quick Start

### One-Click Launch (Windows)
Double-click `start.bat` in the root folder. It will verify Node.js, install dependencies if needed, launch the local Vite server, and open `http://localhost:3000` in your default browser.

### Via Command Line
```bash
# 1. Install dependencies
npm install

# 2. Run local development server (with auto-browser open)
npm run dev

# 3. Run full automated audit and test suite
node tests/test_share_details_full_audit.cjs

# 4. Build for production (output in dist/)
npm run build
```

---

## 🏛️ Core Principles

1. **High-Fidelity OpenXML DOCX Generation**:
   Does **NOT** use lossy HTML-to-Word converters. Operates directly on the internal OpenXML WordprocessingML structure of official master `.docx` templates using `JSZip`, preserving exact police margins, tables, font metrics (Aparajita / Mangal / Times New Roman), and official seals.

2. **Bidirectional Share Details Feature**:
   Every document form contains a dedicated **Share Details (माहिती शेअर करा)** button. Entering details in any document (such as Police Station, Crime No, Accused Name, Age, Address, Investigating Officer, Bank Details) automatically propagates those non-empty values into matching fields across all other documents, while protecting existing custom entries from accidental overwrites.

3. **Master Template Immutability**:
   Official master templates in `public/template/` and embedded Base64 strings in `src/utils/allTemplatesBase64.js` ensure 100% offline generation capability without external network dependencies.

---

## 🌐 Deploying to Vercel

The project is pre-configured for static deployment on **Vercel** via `vercel.json`:
1. Push repository to GitHub.
2. Import repository in [Vercel](https://vercel.com).
3. Vercel automatically detects `Vite`:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Deploy with one click. Zero backend setup required.

---

## 📖 Complete Technical Documentation

For complete architectural details, OpenXML data mapping, test suites, and handover instructions for developers or AI models, refer to:

👉 **[`PROJECT_HANDOVER_AND_ARCHITECTURE.md`](./PROJECT_HANDOVER_AND_ARCHITECTURE.md)**
