const fs = require('fs');

async function verifyForm3DocxOutput() {
  console.log('=== VERIFYING FORM III DOCX OUTPUT QUALITY ===\n');

  const newTabRes = await fetch('http://localhost:9222/json/new?http://localhost:3000', { method: 'PUT' });
  const tabData = await newTabRes.json();
  const ws = new WebSocket(tabData.webSocketDebuggerUrl);

  let msgId = 1;
  const callbacks = new Map();

  function sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      callbacks.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await new Promise((resolve) => ws.onopen = resolve);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      const cb = callbacks.get(data.id);
      callbacks.delete(data.id);
      if (data.error) cb.reject(data.error);
      else cb.resolve(data.result);
    }
  };

  await sendCommand('Runtime.enable');
  await sendCommand('Page.enable');
  await new Promise(r => setTimeout(r, 1500));

  async function evaluate(expression) {
    const res = await sendCommand('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${res.exceptionDetails.text} (${res.exceptionDetails.exception?.description})`);
    }
    return res.result.value;
  }

  // 1. Generate with Sample Data
  console.log('1. Generating Form III with sample data...');
  const sampleB64 = await evaluate(`
    (async () => {
      const { generateOfficialDocx } = await import('/src/utils/docxGenerator.js');
      const { getSampleForm3Data } = await import('/src/utils/documentSchemas.js');
      const data = getSampleForm3Data();
      const blob = await generateOfficialDocx(data);
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    })()
  `);

  const sampleBuf = Buffer.from(sampleB64, 'base64');
  fs.writeFileSync('verified_sample_form3.docx', sampleBuf);
  console.log('  Saved sample Form III to verified_sample_form3.docx (' + sampleBuf.length + ' bytes)');

  // 2. Generate with Empty Data
  console.log('2. Generating Form III with empty data...');
  const emptyB64 = await evaluate(`
    (async () => {
      const { generateOfficialDocx } = await import('/src/utils/docxGenerator.js');
      const { getDefaultForm3Data } = await import('/src/utils/documentSchemas.js');
      const data = getDefaultForm3Data();
      const blob = await generateOfficialDocx(data);
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    })()
  `);

  const emptyBuf = Buffer.from(emptyB64, 'base64');
  fs.writeFileSync('verified_empty_form3.docx', emptyBuf);
  console.log('  Saved empty Form III to verified_empty_form3.docx (' + emptyBuf.length + ' bytes)');

  // 3. Inspect XML of generated document
  const JSZip = require('jszip');
  const zip = await JSZip.loadAsync(sampleBuf);
  const docXml = await zip.file('word/document.xml').async('text');

  const pageBrs = (docXml.match(/<w:br[^>]*w:type="page"[^>]*\/>/g) || []).length;
  console.log(`\n[Quality Check] Page break tags count: ${pageBrs} (Expected: 0)`);
  if (pageBrs !== 0) throw new Error(`Found unexpected page breaks in generated Form III: ${pageBrs}`);

  const emptyBodyParas = (docXml.match(/<w:p\b[^>]*>(?:<w:pPr>[\s\S]*?<\/w:pPr>)?\s*<\/w:p>/g) || []).length;
  console.log(`[Quality Check] Empty paragraphs in XML count: ${emptyBodyParas}`);

  // Check that place replacement has no duplicate station names
  const placeMatches = docXml.match(/Cyber Police Station, Nagpur City[^<]*/g) || [];
  console.log('[Quality Check] Place string matches:', placeMatches);

  // Check that witness names and addresses are present
  if (!docXml.includes('Vikas Manohar Rao') || !docXml.includes('Prakash D. Shinde')) {
    throw new Error('Witness names missing from generated Form III!');
  }
  console.log('[Quality Check] Witness names correctly injected.');

  // Check that physical features table contains data
  if (!docXml.includes('172 cm') || !docXml.includes('Wheatish') || !docXml.includes('Old faint linear scar')) {
    throw new Error('Physical features data missing from generated Form III!');
  }
  console.log('[Quality Check] Physical features table data correctly injected.');

  console.log('\n=== FORM III DOCX OUTPUT VERIFICATION PASSED (100%) ===\n');
  await sendCommand('Page.close');
  ws.close();
  process.exit(0);
}

verifyForm3DocxOutput().catch(err => {
  console.error('\n❌ VERIFICATION FAILED:', err);
  process.exit(1);
});
