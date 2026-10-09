const fs = require('fs');
const JSZip = require('jszip');

async function simulateFix() {
  const buf = fs.readFileSync('public/template/arrest-form-master.docx');
  const zip = await JSZip.loadAsync(buf);
  let docXmlStr = await zip.file('word/document.xml').async('text');

  console.log('=== BEFORE FIX ===');
  console.log('Page breaks in XML:', (docXmlStr.match(/<w:br[^>]*w:type="page"[^>]*\/>/g) || []).length);
  console.log('Empty paragraphs in XML:', (docXmlStr.match(/<w:p\b[^>]*>(?:<w:pPr>[\s\S]*?<\/w:pPr>)?\s*<\/w:p>/g) || []).length);

  // Parse and manipulate with xmldom or regex
  // Let's test the exact DOM operations
}

simulateFix().catch(console.error);
