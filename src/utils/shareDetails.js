/**
 * shareDetails.js
 * Comprehensive, reliable shared-details pool for all 11 official police document forms.
 * All data remains 100% client-side in the browser session memory (sessionStorage).
 */

const STORAGE_KEY = 'POLICE_SHARED_DETAILS_POOL_V2';

/**
 * Get stored shared details pool from sessionStorage (session-only)
 */
export function getStoredSharedDetails() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Failed to load shared details from storage:', err);
    return {};
  }
}

/**
 * Save shared details pool to sessionStorage (session-only)
 */
export function saveStoredSharedDetails(sharedObj) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sharedObj));
  } catch (err) {
    console.error('Failed to save shared details to storage:', err);
  }
}

/**
 * Clear shared details pool (session reset)
 */
export function clearStoredSharedDetails() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear shared details from storage:', err);
  }
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
 * Extracts non-empty canonical fields from a document form data.
 */
export function extractSharedDetailsFromDoc(docId, docData = {}) {
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
    setIfVal('accusedName', docData.accusedName);
    setIfVal('accusedFather', docData.fatherName);
    setIfVal('accusedAlias', docData.firstAlias || docData.secondAlias);
    setIfVal('accusedAge', docData.physicalFeatures?.dob);
    setIfVal('accusedAddress', docData.presentAddress || docData.permanentAddress);
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
    // Shared fields across Remand, Medical, Lockup, Permission, Notices, Sanha
    setIfVal('crimeNo', docData.crimeNo || docData.firNo);
    setIfVal('policeStation', docData.psName || docData.policeStationHeader || docData.policeStation || docData.sendingStation);
    setIfVal('year', docData.year);
    setIfVal('date', docData.letterDate || docData.noticeDate || docData.entryDate || docData.date || docData.complaintDate);
    setIfVal('actsSections', docData.actsSections);
    setIfVal('courtName', docData.courtName);

    // Accused details
    setIfVal('accusedName', docData.accusedName);
    setIfVal('accusedAge', docData.accusedAge);
    setIfVal('accusedAddress', docData.accusedAddress);
    setIfVal('accusedAlias', docData.accusedAlias);
    setIfVal('accusedFather', docData.accusedFather);

    if (docId !== 'form3' && docId !== 'notice_47' && docId !== 'notice_48') {
      if (Array.isArray(docData.additionalAccused) && docData.additionalAccused.length > 0) {
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
          extracted.additionalAccused = validAdditional;
        }
      }
    }

    // Arrest details
    setIfVal('arrestDate', docData.arrestDate);
    setIfVal('arrestTime', docData.arrestTime);
    setIfVal('arrestDateTime', docData.arrestDateTime);
    if ((docData.arrestDate || docData.arrestTime) && !extracted.arrestDateTime) {
      setIfVal('arrestDateTime', `दिनांक ${docData.arrestDate || ''} चे ${docData.arrestTime || ''} वा.`);
    }

    // Investigating Officer details
    setIfVal('ioName', docData.ioName || docData.officerName);
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

    // Permission to arrest specific handling
    if (docId === 'arrest_permission' && docData.producedAccusedName && !extracted.accusedName) {
      const rawProd = docData.producedAccusedName;
      const commaIdx = rawProd.indexOf(',');
      if (commaIdx > 0) {
        setIfVal('accusedName', rawProd.slice(0, commaIdx).trim());
      } else {
        setIfVal('accusedName', rawProd.trim());
      }
    }
  }

  return extracted;
}

/**
 * Merges shared fields into target document data.
 * IMPORTANT: Only populates EMPTY fields. Never overwrites existing non-empty values.
 */
