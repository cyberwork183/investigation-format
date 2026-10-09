const fs = require('fs');

async function inspectForm3Docx() {
  console.log('=== INSPECTING FORM III MASTER & GENERATED DOCX ===\n');

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

  const analysis = await evaluate(`
    (async () => {
      const res = await fetch('/template/arrest-form-master.docx');
      const buf = await res.arrayBuffer();
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(buf);
      const docXmlStr = await zip.file('word/document.xml').async('text');
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(docXmlStr, 'application/xml');
      const body = xmlDoc.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'body')[0];
      const elements = Array.from(body.children);

      const items = elements.map((elem, idx) => {
        const tag = elem.tagName;
        const text = elem.textContent.trim().replace(/\\s+/g, ' ');
        const pPr = elem.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'pPr')[0];
        
        let spacingInfo = null;
        let pageBreakBefore = false;
        let keepNext = false;
        let keepLines = false;
        
        if (pPr) {
          const sp = pPr.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'spacing')[0];
          if (sp) {
            spacingInfo = {
              before: sp.getAttributeNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'before') || sp.getAttribute('w:before'),
              after: sp.getAttributeNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'after') || sp.getAttribute('w:after'),
              line: sp.getAttributeNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'line') || sp.getAttribute('w:line'),
              lineRule: sp.getAttributeNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'lineRule') || sp.getAttribute('w:lineRule')
            };
          }
          pageBreakBefore = !!pPr.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'pageBreakBefore')[0];
          keepNext = !!pPr.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'keepNext')[0];
          keepLines = !!pPr.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'keepLines')[0];
        }

        const brs = Array.from(elem.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'br'));
        const pageBrCount = brs.filter(b => (b.getAttributeNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'type') || b.getAttribute('w:type')) === 'page').length;

        const isTable = tag.endsWith('tbl');
        let tblInfo = null;
        if (isTable) {
          const trs = Array.from(elem.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'tr'));
          const cantSplitCount = trs.filter(tr => !!tr.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'cantSplit')[0]).length;
          tblInfo = { rowCount: trs.length, cantSplitCount };
        }

        const isEmptyPara = !isTable && text === '';

        return {
          idx,
          tag,
          text: text.substring(0, 80),
          isEmptyPara,
          spacingInfo,
          pageBreakBefore,
          keepNext,
          keepLines,
          pageBrCount,
          tblInfo
        };
      });

      // Also check styles.xml and sectPr
      const sectPr = body.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'sectPr')[0];
      let pageMargins = null;
      if (sectPr) {
        const pgMar = sectPr.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'pgMar')[0];
        if (pgMar) {
          pageMargins = {
            top: pgMar.getAttribute('w:top') || pgMar.getAttributeNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'top'),
            bottom: pgMar.getAttribute('w:bottom') || pgMar.getAttributeNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'bottom'),
            left: pgMar.getAttribute('w:left') || pgMar.getAttributeNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'left'),
            right: pgMar.getAttribute('w:right') || pgMar.getAttributeNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'right')
          };
        }
      }

      return { total: elements.length, items, pageMargins };
    })()
  `);

  console.log('Total Elements:', analysis.total);
  console.log('Page Margins (dxf/twips):', analysis.pageMargins);
  console.log('\n--- ELEMENTS LISTING ---');
  analysis.items.forEach(item => {
    const flags = [];
    if (item.isEmptyPara) flags.push('[EMPTY_PARA]');
    if (item.pageBreakBefore) flags.push('[PAGE_BREAK_BEFORE]');
    if (item.pageBrCount > 0) flags.push(`[PAGE_BR x${item.pageBrCount}]`);
    if (item.keepNext) flags.push('[KEEP_NEXT]');
    if (item.keepLines) flags.push('[KEEP_LINES]');
    if (item.spacingInfo) flags.push(`[SPACING bef:${item.spacingInfo.before || '0'} aft:${item.spacingInfo.after || '0'} line:${item.spacingInfo.line || 'auto'}]`);
    if (item.tblInfo) flags.push(`[TBL rows:${item.tblInfo.rowCount} cantSplit:${item.tblInfo.cantSplitCount}]`);

    console.log(`[${String(item.idx).padStart(3, ' ')}] <${item.tag}> ${flags.join(' ')} | "${item.text}"`);
  });

  await sendCommand('Page.close');
  ws.close();
}

inspectForm3Docx().catch(console.error);
