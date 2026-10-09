import fs from 'fs';
import JSZip from 'jszip';

async function extractLetters() {
  // 1. Remand Application: 'पोलीस कोठडी रिमांड.docx' is already a single complete document.
  // We can copy it as remand-application-master.docx directly!
  const remandBuf = fs.readFileSync('पोलीस कोठडी रिमांड.docx');
  fs.writeFileSync('public/template/remand-application-master.docx', remandBuf);
  console.log('Saved public/template/remand-application-master.docx');

  // 2. Medical letters file: 'medical letter 108-2025.docx' contains 4 letters.
  // Let's inspect the paragraphs for each letter in medical letter 108-2025.docx
  const medBuf = fs.readFileSync('medical letter 108-2025.docx');
  const medZip = await JSZip.loadAsync(medBuf);
  const medDocXml = await medZip.file('word/document.xml').async('text');

  // Let's parse all paragraphs in medDocXml
  const bodyMatch = medDocXml.match(/<w:body>([\s\S]*?)<\/w:body>/);
  const bodyContent = bodyMatch[1];
  const sectPrMatch = bodyContent.match(/<w:sectPr[\s\S]*?<\/w:sectPr>$/);
  const sectPr = sectPrMatch ? sectPrMatch[0] : '';
  
  // Find all <w:p>
  const pRegex = /<w:p[\s>][\s\S]*?<\/w:p>/g;
  const pList = bodyContent.match(pRegex) || [];
  console.log(`Medical letters file has ${pList.length} paragraphs.`);

  // Letter 1: Medical letter (P0 to P15, before P16 page break)
  // Letter 2: Lockup PS letter (P17 to P32, before P33 page break)
  // Letter 3: Lockup ACP letter (P34 to P48, before P49/P50 page break)
  // Letter 4: Custody Transfer letter (P51 to P66)

  async function createStandaloneDoc(sourceZip, paragraphs, outputPath) {
    const newZip = new JSZip();
    // Copy all files from sourceZip
    for (const [filename, fileObj] of Object.entries(sourceZip.files)) {
      if (filename !== 'word/document.xml') {
        const content = await fileObj.async('nodebuffer');
        newZip.file(filename, content);
      }
    }
    // Clean paragraphs of any trailing or leading page breaks
    const cleanedParas = paragraphs.map(p => {
      return p.replace(/<w:r>\s*<w:br w:type="page"\/>\s*<\/w:r>/g, '')
              .replace(/<w:br w:type="page"\/>/g, '')
              .replace(/<w:lastRenderedPageBreak\/>/g, '');
    });
    
    const newDocXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">\n<w:body>\n${cleanedParas.join('\n')}\n${sectPr}\n</w:body>\n</w:document>`;
    
    newZip.file('word/document.xml', newDocXml);
    const outBuf = await newZip.generateAsync({ type: 'nodebuffer' });
    fs.writeFileSync(outputPath, outBuf);
    console.log(`Created ${outputPath} (${outBuf.length} bytes)`);
  }

  // Slices for medical letter 108-2025.docx:
  // Letter 1: P 0..16
  await createStandaloneDoc(medZip, pList.slice(0, 16), 'public/template/medical-letter-master.docx');
  // Letter 2: P 17..33
  await createStandaloneDoc(medZip, pList.slice(17, 33), 'public/template/lockup-placement-ps-master.docx');
  // Letter 3: P 34..49
  await createStandaloneDoc(medZip, pList.slice(34, 49), 'public/template/lockup-placement-acp-master.docx');
  // Letter 4: P 51..67
  await createStandaloneDoc(medZip, pList.slice(51, 67), 'public/template/custody-transfer-master.docx');

  // 3. Permission to arrest file: 'अटकेची परवानगी.docx' contains 2 letters.
  const arrBuf = fs.readFileSync('अटकेची परवानगी.docx');
  const arrZip = await JSZip.loadAsync(arrBuf);
  const arrDocXml = await arrZip.file('word/document.xml').async('text');
  const arrBodyMatch = arrDocXml.match(/<w:body>([\s\S]*?)<\/w:body>/);
  const arrBodyContent = arrBodyMatch[1];
  const arrSectPrMatch = arrBodyContent.match(/<w:sectPr[\s\S]*?<\/w:sectPr>$/);
  const arrSectPr = arrSectPrMatch ? arrSectPrMatch[0] : '';
  const arrPList = arrBodyContent.match(pRegex) || [];
  console.log(`Arrest permission file has ${arrPList.length} paragraphs.`);

  // Letter 1: Arrest Permission (P 0..18)
  await createStandaloneDoc(arrZip, arrPList.slice(0, 19), 'public/template/arrest-permission-master.docx');
  // Letter 2: Medical Exam (Pre-arrest) (P 19..37)
  await createStandaloneDoc(arrZip, arrPList.slice(19, 37), 'public/template/medical-pre-arrest-master.docx');
}

extractLetters().catch(console.error);
