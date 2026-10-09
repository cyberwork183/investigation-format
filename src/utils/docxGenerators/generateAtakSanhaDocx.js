/**
 * generateAtakSanhaDocx.js
 * Generates official Arrest Station Diary Entry / Memo (अटक सान्हा) DOCX from master template.
 */

import JSZip from 'jszip';
import { loadTemplateBuffer, batchReplaceParagraphs, batchReplaceInDocXml } from './commonDocxUtils.js';
import { ATAK_SANHA_TEMPLATE_BASE64 } from '../allTemplatesBase64.js';

export async function generateAtakSanhaDocx(formData) {
  const templateBuf = await loadTemplateBuffer(
    ['/template/atak-sanha-master.docx', 'template/atak-sanha-master.docx', '/template/अटक सान्हा.docx', 'template/अटक सान्हा.docx'],
    ATAK_SANHA_TEMPLATE_BASE64
  );

  const zip = await JSZip.loadAsync(templateBuf);
  let docXml = await zip.file('word/document.xml').async('text');

  const letterDateStr = formData.letterDate || '२९-०७-२०२६';
  const complainantFull = `फिर्यादी नामे ${formData.complainantName || 'श्रद्धा नथुजी झोडापे'}${formData.complainantAge ? ', वय ' + formData.complainantAge + ' वर्षे' : ''}${formData.complainantProfession ? ', व्यवसाय ' + formData.complainantProfession : ''}${formData.complainantAddress ? ', पत्ता – ' + formData.complainantAddress : ''}`;
  const ioStatementHeader = `यावेळी आम्ही ${formData.ioName || 'सुरेश डांबरे'}, ${formData.ioRank || 'वरिष्ठ पोलीस निरीक्षक'}, ${formData.ioStation || formData.psName || 'पोलीस ठाणे सायबर, नागपूर शहर'} निवेदन करतो की, ${complainantFull} यांचे फिर्यादीवरुन ${formData.psName || 'पोलीस ठाणे, सायबर, नागपूर शहर'} येथे अपराध क्रमांक ${formData.crimeNo || '38/2026'} ${formData.actsSections || 'भारतीय न्याय संहीता कलम 318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) भारतीय न्याय संहिता सह कलम 66(क), 66(ड) माहिती तंत्रज्ञान अधिनियम 2000 प्रमाणे'} गुन्हा दाखल असुन सदर गुन्ह्याचा तपास आम्ही करीत आहोत.`;

  // Paragraph-level replacements
  const paragraphReplacements = {
    'यावेळी आम्ही सुरेश डांबरे, वरिष्ठ पोलीस': ioStatementHeader
  };

  if (formData.caseBrief?.trim()) {
    paragraphReplacements['दिनांक २२-०३-२०२६ रोजी सकाळी'] = formData.caseBrief;
  }

  if (formData.totalFraudAmount || formData.txnAmount || formData.bankName || formData.accountNo) {
    paragraphReplacements['सदर गुन्ह्याच्या तपासादरम्यान फसवणुकीच्या'] = `सदर गुन्ह्याच्या तपासादरम्यान फसवणुकीच्या एकुण ${formData.totalFraudAmount || '₹13,00,100/-'} या रकमेपैकी ${formData.txnAmount ? '₹' + formData.txnAmount + '/-' : '₹13,00,000/-'} रुपये ${formData.bankName || 'IndusInd Bank'} खाते क्रमांक ${formData.accountNo || '259109855949'} या खात्यावर पाठवण्यात आलेले आहेत,`;
  }

  if (formData.directorsDetails?.trim()) {
    paragraphReplacements['१) संदीप भानुदास मोरे, वय ४२ वर्षे'] = formData.directorsDetails;
  } else if (formData.accusedName?.trim()) {
    const accAge = formData.accusedAge ? `, वय ${formData.accusedAge} वर्षे` : '';
    const accAddr = formData.accusedAddress ? `, पत्ता – ${formData.accusedAddress}` : '';
    paragraphReplacements['१) संदीप भानुदास मोरे, वय ४२ वर्षे'] = `१) ${formData.accusedName}${accAge}${accAddr}`;
  }

  if (formData.productionWarrantDetails?.trim()) {
    paragraphReplacements['सदर आरोपी नामे १) संदीप भानुदास मोरे'] = formData.productionWarrantDetails;
  }

  const accusedFullDesc = `${formData.accusedName || 'संदीप भानुदास मोरे'}${formData.accusedAge ? ', वय ' + formData.accusedAge + ' वर्षे' : ''}${formData.accusedAddress ? ', पत्ता – ' + formData.accusedAddress : ''}`;
  const jailName = formData.producedFromJail || 'तिहार कारागृह, दिल्ली';
  paragraphReplacements['त्यापैकी आरोपी नामे संदीप भानुदास'] = `त्यापैकी आरोपी नामे ${accusedFullDesc} यास कारागृह पोलीस, ${jailName} यांनी मा. न्यायालयासमक्ष हजर केलेले आहे.`;

  const arrestTimeStr = formData.arrestTime ? `${formData.arrestTime} वाजता ` : '';
  paragraphReplacements['मा. न्यायालयाकडुन सदर आरोपीस पोलीस ठाणे सायबर'] = `मा. न्यायालयाकडुन सदर आरोपीस ${formData.psName || 'पोलीस ठाणे सायबर, नागपूर शहर'} अपराध क्रमांक ${formData.crimeNo || '38/2026'} ${formData.actsSections || 'u/s 318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS r/w 66(c), 66(d) IT Act'} मध्ये अटक करुन त्याचेकडे तपास करण्याची परवानगी घेतल्यानंतर नमुद आरोपीला वैद्यकीय तपासणी करून माननीय सर्वोच्च न्यायालयाच्या सर्व निर्देशांचे पालन करून आरोपीचा पंचासमक्ष पंचनामा तयार करून आरोपीस आज दिनांक ${formData.arrestDate || letterDateStr} रोजी ${arrestTimeStr}खालील नमूद कारणांस्तव अटक करण्यात आलेली आहे.`;

  if (formData.relativeIntimation?.trim()) {
    paragraphReplacements['आरोपीस अटक करताना लेखी सूचनापत्र'] = `आरोपीस अटक करताना लेखी सूचनापत्र देण्यात आलेले आहे तसेच अटकेबाबत आरोपीचे नातेवाईक ${formData.relativeIntimation} यांना माहिती देण्यात आलेली आहे.`;
  }

  docXml = batchReplaceParagraphs(docXml, paragraphReplacements);

  // Exact direct string replacements
  const directReplacements = {
    '२९-०७-२०२६': letterDateStr,
    '29-07-2026': letterDateStr,
    '38/2026': formData.crimeNo || '38/2026',
    'IndusInd Bank': formData.bankName || 'IndusInd Bank',
    '259109855949': formData.accountNo || '259109855949',
    'CNRBR52026032380902224': formData.txnId || 'CNRBR52026032380902224',
    'Annkutgrains Private Limited': formData.accountName || formData.companyName || 'Annkutgrains Private Limited'
  };

  if (formData.branchName?.trim()) {
    directReplacements['Indore'] = formData.branchName;
  }
  if (formData.txnAmount?.trim()) {
    directReplacements['13,00,000/-'] = formData.txnAmount.endsWith('/-') ? formData.txnAmount : `${formData.txnAmount}/-`;
  }
  if (formData.accountAddress?.trim()) {
    directReplacements['Shop no. 105 to 108, 24/2 Modi tower, M.G R OAD, MG road, Indore, Indore, Madhya Prades INDAURA MADHYA PRADESH INDIA 452001'] = formData.accountAddress;
  }

  docXml = batchReplaceInDocXml(docXml, directReplacements);

  zip.file('word/document.xml', docXml);
  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}
