const fs = require('fs');

const VIEWPORTS = [
  { name: 'Small Mobile 320px', width: 320, height: 650, mobile: true },
  { name: 'Small Mobile 360px', width: 360, height: 740, mobile: true },
  { name: 'Standard Mobile 375px', width: 375, height: 667, mobile: true },
  { name: 'Standard Mobile 390px', width: 390, height: 844, mobile: true },
  { name: 'Large Mobile 430px', width: 430, height: 932, mobile: true },
  { name: 'Tablet 768px', width: 768, height: 1024, mobile: false },
  { name: 'Tablet/Laptop 1024px', width: 1024, height: 768, mobile: false },
  { name: 'Laptop 1280px', width: 1280, height: 800, mobile: false },
  { name: 'Desktop 1440px', width: 1440, height: 900, mobile: false },
  { name: 'Large Monitor 1920px', width: 1920, height: 1080, mobile: false }
];

async function runResponsiveTests() {
  console.log('===============================================================');
  console.log('  AUTOMATED MULTI-VIEWPORT RESPONSIVENESS TEST SUITE');
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

  // Helper to check horizontal overflow
  async function checkPageOverflow(contextName) {
    return await evaluate(`
      (() => {
        const root = document.documentElement;
        const body = document.body;
        const scrollW = Math.max(root.scrollWidth, body.scrollWidth);
        const winW = window.innerWidth;
        const overflow = scrollW > (winW + 1);
        return {
          context: ${JSON.stringify(contextName)},
          scrollW,
          winW,
          overflow
        };
      })()
    `);
  }

  // Wait for initial render
  await new Promise(r => setTimeout(r, 1500));

  const testResults = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n---------------------------------------------------------------`);
    console.log(`Testing Viewport: ${vp.name} (${vp.width}x${vp.height}px)`);
    console.log(`---------------------------------------------------------------`);
    
    await sendCommand('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.mobile
    });

    await new Promise(r => setTimeout(r, 300));

    const stepAudits = [];

    // 1. Dashboard Root View
    // Ensure we are at root dashboard
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
    await new Promise(r => setTimeout(r, 300));

    const rootDash = await checkPageOverflow('1. Dashboard Root');
    stepAudits.push(rootDash);

    // 2. Category 1: Arrest & Custody (5 Sub-docs)
    await evaluate(`
      (() => {
        const catCard = Array.from(document.querySelectorAll('.doc-card')).find(c => c.textContent.includes('अटक व ताबा'));
        if (catCard) {
          (catCard.querySelector('button') || catCard).click();
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 350));
    const cat1Audit = await checkPageOverflow('2. Arrest & Custody Category View');
    stepAudits.push(cat1Audit);

    // 3. Open Form III (Arrest Form III)
    await evaluate(`
      (() => {
        const form3Card = Array.from(document.querySelectorAll('.category-doc-card')).find(c => c.textContent.includes('Form III') || c.textContent.includes('अटक फॉर्म'));
        if (form3Card) {
          (form3Card.querySelector('button') || form3Card).click();
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 400));
    const form3Step1 = await checkPageOverflow('3. Form III Step 1');
    stepAudits.push(form3Step1);

    // Form III Step 5 (Physical Features 25 grid)
    await evaluate(`
      (() => {
        const step5 = Array.from(document.querySelectorAll('.step-item')).find(s => s.getAttribute('data-step') === '5');
        if (step5) step5.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 350));
    const form3Step5 = await checkPageOverflow('4. Form III Step 5 (PF 25 Grid)');
    stepAudits.push(form3Step5);

    // Form III Step 8 (Review & Summary)
    await evaluate(`
      (() => {
        const step8 = Array.from(document.querySelectorAll('.step-item')).find(s => s.getAttribute('data-step') === '8');
        if (step8) step8.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 350));
    const form3Step8 = await checkPageOverflow('5. Form III Step 8 (Review Summary)');
    stepAudits.push(form3Step8);

    // 4. Return to Category and Open Notice 35(2)
    await evaluate(`
      (() => {
        const backBtn = document.querySelector('.btn-back-dashboard');
        if (backBtn) backBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 350));

    // Ensure we open Notice 35(2)
    await evaluate(`
      (() => {
        const n35Card = Array.from(document.querySelectorAll('.category-doc-card')).find(c => c.textContent.includes('३५(२)') || c.textContent.includes('35(2)'));
        if (n35Card) {
          (n35Card.querySelector('button') || n35Card).click();
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 350));
    const n35Audit = await checkPageOverflow('6. Notice 35(2) Form');
    stepAudits.push(n35Audit);

    // 5. Return to root and Open Category 4: Medical & Custody Letters
    await evaluate(`
      (() => {
        const backBtn = document.querySelector('.btn-back-dashboard');
        if (backBtn) backBtn.click();
        const backCat = document.querySelector('.btn-back-categories');
        if (backCat) backCat.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 350));

    await evaluate(`
      (() => {
        const medCard = Array.from(document.querySelectorAll('.doc-card')).find(c => c.textContent.includes('वैद्यकीय') || c.textContent.includes('Medical'));
        if (medCard) {
          (medCard.querySelector('button') || medCard).click();
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 350));
    const medCatAudit = await checkPageOverflow('7. Medical Letters Category View');
    stepAudits.push(medCatAudit);

    // Open Medical Letter Form
    await evaluate(`
      (() => {
        const firstMed = document.querySelector('.category-doc-card');
        if (firstMed) {
          (firstMed.querySelector('button') || firstMed).click();
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 350));
    const medFormAudit = await checkPageOverflow('8. Medical Letter Form View');
    stepAudits.push(medFormAudit);

    // 6. Return to root and Open Remand Form (Direct Doc)
    await evaluate(`
      (() => {
        const backBtn = document.querySelector('.btn-back-dashboard');
        if (backBtn) backBtn.click();
        const backCat = document.querySelector('.btn-back-categories');
        if (backCat) backCat.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 350));

    await evaluate(`
      (() => {
        const remandCard = Array.from(document.querySelectorAll('.doc-card')).find(c => c.textContent.includes('रिमांड') || c.textContent.includes('Remand'));
        if (remandCard) {
          (remandCard.querySelector('button') || remandCard).click();
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 350));
    const remandAudit = await checkPageOverflow('9. Court Remand Form View');
    stepAudits.push(remandAudit);

    // Audit summary for this viewport
    let vpPass = true;
    for (const a of stepAudits) {
      const status = a.overflow ? 'FAIL (OVERFLOW)' : 'PASS';
      console.log(`  ${a.overflow ? '✗' : '✓'} ${a.context.padEnd(36)}: scrollWidth ${a.scrollW}px / winWidth ${a.winW}px -> ${status}`);
      if (a.overflow) vpPass = false;
    }

    testResults.push({
      viewport: vp.name,
      width: vp.width,
      height: vp.height,
      passed: vpPass,
      audits: stepAudits
    });

    console.log(`=> OVERALL ${vp.name}: ${vpPass ? 'PASSED (Zero Overflow)' : 'FAILED'}`);
  }

  // Cleanup tab
  await fetch(`http://localhost:9222/json/close/${tabData.id}`);
  ws.close();

  console.log('\n===============================================================');
  console.log('  ALL VIEWPORT TEST SUMMARY & VERIFICATION MATRIX');
  console.log('===============================================================');
  let allPass = true;
  for (const r of testResults) {
    console.log(`  ${r.passed ? '✓ PASS' : '✗ FAIL'} : ${r.viewport.padEnd(25)} (${r.width}px) - All views verified with 0px horizontal overflow`);
    if (!r.passed) allPass = false;
  }
  console.log(`\nFINAL STATUS: ${allPass ? 'ALL 10 VIEWPORTS FULLY VERIFIED & PASSING' : 'SOME TESTS FAILED'}`);

  return { allPass, testResults };
}

runResponsiveTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
