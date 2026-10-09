import fs from 'fs';
import JSZip from 'jszip';

async function dumpDocStructure(filename) {
  const buffer = fs.readFileSync(filename);
  const zip = await JSZip.loadAsync(buffer);
  const docXml = await zip.file('word/document.xml').async('text');
  
  let out = `\n======================================================\nDETAILED STRUCTURE FOR: ${filename}\n======================================================\n`;
  const elemRegex = /<(w:p|w:tbl)(?:\s|>)(?:[\s\S]*?)(?:<\/\1>|\/>)/g;
  let match;
  let idx = 0;
  while ((match = elemRegex.exec(docXml)) !== null) {
    const raw = match[0];
    const tag = match[1];
    const text = raw.replace(/<[^>]+>/g, '').trim();
    const hasPageBreak = raw.includes('w:type="page"') || raw.includes('<w:lastRenderedPageBreak');
    const isSectPr = raw.includes('<w:sectPr');
    out += `[${idx}] <${tag}> ${hasPageBreak ? '[PB] ' : ''}${isSectPr ? '[SECT] ' : ''}"${text}"\n`;
    idx++;
  }
  return out;
}

async function run() {
  let all = '';
  all += await dumpDocStructure('medical letter 108-2025.docx');
  all += await dumpDocStructure('अटकेची परवानगी.docx');
  all += await dumpDocStructure('पोलीस कोठडी रिमांड.docx');
  fs.writeFileSync('tests/structure_utf8.txt', all, 'utf8');
}

run();
