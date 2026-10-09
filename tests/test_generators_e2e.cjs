const fs = require('fs');
const JSZip = require('jszip');

const {
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

function batchReplaceParagraphs(docXml, matchMap) {
  let result = docXml;
  for (const [snippet, replacement] of Object.entries(matchMap)) {
    if (snippet && replacement !== undefined) {
      result = replaceParagraphTextByMatch(result, snippet, replacement);
    }
  }
  return ensureXmlNamespaces(result);
}

function replaceInDocXml(docXml, searchStr, replaceStr) {
  if (!searchStr) return docXml;
  const escapedReplace = escapeXmlText(replaceStr);
  return ensureXmlNamespaces(docXml.split(searchStr).join(escapedReplace));
}

function batchReplaceInDocXml(docXml, replacementsMap) {
  let result = docXml;
  for (const [searchStr, replaceStr] of Object.entries(replacementsMap)) {
    if (searchStr && replaceStr !== undefined) {
      result = replaceInDocXml(result, searchStr, replaceStr);
    }
  }
  return ensureXmlNamespaces(result);
}

async function testNotice352() {
  const buf = Buffer.from(NOTICE_35_2_TEMPLATE_BASE64, 'base64');
  const zip = await JSZip.loadAsync(buf);
  let docXml = await zip.file('word/document.xml').async('text');

  const formData = {
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
    relativeIntimation: 'भाऊ अजय कांबळे, मो. ९८२२००००००'
  };

  const complainantFull = `फिर्यादी नामे ${formData.complainantName}${formData.complainantAge ? ', वय ' + formData.complainantAge + ' वर्षे' : ''}${formData.complainantProfession ? ', व्यवसाय ' + formData.complainantProfession : ''}${formData.complainantAddress ? ', पत्ता – ' + formData.complainantAddress : ''}`;
  const ioReportFull = `रिपोर्ट - ${formData.ioName}, ${formData.ioRank}, ${formData.ioStation}`;
  const psCrimeFull = `संदर्भ - ${formData.psName} अपराध क्रमांक ${formData.crimeNo} ${formData.actsSections}`;

  const paragraphReplacements = {
    'रिपोर्ट - सुरेश डांबरे': ioReportFull,
    'संदर्भ - पोलीस ठाणे सायबर': psCrimeFull,
    'उपरोक्त संदर्भीय विषयान्वये सविनय': `उपरोक्त संदर्भीय विषयान्वये सविनय सादर की, ${complainantFull} यांचे फिर्यादीवरुन ${formData.psName} येथे अपराध क्रमांक ${formData.crimeNo} ${formData.actsSections} गुन्हा दाखल असुन सदर गुन्ह्याचा तपास आम्ही करीत आहोत.`
  };

  if (formData.courtName) paragraphReplacements['माननीय न्यायदंडाधिकारी,'] = formData.courtName;
  if (formData.caseBrief) paragraphReplacements['दिनांक २२-०३-२०२६ रोजी सकाळी'] = formData.caseBrief;
  if (formData.totalFraudAmount) paragraphReplacements['सदर गुन्ह्याच्या तपासादरम्यान फसवणुकीच्या'] = `सदर गुन्ह्याच्या तपासादरम्यान फसवणुकीच्या एकुण ${formData.totalFraudAmount} या रकमेपैकी ₹${formData.txnAmount}/- रुपये ${formData.bankName} खाते क्रमांक ${formData.accountNo} या खात्यावर पाठवण्यात आलेले आहेत,`;
  if (formData.directorsDetails) paragraphReplacements['१) संदीप भानुदास मोरे, वय ४२ वर्षे'] = formData.directorsDetails;
  
  const accusedFullDesc = `${formData.accusedName}, वय ${formData.accusedAge} वर्षे, पत्ता – ${formData.accusedAddress}`;
  paragraphReplacements['त्यापैकी आरोपी नामे संदीप भानुदास'] = `त्यापैकी आरोपी नामे ${accusedFullDesc} यास कारागृह पोलीस, ${formData.producedFromJail} यांनी मा. न्यायालयासमक्ष हजर केलेले आहे.`;
  paragraphReplacements['मा. न्यायालयाकडुन सदर आरोपीस पोलीस'] = `मा. न्यायालयाकडुन सदर आरोपीस ${formData.psName} अपराध क्रमांक ${formData.crimeNo} ${formData.actsSections} मध्ये अटक करुन त्याचेकडे तपास करण्याची परवानगी घेतल्यानंतर नमुद आरोपीला वैद्यकीय तपासणी करून माननीय सर्वोच्च न्यायालयाच्या सर्व निर्देशांचे पालन करून आरोपीचा पंचासमक्ष पंचनामा तयार करून आरोपीस दिनांक ${formData.arrestDate} रोजी ${formData.arrestTime} वाजता खालील नमूद कारणांस्तव अटक करण्यात आलेली आहे.`;
  paragraphReplacements['आरोपीस अटक करताना लेखी सूचनापत्र'] = `आरोपीस अटक करताना लेखी सूचनापत्र देण्यात आलेले आहे तसेच अटकेबाबत आरोपीचे नातेवाईक ${formData.relativeIntimation} यांना माहिती देण्यात आलेली आहे.`;

  docXml = batchReplaceParagraphs(docXml, paragraphReplacements);

  const directReplacements = {
    '२९-०७-२०२६': formData.letterDate,
    '38/2026': formData.crimeNo,
    'IndusInd Bank': formData.bankName,
    '259109855949': formData.accountNo,
    'CNRBR52026032380902224': formData.txnId,
    'Annkutgrains Private Limited': formData.accountName,
    'Indore': formData.branchName,
    '13,00,000/-': formData.txnAmount + '/-',
    '(सुरेश डांबरे)': `(${formData.ioName})`
  };
  docXml = batchReplaceInDocXml(docXml, directReplacements);

  zip.file('word/document.xml', docXml);
  const outBuf = await zip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync('tests/out_test_notice_35_2.docx', outBuf);

  // Validate output zip
  const verifyZip = await JSZip.loadAsync(outBuf);
  const verifiedXml = await verifyZip.file('word/document.xml').async('text');
  if (verifiedXml.includes('सचिन गायकवाड') && verifiedXml.includes('HDFC Bank') && verifiedXml.includes('50100234567890')) {
    console.log('✅ PASS: Notice 35(2) generated and verified successfully!');
  } else {
    console.error('❌ FAIL: Notice 35(2) missing replaced content');
  }
}

async function testAtakSanha() {
  const buf = Buffer.from(ATAK_SANHA_TEMPLATE_BASE64, 'base64');
  const zip = await JSZip.loadAsync(buf);
  let docXml = await zip.file('word/document.xml').async('text');

  const formData = {
    letterDate: '१०-१०-२०२६',
    ioName: 'सचिन गायकवाड',
    ioRank: 'पोलीस उपनिरीक्षक',
    ioStation: 'सायबर सेल नागपूर',
    psName: 'पोलीस स्टेशन सायबर नागपूर',
    crimeNo: '105/2026',
    actsSections: 'u/s 318(4) BNS',
    complainantName: 'महेश शर्मा',
    complainantAge: '३५',
    complainantProfession: 'व्यापारी',
    complainantAddress: 'सदर, नागपूर',
    caseBrief: 'तक्रारदाराशी संपर्क साधून ऑनलाईन गंडा घातला...',
    totalFraudAmount: '₹5,00,000/-',
    bankName: 'Axis Bank',
    accountNo: '912010023456789',
    branchName: 'Nagpur',
    txnId: 'AXIS123456789',
    txnAmount: '5,00,000/-',
    accountName: 'Fintech Corp',
    accountAddress: 'Civil Lines, Nagpur',
    accusedName: 'संजय पाटील',
    accusedAge: '२८',
    accusedAddress: 'नागपूर',
    producedFromJail: 'नागपूर मध्यवर्ती कारागृह',
    arrestDate: '१०-१०-२०२६',
    arrestTime: '१५:३०',
    relativeIntimation: 'वडील नामदेव पाटील, मो. ९८७६५४३२१०'
  };

  const complainantFull = `फिर्यादी नामे ${formData.complainantName}, वय ${formData.complainantAge} वर्षे, व्यवसाय ${formData.complainantProfession}, पत्ता – ${formData.complainantAddress}`;
  const ioStatementHeader = `यावेळी आम्ही ${formData.ioName}, ${formData.ioRank}, ${formData.ioStation} निवेदन करतो की, ${complainantFull} यांचे फिर्यादीवरुन ${formData.psName} येथे अपराध क्रमांक ${formData.crimeNo} ${formData.actsSections} गुन्हा दाखल असुन सदर गुन्ह्याचा तपास आम्ही करीत आहोत.`;

  const paragraphReplacements = {
    'यावेळी आम्ही सुरेश डांबरे, वरिष्ठ पोलीस': ioStatementHeader,
    'दिनांक २२-०३-२०२६ रोजी सकाळी': formData.caseBrief,
    'सदर गुन्ह्याच्या तपासादरम्यान फसवणुकीच्या': `सदर गुन्ह्याच्या तपासादरम्यान फसवणुकीच्या एकुण ${formData.totalFraudAmount} या रकमेपैकी ₹${formData.txnAmount}/- रुपये ${formData.bankName} खाते क्रमांक ${formData.accountNo} या खात्यावर पाठवण्यात आलेले आहेत,`,
    'आरोपीस अटक करताना लेखी सूचनापत्र': `आरोपीस अटक करताना लेखी सूचनापत्र देण्यात आलेले आहे तसेच अटकेबाबत आरोपीचे नातेवाईक ${formData.relativeIntimation} यांना माहिती देण्यात आलेली आहे.`
  };

  docXml = batchReplaceParagraphs(docXml, paragraphReplacements);

  const directReplacements = {
    '२९-०७-२०२६': formData.letterDate,
    '38/2026': formData.crimeNo,
    'IndusInd Bank': formData.bankName,
    '259109855949': formData.accountNo,
    'CNRBR52026032380902224': formData.txnId,
    'Annkutgrains Private Limited': formData.accountName,
    '13,00,000/-': formData.txnAmount + '/-'
  };
  docXml = batchReplaceInDocXml(docXml, directReplacements);

  zip.file('word/document.xml', docXml);
  const outBuf = await zip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync('tests/out_test_atak_sanha.docx', outBuf);

  const verifyZip = await JSZip.loadAsync(outBuf);
  const verifiedXml = await verifyZip.file('word/document.xml').async('text');
  if (verifiedXml.includes('सचिन गायकवाड') && verifiedXml.includes('Axis Bank') && verifiedXml.includes('912010023456789')) {
    console.log('✅ PASS: Atak Sanha generated and verified successfully!');
  } else {
    console.error('❌ FAIL: Atak Sanha verification failed');
  }
}

async function testNotice47() {
  const buf = Buffer.from(NOTICE_47_TEMPLATE_BASE64, 'base64');
  const zip = await JSZip.loadAsync(buf);
  let docXml = await zip.file('word/document.xml').async('text');

  const formData = {
    letterDate: '१०-१०-२०२६',
    accusedName: 'विकास शर्मा',
    accusedAge: '३०',
    accusedAddress: 'महात्मा गांधी मार्ग, इंदूर',
    psName: 'पोलीस ठाणे सायबर नागपूर शहर',
    crimeNo: '55/2026',
    actsSections: 'u/s 318(4) BNS',
    complainantName: 'सीमा जोशी',
    complainantAge: '४५',
    complainantProfession: 'शिक्षिका',
    complainantAddress: 'धरमपेठ, नागपूर',
    complaintDate: '०१-१०-२०२६',
    caseBrief: 'तक्रारदार महिलेला डिजिटल अरेस्टची धमकी दिली...',
    arrestDate: '१०-१०-२०२६',
    arrestTime: '१६:००',
    bankName: 'ICICI Bank',
    accountNo: '001105001234',
    branchName: 'Indore',
    txnId: 'TXN47474747',
    txnAmount: '2,50,000/-',
    accountName: 'Global Traders',
    courtName: 'मा. प्रथमवर्ग न्यायदंडाधिकारी न्यायालय क्र. ५, नागपूर',
    relativeIntimation: 'भाऊ राजेश शर्मा, मो. ९४२२११००००',
    ioName: 'अमोल देशमुख',
    ioRank: 'पोलीस निरीक्षक',
    ioStation: 'सायबर ठाणे नागपूर'
  };

  const paragraphReplacements = {
    'आरोपीचे नाव - संदीप भानुदास': `आरोपीचे नाव - ${formData.accusedName}, वय ${formData.accusedAge} वर्षे,`,
    'पत्ता – हाऊस नं. ७५८/९': `पत्ता – ${formData.accusedAddress}`,
    'संदर्भ - पोलीस ठाणे सायबर': `संदर्भ - ${formData.psName} अपराध क्रमांक ${formData.crimeNo} ${formData.actsSections}`,
    'दिनांक २२-०३-२०२६ को सुबह': formData.caseBrief
  };

  docXml = batchReplaceParagraphs(docXml, paragraphReplacements);

  const directReplacements = {
    '२९-०७-२०२६': formData.letterDate,
    '38/2026': formData.crimeNo,
    'IndusInd Bank': formData.bankName,
    '259109855949': formData.accountNo,
    'CNRBR52026032380902224': formData.txnId,
    'Annkutgrains Private Limited': formData.accountName,
    '(सुरेश डांबरे)': `(${formData.ioName})`
  };
  docXml = batchReplaceInDocXml(docXml, directReplacements);

  zip.file('word/document.xml', docXml);
  const outBuf = await zip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync('tests/out_test_notice_47.docx', outBuf);

  const verifyZip = await JSZip.loadAsync(outBuf);
  const verifiedXml = await verifyZip.file('word/document.xml').async('text');
  if (verifiedXml.includes('विकास शर्मा') && verifiedXml.includes('ICICI Bank') && verifiedXml.includes('अमोल देशमुख')) {
    console.log('✅ PASS: Notice 47 generated and verified successfully!');
  } else {
    console.error('❌ FAIL: Notice 47 verification failed');
  }
}

async function testNotice48() {
  const buf = Buffer.from(NOTICE_48_TEMPLATE_BASE64, 'base64');
  const zip = await JSZip.loadAsync(buf);
  let docXml = await zip.file('word/document.xml').async('text');

  const formData = {
    letterDate: '१०-१०-२०२६',
    relativeName: 'राजेश शर्मा',
    relativeRelation: 'भाऊ',
    relativeAddress: 'इंदूर, मध्य प्रदेश',
    relativePhone: '९४२२११००००',
    accusedName: 'विकास शर्मा',
    accusedAge: '३०',
    accusedAddress: 'इंदूर',
    psName: 'पोलीस ठाणे सायबर नागपूर शहर',
    crimeNo: '55/2026',
    actsSections: 'u/s 318(4) BNS',
    complainantName: 'सीमा जोशी',
    complainantAge: '४५',
    complainantProfession: 'शिक्षिका',
    complainantAddress: 'धरमपेठ, नागपूर',
    complaintDate: '०१-१०-२०२६',
    caseBrief: 'तक्रारदार महिलेला डिजिटल अरेस्टची धमकी दिली...',
    arrestDate: '१०-१०-२०२६',
    arrestTime: '१६:००',
    bankName: 'ICICI Bank',
    accountNo: '001105001234',
    branchName: 'Indore',
    txnId: 'TXN48484848',
    txnAmount: '2,50,000/-',
    accountName: 'Global Traders',
    courtName: 'मा. प्रथमवर्ग न्यायदंडाधिकारी न्यायालय क्र. ५, नागपूर',
    ioName: 'अमोल देशमुख',
    ioRank: 'पोलीस निरीक्षक',
    ioStation: 'सायबर ठाणे नागपूर'
  };

  const paragraphReplacements = {
    'संदर्भ - पोलीस ठाणे सायबर': `संदर्भ - ${formData.psName} अपराध क्रमांक ${formData.crimeNo} ${formData.actsSections}`,
    'दिनांक २२-०३-२०२६ को सुबह': formData.caseBrief
  };

  if (formData.relativeName) {
    const relNameStr = `१) नातेवाईकाचे नाव - ${formData.relativeName} (नाते - ${formData.relativeRelation})`;
    const relAddrStr = `पत्ता - ${formData.relativeAddress}`;
    const relPhoneStr = `मोबाईल नं. - ${formData.relativePhone}`;

    let dashCount = 0;
    const pRegex = /<w:p(?:[\s>][\s\S]*?)<\/w:p>/g;
    docXml = docXml.replace(pRegex, (p) => {
      const text = p.replace(/<[^>]+>/g, '').trim();
      if (/^-{10,}$/.test(text)) {
        dashCount++;
        if (dashCount === 1) return p.replace(text, relNameStr);
        if (dashCount === 2) return p.replace(text, relAddrStr);
        if (dashCount === 3) return p.replace(text, relPhoneStr);
      }
      return p;
    });
  }

  docXml = batchReplaceParagraphs(docXml, paragraphReplacements);

  const directReplacements = {
    '२९-०७-२०२६': formData.letterDate,
    '38/2026': formData.crimeNo,
    'IndusInd Bank': formData.bankName,
    '259109855949': formData.accountNo,
    'CNRBR52026032380902224': formData.txnId,
    'Annkutgrains Private Limited': formData.accountName,
    '(सुरेश डांबरे)': `(${formData.ioName})`
  };
  docXml = batchReplaceInDocXml(docXml, directReplacements);

  zip.file('word/document.xml', docXml);
  const outBuf = await zip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync('tests/out_test_notice_48.docx', outBuf);

  const verifyZip = await JSZip.loadAsync(outBuf);
  const verifiedXml = await verifyZip.file('word/document.xml').async('text');
  if (verifiedXml.includes('राजेश शर्मा') && verifiedXml.includes('ICICI Bank') && verifiedXml.includes('अमोल देशमुख')) {
    console.log('✅ PASS: Notice 48 generated and verified successfully!');
  } else {
    console.error('❌ FAIL: Notice 48 verification failed');
  }
}

async function run() {
  await testNotice352();
  await testAtakSanha();
  await testNotice47();
  await testNotice48();
}

run().catch(console.error);
