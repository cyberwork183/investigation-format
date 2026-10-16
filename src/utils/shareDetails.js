/**
 * shareDetails.js
 * Comprehensive, reliable Smart Shared-Details system for all 11 official police document forms.
 * Supports Single-Accused and Multiple-Accused modes, conflict detection, and non-destructive population.
 * All data remains 100% client-side in the browser session memory (sessionStorage).
 */

export const STORAGE_KEY = 'POLICE_SHARED_DETAILS_POOL_V3';

// 1. Group definitions
export const SINGLE_ACCUSED_DOCS = ['form3', 'notice_47', 'notice_48'];
export const MULTIPLE_ACCUSED_DOCS = [
  'remand',
  'notice_35_2',
  'atak_sanha',
  'medical',
  'lockup_ps',
  'lockup_acp',
  'custody_transfer',
  'arrest_permission'
];

export function isSingleAccusedDoc(docId) {
  return SINGLE_ACCUSED_DOCS.includes(docId);
}

export function isMultipleAccusedDoc(docId) {
  return MULTIPLE_ACCUSED_DOCS.includes(docId);
}

// In-memory fallback if sessionStorage is unavailable (e.g. SSR or Node test environments)
let _memoryStorage = {};

function getSessionStorageSafe() {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage;
    }
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage;
    }
  } catch (e) {
    // ignore
  }
  return {
    getItem: (key) => _memoryStorage[key] || null,
    setItem: (key, val) => { _memoryStorage[key] = String(val); },
    removeItem: (key) => { delete _memoryStorage[key]; }
  };
}

/**
 * Get structured session pool from sessionStorage.
 * Contains partitioned sub-pools: commonCase, singleAccused, multipleAccused.
 */
export function getStoredSharedPool() {
  try {
    const storage = getSessionStorageSafe();
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return { commonCase: {}, singleAccused: {}, multipleAccused: {} };
    }
    const parsed = JSON.parse(raw);
    return {
      commonCase: parsed.commonCase || {},
      singleAccused: parsed.singleAccused || {},
      multipleAccused: parsed.multipleAccused || {}
    };
  } catch (err) {
    console.error('Failed to load shared details from storage:', err);
    return { commonCase: {}, singleAccused: {}, multipleAccused: {} };
  }
}

/**
 * Save structured session pool to sessionStorage.
 */
export function saveStoredSharedPool(pool) {
  try {
    const storage = getSessionStorageSafe();
    storage.setItem(STORAGE_KEY, JSON.stringify(pool));
  } catch (err) {
    console.error('Failed to save shared details to storage:', err);
  }
}

/**
 * Clear shared details pool (session reset).
 */
export function clearStoredSharedDetails() {
  try {
    const storage = getSessionStorageSafe();
    storage.removeItem(STORAGE_KEY);
    storage.removeItem('POLICE_SHARED_DETAILS_POOL_V2');
    _memoryStorage = {};
  } catch (err) {
    console.error('Failed to clear shared details from storage:', err);
  }
}

/**
 * Backward compatibility: get raw combined pool
 */
export function getStoredSharedDetails() {
  const pool = getStoredSharedPool();
  return {
    ...pool.commonCase,
    ...pool.singleAccused,
    ...pool.multipleAccused
  };
}

/**
 * Backward compatibility: save raw combined pool
 */
export function saveStoredSharedDetails(sharedObj) {
  const pool = getStoredSharedPool();
  pool.commonCase = { ...pool.commonCase, ...sharedObj };
  saveStoredSharedPool(pool);
}

/**
 * Helper to check if a value is non-empty
 */
export function isNonEmpty(val) {
  if (val === undefined || val === null) return false;
  if (typeof val === 'string') return val.trim() !== '';
  if (typeof val === 'number') return true;
  if (Array.isArray(val)) return val.length > 0;
  return false;
}

/**
 * Helper to check if a value is empty
 */
export function isEmpty(val) {
  return !isNonEmpty(val);
}

/**
 * Extracts non-empty common crime & investigation details from a form.
 */
