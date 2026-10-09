/**
 * validation.js
 * Client-side validation logic for Form III Arrest / Court Surrender Form.
 * Provides clear inline error feedback without disruptive browser alerts.
 */

export function validateAccusedCode(code) {
  if (!code) return false;
  const trimmed = code.trim().toUpperCase();
  // Standard official code format: A1 to A9, B1 for 10th person, etc.
  // Supports A1-A9, B1-B9, C1-C9 or general alphanumeric code pattern
  const codeRegex = /^[A-Z][0-9]+$/i;
  // Also support Marathi format like अ1, ब1 if typed in Devanagari
  const mrRegex = /^[\u0900-\u097F][0-9\u0966-\u096F]+$/;
  return codeRegex.test(trimmed) || mrRegex.test(trimmed);
}

export function validateFormData(data) {
  const errors = {};
  const sectionErrors = {
    1: [], // Case Info
    2: [], // Arrest Details
    3: [], // Court & Status
    4: [], // Particulars of Accused
    5: [], // Physical & Injuries
    6: [], // Search & Intimation
    7: [], // Socio-Economic & Police Records
    8: []  // Witnesses & Officer
  };

  // Section 1 — Case Information
  if (!data.state || !data.state.trim()) {
    errors['state'] = 'State (राज्य) is required';
    sectionErrors[1].push('State');
  }
  if (!data.district || !data.district.trim()) {
    errors['district'] = 'District (जिल्हा) is required';
    sectionErrors[1].push('District');
  }
  if (!data.policeStation || !data.policeStation.trim()) {
    errors['policeStation'] = 'Police Station (पोलीस ठाणे) is required';
    sectionErrors[1].push('Police Station');
  }
  if (!data.firNo || !data.firNo.trim()) {
    errors['firNo'] = 'FIR / Proceeding / G.D. No. is required';
    sectionErrors[1].push('FIR / G.D. No.');
  }
  if (!data.year || !data.year.trim()) {
    errors['year'] = 'Year is required';
    sectionErrors[1].push('Year');
  }
  if (!data.date || !data.date.trim()) {
    errors['date'] = 'Date is required';
    sectionErrors[1].push('Date');
  }
  if (!data.accusedCode || !data.accusedCode.trim()) {
    errors['accusedCode'] = 'Accused Code is required (e.g., A1 to A9, B1)';
    sectionErrors[1].push('Accused Code');
  } else if (!validateAccusedCode(data.accusedCode)) {
    errors['accusedCode'] = 'Invalid format. Use format like A1, A2, B1 as specified in Form III';
    sectionErrors[1].push('Accused Code Format');
  }

  // Section 2 — Arrest Details
  if (!data.arrestDate || !data.arrestDate.trim()) {
    errors['arrestDate'] = 'Date of arrest/surrender is required';
    sectionErrors[2].push('Arrest Date');
  }
  if (!data.arrestTime || !data.arrestTime.trim()) {
    errors['arrestTime'] = 'Time of arrest/surrender is required';
    sectionErrors[2].push('Arrest Time');
  }
  if (!data.arrestPS || !data.arrestPS.trim()) {
    errors['arrestPS'] = 'Place of arrest (Police Station) is required';
    sectionErrors[2].push('Place of Arrest P.S.');
  }

  // Section 3 — Acts & Sections + Arrest Status
  if (!data.actsSections || !data.actsSections.trim()) {
    errors['actsSections'] = 'Acts and Sections (अधिनियम व कलमे) are required';
    sectionErrors[3].push('Acts and Sections');
  }
  if (data.arrestStatus === null || data.arrestStatus === undefined || data.arrestStatus === '') {
    errors['arrestStatus'] = 'Please select the applicable Arrest / Surrender status option';
    sectionErrors[3].push('Arrest Status Option');
  }

  // Section 4 — Particulars of Accused
  if (!data.accusedName || !data.accusedName.trim()) {
    errors['accusedName'] = 'Accused full name (आरोपीचे नाव) is required';
    sectionErrors[4].push('Accused Name');
  }
  if (!data.fatherName || !data.fatherName.trim()) {
    errors['fatherName'] = "Father's / Husband's / Guardian's name is required";
    sectionErrors[4].push("Father/Guardian Name");
  }
  if (!data.permanentAddress || !data.permanentAddress.trim()) {
    errors['permanentAddress'] = 'Permanent Address (कायमचा पत्ता) is required';
    sectionErrors[4].push('Permanent Address');
  }

  // Section 8 — Witnesses & Officer (At least 1 witness is mandatory as per Form III)
  if (!data.witness1Name || !data.witness1Name.trim()) {
    errors['witness1Name'] = 'Witness 1 Name is required (At least one witness necessary)';
    sectionErrors[8].push('Witness 1 Name');
  }
  if (!data.witness1Address || !data.witness1Address.trim()) {
    errors['witness1Address'] = 'Witness 1 Address is required';
    sectionErrors[8].push('Witness 1 Address');
  }
  if (!data.officerName || !data.officerName.trim()) {
    errors['officerName'] = 'Investigation Officer Name is required';
    sectionErrors[8].push('Officer Name');
  }
  if (!data.officerRank || !data.officerRank.trim()) {
    errors['officerRank'] = 'Investigation Officer Rank is required';
    sectionErrors[8].push('Officer Rank');
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    sectionErrors
  };
}
