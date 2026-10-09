/**
 * generateNotice48Docx.js
 * Generates official Section 48 BNSS Notice to Relative / Friend DOCX from master template.
 */

import JSZip from 'jszip';
import { loadTemplateBuffer, batchReplaceParagraphs, batchReplaceInDocXml } from './commonDocxUtils.js';
import { NOTICE_48_TEMPLATE_BASE64 } from '../allTemplatesBase64.js';

export async function generateNotice48Docx(formData) {
  const templateBuf = await loadTemplateBuffer(
    ['/template/notice-48-master.docx', 'template/notice-48-master.docx', '/template/४८ नोटीस.docx', 'template/४८ नोटीस.docx'],
    NOTICE_48_TEMPLATE_BASE64
  );

  const zip = await JSZip.loadAsync(templateBuf);
  let docXml = await zip.file('word/document.xml').async('text');

  const letterDateStr = formData.letterDate || '२९-०७-२०२६';
  const psCrimeFull = `संदर्भ - ${formData.psName || 'पोलीस ठाणे सायबर, नागपुर शहर'} अपराध क्रमांक ${formData.crimeNo || '38/2026'} ${formData.actsSections || 'u/s 318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS r/w 66(c), 66(d) IT Act'}`;
  
  const complainantFull = `शिकायतकर्ता ${formData.complainantName || 'श्रद्धा नथुजी झोडापे'}${formData.complainantAge ? ', वय ' + formData.complainantAge + ' वर्षे' : ''}${formData.complainantProfession ? ', व्यवसाय ' + formData.complainantProfession : ''}${formData.complainantAddress ? ', पत्ता – ' + formData.complainantAddress : ''}`;
  const complaintDateStr = formData.complaintDate || formData.letterDate || '२७-०३-२०२६';

  const complainantNoticeStr = `आपको सूचित किया जाता है कि, ${complainantFull} इन के द्वारा तारीख ${complaintDateStr} को दर्ज शिकायत के आधार पर, पुलिस स्टेशन ${formData.psName || 'साइबर नागपुर शहर'} में अपराध क्रमांक ${formData.crimeNo || '38/2026'} ${formData.actsSections || 'u/s 318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS r/w 66(c), 66(d) IT Act'} के तहत पुलिस स्टेशन ${formData.psName || 'साइबर नागपुर शहर'} यहापर अपराध दर्ज है, उक्त अपराध में शिकायत संक्षेप में इस प्रकार है इस प्रकार है,`;

  const accusedFullDesc = `${formData.accusedName || 'संदीप भानुदास मोरे'}${formData.accusedAge ? ', वय ' + formData.accusedAge + ' वर्षे' : ''}${formData.accusedAddress ? ', पत्ता – ' + formData.accusedAddress : ''}`;
  const arrestTimeStr = formData.arrestTime || '----------';
  const arrestDateStr = formData.arrestDate || letterDateStr;
  const arrestStatementStr = `ऊपर दिए गए मामले की जांच के दौरान, यह सामने आया है की, आप का रिश्तेदार ${accusedFullDesc} इस जुर्म में शामिल हैं, इसलिए आपके रिश्तेदार को नीचे दिए गए कारणों से ${arrestDateStr} को ${arrestTimeStr} बजे गिरफ्तार किया जाता है।`;

  const courtNameStr = formData.courtName || 'माननीय न्यायालय, प्रथमवर्ग क्रमांक १०, नागपुर शहर';
  const courtDateStr = formData.courtProductionDate || arrestDateStr;
  const bailRightsStr = `आपके रिश्तेदार को ${courtDateStr} को ${courtNameStr} के सामने पेश किया जाएगा। ऊपर दिया गया जुर्म नॉन-बेलेबल है। आप इस नॉन-बेलेबल जुर्म के लिए कोर्ट में बेल के लिए आवेदन कर सकते हैं।`;

  // Paragraph-level replacements
  const paragraphReplacements = {
    'संदर्भ - पोलीस ठाणे सायबर': psCrimeFull,
    'आपको सूचित किया जाता है कि, शिकायतकर्ता': complainantNoticeStr,
    'ऊपर दिए गए मामले की जांच के दौरान, यह सामने आया है की, आप का रिश्तेदार': arrestStatementStr,
    'आपके रिश्तेदार को २९-०७-२०२६ को माननीय न्यायालय': bailRightsStr
  };

  if (formData.ioName?.trim()) {
    paragraphReplacements['सुरेश डांबरे'] = `(${formData.ioName})`;
  }
  if (formData.ioRank?.trim()) {
    paragraphReplacements['वरीष्ठ पोलीस निरीक्षक'] = formData.ioRank;
  }
  if (formData.ioStation?.trim() || formData.psName?.trim()) {
    paragraphReplacements['पोलीस ठाणे सायबर, नागपुर शहर'] = formData.ioStation || formData.psName;
  }

  // If relative details are provided, populate the 3 dashed lines under प्रति,
  if (formData.relativeName?.trim() || formData.relativeAddress?.trim() || formData.relativePhone?.trim()) {
    const relNameStr = `१) नातेवाईकाचे नाव - ${formData.relativeName || ''}${formData.relativeRelation ? ' (नाते - ' + formData.relativeRelation + ')' : ''}`;
    const relAddrStr = `पत्ता - ${formData.relativeAddress || ''}`;
    const relPhoneStr = `मोबाईल नं. - ${formData.relativePhone || ''}`;

    let dashCount = 0;
    const pRegex = /<w:p(?:[\s>][\s\S]*?)<\/w:p>/g;
    docXml = docXml.replace(pRegex, (p) => {
      const text = p.replace(/<[^>]+>/g, '').trim();
      if (/^-{10,}$/.test(text)) {
        dashCount++;
        if (dashCount === 1) return p.replace(text, relNameStr);
        if (dashCount === 2) return p.replace(text, relAddrStr);
        if (dashCount === 3) return p.replace(text, relPhoneStr);
      }
      return p;
    });
  }

  if (formData.caseBrief?.trim()) {
    paragraphReplacements['दिनांक २२-०३-२०२६ को सुबह'] = formData.caseBrief;
  }

  if (formData.directorsDetails?.trim()) {
    paragraphReplacements['१) संदीप भानुदास मोरे, वय ४२ वर्षे'] = formData.directorsDetails;
  } else if (formData.accusedName?.trim()) {
    const accAge = formData.accusedAge ? `, वय ${formData.accusedAge} वर्षे` : '';
    const accAddr = formData.accusedAddress ? `, पत्ता – ${formData.accusedAddress}` : '';
    paragraphReplacements['१) संदीप भानुदास मोरे, वय ४२ वर्षे'] = `१) ${formData.accusedName}${accAge}${accAddr}`;
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
    'Annkutgrains Private Limited': formData.accountName || formData.companyName || 'Annkutgrains Private Limited',
    '(सुरेश डांबरे)': formData.ioName ? `(${formData.ioName})` : '(                   )'
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
  if (formData.ioRank?.trim()) {
    directReplacements['वरीष्ठ पोलीस निरीक्षक'] = formData.ioRank;
  }
  if (formData.ioStation?.trim() || formData.psName?.trim()) {
    directReplacements['पोलीस ठाणे सायबर, नागपुर शहर'] = formData.ioStation || formData.psName;
  }

  docXml = batchReplaceInDocXml(docXml, directReplacements);

  zip.file('word/document.xml', docXml);
  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}