export function extractCommonCrimeDetails(docId, docData = {}) {
  const extracted = {};

  const setIfVal = (key, val) => {
    if (val !== undefined && val !== null && typeof val === 'string') {
      const trimmed = val.trim();
      if (trimmed !== '') extracted[key] = trimmed;
    } else if (typeof val === 'number') {
      extracted[key] = String(val);
    }
  };

  if (docId === 'form3') {
    setIfVal('crimeNo', docData.firNo || docData.crimeNo);
    setIfVal('policeStation', docData.policeStation);
    setIfVal('district', docData.district);
    setIfVal('state', docData.state);
    setIfVal('year', docData.year);
    setIfVal('date', docData.date);
    setIfVal('actsSections', docData.actsSections || docData.actsSectionsMr);
    setIfVal('courtName', docData.courtName);
    setIfVal('arrestDate', docData.arrestDate);
    setIfVal('arrestTime', docData.arrestTime);
    if (docData.arrestDate || docData.arrestTime) {
      setIfVal('arrestDateTime', `दिनांक ${docData.arrestDate || ''} चे ${docData.arrestTime || ''} वा.`);
    }
    setIfVal('ioName', docData.officerName);
    setIfVal('ioRank', docData.officerRank);
    setIfVal('ioStation', docData.place);
    setIfVal('ioBeltNo', docData.officerNo || docData.ioBuckleNo);
    setIfVal('ioBuckleNo', docData.officerNo || docData.ioBuckleNo);
    setIfVal('relativeName', docData.relativeIntimatedName || docData.witness1Name);
  } else {
    setIfVal('crimeNo', docData.crimeNo || docData.firNo);
    setIfVal(
      'policeStation',
      docData.psName || docData.policeStationHeader || docData.policeStation || docData.sendingStation
    );
    setIfVal('year', docData.year);
    setIfVal('date', docData.letterDate || docData.noticeDate || docData.entryDate || docData.date || docData.complaintDate);
    setIfVal('actsSections', docData.actsSections);
    setIfVal('courtName', docData.courtName);

    // Arrest details
    setIfVal('arrestDate', docData.arrestDate);
    setIfVal('arrestTime', docData.arrestTime);
    setIfVal('arrestDateTime', docData.arrestDateTime);
    if ((docData.arrestDate || docData.arrestTime) && !extracted.arrestDateTime) {
      setIfVal('arrestDateTime', `दिनांक ${docData.arrestDate || ''} चे ${docData.arrestTime || ''} वा.`);
    }

    // Investigating Officer details
    setIfVal('ioName', docData.ioName || docData.officerName || docData.reporter);
    setIfVal('ioRank', docData.ioRank || docData.officerRank);
    setIfVal('ioStation', docData.ioStation || docData.place);
    setIfVal('ioBeltNo', docData.ioBuckleNo || docData.ioBeltNo || docData.officerNo);
    setIfVal('ioBuckleNo', docData.ioBuckleNo || docData.ioBeltNo || docData.officerNo);
    setIfVal('ioPhone', docData.ioPhone);

    // Complainant details
    setIfVal('complainantName', docData.complainantName);
    setIfVal('complainantAge', docData.complainantAge);
    setIfVal('complainantProfession', docData.complainantProfession);
    setIfVal('complainantAddress', docData.complainantAddress);

    // Case narration & grounds of arrest
    setIfVal('caseBrief', docData.caseBrief || docData.briefFacts || docData.briefFactsOfCase);
    setIfVal('groundsOfArrest', docData.groundsOfArrest || docData.reasonsForArrest);

    // Bank & Transaction details
    setIfVal('bankName', docData.bankName);
    setIfVal('accountNo', docData.accountNo || docData.bankAccountNo);
    setIfVal('branchName', docData.branchName || docData.bankBranch);
    setIfVal('txnId', docData.txnId || docData.txnIdUtr);
    setIfVal('txnAmount', docData.txnAmount);
    setIfVal('accountName', docData.accountName || docData.accountHolderName);
    setIfVal('accountAddress', docData.accountAddress || docData.bankAddress);
    setIfVal('companyName', docData.companyName);
    setIfVal('directorsDetails', docData.directorsDetails || docData.companyDirectors);
    setIfVal('totalFraudAmount', docData.totalFraudAmount);

    // Array bank accounts support (Notice 35/2)
    if (docId === 'notice_35_2' && Array.isArray(docData.bankAccounts) && docData.bankAccounts.length > 0) {
      const firstBank = docData.bankAccounts[0];
      if (firstBank) {
        setIfVal('bankName', firstBank.bankName);
        setIfVal('accountNo', firstBank.accountNo);
        setIfVal('branchName', firstBank.branchName);
        setIfVal('txnId', firstBank.txnId);
        setIfVal('txnAmount', firstBank.amount);
        setIfVal('accountName', firstBank.accountName);
      }
    }

    // Relative & Intimation details
    setIfVal('relativeName', docData.relativeName || docData.relativeIntimatedName);
    setIfVal('relation', docData.relation || docData.relativeRelation);
    setIfVal('relativeAddress', docData.relativeAddress);
    setIfVal('relativePhone', docData.relativePhone);
    setIfVal('relativeIntimation', docData.relativeIntimation);

    // Production Warrant / Prior Case
    setIfVal('productionWarrantDetails', docData.productionWarrantDetails || docData.priorProductionDetails || docData.priorCaseDetails);
    setIfVal('producedFromJail', docData.producedFromJail || docData.producingAuthority);
    setIfVal('courtProductionDate', docData.courtProductionDate);
  }

  return extracted;
}

/**
 * Extracts non-empty accused personal details from a form.
 */
