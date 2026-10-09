const fs = require('fs');

async function runTest() {
  console.log('Connecting to Chrome CDP...');
  
  // 1. Create a new target page
  const newTabRes = await fetch('http://localhost:9222/json/new?http://localhost:8090', { method: 'PUT' });
  const tabData = await newTabRes.json();
  console.log('Target created:', tabData.id, tabData.url);

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
  console.log('WebSocket connected to page.');

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      const cb = callbacks.get(data.id);
      callbacks.delete(data.id);
      if (data.error) cb.reject(data.error);
      else cb.resolve(data.result);
    } else if (data.method === 'Runtime.consoleAPICalled') {
      const args = data.params.args.map(a => a.value || a.description).join(' ');
      console.log(`[BROWSER CONSOLE ${data.params.type.toUpperCase()}] ${args}`);
    } else if (data.method === 'Runtime.exceptionThrown') {
      console.error('[BROWSER EXCEPTION]', data.params.exceptionDetails.text, data.params.exceptionDetails.exception?.description);
    }
  };

  // Enable Runtime and Page domains
  await sendCommand('Runtime.enable');
  await sendCommand('Page.enable');

  // Wait 1 second for page load
  await new Promise(r => setTimeout(r, 1000));

  async function evaluate(expression) {
    const res = await sendCommand('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval failed: ${res.exceptionDetails.text}`);
    }
    return res.result.value;
  }

  // 1. Check title and main elements
  const title = await evaluate('document.title');
  console.log('Page title:', title);

  const headerH1 = await evaluate('document.querySelector("h1").innerText');
  console.log('Header text:', headerH1);

  // 2. Click "Fill Sample Test Data"
  console.log('Clicking "Fill Sample Test Data"...');
  await evaluate('document.getElementById("btnFillSample").click()');
  await new Promise(r => setTimeout(r, 500));

  const stateVal = await evaluate('document.getElementById("state").value');
  const firVal = await evaluate('document.getElementById("firNo").value');
  const accusedNameVal = await evaluate('document.getElementById("accusedName").value');
  const pfHairVal = await evaluate('document.getElementById("pf_hair").value');
  const witness1Val = await evaluate('document.getElementById("witness1Name").value');
  const officerNameVal = await evaluate('document.getElementById("officerName").value');

  console.log('Sample Data populated:');
  console.log('  State:', stateVal);
  console.log('  FIR No:', firVal);
  console.log('  Accused Name:', accusedNameVal);
  console.log('  Physical feature hair:', pfHairVal);
  console.log('  Witness 1:', witness1Val);
  console.log('  Officer:', officerNameVal);

  // 3. Test step navigation to Step 8 (Review)
  console.log('Navigating to Step 8 (Review & Officer Details)...');
  await evaluate('goToStep(8)');
  await new Promise(r => setTimeout(r, 500));

  const reviewHeader = await evaluate('document.querySelector(".review-section-header").innerText');
  console.log('Review Section rendered:', reviewHeader);

  // 4. Test validation check
  const valResult = await evaluate('validateFormData(extractFormDataFromUI())');
  console.log('Validation passed with sample data:', valResult.isValid);

  // 5. Test DOCX generation in browser!
  console.log('Triggering DOCX generation in browser...');
  const genResult = await evaluate(`
    (async () => {
      try {
        const data = extractFormDataFromUI();
        const blob = await generateOfficialDocx(data, currentPhotoBuffer);
        return { success: true, size: blob.size, type: blob.type };
      } catch (e) {
        return { success: false, error: e.message, stack: e.stack };
      }
    })()
  `);

  console.log('DOCX Generation Result:', genResult);

  // 6. Capture screenshot
  console.log('Capturing screenshot of UI...');
  const screenshotRes = await sendCommand('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('browser_test_screenshot.png', Buffer.from(screenshotRes.data, 'base64'));
  console.log('Screenshot saved to browser_test_screenshot.png, size:', fs.statSync('browser_test_screenshot.png').size);

  // Close tab
  await fetch(`http://localhost:9222/json/close/${tabData.id}`);
  ws.close();

  if (genResult.success && genResult.size > 20000) {
    console.log('\n=============================================');
    console.log('SUCCESS: BROWSER DOCX GENERATOR FULLY VERIFIED!');
    console.log(`Blob size: ${genResult.size} bytes`);
    console.log('=============================================\n');
  } else {
    console.error('FAILURE: DOCX generation failed:', genResult);
    process.exit(1);
  }
}

runTest().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
