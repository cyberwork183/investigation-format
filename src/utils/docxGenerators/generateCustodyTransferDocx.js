/**
 * generateCustodyTransferDocx.js
 * Generates official Accused Custody Transfer / Release Request Letter DOCX from master template.
 */

import JSZip from 'jszip';
import { loadTemplateBuffer, replaceParagraphTextByMatch, ensureXmlNamespaces } from './commonDocxUtils.js';
import { CUSTODY_TRANSFER_TEMPLATE_BASE64 } from '../allTemplatesBase64.js';

export async function generateCustodyTransferDocx(formData) {
  const templateBuf = await loadTemplateBuffer(
    ['/template/custody-transfer-master.docx', 'template/custody-transfer-master.docx'],
    CUSTODY_TRANSFER_TEMPLATE_BASE64
  );

  const zip = await JSZip.loadAsync(templateBuf);
  let docXml = await zip.file('word/document.xml').async('text');

  const letterDateStr = formData.letterDate || '२८-०३-२०२६';
  const aliasPart = formData.accusedAlias ? ` उर्फ ${formData.accusedAlias}` : '';
  const fatherPart = formData.accusedFather ? ` पिता ${formData.accusedFather}` : '';
  const agePart = formData.accusedAge ? ` वय ${formData.accusedAge} वर्षे` : '';
  const addressPart = formData.accusedAddress ? `, पत्ता – ${formData.accusedAddress}` : '';
  const custodyPart = formData.custodyNote || 'हा सध्या पोलीस कोठडीत असुन त्याला आपले पोलीस ठाण्याच्या बंदीगृह (लॉकअप) मध्ये ठेवण्यात आलेले आहे.';
  const accusedFull = `उपरोक्त विषय सादर आहे की, ${formData.sendingStation || 'पोलीस ठाणे सायबर, नागपूर शहर'} अपराध क्रमांक ${formData.crimeNo || '108/2025'} कलम ${formData.actsSections || '318(2) BNS'} मध्ये आरोपी नामे ${formData.accusedName || 'प्रेमसुख'}${aliasPart}${fatherPart}${agePart}${addressPart} ${custodyPart}`;
  const refFull = `संदर्भ - ${formData.sendingStation || 'पोलीस ठाणे सायबर, नागपुर शहर'} अपराध क्रमांक ${formData.crimeNo || '108/2025'} कलम ${formData.actsSections || '318(2) BNS'}`;

  docXml = replaceParagraphTextByMatch(docXml, (t) => t.startsWith('दिनांक') || (t.includes('दिनांक') && !t.includes('सादर')), `दिनांक ${letterDateStr}`);
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.trim() === 'पोलीस निरीक्षक,' || t.trim() === 'पोलीस निरीक्षक', formData.addresseeRank || 'पोलीस निरीक्षक,');
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('पोलीस ठाणे सदर'), formData.addresseeStation || 'पोलीस ठाणे सदर,');
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.trim() === 'नागपूर शहर', formData.addresseeCity || 'नागपूर शहर');
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('संदर्भ -'), refFull);
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('उपरोक्त विषय सादर आहे'), accusedFull);
  if (formData.prayerText?.trim()) {
    docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('तरी नमुद आरोपी') || t.includes('आरोपी ताब्यात मिळण्यास विनंती आहे'), formData.prayerText);
  }
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.trim() === 'पोलीस ठाणे सायबर नागपूर शहर' || t.trim() === 'पोलीस ठाणे सायबर, नागपुर शहर', formData.ioStation || formData.sendingStation || 'पोलीस ठाणे सायबर नागपूर शहर');

  docXml = ensureXmlNamespaces(docXml);
  zip.file('word/document.xml', docXml);
  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}

