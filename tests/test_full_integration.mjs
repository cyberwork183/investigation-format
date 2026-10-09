import {
  generateDocumentDocx
} from '../src/utils/docxGenerators/index.js';

import {
  getSampleForm3Data,
  getDefaultForm3Data,
  getSampleRemandData,
  getDefaultRemandData,
  getSampleNotice352Data,
  getDefaultNotice352Data,
  getSampleAtakSanhaData,
  getDefaultAtakSanhaData,
  getSampleNotice47Data,
  getDefaultNotice47Data,
  getSampleNotice48Data,
  getDefaultNotice48Data
} from '../src/utils/documentSchemas.js';

import {
  extractSharedDetailsFromDoc,
  applySharedDetailsToDoc
} from '../src/utils/shareDetails.js';

import JSZip from 'jszip';

async function testDocx(blob, name) {
  const buf = Buffer.from(await blob.arrayBuffer());
  const zip = await JSZip.loadAsync(buf);
  const xml = await zip.file('word/document.xml').async('string');
  if (!xml.startsWith('<?xml') && !xml.startsWith('<w:document')) {
    throw new Error('Missing valid document root in ' + name);
  }
  if (!xml.endsWith('</w:document>')) {
    throw new Error('Unclosed document XML tag in ' + name);
  }
  return xml;
}

async function runIntegration() {
  console.log('=== 1. Testing Default Form Initialization ===');
  const f3 = getDefaultForm3Data();
  const f3Sample = getSampleForm3Data();
  console.log(`Form III sample accused: ${f3Sample.accusedName}`);
  
  const n352 = getDefaultNotice352Data();
  if (n352.accusedName !== '' || n352.crimeNo !== '') {
    throw new Error('Notice 35(2) default should be empty!');
  }
  const nAtak = getDefaultAtakSanhaData();
  if (nAtak.accusedName !== '' || nAtak.crimeNo !== '') {
    throw new Error('Atak Sanha default should be empty!');
  }
  const n47 = getDefaultNotice47Data();
  if (n47.accusedName !== '' || n47.crimeNo !== '') {
    throw new Error('Notice 47 default should be empty!');
  }
  const n48 = getDefaultNotice48Data();
  if (n48.accusedName !== '' || n48.crimeNo !== '') {
    throw new Error('Notice 48 default should be empty!');
  }
  console.log('✅ PASS: All new forms open completely empty on initialization.');

  console.log('\n=== 2. Testing Share Details Across Forms ===');
  // Share details starting from Form III
  const sampleF3 = getSampleForm3Data();
  const extractedF3 = extractSharedDetailsFromDoc('form3', sampleF3);
  console.log('Extracted fields from Form III:', Object.keys(extractedF3));
  
  // Apply to empty Notice 35(2)
  const populatedN352 = applySharedDetailsToDoc('notice_35_2', getDefaultNotice352Data(), extractedF3);
  if (populatedN352.crimeNo !== sampleF3.firNo || populatedN352.accusedName !== sampleF3.accusedName) {
    throw new Error('Share Details from Form III to Notice 35(2) failed!');
  }
  console.log(`✅ PASS: Form III shared crimeNo (${populatedN352.crimeNo}) and accusedName (${populatedN352.accusedName}) into Notice 35(2)`);

  // Share details starting from Notice 35(2) to Notice 48 and Form III
  const sampleN352 = getSampleNotice352Data();
  const extractedN352 = extractSharedDetailsFromDoc('notice_35_2', sampleN352);
  console.log('Extracted fields from Notice 35(2):', Object.keys(extractedN352));
  
  const populatedN48 = applySharedDetailsToDoc('notice_48', getDefaultNotice48Data(), extractedN352);
  if (populatedN48.accusedName !== sampleN352.accusedName || populatedN48.bankName !== sampleN352.bankName) {
    throw new Error('Share Details from Notice 35(2) to Notice 48 failed!');
  }
  console.log(`✅ PASS: Notice 35(2) shared accusedName (${populatedN48.accusedName}) and bankName (${populatedN48.bankName}) to Notice 48`);

  // Verify that existing non-empty fields are NOT overwritten
  const partiallyFilledN47 = {
    ...getDefaultNotice47Data(),
    accusedName: 'Custom Accused Name',
    crimeNo: ''
  };
  const mergedN47 = applySharedDetailsToDoc('notice_47', partiallyFilledN47, extractedN352);
  if (mergedN47.accusedName !== 'Custom Accused Name') {
    throw new Error('Non-empty field was overwritten!');
  }
  if (mergedN47.crimeNo !== sampleN352.crimeNo) {
    throw new Error('Empty field was not populated!');
  }
  console.log('✅ PASS: Share Details safely populates only empty fields and never overwrites existing non-empty fields.');

  console.log('\n=== 3. Testing DOCX Generation for All 11 Documents ===');
  const allTests = [
    { name: 'Form III (Arrest Memo)', gen: () => generateDocumentDocx('form3', getSampleForm3Data()) },
    { name: 'Remand Application', gen: () => generateDocumentDocx('remand', getSampleRemandData()) },
    { name: 'Medical Letter', gen: () => generateDocumentDocx('medical', getSampleForm3Data()) },
    { name: 'Lockup PS Letter', gen: () => generateDocumentDocx('lockup_ps', getSampleForm3Data()) },
    { name: 'Lockup ACP Letter', gen: () => generateDocumentDocx('lockup_acp', getSampleForm3Data()) },
    { name: 'Custody Transfer Letter', gen: () => generateDocumentDocx('custody_transfer', getSampleForm3Data()) },
    { name: 'Arrest Permission Application', gen: () => generateDocumentDocx('arrest_permission', getSampleForm3Data()) },
    { name: 'Notice 35(2) Checklist', gen: () => generateDocumentDocx('notice_35_2', getSampleNotice352Data()) },
    { name: 'Atak Sanha', gen: () => generateDocumentDocx('atak_sanha', getSampleAtakSanhaData()) },
    { name: 'Notice 47 to Accused', gen: () => generateDocumentDocx('notice_47', getSampleNotice47Data()) },
    { name: 'Notice 48 to Relative', gen: () => generateDocumentDocx('notice_48', getSampleNotice48Data()) }
  ];

  for (const item of allTests) {
    const blob = await item.gen();
    const xml = await testDocx(blob, item.name);
    console.log(`✅ PASS: ${item.name} (${blob.size} bytes, document.xml: ${xml.length} chars)`);
  }

  console.log('\n🎉 ALL 11 DOCUMENTS & INTEGRATION TESTS PASSED SUCCESSFULLY!');
}

runIntegration().catch((e) => {
  console.error('❌ Test failed:', e);
  process.exit(1);
});