export function extractAccusedDetails(docId, docData = {}) {
  const primary = {};

  const setIfVal = (key, val) => {
    if (val !== undefined && val !== null && typeof val === 'string') {
      const trimmed = val.trim();
      if (trimmed !== '') primary[key] = trimmed;
    } else if (typeof val === 'number') {
      primary[key] = String(val);
    }
  };

  if (docId === 'form3') {
    setIfVal('accusedName', docData.accusedName);
    setIfVal('accusedFather', docData.fatherName);
    setIfVal('accusedAlias', docData.firstAlias || docData.secondAlias);
    setIfVal('accusedAge', docData.physicalFeatures?.dob);
    setIfVal('accusedAddress', docData.presentAddress || docData.permanentAddress);
  } else if (docId === 'arrest_permission') {
    setIfVal('accusedName', docData.accusedName);
    if (!primary.accusedName && docData.producedAccusedName) {
      const rawProd = docData.producedAccusedName;
      const commaIdx = rawProd.indexOf(',');
      if (commaIdx > 0) {
        setIfVal('accusedName', rawProd.slice(0, commaIdx).trim());
      } else {
        setIfVal('accusedName', rawProd.trim());
      }
    }
    setIfVal('accusedAge', docData.accusedAge);
    setIfVal('accusedAddress', docData.accusedAddress);
    setIfVal('accusedAlias', docData.accusedAlias);
    setIfVal('accusedFather', docData.accusedFather);
  } else {
    setIfVal('accusedName', docData.accusedName);
    setIfVal('accusedAge', docData.accusedAge);
    setIfVal('accusedAddress', docData.accusedAddress);
    setIfVal('accusedAlias', docData.accusedAlias);
    setIfVal('accusedFather', docData.accusedFather);
  }

  let additionalAccused = null;
  if (isMultipleAccusedDoc(docId) && Array.isArray(docData.additionalAccused) && docData.additionalAccused.length > 0) {
    const validAdditional = docData.additionalAccused
      .filter((a) => a && typeof a.accusedName === 'string' && a.accusedName.trim() !== '')
      .map((a) => ({
        accusedName: a.accusedName.trim(),
        accusedAlias: (a.accusedAlias || '').trim(),
        accusedFather: (a.accusedFather || '').trim(),
        accusedAge: (a.accusedAge || '').trim(),
        accusedAddress: (a.accusedAddress || '').trim()
      }));
    if (validAdditional.length > 0) {
      additionalAccused = validAdditional;
    }
  }

  return { primary, additionalAccused };
}

/**
 * Checks whether a document has any non-empty shareable data (case or accused).
 */
export function hasAnyShareableDetails(docId, docData = {}) {
  const common = extractCommonCrimeDetails(docId, docData);
  if (Object.keys(common).length > 0) return true;

  const accused = extractAccusedDetails(docId, docData);
  if (Object.keys(accused.primary).length > 0) return true;
  if (accused.additionalAccused && accused.additionalAccused.length > 0) return true;

  return false;
}

/**
 * Backward compatibility: extract all fields into flat object
 */
export function extractSharedDetailsFromDoc(docId, docData = {}) {
  const common = extractCommonCrimeDetails(docId, docData);
  const accused = extractAccusedDetails(docId, docData);
  const combined = { ...common, ...accused.primary };
  if (accused.additionalAccused) {
    combined.additionalAccused = accused.additionalAccused;
  }
  return combined;
}

/**
 * Helper to check whether two dates are equivalent across YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY,
 * and Marathi digits.
 */
export function areDatesEquivalent(d1, d2) {
  if (!d1 || !d2) return false;
  // Convert Marathi digits to ASCII
  const marathiDigits = '०१२३४५६७८९';
  const toAscii = (s) => String(s).replace(/[०-९]/g, (ch) => marathiDigits.indexOf(ch));
  const s1 = toAscii(d1).trim();
  const s2 = toAscii(d2).trim();
  if (s1 === s2) return true;

  const parseParts = (str) => {
    // Matches YYYY-MM-DD or DD-MM-YYYY or DD/MM/YYYY
    const parts = str.split(/[-/.]/);
    if (parts.length !== 3) return null;
    const [p0, p1, p2] = parts.map((p) => parseInt(p, 10));
    if (isNaN(p0) || isNaN(p1) || isNaN(p2)) return null;

    if (parts[0].length === 4) {
      // YYYY-MM-DD
      return { y: p0, m: p1, d: p2 };
    } else if (parts[2].length === 4) {
      // DD-MM-YYYY
      return { y: p2, m: p1, d: p0 };
    }
    return null;
  };

  const p1 = parseParts(s1);
  const p2 = parseParts(s2);
  if (p1 && p2) {
    return p1.y === p2.y && p1.m === p2.m && p1.d === p2.d;
  }
  return false;
}

/**
 * Checks whether two string values represent the same content,
 * ignoring trivial differences like commas, extra whitespace, or date formatting.
 */
