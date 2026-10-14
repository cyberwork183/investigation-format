/**
 * commonDocxUtils.js
 * Common utilities for browser-side OpenXML DOCX template processing and file download.
 */

export const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

/**
 * Load template buffer with URL fetch and embedded Base64 fallback
 */
export async function loadTemplateBuffer(templatePaths, base64Fallback) {
  const paths = Array.isArray(templatePaths) ? templatePaths : [templatePaths];
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

  if (base64Fallback) {
    const binary = atob(base64Fallback);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  throw new Error(`Master template could not be loaded from ${paths.join(', ')}`);
}

/**
 * Trigger browser file download
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Safely escape text for XML content
 */
export function escapeXmlText(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}


/**
 * Ensure all standard WordprocessingML namespaces are present on <w:document>
 * This prevents Word "error trying to open file" caused by undeclared prefixes like w14:, w15:, mc:.
 */
export function ensureXmlNamespaces(docXml) {

  if (!docXml || typeof docXml !== 'string') return docXml;
  return docXml.replace(/<w:document(\s[^>]*)?>/, (match, attrs = '') => {
    let newAttrs = attrs;
    if (!newAttrs.includes('xmlns:w14=')) {
      newAttrs += ' xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"';
    }
    if (!newAttrs.includes('xmlns:w15=')) {
      newAttrs += ' xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml"';
    }
    if (!newAttrs.includes('xmlns:mc=')) {
      newAttrs += ' xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"';
    }
    return `<w:document${newAttrs}>`;
  });
}

/**
 * Robust OpenXML paragraph replacer:
 * Replaces the text inside any <w:p> that matches a keyword or substring,
 * while preserving 100% of the paragraph properties (<w:pPr>) and run formatting (<w:rPr>).
 * Handles multiline strings cleanly with <w:br/>.
 */
export function replaceParagraphTextByMatch(docXml, searchSnippet, newText) {
  if (!searchSnippet || newText === undefined) return docXml;
  const pRegex = /<w:p(?:[\s>][\s\S]*?)<\/w:p>/g;

  const replaced = docXml.replace(pRegex, (p) => {
    // Extract plain text from paragraph
    const tRegex = /<w:t(?:[\s>][^<]*<\/w:t>|\s[^>]*>[^<]*<\/w:t>)/g;
    const texts = [];
    let tm;
    while ((tm = tRegex.exec(p)) !== null) {
      const matchText = tm[0].replace(/<[^>]+>/g, '');
      texts.push(matchText);
    }
    const fullText = texts.join('');

    let isMatch = false;
    if (typeof searchSnippet === 'function') {
      isMatch = searchSnippet(fullText);
    } else if (searchSnippet instanceof RegExp) {
      isMatch = searchSnippet.test(fullText);
    } else {
      isMatch = fullText.includes(searchSnippet);
    }

    if (isMatch) {
      // Extract pPr if present
      const pPrMatch = p.match(/<w:pPr[\s\S]*?<\/w:pPr>/);
      const pPr = pPrMatch ? pPrMatch[0] : '';

      // Extract first rPr if present
      const rPrMatch = p.match(/<w:rPr[\s\S]*?<\/w:rPr>/);
      const rPr = rPrMatch ? rPrMatch[0] : '';

      // Extract opening <w:p ...> tag attributes if present
      const pOpenMatch = p.match(/<w:p(?:\s[^>]*)?>/);
      const pOpen = pOpenMatch ? pOpenMatch[0] : '<w:p>';

      const lines = String(newText)
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .split('\n');

      const runs = lines.map((line, idx) => {
        const escaped = escapeXmlText(line);
        if (idx === 0) {
          return `<w:r>${rPr}<w:t xml:space="preserve">${escaped}</w:t></w:r>`;
        }
        return `<w:r>${rPr}<w:br/><w:t xml:space="preserve">${escaped}</w:t></w:r>`;
      }).join('');

      return `${pOpen}${pPr}${runs}</w:p>`;
    }
    return p;
  });

  return ensureXmlNamespaces(replaced);
}

/**
 * Batch paragraph replacement based on matching snippets
 */
export function batchReplaceParagraphs(docXml, matchMap) {
  let result = docXml;
  for (const [snippet, replacement] of Object.entries(matchMap)) {
    if (snippet && replacement !== undefined) {
      result = replaceParagraphTextByMatch(result, snippet, replacement);
    }
  }
  return ensureXmlNamespaces(result);
}

/**
 * Replace string occurrences in raw OpenXML string safely
 */
export function replaceInDocXml(docXml, searchStr, replaceStr) {
  if (!searchStr) return docXml;
  const escapedReplace = escapeXmlText(replaceStr);
  return ensureXmlNamespaces(docXml.split(searchStr).join(escapedReplace));
}

/**
 * Batch replace string occurrences in raw OpenXML string
 */
export function batchReplaceInDocXml(docXml, replacementsMap) {
  let result = docXml;
  for (const [searchStr, replaceStr] of Object.entries(replacementsMap)) {
    if (searchStr && replaceStr !== undefined) {
      result = replaceInDocXml(result, searchStr, replaceStr);
    }
  }
  return ensureXmlNamespaces(result);
}

/**
 * Safely removes any <w:tbl> element from Word XML that corresponds to the bank details table.
 */
export function removeBankTablesFromXml(docXml) {
  if (!docXml || typeof docXml !== 'string') return docXml;
  return docXml.replace(/<w:tbl[\s\S]*?<\/w:tbl>/g, (tbl) => {
    if (
      tbl.includes('IndusInd') ||
      tbl.includes('LAYER 1 BANK') ||
      tbl.includes('BRANCH') ||
      tbl.includes('CNRBR') ||
      tbl.includes('ACCOUNT NO') ||
      tbl.includes('TXN ID')
    ) {
      return '';
    }
    return tbl;
  });
}

/**
 * Builds an OpenXML paragraph for a section heading (Kokila 16pt bold).
 */
export function buildSectionHeadingXml(headingText) {
  const pId = Math.floor(Math.random() * 0x7fffffff).toString(16).toUpperCase();
  return `<w:p w14:paraId="${pId}" w14:textId="77777777"><w:pPr><w:spacing w:before="160" w:after="60" w:line="276" w:lineRule="auto"/><w:jc w:val="both"/><w:rPr><w:rFonts w:ascii="Kokila" w:hAnsi="Kokila" w:cs="Kokila"/><w:b/><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Kokila" w:hAnsi="Kokila" w:cs="Kokila"/><w:b/><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr><w:t xml:space="preserve">${escapeXmlText(headingText)}</w:t></w:r></w:p>`;
}

/**
 * Builds OpenXML paragraphs for section body text (Kokila 15pt justified, with indentation).
 */
export function buildBodyParagraphsXml(text) {
  if (!text) return '';
  const lines = String(text)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  return lines.map(line => {
    const pId = Math.floor(Math.random() * 0x7fffffff).toString(16).toUpperCase();
    return `<w:p w14:paraId="${pId}" w14:textId="77777777"><w:pPr><w:spacing w:before="0" w:after="60" w:line="276" w:lineRule="auto"/><w:ind w:firstLine="720"/><w:jc w:val="both"/><w:rPr><w:rFonts w:ascii="Kokila" w:hAnsi="Kokila" w:cs="Kokila"/><w:sz w:val="30"/><w:szCs w:val="30"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Kokila" w:hAnsi="Kokila" w:cs="Kokila"/><w:sz w:val="30"/><w:szCs w:val="30"/></w:rPr><w:t xml:space="preserve">${escapeXmlText(line)}</w:t></w:r></w:p>`;
  }).join('');
}

/**
 * Builds OpenXML XML for a complete section (Heading + Body).
 */
export function buildSectionBlockXml(headingText, bodyText) {
  return `${buildSectionHeadingXml(headingText)}${buildBodyParagraphsXml(bodyText)}`;
}

/**
 * Builds the required investigation and arrest sections:
 * 1. Brief Facts of the Case / गुन्ह्याची थोडक्यात हकीकत
 * 2. Grounds of Arrest / अटकेची कारणे (Single consistent arrest-reason section)
 */
export function buildInvestigationSectionsXml(formData) {
  const briefFacts = formData.caseBrief || '';
  const grounds = formData.groundsOfArrest || formData.reasonsForArrest || '';

  return (
    buildSectionBlockXml('Brief Facts of the Case / गुन्ह्याची थोडक्यात हकीकत', briefFacts) +
    buildSectionBlockXml('Grounds of Arrest / अटकेची कारणे', grounds)
  );
}

/**
 * Backward compatibility alias for existing generator imports
 */
export const buildThreeInvestigationSectionsXml = buildInvestigationSectionsXml;

/**
 * Builds OpenXML paragraphs for dynamic PCR remaining investigation points.
 */
export function buildInvestigationPointsXml(points) {
  if (!Array.isArray(points)) return '';
  const MARATHI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  const toMarathiDigits = (num) => String(num).replace(/[0-9]/g, (d) => MARATHI_DIGITS[d] || d);

  const validPoints = points
    .map((p) => String(p || '').trim())
    .filter((p) => p.length > 0);

  if (validPoints.length === 0) return '';

  return validPoints.map((point, idx) => {
    let text = point;
    if (!text.match(/^([0-9]+|[०-९]+)\s*[\)\.\-]/)) {
      text = `${toMarathiDigits(idx + 1)}) ${text}`;
    }

    const lines = text.split('\n');
    const runs = lines.map((line, lIdx) => {
      const escaped = escapeXmlText(line);
      if (lIdx === 0) {
        return `<w:r><w:rPr><w:rFonts w:ascii="Kokila" w:hAnsi="Kokila" w:cs="Kokila"/><w:sz w:val="32"/><w:szCs w:val="32"/><w:cs/></w:rPr><w:t xml:space="preserve">${escaped}</w:t></w:r>`;
      }
      return `<w:r><w:rPr><w:rFonts w:ascii="Kokila" w:hAnsi="Kokila" w:cs="Kokila"/><w:sz w:val="32"/><w:szCs w:val="32"/><w:cs/></w:rPr><w:br/><w:t xml:space="preserve">${escaped}</w:t></w:r>`;
    }).join('');

    return `<w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="both"/><w:rPr><w:rFonts w:ascii="Kokila" w:hAnsi="Kokila" w:cs="Kokila"/><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr></w:pPr>${runs}</w:p>`;
  }).join('');
}

