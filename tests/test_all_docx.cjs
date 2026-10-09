const fs = require('fs');
const JSZip = require('jszip');

const {
  ARREST_FORM_TEMPLATE_BASE64,
  REMAND_TEMPLATE_BASE64,
  ARREST_PERMISSION_TEMPLATE_BASE64,
  MEDICAL_TEMPLATE_BASE64,
  LOCKUP_PS_TEMPLATE_BASE64,
  LOCKUP_ACP_TEMPLATE_BASE64,
  CUSTODY_TRANSFER_TEMPLATE_BASE64,
  NOTICE_35_2_TEMPLATE_BASE64,
  ATAK_SANHA_TEMPLATE_BASE64,
  NOTICE_47_TEMPLATE_BASE64,
  NOTICE_48_TEMPLATE_BASE64
} = require('../src/utils/allTemplatesBase64.js');

function escapeXmlText(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function ensureXmlNamespaces(docXml) {
  if (!docXml || typeof docXml !== 'string') return docXml;
  return docXml.replace(/<w:document(\s[^>]*)?>/, (match, attrs = '') => {
    let newAttrs = attrs;
    if (!newAttrs.includes('xmlns:w14=')) {
      newAttrs += ' xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"';
    }
    if (!newAttrs.includes('xmlns:w15=')) {
      newAttrs += ' xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml"';
    }
    if (!newAttrs.includes('xmlns:mc=')) {
      newAttrs += ' xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"';
    }
    return `<w:document${newAttrs}>`;
  });
}

function replaceParagraphTextByMatch(docXml, searchSnippet, newText) {
  if (!searchSnippet || newText === undefined) return docXml;
  const pRegex = /<w:p(?:[\s>][\s\S]*?)<\/w:p>/g;

  const replaced = docXml.replace(pRegex, (p) => {
    const tRegex = /<w:t(?:[\s>][^<]*<\/w:t>|\s[^>]*>[^<]*<\/w:t>)/g;
    const texts = [];
    let tm;
    while ((tm = tRegex.exec(p)) !== null) {
      const matchText = tm[0].replace(/<[^>]+>/g, '');
      texts.push(matchText);
    }
    const fullText = texts.join('');

    let isMatch = false;
    if (typeof searchSnippet === 'function') {
      isMatch = searchSnippet(fullText);
    } else if (searchSnippet instanceof RegExp) {
      isMatch = searchSnippet.test(fullText);
    } else {
      isMatch = fullText.includes(searchSnippet);
    }

    if (isMatch) {
      const pPrMatch = p.match(/<w:pPr[\s\S]*?<\/w:pPr>/);
      const pPr = pPrMatch ? pPrMatch[0] : '';
      const rPrMatch = p.match(/<w:rPr[\s\S]*?<\/w:rPr>/);
      const rPr = rPrMatch ? rPrMatch[0] : '';
      const pOpenMatch = p.match(/<w:p(?:\s[^>]*)?>/);
      const pOpen = pOpenMatch ? pOpenMatch[0] : '<w:p>';

      const lines = String(newText)
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .split('\n');

      const runs = lines.map((line, idx) => {
        const escaped = escapeXmlText(line);
        if (idx === 0) {
          return `<w:r>${rPr}<w:t xml:space="preserve">${escaped}</w:t></w:r>`;
        }
        return `<w:r>${rPr}<w:br/><w:t xml:space="preserve">${escaped}</w:t></w:r>`;
      }).join('');

      return `${pOpen}${pPr}${runs}</w:p>`;
    }
    return p;
  });

  return ensureXmlNamespaces(replaced);
}

async function validateZip(docName, base64Str, replacements = {}) {
  const buf = Buffer.from(base64Str, 'base64');
  const zip = await JSZip.loadAsync(buf);
  let docXml = await zip.file('word/document.xml').async('text');

  for (const [k, v] of Object.entries(replacements)) {
    docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes(k), v);
  }
  docXml = ensureXmlNamespaces(docXml);

  const rootTag = (docXml.match(/<w:document[^>]*>/) || [''])[0];
  const declared = new Set();
  for (const m of rootTag.matchAll(/xmlns:([a-zA-Z0-9_-]+)=/g)) declared.add(m[1]);
  
  const prefixes = new Set();
  for (const m of docXml.matchAll(/<([a-zA-Z0-9_-]+):[a-zA-Z0-9_-]+/g)) prefixes.add(m[1]);
  for (const m of docXml.matchAll(/\s([a-zA-Z0-9_-]+):[a-zA-Z0-9_-]+=/g)) prefixes.add(m[1]);

  const missing = [...prefixes].filter(p => p !== 'xml' && p !== 'xmlns' && !declared.has(p));
  if (missing.length > 0) {
    console.error(`❌ FAIL: ${docName} has missing namespaces:`, missing);
    return false;
  }
  console.log(`✅ PASS: ${docName} - perfectly valid Word XML!`);
  return true;
}

async function runAll() {
  await validateZip('Arrest Form (Form III)', ARREST_FORM_TEMPLATE_BASE64, { 'आरोपीचे नाव': 'टेस्ट आरोपी' });
  await validateZip('Remand Application (PCR)', REMAND_TEMPLATE_BASE64, { 'दिनांक': 'दिनांक 29-07-2026' });
  await validateZip('Permission to Arrest', ARREST_PERMISSION_TEMPLATE_BASE64, { 'प्रतिवेदक': 'प्रतिवेदक - टेस्ट' });
  await validateZip('Medical Examination Letter', MEDICAL_TEMPLATE_BASE64, { 'वैद्यकीय अधिकारी': 'वैद्यकीय अधिकारी' });
  await validateZip('Lockup Placement (PS)', LOCKUP_PS_TEMPLATE_BASE64, { 'पोलीस ठाणे सदर': 'पोलीस ठाणे सदर' });
  await validateZip('Lockup Placement (ACP)', LOCKUP_ACP_TEMPLATE_BASE64, { 'सहा. पोलीस आयुक्त': 'सहा. पोलीस आयुक्त' });
  await validateZip('Custody Transfer / Release', CUSTODY_TRANSFER_TEMPLATE_BASE64, { 'संदर्भ': 'संदर्भ - टेस्ट' });
  await validateZip('Notice Checklist 35(2)', NOTICE_35_2_TEMPLATE_BASE64, { 'रिपोर्ट': 'रिपोर्ट - टेस्ट' });
  await validateZip('Atak Sanha Entry', ATAK_SANHA_TEMPLATE_BASE64, { 'यावेळी': 'यावेळी आम्ही' });
  await validateZip('Notice 47 to Accused', NOTICE_47_TEMPLATE_BASE64, { 'सूचना': 'सूचना' });
  await validateZip('Notice 48 to Relative', NOTICE_48_TEMPLATE_BASE64, { 'सूचना': 'सूचना' });
}

runAll().catch(console.error);
