/**
 * generateNotice47Docx.js
 * Generates official Section 47 BNSS Notice to Accused DOCX from master template.
 */

import JSZip from 'jszip';
import {
  loadTemplateBuffer,
  batchReplaceParagraphs,
  batchReplaceInDocXml,
  removeBankTablesFromXml,
  removeParagraphsBySnippets,
  replaceParagraphWithXml,
  buildThreeInvestigationSectionsXml,
  formatBuckleNumber
} from './commonDocxUtils.js';
import { NOTICE_47_TEMPLATE_BASE64 } from '../allTemplatesBase64.js';

export async function generateNotice47Docx(formData) {
  const templateBuf = await loadTemplateBuffer(
    ['/template/notice-47-master.docx', 'template/notice-47-master.docx', '/template/४७ नोटीस.docx', 'template/४७ नोटीस.docx'],
    NOTICE_47_TEMPLATE_BASE64
  );

  const zip = await JSZip.loadAsync(templateBuf);
  let docXml = await zip.file('word/document.xml').async('text');

  const letterDateStr = formData.letterDate || '२९-०७-२०२६';
  const accusedNameAge = `आरोपीचे नाव - ${formData.accusedName || 'संदीप भानुदास मोरे'}${formData.accusedAge ? ', वय ' + formData.accusedAge + ' वर्षे,' : ''}`;
  const accusedAddressStr = `पत्ता – ${formData.accusedAddress || 'हाऊस नं. ७५८/९, गल्ली नं. ९, अटल गेट, नेहरु नगर, इंदौर, मध्य प्रदेश'}`;
  const psCrimeFull = `संदर्भ - ${formData.psName || 'पोलीस ठाणे सायबर, नागपुर शहर'} अपराध क्रमांक ${formData.crimeNo || '38/2026'} ${formData.actsSections || 'u/s 318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS r/w 66(c), 66(d) IT Act'}`;
  
  const complainantFull = `शिकायतकर्ता ${formData.complainantName || 'श्रद्धा नथुजी झोडापे'}${formData.complainantAge ? ', वय ' + formData.complainantAge + ' वर्षे' : ''}${formData.complainantProfession ? ', व्यवसाय ' + formData.complainantProfession : ''}${formData.complainantAddress ? ', पत्ता – ' + formData.complainantAddress : ''}`;
  const complaintDateStr = formData.complaintDate || formData.letterDate || '२७-०३-२०२६';

  const complainantNoticeStr = `आपको सूचित किया जाता है कि, ${complainantFull} इन के द्वारा तारीख ${complaintDateStr} को दर्ज शिकायत के आधार पर, पुलिस स्टेशन ${formData.psName || 'साइबर नागपुर शहर'} में अपराध क्रमांक ${formData.crimeNo || '38/2026'} ${formData.actsSections || 'u/s 318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS r/w 66(c), 66(d) IT Act'} के तहत पुलिस स्टेशन ${formData.psName || 'साइबर नागपुर शहर'} यहापर अपराध दर्ज है, उक्त अपराध में शिकायत संक्षेप में इस प्रकार है,;`;

  const arrestTimeStr = formData.arrestTime || '----------';
  const arrestDateStr = formData.arrestDate || letterDateStr;
  const arrestStatementStr = `ऊपर दिए गए मामले की जांच के दौरान, यह सामने आया है की, आप इस जुर्म में शामिल हैं, इसलिए आपको नीचे दिए गए कारणों से ${arrestDateStr} को ${arrestTimeStr} बजे गिरफ्तार किया जाता है।`;

  const courtNameStr = formData.courtName || 'माननीय न्यायालय, प्रथमवर्ग क्रमांक १०, नागपुर शहर';
  const courtDateStr = formData.courtProductionDate || arrestDateStr;
  const relativeStr = formData.relativeIntimation || '----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------';
  const bailRightsStr = `आपको ${courtDateStr} को ${courtNameStr} के सामने पेश किया जाएगा। ऊपर दिया गया जुर्म नॉन-बेलेबल है। आप इस नॉन-बेलेबल जुर्म के लिए कोर्ट में बेल के लिए आवेदन कर सकते हैं। आपकी गिरफ्तारी की जानकारी आपके रिश्तेदार ${relativeStr} को दे दी गई है। गिरफ्तारी का आधार और कारण भी बताए गए हैं।`;

  // 1. Remove bank tables
  docXml = removeBankTablesFromXml(docXml);

  // 2. Remove obsolete bank & legacy grounds paragraphs
  docXml = removeParagraphsBySnippets(docXml, [
    '१) उपरोक्त मामले मे ठगी किए गए पैसे IndusInd Bank',
    'यह खाता Annkutgrains Private Limited',
    'डायरेक्टर के नाम',
    '१) संदीप भानुदास मोरे, वय ४२ वर्षे, पत्ता',
    '२) अजय पि. पुरुषोत्तम सिंह तोमर',
    'आपके कंपनी के खाते मे पैसा लिया गया है',
    'गिरफ्तारी के आधार:-',
    'आरोपी को गिरफ्तार करने के कारण इस प्रकार हैं:-',
    '१) आपके कंपनी के (IndusInd Bank Account number',
    '२) पिडीता से किसने सरकारी अधिकारी बनकर बातचीत की',
    '३) इस बात की अभी और जांच बाकी है कि इस अकाउंट में पैसे',
    '४) अभी और जांच होनी बाकी है ताकि पता चल सके कि आपने इस तरह',
    '५) अभी यह जांच होनी बाकी है कि इन अपराधों में आपके साथ',
    '६) इस क्राइम में और कौन-कौन शामिल है',
    '७) जुर्म के फिजिकल और टेक्निकल सबूत ज़ब्त करना।',
    '८) आरोपी को आगे कोई जुर्म करने से रोकना',
    '९) जुर्म के सबूतों को खराब होने से बचाना',
    '१०) आरोपी को किसी ऐसे व्यक्ति को',
    '११) अगर आरोपी को गिरफ्तार नहीं किया जाता है'
  ]);

  // 3. Insert the three sections in order in place of the old narrative/bank area
  const threeSectionsXml = buildThreeInvestigationSectionsXml(formData);
  docXml = replaceParagraphWithXml(docXml, 'दिनांक २२-०३-२०२६', threeSectionsXml);

  // 4. Paragraph-level replacements
  const paragraphReplacements = {
    'आरोपीचे नाव - संदीप भानुदास': accusedNameAge,
    'पत्ता – हाऊस नं. ७५८/९': accusedAddressStr,
    'संदर्भ - पोलीस ठाणे सायबर': psCrimeFull,
    'आपको सूचित किया जाता है कि, शिकायतकर्ता': complainantNoticeStr,
    'ऊपर दिए गए मामले की जांच के दौरान, यह सामने आया है की, आप इस जुर्म': arrestStatementStr,
    'आपको २९-०७-२०२६ को माननीय न्यायालय': bailRightsStr
  };

  const buckleStr = formatBuckleNumber(formData.ioBuckleNo);
  paragraphReplacements['(सुरेश डांबरे)'] = formData.ioName ? `(${formData.ioName})` : '(                   )';
  paragraphReplacements['सुरेश डांबरे'] = formData.ioName ? `(${formData.ioName})` : '(                   )';
  paragraphReplacements['वरीष्ठ पोलीस निरीक्षक'] = `${formData.ioRank || 'वरीष्ठ पोलीस निरीक्षक'}${buckleStr}`;
  paragraphReplacements['पोलीस ठाणे सायबर, नागपुर शहर'] = formData.ioStation || formData.psName || 'पोलीस ठाणे सायबर, नागपुर शहर';

  docXml = batchReplaceParagraphs(docXml, paragraphReplacements);

  // 5. Exact direct string replacements
  const directReplacements = {
    '२९-०७-२०२६': letterDateStr,
    '29-07-2026': letterDateStr,
    '38/2026': formData.crimeNo || '38/2026',
    '(सुरेश डांबरे)': formData.ioName ? `(${formData.ioName})` : '(                   )'
  };

  docXml = batchReplaceInDocXml(docXml, directReplacements);

  zip.file('word/document.xml', docXml);
  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}
