/**
 * test_continuous_dashboard_ui.cjs
 * Comprehensive verification of the unified all-documents-on-one-page dashboard.
 */

async function run() {
  console.log('===============================================================');
  console.log('  TEST: UNIFIED CONTINUOUS DASHBOARD UI');
  console.log('===============================================================');

  const newTabRes = await fetch('http://localhost:9222/json/new?http://localhost:3000', { method: 'PUT' });
  const tabData = await newTabRes.json();
  console.log('Created test tab:', tabData.id);

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
  await sendCommand('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

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

  // TEST 1: Verify all 11 document cards are directly on the main dashboard
  console.log('\n--- TEST 1: Verify all 11 document cards are directly on the main dashboard ---');
  const docCardsInfo = await evaluate(`
    (() => {
      const cards = Array.from(document.querySelectorAll('.doc-card'));
      return cards.map(c => ({
        docId: c.getAttribute('data-doc-id'),
        titleMr: c.querySelector('.category-doc-card-title-mr')?.textContent || '',
        titleEn: c.querySelector('.category-doc-card-title-en')?.textContent || '',
        badge: c.querySelector('.badge')?.textContent || '',
        hasButton: !!c.querySelector('button')
      }));
    })()
  `);

  console.log('  Total Document Cards Found on Main Page:', docCardsInfo.length);
  docCardsInfo.forEach((c, idx) => {
    console.log(`    ${idx + 1}. [${c.docId}] ${c.titleMr} (${c.titleEn})`);
  });

  const all11Present = docCardsInfo.length === 11;
  console.log('  => All 11 documents present on main page:', all11Present ? 'PASSED' : 'FAILED');

  // TEST 2: Verify all 4 sections exist
  console.log('\n--- TEST 2: Verify all 4 organized sections ---');
  const sections = await evaluate(`
    (() => {
      const sects = Array.from(document.querySelectorAll('.dashboard-section'));
      return sects.map(s => ({
        id: s.id,
        title: s.querySelector('.dashboard-section-title')?.textContent?.trim() || '',
        badge: s.querySelector('.dashboard-section-badge')?.textContent?.trim() || '',
        cardCount: s.querySelectorAll('.doc-card').length
      }));
    })()
  `);

  console.log('  Sections rendered:');
  sections.forEach(s => {
    console.log(`    • Section ID: ${s.id} | Title: ${s.title} | Badge: ${s.badge} | Cards: ${s.cardCount}`);
  });
  const fourSectionsPass = sections.length === 4;
  console.log('  => 4 Organized Sections:', fourSectionsPass ? 'PASSED' : 'FAILED');

  // TEST 3: Test direct opening of any document from continuous dashboard
  console.log('\n--- TEST 3: Direct 1-click opening of each document from dashboard ---');
  const docIdsToTest = ['form3', 'notice_35_2', 'atak_sanha', 'notice_47', 'notice_48', 'remand', 'arrest_permission', 'medical', 'lockup_ps', 'lockup_acp', 'custody_transfer'];
  let allOpensPass = true;

  for (const docId of docIdsToTest) {
    const opened = await evaluate(`
      (() => {
        const card = document.querySelector('.doc-card[data-doc-id="${docId}"]');
        if (card) {
          const btn = card.querySelector('button') || card;
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    await new Promise(r => setTimeout(r, 200));

    const activeView = await evaluate(`
      (() => {
        const topBar = document.querySelector('.document-topbar-title-text');
        const activeForm = document.querySelector('.active-doc-view');
        return {
          hasTopBar: !!topBar,
          titleText: topBar ? topBar.textContent : '',
          hasForm: !!activeForm
        };
      })()
    `);

    const pass = opened && activeView.hasForm;
    if (!pass) allOpensPass = false;
    console.log(`    • Opening [${docId.padEnd(18)}]: ${pass ? 'PASSED' : 'FAILED'} -> ${activeView.titleText}`);

    // Return to dashboard
    await evaluate(`
      (() => {
        const backBtn = document.querySelector('.btn-back-dashboard');
        if (backBtn) backBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('  => 1-Click Direct Form Opening for all 11 docs:', allOpensPass ? 'PASSED' : 'FAILED');

  // TEST 4: Category Filter Chips
  console.log('\n--- TEST 4: Category Filter Chips ---');
  await evaluate(`
    (() => {
      const chip = Array.from(document.querySelectorAll('.category-chip')).find(c => c.textContent.includes('अटक व ताबा'));
      if (chip) chip.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 150));

  const arrestOnlyCards = await evaluate(`document.querySelectorAll('.doc-card').length`);
  console.log('  Arrest & Custody filter active -> cards visible:', arrestOnlyCards, '(Expected: 5)');

  await evaluate(`
    (() => {
      const chip = Array.from(document.querySelectorAll('.category-chip')).find(c => c.textContent.includes('सर्व दस्तऐवज'));
      if (chip) chip.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 150));

  const resetAllCards = await evaluate(`document.querySelectorAll('.doc-card').length`);
  console.log('  All filter active -> cards visible:', resetAllCards, '(Expected: 11)');
  const filterPass = arrestOnlyCards === 5 && resetAllCards === 11;
  console.log('  => Category Filter Test:', filterPass ? 'PASSED' : 'FAILED');

  // TEST 5: Search Filtering
  console.log('\n--- TEST 5: Search Input Filtering ---');
  await evaluate(`
    (() => {
      const input = document.querySelector('.search-input');
      if (input) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(input, 'रिमांड');
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 200));

  const searchResultsCount = await evaluate(`document.querySelectorAll('.doc-card').length`);
  console.log('  Search for "रिमांड" -> cards visible:', searchResultsCount, '(Expected: 1)');

  // Clear search
  await evaluate(`
    (() => {
      const clearBtn = document.querySelector('.clear-search-btn');
      if (clearBtn) clearBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 200));
  const postClearCards = await evaluate(`document.querySelectorAll('.doc-card').length`);
  console.log('  After clearing search -> cards visible:', postClearCards, '(Expected: 11)');

  const searchPass = searchResultsCount === 1 && postClearCards === 11;
  console.log('  => Search Filtering Test:', searchPass ? 'PASSED' : 'FAILED');

  console.log('\n===============================================================');
  console.log('  SUMMARY:');
  console.log(`  1. All 11 Documents on Single Page: ${all11Present ? 'PASS' : 'FAIL'}`);
  console.log(`  2. 4 Organized Sections:            ${fourSectionsPass ? 'PASS' : 'FAIL'}`);
  console.log(`  3. Direct 1-Click Form Opening:     ${allOpensPass ? 'PASS' : 'FAIL'}`);
  console.log(`  4. Category Filter Chips:           ${filterPass ? 'PASS' : 'FAIL'}`);
  console.log(`  5. Real-Time Search:                ${searchPass ? 'PASS' : 'FAIL'}`);
  console.log('===============================================================');

  const allPassed = all11Present && fourSectionsPass && allOpensPass && filterPass && searchPass;
  console.log(`\nOVERALL STATUS: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);

  // Close tab
  await fetch(`http://localhost:9222/json/close/${tabData.id}`, { method: 'PUT' });
  ws.close();
  process.exit(allPassed ? 0 : 1);
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
