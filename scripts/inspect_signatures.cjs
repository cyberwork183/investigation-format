const fs = require('fs');
const JSZip = require('jszip');

async function inspectSigs() {
  const buf = fs.readFileSync('public/template/arrest-form-master.docx');
  const zip = await JSZip.loadAsync(buf);
  const docXmlStr = await zip.file('word/document.xml').async('text');
  
  const bodyXml = docXmlStr.match(/<w:body[\s\S]*<\/w:body>/)[0];
  const elementRegex = /<(w:p|w:tbl|w:sectPr)[\s\S]*?<\/\1>|<(w:sectPr)[\s\S]*?\/>/g;
  let match, idx = 0;
  while ((match = elementRegex.exec(bodyXml)) !== null) {
    if (idx >= 97) {
      console.log(`[${idx}] ${match[0]}\n`);
    }
    idx++;
  }
}

inspectSigs().catch(console.error);
