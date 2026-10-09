import fs from 'fs';
import JSZip from 'jszip';

async function parseDoc(filename) {
  const buffer = fs.readFileSync(filename);
  const zip = await JSZip.loadAsync(buffer);
  const docXml = await zip.file('word/document.xml').async('text');
  
  let out = `\n======================================================\nFILE: ${filename}\n======================================================\n`;
  
  // Extract all paragraphs with their w:t text
  const pList = docXml.match(/<w:p[\s>][\s\S]*?<\/w:p>/g) || [];
  pList.forEach((p, idx) => {
    const texts = [];
    const tRegex = /<w:t[\s>]([^<]*)<\/w:t>|<w:t\s[^>]*>([^<]*)<\/w:t>/g;
    let tm;
    while ((tm = tRegex.exec(p)) !== null) {
      texts.push(tm[1] || tm[2] || '');
    }
    const fullText = texts.join('').trim();
    const hasPb = p.includes('w:type="page"') || p.includes('<w:lastRenderedPageBreak');
    const isSectPr = p.includes('<w:sectPr');
    if (fullText || hasPb || isSectPr) {
      out += `P#${idx + 1}: ${hasPb ? '[PAGE BREAK] ' : ''}${isSectPr ? '[SECT] ' : ''}${fullText}\n`;
    }
  });
  return out;
}

async function run() {
  let all = '';
  all += await parseDoc('medical letter 108-2025.docx');
  all += await parseDoc('अटकेची परवानगी.docx');
  all += await parseDoc('पोलीस कोठडी रिमांड.docx');
  fs.writeFileSync('tests/detailed_parsed.txt', all, 'utf8');
  console.log('Saved detailed_parsed.txt');
}

run();
