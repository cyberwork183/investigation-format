/**
 * generateCustodyTransferDocx.js
 * Generates official Accused Custody Transfer / Release Request Letter DOCX from master template.
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
import { CUSTODY_TRANSFER_TEMPLATE_BASE64 } from '../allTemplatesBase64.js';

export async function generateCustodyTransferDocx(formData) {
  const templateBuf = await loadTemplateBuffer(
    ['/template/custody-transfer-master.docx', 'template/custody-transfer-master.docx'],
    CUSTODY_TRANSFER_TEMPLATE_BASE64
  );

  const zip = await JSZip.loadAsync(templateBuf);
  let docXml = await zip.file('word/document.xml').async('text');

  const letterDateStr = formData.letterDate || '२८-०३-२०२६';
  const accusedList = getAllAccusedList(formData);
  if (accusedList.length === 0) {
    accusedList.push({
      accusedName: 'प्रेमसुख',
      accusedAlias: 'प्रेम',
      accusedFather: 'भाकरराम बिष्णोई',
      accusedAge: '२०',
      accusedAddress: 'जंबेश्वर नगरी, मोटाई, पोलीस ठाणे चाखु, जिल्हा फलोदी, राजस्थान'
    });
  }

  const isMulti = accusedList.length > 1;
  const defaultCustody = isMulti
    ? 'हे सध्या पोलीस कोठडीत असुन त्यांना आपले पोलीस ठाण्याच्या बंदीगृह (लॉकअप) मध्ये ठेवण्यात आलेले आहे.'
    : 'हा सध्या पोलीस कोठडीत असुन त्याला आपले पोलीस ठाण्याच्या बंदीगृह (लॉकअप) मध्ये ठेवण्यात आलेले आहे.';
  const custodyPart = formData.custodyNote || defaultCustody;

  const accusedFull = isMulti
    ? `उपरोक्त विषय सादर आहे की, ${formData.sendingStation || 'पोलीस ठाणे सायबर, नागपूर शहर'} अपराध क्रमांक ${formData.crimeNo || '108/2025'} कलम ${formData.actsSections || '318(2) BNS'} मध्ये आरोपी नामे\n${formatAllAccusedListText(accusedList, { includeNumberForSingle: true })}\n${custodyPart}`
    : `उपरोक्त विषय सादर आहे की, ${formData.sendingStation || 'पोलीस ठाणे सायबर, नागपूर शहर'} अपराध क्रमांक ${formData.crimeNo || '108/2025'} कलम ${formData.actsSections || '318(2) BNS'} मध्ये आरोपी नामे ${formatSingleAccused(accusedList[0])} ${custodyPart}`;
  const refFull = `संदर्भ - ${formData.sendingStation || 'पोलीस ठाणे सायबर, नागपुर शहर'} अपराध क्रमांक ${formData.crimeNo || '108/2025'} कलम ${formData.actsSections || '318(2) BNS'}`;

  docXml = replaceParagraphTextByMatch(docXml, (t) => t.startsWith('दिनांक') || (t.includes('दिनांक') && !t.includes('सादर')), `दिनांक ${letterDateStr}`);
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.trim() === 'पोलीस निरीक्षक,', formData.addresseeRank || 'पोलीस निरीक्षक,');
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('पोलीस ठाणे सदर'), formData.addresseeStation || 'पोलीस ठाणे सदर,');
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.trim() === 'नागपूर शहर', formData.addresseeCity || 'नागपूर शहर');
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('संदर्भ -'), refFull);
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('उपरोक्त विषय सादर आहे'), accusedFull);
  if (formData.prayerText?.trim()) {
    docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('तरी नमुद आरोपी') || t.includes('आरोपी ताब्यात मिळण्यास विनंती आहे'), formData.prayerText);
  }

  // Dynamically populate Officer details in signature block (Name, Rank, Buckle No, Station)
  docXml = updateStandardOfficerSignature(docXml, formData);

  docXml = ensureXmlNamespaces(docXml);
  zip.file('word/document.xml', docXml);
  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}

