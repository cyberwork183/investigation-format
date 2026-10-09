const fs = require('fs');

async function testShareDetailsFullAudit() {
  console.log('===============================================================');
  console.log('  AUDIT & TEST: SHARE DETAILS FEATURE ACROSS ENTIRE WEBSITE');
  console.log('===============================================================\n');

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

  await new Promise(r => setTimeout(r, 1500));

  // Helper: Go back to Root Dashboard
  async function returnToRootDashboard() {
    await evaluate(`
      (() => {
        const headerBrand = document.querySelector('.header-brand');
        if (headerBrand) headerBrand.click();
        const backDash = document.querySelector('.btn-back-dashboard');
        if (backDash) backDash.click();
        const backCat = document.querySelector('.btn-back-categories');
        if (backCat) backCat.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 400));
  }

  // Helper: Open specific Document by ID
  async function openDoc(targetDocId) {
    const code = `
      (() => {
        const targetId = ${JSON.stringify(targetDocId)};
        // Look in main dashboard cards
        const directCard = Array.from(document.querySelectorAll('.doc-card')).find(c => {
          return c.textContent.includes(targetId) || 
                 (targetId === 'remand' && c.textContent.includes('रिमांड')) ||
                 (targetId === 'arrest_permission' && c.textContent.includes('परवानगी'));
        });
        if (directCard) {
          (directCard.querySelector('button') || directCard).click();
          return;
        }

        // Check if category needs to be opened
        if (['form3', 'notice_35_2', 'atak_sanha', 'notice_47', 'notice_48'].includes(targetId)) {
          const arrestCat = Array.from(document.querySelectorAll('.doc-card')).find(c => c.textContent.includes('अटक व ताबा'));
          if (arrestCat) (arrestCat.querySelector('button') || arrestCat).click();
        } else if (['medical', 'lockup_ps', 'lockup_acp', 'custody_transfer'].includes(targetId)) {
          const medCat = Array.from(document.querySelectorAll('.doc-card')).find(c => c.textContent.includes('वैद्यकीय') || c.textContent.includes('Medical'));
          if (medCat) (medCat.querySelector('button') || medCat).click();
        }
      })()
    `;
    await evaluate(code);
    await new Promise(r => setTimeout(r, 350));

    // If inside category, click the document card
    const subCode = `
      (() => {
        const targetId = ${JSON.stringify(targetDocId)};
        const catDocs = Array.from(document.querySelectorAll('.category-doc-card'));
        if (catDocs.length === 0) return;
        const target = catDocs.find(c => {
          const text = c.textContent;
          if (targetId === 'form3') return text.includes('Form III') || text.includes('अटक फॉर्म');
          if (targetId === 'notice_35_2') return text.includes('३५(२)') || text.includes('35(2)');
          if (targetId === 'atak_sanha') return text.includes('सान्हा') || text.includes('Sanha');
          if (targetId === 'notice_47') return text.includes('४७') || text.includes('47');
          if (targetId === 'notice_48') return text.includes('४८') || text.includes('48');
          if (targetId === 'medical') return text.includes('वैद्यकीय तपासणी') || text.includes('Medical Examination');
          if (targetId === 'lockup_ps') return text.includes('बंदीगृह (ठाणे)') || text.includes('Police Station');
          if (targetId === 'lockup_acp') return text.includes('माहिती पत्र (ACP)') || text.includes('ACP');
          if (targetId === 'custody_transfer') return text.includes('ताब्यात मिळणे') || text.includes('Transfer');
          return false;
        });
        if (target) {
          (target.querySelector('button') || target).click();
        }
      })()
    `;
    await evaluate(subCode);
    await new Promise(r => setTimeout(r, 450));
  }

  // Helper: Navigate to step/tab in current form
  async function goToStep(stepNum) {
    await evaluate(`
      (() => {
        const stepItems = Array.from(document.querySelectorAll('.step-item'));
        const targetStep = stepItems.find(s => s.getAttribute('data-step') === String(${stepNum}));
        if (targetStep) {
          targetStep.click();
          return;
        }
        const tabs = Array.from(document.querySelectorAll('.doc-tab-btn'));
        if (tabs.length >= ${stepNum}) {
          tabs[${stepNum} - 1].click();
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 350));
  }

  // Helper: set input value triggering React state update
  async function setInputValue(selector, value) {
    await evaluate(`
      (() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) return;
        const prototype = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
        setter.call(el, ${JSON.stringify(value)});
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      })()
    `);
    await new Promise(r => setTimeout(r, 150));
  }

  const results = [];

  // =========================================================================
  // TEST 1: Form III sample data NOT shared automatically without clicking Share Details
  // =========================================================================
  console.log('--- TEST 1: Initial State Isolation (Form III sample data must not pollute other forms until explicitly shared) ---');
  await returnToRootDashboard();
  await openDoc('medical');
  await goToStep(2); // Step 2 has case & accused inputs
  
  const initialMedicalCheck = await evaluate(`
    (() => {
      const nameInput = document.querySelector('input#accusedName');
      const crimeInput = document.querySelector('input#crimeNo');
      return {
        accusedName: nameInput ? nameInput.value : '',
        crimeNo: crimeInput ? crimeInput.value : ''
      };
    })()
  `);

  const test1Pass = initialMedicalCheck.accusedName === '' && initialMedicalCheck.crimeNo === '';
  results.push({ name: '1. Form III sample data isolation on clean session', passed: test1Pass });
  console.log(`  Initial Medical Form Accused: "${initialMedicalCheck.accusedName}", Crime No: "${initialMedicalCheck.crimeNo}"`);
  console.log(`  => Test 1 Result: ${test1Pass ? 'PASSED' : 'FAILED'}`);

  // =========================================================================
  // TEST 2: Share Details from Form III to Remand and Medical
  // =========================================================================
  console.log('\n--- TEST 2: Share Details from Form III -> Remand & Medical Forms ---');
  await returnToRootDashboard();
  await openDoc('form3');

  // Go to step 8 and click Share Details
  await goToStep(8);
  const shareClickResult = await evaluate(`
    (() => {
      const shareBtn = document.querySelector('.btn-share-details');
      if (shareBtn) {
        shareBtn.click();
        return true;
      }
      return false;
    })()
  `);
  console.log('  Clicked Share Details on Form III Step 8:', shareClickResult);
  await new Promise(r => setTimeout(r, 400));

  // Open Medical Letter, go to step 2, and verify populated fields
  await returnToRootDashboard();
  await openDoc('medical');
  await goToStep(2);

  const medicalPopulated = await evaluate(`
    (() => {
      const acc = document.querySelector('input#accusedName')?.value || '';
      const fir = document.querySelector('input#crimeNo')?.value || '';
      const ps = document.querySelector('input#policeStation')?.value || '';
      const acts = document.querySelector('textarea#actsSections, input#actsSections')?.value || '';
      return { acc, fir, ps, acts };
    })()
  `);
  console.log('  Medical Form populated after Form III share:', medicalPopulated);

  const test2aPass = medicalPopulated.acc === 'Ramesh Kumar Suresh Patel' && medicalPopulated.fir === '89/2026';
  results.push({ name: '2a. Form III -> Medical Letter field population', passed: test2aPass });

  // Open Remand Form, go to step 2, and verify populated fields
  await returnToRootDashboard();
  await openDoc('remand');
  await goToStep(2);

  const remandPopulated = await evaluate(`
    (() => {
      const acc = document.querySelector('input#remand-acc-name, input#accusedName')?.value || '';
      const fir = document.querySelector('input#remand-crime-no, input#crimeNo')?.value || '';
      const ps = document.querySelector('input#remand-ps-name, input#psName')?.value || '';
      return { acc, fir, ps };
    })()
  `);
  console.log('  Remand Form populated after Form III share:', remandPopulated);
  const test2bPass = remandPopulated.acc === 'Ramesh Kumar Suresh Patel' && remandPopulated.fir === '89/2026';
  results.push({ name: '2b. Form III -> Remand Form field population', passed: test2bPass });

  // =========================================================================
  // TEST 3: Partial form sharing from Notice 35(2) (Reverse Direction)
  // =========================================================================
  console.log('\n--- TEST 3: Partial Form Sharing from Notice 35(2) -> Notice 47 & Atak Sanha ---');
  await returnToRootDashboard();
  await openDoc('notice_35_2');

  // Change crime number on Step 1
  await goToStep(1);
  await setInputValue('input#crimeNo', '999/2026');

  // Change bank details on Step 3
  await goToStep(3);
  await setInputValue('input#bankName', 'State Bank of India');
  await setInputValue('input#accountNo', '445566778899');

  // Change accused name on Step 4
  await goToStep(4);
  await setInputValue('input#accusedName', 'रोहन अशोक शर्मा');

  // Click Share Details on Step 4 in Notice 35(2)
  await evaluate(`
    (() => {
      const shareBtn = document.querySelector('.btn-share-details');
      if (shareBtn) shareBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 400));

  // Open Notice 47 and verify updated shared values
  await returnToRootDashboard();
  await openDoc('notice_47');

  // On Step 1 & 3 of Notice 47
  await goToStep(1);
  const n47Acc = await evaluate(`document.querySelector('input#accusedName')?.value || ''`);
  const n47Fir = await evaluate(`document.querySelector('input#crimeNo')?.value || ''`);

  await goToStep(3);
  const n47Bank = await evaluate(`document.querySelector('input#bankName')?.value || ''`);
  const n47AccNo = await evaluate(`document.querySelector('input#accountNo')?.value || ''`);

  const notice47Values = { acc: n47Acc, fir: n47Fir, bank: n47Bank, accNo: n47AccNo };
  console.log('  Notice 47 Form populated from Notice 35(2):', notice47Values);
  const test3Pass = notice47Values.bank === 'State Bank of India' &&
                    notice47Values.accNo === '445566778899';
  results.push({ name: '3. Notice 35(2) -> Notice 47 bank details partial sharing', passed: test3Pass });

  // =========================================================================
  // TEST 4: Non-Overwrite Protection (Never overwrite existing non-empty values)
  // =========================================================================
  console.log('\n--- TEST 4: Non-Overwrite Conflict Protection ---');
  // In Notice 47 Step 1, user explicitly types custom address: "विशेष पत्ता, नागपूर ४४००१०"
  await goToStep(1);
  await setInputValue('textarea#accusedAddress, input#accusedAddress', 'विशेष पत्ता, नागपूर ४४००१०');
  await new Promise(r => setTimeout(r, 200));

  // Now open Remand form, go to step 2, type a different address, and click Share Details
  await returnToRootDashboard();
  await openDoc('remand');
  await goToStep(2);
  await setInputValue('input#remand-acc-addr, textarea#accusedAddress, input#accusedAddress', 'वेगळा पत्ता, मुंबई ४००००१');
  await new Promise(r => setTimeout(r, 200));

  // Click Share Details on Remand step 5
  await goToStep(5);
  await evaluate(`
    (() => {
      const shareBtn = document.querySelector('.btn-share-details');
      if (shareBtn) shareBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 400));

  // Go back to Notice 47 Step 1 and verify its custom address was PRESERVED and not overwritten!
  await returnToRootDashboard();
  await openDoc('notice_47');
  await goToStep(1);

  const preservedAddr = await evaluate(`
    (() => {
      const addrInput = document.querySelector('textarea#accusedAddress, input#accusedAddress');
      return addrInput ? addrInput.value : '';
    })()
  `);
  console.log('  Notice 47 Address after Remand Share:', preservedAddr);
  const test4Pass = preservedAddr === 'विशेष पत्ता, नागपूर ४४००१०';
  results.push({ name: '4. Non-overwrite protection for existing values', passed: test4Pass });
  console.log(`  => Test 4 Result: ${test4Pass ? 'PASSED (Protected from silent overwrite)' : 'FAILED'}`);

  // =========================================================================
  // TEST 5: Verify Share Details Button exists across ALL 11 Forms
  // =========================================================================
  console.log('\n--- TEST 5: Verification of Share Details Button in all 11 Forms ---');
  const allDocIds = [
    'form3', 'remand', 'medical', 'lockup_ps', 'lockup_acp',
    'custody_transfer', 'arrest_permission', 'notice_35_2',
    'atak_sanha', 'notice_47', 'notice_48'
  ];

  let allHaveButtons = true;
  for (const docId of allDocIds) {
    await returnToRootDashboard();
    await openDoc(docId);

    // Jump to review / last step
    await evaluate(`
      (() => {
        const stepItems = document.querySelectorAll('.step-item');
        if (stepItems.length > 0) {
          const last = stepItems[stepItems.length - 1];
          if (last) last.click();
        }
        const tabs = document.querySelectorAll('.doc-tab-btn');
        if (tabs.length > 0) {
          const lastTab = tabs[tabs.length - 1];
          if (lastTab) lastTab.click();
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 300));

    const hasShareBtn = await evaluate(`
      (() => {
        const btn = document.querySelector('.btn-share-details');
        return !!btn;
      })()
    `);
    console.log(`  Document [${docId.padEnd(18)}]: Share Details Button Found -> ${hasShareBtn ? 'YES' : 'NO'}`);
    if (!hasShareBtn) allHaveButtons = false;
  }

  results.push({ name: '5. Share Details button present in all 11 document forms', passed: allHaveButtons });

  // Cleanup tab
  await fetch(`http://localhost:9222/json/close/${tabData.id}`);
  ws.close();

  console.log('\n===============================================================');
  console.log('  SHARE DETAILS AUDIT & TEST SUMMARY');
  console.log('===============================================================');
  let overallPass = true;
  for (const r of results) {
    console.log(`  ${r.passed ? '✓ PASS' : '✗ FAIL'} : ${r.name}`);
    if (!r.passed) overallPass = false;
  }
  console.log(`\nOVERALL STATUS: ${overallPass ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);

  return { overallPass, results };
}

testShareDetailsFullAudit().catch(err => {
  console.error('Audit test failed:', err);
  process.exit(1);
});
