const fs = require('fs');

async function testGenerateAndInspect() {
  console.log('=== GENERATING FORM III DOCX AND INSPECTING ===\n');

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

  // Generate sample Form 3 DOCX via app modules in browser
  const base64Docx = await evaluate(`
    (async () => {
      const { generateOfficialDocx } = await import('/src/utils/docxGenerator.js');
      const { getSampleForm3Data } = await import('/src/utils/documentSchemas.js');
      const sampleData = getSampleForm3Data();
      const blob = await generateOfficialDocx(sampleData);
      
      // Convert blob to base64
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const b64 = reader.result.split(',')[1];
          resolve(b64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    })()
  `);

  const buf = Buffer.from(base64Docx, 'base64');
  fs.writeFileSync('test_generated_form3.docx', buf);
  console.log('Saved generated file to test_generated_form3.docx');

  // Inspect the generated DOCX XML
  const JSZip = require('jszip');
  const zip = await JSZip.loadAsync(buf);
  const docXmlStr = await zip.file('word/document.xml').async('text');
  const bodyXml = docXmlStr.match(/<w:body[\s\S]*<\/w:body>/)[0];

  const elementRegex = /<(w:p|w:tbl|w:sectPr)[\s\S]*?<\/\1>|<(w:sectPr)[\s\S]*?\/>/g;
  let match;
  let idx = 0;

  console.log('\n=== GENERATED DOCX BODY ELEMENTS ===');
  while ((match = elementRegex.exec(bodyXml)) !== null) {
    const fullTag = match[0];
    const tagName = match[1] || match[2];

    const textMatches = fullTag.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || [];
    const text = textMatches.map(t => t.replace(/<[^>]+>/g, '')).join('').replace(/\s+/g, ' ').trim();

    const spacingMatch = fullTag.match(/<w:spacing([^>]*?)\/>/);
    let spacingStr = '';
    if (spacingMatch) {
      const before = (spacingMatch[1].match(/w:before="([^"]+)"/) || [])[1] || '0';
      const after = (spacingMatch[1].match(/w:after="([^"]+)"/) || [])[1] || '0';
      const line = (spacingMatch[1].match(/w:line="([^"]+)"/) || [])[1] || 'auto';
      const lineRule = (spacingMatch[1].match(/w:lineRule="([^"]+)"/) || [])[1] || '';
      spacingStr = `spacing(bef:${before}, aft:${after}, line:${line}, rule:${lineRule})`;
    }

    const pageBreakBefore = /<w:pageBreakBefore\/>/.test(fullTag);
    const keepNext = /<w:keepNext\/>/.test(fullTag);
    const keepLines = /<w:keepLines\/>/.test(fullTag);
    const pageBrs = (fullTag.match(/<w:br[^>]*w:type="page"[^>]*\/>/g) || []).length;
    const isTable = tagName === 'w:tbl';
    let tableInfo = '';
    if (isTable) {
      const trCount = (fullTag.match(/<w:tr[\s>]/g) || []).length;
      const cantSplitCount = (fullTag.match(/<w:cantSplit\/>/g) || []).length;
      tableInfo = `TABLE(rows:${trCount}, cantSplit:${cantSplitCount})`;
    }

    const isEmptyPara = !isTable && text === '';

    const flags = [];
    if (isEmptyPara) flags.push('[EMPTY_PARA]');
    if (pageBreakBefore) flags.push('[PAGE_BREAK_BEFORE]');
    if (pageBrs > 0) flags.push(`[PAGE_BR x${pageBrs}]`);
    if (keepNext) flags.push('[KEEP_NEXT]');
    if (keepLines) flags.push('[KEEP_LINES]');
    if (spacingStr) flags.push(`[${spacingStr}]`);
    if (tableInfo) flags.push(`[${tableInfo}]`);

    console.log(`[${String(idx).padStart(3, ' ')}] <${tagName}> ${flags.join(' ')} | "${text.substring(0, 75)}"`);
    idx++;
  }

  await sendCommand('Page.close');
  ws.close();
}

testGenerateAndInspect().catch(console.error);