export function areValuesEquivalent(val1, val2) {
  if (val1 === val2) return true;
  if (val1 === undefined || val1 === null || val2 === undefined || val2 === null) {
    return val1 === val2;
  }

  const s1 = String(val1).trim();
  const s2 = String(val2).trim();
  if (s1 === s2) return true;

  // Check date equivalence
  if (areDatesEquivalent(s1, s2)) return true;

  // Normalize punctuation and whitespace
  const norm1 = s1.replace(/[,.\-_]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  const norm2 = s2.replace(/[,.\-_]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  if (norm1 === norm2) return true;

  // Normalize Marathi Police Station synonyms and spelling variants
  const normPs1 = norm1.replace(/स्टेशन/g, 'ठाणे').replace(/नागपुर/g, 'नागपूर');
  const normPs2 = norm2.replace(/स्टेशन/g, 'ठाणे').replace(/नागपुर/g, 'नागपूर');
  if (normPs1 === normPs2) return true;

  return false;
}

/**
 * Helper to apply a scalar field with conflict detection.
 * If target field is empty, sets target[targetKey] = incomingVal.
 * If target field is non-empty and differs from incomingVal, does NOT overwrite, and records a conflict.
 */
function applyFieldWithConflictCheck(targetDoc, targetKey, incomingVal, conflicts, docId, label) {
  if (!isNonEmpty(incomingVal)) return;

  const currentVal = targetDoc[targetKey];
  if (isEmpty(currentVal)) {
    targetDoc[targetKey] = incomingVal;
  } else {
    if (!areValuesEquivalent(currentVal, incomingVal)) {
      conflicts.push({
        docId,
        field: label || targetKey,
        currentVal: String(currentVal).trim(),
        incomingVal: String(incomingVal).trim()
      });
      // Do NOT overwrite: preserve existing value!
    }
  }
}

/**
 * Apply common crime & investigation details to a document.
 */
function applyCommonCrimeFields(docId, target, pool, conflicts) {
  if (!pool) return;

  // Crime / FIR Number
  if (pool.crimeNo) {
    if (docId === 'form3') {
      applyFieldWithConflictCheck(target, 'firNo', pool.crimeNo, conflicts, docId, 'Crime/FIR No');
    } else {
      applyFieldWithConflictCheck(target, 'crimeNo', pool.crimeNo, conflicts, docId, 'Crime No');
    }
  }

  // Police Station
  if (pool.policeStation) {
    if (docId === 'form3') {
      applyFieldWithConflictCheck(target, 'policeStation', pool.policeStation, conflicts, docId, 'Police Station');
    } else if (docId === 'remand') {
      applyFieldWithConflictCheck(target, 'psName', pool.policeStation, conflicts, docId, 'Police Station');
      applyFieldWithConflictCheck(target, 'policeStationHeader', pool.policeStation, conflicts, docId, 'Police Station Header');
    } else if (docId === 'arrest_permission') {
      applyFieldWithConflictCheck(target, 'policeStationHeader', pool.policeStation, conflicts, docId, 'Police Station Header');
    } else if (docId === 'medical') {
      applyFieldWithConflictCheck(target, 'policeStation', pool.policeStation, conflicts, docId, 'Police Station');
    } else if (docId === 'lockup_ps' || docId === 'lockup_acp' || docId === 'custody_transfer') {
      applyFieldWithConflictCheck(target, 'sendingStation', pool.policeStation, conflicts, docId, 'Police Station');
    } else {
      applyFieldWithConflictCheck(target, 'psName', pool.policeStation, conflicts, docId, 'Police Station');
    }
  }

  // District & State (Form III)
  if (docId === 'form3') {
    if (pool.district) applyFieldWithConflictCheck(target, 'district', pool.district, conflicts, docId, 'District');
    if (pool.state) applyFieldWithConflictCheck(target, 'state', pool.state, conflicts, docId, 'State');
  }

  // Year
  if (pool.year && target.year !== undefined) {
    applyFieldWithConflictCheck(target, 'year', pool.year, conflicts, docId, 'Year');
  }

  // Date
  if (pool.date) {
    if (docId === 'form3') {
      applyFieldWithConflictCheck(target, 'date', pool.date, conflicts, docId, 'Date');
    } else if (target.letterDate !== undefined) {
      applyFieldWithConflictCheck(target, 'letterDate', pool.date, conflicts, docId, 'Letter/Notice Date');
    }
  }

  // Acts & Sections
  if (pool.actsSections) {
    if (docId === 'form3') {
      applyFieldWithConflictCheck(target, 'actsSections', pool.actsSections, conflicts, docId, 'Acts & Sections');
      if (isEmpty(target.actsSectionsMr)) {
        target.actsSectionsMr = pool.actsSections;
      }
    } else if (target.actsSections !== undefined) {
      applyFieldWithConflictCheck(target, 'actsSections', pool.actsSections, conflicts, docId, 'Acts & Sections');
    }
  }

  // Court Name
  if (pool.courtName && target.courtName !== undefined) {
    applyFieldWithConflictCheck(target, 'courtName', pool.courtName, conflicts, docId, 'Court Name');
  }

  // Arrest Date, Time, DateTime
  if (pool.arrestDate && target.arrestDate !== undefined) {
    applyFieldWithConflictCheck(target, 'arrestDate', pool.arrestDate, conflicts, docId, 'Arrest Date');
  }
  if (pool.arrestTime && target.arrestTime !== undefined) {
    applyFieldWithConflictCheck(target, 'arrestTime', pool.arrestTime, conflicts, docId, 'Arrest Time');
  }
  if (pool.arrestDateTime && target.arrestDateTime !== undefined) {
    applyFieldWithConflictCheck(target, 'arrestDateTime', pool.arrestDateTime, conflicts, docId, 'Arrest Date-Time');
  } else if ((pool.arrestDate || pool.arrestTime) && target.arrestDateTime !== undefined && isEmpty(target.arrestDateTime)) {
    target.arrestDateTime = `दिनांक ${pool.arrestDate || ''} चे ${pool.arrestTime || ''} वा.`;
  }

  // Investigating Officer details
  if (pool.ioName) {
    if (docId === 'form3') {
      applyFieldWithConflictCheck(target, 'officerName', pool.ioName, conflicts, docId, 'Officer Name');
    } else {
      if (target.ioName !== undefined) {
        applyFieldWithConflictCheck(target, 'ioName', pool.ioName, conflicts, docId, 'IO Name');
      }
      if (target.reporter !== undefined) {
        applyFieldWithConflictCheck(target, 'reporter', pool.ioName, conflicts, docId, 'Reporter IO');
      }
    }
  }

  if (pool.ioRank) {
    if (docId === 'form3') {
      applyFieldWithConflictCheck(target, 'officerRank', pool.ioRank, conflicts, docId, 'Officer Rank');
    } else if (target.ioRank !== undefined) {
      applyFieldWithConflictCheck(target, 'ioRank', pool.ioRank, conflicts, docId, 'IO Rank');
    }
  }

  if (pool.ioStation) {
    if (docId === 'form3') {
      applyFieldWithConflictCheck(target, 'place', pool.ioStation, conflicts, docId, 'Officer Station');
    } else if (target.ioStation !== undefined) {
      applyFieldWithConflictCheck(target, 'ioStation', pool.ioStation, conflicts, docId, 'IO Station');
    }
  }

  const buckleVal = pool.ioBuckleNo || pool.ioBeltNo;
  if (buckleVal) {
    if (docId === 'form3') {
      applyFieldWithConflictCheck(target, 'officerNo', buckleVal, conflicts, docId, 'Officer Buckle No');
    } else {
      if (target.ioBuckleNo !== undefined) {
        applyFieldWithConflictCheck(target, 'ioBuckleNo', buckleVal, conflicts, docId, 'IO Buckle No');
      }
      if (target.ioBeltNo !== undefined) {
        applyFieldWithConflictCheck(target, 'ioBeltNo', buckleVal, conflicts, docId, 'IO Belt No');
      }
    }
  }

  if (pool.ioPhone && target.ioPhone !== undefined) {
    applyFieldWithConflictCheck(target, 'ioPhone', pool.ioPhone, conflicts, docId, 'IO Phone');
  }

  // Complainant details
  if (pool.complainantName && target.complainantName !== undefined) {
    applyFieldWithConflictCheck(target, 'complainantName', pool.complainantName, conflicts, docId, 'Complainant Name');
  }
  if (pool.complainantAge && target.complainantAge !== undefined) {
    applyFieldWithConflictCheck(target, 'complainantAge', pool.complainantAge, conflicts, docId, 'Complainant Age');
  }
  if (pool.complainantProfession && target.complainantProfession !== undefined) {
    applyFieldWithConflictCheck(target, 'complainantProfession', pool.complainantProfession, conflicts, docId, 'Complainant Profession');
  }
  if (pool.complainantAddress && target.complainantAddress !== undefined) {
    applyFieldWithConflictCheck(target, 'complainantAddress', pool.complainantAddress, conflicts, docId, 'Complainant Address');
  }

  // Case Brief & Grounds of Arrest
  if (pool.caseBrief && target.caseBrief !== undefined) {
    applyFieldWithConflictCheck(target, 'caseBrief', pool.caseBrief, conflicts, docId, 'Case Brief');
  }
  if (pool.groundsOfArrest && target.groundsOfArrest !== undefined) {
    applyFieldWithConflictCheck(target, 'groundsOfArrest', pool.groundsOfArrest, conflicts, docId, 'Grounds of Arrest');
  }

  // Bank & Transaction details
  if (pool.bankName) {
    applyFieldWithConflictCheck(target, 'bankName', pool.bankName, conflicts, docId, 'Bank Name');
  }
  if (pool.accountNo) {
    applyFieldWithConflictCheck(target, 'accountNo', pool.accountNo, conflicts, docId, 'Account No');
    if (target.bankAccountNo !== undefined) applyFieldWithConflictCheck(target, 'bankAccountNo', pool.accountNo, conflicts, docId, 'Bank Account No');
  }
  if (pool.branchName) {
    applyFieldWithConflictCheck(target, 'branchName', pool.branchName, conflicts, docId, 'Branch Name');
    if (target.bankBranch !== undefined) applyFieldWithConflictCheck(target, 'bankBranch', pool.branchName, conflicts, docId, 'Bank Branch');
  }
  if (pool.txnId) {
    applyFieldWithConflictCheck(target, 'txnId', pool.txnId, conflicts, docId, 'Txn ID');
    if (target.txnIdUtr !== undefined) applyFieldWithConflictCheck(target, 'txnIdUtr', pool.txnId, conflicts, docId, 'Txn ID / UTR');
  }
  if (pool.txnAmount) {
    applyFieldWithConflictCheck(target, 'txnAmount', pool.txnAmount, conflicts, docId, 'Txn Amount');
  }
  if (pool.accountName) {
    applyFieldWithConflictCheck(target, 'accountName', pool.accountName, conflicts, docId, 'Account Holder');
    if (target.accountHolderName !== undefined) applyFieldWithConflictCheck(target, 'accountHolderName', pool.accountName, conflicts, docId, 'Account Holder');
  }
  if (pool.accountAddress) {
    applyFieldWithConflictCheck(target, 'accountAddress', pool.accountAddress, conflicts, docId, 'Account Address');
    if (target.bankAddress !== undefined) applyFieldWithConflictCheck(target, 'bankAddress', pool.accountAddress, conflicts, docId, 'Bank Address');
  }
  if (pool.companyName) {
    applyFieldWithConflictCheck(target, 'companyName', pool.companyName, conflicts, docId, 'Company Name');
  }
  if (pool.directorsDetails) {
    applyFieldWithConflictCheck(target, 'directorsDetails', pool.directorsDetails, conflicts, docId, 'Directors');
    if (target.companyDirectors !== undefined) applyFieldWithConflictCheck(target, 'companyDirectors', pool.directorsDetails, conflicts, docId, 'Company Directors');
  }
  if (pool.totalFraudAmount) {
    applyFieldWithConflictCheck(target, 'totalFraudAmount', pool.totalFraudAmount, conflicts, docId, 'Total Fraud Amount');
  }

  // Relative details
  if (pool.relativeName) {
    if (docId === 'form3') {
      applyFieldWithConflictCheck(target, 'relativeIntimatedName', pool.relativeName, conflicts, docId, 'Relative Name');
    } else if (target.relativeName !== undefined) {
      applyFieldWithConflictCheck(target, 'relativeName', pool.relativeName, conflicts, docId, 'Relative Name');
    }
  }
  if (pool.relation) {
    if (target.relation !== undefined) applyFieldWithConflictCheck(target, 'relation', pool.relation, conflicts, docId, 'Relation');
    if (target.relativeRelation !== undefined) applyFieldWithConflictCheck(target, 'relativeRelation', pool.relation, conflicts, docId, 'Relative Relation');
  }
  if (pool.relativeAddress && target.relativeAddress !== undefined) {
    applyFieldWithConflictCheck(target, 'relativeAddress', pool.relativeAddress, conflicts, docId, 'Relative Address');
  }
  if (pool.relativePhone && target.relativePhone !== undefined) {
    applyFieldWithConflictCheck(target, 'relativePhone', pool.relativePhone, conflicts, docId, 'Relative Phone');
  }
  if (pool.relativeIntimation && target.relativeIntimation !== undefined) {
    applyFieldWithConflictCheck(target, 'relativeIntimation', pool.relativeIntimation, conflicts, docId, 'Relative Intimation');
  }

  // Production Warrant / Prior Custody
  if (pool.productionWarrantDetails) {
    if (target.productionWarrantDetails !== undefined) applyFieldWithConflictCheck(target, 'productionWarrantDetails', pool.productionWarrantDetails, conflicts, docId, 'Prior Custody Details');
    if (target.priorProductionDetails !== undefined) applyFieldWithConflictCheck(target, 'priorProductionDetails', pool.productionWarrantDetails, conflicts, docId, 'Prior Custody Details');
    if (target.priorCaseDetails !== undefined) applyFieldWithConflictCheck(target, 'priorCaseDetails', pool.productionWarrantDetails, conflicts, docId, 'Prior Case Details');
  }
  if (pool.producedFromJail) {
    if (target.producedFromJail !== undefined) applyFieldWithConflictCheck(target, 'producedFromJail', pool.producedFromJail, conflicts, docId, 'Producing Authority');
    if (target.producingAuthority !== undefined) applyFieldWithConflictCheck(target, 'producingAuthority', pool.producedFromJail, conflicts, docId, 'Producing Authority');
  }
  if (pool.courtProductionDate && target.courtProductionDate !== undefined) {
    applyFieldWithConflictCheck(target, 'courtProductionDate', pool.courtProductionDate, conflicts, docId, 'Court Production Date');
  }
}

/**
 * Apply accused details to a single-accused document (Form III, Notice 47, Notice 48).
 */
function applyAccusedFieldsToSingleDoc(docId, target, accused, conflicts) {
  if (!accused) return;

  if (docId === 'form3') {
    if (accused.accusedName) {
      applyFieldWithConflictCheck(target, 'accusedName', accused.accusedName, conflicts, 'form3', 'Accused Name');
    }
    if (accused.accusedFather) {
      applyFieldWithConflictCheck(target, 'fatherName', accused.accusedFather, conflicts, 'form3', 'Father Name');
    }
    if (accused.accusedAlias) {
      applyFieldWithConflictCheck(target, 'firstAlias', accused.accusedAlias, conflicts, 'form3', 'Alias');
    }
    if (accused.accusedAge) {
      if (!target.physicalFeatures) target.physicalFeatures = {};
      const currentDob = target.physicalFeatures.dob;
      if (isEmpty(currentDob)) {
        target.physicalFeatures = { ...target.physicalFeatures, dob: accused.accusedAge };
      } else if (String(currentDob).trim() !== String(accused.accusedAge).trim()) {
        conflicts.push({
          docId: 'form3',
          field: 'Accused Age/DOB',
          currentVal: String(currentDob).trim(),
          incomingVal: String(accused.accusedAge).trim()
        });
      }
    }
    if (accused.accusedAddress) {
      if (isEmpty(target.presentAddress)) {
        target.presentAddress = accused.accusedAddress;
      } else if (String(target.presentAddress).trim() !== String(accused.accusedAddress).trim()) {
        conflicts.push({
          docId: 'form3',
          field: 'Accused Present Address',
          currentVal: String(target.presentAddress).trim(),
          incomingVal: String(accused.accusedAddress).trim()
        });
      }
      if (isEmpty(target.permanentAddress)) {
        target.permanentAddress = accused.accusedAddress;
      }
    }
  } else if (docId === 'notice_47' || docId === 'notice_48') {
    if (accused.accusedName) {
      applyFieldWithConflictCheck(target, 'accusedName', accused.accusedName, conflicts, docId, 'Accused Name');
    }
    if (accused.accusedAge) {
      applyFieldWithConflictCheck(target, 'accusedAge', accused.accusedAge, conflicts, docId, 'Accused Age');
    }
    if (accused.accusedAddress) {
      applyFieldWithConflictCheck(target, 'accusedAddress', accused.accusedAddress, conflicts, docId, 'Accused Address');
    }
  }
}

/**
 * Apply accused details to a multiple-accused document.
 */
function applyAccusedFieldsToMultiDoc(docId, target, accusedDetails, conflicts) {
  if (!accusedDetails) return;
  const primary = accusedDetails.primary || accusedDetails;

  // Primary accused
  if (primary.accusedName) {
    if (docId === 'arrest_permission') {
      if (isEmpty(target.producedAccusedName)) {
        const agePart = primary.accusedAge ? `, वय ${primary.accusedAge} वर्षे` : '';
        const addrPart = primary.accusedAddress ? `, पत्ता – ${primary.accusedAddress}` : '';
        target.producedAccusedName = `${primary.accusedName}${agePart}${addrPart}`;
      } else if (!target.producedAccusedName.includes(primary.accusedName.trim())) {
        conflicts.push({
          docId,
          field: 'Produced Accused Name',
          currentVal: String(target.producedAccusedName).trim(),
          incomingVal: primary.accusedName.trim()
        });
      }

      if (isEmpty(target.accusedListText)) {
        const agePart = primary.accusedAge ? `, वय ${primary.accusedAge} वर्षे` : '';
        const addrPart = primary.accusedAddress ? `, पत्ता – ${primary.accusedAddress}` : '';
        target.accusedListText = `१) ${primary.accusedName}${agePart}${addrPart}`;
      }
    } else {
      applyFieldWithConflictCheck(target, 'accusedName', primary.accusedName, conflicts, docId, 'Accused Name');
    }
  }

  if (docId !== 'arrest_permission') {
    if (primary.accusedAge) {
      applyFieldWithConflictCheck(target, 'accusedAge', primary.accusedAge, conflicts, docId, 'Accused Age');
    }
    if (primary.accusedAddress) {
      applyFieldWithConflictCheck(target, 'accusedAddress', primary.accusedAddress, conflicts, docId, 'Accused Address');
    }
    if (primary.accusedAlias && target.accusedAlias !== undefined) {
      applyFieldWithConflictCheck(target, 'accusedAlias', primary.accusedAlias, conflicts, docId, 'Accused Alias');
    }
    if (primary.accusedFather && target.accusedFather !== undefined) {
      applyFieldWithConflictCheck(target, 'accusedFather', primary.accusedFather, conflicts, docId, 'Accused Father');
    }
  }

  // Additional accused array
  if (Array.isArray(accusedDetails.additionalAccused) && accusedDetails.additionalAccused.length > 0) {
    const incomingAdditional = accusedDetails.additionalAccused;
    const targetAdditional = target.additionalAccused;

    if (!Array.isArray(targetAdditional) || targetAdditional.length === 0 || targetAdditional.every((a) => isEmpty(a.accusedName))) {
      // Empty or absent: safely populate
      target.additionalAccused = incomingAdditional.map((a) => ({ ...a }));
    } else {
      // Compare if targetAdditional matches incomingAdditional
      const isIdentical =
        targetAdditional.length === incomingAdditional.length &&
        incomingAdditional.every((inAcc, idx) => {
          const tAcc = targetAdditional[idx];
          return tAcc && String(tAcc.accusedName || '').trim() === String(inAcc.accusedName || '').trim();
        });

      if (!isIdentical) {
        // Conflicting accused records: preserve target's records, do NOT overwrite
        conflicts.push({
          docId,
          field: 'Additional Accused List',
          currentVal: `${targetAdditional.length} accused record(s)`,
          incomingVal: `${incomingAdditional.length} incoming accused record(s)`
        });
      }
    }
  }
}

/**
 * Execute Smart Share Details operation across all documents.
 * Returns { updatedDocs, conflictCount, conflicts }
 */
export function executeSmartShare({ sourceDocId, sourceData, allDocs = {}, mode = 'single' }) {
  // 1. Extract details from current source form
  const extractedCommon = extractCommonCrimeDetails(sourceDocId, sourceData);
  const extractedAccused = extractAccusedDetails(sourceDocId, sourceData);

  // 2. Update session pool
  const storedPool = getStoredSharedPool();
  const newPool = {
    commonCase: { ...storedPool.commonCase, ...extractedCommon },
    singleAccused: { ...storedPool.singleAccused },
    multipleAccused: { ...storedPool.multipleAccused }
  };

  if (mode === 'single') {
    // Only update singleAccused pool
    if (Object.keys(extractedAccused.primary).length > 0) {
      newPool.singleAccused = { ...newPool.singleAccused, ...extractedAccused.primary };
    }
  } else if (mode === 'multiple') {
    // Only update multipleAccused pool if source is in the multiple-accused group
    if (isMultipleAccusedDoc(sourceDocId)) {
      if (Object.keys(extractedAccused.primary).length > 0) {
        newPool.multipleAccused = { ...newPool.multipleAccused, ...extractedAccused.primary };
      }
      if (extractedAccused.additionalAccused && extractedAccused.additionalAccused.length > 0) {
        newPool.multipleAccused.additionalAccused = extractedAccused.additionalAccused;
      }
    }
  }

  saveStoredSharedPool(newPool);

  // 3. Apply to all documents in allDocs
  const updatedDocs = {};
  const conflicts = [];

  const allDocIds = Object.keys(allDocs);
  for (const docId of allDocIds) {
    if (docId === sourceDocId) {
      // Source form keeps its latest data exactly
      updatedDocs[docId] = { ...sourceData };
      continue;
    }

    const currentDocData = allDocs[docId] || {};
    const updated = { ...currentDocData };

    // A. Apply Common Crime Details to ALL documents
    applyCommonCrimeFields(docId, updated, newPool.commonCase, conflicts);

    // B. Apply Accused Details based on selected mode
    if (mode === 'single') {
      // Single-accused personal details propagate ONLY among SINGLE_ACCUSED_DOCS
      if (isSingleAccusedDoc(docId)) {
        applyAccusedFieldsToSingleDoc(docId, updated, newPool.singleAccused, conflicts);
      }
      // MULTIPLE_ACCUSED_DOCS get ZERO accused personal details in single mode
    } else if (mode === 'multiple') {
      // Multiple-accused personal details propagate ONLY within MULTIPLE_ACCUSED_DOCS
      // and only if source document is from the multiple-accused group
      if (isMultipleAccusedDoc(docId) && isMultipleAccusedDoc(sourceDocId)) {
        applyAccusedFieldsToMultiDoc(docId, updated, newPool.multipleAccused, conflicts);
      }
      // SINGLE_ACCUSED_DOCS get ZERO accused personal details in multiple mode
    }

    updatedDocs[docId] = updated;
  }

  return {
    updatedDocs,
    conflictCount: conflicts.length,
    conflicts
  };
}

/**
 * Apply smart shared details pool when a document is selected or restored.
 * Strictly respects single-accused vs multiple-accused boundaries.
 */
export function applySmartSharedDetailsToDoc(docId, targetDocData = {}, pool = null) {
  const currentPool = pool || getStoredSharedPool();
  const updated = { ...targetDocData };
  const dummyConflicts = [];

  // 1. Common Crime Details apply to ALL forms
  if (currentPool.commonCase && Object.keys(currentPool.commonCase).length > 0) {
    applyCommonCrimeFields(docId, updated, currentPool.commonCase, dummyConflicts);
  }

  // 2. Accused Details apply strictly according to group
  if (isSingleAccusedDoc(docId)) {
    if (currentPool.singleAccused && Object.keys(currentPool.singleAccused).length > 0) {
      applyAccusedFieldsToSingleDoc(docId, updated, currentPool.singleAccused, dummyConflicts);
    }
  } else if (isMultipleAccusedDoc(docId)) {
    if (currentPool.multipleAccused && Object.keys(currentPool.multipleAccused).length > 0) {
      applyAccusedFieldsToMultiDoc(docId, updated, currentPool.multipleAccused, dummyConflicts);
    }
  }

  return updated;
}

/**
 * Backward compatibility: original applySharedDetailsToDoc
 */
export function applySharedDetailsToDoc(docId, targetDocData = {}, sharedPool = {}) {
  // If passed a structured pool with commonCase
  if (sharedPool.commonCase || sharedPool.singleAccused || sharedPool.multipleAccused) {
    return applySmartSharedDetailsToDoc(docId, targetDocData, sharedPool);
  }

  // If passed a flat pool, partition it and apply safely
  const partitioned = {
    commonCase: { ...sharedPool },
    singleAccused: isSingleAccusedDoc(docId) ? { ...sharedPool } : {},
    multipleAccused: isMultipleAccusedDoc(docId) ? { ...sharedPool } : {}
  };
  return applySmartSharedDetailsToDoc(docId, targetDocData, partitioned);
}
