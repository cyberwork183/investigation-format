const fs = require('fs');
const JSZip = require('jszip');

async function dumpFile(f) {
  const data = fs.readFileSync(f);
  const zip = await JSZip.loadAsync(data);
  const xml = await zip.file('word/document.xml').async('text');
  const paragraphs = xml.match(/<w:p[\s\S]*?<\/w:p>/g) || [];
  console.log('############################################################');
  console.log('FILE: ' + f + ' (Total paragraphs: ' + paragraphs.length + ')');
  console.log('############################################################');
  paragraphs.forEach((p, idx) => {
    const text = p.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (text) {
      console.log(`[P${idx}] ${text}`);
    }
  });
}

(async () => {
  const target = process.argv[2];
  if (target) {
    await dumpFile(target);
  }
})();
