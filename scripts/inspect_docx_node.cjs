const fs = require('fs');
const JSZip = require('jszip');

async function inspectMaster() {
  const buf = fs.readFileSync('public/template/arrest-form-master.docx');
  const zip = await JSZip.loadAsync(buf);
  const docXmlStr = await zip.file('word/document.xml').async('text');
  
  // Extract paragraphs and tables
  // We can match <w:p ...>...</w:p> and <w:tbl ...>...</w:tbl>
  const bodyMatch = docXmlStr.match(/<w:body[\s\S]*<\/w:body>/);
  if (!bodyMatch) {
    console.log('No body found');
    return;
  }
  const bodyXml = bodyMatch[0];

  // Regex to parse children of body
  const elementRegex = /<(w:p|w:tbl|w:sectPr)[\s\S]*?<\/\1>|<(w:sectPr)[\s\S]*?\/>/g;
  let match;
  let idx = 0;

  console.log('=== FORM III MASTER ELEMENTS ANALYSIS ===\n');

  while ((match = elementRegex.exec(bodyXml)) !== null) {
    const fullTag = match[0];
    const tagName = match[1] || match[2];

    // Extract text
    const textMatches = fullTag.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || [];
    const text = textMatches.map(t => t.replace(/<[^>]+>/g, '')).join('').replace(/\s+/g, ' ').trim();

    // Spacing
    const spacingMatch = fullTag.match(/<w:spacing([^>]*?)\/>/);
    let spacingStr = '';
    if (spacingMatch) {
      const before = (spacingMatch[1].match(/w:before="([^"]+)"/) || [])[1] || '0';
      const after = (spacingMatch[1].match(/w:after="([^"]+)"/) || [])[1] || '0';
      const line = (spacingMatch[1].match(/w:line="([^"]+)"/) || [])[1] || 'auto';
      const lineRule = (spacingMatch[1].match(/w:lineRule="([^"]+)"/) || [])[1] || '';
      spacingStr = `spacing(bef:${before}, aft:${after}, line:${line}, rule:${lineRule})`;
    }

    const pageBreakBefore = /<w:pageBreakBefore\/>/.test(fullTag);
    const keepNext = /<w:keepNext\/>/.test(fullTag);
    const keepLines = /<w:keepLines\/>/.test(fullTag);
    const pageBrs = (fullTag.match(/<w:br[^>]*w:type="page"[^>]*\/>/g) || []).length;
    const isTable = tagName === 'w:tbl';
    let tableInfo = '';
    if (isTable) {
      const trCount = (fullTag.match(/<w:tr[\s>]/g) || []).length;
      const cantSplitCount = (fullTag.match(/<w:cantSplit\/>/g) || []).length;
      tableInfo = `TABLE(rows:${trCount}, cantSplit:${cantSplitCount})`;
    }

    const isEmptyPara = !isTable && text === '';

    const flags = [];
    if (isEmptyPara) flags.push('[EMPTY_PARA]');
    if (pageBreakBefore) flags.push('[PAGE_BREAK_BEFORE]');
    if (pageBrs > 0) flags.push(`[PAGE_BR x${pageBrs}]`);
    if (keepNext) flags.push('[KEEP_NEXT]');
    if (keepLines) flags.push('[KEEP_LINES]');
    if (spacingStr) flags.push(`[${spacingStr}]`);
    if (tableInfo) flags.push(`[${tableInfo}]`);

    console.log(`[${String(idx).padStart(3, ' ')}] <${tagName}> ${flags.join(' ')} | "${text.substring(0, 70)}"`);
    idx++;
  }

  // Also check styles.xml
  if (zip.file('word/styles.xml')) {
    const stylesXml = await zip.file('word/styles.xml').async('text');
    console.log('\n=== STYLES.XML DEFAULT SPACING ===');
    const docDefaults = stylesXml.match(/<w:docDefaults>[\s\S]*?<\/w:docDefaults>/);
    if (docDefaults) {
      console.log(docDefaults[0]);
    }
  }

  // Also check sectPr
  const sectPrMatch = bodyXml.match(/<w:sectPr[\s\S]*?<\/w:sectPr>/);
  if (sectPrMatch) {
    console.log('\n=== SECTION PROPERTIES ===');
    console.log(sectPrMatch[0]);
  }
}

inspectMaster().catch(console.error);
