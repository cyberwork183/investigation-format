const fs = require('fs');
const JSZip = require('jszip');

async function inspectFirstHalf() {
  const buf = fs.readFileSync('public/template/arrest-form-master.docx');
  const zip = await JSZip.loadAsync(buf);
  const docXmlStr = await zip.file('word/document.xml').async('text');
  
  const bodyMatch = docXmlStr.match(/<w:body[\s\S]*<\/w:body>/);
  const bodyXml = bodyMatch[0];

  const elementRegex = /<(w:p|w:tbl|w:sectPr)[\s\S]*?<\/\1>|<(w:sectPr)[\s\S]*?\/>/g;
  let match;
  let idx = 0;

  while ((match = elementRegex.exec(bodyXml)) !== null) {
    const fullTag = match[0];
    const tagName = match[1] || match[2];

    const textMatches = fullTag.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || [];
    const text = textMatches.map(t => t.replace(/<[^>]+>/g, '')).join('').replace(/\s+/g, ' ').trim();

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
    if (spacingStr) flags.push(`[${spacingStr}]`);
    if (tableInfo) flags.push(`[${tableInfo}]`);

    if (idx <= 60) {
      console.log(`[${String(idx).padStart(3, ' ')}] <${tagName}> ${flags.join(' ')} | "${text.substring(0, 70)}"`);
    }
    idx++;
  }
}

inspectFirstHalf().catch(console.error);
