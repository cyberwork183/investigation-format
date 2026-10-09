const fs = require('fs');

async function testDocumentSelectorUI() {
  console.log('=== STARTING DOCUMENT SELECTOR UI VERIFICATION VIA CDP ===\n');

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
  await sendCommand('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

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

  // 1. Initial Dashboard Check
  const mainCards = await evaluate('document.querySelectorAll(".doc-card").length');
  console.log(`[1. Root Dashboard] Found ${mainCards} main category cards.`);
  if (mainCards !== 4) throw new Error(`Expected 4 main dashboard cards, got ${mainCards}`);

  // 2. Click Category 1: Arrest & Custody
  console.log('\n[2. Select Category] Clicking "Arrest & Custody" card...');
  await evaluate('document.querySelectorAll(".doc-card")[0].click()');
  await new Promise(r => setTimeout(r, 600));

  // Verify that NO cramped modal backdrop exists
  const modalCount = await evaluate('document.querySelectorAll(".modal-backdrop").length');
  console.log(`[Check] Modal backdrop count: ${modalCount} (should be 0)`);
  if (modalCount !== 0) throw new Error('Cramped modal backdrop was expected to be removed!');

  // Verify Category View Header
  const categoryTitle = await evaluate('document.querySelector(".category-view-title")?.innerText');
  console.log(`[Check] Category View Title: "${categoryTitle}"`);
  if (!categoryTitle.includes('अटक व ताबा')) throw new Error('Category title missing or incorrect');

  // Verify 3-Column Grid and 5 Cards
  const arrestCards = await evaluate(`
    Array.from(document.querySelectorAll(".category-docs-grid .category-doc-card")).map(card => {
      const titleMr = card.querySelector(".category-doc-card-title-mr")?.innerText;
      const titleEn = card.querySelector(".category-doc-card-title-en")?.innerText;
      const badge = card.querySelector(".badge")?.innerText;
      const btn = card.querySelector("button.btn-fill-doc")?.innerText;
      const style = window.getComputedStyle(card);
      return {
        titleMr,
        titleEn,
        badge,
        btn,
        bgColor: style.backgroundColor,
        borderRadius: style.borderRadius,
        padding: style.padding
      };
    })
  `);

  console.log(`[Check] Found ${arrestCards.length} individual cards in 3-column grid for Arrest & Custody:`);
  arrestCards.forEach((c, idx) => {
    console.log(`  Card ${idx + 1}: [${c.badge}] ${c.titleMr} | ${c.titleEn} | Button: "${c.btn}" | Bg: ${c.bgColor} | Radius: ${c.borderRadius}`);
  });

  if (arrestCards.length !== 5) {
    throw new Error(`Expected exactly 5 document cards in Arrest & Custody, found ${arrestCards.length}`);
  }

  // Check card style
  if (arrestCards[0].bgColor !== 'rgb(255, 255, 255)') {
    throw new Error(`Expected white card background, got ${arrestCards[0].bgColor}`);
  }

  // 3. Test Grid Responsiveness
  console.log('\n[3. Responsiveness Test]');
  // Desktop 1280px (3 columns)
  const desktopCols = await evaluate(`
    window.getComputedStyle(document.querySelector(".category-docs-grid")).gridTemplateColumns.split(' ').length
  `);
  console.log(`  Desktop (1280px) grid columns count: ${desktopCols} (Expected: 3)`);
  if (desktopCols !== 3) throw new Error(`Expected 3 columns on desktop, got ${desktopCols}`);

  // Tablet 800px (2 columns)
  await sendCommand('Emulation.setDeviceMetricsOverride', {
    width: 800,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 400));
  const tabletCols = await evaluate(`
    window.getComputedStyle(document.querySelector(".category-docs-grid")).gridTemplateColumns.split(' ').length
  `);
  console.log(`  Tablet (800px) grid columns count: ${tabletCols} (Expected: 2)`);
  if (tabletCols !== 2) throw new Error(`Expected 2 columns on tablet, got ${tabletCols}`);

  // Mobile 400px (1 column)
  await sendCommand('Emulation.setDeviceMetricsOverride', {
    width: 400,
    height: 800,
    deviceScaleFactor: 1,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 400));
  const mobileCols = await evaluate(`
    window.getComputedStyle(document.querySelector(".category-docs-grid")).gridTemplateColumns.split(' ').length
  `);
  console.log(`  Mobile (400px) grid columns count: ${mobileCols} (Expected: 1)`);
  if (mobileCols !== 1) throw new Error(`Expected 1 column on mobile, got ${mobileCols}`);

  // Reset to Desktop
  await sendCommand('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 400));

  // 4. Test Opening Each Document Form & Back Navigation
  console.log('\n[4. Test Opening Forms from Cards]');

  // Test Notice 47 (Card 4)
  console.log('  Testing Card 4: Section 47 Notice...');
  await evaluate('document.querySelectorAll(".category-docs-grid .category-doc-card button")[3].click()');
  await new Promise(r => setTimeout(r, 600));

  let pageTitle = await evaluate('document.querySelector(".doc-page-title")?.innerText');
  console.log(`  Opened Form: "${pageTitle}"`);
  if (!pageTitle.includes('४७')) throw new Error('Failed to open Notice 47 Form');

  // Return back to dashboard
  console.log('  Clicking Back to Dashboard...');
  await evaluate('document.querySelector(".btn-back-dashboard")?.click()');
  await new Promise(r => setTimeout(r, 600));

  // 5. Test Category 4: Medical & Custody Letters
  console.log('\n[5. Select Medical & Custody Category]');
  await evaluate('document.querySelectorAll(".doc-card")[3].click()');
  await new Promise(r => setTimeout(r, 600));

  const medicalCards = await evaluate(`
    Array.from(document.querySelectorAll(".category-docs-grid .category-doc-card")).map(card => {
      const titleMr = card.querySelector(".category-doc-card-title-mr")?.innerText;
      const titleEn = card.querySelector(".category-doc-card-title-en")?.innerText;
      const badge = card.querySelector(".badge")?.innerText;
      return { titleMr, titleEn, badge };
    })
  `);
  console.log(`[Check] Found ${medicalCards.length} individual cards in Medical & Custody:`);
  medicalCards.forEach((c, idx) => {
    console.log(`  Card ${idx + 1}: [${c.badge}] ${c.titleMr} | ${c.titleEn}`);
  });
  if (medicalCards.length !== 4) throw new Error(`Expected 4 cards in Medical & Custody, got ${medicalCards.length}`);

  // Test Back to Categories button
  console.log('  Clicking "Back to Categories" button...');
  await evaluate('document.querySelector(".btn-back-categories")?.click()');
  await new Promise(r => setTimeout(r, 600));

  const restoredMainCards = await evaluate('document.querySelectorAll(".doc-card").length');
  console.log(`  Main dashboard restored: ${restoredMainCards} cards`);
  if (restoredMainCards !== 4) throw new Error('Failed to return to main dashboard');

  // 6. Test Search Functionality
  console.log('\n[6. Search Test: Searching "सान्हा"]');
  await evaluate(`
    const input = document.querySelector(".search-input");
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    nativeSetter.call(input, "सान्हा");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  `);
  await new Promise(r => setTimeout(r, 600));

  const searchResults = await evaluate(`
    Array.from(document.querySelectorAll(".category-docs-grid .category-doc-card")).map(card => {
      return card.querySelector(".category-doc-card-title-mr")?.innerText;
    })
  `);
  console.log('  Search results cards:', searchResults);
  if (searchResults.length === 0 || !searchResults.some(t => t && t.includes('सान्हा'))) {
    throw new Error('Search did not return Atak Sanha card');
  }

  // Clear search
  await evaluate('document.querySelector(".clear-search-btn")?.click()');
  await new Promise(r => setTimeout(r, 500));

  console.log('\n=== ALL UI & FUNCTIONALITY TESTS PASSED 100%! ===');
  await sendCommand('Page.close');
  ws.close();
  process.exit(0);
}

testDocumentSelectorUI().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
