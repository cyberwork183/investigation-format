/**
 * test_share_details_workflow.js
 * Automated verification of the exact "Share Details" workflow requested by user.
 */

import {
  extractSharedDetailsFromDoc,
  applySharedDetailsToDoc
} from '../src/utils/shareDetails.js';

import {
  getDefaultForm3Data,
  getDefaultRemandData,
  getDefaultMedicalData,
  getDefaultLockupPsData
} from '../src/utils/documentSchemas.js';

console.log('===========================================================');
console.log('TESTING "SHARE DETAILS" WORKFLOW');
console.log('===========================================================\n');

let sharedPool = {};

// Step 1: User opens Form 1 (Medical Letter) and fills only accusedName and crimeNo
console.log('[Step 1 & 2] Opening Medical Letter form, entering only Accused Name & Crime No...');
let medicalForm = getDefaultMedicalData();
medicalForm.accusedName = 'संदीप भानुदास मोरे';
medicalForm.crimeNo = '38/2026';

// Step 3: User clicks "Share Details" on Medical Letter form
console.log('[Step 3] Clicking "Share Details" on Medical Letter form...');
const medicalExtracted = extractSharedDetailsFromDoc('medical', medicalForm);
sharedPool = { ...sharedPool, ...medicalExtracted };

if (sharedPool.accusedName === 'संदीप भानुदास मोरे' && sharedPool.crimeNo === '38/2026') {
  console.log('  ✓ Shared pool successfully collected:', sharedPool);
} else {
  throw new Error('Failed to extract shared details from Medical form');
}

// Step 4 & 5: Open another document form (Lockup PS) and verify pre-population
console.log('\n[Step 4 & 5] Opening Lockup PS Form and verifying prefilled fields...');
let lockupPsForm = getDefaultLockupPsData();
lockupPsForm = applySharedDetailsToDoc('lockup_ps', lockupPsForm, sharedPool);

if (lockupPsForm.accusedName === 'संदीप भानुदास मोरे' && lockupPsForm.crimeNo === '38/2026') {
  console.log('  ✓ Lockup PS Form auto-populated Accused Name & Crime Number correctly');
} else {
  throw new Error('Lockup PS form failed to receive shared fields');
}

// Step 6: User fills in additional details in the second form (Lockup PS)
console.log('\n[Step 6] Adding Police Station & IO Name in Lockup PS Form and clicking "Share Details"...');
lockupPsForm.psName = 'पोलीस स्टेशन सायबर, नागपूर शहर';
lockupPsForm.ioName = 'सुरेश डांबरे';
lockupPsForm.ioRank = 'वरीष्ठ पोलीस निरीक्षक';

const lockupExtracted = extractSharedDetailsFromDoc('lockup_ps', lockupPsForm);
sharedPool = { ...sharedPool, ...lockupExtracted };

if (sharedPool.policeStation === 'पोलीस स्टेशन सायबर, नागपूर शहर' && sharedPool.ioName === 'सुरेश डांबरे') {
  console.log('  ✓ Updated shared pool now contains:', Object.keys(sharedPool));
} else {
  throw new Error('Failed to update shared pool with second form details');
}

// Step 7: Open a third form (Remand Form) and verify all accumulated details
console.log('\n[Step 7] Opening Remand Application Form and verifying all shared details...');
let remandForm = getDefaultRemandData();
remandForm = applySharedDetailsToDoc('remand', remandForm, sharedPool);

if (
  remandForm.accusedName === 'संदीप भानुदास मोरे' &&
  remandForm.crimeNo === '38/2026' &&
  remandForm.psName === 'पोलीस स्टेशन सायबर, नागपूर शहर' &&
  remandForm.ioName === 'सुरेश डांबरे'
) {
  console.log('  ✓ Remand Form received all 4 shared fields (Accused, Crime No, PS, IO)');
} else {
  throw new Error('Remand form did not receive all accumulated shared details');
}

// Step 8: Open Form III (Arrest Memo) and verify mapping
console.log('\n[Step 8] Opening Form III (Arrest Memo)...');
let form3 = getDefaultForm3Data();
form3 = applySharedDetailsToDoc('form3', form3, sharedPool);

if (
  form3.accusedName === 'संदीप भानुदास मोरे' &&
  form3.firNo === '38/2026' &&
  form3.policeStation === 'पोलीस स्टेशन सायबर, नागपूर शहर' &&
  form3.officerName === 'सुरेश डांबरे'
) {
  console.log('  ✓ Form III correctly mapped firNo, policeStation, and officerName');
} else {
  throw new Error('Form III field mapping failed');
}

// Step 9: Verify non-overwrite of existing non-empty values
console.log('\n[Step 9] Testing non-overwrite rule (preserving existing entries)...');
let existingForm = getDefaultMedicalData();
existingForm.accusedName = 'विशाल पाटील'; // Pre-existing different name

existingForm = applySharedDetailsToDoc('medical', existingForm, sharedPool);
if (existingForm.accusedName === 'विशाल पाटील') {
  console.log('  ✓ Pre-existing non-empty value "विशाल पाटील" was preserved and NOT overwritten');
} else {
  throw new Error('Existing non-empty value was overwritten!');
}

console.log('\n===========================================================');
console.log('ALL SHARE DETAILS WORKFLOW TESTS PASSED SUCCESSFULLY!');
console.log('===========================================================');
