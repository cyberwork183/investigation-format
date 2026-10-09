import fs from 'fs';
import JSZip from 'jszip';

async function verifyTemplate(filename) {
  const buf = fs.readFileSync(filename);
  const zip = await JSZip.loadAsync(buf);
  const docXml = await zip.file('word/document.xml').async('text');
  
  // Basic XML tag balancing check
  const pCount = (docXml.match(/<w:p[\s>]/g) || []).length;
  const pCloseCount = (docXml.match(/<\/w:p>/g) || []).length;
  const tCount = (docXml.match(/<w:t[\s>]/g) || []).length;
  
  // Extract clean text
  const pList = docXml.match(/<w:p[\s>][\s\S]*?<\/w:p>/g) || [];
  const lines = pList.map(p => {
    const tRegex = /<w:t[\s>]([^<]*)<\/w:t>|<w:t\s[^>]*>([^<]*)<\/w:t>/g;
    const texts = [];
    let tm;
    while ((tm = tRegex.exec(p)) !== null) {
      texts.push(tm[1] || tm[2] || '');
    }
    return texts.join('').trim();
  }).filter(Boolean);

  console.log(`\n======================================================`);
  console.log(`VERIFIED: ${filename}`);
  console.log(`Paragraphs: ${pCount} (closed: ${pCloseCount}), <w:t> runs: ${tCount}`);
  console.log(`First 3 lines:\n  1. ${lines[0]}\n  2. ${lines[1]}\n  3. ${lines[2]}`);
  console.log(`Last line:\n  ${lines[lines.length - 1]}`);
}

async function run() {
  const files = [
    'public/template/arrest-form-master.docx',
    'public/template/remand-application-master.docx',
    'public/template/medical-letter-master.docx',
    'public/template/lockup-placement-ps-master.docx',
    'public/template/lockup-placement-acp-master.docx',
    'public/template/custody-transfer-master.docx',
    'public/template/arrest-permission-master.docx'
  ];
  for (const f of files) {
    await verifyTemplate(f);
  }
}

run();
