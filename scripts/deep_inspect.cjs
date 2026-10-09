const fs = require('fs');
const JSZip = require('jszip');

async function inspectDocStructure(filename) {
  const data = fs.readFileSync(filename);
  const zip = await JSZip.loadAsync(data);
  const docXml = await zip.file('word/document.xml').async('text');
  
  console.log('========================================================================');
  console.log('INSPECTING XML STRUCTURE FOR:', filename);
  console.log('========================================================================');
  
  // Extract all paragraphs
  const pRegex = /<w:p(?:[\s>][\s\S]*?)<\/w:p>/g;
  let match;
  let idx = 0;
  while ((match = pRegex.exec(docXml)) !== null) {
    const pXml = match[0];
    const text = pXml.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (text) {
      console.log(`P${idx}: "${text}"`);
    }
    idx++;
  }
}

(async () => {
  await inspectDocStructure('३५(२) नोटीस चेकलिस्ट.docx');
  await inspectDocStructure('अटक सान्हा.docx');
  await inspectDocStructure('४७ नोटीस.docx');
  await inspectDocStructure('४८ नोटीस.docx');
})();
