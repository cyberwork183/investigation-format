import fs from 'fs';
import JSZip from 'jszip';
import { generateRemandDocx } from '../src/utils/docxGenerators/generateRemandDocx.js';
import { generateMedicalDocx } from '../src/utils/docxGenerators/generateMedicalDocx.js';
import { generateLockupPsDocx } from '../src/utils/docxGenerators/generateLockupPsDocx.js';
import { generateLockupAcpDocx } from '../src/utils/docxGenerators/generateLockupAcpDocx.js';
import { generateCustodyTransferDocx } from '../src/utils/docxGenerators/generateCustodyTransferDocx.js';
import { generateArrestPermissionDocx } from '../src/utils/docxGenerators/generateArrestPermissionDocx.js';
import { generateNotice352Docx } from '../src/utils/docxGenerators/generateNotice352Docx.js';
import { generateAtakSanhaDocx } from '../src/utils/docxGenerators/generateAtakSanhaDocx.js';
import { generateNotice47Docx } from '../src/utils/docxGenerators/generateNotice47Docx.js';
import { generateNotice48Docx } from '../src/utils/docxGenerators/generateNotice48Docx.js';
import {
  getSampleRemandData,
  getSampleMedicalData,
  getSampleLockupPsData,
  getSampleLockupAcpData,
  getSampleCustodyTransferData,
  getSampleArrestPermissionData,
  getSampleNotice352Data,
  getSampleAtakSanhaData,
  getSampleNotice47Data,
  getSampleNotice48Data
} from '../src/utils/documentSchemas.js';

// Polyfill fetch for node testing using file read
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

async function testDocx(name, genFn, sampleData) {
  console.log(`\nTesting ${name}...`);
  const blob = await genFn(sampleData);
  const arrayBuf = await blob.arrayBuffer();
  const nodeBuf = Buffer.from(arrayBuf);

  // Verify JSZip can parse it
  const zip = await JSZip.loadAsync(nodeBuf);
  const docXml = await zip.file('word/document.xml').async('text');

  if (!docXml || docXml.length < 100) {
    throw new Error(`${name}: document.xml is empty or too short!`);
  }

  // Tag balancing check (account for self-closing <w:p .../>)
  const allPTags = docXml.match(/<w:p(?:\s[^>]*)?>/g) || [];
  const pOpenOnly = allPTags.filter(tag => !tag.endsWith('/>')).length;
  const pCloseCount = (docXml.match(/<\/w:p>/g) || []).length;
  if (pOpenOnly !== pCloseCount) {
    throw new Error(`${name}: Unbalanced w:p tags (${pOpenOnly} open vs ${pCloseCount} close)`);
  }

  console.log(`✓ ${name} passed! Generated ${nodeBuf.length} bytes, ${pOpenOnly} paragraphs.`);
}

async function run() {
  await testDocx('Remand Application', generateRemandDocx, getSampleRemandData());
  await testDocx('Medical Letter', generateMedicalDocx, getSampleMedicalData());
  await testDocx('Lockup PS Letter', generateLockupPsDocx, getSampleLockupPsData());
  await testDocx('Lockup ACP Letter', generateLockupAcpDocx, getSampleLockupAcpData());
  await testDocx('Custody Transfer Letter', generateCustodyTransferDocx, getSampleCustodyTransferData());
  await testDocx('Arrest Permission Application', generateArrestPermissionDocx, getSampleArrestPermissionData());
  await testDocx('Section 35(2) Notice Checklist', generateNotice352Docx, getSampleNotice352Data());
  await testDocx('Arrest Sanha (Station Diary Entry)', generateAtakSanhaDocx, getSampleAtakSanhaData());
  await testDocx('Section 47 Notice to Accused', generateNotice47Docx, getSampleNotice47Data());
  await testDocx('Section 48 Notice to Relative', generateNotice48Docx, getSampleNotice48Data());
  console.log('\n============================================================');
  console.log('ALL 10 MODULAR DOCUMENT GENERATORS TESTED & PASSED (10/10)!');
  console.log('============================================================');
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
