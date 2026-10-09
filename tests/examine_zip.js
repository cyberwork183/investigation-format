import fs from 'fs';
import JSZip from 'jszip';

async function examineTemplate(filename) {
  const buffer = fs.readFileSync(filename);
  const zip = await JSZip.loadAsync(buffer);
  
  console.log(`\n======================================================`);
  console.log(`FILE: ${filename}`);
  console.log(`Files in zip:`, Object.keys(zip.files));
  
  const docXml = await zip.file('word/document.xml').async('text');
  console.log(`document.xml length: ${docXml.length}`);
  
  // Check if there are header/footer files
  for (const name of Object.keys(zip.files)) {
    if (name.startsWith('word/header') || name.startsWith('word/footer')) {
      console.log(`Found header/footer: ${name}`);
    }
  }
}

async function run() {
  await examineTemplate('arrest form_templete.docx');
  await examineTemplate('पोलीस कोठडी रिमांड.docx');
  await examineTemplate('medical letter 108-2025.docx');
  await examineTemplate('अटकेची परवानगी.docx');
}

run();
