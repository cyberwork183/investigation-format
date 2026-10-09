const fs = require('fs');
const JSZip = require('jszip');
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');

async function inspectDocx() {
  const masterPath = 'public/template/arrest-form-master.docx';
  const data = fs.readFileSync(masterPath);
  const zip = await JSZip.loadAsync(data);
  const docXml = await zip.file('word/document.xml').async('text');

  const parser = new DOMParser();
  const xml = parser.parseFromString(docXml, 'application/xml');
  const body = xml.getElementsByTagName('w:body')[0] || xml.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'body')[0];

  const children = Array.from(body.childNodes).filter(n => n.nodeType === 1);
  console.log(`Total top-level body elements in Form III master: ${children.length}`);

  children.forEach((node, i) => {
    const tagName = node.tagName || node.nodeName;
    const text = node.textContent?.replace(/\s+/g, ' ').trim() || '';
    const pPr = node.getElementsByTagName ? (node.getElementsByTagName('w:pPr')[0] || node.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'pPr')[0]) : null;
    
    let pPrInfo = [];
    if (pPr) {
      const spacing = pPr.getElementsByTagName ? (pPr.getElementsByTagName('w:spacing')[0] || pPr.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'spacing')[0]) : null;
      if (spacing) {
        const before = spacing.getAttribute('w:before') || spacing.getAttributeNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'before');
        const after = spacing.getAttribute('w:after') || spacing.getAttributeNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'after');
        const line = spacing.getAttribute('w:line') || spacing.getAttributeNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'line');
        const lineRule = spacing.getAttribute('w:lineRule') || spacing.getAttributeNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'lineRule');
        pPrInfo.push(`spacing(bef:${before}, aft:${after}, line:${line}, rule:${lineRule})`);
      }
      const pageBreakBefore = pPr.getElementsByTagName ? (pPr.getElementsByTagName('w:pageBreakBefore')[0] || pPr.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'pageBreakBefore')[0]) : null;
      if (pageBreakBefore) pPrInfo.push('PAGE_BREAK_BEFORE');
      const keepNext = pPr.getElementsByTagName ? (pPr.getElementsByTagName('w:keepNext')[0] || pPr.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'keepNext')[0]) : null;
      if (keepNext) pPrInfo.push('KEEP_NEXT');
      const keepLines = pPr.getElementsByTagName ? (pPr.getElementsByTagName('w:keepLines')[0] || pPr.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'keepLines')[0]) : null;
      if (keepLines) pPrInfo.push('KEEP_LINES');
    }

    const brs = node.getElementsByTagName ? Array.from(node.getElementsByTagName('w:br')).concat(Array.from(node.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'br'))) : [];
    const pageBrs = brs.filter(b => b.getAttribute('w:type') === 'page' || b.getAttributeNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'type') === 'page');
    if (pageBrs.length > 0) pPrInfo.push(`PAGE_BREAK_BR(${pageBrs.length})`);

    const isTable = tagName.endsWith('tbl');
    if (isTable) {
      const trs = node.getElementsByTagName ? node.getElementsByTagName('w:tr') : [];
      pPrInfo.push(`TABLE(rows:${trs.length})`);
    }

    const preview = text.length > 60 ? text.substring(0, 60) + '...' : text;
    console.log(`[${i}] <${tagName}> ${pPrInfo.join(' ')} | "${preview}"`);
  });
}

inspectDocx().catch(console.error);
