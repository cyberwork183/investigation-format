import fs from 'fs';

const files = {
  FORM3: 'public/template/arrest-form-master.docx',
  REMAND: 'public/template/remand-application-master.docx',
  MEDICAL: 'public/template/medical-letter-master.docx',
  LOCKUP_PS: 'public/template/lockup-placement-ps-master.docx',
  LOCKUP_ACP: 'public/template/lockup-placement-acp-master.docx',
  CUSTODY_TRANSFER: 'public/template/custody-transfer-master.docx',
  ARREST_PERMISSION: 'public/template/arrest-permission-master.docx'
};

let content = '/**\n * allTemplatesBase64.js\n * Embedded Base64 backups of master DOCX templates for offline/zero-fetch resilience\n */\n\n';

for (const [key, path] of Object.entries(files)) {
  const buf = fs.readFileSync(path);
  const b64 = buf.toString('base64');
  content += `export const ${key}_TEMPLATE_BASE64 = "${b64}";\n\n`;
}

fs.writeFileSync('src/utils/allTemplatesBase64.js', content, 'utf8');
console.log('Generated src/utils/allTemplatesBase64.js successfully');
