/**
 * generateRemandDocx.js
 * Generates official Police Custody Remand (PCR) Application DOCX from master template.
 */

import JSZip from 'jszip';
import { loadTemplateBuffer, batchReplaceParagraphs, batchReplaceInDocXml } from './commonDocxUtils.js';
import { REMAND_TEMPLATE_BASE64 } from '../allTemplatesBase64.js';

export async function generateRemandDocx(formData) {
  const templateBuf = await loadTemplateBuffer(
    ['/template/remand-application-master.docx', 'template/remand-application-master.docx'],
    REMAND_TEMPLATE_BASE64
  );

  const zip = await JSZip.loadAsync(templateBuf);
  let docXml = await zip.file('word/document.xml').async('text');

  const letterDateStr = formData.letterDate || '२९-०७-२०२६';
  const complainantFull = `${formData.complainantName || 'श्रद्धा नथुजी झोडापे'}${formData.complainantAge ? ', वय ' + formData.complainantAge + ' वर्षे' : ''}${formData.complainantProfession ? ', व्यवसाय ' + formData.complainantProfession : ''}${formData.complainantAddress ? ', पत्ता – ' + formData.complainantAddress : ''}`;
  const accusedFull = `${formData.accusedName || 'संदीप भानुदास मोरे'}${formData.accusedAge ? ', वय ' + formData.accusedAge + ' वर्षे' : ''}${formData.accusedAddress ? ', पत्ता – ' + formData.accusedAddress : ''}`;
  const ioFull = `${formData.ioName ? formData.ioName + ', ' : ''}${formData.ioRank || 'वरीष्ठ पोलीस निरीक्षक'}, ${formData.ioStation || formData.policeStationHeader || 'पोलीस ठाणे सायबर, नागपूर शहर'}`;
  const crimeFull = `${formData.policeStationHeader || 'पोलीस ठाणे सायबर, नागपूर शहर'} अपराध क्रमांक ${formData.crimeNo || '38/2026'} ${formData.actsSections || 'भारतीय न्याय संहीता कलम 318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS r/w 66(c), 66(d) IT Act'}`;

  // Paragraph-level replacements
  const paragraphReplacements = {
    'श्रद्धा नथुजी': complainantFull,
    'संदीप भानुदास': accusedFull,
    'सुरेश डांबरे, वरिष्ठ': ioFull,
    'सुरेश डांबरे, वरीष्ठ': ioFull,
    'पोलीस स्टेशन सायबर,': formData.psName || formData.policeStationHeader || 'पोलीस स्टेशन सायबर, नागपूर शहर',
    '38/2026 भारतीय': crimeFull,
    'रु. 13,00,100': formData.fraudAmount || 'रु. 0/-',
    'रु. 13,00,000': formData.refundedAmount || 'रु. 0/-',
    'फिर्यादीचे राहते': formData.crimeScene || 'फिर्यादीचे राहते घरी',
    'दिनांक 22/03/2026': formData.incidentDateTime || 'दिनांक 22/03/2026 चे 10:04 ते दि. 24/03/2026 चे 09:00 वा. पावेतो',
    'दि. 27/03/2026': formData.filingDateTime || letterDateStr,
    '5 दिवस पोलीस': `विषय        -   ${formData.remandDays || 5} दिवस पोलीस कोठडी मिळणेबाबत`,
    '५ दिवस पोलीस': `विषय        -   ${formData.remandDays || 5} दिवस पोलीस कोठडी मिळणेबाबत`,
    'सहा. सरकारी अभियोक्ता': formData.throughProsecutor || 'सहा. सरकारी अभियोक्ता, न्यायालय प्रथमवर्ग क्रमांक 10, नागपुर शहर'
  };

  if (formData.caseBrief?.trim()) {
    paragraphReplacements['दिनांक २२-०३-२०२६'] = formData.caseBrief;
  }

  if (formData.relativeIntimation?.trim()) {
    paragraphReplacements['आरोपीस अटक करताना लेखी सूचनापत्र'] = `आरोपीस अटक करताना लेखी सूचनापत्र देण्यात आलेले आहे तसेच अटकेबाबत आरोपीचे नातेवाईक ${formData.relativeIntimation} यांना माहिती देण्यात आलेली आहे.`;
  }

  docXml = batchReplaceParagraphs(docXml, paragraphReplacements);

  // Exact string replacements for remaining spots
  const directReplacements = {
    '२९-०७-२०२६': letterDateStr,
    '29-07-2026': letterDateStr,
    '38/2026': formData.crimeNo || '38/2026',
    '(सुरेश डांबरे)': formData.ioName ? `(${formData.ioName})` : '(                   )',
    'IndusInd Bank': formData.bankName || 'IndusInd Bank',
    '259109855949': formData.bankAccountNo || '259109855949',
    'CNRBR52026032380902224': formData.txnIdUtr || 'CNRBR52026032380902224',
    'Annkutgrains Private Limited': formData.accountHolderName || 'Annkutgrains Private Limited'
  };

  docXml = batchReplaceInDocXml(docXml, directReplacements);

  zip.file('word/document.xml', docXml);
  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}
