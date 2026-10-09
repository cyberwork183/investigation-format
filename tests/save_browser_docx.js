const fs = require('fs');

async function main() {
  const res = await fetch('http://localhost:9222/json/new?http://localhost:8090', { method: 'PUT' });
  const tab = await res.json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const curId = id++;
    const handler = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.id === curId) {
        ws.removeEventListener('message', handler);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await send('Runtime.enable');
  await new Promise(r => setTimeout(r, 800));

  await send('Runtime.evaluate', { expression: 'document.getElementById("btnFillSample").click()' });
  await new Promise(r => setTimeout(r, 500));

  console.log('Generating docx in browser...');
  const result = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        const data = extractFormDataFromUI();
        const blob = await generateOfficialDocx(data, null);
        const reader = new FileReader();
        return new Promise(resolve => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(blob);
        });
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  const b64 = result.result.value;
  fs.writeFileSync('browser_generated_output.docx', Buffer.from(b64, 'base64'));
  console.log('Saved browser_generated_output.docx, size:', fs.statSync('browser_generated_output.docx').size);

  await fetch(`http://localhost:9222/json/close/${tab.id}`);
  ws.close();
}

main().catch(console.error);
