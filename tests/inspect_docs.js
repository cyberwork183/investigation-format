import fs from 'fs';
import JSZip from 'jszip';

async function inspectDoc(filename) {
  console.log('====================================================');
  console.log('=== ' + filename + ' ===');
  console.log('====================================================');
  const buffer = fs.readFileSync(filename);
  const zip = await JSZip.loadAsync(buffer);
  const docXml = await zip.file('word/document.xml').async('text');
  
  const pRegex = /<w:p(?:\s|>).*?<\/w:p>/g;
  const pMatches = docXml.match(pRegex) || [];
  
  for (const p of pMatches) {
    const hasPageBreak = p.includes('w:type="page"');
    const hasSectPr = p.includes('<w:sectPr');
    const tMatches = p.match(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g) || [];
    const text = tMatches.map(t => t.replace(/<[^>]+>/g, '')).join('');
    
    let meta = [];
    if (hasPageBreak) meta.push('[PAGE BREAK]');
    if (hasSectPr) meta.push('[SECTION BREAK]');
    
    if (text.trim() || meta.length > 0) {
      console.log((meta.length ? meta.join(' ') + ' ' : '') + text);
    }
  }
}

async function run() {
  await inspectDoc('medical letter 108-2025.docx');
  await inspectDoc('अटकेची परवानगी.docx');
  await inspectDoc('पोलीस कोठडी रिमांड.docx');
}

run().catch(console.error);
