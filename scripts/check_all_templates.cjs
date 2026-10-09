const fs = require('fs');
const JSZip = require('jszip');

async function checkAll() {
  const files = fs.readdirSync('public/template').filter(f => f.endsWith('.docx') && !f.startsWith('~'));
  console.log('Checking all templates for hard page breaks:');
  for (const f of files) {
    const buf = fs.readFileSync('public/template/' + f);
    const zip = await JSZip.loadAsync(buf);
    const docXmlStr = await zip.file('word/document.xml').async('text');
    const pageBrs = (docXmlStr.match(/<w:br[^>]*w:type="page"[^>]*\/>/g) || []).length;
    console.log(`  ${f.padEnd(35, ' ')} -> Page breaks: ${pageBrs}`);
  }
}

checkAll().catch(console.error);
