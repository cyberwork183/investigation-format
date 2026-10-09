const fs = require('fs');
const JSZip = require('jszip');

async function testFix() {
  const buf = fs.readFileSync('public/template/arrest-form-master.docx');
  const zip = await JSZip.loadAsync(buf);
  let docXmlStr = await zip.file('word/document.xml').async('text');

  console.log('Original docXml length:', docXmlStr.length);

  // Check all instances of page breaks
  const pageBrs = docXmlStr.match(/<w:br[^>]*w:type="page"[^>]*\/>/g) || [];
  console.log('Found page breaks:', pageBrs.length);

  // Check all empty paragraphs
  const emptyParas = docXmlStr.match(/<w:p\b[^>]*>(?:<w:pPr>[\s\S]*?<\/w:pPr>)?\s*<\/w:p>/g) || [];
  console.log('Found empty paragraphs (<w:p/>):', emptyParas.length);

  // Check paragraphs that only contain dashes or underscores
  const dashedParas = docXmlStr.match(/<w:p\b[^>]*>[\s\S]*?<w:t[^>]*>\s*-{10,}\s*<\/w:t>[\s\S]*?<\/w:p>/g) || [];
  console.log('Found dashed placeholder paragraphs:', dashedParas.length);
}

testFix().catch(console.error);
