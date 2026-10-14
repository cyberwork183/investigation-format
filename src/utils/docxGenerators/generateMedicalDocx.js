/**
 * generateMedicalDocx.js
 * Generates official Medical Examination Request Letter DOCX from master template.
 */

import JSZip from 'jszip';
import {
  loadTemplateBuffer,
  replaceParagraphTextByMatch,
  ensureXmlNamespaces,
  updateStandardOfficerSignature,
  getAllAccusedList,
  formatSingleAccused,
  formatAllAccusedListText
} from './commonDocxUtils.js';
import { MEDICAL_TEMPLATE_BASE64 } from '../allTemplatesBase64.js';

export async function generateMedicalDocx(formData) {
  const templateBuf = await loadTemplateBuffer(
    ['/template/medical-letter-master.docx', 'template/medical-letter-master.docx'],
    MEDICAL_TEMPLATE_BASE64
  );

  const zip = await JSZip.loadAsync(templateBuf);
  let docXml = await zip.file('word/document.xml').async('text');

  const letterDateStr = formData.letterDate || '३०-०३-२०२६';
  const accusedList = getAllAccusedList(formData);
  if (accusedList.length === 0) {
    accusedList.push({
      accusedName: 'प्रेमसुख',
      accusedAlias: 'प्रेम',
      accusedFather: 'भाकर राम बिष्णोई',
      accusedAge: '२०',
      accusedAddress: 'जंबेश्वर नगरी, गाव मोटाई, पो. ठाणे चाखू, जि. फलोदी, राजस्थान'
    });
  }

  const isMulti = accusedList.length > 1;
  const accusedFull = isMulti
    ? `आरोपीचे नाव -\n${formatAllAccusedListText(accusedList, { includeNumberForSingle: true })}`
    : `आरोपीचे नाव - ${formatSingleAccused(accusedList[0])}`;

  const statusText = formData.accusedStatus === 'to_be_arrested'
    ? (isMulti ? 'मध्ये खालील आरोपींना अटक करावयाची आहे.' : 'मध्ये खालील आरोपीस अटक करावयाची आहे.')
    : (isMulti ? 'मध्ये खालील आरोपींना अटक करण्यात आलेले असुन ते सध्या पोलीस कोठडीत आहेत.' : 'मध्ये खालील आरोपीस अटक करण्यात आलेले असुन तो सध्या पोलीस कोठडीत आहे.');

  const subjectFull = `विषय- ${formData.policeStation || 'पोलीस ठाणे सायबर, नागपूर शहर'} अपराध क्रमांक ${formData.crimeNo || '108/2025'} कलम ${formData.actsSections || '318(2) BNS'} मधील ${isMulti ? 'आरोपींची' : 'आरोपीची'} सर्वसाधारण वैद्यकीय तपासणी करणे बाबत`;
  const bodyFull = `उपरोक्त विषय सादर आहे की, ${formData.policeStation || 'पोलीस ठाणे सायबर, नागपूर शहर'} अपराध क्रमांक ${formData.crimeNo || '108/2025'} कलम ${formData.actsSections || '318(2) BNS'} ${statusText}`;

  docXml = replaceParagraphTextByMatch(docXml, (t) => t.startsWith('दिनांक') || (t.includes('दिनांक') && !t.includes('सादर')), `दिनांक ${letterDateStr}`);
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('वैद्यकीय अधिकारी'), formData.addresseeOfficer || 'वैद्यकीय अधिकारी,');
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('जिल्हा सामान्य रुग्णालय'), formData.addresseeHospital || 'जिल्हा सामान्य रुग्णालय,');
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.trim() === 'नागपूर शहर', formData.addresseeCity || 'नागपूर शहर');
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('वैद्यकीय तपासणी करणे बाबत'), subjectFull);
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('उपरोक्त विषय सादर आहे'), bodyFull);
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('आरोपीचे नाव'), accusedFull);
  
  // Dynamically populate Officer details in signature block (Name, Rank, Buckle No, Station)
  docXml = updateStandardOfficerSignature(docXml, formData);

  docXml = ensureXmlNamespaces(docXml);
  zip.file('word/document.xml', docXml);
  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}