export function applySharedDetailsToDoc(docId, targetDocData = {}, sharedPool = {}) {
  const updated = { ...targetDocData };

  const isEmpty = (val) => {
    return val === undefined || val === null || (typeof val === 'string' && val.trim() === '');
  };

  // Crime / FIR Number
  if (sharedPool.crimeNo) {
    if (docId === 'form3') {
      if (isEmpty(updated.firNo)) updated.firNo = sharedPool.crimeNo;
    } else {
      if (isEmpty(updated.crimeNo)) updated.crimeNo = sharedPool.crimeNo;
    }
  }

  // Police Station / Station Header / Sending Station
  if (sharedPool.policeStation) {
    if (docId === 'form3') {
      if (isEmpty(updated.policeStation)) updated.policeStation = sharedPool.policeStation;
    } else if (docId === 'remand') {
      if (isEmpty(updated.psName)) updated.psName = sharedPool.policeStation;
      if (isEmpty(updated.policeStationHeader)) updated.policeStationHeader = sharedPool.policeStation;
    } else if (docId === 'arrest_permission') {
      if (isEmpty(updated.policeStationHeader)) updated.policeStationHeader = sharedPool.policeStation;
    } else if (docId === 'medical') {
      if (isEmpty(updated.policeStation)) updated.policeStation = sharedPool.policeStation;
    } else if (docId === 'lockup_ps' || docId === 'lockup_acp' || docId === 'custody_transfer') {
      if (isEmpty(updated.sendingStation)) updated.sendingStation = sharedPool.policeStation;
    } else {
      if (isEmpty(updated.psName)) updated.psName = sharedPool.policeStation;
    }
  }

  // Year
  if (sharedPool.year && isEmpty(updated.year)) {
    updated.year = sharedPool.year;
  }

  // Date
  if (sharedPool.date) {
    if (docId === 'form3') {
      if (isEmpty(updated.date)) updated.date = sharedPool.date;
    } else if (updated.letterDate !== undefined && isEmpty(updated.letterDate)) {
      updated.letterDate = sharedPool.date;
    }
  }

  // Acts & Sections
  if (sharedPool.actsSections) {
    if (docId === 'form3') {
      if (isEmpty(updated.actsSections)) updated.actsSections = sharedPool.actsSections;
      if (isEmpty(updated.actsSectionsMr)) updated.actsSectionsMr = sharedPool.actsSections;
    } else {
      if (isEmpty(updated.actsSections)) updated.actsSections = sharedPool.actsSections;
    }
  }

  // Court Name
  if (sharedPool.courtName) {
    if (updated.courtName !== undefined && isEmpty(updated.courtName)) {
      updated.courtName = sharedPool.courtName;
    }
  }

  // Accused Name
  if (sharedPool.accusedName) {
    if (docId === 'arrest_permission') {
      if (isEmpty(updated.producedAccusedName)) {
        const agePart = sharedPool.accusedAge ? `, वय ${sharedPool.accusedAge} वर्षे` : '';
        const addrPart = sharedPool.accusedAddress ? `, पत्ता – ${sharedPool.accusedAddress}` : '';
        updated.producedAccusedName = `${sharedPool.accusedName}${agePart}${addrPart}`;
      }
      if (isEmpty(updated.accusedListText)) {
        const agePart = sharedPool.accusedAge ? `, वय ${sharedPool.accusedAge} वर्षे` : '';
        const addrPart = sharedPool.accusedAddress ? `, पत्ता – ${sharedPool.accusedAddress}` : '';
        updated.accusedListText = `१) ${sharedPool.accusedName}${agePart}${addrPart}`;
      }
    } else {
      if (isEmpty(updated.accusedName)) updated.accusedName = sharedPool.accusedName;
    }
  }

  // Accused Age
  if (sharedPool.accusedAge && docId !== 'arrest_permission') {
    if (docId === 'form3') {
      if (updated.physicalFeatures && isEmpty(updated.physicalFeatures.dob)) {
        updated.physicalFeatures = { ...updated.physicalFeatures, dob: sharedPool.accusedAge };
      }
    } else {
      if (isEmpty(updated.accusedAge)) updated.accusedAge = sharedPool.accusedAge;
    }
  }

  // Accused Address
  if (sharedPool.accusedAddress && docId !== 'arrest_permission') {
    if (docId === 'form3') {
      if (isEmpty(updated.presentAddress)) updated.presentAddress = sharedPool.accusedAddress;
      if (isEmpty(updated.permanentAddress)) updated.permanentAddress = sharedPool.accusedAddress;
    } else {
      if (isEmpty(updated.accusedAddress)) updated.accusedAddress = sharedPool.accusedAddress;
    }
  }

  // Accused Alias & Father
  if (sharedPool.accusedAlias) {
    if (docId === 'form3') {
      if (isEmpty(updated.firstAlias)) updated.firstAlias = sharedPool.accusedAlias;
    } else if (updated.accusedAlias !== undefined && isEmpty(updated.accusedAlias)) {
      updated.accusedAlias = sharedPool.accusedAlias;
    }
  }

  if (sharedPool.accusedFather) {
    if (docId === 'form3') {
      if (isEmpty(updated.fatherName)) updated.fatherName = sharedPool.accusedFather;
    } else if (updated.accusedFather !== undefined && isEmpty(updated.accusedFather)) {
      updated.accusedFather = sharedPool.accusedFather;
    }
  }

  // Additional Accused (Strictly for multi-accused documents only)
  if (docId !== 'form3' && docId !== 'notice_47' && docId !== 'notice_48') {
    if (Array.isArray(sharedPool.additionalAccused) && sharedPool.additionalAccused.length > 0) {
      if (!Array.isArray(updated.additionalAccused) || updated.additionalAccused.length === 0) {
        updated.additionalAccused = sharedPool.additionalAccused.map((a) => ({ ...a }));
      }
    }
  }

  // Arrest Date & Time
  if (sharedPool.arrestDate) {
    if (updated.arrestDate !== undefined && isEmpty(updated.arrestDate)) {
      updated.arrestDate = sharedPool.arrestDate;
    }
  }
  if (sharedPool.arrestTime) {
    if (updated.arrestTime !== undefined && isEmpty(updated.arrestTime)) {
      updated.arrestTime = sharedPool.arrestTime;
    }
  }
  if (sharedPool.arrestDateTime) {
    if (updated.arrestDateTime !== undefined && isEmpty(updated.arrestDateTime)) {
      updated.arrestDateTime = sharedPool.arrestDateTime;
    }
  } else if ((sharedPool.arrestDate || sharedPool.arrestTime) && updated.arrestDateTime !== undefined && isEmpty(updated.arrestDateTime)) {
    updated.arrestDateTime = `दिनांक ${sharedPool.arrestDate || ''} चे ${sharedPool.arrestTime || ''} वा.`;
  }

  // Investigating Officer details
  if (sharedPool.ioName) {
    if (docId === 'form3') {
      if (isEmpty(updated.officerName)) updated.officerName = sharedPool.ioName;
    } else {
      if (isEmpty(updated.ioName)) updated.ioName = sharedPool.ioName;
    }
  }

  if (sharedPool.ioRank) {
    if (docId === 'form3') {
      if (isEmpty(updated.officerRank)) updated.officerRank = sharedPool.ioRank;
    } else {
      if (isEmpty(updated.ioRank)) updated.ioRank = sharedPool.ioRank;
    }
  }

  if (sharedPool.ioStation) {
    if (docId === 'form3') {
      if (isEmpty(updated.place)) updated.place = sharedPool.ioStation;
    } else {
      if (updated.ioStation !== undefined && isEmpty(updated.ioStation)) {
        updated.ioStation = sharedPool.ioStation;
      }
      if (updated.policeStationHeader !== undefined && isEmpty(updated.policeStationHeader)) {
        updated.policeStationHeader = sharedPool.ioStation;
      }
    }
  }

  const buckleVal = sharedPool.ioBuckleNo || sharedPool.ioBeltNo;
  if (buckleVal) {
    if (docId === 'form3') {
      if (isEmpty(updated.officerNo)) updated.officerNo = buckleVal;
    } else {
      if (updated.ioBuckleNo !== undefined && isEmpty(updated.ioBuckleNo)) {
        updated.ioBuckleNo = buckleVal;
      } else if (updated.ioBuckleNo === undefined && isEmpty(updated.ioBeltNo)) {
        updated.ioBuckleNo = buckleVal;
      }
      if (updated.ioBeltNo !== undefined && isEmpty(updated.ioBeltNo)) {
        updated.ioBeltNo = buckleVal;
      }
    }
  }

  if (sharedPool.ioPhone && updated.ioPhone !== undefined && isEmpty(updated.ioPhone)) {
    updated.ioPhone = sharedPool.ioPhone;
  }

  // Complainant details
  if (sharedPool.complainantName && updated.complainantName !== undefined && isEmpty(updated.complainantName)) {
    updated.complainantName = sharedPool.complainantName;
  }
  if (sharedPool.complainantAge && updated.complainantAge !== undefined && isEmpty(updated.complainantAge)) {
    updated.complainantAge = sharedPool.complainantAge;
  }
  if (sharedPool.complainantProfession && updated.complainantProfession !== undefined && isEmpty(updated.complainantProfession)) {
    updated.complainantProfession = sharedPool.complainantProfession;
  }
  if (sharedPool.complainantAddress && updated.complainantAddress !== undefined && isEmpty(updated.complainantAddress)) {
    updated.complainantAddress = sharedPool.complainantAddress;
  }

  // Case narration & grounds of arrest
  if (sharedPool.caseBrief && updated.caseBrief !== undefined && isEmpty(updated.caseBrief)) {
    updated.caseBrief = sharedPool.caseBrief;
  }
  if (sharedPool.groundsOfArrest && updated.groundsOfArrest !== undefined && isEmpty(updated.groundsOfArrest)) {
    updated.groundsOfArrest = sharedPool.groundsOfArrest;
  }

  // Bank details
  if (sharedPool.bankName) {
    if (updated.bankName !== undefined && isEmpty(updated.bankName)) updated.bankName = sharedPool.bankName;
  }
  if (sharedPool.accountNo) {
    if (updated.accountNo !== undefined && isEmpty(updated.accountNo)) updated.accountNo = sharedPool.accountNo;
    if (updated.bankAccountNo !== undefined && isEmpty(updated.bankAccountNo)) updated.bankAccountNo = sharedPool.accountNo;
  }
  if (sharedPool.branchName) {
    if (updated.branchName !== undefined && isEmpty(updated.branchName)) updated.branchName = sharedPool.branchName;
    if (updated.bankBranch !== undefined && isEmpty(updated.bankBranch)) updated.bankBranch = sharedPool.branchName;
  }
  if (sharedPool.txnId) {
    if (updated.txnId !== undefined && isEmpty(updated.txnId)) updated.txnId = sharedPool.txnId;
    if (updated.txnIdUtr !== undefined && isEmpty(updated.txnIdUtr)) updated.txnIdUtr = sharedPool.txnId;
  }
  if (sharedPool.txnAmount) {
    if (updated.txnAmount !== undefined && isEmpty(updated.txnAmount)) updated.txnAmount = sharedPool.txnAmount;
  }
  if (sharedPool.accountName) {
    if (updated.accountName !== undefined && isEmpty(updated.accountName)) updated.accountName = sharedPool.accountName;
    if (updated.accountHolderName !== undefined && isEmpty(updated.accountHolderName)) updated.accountHolderName = sharedPool.accountName;
  }
  if (sharedPool.accountAddress) {
    if (updated.accountAddress !== undefined && isEmpty(updated.accountAddress)) updated.accountAddress = sharedPool.accountAddress;
    if (updated.bankAddress !== undefined && isEmpty(updated.bankAddress)) updated.bankAddress = sharedPool.accountAddress;
  }
  if (sharedPool.companyName && updated.companyName !== undefined && isEmpty(updated.companyName)) {
    updated.companyName = sharedPool.companyName;
  }
  if (sharedPool.directorsDetails) {
    if (updated.directorsDetails !== undefined && isEmpty(updated.directorsDetails)) updated.directorsDetails = sharedPool.directorsDetails;
    if (updated.companyDirectors !== undefined && isEmpty(updated.companyDirectors)) updated.companyDirectors = sharedPool.directorsDetails;
  }
  if (sharedPool.totalFraudAmount) {
    if (updated.totalFraudAmount !== undefined && isEmpty(updated.totalFraudAmount)) updated.totalFraudAmount = sharedPool.totalFraudAmount;
  }

  // Relative details
  if (sharedPool.relativeName) {
    if (updated.relativeName !== undefined && isEmpty(updated.relativeName)) updated.relativeName = sharedPool.relativeName;
    if (docId === 'form3' && isEmpty(updated.relativeIntimatedName)) updated.relativeIntimatedName = sharedPool.relativeName;
  }
  if (sharedPool.relation) {
    if (updated.relation !== undefined && isEmpty(updated.relation)) updated.relation = sharedPool.relation;
    if (updated.relativeRelation !== undefined && isEmpty(updated.relativeRelation)) updated.relativeRelation = sharedPool.relation;
  }
  if (sharedPool.relativeAddress && updated.relativeAddress !== undefined && isEmpty(updated.relativeAddress)) {
    updated.relativeAddress = sharedPool.relativeAddress;
  }
  if (sharedPool.relativePhone && updated.relativePhone !== undefined && isEmpty(updated.relativePhone)) {
    updated.relativePhone = sharedPool.relativePhone;
  }
  if (sharedPool.relativeIntimation && updated.relativeIntimation !== undefined && isEmpty(updated.relativeIntimation)) {
    updated.relativeIntimation = sharedPool.relativeIntimation;
  } else if (sharedPool.relativeName && updated.relativeIntimation !== undefined && isEmpty(updated.relativeIntimation)) {
    const relPart = sharedPool.relation ? `${sharedPool.relation} ` : '';
    const phonePart = sharedPool.relativePhone ? `, मो. ${sharedPool.relativePhone}` : '';
    updated.relativeIntimation = `${relPart}${sharedPool.relativeName}${phonePart}`;
  }

  // Production Warrant / Prior Jail
  if (sharedPool.productionWarrantDetails) {
    if (updated.productionWarrantDetails !== undefined && isEmpty(updated.productionWarrantDetails)) updated.productionWarrantDetails = sharedPool.productionWarrantDetails;
    if (updated.priorProductionDetails !== undefined && isEmpty(updated.priorProductionDetails)) updated.priorProductionDetails = sharedPool.productionWarrantDetails;
    if (updated.priorCaseDetails !== undefined && isEmpty(updated.priorCaseDetails)) updated.priorCaseDetails = sharedPool.productionWarrantDetails;
  }
  if (sharedPool.producedFromJail) {
    if (updated.producedFromJail !== undefined && isEmpty(updated.producedFromJail)) updated.producedFromJail = sharedPool.producedFromJail;
    if (updated.producingAuthority !== undefined && isEmpty(updated.producingAuthority)) updated.producingAuthority = sharedPool.producedFromJail;
  }
  if (sharedPool.courtProductionDate && updated.courtProductionDate !== undefined && isEmpty(updated.courtProductionDate)) {
    updated.courtProductionDate = sharedPool.courtProductionDate;
  }

  return updated;
}

