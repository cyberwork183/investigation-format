/**
 * generateLockupPsDocx.js
 * Generates official Lockup Placement Request Letter (to Police Station) DOCX from master template.
 */

import JSZip from 'jszip';
import { loadTemplateBuffer, replaceParagraphTextByMatch, ensureXmlNamespaces } from './commonDocxUtils.js';
import { LOCKUP_PS_TEMPLATE_BASE64 } from '../allTemplatesBase64.js';

export async function generateLockupPsDocx(formData) {
  const templateBuf = await loadTemplateBuffer(
    ['/template/lockup-placement-ps-master.docx', 'template/lockup-placement-ps-master.docx'],
    LOCKUP_PS_TEMPLATE_BASE64
  );

  const zip = await JSZip.loadAsync(templateBuf);
  let docXml = await zip.file('word/document.xml').async('text');

  const letterDateStr = formData.letterDate || '२९-०३-२०२६';
  const aliasPart = formData.accusedAlias ? ` उर्फ ${formData.accusedAlias}` : '';
  const fatherPart = formData.accusedFather ? ` पिता ${formData.accusedFather}` : '';
  const agePart = formData.accusedAge ? ` वय ${formData.accusedAge} वर्षे` : '';
  const addressPart = formData.accusedAddress ? `, पत्ता – ${formData.accusedAddress}` : '';
  const accusedFull = `उपरोक्त विषय सादर आहे की, ${formData.sendingStation || 'पोलीस ठाणे सायबर, नागपूर शहर'} अपराध क्रमांक ${formData.crimeNo || '108/2025'} कलम ${formData.actsSections || '318(2) BNS'} मध्ये आरोपी नामे ${formData.accusedName || 'प्रेमसुख'}${aliasPart}${fatherPart}${agePart}${addressPart} याला अटक केलेले असुन नमुद आरोपी सध्या पोलीस कोठडीत आहे.`;
  const refFull = `संदर्भ - ${formData.sendingStation || 'पोलीस ठाणे सायबर, नागपुर शहर'} अपराध क्रमांक ${formData.crimeNo || '108/2025'} कलम ${formData.actsSections || '318(2) BNS'}`;

  docXml = replaceParagraphTextByMatch(docXml, (t) => t.startsWith('दिनांक') || (t.includes('दिनांक') && !t.includes('सादर')), `दिनांक ${letterDateStr}`);
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.trim() === 'पोलीस निरीक्षक,' || t.trim() === 'पोलीस निरीक्षक', formData.addresseeRank || 'पोलीस निरीक्षक,');
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('पोलीस ठाणे सदर'), formData.addresseeStation || 'पोलीस ठाणे सदर,');
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.trim() === 'नागपूर शहर', formData.addresseeCity || 'नागपूर शहर');
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('संदर्भ -'), refFull);
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('उपरोक्त विषय सादर आहे'), accusedFull);
  if (formData.reasonText?.trim()) {
    docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('बंदीगृह (लॉकअप) नसल्याने') || t.includes('बंदिगृहात (लॉकअपमध्ये)'), formData.reasonText);
  }
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.trim() === 'पोलीस ठाणे सायबर नागपूर शहर' || t.trim() === 'पोलीस ठाणे सायबर, नागपुर शहर', formData.ioStation || formData.sendingStation || 'पोलीस ठाणे सायबर नागपूर शहर');

  docXml = ensureXmlNamespaces(docXml);
  zip.file('word/document.xml', docXml);
  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}

