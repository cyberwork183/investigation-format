/**
 * generateRemandDocx.js
 * Generates official Police Custody Remand (PCR) Application DOCX from master template.
 */

import JSZip from 'jszip';
import {
  loadTemplateBuffer,
  batchReplaceParagraphs,
  batchReplaceInDocXml,
  removeBankTablesFromXml,
  updateRemandSummaryTable,
  removeParagraphsBySnippets,
  replaceParagraphWithXml,
  buildThreeInvestigationSectionsXml,
  buildInvestigationPointsXml,
  formatBuckleNumber,
  getAllAccusedList,
  formatSingleAccused,
  formatAllAccusedListText
} from './commonDocxUtils.js';
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
  
  const accusedList = getAllAccusedList(formData);
  if (accusedList.length === 0) {
    accusedList.push({
      accusedName: 'संदीप भानुदास मोरे',
      accusedAge: '४२',
      accusedAddress: 'हाऊस नं. ७५८/९, गल्ली नं. ९, अटल गेट, नेहरु नगर, इंदौर, मध्य प्रदेश'
    });
  }
  const accusedTableText = formatAllAccusedListText(accusedList, { includeNumberForSingle: accusedList.length > 1 });
  const jailName = formData.producedFromJail || 'तिहार कारागृह, दिल्ली';
  const producedJailText = accusedList.length > 1
    ? `त्यापैकी आरोपी नामे\n${formatAllAccusedListText(accusedList, { includeNumberForSingle: true })}\nयांना कारागृह पोलीस, ${jailName} यांनी मा. न्यायालयासमक्ष हजर केलेले आहे.`
    : `त्यापैकी आरोपी नामे ${formatSingleAccused(accusedList[0])} यास कारागृह पोलीस, ${jailName} यांनी मा. न्यायालयासमक्ष हजर केलेले आहे.`;

  const buckleStr = formatBuckleNumber(formData.ioBuckleNo);
  const ioFull = `${formData.ioName ? formData.ioName + ', ' : ''}${formData.ioRank || 'वरीष्ठ पोलीस निरीक्षक'}${buckleStr}, ${formData.ioStation || formData.policeStationHeader || 'पोलीस ठाणे सायबर, नागपूर शहर'}`;
  const crimeFull = `${formData.policeStationHeader || 'पोलीस ठाणे सायबर, नागपूर शहर'} अपराध क्रमांक ${formData.crimeNo || '38/2026'} ${formData.actsSections || 'भारतीय न्याय संहीता कलम 318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS r/w 66(c), 66(d) IT Act'}`;

  // 1. Remove bank tables
  docXml = removeBankTablesFromXml(docXml);

  // 1b. Update summary table: remove Defrauded Amount and Refunded Amount rows, renumber remaining rows 01-09
  docXml = updateRemandSummaryTable(docXml);

  // 2. Remove obsolete bank paragraphs and legacy duplicate arrest reasons
  docXml = removeParagraphsBySnippets(docXml, [
    'सदर गुन्ह्याच्या तपासादरम्यान फसवणुकीच्या',
    'सदर खात्याचे तपशील पुढीलप्रमाणे आहेत',
    'सदर खाते हे Annkutgrains',
    'डायरेक्टर चे नाव',
    '१) संदीप भानुदास मोरे, वय ४२ वर्षे, पत्ता',
    '२) अजय पि. पुरुषोत्तम सिंह तोमर',
    'यावरुन खातेधारकाचा नमुद गुन्ह्यात समावेश असल्याचे',
    'अटकेचे आधार : १) वरील प्रकरणात, फसवणुकीची रक्कम IndusInd Bank',
    'तसेच आरोपी डायरेक्टर असलेल्या IndusInd Bank',
    'अटकेची कारणे –',
    '१) आरोपीच्या कंपनीच्या (IndusInd Bank Account number',
    '२) पीडितेशी शासकीय अधिकारी बनून कोणी संवाद साधला',
    '३) या खात्यामध्ये पैसे कोणाच्या सांगण्यावरून पाठवण्यात आले',
    '४) आरोपीने अशा प्रकारचे आणखी किती गुन्हे केले आहेत',
    '५) या गुन्ह्यांमध्ये आरोपीसोबत आणखी कोण-कोण सामील आहे',
    '६) या गुन्ह्यात आणखी कोण-कोण सामील आहे, हे शोधण्यासाठी',
    '७) गुन्ह्याचे भौतिक व तांत्रिक पुरावे जप्त करणे आवश्यक आहे.',
    '८) आरोपीला पुढील गुन्हे करण्यापासून रोखणे',
    '९) गुन्ह्याचे पुरावे खराब होण्यापासून वाचविणे आवश्यक आहे',
    '१०) आरोपीने प्रकरणाची माहिती असलेल्या कोणत्याही व्यक्तीस आमिष दाखवून',
    '११) आरोपीस अटक केली नाही तर आवश्यकतेनुसार तो न्यायालयात हजर राहील',
    'त्यामुळे वरील कारणांसाठी आरोपीस अटक करण्यात आलेली आहे.'
  ]);

  // 3. Insert the two sections (Brief Facts and single Grounds of Arrest / अटकेची कारणे) in place of the old narrative/bank area
  const investigationSectionsXml = buildThreeInvestigationSectionsXml(formData);
  docXml = replaceParagraphWithXml(docXml, 'दिनांक २२-०३-२०२६', investigationSectionsXml);

  // 3b. Insert dynamic pending investigation points under "सदर गुन्ह्यात खालील बाबींना अनुसरुन तपास करणे बाकी आहे."
  const headingParaXml = `<w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:rPr><w:rFonts w:ascii="Kokila" w:hAnsi="Kokila" w:cs="Kokila"/><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Kokila" w:hAnsi="Kokila" w:cs="Kokila"/><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr><w:tab/></w:r><w:r><w:rPr><w:rFonts w:ascii="Kokila" w:hAnsi="Kokila" w:cs="Kokila"/><w:sz w:val="32"/><w:szCs w:val="32"/><w:cs/></w:rPr><w:t xml:space="preserve">सदर गुन्ह्यात खालील बाबींना अनुसरुन तपास करणे बाकी आहे. </w:t></w:r></w:p>`;
  const pointsXml = buildInvestigationPointsXml(formData.remainingInvestigationPoints);
  docXml = replaceParagraphWithXml(docXml, 'सदर गुन्ह्यात खालील बाबींना', headingParaXml + pointsXml);

  // 4. Paragraph-level replacements
  const paragraphReplacements = {
    'श्रद्धा नथुजी': complainantFull,
    'त्यापैकी आरोपी नामे': producedJailText,
    'संदीप भानुदास': accusedTableText,
    'सुरेश डांबरे, वरिष्ठ': ioFull,
    'सुरेश डांबरे, वरीष्ठ': ioFull,
    'पोलीस स्टेशन सायबर,': formData.psName || formData.policeStationHeader || 'पोलीस स्टेशन सायबर, नागपूर शहर',
    '38/2026 भारतीय': crimeFull,
    'फिर्यादीचे राहते': formData.crimeScene || 'फिर्यादीचे राहते घरी',
    'दिनांक 22/03/2026': formData.incidentDateTime || 'दिनांक 22/03/2026 चे 10:04 ते दि. 24/03/2026 चे 09:00 वा. पावेतो',
    'दि. 27/03/2026': formData.filingDateTime || letterDateStr,
    '5 दिवस पोलीस': `विषय        -   ${formData.remandDays || 5} दिवस पोलीस कोठडी मिळणेबाबत`,
    '५ दिवस पोलीस': `विषय        -   ${formData.remandDays || 5} दिवस पोलीस कोठडी मिळणेबाबत`,
    'सहा. सरकारी अभियोक्ता': formData.throughProsecutor || 'सहा. सरकारी अभियोक्ता, न्यायालय प्रथमवर्ग क्रमांक 10, नागपुर शहर',
    'वरीष्ठ पोलीस निरीक्षक': `${formData.ioRank || 'वरीष्ठ पोलीस निरीक्षक'}${buckleStr}`,
    'पोलीस ठाणे सायबर, नागपुर शहर': formData.ioStation || formData.policeStationHeader || 'पोलीस ठाणे सायबर, नागपूर शहर'
  };

  if (formData.priorProductionDetails?.trim()) {
    paragraphReplacements['सदर आरोपी नामे १) संदीप भानुदास मोरे'] = formData.priorProductionDetails;
  }

  if (formData.relativeIntimation?.trim()) {
    paragraphReplacements['आरोपीस अटक करताना लेखी सूचनापत्र'] = `आरोपीस अटक करताना लेखी सूचनापत्र देण्यात आलेले आहे तसेच अटकेबाबत आरोपीचे नातेवाईक ${formData.relativeIntimation} यांना माहिती देण्यात आलेली आहे.`;
  }

  docXml = batchReplaceParagraphs(docXml, paragraphReplacements);

  // 5. Exact string replacements
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
