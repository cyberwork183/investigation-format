const fs = require('fs');

async function testLiveFrontend() {
  console.log('=== STARTING LIVE FRONTEND VERIFICATION VIA CHROME CDP ===\n');

  const newTabRes = await fetch('http://localhost:9222/json/new?http://localhost:3000', { method: 'PUT' });
  const tabData = await newTabRes.json();
  console.log('Opened test tab:', tabData.id);

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
    } else if (data.method === 'Runtime.consoleAPICalled') {
      const text = data.params.args.map(a => a.value || a.description).join(' ');
      console.log(`[BROWSER LOG] ${text}`);
    } else if (data.method === 'Runtime.exceptionThrown') {
      console.error('[BROWSER ERROR]', data.params.exceptionDetails?.text, data.params.exceptionDetails?.exception?.description);
    }
  };

  await sendCommand('Runtime.enable');
  await sendCommand('Page.enable');

  // Wait for React to mount
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

  // 1. Verify Dashboard
  const cardCount = await evaluate('document.querySelectorAll(".doc-card").length');
  console.log(`[Dashboard] Found ${cardCount} main document cards.`);
  if (cardCount !== 4) throw new Error(`Expected 4 main dashboard cards, found ${cardCount}`);

  // 2. Click Category 1 (Arrest & Custody)
  console.log('[Action] Clicking Category 1: Arrest & Custody card...');
  await evaluate('document.querySelectorAll(".doc-card")[0].click()');
  await new Promise(r => setTimeout(r, 600));

  // Check category view
  const categoryHeader = await evaluate('document.querySelector(".category-view-title")?.innerText');
  console.log('[Category View] Header:', categoryHeader);

  const docCardBadges = await evaluate(`
    Array.from(document.querySelectorAll(".category-docs-grid .category-doc-card .badge")).map(b => b.innerText)
  `);
  console.log('[Category View] Badges in Arrest & Custody selector:', docCardBadges);
  if (docCardBadges.length < 5) throw new Error(`Expected at least 5 documents in selector, found ${docCardBadges.length}`);

  // 3. Open Notice 35(2)
  console.log('[Action] Opening Notice 35(2) Checklist...');
  await evaluate(`
    const buttons = document.querySelectorAll(".category-docs-grid .category-doc-card button.btn-primary");
    buttons[1].click(); // Second item is 35(2)
  `);
  await new Promise(r => setTimeout(r, 600));

  let pageTitle = await evaluate('document.querySelector(".doc-page-title")?.innerText');
  console.log('[View] Active Page Title:', pageTitle);
  if (!pageTitle.includes('३५(२)')) throw new Error('Failed to open Notice 35(2) Form!');

  // Check that fields start empty
  let crimeNoVal = await evaluate('document.querySelector("#crimeNo")?.value');
  console.log('[Notice 35(2)] Initial Crime No:', JSON.stringify(crimeNoVal));
  if (crimeNoVal !== '') throw new Error('Notice 35(2) should open empty!');

  // Click Fill Sample Data
  console.log('[Action] Clicking "Sample Data" on Notice 35(2)...');
  await evaluate('document.querySelector(".doc-top-bar-actions .btn-secondary")?.click()');
  await new Promise(r => setTimeout(r, 500));

  crimeNoVal = await evaluate('document.querySelector("#crimeNo")?.value');
  let courtVal = await evaluate('document.querySelector("#courtName")?.value');
  console.log('[Notice 35(2)] Sample Crime No:', crimeNoVal);
  console.log('[Notice 35(2)] Sample Court:', courtVal);

  // Navigate to Step 4 and click Share Details
  console.log('[Action] Navigating to Step 4 and clicking Share Details...');
  await evaluate('document.querySelectorAll(".step-item")[3]?.click()');
  await new Promise(r => setTimeout(r, 500));

  await evaluate('document.querySelector(".btn-share-details")?.click()');
  await new Promise(r => setTimeout(r, 500));

  const toastMsg = await evaluate('document.querySelector(".toast")?.innerText');
  console.log('[Toast]', toastMsg);

  // 4. Return to Dashboard and open Notice 47
  console.log('[Action] Returning to Dashboard...');
  await evaluate('document.querySelector(".btn-back-dashboard")?.click()');
  await new Promise(r => setTimeout(r, 600));

  console.log('[Action] Opening Category 1 -> Notice 47 to Accused...');
  await evaluate('document.querySelectorAll(".doc-card")[0].click()');
  await new Promise(r => setTimeout(r, 500));

  await evaluate(`{
    const btns = document.querySelectorAll(".category-docs-grid .category-doc-card button.btn-primary");
    btns[3].click(); // 4th item is Notice 47
  }`);
  await new Promise(r => setTimeout(r, 600));

  pageTitle = await evaluate('document.querySelector(".doc-page-title")?.innerText');
  console.log('[View] Active Page Title:', pageTitle);
  if (!pageTitle.includes('४७')) throw new Error('Failed to open Notice 47 Form!');

  // Verify that shared details were populated from Notice 35(2)
  const sharedAccusedName = await evaluate('document.querySelector("#accusedName")?.value');
  const sharedCrimeNo = await evaluate('document.querySelector("#crimeNo")?.value');
  console.log('[Notice 47] Auto-populated Accused Name:', sharedAccusedName);
  console.log('[Notice 47] Auto-populated Crime No:', sharedCrimeNo);
  if (sharedAccusedName !== 'संदीप भानुदास मोरे' || sharedCrimeNo !== '38/2026') {
    throw new Error('Share Details did not populate Notice 47 correctly!');
  }

  // 5. Return to Dashboard and open Notice 48
  console.log('[Action] Returning to Dashboard...');
  await evaluate('document.querySelector(".btn-back-dashboard")?.click()');
  await new Promise(r => setTimeout(r, 600));

  console.log('[Action] Opening Category 1 -> Notice 48 to Relative...');
  await evaluate('document.querySelectorAll(".doc-card")[0].click()');
  await new Promise(r => setTimeout(r, 500));

  await evaluate(`{
    const btns = document.querySelectorAll(".category-docs-grid .category-doc-card button.btn-primary");
    btns[4].click(); // 5th item is Notice 48
  }`);
  await new Promise(r => setTimeout(r, 600));

  pageTitle = await evaluate('document.querySelector(".doc-page-title")?.innerText');
  console.log('[View] Active Page Title:', pageTitle);
  if (!pageTitle.includes('४८')) throw new Error('Failed to open Notice 48 Form!');

  const n48Accused = await evaluate('document.querySelector("#accusedName")?.value');
  console.log('[Notice 48] Auto-populated Accused Name:', n48Accused);

  // 6. Return to Dashboard and open Arrest Sanha
  console.log('[Action] Returning to Dashboard...');
  await evaluate('document.querySelector(".btn-back-dashboard")?.click()');
  await new Promise(r => setTimeout(r, 600));

  console.log('[Action] Opening Category 1 -> Arrest Sanha...');
  await evaluate('document.querySelectorAll(".doc-card")[0].click()');
  await new Promise(r => setTimeout(r, 500));

  await evaluate(`{
    const btns = document.querySelectorAll(".category-docs-grid .category-doc-card button.btn-primary");
    btns[2].click(); // 3rd item is Arrest Sanha
  }`);
  await new Promise(r => setTimeout(r, 600));

  pageTitle = await evaluate('document.querySelector(".doc-page-title")?.innerText');
  console.log('[View] Active Page Title:', pageTitle);
  if (!pageTitle.includes('सान्हा')) throw new Error('Failed to open Arrest Sanha Form!');

  // 7. Return to Dashboard and test Category 4 (Medical & Custody Letters)
  console.log('[Action] Returning to Dashboard and opening Category 4...');
  await evaluate('document.querySelector(".btn-back-dashboard")?.click()');
  await new Promise(r => setTimeout(r, 600));

  await evaluate('document.querySelectorAll(".doc-card")[3].click()');
  await new Promise(r => setTimeout(r, 500));

  const medHeader = await evaluate('document.querySelector(".category-view-title")?.innerText');
  console.log('[Category 4 Header]:', medHeader);

  const medItems = await evaluate(`
    Array.from(document.querySelectorAll(".category-docs-grid .category-doc-card h3")).map(b => b.innerText)
  `);
  console.log('[Category 4 Cards] Letter titles:', medItems);
  if (medItems.length !== 4) throw new Error(`Expected 4 letters in Category 4, found ${medItems.length}`);

  // Capture screenshot of live verification
  const screenshotRes = await sendCommand('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('live_verification_screenshot.png', Buffer.from(screenshotRes.data, 'base64'));
  console.log('Saved screenshot to live_verification_screenshot.png');

  // Close tab
  await fetch(`http://localhost:9222/json/close/${tabData.id}`);
  ws.close();

  console.log('\n=============================================================');
  console.log('ALL LIVE BROWSER FRONTEND INTEGRATION TESTS PASSED (100%)!');
  console.log('=============================================================\n');
}

testLiveFrontend().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
