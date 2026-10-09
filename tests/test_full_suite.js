import fs from 'fs';
import JSZip from 'jszip';
import {
  generateRemandDocx,
  generateMedicalDocx,
  generateLockupPsDocx,
  generateLockupAcpDocx,
  generateCustodyTransferDocx,
  generateArrestPermissionDocx
} from '../src/utils/docxGenerators/index.js';
import {
  getSampleForm3Data,
  getSampleRemandData,
  getSampleMedicalData,
  getSampleLockupPsData,
  getSampleLockupAcpData,
  getSampleCustodyTransferData,
  getSampleArrestPermissionData
} from '../src/utils/documentSchemas.js';
import {
  validateDocument
} from '../src/utils/documentValidation.js';

// Polyfill fetch for node environment
global.fetch = async (url) => {
  let filepath = url;
  if (filepath.startsWith('/')) filepath = filepath.substring(1);
  if (!fs.existsSync(filepath)) {
    filepath = 'public/' + filepath;
  }
  const buf = fs.readFileSync(filepath);
  return {
    ok: true,
    arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  };
};

async function verifyDocxOutput(name, blob, expectedStrings = []) {
  const arrayBuf = await blob.arrayBuffer();
  const nodeBuf = Buffer.from(arrayBuf);
  const zip = await JSZip.loadAsync(nodeBuf);
  const docXml = await zip.file('word/document.xml').async('text');

  // Verify XML structure
  if (!docXml || docXml.length < 100) {
    throw new Error(`${name}: document.xml is empty or corrupted`);
  }

  const pOpen = (docXml.match(/<w:p[\s>]/g) || []).length;
  const pClose = (docXml.match(/<\/w:p>/g) || []).length;
  if (pOpen !== pClose) {
    throw new Error(`${name}: Unbalanced w:p tags (${pOpen} vs ${pClose})`);
  }

  const fullPlainText = docXml.replace(/<[^>]+>/g, ' ');

  for (const s of expectedStrings) {
    if (!docXml.includes(s) && !fullPlainText.includes(s)) {
      throw new Error(`${name}: Expected string "${s}" was not found in generated document.xml`);
    }
  }

  console.log(`  ✓ ${name} verified (${nodeBuf.length} bytes, ${pOpen} paragraphs)`);
}

async function runSuite() {
  console.log('===========================================================');
  console.log('STARTING FULL SYSTEM VERIFICATION SUITE');
  console.log('===========================================================');

  // 1. Validate sample data for all 7 documents
  console.log('\n[1] Validating Document Schemas & Validation Rules:');
  const docs = [
    { id: 'form3', data: getSampleForm3Data(), name: 'Form III Arrest Memo' },
    { id: 'remand', data: getSampleRemandData(), name: 'Police Custody Remand' },
    { id: 'medical', data: getSampleMedicalData(), name: 'Medical Letter' },
    { id: 'lockup_ps', data: getSampleLockupPsData(), name: 'Lockup Placement PS' },
    { id: 'lockup_acp', data: getSampleLockupAcpData(), name: 'Lockup Placement ACP' },
    { id: 'custody_transfer', data: getSampleCustodyTransferData(), name: 'Custody Transfer' },
    { id: 'arrest_permission', data: getSampleArrestPermissionData(), name: 'Arrest Permission' }
  ];

  for (const d of docs) {
    const val = validateDocument(d.id, d.data);
    if (!val.isValid) {
      throw new Error(`Validation failed for sample data of ${d.name}: ${JSON.stringify(val.errors)}`);
    }
    console.log(`  ✓ ${d.name} sample data validated`);
  }

  // 2. Generate and verify DOCX files
  console.log('\n[2] Testing Client-Side DOCX Generation Engine:');

  // Remand
  const remandBlob = await generateRemandDocx(getSampleRemandData());
  await verifyDocxOutput('PCR Remand Application', remandBlob, ['38/2026', 'संदीप भानुदास मोरे']);

  // Medical
  const medBlob = await generateMedicalDocx(getSampleMedicalData());
  await verifyDocxOutput('Medical Examination Letter', medBlob, ['108/2025', 'प्रेमसुख']);

  // Lockup PS
  const lockupPsBlob = await generateLockupPsDocx(getSampleLockupPsData());
  await verifyDocxOutput('Lockup Placement PS Letter', lockupPsBlob, ['108/2025', 'पोलीस ठाणे सदर']);

  // Lockup ACP
  const lockupAcpBlob = await generateLockupAcpDocx(getSampleLockupAcpData());
  await verifyDocxOutput('Lockup Placement ACP Letter', lockupAcpBlob, ['108/2025', 'सहा. पोलीस आयुक्त']);

  // Custody Transfer
  const custodyBlob = await generateCustodyTransferDocx(getSampleCustodyTransferData());
  await verifyDocxOutput('Accused Custody Transfer Letter', custodyBlob, ['108/2025', 'ताब्यात', 'प्रेमसुख']);

  // Arrest Permission
  const arrestPermBlob = await generateArrestPermissionDocx(getSampleArrestPermissionData());
  await verifyDocxOutput('Permission to Arrest Application', arrestPermBlob, ['38/2026', 'परवानगी', 'संदीप भानुदास मोरे']);

  console.log('\n===========================================================');
  console.log('ALL POLICE INVESTIGATION DOCUMENTS PASSED ALL TESTS!');
  console.log('===========================================================');
}

runSuite().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
