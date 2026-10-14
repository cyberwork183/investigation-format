/**
 * generateLockupAcpDocx.js
 * Generates official Lockup Placement Intimation Letter (to ACP) DOCX from master template.
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
import { LOCKUP_ACP_TEMPLATE_BASE64 } from '../allTemplatesBase64.js';

export async function generateLockupAcpDocx(formData) {
  const templateBuf = await loadTemplateBuffer(
    ['/template/lockup-placement-acp-master.docx', 'template/lockup-placement-acp-master.docx'],
    LOCKUP_ACP_TEMPLATE_BASE64
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
  const accusedFull = isMulti
    ? `उपरोक्त विषय सादर आहे की, ${formData.sendingStation || 'पोलीस ठाणे सायबर, नागपूर शहर'} अपराध क्रमांक ${formData.crimeNo || '108/2025'} कलम ${formData.actsSections || '318(2) BNS'} मध्ये आरोपी नामे\n${formatAllAccusedListText(accusedList, { includeNumberForSingle: true })}\nयांना अटक केलेले असुन नमुद आरोपी सध्या पोलीस कोठडीत आहेत.`
    : `उपरोक्त विषय सादर आहे की, ${formData.sendingStation || 'पोलीस ठाणे सायबर, नागपूर शहर'} अपराध क्रमांक ${formData.crimeNo || '108/2025'} कलम ${formData.actsSections || '318(2) BNS'} मध्ये आरोपी नामे ${formatSingleAccused(accusedList[0])} याला अटक केलेले असुन नमुद आरोपी सध्या पोलीस कोठडीत आहे.`;
  const refFull = `संदर्भ - ${formData.sendingStation || 'पोलीस ठाणे सायबर, नागपुर शहर'} अपराध क्रमांक ${formData.crimeNo || '108/2025'} कलम ${formData.actsSections || '318(2) BNS'}`;

  docXml = replaceParagraphTextByMatch(docXml, (t) => t.startsWith('दिनांक') || (t.includes('दिनांक') && !t.includes('सादर')), `दिनांक ${letterDateStr}`);
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('सहा. पोलीस आयुक्त'), formData.addresseeRank || 'मा. सहा. पोलीस आयुक्त,');
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('गुन्हे, नागपूर शहर'), formData.addresseeOffice || 'गुन्हे, नागपूर शहर');
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('संदर्भ -'), refFull);
  docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('उपरोक्त विषय सादर आहे'), accusedFull);
  if (formData.reasonText?.trim()) {
    docXml = replaceParagraphTextByMatch(docXml, (t) => t.includes('बंदीगृह (लॉकअप) नसल्याने') || t.includes('बंदिगृहात (लॉकअपमध्ये)'), formData.reasonText);
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

