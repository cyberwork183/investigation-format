# Form III — Arrest / Court Surrender Form Generator
### (अटकेचा पंचनामा / न्यायालयाच्या स्वाधीन होण्याचा नमुना)

A web application designed for police officers and authorized personnel to complete official **Form III (Arrest / Court Surrender Memo)** through a modern, institutional React web interface while generating **official Microsoft Word (.docx) documents with 100% fidelity, typography, and page layout preservation**.

Hosted & Ready for **Vercel** • Powered by **React 18 + Vite** • **100% Client-Side Privacy**

---

## 🚀 Quick Start

### One-Click Launch (Windows)
Double-click `start.bat` in the root folder. It will automatically verify Node.js, install dependencies if needed, start the local server, and open `http://localhost:3000` in your default browser.

### Via Command Line
```bash
# 1. Install dependencies
npm install

# 2. Run local development server (with auto-browser open)
npm run dev -- --open

# 3. Build for production (output in dist/)
npm run build
```

---

## 🏛️ Core Principles

1. **Master Template Immutability**:
   The master template (`public/template/arrest-form-master.docx` and `arrest form_templete.docx`) is strictly read-only and preserved. The generator modifies its internal OpenXML WordprocessingML structure in-memory using `JSZip` and outputs an authentic document with zero formatting loss.

2. **No HTML-to-Word Re-generation**:
   Does **NOT** use HTML-to-DOCX conversion. Preserves official bilingual text (Marathi & English), table structures (`TBL58` with all 25 physical features), borders, signatures, and DrawingML accused photograph placement.

3. **100% Client-Side Privacy**:
   No backend servers, no cloud databases, no external trackers. All sensitive accused personal details and case records remain strictly within the user's browser session.

---

## 🌐 Deploying to Vercel

The project is pre-configured for **Vercel** via `vercel.json`:
1. Push to GitHub (`https://github.com/cyberwork183/investigation-format.git`).
2. Import repository in [Vercel](https://vercel.com).
3. Vercel auto-detects `Vite`:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Deploy with one click.

---

## 📖 Complete Technical Documentation

For complete technical specifications, architectural details, OpenXML data mapping, and handover instructions for future developers or AI models, see:

👉 **[`PROJECT_HANDOVER_AND_ARCHITECTURE.md`](./PROJECT_HANDOVER_AND_ARCHITECTURE.md)**
