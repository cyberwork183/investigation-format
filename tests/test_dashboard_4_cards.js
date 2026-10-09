/**
 * test_dashboard_4_cards.js
 * Verification of the 4 Main Dashboard Cards and Sub-letter routing.
 */

import { MAIN_DASHBOARD_CARDS, MEDICAL_CUSTODY_LETTERS, DOCUMENT_TYPES, getDocumentTypeById } from '../src/utils/documentTypes.js';

console.log('===========================================================');
console.log('VERIFYING 4 MAIN DASHBOARD CARDS & LETTER ACCESSIBILITY');
console.log('===========================================================\n');

// 1. Check total number of main cards
console.log(`[Test 1] Checking number of main dashboard cards: ${MAIN_DASHBOARD_CARDS.length}`);
if (MAIN_DASHBOARD_CARDS.length === 4) {
  console.log('  ✓ Exactly 4 main dashboard cards are defined');
} else {
  throw new Error(`Expected 4 main cards, but found ${MAIN_DASHBOARD_CARDS.length}`);
}

// 2. Verify each of the 4 cards matches user requirements
const card1 = MAIN_DASHBOARD_CARDS[0];
const card2 = MAIN_DASHBOARD_CARDS[1];
const card3 = MAIN_DASHBOARD_CARDS[2];
const card4 = MAIN_DASHBOARD_CARDS[3];

console.log('\n[Test 2] Verifying the 4 categories:');
console.log(`  1. ${card1.category}: ${card1.title}`);
console.log(`  2. ${card2.category}: ${card2.title}`);
console.log(`  3. ${card3.category}: ${card3.title}`);
console.log(`  4. ${card4.category}: ${card4.title}`);

if (
  card1.category === 'Arrest & Custody' && card1.id === 'form3' &&
  card2.category === 'Court Remand' && card2.id === 'remand' &&
  card3.category === 'Court Permission' && card3.id === 'arrest_permission' &&
  card4.category === 'Medical & Custody' && card4.id === 'medical_custody'
) {
  console.log('  ✓ All 4 categories match requirements perfectly');
} else {
  throw new Error('Category mismatch in main dashboard cards');
}

// 3. Verify that Medical & Custody contains all 4 sub-letters
console.log('\n[Test 3] Verifying sub-letters under "Medical & Custody":');
MEDICAL_CUSTODY_LETTERS.forEach((letter, idx) => {
  console.log(`  ${idx + 1}. [${letter.id}] ${letter.title}`);
});

const subLetterIds = MEDICAL_CUSTODY_LETTERS.map(l => l.id);
const expectedSubIds = ['medical', 'lockup_ps', 'lockup_acp', 'custody_transfer'];

const allSubPresent = expectedSubIds.every(id => subLetterIds.includes(id));
if (allSubPresent && MEDICAL_CUSTODY_LETTERS.length === 4) {
  console.log('  ✓ All 4 medical & custody letters are present and accessible');
} else {
  throw new Error('Missing sub-letters under Medical & Custody');
}

// 4. Verify all 7 document types exist in registry
console.log('\n[Test 4] Verifying all 7 original document types exist in registry:');
DOCUMENT_TYPES.forEach((doc, idx) => {
  const resolved = getDocumentTypeById(doc.id);
  console.log(`  ${idx + 1}. [${doc.id}] ${doc.title} (Template: ${doc.templateFile})`);
  if (!resolved || resolved.id !== doc.id) {
    throw new Error(`Failed to resolve document type for ${doc.id}`);
  }
});

console.log('\n===========================================================');
console.log('ALL 4 DASHBOARD CARDS & 7 DOCUMENT ROUTINGS VERIFIED!');
console.log('===========================================================');
