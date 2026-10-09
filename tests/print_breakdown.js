import fs from 'fs';
import JSZip from 'jszip';

async function printDocParagraphs(filename) {
  const buf = fs.readFileSync(filename);
  const zip = await JSZip.loadAsync(buf);
  const docXml = await zip.file('word/document.xml').async('text');
  
  let out = `\n======================================================\nPARAGRAPHS FOR: ${filename}\n======================================================\n`;

  const pRegex = /<w:p[\s>][\s\S]*?<\/w:p>/g;
  const pList = docXml.match(pRegex) || [];
  pList.forEach((p, idx) => {
    const tRegex = /<w:t[\s>]([^<]*)<\/w:t>|<w:t\s[^>]*>([^<]*)<\/w:t>/g;
    const texts = [];
    let tm;
    while ((tm = tRegex.exec(p)) !== null) {
      texts.push(tm[1] || tm[2] || '');
    }
    const clean = texts.join('').replace(/\s+/g, ' ').trim();
    if (clean) {
      out += `P${idx + 1}: ${clean}\n`;
    }
  });

  const tblRegex = /<w:tbl[\s>][\s\S]*?<\/w:tbl>/g;
  const tblList = docXml.match(tblRegex) || [];
  out += `Total tables: ${tblList.length}\n`;
  tblList.forEach((tbl, tIdx) => {
    out += `\n--- TABLE ${tIdx + 1} ---\n`;
    const trRegex = /<w:tr[\s>][\s\S]*?<\/w:tr>/g;
    const trList = tbl.match(trRegex) || [];
    trList.forEach((tr, rIdx) => {
      const tcRegex = /<w:tc[\s>][\s\S]*?<\/w:tc>/g;
      const tcList = tr.match(tcRegex) || [];
      const cells = tcList.map(tc => {
        const tRegex = /<w:t[\s>]([^<]*)<\/w:t>|<w:t\s[^>]*>([^<]*)<\/w:t>/g;
        const texts = [];
        let tm;
        while ((tm = tRegex.exec(tc)) !== null) {
          texts.push(tm[1] || tm[2] || '');
        }
        return texts.join('').replace(/\s+/g, ' ').trim();
      });
      out += `  Row ${rIdx + 1}: [ ${cells.join(' | ')} ]\n`;
    });
  });
  return out;
}

async function run() {
  let all = '';
  all += await printDocParagraphs('public/template/medical-letter-master.docx');
  all += await printDocParagraphs('public/template/lockup-placement-ps-master.docx');
  all += await printDocParagraphs('public/template/lockup-placement-acp-master.docx');
  all += await printDocParagraphs('public/template/custody-transfer-master.docx');
  all += await printDocParagraphs('public/template/arrest-permission-master.docx');
  all += await printDocParagraphs('public/template/remand-application-master.docx');
  fs.writeFileSync('tests/breakdown_utf8.txt', all, 'utf8');
  console.log('Saved tests/breakdown_utf8.txt');
}

run();
