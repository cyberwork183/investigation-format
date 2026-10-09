/**
 * shareDetails.js
 * Minimal, reliable shared-details pool for all police document forms.
 * All data remains 100% client-side in the browser.
 */

const STORAGE_KEY = 'POLICE_SHARED_DETAILS_POOL_V1';

/**
 * Get stored shared details pool from localStorage
 */
export function getStoredSharedDetails() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Failed to load shared details from storage:', err);
    return {};
  }
}

/**
 * Save shared details pool to localStorage
 */
export function saveStoredSharedDetails(sharedObj) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sharedObj));
  } catch (err) {
    console.error('Failed to save shared details to storage:', err);
  }
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
    setIfVal('crimeNo', docData.firNo);
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
    setIfVal('ioName', docData.officerName);
    setIfVal('ioRank', docData.officerRank);
    setIfVal('ioStation', docData.place);
    setIfVal('ioBeltNo', docData.officerNo);
  } else {
    setIfVal('crimeNo', docData.crimeNo);
    setIfVal('policeStation', docData.psName || docData.policeStationHeader);
    setIfVal('year', docData.year);
    setIfVal('date', docData.letterDate);
    setIfVal('actsSections', docData.actsSections);
    setIfVal('courtName', docData.courtName);
    setIfVal('accusedName', docData.accusedName);
    setIfVal('accusedAge', docData.accusedAge);
    setIfVal('accusedAddress', docData.accusedAddress);
    setIfVal('accusedAlias', docData.accusedAlias);
    setIfVal('accusedFather', docData.accusedFather);
    setIfVal('arrestDate', docData.arrestDate);
    setIfVal('arrestTime', docData.arrestTime);
    setIfVal('arrestDateTime', docData.arrestDateTime);
    setIfVal('ioName', docData.ioName);
    setIfVal('ioRank', docData.ioRank);
    setIfVal('ioStation', docData.ioStation);
    setIfVal('ioBeltNo', docData.ioBeltNo);
    setIfVal('ioPhone', docData.ioPhone);
    setIfVal('complainantName', docData.complainantName);
    setIfVal('complainantAge', docData.complainantAge);
    setIfVal('complainantProfession', docData.complainantProfession);
    setIfVal('complainantAddress', docData.complainantAddress);

    // Permission to arrest specific handling
    if (docId === 'arrest_permission' && docData.producedAccusedName && !extracted.accusedName) {
      setIfVal('accusedName', docData.producedAccusedName);
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

  // Police Station
  if (sharedPool.policeStation) {
    if (docId === 'form3') {
      if (isEmpty(updated.policeStation)) updated.policeStation = sharedPool.policeStation;
    } else if (docId === 'remand') {
      if (isEmpty(updated.psName)) updated.psName = sharedPool.policeStation;
      if (isEmpty(updated.policeStationHeader)) updated.policeStationHeader = sharedPool.policeStation;
    } else {
      if (isEmpty(updated.psName)) updated.psName = sharedPool.policeStation;
    }
  }

  // Year
  if (sharedPool.year && isEmpty(updated.year)) {
    updated.year = sharedPool.year;
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
    if (docId === 'form3' || docId === 'remand' || docId === 'arrest_permission') {
      if (isEmpty(updated.courtName)) updated.courtName = sharedPool.courtName;
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

  // Arrest Date & Time
  if (sharedPool.arrestDate) {
    if (docId === 'form3' || docId === 'medical' || docId === 'lockup_ps' || docId === 'lockup_acp' || docId === 'custody_transfer') {
      if (isEmpty(updated.arrestDate)) updated.arrestDate = sharedPool.arrestDate;
    }
  }
  if (sharedPool.arrestTime) {
    if (docId === 'form3' || docId === 'medical' || docId === 'lockup_ps' || docId === 'lockup_acp' || docId === 'custody_transfer') {
      if (isEmpty(updated.arrestTime)) updated.arrestTime = sharedPool.arrestTime;
    }
  }
  if (docId === 'remand') {
    if (sharedPool.arrestDateTime && isEmpty(updated.arrestDateTime)) {
      updated.arrestDateTime = sharedPool.arrestDateTime;
    } else if ((sharedPool.arrestDate || sharedPool.arrestTime) && isEmpty(updated.arrestDateTime)) {
      updated.arrestDateTime = `दिनांक ${sharedPool.arrestDate || ''} चे ${sharedPool.arrestTime || ''} वा.`;
    }
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
      if (isEmpty(updated.ioStation)) updated.ioStation = sharedPool.ioStation;
    }
  }

  if (sharedPool.ioBeltNo) {
    if (docId === 'form3') {
      if (isEmpty(updated.officerNo)) updated.officerNo = sharedPool.ioBeltNo;
    } else if (updated.ioBeltNo !== undefined && isEmpty(updated.ioBeltNo)) {
      updated.ioBeltNo = sharedPool.ioBeltNo;
    }
  }

  if (sharedPool.ioPhone && updated.ioPhone !== undefined && isEmpty(updated.ioPhone)) {
    updated.ioPhone = sharedPool.ioPhone;
  }

  // Complainant details (for Remand)
  if (docId === 'remand') {
    if (sharedPool.complainantName && isEmpty(updated.complainantName)) {
      updated.complainantName = sharedPool.complainantName;
    }
    if (sharedPool.complainantAge && isEmpty(updated.complainantAge)) {
      updated.complainantAge = sharedPool.complainantAge;
    }
    if (sharedPool.complainantProfession && isEmpty(updated.complainantProfession)) {
      updated.complainantProfession = sharedPool.complainantProfession;
    }
    if (sharedPool.complainantAddress && isEmpty(updated.complainantAddress)) {
      updated.complainantAddress = sharedPool.complainantAddress;
    }
  }

  return updated;
}
