/**
 * generateArrestPermissionDocx.js
 * Generates official Permission to Arrest Application DOCX from master template.
 */

import JSZip from 'jszip';
import {
  loadTemplateBuffer,
  replaceParagraphTextByMatch,
  ensureXmlNamespaces,
  formatBuckleNumber,
  getAllAccusedList,
  formatSingleAccused,
  formatAllAccusedListText
} from './commonDocxUtils.js';
import { ARREST_PERMISSION_TEMPLATE_BASE64 } from '../allTemplatesBase64.js';

export async function generateArrestPermissionDocx(formData) {
  const templateBuf = await loadTemplateBuffer(
    ['/template/arrest-permission-master.docx', 'template/arrest-permission-master.docx'],
    ARREST_PERMISSION_TEMPLATE_BASE64
  );

  const zip = await JSZip.loadAsync(templateBuf);
  let docXml = await zip.file('word/document.xml').async('text');

  const letterDateStr = formData.letterDate || '29-07-2026';
  const buckleStr = formatBuckleNumber(formData.ioBuckleNo);
  const reporterFull = formData.reporter || `${formData.ioName ? formData.ioName + ', ' : ''}${formData.ioRank || 'वरीष्ठ पोलीस निरीक्षक'}${buckleStr}, ${formData.ioStation || formData.policeStationHeader || 'पोलीस ठाणे सायबर, नागपूर शहर'}`;
  const refFull = `संदर्भ- ${formData.policeStationHeader || 'पोलीस ठाणे सायबर नागपुर शहर'} अपराध क्रमांक ${formData.crimeNo || '38/2026'} ${formData.actsSections || 'u/s 318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS r/w 66(c), 66(d) IT Act'}`;

  const accusedList = getAllAccusedList(formData);
  const isMulti = accusedList.length > 1;
  const authority = formData.producingAuthority || 'कारागृह पोलीस, तिहार कारागृह, दिल्ली';

  let producedAccusedText = '';
  if (isMulti) {
    producedAccusedText = `त्यापैकी आरोपी नामे\n${formatAllAccusedListText(accusedList, { includeNumberForSingle: true })}\nयांना ${authority} यांनी मा. न्यायालयासमक्ष हजर केलेले आहे.`;
  } else if (accusedList.length === 1) {
    producedAccusedText = `त्यापैकी आरोपी नामे ${formatSingleAccused(accusedList[0])} यास ${authority} यांनी मा. न्यायालयासमक्ष हजर केलेले आहे.`;
  } else {
    const raw = formData.producedAccusedName || formData.accusedListText || 'संदीप भानुदास मोरे, वय ४२ वर्षे, पत्ता – हाऊस नं. ७५८/९, गल्ली नं. ९, अटल गेट, नेहरु नगर, इंदौर, मध्य प्रदेश';
    producedAccusedText = `त्यापैकी आरोपी नामे ${raw} यास ${authority} यांनी मा. न्यायालयासमक्ष हजर केलेले आहे.`;
  }

  docXml = replaceParagraphTextByMatch(docXml, (t) => t.startsWith('दिनांक') || (t.includes('दिनांक') && !t.includes('सादर')), `दिनांक ${letterDateStr}`);
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('प्रतिवेदक'), `प्रतिवेदक      -   ${reporterFull}`);
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('संदर्भ-'), refFull);
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('त्यापैकी आरोपी नामे'), producedAccusedText);

  if (formData.accusedListText?.trim() && formData.priorCaseDetails?.trim()) {
    docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('उपरोक्त संदर्भीय विषयास'), `उपरोक्त संदर्भीय विषयास अनुसरून सविनय सादर की, आरोपी नामे ${formData.accusedListText} ${formData.priorCaseDetails}`);
  }

  if (formData.groundsText?.trim()) {
    docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('सदर आरोपीस पोलीस ठाणे') || t.includes('परवानगी मिळण्यास विनंती आहे'), formData.groundsText);
  } else if (isMulti) {
    const multiGrounds = `सदर आरोपींना ${formData.policeStationHeader || 'पोलीस ठाणे सायबर, नागपूर शहर'} अपराध क्रमांक ${formData.crimeNo || '38/2026'} ${formData.actsSections || 'u/s 318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS r/w 66(c), 66(d) IT Act'} मध्ये अटक करुन त्यांचेकडे तपास करणे आवश्यक असल्याने आरोपी नामे\n${formatAllAccusedListText(accusedList, { includeNumberForSingle: true })}\nयांचा ताबा आमचेकडे देऊन त्यांना नमुद गुन्ह्यात अटक करण्याची परवानगी मिळण्यास विनंती आहे.`;
    docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('सदर आरोपीस पोलीस ठाणे') || t.includes('परवानगी मिळण्यास विनंती आहे'), multiGrounds);
  }

  // Signature Block: Officer Name, Rank with Buckle Number, and Station
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('(सुरेश डांबरे)') || t.includes('(                      )'), formData.ioName ? `(${formData.ioName})` : '(                      )');
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.trim() === 'वरीष्ठ पोलीस निरीक्षक' || t.trim() === 'पोलीस निरीक्षक', `${formData.ioRank || 'वरीष्ठ पोलीस निरीक्षक'}${buckleStr}`);
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('पोलीस ठाणे सायबर, नागपुर शहर') || t.includes('पोलीस ठाणे सायबर नागपूर शहर'), formData.ioStation || formData.policeStationHeader || 'पोलीस ठाणे सायबर, नागपूर शहर');

  docXml = ensureXmlNamespaces(docXml);
  zip.file('word/document.xml', docXml);
  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}

