const fs = require('fs');
const JSZip = require('jszip');

async function testFullCleanup() {
  const buf = fs.readFileSync('public/template/arrest-form-master.docx');
  const zip = await JSZip.loadAsync(buf);
  const docXmlStr = await zip.file('word/document.xml').async('text');

  // Let's inspect all top-level children of w:body
  const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const WP_NS = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing';

  // Parse with browser DOM or regex
  console.log('Doc XML loaded successfully');
}

testFullCleanup().catch(console.error);