/**
 * Replaces the first paragraph matching snippet with raw OpenXML.
 */
export function replaceParagraphWithXml(docXml, matchSnippet, newXml) {
  if (!matchSnippet || !newXml) return docXml;
  let replacedOnce = false;
  return ensureXmlNamespaces(
    docXml.replace(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g, (p) => {
      if (replacedOnce) return p;
      const plainText = p.replace(/<[^>]+>/g, '');
      if (plainText.includes(matchSnippet)) {
        replacedOnce = true;
        return newXml;
      }
      return p;
    })
  );
}

/**
 * Removes paragraphs matching any of the snippets completely from Word XML.
 */
export function removeParagraphsBySnippets(docXml, snippets) {
  if (!docXml || !Array.isArray(snippets) || snippets.length === 0) return docXml;
  return ensureXmlNamespaces(
    docXml.replace(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g, (p) => {
      const text = p.replace(/<[^>]+>/g, '');
      for (const s of snippets) {
        if (s && text.includes(s)) return '';
      }
      return p;
    })
  );
}

/**
 * Formats a buckle number cleanly without duplicating prefixes like ब.क्र.
 */
export function formatBuckleNumber(buckleNo) {
  if (!buckleNo || typeof buckleNo !== 'string' || !buckleNo.trim()) return '';
  const trimmed = buckleNo.trim();
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
    return ` ${trimmed}`;
  }
  if (/^(?:ब[\.\s]*[क्रनं]|बक्कल|belt|buckle|b[\.\s]*no)/i.test(trimmed)) {
    return ` (${trimmed})`;
  }
  return ` (ब.क्र. ${trimmed})`;
}

