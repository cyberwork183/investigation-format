const fs = require('fs');
const JSZip = require('jszip');

async function fixTemplates() {
  const dir = 'public/template';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.docx'));
  for (const f of files) {
    const filePath = dir + '/' + f;
    const buf = fs.readFileSync(filePath);
    const zip = await JSZip.loadAsync(buf);
    let docXml = await zip.file('word/document.xml')?.async('text');
    if (docXml) {
      if (!docXml.includes('xmlns:w14=')) {
        docXml = docXml.replace('<w:document ', '<w:document xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" ');
        zip.file('word/document.xml', docXml);
        const newBuf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
        fs.writeFileSync(filePath, newBuf);
        console.log('Fixed master template:', f);
      }
    }
  }

  // Also update src/utils/allTemplatesBase64.js
  const outBase64Path = 'src/utils/allTemplatesBase64.js';
  const base64Code = `/**
 * allTemplatesBase64.js
 * Embedded Base64 strings of all official DOCX master templates
 * Ensures 100% offline generation in case network fetch is unavailable.
 */

export const ARREST_FORM_TEMPLATE_BASE64 = '${fs.readFileSync("public/template/arrest-form-master.docx").toString("base64")}';
export const REMAND_TEMPLATE_BASE64 = '${fs.readFileSync("public/template/remand-application-master.docx").toString("base64")}';
export const ARREST_PERMISSION_TEMPLATE_BASE64 = '${fs.readFileSync("public/template/arrest-permission-master.docx").toString("base64")}';
export const MEDICAL_TEMPLATE_BASE64 = '${fs.readFileSync("public/template/medical-letter-master.docx").toString("base64")}';
export const LOCKUP_PS_TEMPLATE_BASE64 = '${fs.readFileSync("public/template/lockup-placement-ps-master.docx").toString("base64")}';
export const LOCKUP_ACP_TEMPLATE_BASE64 = '${fs.readFileSync("public/template/lockup-placement-acp-master.docx").toString("base64")}';
export const CUSTODY_TRANSFER_TEMPLATE_BASE64 = '${fs.readFileSync("public/template/custody-transfer-master.docx").toString("base64")}';
`;
  fs.writeFileSync(outBase64Path, base64Code, 'utf8');
  console.log('Updated src/utils/allTemplatesBase64.js successfully');

}

fixTemplates().catch(console.error);
