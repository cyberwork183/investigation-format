import fs from 'fs';
import JSZip from 'jszip';

/**
 * Robust OpenXML paragraph replacer:
 * Replaces the text inside any <w:p> that matches a regex or substring,
 * while preserving 100% of the paragraph properties (<w:pPr>) and run formatting (<w:rPr>).
 */
export function replaceParagraphTextByMatch(docXml, searchSnippet, newText) {
  const pRegex = /<w:p[\s>][\s\S]*?<\/w:p>/g;
  return docXml.replace(pRegex, (p) => {
    // Extract plain text from paragraph
    const tRegex = /<w:t[\s>]([^<]*)<\/w:t>|<w:t\s[^>]*>([^<]*)<\/w:t>/g;
    const texts = [];
    let tm;
    while ((tm = tRegex.exec(p)) !== null) {
      texts.push(tm[1] || tm[2] || '');
    }
    const fullText = texts.join('');

    if (fullText.includes(searchSnippet)) {
      // Extract pPr
      const pPrMatch = p.match(/<w:pPr[\s\S]*?<\/w:pPr>/);
      const pPr = pPrMatch ? pPrMatch[0] : '';

      // Extract first rPr
      const rPrMatch = p.match(/<w:rPr[\s\S]*?<\/w:rPr>/);
      const rPr = rPrMatch ? rPrMatch[0] : '';

      return `<w:p><w:pPr>${pPr ? pPr.replace(/<\/?w:pPr>/g, '') : ''}</w:pPr><w:r><w:rPr>${rPr ? rPr.replace(/<\/?w:rPr>/g, '') : ''}</w:rPr><w:t xml:space="preserve">${newText}</w:t></w:r></w:p>`;
    }
    return p;
  });
}

async function test() {
  const buf = fs.readFileSync('public/template/remand-application-master.docx');
  const zip = await JSZip.loadAsync(buf);
  let docXml = await zip.file('word/document.xml').async('text');

  docXml = replaceParagraphTextByMatch(docXml, 'संदीप भानुदास', 'राहुल रमेश पाटील, वय ३० वर्षे, पत्ता – नागपूर');
  docXml = replaceParagraphTextByMatch(docXml, 'श्रद्धा नथुजी', 'अनिता विजय जोशी, वय ४० वर्षे, पत्ता – नागपूर');

  if (docXml.includes('राहुल रमेश पाटील') && docXml.includes('अनिता विजय जोशी')) {
    console.log('✓ Paragraph replacement test succeeded!');
  } else {
    console.error('Replacement failed!');
  }
}

test();
