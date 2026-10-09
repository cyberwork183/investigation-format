/**
 * test_production_preview_build.cjs
 * Comprehensive verification of the production bundle (dist/) running on preview server.
 */

async function testProductionBuild() {
  console.log('===============================================================');
  console.log('  TEST: PRODUCTION BUILD VERIFICATION (http://localhost:4173)');
  console.log('===============================================================');

  const newTabRes = await fetch('http://localhost:9222/json/new?http://localhost:4173', { method: 'PUT' });
  const tabData = await newTabRes.json();
  console.log('Created test tab on preview server:', tabData.id);

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

  const consoleErrors = [];
  const failedRequests = [];

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      const cb = callbacks.get(data.id);
      callbacks.delete(data.id);
      if (data.error) cb.reject(data.error);
      else cb.resolve(data.result);
    }
    if (data.method === 'Runtime.consoleAPICalled' && data.params.type === 'error') {
      consoleErrors.push(data.params.args.map(a => a.value || a.description).join(' '));
    }
    if (data.method === 'Network.responseReceived') {
      if (data.params.response.status >= 400) {
        failedRequests.push(`${data.params.response.url} (${data.params.response.status})`);
      }
    }
  };

  await sendCommand('Runtime.enable');
  await sendCommand('Page.enable');
  await sendCommand('Network.enable');

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

  await new Promise(r => setTimeout(r, 1200));

  // 1. Check all 11 document cards rendered in production build
  console.log('\n--- 1. Checking 11 Document Cards in Production Build ---');
  const cardsCount = await evaluate(`document.querySelectorAll('.doc-card').length`);
  console.log('  Total Document Cards on Dashboard:', cardsCount);
  const test1Pass = cardsCount === 11;
  console.log('  => Test 1 Result:', test1Pass ? 'PASSED' : 'FAILED');

  // 2. Check 4 sections in production build
  console.log('\n--- 2. Checking 4 Sections in Production Build ---');
  const sectionsCount = await evaluate(`document.querySelectorAll('.dashboard-section').length`);
  console.log('  Total Sections:', sectionsCount);
  const test2Pass = sectionsCount === 4;
  console.log('  => Test 2 Result:', test2Pass ? 'PASSED' : 'FAILED');

  // 3. Test Form III sample data and DOCX generation in production
  console.log('\n--- 3. Testing Form III Opening & DOCX Generation in Production ---');
  await evaluate(`document.querySelector('.doc-card[data-doc-id="form3"] button').click()`);
  await new Promise(r => setTimeout(r, 300));

  const form3Fir = await evaluate(`document.querySelector('input[name="firNo"], input#firNo')?.value || ''`);
  console.log('  Form III Initial Sample FIR No (Step 1):', form3Fir);

  // Navigate to step 4 to check Accused Name
  await evaluate(`
    (() => {
      const step4 = Array.from(document.querySelectorAll('.step-item')).find(s => s.getAttribute('data-step') === '4');
      if (step4) step4.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 200));
  const form3Accused = await evaluate(`document.querySelector('input[name="accusedName"], input#accusedName')?.value || ''`);
  console.log('  Form III Initial Sample Accused Name (Step 4):', form3Accused);

  // Navigate to step 8 and generate Form III DOCX
  await evaluate(`
    (() => {
      const step8 = Array.from(document.querySelectorAll('.step-item')).find(s => s.getAttribute('data-step') === '8');
      if (step8) step8.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 200));

  const generateBtn = await evaluate(`!!document.querySelector('.btn-generate-docx, .btn-success')`);
  console.log('  Form III Generate Button Found:', generateBtn);

  const test3Pass = form3Fir === '89/2026' && form3Accused === 'Ramesh Kumar Suresh Patel' && generateBtn;
  console.log('  => Test 3 Result:', test3Pass ? 'PASSED' : 'FAILED');

  // 4. Test Share Details in production build
  console.log('\n--- 4. Testing Share Details in Production Build ---');
  await evaluate(`
    (() => {
      const shareBtn = document.querySelector('.btn-share-details');
      if (shareBtn) shareBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 300));

  // Return to Dashboard and open Medical Letter
  await evaluate(`document.querySelector('.btn-back-dashboard').click()`);
  await new Promise(r => setTimeout(r, 250));

  await evaluate(`document.querySelector('.doc-card[data-doc-id="medical"] button').click()`);
  await new Promise(r => setTimeout(r, 300));

  // Go to step 2 of medical
  await evaluate(`
    (() => {
      const step2 = Array.from(document.querySelectorAll('.step-item')).find(s => s.getAttribute('data-step') === '2');
      if (step2) step2.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 200));

  const medicalAccused = await evaluate(`document.querySelector('input#accusedName')?.value || ''`);
  console.log('  Medical Form Accused Name after Share Details:', medicalAccused);

  const test4Pass = medicalAccused === 'Ramesh Kumar Suresh Patel';
  console.log('  => Test 4 Result:', test4Pass ? 'PASSED' : 'FAILED');

  // 5. Check Console Errors and Network Failures
  console.log('\n--- 5. Checking Console Errors & Network Failures in Production Build ---');
  console.log('  Console Errors Count:', consoleErrors.length);
  if (consoleErrors.length > 0) console.log('    Errors:', consoleErrors);
  console.log('  Failed Network Requests Count:', failedRequests.length);
  if (failedRequests.length > 0) console.log('    Failed Requests:', failedRequests);

  const test5Pass = consoleErrors.length === 0 && failedRequests.length === 0;
  console.log('  => Test 5 Result:', test5Pass ? 'PASSED' : 'FAILED');

  console.log('\n===============================================================');
  console.log('  PRODUCTION BUILD VERIFICATION SUMMARY:');
  console.log(`  1. 11 Document Cards Rendered:      ${test1Pass ? 'PASS' : 'FAIL'}`);
  console.log(`  2. 4 Organized Sections:            ${test2Pass ? 'PASS' : 'FAIL'}`);
  console.log(`  3. Form III Sample Data:            ${test3Pass ? 'PASS' : 'FAIL'}`);
  console.log(`  4. Share Details in Production:     ${test4Pass ? 'PASS' : 'FAIL'}`);
  console.log(`  5. Zero Console / Network Errors:   ${test5Pass ? 'PASS' : 'FAIL'}`);
  console.log('===============================================================');

  const allPassed = test1Pass && test2Pass && test3Pass && test4Pass && test5Pass;
  console.log(`\nOVERALL PRODUCTION STATUS: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);

  // Cleanup tab
  await fetch(`http://localhost:9222/json/close/${tabData.id}`, { method: 'PUT' });
  ws.close();
  process.exit(allPassed ? 0 : 1);
}

testProductionBuild().catch(err => {
  console.error('Production test error:', err);
  process.exit(1);
});