/**
 * Dynamically updates the standard investigating officer signature block
 * (used in Medical Letter, Lockup Placement PS/ACP, Custody Transfer).
 * Inserts officer name above the designation line, updates rank and buckle number,
 * and sets the police station dynamically.
 */
export function updateStandardOfficerSignature(docXml, formData) {
  if (!docXml || !formData) return docXml;
  const pRegex = /<w:p(?:[\s>][\s\S]*?)<\/w:p>/g;
  const originalParas = docXml.match(pRegex) || [];
  const paras = [...originalParas];
  let tapIndex = -1;
  for (let i = 0; i < paras.length; i++) {
    const text = paras[i].replace(/<[^>]+>/g, '').trim();
    if (text === 'तपास अधिकारी' || text.includes('तपास अधिकारी')) {
      tapIndex = i;
    }
  }
  if (tapIndex === -1) return docXml;

  const ioName = formData.ioName || formData.officerName || '';
  const ioRank = formData.ioRank || formData.officerRank || '';
  const ioBuckleNo = formData.ioBuckleNo || formData.ioBeltNo || formData.officerNo || '';
  const ioStation = formData.ioStation || formData.policeStation || formData.sendingStation || '';

  for (let i = tapIndex + 1; i < paras.length; i++) {
    const text = paras[i].replace(/<[^>]+>/g, '').trim();
    if (text === 'पोलीस निरीक्षक' || text.includes('पोलीस निरीक्षक') || text.includes('पोलीस उपनिरीक्षक') || text.includes('वरीष्ठ पोलीस निरीक्षक')) {
      const nameIndex = i - 1;
      if (nameIndex > tapIndex) {
        const nameText = ioName ? `(${ioName})` : '(                   )';
        const pPrMatch = paras[nameIndex].match(/<w:pPr[\s\S]*?<\/w:pPr>/);
        const pPr = pPrMatch ? pPrMatch[0] : '';
        paras[nameIndex] = `<w:p>${pPr}<w:r><w:rPr><w:rFonts w:ascii="Kokila" w:hAnsi="Kokila" w:cs="Kokila"/><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr><w:t xml:space="preserve">${escapeXmlText(nameText)}</w:t></w:r></w:p>`;
      }

      const buckleStr = formatBuckleNumber(ioBuckleNo);
      const rankText = (ioRank || 'पोलीस निरीक्षक') + buckleStr;
      const rankPrMatch = paras[i].match(/<w:pPr[\s\S]*?<\/w:pPr>/);
      const rankPr = rankPrMatch ? rankPrMatch[0] : '';
      paras[i] = `<w:p>${rankPr}<w:r><w:rPr><w:rFonts w:ascii="Kokila" w:hAnsi="Kokila" w:cs="Kokila"/><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr><w:t xml:space="preserve">${escapeXmlText(rankText)}</w:t></w:r></w:p>`;

      const stationIndex = i + 1;
      if (stationIndex < paras.length) {
        const stationText = ioStation || 'पोलीस ठाणे सायबर नागपूर शहर';
        const stPrMatch = paras[stationIndex].match(/<w:pPr[\s\S]*?<\/w:pPr>/);
        const stPr = stPrMatch ? stPrMatch[0] : '';
        paras[stationIndex] = `<w:p>${stPr}<w:r><w:rPr><w:rFonts w:ascii="Kokila" w:hAnsi="Kokila" w:cs="Kokila"/><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr><w:t xml:space="preserve">${escapeXmlText(stationText)}</w:t></w:r></w:p>`;
      }
      break;
    }
  }

  let replacedXml = docXml;
  for (let i = tapIndex; i < paras.length; i++) {
    if (paras[i] !== originalParas[i]) {
      replacedXml = replacedXml.replace(originalParas[i], paras[i]);
    }
  }
  return ensureXmlNamespaces(replacedXml);
}

