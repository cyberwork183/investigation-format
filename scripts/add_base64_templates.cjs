const fs = require('fs');

function getBase64(file) {
  return fs.readFileSync(file).toString('base64');
}

const b35 = getBase64('३५(२) नोटीस चेकलिस्ट.docx');
const bSanha = getBase64('अटक सान्हा.docx');
const b47 = getBase64('४७ नोटीस.docx');
const b48 = getBase64('४८ नोटीस.docx');

let current = fs.readFileSync('src/utils/allTemplatesBase64.js', 'utf8');

if (!current.includes('NOTICE_35_2_TEMPLATE_BASE64')) {
  current += '\nexport const NOTICE_35_2_TEMPLATE_BASE64 = \'' + b35 + '\';\n' +
    'export const ATAK_SANHA_TEMPLATE_BASE64 = \'' + bSanha + '\';\n' +
    'export const NOTICE_47_TEMPLATE_BASE64 = \'' + b47 + '\';\n' +
    'export const NOTICE_48_TEMPLATE_BASE64 = \'' + b48 + '\';\n';
  fs.writeFileSync('src/utils/allTemplatesBase64.js', current, 'utf8');
  console.log('Successfully added base64 templates to allTemplatesBase64.js');
} else {
  console.log('Templates already present in allTemplatesBase64.js');
}
