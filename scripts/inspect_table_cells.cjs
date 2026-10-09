const fs = require('fs');
const JSZip = require('jszip');

async function inspectTable() {
  const buf = fs.readFileSync('public/template/arrest-form-master.docx');
  const zip = await JSZip.loadAsync(buf);
  const docXmlStr = await zip.file('word/document.xml').async('text');
  const tblMatch = docXmlStr.match(/<w:tbl[\s\S]*?<\/w:tbl>/)[0];
  const trMatches = tblMatch.match(/<w:tr[\s\S]*?<\/w:tr>/g) || [];
  console.log('Total table rows:', trMatches.length);
  trMatches.forEach((tr, rIdx) => {
    const tcMatches = tr.match(/<w:tc[\s\S]*?<\/w:tc>/g) || [];
    console.log(`Row ${rIdx} has ${tcMatches.length} cells`);
    tcMatches.forEach((tc, cIdx) => {
      const pMatches = tc.match(/<w:p[\s\S]*?<\/w:p>/g) || [];
      const textMatches = tc.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || [];
      const text = textMatches.map(t => t.replace(/<[^>]+>/g, '')).join('').trim();
      const emptyPCount = pMatches.filter(p => !/<w:t[^>]*>/.test(p) || p.replace(/<[^>]+>/g, '').trim() === '').length;
      if (emptyPCount > 0) {
        console.log(`  Cell (${rIdx},${cIdx}) has ${pMatches.length} paragraphs (${emptyPCount} empty) text: "${text}"`);
      }
    });
  });
}

inspectTable().catch(console.error);
