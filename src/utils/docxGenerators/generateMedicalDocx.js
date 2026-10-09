/**
 * generateMedicalDocx.js
 * Generates official Medical Examination Request Letter DOCX from master template.
 */

import JSZip from 'jszip';
import { loadTemplateBuffer, replaceParagraphTextByMatch, ensureXmlNamespaces } from './commonDocxUtils.js';
import { MEDICAL_TEMPLATE_BASE64 } from '../allTemplatesBase64.js';

export async function generateMedicalDocx(formData) {
  const templateBuf = await loadTemplateBuffer(
    ['/template/medical-letter-master.docx', 'template/medical-letter-master.docx'],
    MEDICAL_TEMPLATE_BASE64
  );

  const zip = await JSZip.loadAsync(templateBuf);
  let docXml = await zip.file('word/document.xml').async('text');

  const letterDateStr = formData.letterDate || '३०-०३-२०२६';
  const aliasPart = formData.accusedAlias ? ` उर्फ ${formData.accusedAlias}` : '';
  const fatherPart = formData.accusedFather ? ` पिता/पालक ${formData.accusedFather}` : '';
  const agePart = formData.accusedAge ? `, वय ${formData.accusedAge} वर्षे` : '';
  const addressPart = formData.accusedAddress ? `, पत्ता – ${formData.accusedAddress}` : '';
  const accusedFull = `आरोपीचे नाव - ${formData.accusedName || 'प्रेमसुख'}${aliasPart}${fatherPart}${agePart}${addressPart}`;

  const statusText = formData.accusedStatus === 'to_be_arrested'
    ? 'मध्ये खालील आरोपीस अटक करावयाची आहे.'
    : 'मध्ये खालील आरोपीस अटक करण्यात आलेले असुन तो सध्या पोलीस कोठडीत आहे.';

  const subjectFull = `विषय- ${formData.policeStation || 'पोलीस ठाणे सायबर, नागपूर शहर'} अपराध क्रमांक ${formData.crimeNo || '108/2025'} कलम ${formData.actsSections || '318(2) BNS'} मधील आरोपीची सर्वसाधारण वैद्यकीय तपासणी करणे बाबत`;
  const bodyFull = `उपरोक्त विषय सादर आहे की, ${formData.policeStation || 'पोलीस ठाणे सायबर, नागपूर शहर'} अपराध क्रमांक ${formData.crimeNo || '108/2025'} कलम ${formData.actsSections || '318(2) BNS'} ${statusText}`;

  docXml = replaceParagraphTextByMatch(docXml, (t) => t.startsWith('दिनांक') || (t.includes('दिनांक') && !t.includes('सादर')), `दिनांक ${letterDateStr}`);
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('वैद्यकीय अधिकारी'), formData.addresseeOfficer || 'वैद्यकीय अधिकारी,');
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('जिल्हा सामान्य रुग्णालय'), formData.addresseeHospital || 'जिल्हा सामान्य रुग्णालय,');
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.trim() === 'नागपूर शहर', formData.addresseeCity || 'नागपूर शहर');
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('वैद्यकीय तपासणी करणे बाबत'), subjectFull);
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('उपरोक्त विषय सादर आहे'), bodyFull);
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('आरोपीचे नाव'), accusedFull);
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.trim() === 'पोलीस निरीक्षक' || t.trim() === 'पोलीस उपनिरीक्षक' || t.trim() === 'वरीष्ठ पोलीस निरीक्षक', formData.ioRank || 'पोलीस निरीक्षक');
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.trim() === 'पोलीस ठाणे सायबर नागपूर शहर' || t.trim() === 'पोलीस ठाणे सायबर, नागपुर शहर', formData.ioStation || formData.policeStation || 'पोलीस ठाणे सायबर नागपूर शहर');

  docXml = ensureXmlNamespaces(docXml);
  zip.file('word/document.xml', docXml);
  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}

