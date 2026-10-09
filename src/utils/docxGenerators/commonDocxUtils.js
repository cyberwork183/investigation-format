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

