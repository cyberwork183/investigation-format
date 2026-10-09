import fs from 'fs';
import JSZip from 'jszip';

// Helper to replace text in an XML string safely
function replaceAllText(xml, search, replacement) {
  if (!search) return xml;
  // If exact match is found
  if (xml.includes(search)) {
    return xml.split(search).join(replacement);
  }
  return xml;
}

// Helper to replace run text inside paragraphs
function replaceInXmlParagraphs(docXml, replacements) {
  let updatedXml = docXml;
  for (const [key, val] of Object.entries(replacements)) {
    if (key && val !== undefined) {
      updatedXml = replaceAllText(updatedXml, key, val);
    }
  }
  return updatedXml;
}

async function testMedicalGenerator() {
  const buf = fs.readFileSync('public/template/medical-letter-master.docx');
  const zip = await JSZip.loadAsync(buf);
  let docXml = await zip.file('word/document.xml').async('text');

  // Let's test replacements:
  // Original date: "३०-०३-२०२६" -> "15-10-2026"
  // Original PS: "पोलीस ठाणे सायबर" -> "पोलीस ठाणे क्राईम"
  // Original Crime No: "108/2025" -> "45/2026"
  // Original Accused: "Premsukh @ Prem s/o Bhakar Ram, Age 20 years, Address – Jambeswar Nagari, village Motai, PS Chakhu, Dist. Phalodi, Rajasthan" -> "राहुल रमेश पाटील, वय २५ वर्षे, पत्ता – नागपूर"
  
  docXml = replaceAllText(docXml, '३०-०३-२०२६', '15-10-2026');
  docXml = replaceAllText(docXml, '108/2025', '45/2026');
  docXml = replaceAllText(docXml, 'Premsukh @ Prem s/o Bhakar Ram, Age 20 years, Address – Jambeswar Nagari, village Motai, PS Chakhu, Dist. Phalodi, Rajasthan', 'राहुल रमेश पाटील, वय २५ वर्षे, पत्ता – नागपूर');

  zip.file('word/document.xml', docXml);
  const outBuf = await zip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync('tests/output_medical_test.docx', outBuf);
  console.log('Generated tests/output_medical_test.docx');
}

async function testLockupPsGenerator() {
  const buf = fs.readFileSync('public/template/lockup-placement-ps-master.docx');
  const zip = await JSZip.loadAsync(buf);
  let docXml = await zip.file('word/document.xml').async('text');

  docXml = replaceAllText(docXml, '२९-०३-२०२६', '16-10-2026');
  docXml = replaceAllText(docXml, '108/2025', '99/2026');
  docXml = replaceAllText(docXml, 'प्रेमसुख उर्फ प्रेम पिता भाकरराम बिष्णोई वय २० वर्षे, पत्ता – जंबेश्वर नगरी, मोटाई, पोलीस ठाणे चाखु, जिल्हा फलोदी, राजस्थान', 'समीर शेख, वय ३० वर्षे, पत्ता – मोमीनपुरा, नागपूर');

  zip.file('word/document.xml', docXml);
  const outBuf = await zip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync('tests/output_lockup_ps_test.docx', outBuf);
  console.log('Generated tests/output_lockup_ps_test.docx');
}

async function testRemandGenerator() {
  const buf = fs.readFileSync('public/template/remand-application-master.docx');
  const zip = await JSZip.loadAsync(buf);
  let docXml = await zip.file('word/document.xml').async('text');

  // Verify key replacements
  docXml = replaceAllText(docXml, '२९-०७-२०२६', '20-10-2026');
  docXml = replaceAllText(docXml, '38/2026', '77/2026');
  docXml = replaceAllText(docXml, 'श्रद्धा नथुजी झोडापे, वय ५० वर्षे, व्यवसाय प्राकृतिक चिकीत्सा, पत्ता – ९३, बेसा, रेणुका कॉलेजजवळ, नागपूर ४४००३४', 'विजय मनोहर शर्मा, वय ४५ वर्षे, रा. धरमपेठ, नागपूर');
  docXml = replaceAllText(docXml, 'संदीप भानुदास मोरे, वय ४२ वर्षे, पत्ता – हाऊस नं. ७५८/९, गल्ली नं. ९, अटल गेट, नेहरु नगर, इंदौर, मध्य प्रदेश', 'अमित कुमार वर्मा, वय ३५ वर्षे, रा. भोपाळ, मध्य प्रदेश');

  zip.file('word/document.xml', docXml);
  const outBuf = await zip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync('tests/output_remand_test.docx', outBuf);
  console.log('Generated tests/output_remand_test.docx');
}

async function testArrestPermissionGenerator() {
  const buf = fs.readFileSync('public/template/arrest-permission-master.docx');
  const zip = await JSZip.loadAsync(buf);
  let docXml = await zip.file('word/document.xml').async('text');

  docXml = replaceAllText(docXml, '29-07-2026', '22-10-2026');
  docXml = replaceAllText(docXml, '38/2026', '88/2026');

  zip.file('word/document.xml', docXml);
  const outBuf = await zip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync('tests/output_arrest_permission_test.docx', outBuf);
  console.log('Generated tests/output_arrest_permission_test.docx');
}

async function run() {
  await testMedicalGenerator();
  await testLockupPsGenerator();
  await testRemandGenerator();
  await testArrestPermissionGenerator();
  console.log('All test generators ran successfully!');
}

run().catch(console.error);