/**
 * Updates the PCR summary table by removing finance-specific rows
 * (Defrauded Amount and Refunded Amount) and renumbering the remaining rows
 * from 11 rows down to 9 rows (01 to 09).
 */
export function updateRemandSummaryTable(docXml) {
  if (!docXml || typeof docXml !== 'string') return docXml;

  return docXml.replace(/<w:tbl\b[\s\S]*?<\/w:tbl>/, (tblXml) => {
    // Only target the summary table (which contains 'पोलीस स्टेशन' and row numbers)
    if (!tblXml.includes('पोलीस स्टेशन') || (!tblXml.includes('फसवणुक') && !tblXml.includes('13,00,100'))) {
      return tblXml;
    }

    const firstTr = tblXml.indexOf('<w:tr');
    if (firstTr === -1) return tblXml;
    const tableHeader = tblXml.substring(0, firstTr);

    const rows = [];
    let pos = firstTr;
    while (true) {
      const trStart = tblXml.indexOf('<w:tr', pos);
      if (trStart === -1) break;
      const trEnd = tblXml.indexOf('</w:tr>', trStart);
      if (trEnd === -1) break;
      rows.push(tblXml.substring(trStart, trEnd + 7));
      pos = trEnd + 7;
    }

    const updatedRows = [];
    for (let r of rows) {
      const rowText = [...r.matchAll(/<w:t\b[^>]*>(.*?)<\/w:t>/gs)].map((t) => t[1]).join('');
      // Check if this row is Defrauded Amount or Refunded Amount
      if (
        rowText.includes('फसवणुक') ||
        rowText.includes('परत करण्यात आलेली') ||
        rowText.includes('13,00,100') ||
        (rowText.includes('07') && rowText.includes('रक्कम')) ||
        (rowText.includes('08') && rowText.includes('रक्कम'))
      ) {
        continue; // Drop row completely
      }

      // Renumber remaining rows:
      // Row 9 (घटनास्थळ) -> 07
      if (rowText.includes('घटनास्थळ')) {
        r = r.replace(/<w:t>09<\/w:t>/, '<w:t>07</w:t>')
             .replace(/<w:t>9<\/w:t>/, '<w:t>07</w:t>');
      }
      // Row 10 (घटना घडली तारीख वेळ) -> 08
      else if (rowText.includes('घटना घडली तारीख वेळ') || rowText.includes('घटना घडली')) {
        r = r.replace(/<w:t>10<\/w:t>/, '<w:t>08</w:t>');
      }
      // Row 11 (दाखल तारीख वेळ) -> 09
      else if (rowText.includes('दाखल तारीख वेळ') || rowText.includes('दाखल तारीख')) {
        r = r.replace(/<w:t>11<\/w:t>/, '<w:t>09</w:t>');
      }

      updatedRows.push(r);
    }

    return tableHeader + updatedRows.join('') + '</w:tbl>';
  });
}

