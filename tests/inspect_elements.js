import fs from 'fs';
import JSZip from 'jszip';

async function inspectXmlElements(filename) {
  const buffer = fs.readFileSync(filename);
  const zip = await JSZip.loadAsync(buffer);
  const docXml = await zip.file('word/document.xml').async('text');
  
  // Let's inspect the body children: <w:p>, <w:tbl>, <w:sectPr>
  const bodyMatch = docXml.match(/<w:body>([\s\S]*?)<\/w:body>/);
  if (!bodyMatch) return;
  const bodyContent = bodyMatch[1];
  
  // Find all top-level children of w:body
  const childRegex = /<(w:p|w:tbl)(?:\s|>)(?:[\s\S]*?)(?:<\/\1>|\/>)/g;
  let matches = [];
  let m;
  while ((m = childRegex.exec(bodyContent)) !== null) {
    const text = m[0].replace(/<[^>]+>/g, '').trim();
    const hasPageBreak = m[0].includes('w:type="page"') || m[0].includes('w:lastRenderedPageBreak');
    matches.push({
      tag: m[1],
      hasPageBreak,
      text: text.substring(0, 100),
      rawLen: m[0].length
    });
  }
  console.log(`\n=================================================`);
  console.log(`FILE: ${filename} - Top level elements count: ${matches.length}`);
  console.log(`=================================================`);
  matches.forEach((item, idx) => {
    console.log(`[${idx}] <${item.tag}> (len: ${item.rawLen}) ${item.hasPageBreak ? '[PAGE BREAK] ' : ''}${item.text}`);
  });
}

async function run() {
  await inspectXmlElements('medical letter 108-2025.docx');
  await inspectXmlElements('अटकेची परवानगी.docx');
  await inspectXmlElements('पोलीस कोठडी रिमांड.docx');
}

run();
