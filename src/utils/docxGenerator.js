/**
 * docxGenerator.js
 * Browser-side DOCX generator that loads the official master template,
 * modifies its WordprocessingML/XML structure with 100% fidelity,
 * and outputs an official DOCX file.
 */

import JSZip from 'jszip';
import { MASTER_TEMPLATE_BASE64 } from './templateBase64.js';

const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const R_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const WP_NS = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing';
const A_NS = 'http://schemas.openxmlformats.org/drawingml/2006/main';
const PIC_NS = 'http://schemas.openxmlformats.org/drawingml/2006/picture';
const CT_NS = 'http://schemas.openxmlformats.org/package/2006/content-types';

async function getMasterTemplateBuffer() {
  // 1. Try fetching the master template file
  const paths = [
    '/template/arrest-form-master.docx',
    'template/arrest-form-master.docx',
    './template/arrest-form-master.docx'
  ];
  for (const p of paths) {
    try {
      const res = await fetch(p);
      if (res.ok) {
        return await res.arrayBuffer();
      }
    } catch (e) {
      // Continue to next path
    }
  }

  // 2. Fallback to embedded base64 master template
  if (MASTER_TEMPLATE_BASE64) {
    const binary = atob(MASTER_TEMPLATE_BASE64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  throw new Error('Master template could not be loaded.');
}

function createRun(xmlDoc, text, bold = true, fontSize = '22') {
  const r = xmlDoc.createElementNS(W_NS, 'w:r');
  const rPr = xmlDoc.createElementNS(W_NS, 'w:rPr');
  if (bold) {
    rPr.appendChild(xmlDoc.createElementNS(W_NS, 'w:b'));
    rPr.appendChild(xmlDoc.createElementNS(W_NS, 'w:bCs'));
  }
  const sz = xmlDoc.createElementNS(W_NS, 'w:sz');
  sz.setAttributeNS(W_NS, 'w:val', String(fontSize));
  rPr.appendChild(sz);

  const szCs = xmlDoc.createElementNS(W_NS, 'w:szCs');
  szCs.setAttributeNS(W_NS, 'w:val', String(fontSize));
  rPr.appendChild(szCs);

  r.appendChild(rPr);

  const t = xmlDoc.createElementNS(W_NS, 'w:t');
  t.setAttribute('xml:space', 'preserve');
  t.textContent = text;
  r.appendChild(t);

  return r;
}

function setRunText(xmlDoc, runElem, text) {
  let t = runElem.getElementsByTagNameNS(W_NS, 't')[0];
  if (!t) {
    t = xmlDoc.createElementNS(W_NS, 'w:t');
    t.setAttribute('xml:space', 'preserve');
    runElem.appendChild(t);
  }
  t.textContent = text;
}

function setCellText(xmlDoc, cellElem, text, bold = false, fontSize = '20') {
  // Remove all existing paragraphs in cell to prevent vertical cell bloat
  const allPs = Array.from(cellElem.getElementsByTagNameNS(W_NS, 'p'));
  allPs.forEach(p => cellElem.removeChild(p));

  const p = xmlDoc.createElementNS(W_NS, 'w:p');
  const pPr = xmlDoc.createElementNS(W_NS, 'w:pPr');
  const sp = xmlDoc.createElementNS(W_NS, 'w:spacing');
  sp.setAttributeNS(W_NS, 'w:line', '192');
  sp.setAttributeNS(W_NS, 'w:lineRule', 'auto');
  sp.setAttributeNS(W_NS, 'w:before', '0');
  sp.setAttributeNS(W_NS, 'w:after', '0');
  pPr.appendChild(sp);
  p.appendChild(pPr);

  if (text) {
    const newRun = createRun(xmlDoc, text, bold, fontSize);
    p.appendChild(newRun);
  }
  cellElem.appendChild(p);
}

function createPhotoDrawingRun(xmlDoc, rId = 'rIdPhoto', cx = 1097280, cy = 1371600) {
  const r = xmlDoc.createElementNS(W_NS, 'w:r');
  const drawing = xmlDoc.createElementNS(W_NS, 'w:drawing');
  const inline = xmlDoc.createElementNS(WP_NS, 'wp:inline');
  inline.setAttribute('distT', '0');
  inline.setAttribute('distB', '0');
  inline.setAttribute('distL', '0');
  inline.setAttribute('distR', '0');

  const extent = xmlDoc.createElementNS(WP_NS, 'wp:extent');
  extent.setAttribute('cx', String(cx));
  extent.setAttribute('cy', String(cy));
  inline.appendChild(extent);

  const effectExtent = xmlDoc.createElementNS(WP_NS, 'wp:effectExtent');
  effectExtent.setAttribute('l', '0');
  effectExtent.setAttribute('t', '0');
  effectExtent.setAttribute('r', '0');
  effectExtent.setAttribute('b', '0');
  inline.appendChild(effectExtent);

  const docPr = xmlDoc.createElementNS(WP_NS, 'wp:docPr');
  docPr.setAttribute('id', '101');
  docPr.setAttribute('name', 'AccusedPhoto');
  inline.appendChild(docPr);

  const cNvGraphicFramePr = xmlDoc.createElementNS(WP_NS, 'wp:cNvGraphicFramePr');
  inline.appendChild(cNvGraphicFramePr);

  const graphic = xmlDoc.createElementNS(A_NS, 'a:graphic');
  const graphicData = xmlDoc.createElementNS(A_NS, 'a:graphicData');
  graphicData.setAttribute('uri', 'http://schemas.openxmlformats.org/drawingml/2006/picture');

  const pic = xmlDoc.createElementNS(PIC_NS, 'pic:pic');
  const nvPicPr = xmlDoc.createElementNS(PIC_NS, 'pic:nvPicPr');
  const cNvPr = xmlDoc.createElementNS(PIC_NS, 'pic:cNvPr');
  cNvPr.setAttribute('id', '101');
  cNvPr.setAttribute('name', 'AccusedPhoto.png');
  nvPicPr.appendChild(cNvPr);
  nvPicPr.appendChild(xmlDoc.createElementNS(PIC_NS, 'pic:cNvPicPr'));
  pic.appendChild(nvPicPr);

  const blipFill = xmlDoc.createElementNS(PIC_NS, 'pic:blipFill');
  const blip = xmlDoc.createElementNS(A_NS, 'a:blip');
  blip.setAttributeNS(R_NS, 'r:embed', rId);
  blipFill.appendChild(blip);
  const stretch = xmlDoc.createElementNS(A_NS, 'a:stretch');
  stretch.appendChild(xmlDoc.createElementNS(A_NS, 'a:fillRect'));
  blipFill.appendChild(stretch);
  pic.appendChild(blipFill);

  const spPr = xmlDoc.createElementNS(PIC_NS, 'pic:spPr');
  const xfrm = xmlDoc.createElementNS(A_NS, 'a:xfrm');
  const off = xmlDoc.createElementNS(A_NS, 'a:off');
  off.setAttribute('x', '0');
  off.setAttribute('y', '0');
  xfrm.appendChild(off);
  const ext = xmlDoc.createElementNS(A_NS, 'a:ext');
  ext.setAttribute('cx', String(cx));
  ext.setAttribute('cy', String(cy));
  xfrm.appendChild(ext);
  spPr.appendChild(xfrm);

  const prstGeom = xmlDoc.createElementNS(A_NS, 'a:prstGeom');
  prstGeom.setAttribute('prst', 'rect');
  prstGeom.appendChild(xmlDoc.createElementNS(A_NS, 'a:avLst'));
  spPr.appendChild(prstGeom);

  pic.appendChild(spPr);
  graphicData.appendChild(pic);
  graphic.appendChild(graphicData);
  inline.appendChild(graphic);
  drawing.appendChild(inline);
  r.appendChild(drawing);

  return r;
}

/**
 * Main DOCX generation function.
 * Injects user data into the untouched master template.
 */
export async function generateOfficialDocx(data, photoArrayBuffer = null) {
  const templateBuffer = await getMasterTemplateBuffer();
  const zip = await JSZip.loadAsync(templateBuffer);

  const docXmlStr = await zip.file('word/document.xml').async('text');
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(docXmlStr, 'application/xml');

  const body = xmlDoc.getElementsByTagNameNS(W_NS, 'body')[0];
  const elements = Array.from(body.children);

  // SECTION 1 — Case Information (Element 5 & 7)
  const p5 = elements[5];
  if (p5) {
    const runsP5 = p5.getElementsByTagNameNS(W_NS, 'r');
    if (runsP5.length >= 21) {
      if (data.state) setRunText(xmlDoc, runsP5[1], data.state);
      if (data.district) setRunText(xmlDoc, runsP5[5], data.district);
      if (data.policeStation) setRunText(xmlDoc, runsP5[8], data.policeStation);
      if (data.firNo) setRunText(xmlDoc, runsP5[14], ' ' + data.firNo + ' ');
      if (data.year) setRunText(xmlDoc, runsP5[20], ' ' + data.year + ' ');
      if (data.date) p5.appendChild(createRun(xmlDoc, ' Date: ' + data.date, true));
    }
  }

  // Accused Code (Element 7)
  if (data.accusedCode && elements[7]) {
    elements[7].appendChild(createRun(xmlDoc, ` : ${data.accusedCode}`, true));
  }

  // SECTION 2 — Date, Time & Place of Arrest / Surrender (Element 9 & 11)
  const p9 = elements[9];
  if (p9) {
    if (data.arrestDate) p9.insertBefore(createRun(xmlDoc, ' ' + data.arrestDate + ' ', true), p9.children[5] || null);
    if (data.arrestTime) p9.insertBefore(createRun(xmlDoc, ' ' + data.arrestTime + ' ', true), p9.children[8] || null);
    if (data.gdNo) p9.appendChild(createRun(xmlDoc, ' ' + data.gdNo, true));
  }

  const p11 = elements[11];
  if (p11) {
    const runsP11 = Array.from(p11.getElementsByTagNameNS(W_NS, 'r'));
    for (const r of runsP11) {
      const t = r.getElementsByTagNameNS(W_NS, 't')[0];
      if (t && t.textContent && t.textContent.includes('    ') && data.arrestPS) {
        t.textContent = ' ' + data.arrestPS + ' ';
        break;
      }
    }
    if (data.arrestDist) p11.insertBefore(createRun(xmlDoc, ' ' + data.arrestDist + ' ', true), p11.children[8] || null);
    if (data.arrestState) p11.appendChild(createRun(xmlDoc, ' ' + data.arrestState, true));
  }

  // SECTION 3 — Court Information (Element 13)
  if (data.courtName && elements[13]) {
    const runsP13 = elements[13].getElementsByTagNameNS(W_NS, 'r');
    for (const r of Array.from(runsP13)) {
      const t = r.getElementsByTagNameNS(W_NS, 't')[0];
      if (t && t.textContent.includes('---')) {
        t.textContent = ' ' + data.courtName + ' ';
        break;
      }
    }
  }

  // SECTION 4 — Acts and Sections (Element 15 & 16)
  if (data.actsSections && elements[15]) {
    elements[15].appendChild(createRun(xmlDoc, data.actsSections, true));
  }
  if (data.actsSectionsMr && elements[16]) {
    elements[16].appendChild(createRun(xmlDoc, data.actsSectionsMr, true));
  }

  // SECTION 5 — Arrest / Surrender Status (Element 17/18 & 19)
  const optionsEn = [
    'Arrested and forward',
    'Arrested and released on bail or PR bound',
    'released on anticipatory bail',
    'Arrested and remanded to Police Custody',
    'Surrendered in court and bailed out',
    'Surrendered in court and sent to judicial Custody',
    'Surrendered in court and remanded to Police Custody'
  ];
  const optionsMr = [
    'अटक केली व न्यायालयात पाठविले',
    'अटक केली व जामीनावर सोडले किंवा वौयक्तीक जात मुचलक्यावर +डले',
    'अटक केली व अटकपुर्व जामीनावर सोडले',
    'अटक केले व पालीस कोठडित पाठविले',
    'न्यायालयाचे स्वाधिन व जामीनावर',
    'न्यायालयाचे स्वाधिन व न्यायालयीन कोठडित पाठविले',
    'न्यायालयाचे स्वाधिन व पोलीस कोठडित पाठविले'
  ];
  if (data.arrestStatus !== null && data.arrestStatus !== undefined && data.arrestStatus >= 0 && data.arrestStatus < optionsEn.length) {
    const targetEn = optionsEn[data.arrestStatus];
    [elements[17], elements[18]].forEach(pElem => {
      if (!pElem) return;
      Array.from(pElem.getElementsByTagNameNS(W_NS, 'r')).forEach(r => {
        const t = r.getElementsByTagNameNS(W_NS, 't')[0];
        if (t && t.textContent.includes(targetEn)) {
          t.textContent = t.textContent.replace(targetEn, `${targetEn} [√]`);
        }
      });
    });

    const targetMr = optionsMr[data.arrestStatus];
    if (elements[19]) {
      Array.from(elements[19].getElementsByTagNameNS(W_NS, 'r')).forEach(r => {
        const t = r.getElementsByTagNameNS(W_NS, 't')[0];
        if (t && t.textContent.includes(targetMr)) {
          t.textContent = t.textContent.replace(targetMr, `${targetMr} [√]`);
        }
      });
    }
  }

  // SECTION 6 — Particulars of the Accused
  if (data.accusedName && elements[21]) {
    elements[21].appendChild(createRun(xmlDoc, ' ' + data.accusedName, true));
  }
  if (data.fatherName && elements[22]) {
    elements[22].appendChild(createRun(xmlDoc, ' ' + data.fatherName, true));
  }
  if (data.firstAlias && elements[23]) {
    Array.from(elements[23].getElementsByTagNameNS(W_NS, 'r')).forEach(r => {
      const t = r.getElementsByTagNameNS(W_NS, 't')[0];
      if (t && t.textContent.includes('---')) t.textContent = ' ' + data.firstAlias + ' ';
    });
  }
  if (data.secondAlias && elements[24]) {
    Array.from(elements[24].getElementsByTagNameNS(W_NS, 'r')).forEach(r => {
      const t = r.getElementsByTagNameNS(W_NS, 't')[0];
      if (t && t.textContent.includes('---')) t.textContent = ' ' + data.secondAlias + ' ';
    });
  }
  if (data.nationality && elements[25]) {
    const runsP25 = elements[25].getElementsByTagNameNS(W_NS, 'r');
    if (runsP25.length >= 2) setRunText(xmlDoc, runsP25[1], ' ' + data.nationality);
  }
  if (elements[26]) {
    const runsP26 = elements[26].getElementsByTagNameNS(W_NS, 'r');
    if (data.voterId && runsP26.length >= 2) setRunText(xmlDoc, runsP26[1], ' ' + data.voterId + ' ');
    if (data.passportNo && runsP26.length >= 4) setRunText(xmlDoc, runsP26[3], ' ' + data.passportNo + ' ');
  }
  if (elements[28]) {
    const runsP28 = elements[28].getElementsByTagNameNS(W_NS, 'r');
    if (data.passportIssueDate && runsP28.length >= 2) setRunText(xmlDoc, runsP28[1], ' ' + data.passportIssueDate + ' ');
    if (data.passportIssuePlace && runsP28.length >= 4) setRunText(xmlDoc, runsP28[3], ' ' + data.passportIssuePlace + ' ');
  }
  if (elements[29]) {
    if (data.religion) elements[29].insertBefore(createRun(xmlDoc, ' ' + data.religion + ' ', true), elements[29].children[1] || null);
    if (data.caste) elements[29].appendChild(createRun(xmlDoc, ' ' + data.caste, true));
  }
  if (elements[30]) {
    const runsP30 = elements[30].getElementsByTagNameNS(W_NS, 'r');
    if (data.category && runsP30.length >= 2) setRunText(xmlDoc, runsP30[1], ' ' + data.category + ' ');
    if (data.occupation) elements[30].appendChild(createRun(xmlDoc, ' ' + data.occupation, true));
  }
  if (data.permanentAddress && elements[32]) {
    elements[32].appendChild(createRun(xmlDoc, ' ' + data.permanentAddress, true));
  }
  if (elements[35]) {
    if (data.permState) elements[35].insertBefore(createRun(xmlDoc, ' ' + data.permState + ' ', true), elements[35].children[1] || null);
    if (data.permDist) elements[35].insertBefore(createRun(xmlDoc, ' ' + data.permDist + ' ', true), elements[35].children[3] || null);
    if (data.permPS) elements[35].appendChild(createRun(xmlDoc, ' ' + data.permPS, true));
  }
  if (data.presentAddress && elements[37]) {
    elements[37].appendChild(createRun(xmlDoc, ' ' + data.presentAddress, true));
  }
  if (elements[38]) {
    const runsP38 = elements[38].getElementsByTagNameNS(W_NS, 'r');
    if (data.presState && runsP38.length >= 2) setRunText(xmlDoc, runsP38[1], ' ' + data.presState + ' ');
    if (data.presDist && runsP38.length >= 4) setRunText(xmlDoc, runsP38[3], ' ' + data.presDist + ' ');
    if (data.presPS && runsP38.length >= 6) setRunText(xmlDoc, runsP38[5], ' ' + data.presPS + ' ');
  }

  // SECTION 7 — Injuries / Physical Condition (Element 39)
  if (data.injuriesDetails && elements[39]) {
    Array.from(elements[39].getElementsByTagNameNS(W_NS, 'r')).forEach(r => {
      const t = r.getElementsByTagNameNS(W_NS, 't')[0];
      if (t && t.textContent.includes('---')) {
        t.textContent = ' ' + data.injuriesDetails + ' ';
      }
    });
  }

  // SECTION 8 — Custody / Legal Rights (Element 41)
  if (elements[41] && (data.custodyDate || data.custodyTime || data.custodyPlace)) {
    Array.from(elements[41].getElementsByTagNameNS(W_NS, 'r')).forEach(r => {
      const t = r.getElementsByTagNameNS(W_NS, 't')[0];
      if (t && t.textContent.includes('custody on---')) {
        t.textContent = `8. The accused, after being informed of the grounds of arrest and his legal rights, was duly taken, into custody on ${data.custodyDate || '-----------'} (date) at ${data.custodyTime || '-----------'} (hours) at ${data.custodyPlace || '-----------'} (place).`;
      }
    });
  }

  // SECTION 9 — Articles Found (Element 45, 46, 47)
  const articles = data.articlesNil ? ['NIL', 'NIL', 'NIL', 'NIL', 'NIL', 'NIL'] : (data.articles || []);
  for (let idxArt = 0; idxArt < 6; idxArt++) {
    const artVal = articles[idxArt] || '---';
    const pairIdx = Math.floor(idxArt / 2);
    const pos = idxArt % 2;
    const pElem = elements[45 + pairIdx];
    if (pElem) {
      const runs = pElem.getElementsByTagNameNS(W_NS, 'r');
      if (pos === 0 && runs.length >= 1) {
        const t = runs[0].getElementsByTagNameNS(W_NS, 't')[0];
        if (t && t.textContent.includes('---')) t.textContent = `${idxArt + 1}. ${artVal}   `;
      } else if (pos === 1 && runs.length >= 2) {
        const t = runs[1].getElementsByTagNameNS(W_NS, 't')[0];
        if (t && t.textContent.includes('---')) t.textContent = `${idxArt + 1}. ${artVal}`;
      }
    }
  }

  // SECTION 10 — Intimation (Element 52 & 53)
  if ((data.intimationName || data.intimationRelation) && elements[52]) {
    elements[52].appendChild(createRun(xmlDoc, ` - ${data.intimationName || ''} (${data.intimationRelation || ''})`, true));
  }
  if (data.intimationAddress && elements[53]) {
    elements[53].appendChild(createRun(xmlDoc, ` पत्ता: ${data.intimationAddress}`, true));
  }

  // SECTION 11 — Physical Features Table (Element 58 / TBL58)
  const tbl = elements[58];
  if (tbl && tbl.tagName.endsWith('tbl')) {
    const trList = tbl.getElementsByTagNameNS(W_NS, 'tr');
    const pf = data.physicalFeatures || {};
    const row2Keys = ['srNo', 'sex', 'dob', 'build', 'height', 'complexion', 'idMark', 'deformities', 'teeth', 'hair'];
    const row5Keys = ['eye', 'habits', 'dressHabits', 'languages', 'burnMark', 'leucoderma', 'mole', 'scar', 'tattoo', 'forehead'];
    const row8Keys = ['ear', 'nose', 'moustaches', 'speech', 'face', 'lips'];

    if (trList.length >= 3) {
      const cellsR2 = trList[2].getElementsByTagNameNS(W_NS, 'tc');
      row2Keys.forEach((k, ki) => {
        if (ki < cellsR2.length) {
          const val = pf[k] || (k === 'srNo' ? '1' : '');
          if (val) setCellText(xmlDoc, cellsR2[ki], val, false, '18');
        }
      });
    }

    if (trList.length >= 6) {
      const cellsR5 = trList[5].getElementsByTagNameNS(W_NS, 'tc');
      row5Keys.forEach((k, ki) => {
        if (ki < cellsR5.length) {
          const val = pf[k] || '';
          if (val) setCellText(xmlDoc, cellsR5[ki], val, false, '18');
        }
      });
    }

    if (trList.length >= 9) {
      const cellsR8 = trList[8].getElementsByTagNameNS(W_NS, 'tc');
      row8Keys.forEach((k, ki) => {
        if (ki < cellsR8.length) {
          const val = pf[k] || '';
          if (val) setCellText(xmlDoc, cellsR8[ki], val, false, '18');
        }
      });
    }
  }

  // SECTION 12 — Other Features (Element 59)
  if (data.otherFeatures && elements[59]) {
    elements[59].appendChild(createRun(xmlDoc, ' ' + data.otherFeatures, true));
  }

  // SECTION 13 — Fingerprint (Element 62)
  if (data.fingerprintTaken && elements[62]) {
    let valFp = data.fingerprintTaken === 'yes' ? 'Yes (होय)' : 'No (नाही)';
    if (data.fingerprintDetail) valFp += ` - ${data.fingerprintDetail}`;
    elements[62].appendChild(createRun(xmlDoc, ' ' + valFp, true));
  }

  // SECTION 14 — Socio-Economic Profile (Element 65-67 & 68 & 70-75)
  if (data.livingStatus) {
    [elements[65], elements[66]].forEach(pElem => {
      if (!pElem) return;
      Array.from(pElem.getElementsByTagNameNS(W_NS, 'r')).forEach(r => {
        const t = r.getElementsByTagNameNS(W_NS, 't')[0];
        if (t && t.textContent.includes(data.livingStatus)) {
          t.textContent = t.textContent.replace(data.livingStatus, `${data.livingStatus} [√]`);
        }
      });
    });
  }

  if (elements[68]) {
    if (data.education) elements[68].insertBefore(createRun(xmlDoc, ' ' + data.education + ' ', true), elements[68].children[1] || null);
    if (data.socioOccupation) elements[68].appendChild(createRun(xmlDoc, ' ' + data.socioOccupation, true));
  }

  if (data.incomeGroup !== null && data.incomeGroup !== undefined && data.incomeGroup >= 0 && data.incomeGroup < 6) {
    const targetIncomeP = elements[70 + data.incomeGroup];
    if (targetIncomeP) {
      targetIncomeP.insertBefore(createRun(xmlDoc, '[√] ', true), targetIncomeP.firstChild);
    }
  }

  // SECTION 15 — Police Records (Element 78-86)
  const policeKeys = ['isDangerous', 'escapedBail', 'isArmed', 'operatesAccomplices', 'pastRecords', 'isRecidivist', 'likelyEscapeBail', 'likelyCommitCrime', 'wantedOtherCase'];
  policeKeys.forEach((pKey, pi) => {
    const ans = data[pKey];
    const elem = elements[78 + pi];
    if (elem && (ans === 'yes' || ans === 'no')) {
      Array.from(elem.getElementsByTagNameNS(W_NS, 'r')).forEach(r => {
        const t = r.getElementsByTagNameNS(W_NS, 't')[0];
        if (t && t.textContent.includes('Yes/ No')) {
          if (ans === 'yes') t.textContent = t.textContent.replace('Yes/ No', 'Yes [√] / No');
          else if (ans === 'no') t.textContent = t.textContent.replace('Yes/ No', 'Yes / No [√]');
        }
      });
    }
  });

  if (data.otherCaseDetail && elements[87]) {
    elements[87].appendChild(createRun(xmlDoc, ` : ${data.otherCaseDetail}`, true));
  }

  // SECTION 16 — Witnesses / Panchas (Element 91-96)
  if (data.witness1Name && elements[91]) {
    Array.from(elements[91].getElementsByTagNameNS(W_NS, 'r')).forEach(r => {
      const t = r.getElementsByTagNameNS(W_NS, 't')[0];
      if (t && t.textContent.includes('---')) {
        t.textContent = `(1) ${data.witness1Name}   -----------------------------------`;
      }
    });
  }
  if (data.witness1Address && elements[92]) {
    Array.from(elements[92].getElementsByTagNameNS(W_NS, 'r')).forEach(r => {
      const t = r.getElementsByTagNameNS(W_NS, 't')[0];
      if (t && t.textContent.includes('---')) {
        t.textContent = `    Address: ${data.witness1Address}`;
      }
    });
  }
  if (data.witness2Name && elements[94]) {
    Array.from(elements[94].getElementsByTagNameNS(W_NS, 'r')).forEach(r => {
      const t = r.getElementsByTagNameNS(W_NS, 't')[0];
      if (t && t.textContent.includes('---')) {
        t.textContent = `(2) ${data.witness2Name}   -----------------------------------`;
      }
    });
  }
  if (data.witness2Address && elements[95]) {
    Array.from(elements[95].getElementsByTagNameNS(W_NS, 'r')).forEach(r => {
      const t = r.getElementsByTagNameNS(W_NS, 't')[0];
      if (t && t.textContent.includes('---')) {
        t.textContent = `    Address: ${data.witness2Address}`;
      }
    });
  }

  // SECTION 17 — Officer Details (Element 100, 102, 104, 105)
  if (data.officerName && elements[100]) {
    elements[100].appendChild(createRun(xmlDoc, ` ${data.officerName}`, true));
  }
  if (elements[102]) {
    Array.from(elements[102].getElementsByTagNameNS(W_NS, 'r')).forEach(r => {
      const t = r.getElementsByTagNameNS(W_NS, 't')[0];
      if (t) {
        if (data.officerRank && t.textContent.includes('Rank')) t.textContent = `Rank: ${data.officerRank} `;
        if (data.officerNo && t.textContent.includes('No.---')) t.textContent = `No: ${data.officerNo}`;
      }
    });
  }
  if (data.place && elements[104]) {
    const runsP104 = Array.from(elements[104].getElementsByTagNameNS(W_NS, 'r'));
    let replaced = false;
    for (const r of runsP104) {
      const t = r.getElementsByTagNameNS(W_NS, 't')[0];
      if (t && (t.textContent.includes('पो. ठाणे') || t.textContent.includes('सायबर'))) {
        t.textContent = data.place;
        replaced = true;
        break;
      }
    }
    if (!replaced) {
      elements[104].appendChild(createRun(xmlDoc, ` ${data.place}`, true));
    }
  }
  if (data.finalDate && elements[105]) {
    elements[105].appendChild(createRun(xmlDoc, ` ${data.finalDate}`, true));
  }

  // Clean up all cells in Physical Features Table to ensure single clean paragraph per cell
  if (tbl && tbl.tagName.endsWith('tbl')) {
    const allCells = Array.from(tbl.getElementsByTagNameNS(W_NS, 'tc'));
    allCells.forEach(cell => {
      const ps = Array.from(cell.getElementsByTagNameNS(W_NS, 'p'));
      if (ps.length > 1) {
        // Keep the first paragraph and remove extra empty paragraphs
        for (let i = 1; i < ps.length; i++) {
          if (!ps[i].textContent.trim()) {
            cell.removeChild(ps[i]);
          }
        }
      }
    });
  }

  // Remove redundant placeholder paragraphs and forced page breaks that cause excessive white space
  const elementsToRemove = [
    elements[33], // empty address paragraph
    elements[34], // empty address paragraph
    elements[40], // forced dashed line with page-break
    elements[60], // forced empty paragraph with page-break
    elements[107] // trailing empty paragraph
  ];

  // Also remove redundant dashed witness lines if witness data is present
  if (data.witness1Name || data.witness1Address) {
    elementsToRemove.push(elements[93]);
  }
  if (data.witness2Name || data.witness2Address) {
    elementsToRemove.push(elements[96]);
  }

  elementsToRemove.forEach(elem => {
    if (elem && elem.parentNode) {
      elem.parentNode.removeChild(elem);
    }
  });

  // Remove any remaining forced page-break tags (<w:br w:type="page"/>) from the document
  const allBrs = Array.from(xmlDoc.getElementsByTagNameNS(W_NS, 'br'));
  allBrs.forEach(br => {
    const type = br.getAttributeNS(W_NS, 'type') || br.getAttribute('w:type');
    if (type === 'page' && br.parentNode) {
      br.parentNode.removeChild(br);
    }
  });

  // Handle Accused Photo embedding
  if (photoArrayBuffer) {
    // 1. Add image to zip
    zip.file('word/media/image1.png', photoArrayBuffer);

    // 2. Update [Content_Types].xml
    const ctXmlStr = await zip.file('[Content_Types].xml').async('text');
    const ctDoc = parser.parseFromString(ctXmlStr, 'application/xml');
    const defaults = Array.from(ctDoc.getElementsByTagNameNS(CT_NS, 'Default'));
    const hasPng = defaults.some(d => (d.getAttribute('Extension') || '').toLowerCase() === 'png');
    if (!hasPng) {
      const newDef = ctDoc.createElementNS(CT_NS, 'Default');
      newDef.setAttribute('Extension', 'png');
      newDef.setAttribute('ContentType', 'image/png');
      ctDoc.documentElement.appendChild(newDef);
      zip.file('[Content_Types].xml', new XMLSerializer().serializeToString(ctDoc));
    }

    // 3. Update word/_rels/document.xml.rels
    const relsXmlStr = await zip.file('word/_rels/document.xml.rels').async('text');
    const relsDoc = parser.parseFromString(relsXmlStr, 'application/xml');
    const newRel = relsDoc.createElementNS('http://schemas.openxmlformats.org/package/2006/relationships', 'Relationship');
    newRel.setAttribute('Id', 'rIdPhoto');
    newRel.setAttribute('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image');
    newRel.setAttribute('Target', 'media/image1.png');
    relsDoc.documentElement.appendChild(newRel);
    zip.file('word/_rels/document.xml.rels', new XMLSerializer().serializeToString(relsDoc));

    // 4. Insert photo drawing run into Element 101/102
    const photoRun = createPhotoDrawingRun(xmlDoc, 'rIdPhoto', 1097280, 1371600);
    if (elements[101]) {
      elements[101].insertBefore(photoRun, elements[101].children[2] || null);
    }
  }

  // Serialize updated document.xml
  const serializer = new XMLSerializer();
  const updatedDocXml = serializer.serializeToString(xmlDoc);
  zip.file('word/document.xml', updatedDocXml);

  // Generate downloadable DOCX Blob
  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  return blob;
}

/**
 * Downloads the generated DOCX file in the user's browser.
 */
export function downloadDocxBlob(blob, accusedCode = 'A1', date = '') {
  const safeCode = (accusedCode || 'A1').replace(/[^a-zA-Z0-9_-]/g, '');
  const safeDate = (date || new Date().toISOString().split('T')[0]).replace(/[^0-9_-]/g, '');
  const filename = `Arrest_Form_${safeCode}_${safeDate}.docx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