export const MARATHI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
export const toMarathiDigits = (num) => String(num).replace(/[0-9]/g, (d) => MARATHI_DIGITS[d] || d);

/**
 * Normalizes all accused from formData into a single array.
 * First accused comes from primary fields (accusedName, accusedAlias, accusedFather, accusedAge, accusedAddress).
 * Additional accused come from formData.additionalAccused array.
 */
export function getAllAccusedList(formData) {
  if (!formData) return [];
  const list = [];

  const primaryName = (formData.accusedName || '').trim();
  if (primaryName) {
    list.push({
      accusedName: primaryName,
      accusedAlias: (formData.accusedAlias || '').trim(),
      accusedFather: (formData.accusedFather || formData.fatherName || '').trim(),
      accusedAge: (formData.accusedAge || '').trim(),
      accusedAddress: (formData.accusedAddress || '').trim()
    });
  } else if (formData.producedAccusedName && formData.producedAccusedName.trim()) {
    list.push({
      accusedName: formData.producedAccusedName.trim(),
      accusedAlias: '',
      accusedFather: '',
      accusedAge: '',
      accusedAddress: '',
      isPreformatted: true
    });
  }

  if (Array.isArray(formData.additionalAccused)) {
    for (const acc of formData.additionalAccused) {
      if (!acc) continue;
      const name = (acc.accusedName || '').trim();
      if (name) {
        list.push({
          accusedName: name,
          accusedAlias: (acc.accusedAlias || '').trim(),
          accusedFather: (acc.accusedFather || acc.fatherName || '').trim(),
          accusedAge: (acc.accusedAge || '').trim(),
          accusedAddress: (acc.accusedAddress || '').trim()
        });
      }
    }
  }

  return list;
}

/**
 * Formats a single accused object into a descriptive string.
 */
export function formatSingleAccused(acc, { includeAlias = true, includeFather = true, aliasPrefix = ' उर्फ ', fatherPrefix = ' पिता/पालक ' } = {}) {
  if (!acc) return '';
  if (acc.isPreformatted) return acc.accusedName;

  let str = acc.accusedName || '';
  if (includeAlias && acc.accusedAlias) {
    str += `${aliasPrefix}${acc.accusedAlias}`;
  }
  if (includeFather && acc.accusedFather) {
    str += `${fatherPrefix}${acc.accusedFather}`;
  }
  if (acc.accusedAge) {
    str += `, वय ${acc.accusedAge} वर्षे`;
  }
  if (acc.accusedAddress) {
    str += `, पत्ता – ${acc.accusedAddress}`;
  }
  return str;
}

/**
 * Formats all accused into a numbered list string (१) ..., २) ...).
 * If single accused and includeNumberForSingle is false, returns without numbering prefix.
 */
export function formatAllAccusedListText(accusedList, options = {}) {
  if (!Array.isArray(accusedList) || accusedList.length === 0) return '';
  const { includeNumberForSingle = false, separator = '\n' } = options;

  if (accusedList.length === 1 && !includeNumberForSingle) {
    return formatSingleAccused(accusedList[0], options);
  }

  return accusedList.map((acc, idx) => {
    const formatted = formatSingleAccused(acc, options);
    return `${toMarathiDigits(idx + 1)}) ${formatted}`;
  }).join(separator);
}
