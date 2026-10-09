import fs from 'fs';
import JSZip from 'jszip';

import { generateNotice352Docx } from '../src/utils/docxGenerators/generateNotice352Docx.js';
import { generateAtakSanhaDocx } from '../src/utils/docxGenerators/generateAtakSanhaDocx.js';
import { generateNotice47Docx } from '../src/utils/docxGenerators/generateNotice47Docx.js';
import { generateNotice48Docx } from '../src/utils/docxGenerators/generateNotice48Docx.js';

async function runTests() {
  console.log('=== Running Direct Generator Function Tests ===');

  const testData = {
    letterDate: '१०-१०-२०२६',
    courtName: 'मा. मुख्य न्यायदंडाधिकारी सो., नागपूर',
    ioName: 'सचिन गायकवाड',
    ioRank: 'पोलीस उपनिरीक्षक',
    ioStation: 'सायबर सेल नागपूर',
    psName: 'पोलीस स्टेशन सायबर नागपूर',
    crimeNo: '105/2026',
    actsSections: 'u/s 318(4) BNS सहकलम 66(D) IT Act',
    complainantName: 'महेश शर्मा',
    complainantAge: '३५',
    complainantProfession: 'व्यापारी',
    complainantAddress: 'सदर, नागपूर',
    complaintDate: '०१-१०-२०२६',
    caseBrief: 'तक्रारदाराशी संपर्क साधून ऑनलाईन गंडा घातला...',
    totalFraudAmount: '₹5,00,000/-',
    bankName: 'HDFC Bank',
    accountNo: '50100234567890',
    branchName: 'Pune Main',
    txnId: 'UTR998877665544',
    txnAmount: '5,00,000/-',
    accountName: 'Tech Solutions Pvt Ltd',
    accountAddress: 'FC Road, Pune',
    directorsDetails: '१) विजय कांबळे, वय ३० वर्षे, पत्ता - पुणे',
    accusedName: 'विजय कांबळे',
    accusedAge: '३०',
    accusedAddress: 'पुणे',
    producedFromJail: 'येरवडा मध्यवर्ती कारागृह',
    arrestDate: '१०-१०-२०२६',
    arrestTime: '१४:००',
    relativeIntimation: 'भाऊ अजय कांबळे, मो. ९८२२००००००',
    relativeName: 'अजय कांबळे',
    relativeRelation: 'भाऊ',
    relativeAddress: 'पुणे',
    relativePhone: '९८२२००००००'
  };

  // 1. Notice 35(2)
  const blob35 = await generateNotice352Docx(testData);
  const ab35 = await blob35.arrayBuffer();
  const zip35 = await JSZip.loadAsync(ab35);
  const xml35 = await zip35.file('word/document.xml').async('text');
  if (xml35.includes('सचिन गायकवाड') && xml35.includes('HDFC Bank') && xml35.includes('50100234567890')) {
    console.log('✅ PASS: generateNotice352Docx passed validation');
  } else {
    console.error('❌ FAIL: generateNotice352Docx missing data');
  }

  // 2. Atak Sanha
  const blobSanha = await generateAtakSanhaDocx(testData);
  const abSanha = await blobSanha.arrayBuffer();
  const zipSanha = await JSZip.loadAsync(abSanha);
  const xmlSanha = await zipSanha.file('word/document.xml').async('text');
  if (xmlSanha.includes('सचिन गायकवाड') && xmlSanha.includes('HDFC Bank') && xmlSanha.includes('50100234567890')) {
    console.log('✅ PASS: generateAtakSanhaDocx passed validation');
  } else {
    console.error('❌ FAIL: generateAtakSanhaDocx missing data');
  }

  // 3. Notice 47
  const blob47 = await generateNotice47Docx(testData);
  const ab47 = await blob47.arrayBuffer();
  const zip47 = await JSZip.loadAsync(ab47);
  const xml47 = await zip47.file('word/document.xml').async('text');
  if (xml47.includes('सचिन गायकवाड') && xml47.includes('HDFC Bank') && xml47.includes('विजय कांबळे')) {
    console.log('✅ PASS: generateNotice47Docx passed validation');
  } else {
    console.error('❌ FAIL: generateNotice47Docx missing data');
  }

  // 4. Notice 48
  const blob48 = await generateNotice48Docx(testData);
  const ab48 = await blob48.arrayBuffer();
  const zip48 = await JSZip.loadAsync(ab48);
  const xml48 = await zip48.file('word/document.xml').async('text');
  if (xml48.includes('सचिन गायकवाड') && xml48.includes('HDFC Bank') && xml48.includes('अजय कांबळे')) {
    console.log('✅ PASS: generateNotice48Docx passed validation');
  } else {
    console.error('❌ FAIL: generateNotice48Docx missing data');
  }
}

runTests().catch(console.error);
