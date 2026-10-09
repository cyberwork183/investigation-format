import fs from 'fs';
import JSZip from 'jszip';

async function analyzeDocx(filename) {
  let out = `\n############################################################\nFILE: ${filename}\n############################################################\n\n`;
  const buffer = fs.readFileSync(filename);
  const zip = await JSZip.loadAsync(buffer);
  const docXml = await zip.file('word/document.xml').async('text');
  
  const pRegex = /<w:p(?:\s|>).*?<\/w:p>/g;
  let match;
  let pIndex = 0;
  
  while ((match = pRegex.exec(docXml)) !== null) {
    pIndex++;
    const p = match[0];
    const hasPageBreak = p.includes('w:type="page"') || p.includes('<w:lastRenderedPageBreak');
    const hasSectPr = p.includes('<w:sectPr');
    const tMatches = p.match(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g) || [];
    const text = tMatches.map(t => t.replace(/<[^>]+>/g, '')).join('');
    
    let tags = [];
    if (hasPageBreak) tags.push('*** PAGE BREAK ***');
    if (hasSectPr) tags.push('*** SECTION BREAK ***');
    
    if (tags.length > 0) {
      out += `\n--- [P${pIndex}] ${tags.join(' ')} ---\n`;
    }
    if (text.trim()) {
      out += `[P${pIndex}] ${text}\n`;
    }
  }
  return out;
}

async function run() {
  let all = '';
  all += await analyzeDocx('arrest form_templete.docx');
  all += await analyzeDocx('medical letter 108-2025.docx');
  all += await analyzeDocx('अटकेची परवानगी.docx');
  all += await analyzeDocx('पोलीस कोठडी रिमांड.docx');
  fs.writeFileSync('tests/analysis_utf8.txt', all, 'utf8');
  console.log('Written to tests/analysis_utf8.txt successfully');
}

run().catch(console.error);
