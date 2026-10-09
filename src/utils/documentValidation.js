/**
 * documentValidation.js
 * Validation rules for all official police documents.
 */

import { validateFormData as validateForm3 } from './validation.js';

export { validateForm3 };

export function validateRemandData(data) {
  const errors = {};

  if (!data.policeStationHeader?.trim()) errors.policeStationHeader = 'पोलीस ठाणे आवश्यक आहे / Police station required';
  if (!data.courtName?.trim()) errors.courtName = 'न्यायालयाचे नाव आवश्यक आहे / Court name required';
  if (!data.remandDays || parseInt(data.remandDays) < 1) errors.remandDays = 'कोठडीचे दिवस आवश्यक आहेत / Remand days required';
  if (!data.crimeNo?.trim()) errors.crimeNo = 'अपराध क्रमांक आवश्यक आहे / Crime number required';
  if (!data.actsSections?.trim()) errors.actsSections = 'कलमे आवश्यक आहेत / Acts & sections required';
  if (!data.complainantName?.trim()) errors.complainantName = 'फिर्यादीचे नाव आवश्यक आहे / Complainant name required';
  if (!data.accusedName?.trim()) errors.accusedName = 'आरोपीचे नाव आवश्यक आहे / Accused name required';
  if (!data.ioName?.trim()) errors.ioName = 'तपासी अधिकाऱ्याचे नाव आवश्यक आहे / IO name required';

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateMedicalData(data) {
  const errors = {};

  if (!data.letterDate?.trim()) errors.letterDate = 'तारीख आवश्यक आहे / Date required';
  if (!data.addresseeHospital?.trim()) errors.addresseeHospital = 'रुग्णालयाचे नाव आवश्यक आहे / Hospital required';
  if (!data.policeStation?.trim()) errors.policeStation = 'पोलीस ठाणे आवश्यक आहे / Police station required';
  if (!data.crimeNo?.trim()) errors.crimeNo = 'अपराध क्रमांक आवश्यक आहे / Crime number required';
  if (!data.actsSections?.trim()) errors.actsSections = 'कलमे आवश्यक आहेत / Acts & sections required';
  if (!data.accusedName?.trim()) errors.accusedName = 'आरोपीचे नाव आवश्यक आहे / Accused name required';

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateLockupPsData(data) {
  const errors = {};

  if (!data.letterDate?.trim()) errors.letterDate = 'तारीख आवश्यक आहे / Date required';
  if (!data.addresseeStation?.trim()) errors.addresseeStation = 'प्रति पोलीस ठाणे आवश्यक आहे / Addressee PS required';
  if (!data.sendingStation?.trim()) errors.sendingStation = 'पाठविणारे पोलीस ठाणे आवश्यक आहे / Sending PS required';
  if (!data.crimeNo?.trim()) errors.crimeNo = 'अपराध क्रमांक आवश्यक आहे / Crime number required';
  if (!data.actsSections?.trim()) errors.actsSections = 'कलमे आवश्यक आहेत / Acts & sections required';
  if (!data.accusedName?.trim()) errors.accusedName = 'आरोपीचे नाव आवश्यक आहे / Accused name required';

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateLockupAcpData(data) {
  const errors = {};

  if (!data.letterDate?.trim()) errors.letterDate = 'तारीख आवश्यक आहे / Date required';
  if (!data.addresseeOffice?.trim()) errors.addresseeOffice = 'प्रति कार्यालय आवश्यक आहे / Addressee office required';
  if (!data.sendingStation?.trim()) errors.sendingStation = 'पोलीस ठाणे आवश्यक आहे / Sending PS required';
  if (!data.crimeNo?.trim()) errors.crimeNo = 'अपराध क्रमांक आवश्यक आहे / Crime number required';
  if (!data.actsSections?.trim()) errors.actsSections = 'कलमे आवश्यक आहेत / Acts & sections required';
  if (!data.accusedName?.trim()) errors.accusedName = 'आरोपीचे नाव आवश्यक आहे / Accused name required';

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateCustodyTransferData(data) {
  const errors = {};

  if (!data.letterDate?.trim()) errors.letterDate = 'तारीख आवश्यक आहे / Date required';
  if (!data.addresseeStation?.trim()) errors.addresseeStation = 'प्रति पोलीस ठाणे आवश्यक आहे / Addressee PS required';
  if (!data.sendingStation?.trim()) errors.sendingStation = 'पोलीस ठाणे आवश्यक आहे / Sending PS required';
  if (!data.crimeNo?.trim()) errors.crimeNo = 'अपराध क्रमांक आवश्यक आहे / Crime number required';
  if (!data.actsSections?.trim()) errors.actsSections = 'कलमे आवश्यक आहेत / Acts & sections required';
  if (!data.accusedName?.trim()) errors.accusedName = 'आरोपीचे नाव आवश्यक आहे / Accused name required';

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateArrestPermissionData(data) {
  const errors = {};

  if (!data.letterDate?.trim()) errors.letterDate = 'तारीख आवश्यक आहे / Date required';
  if (!data.courtName?.trim()) errors.courtName = 'न्यायालय आवश्यक आहे / Court name required';
  if (!data.crimeNo?.trim()) errors.crimeNo = 'अपराध क्रमांक आवश्यक आहे / Crime number required';
  if (!data.actsSections?.trim()) errors.actsSections = 'कलमे आवश्यक आहेत / Acts & sections required';
  if (!data.producedAccusedName?.trim() && !data.accusedListText?.trim()) {
    errors.producedAccusedName = 'आरोपीचे नाव आवश्यक आहे / Accused name required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateNotice352Data(data) {
  const errors = {};
  if (!data.letterDate?.trim()) errors.letterDate = 'तारीख आवश्यक आहे / Date required';
  if (!data.courtName?.trim()) errors.courtName = 'न्यायालय आवश्यक आहे / Court name required';
  if (!data.crimeNo?.trim()) errors.crimeNo = 'अपराध क्रमांक आवश्यक आहे / Crime number required';
  if (!data.accusedName?.trim()) errors.accusedName = 'आरोपीचे नाव आवश्यक आहे / Accused name required';
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateAtakSanhaData(data) {
  const errors = {};
  if (!data.letterDate?.trim()) errors.letterDate = 'तारीख आवश्यक आहे / Date required';
  if (!data.crimeNo?.trim()) errors.crimeNo = 'अपराध क्रमांक आवश्यक आहे / Crime number required';
  if (!data.accusedName?.trim()) errors.accusedName = 'आरोपीचे नाव आवश्यक आहे / Accused name required';
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateNotice47Data(data) {
  const errors = {};
  if (!data.letterDate?.trim()) errors.letterDate = 'तारीख आवश्यक आहे / Date required';
  if (!data.crimeNo?.trim()) errors.crimeNo = 'अपराध क्रमांक आवश्यक आहे / Crime number required';
  if (!data.accusedName?.trim()) errors.accusedName = 'आरोपीचे नाव आवश्यक आहे / Accused name required';
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateNotice48Data(data) {
  const errors = {};
  if (!data.letterDate?.trim()) errors.letterDate = 'तारीख आवश्यक आहे / Date required';
  if (!data.crimeNo?.trim()) errors.crimeNo = 'अपराध क्रमांक आवश्यक आहे / Crime number required';
  if (!data.accusedName?.trim()) errors.accusedName = 'आरोपीचे नाव आवश्यक आहे / Accused name required';
  if (!data.relativeName?.trim()) errors.relativeName = 'नातेवाईकाचे नाव आवश्यक आहे / Relative name required';
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateDocument(docId, data) {
  switch (docId) {
    case 'form3':
      return validateForm3(data);
    case 'remand':
      return validateRemandData(data);
    case 'medical':
      return validateMedicalData(data);
    case 'lockup_ps':
      return validateLockupPsData(data);
    case 'lockup_acp':
      return validateLockupAcpData(data);
    case 'custody_transfer':
      return validateCustodyTransferData(data);
    case 'arrest_permission':
      return validateArrestPermissionData(data);
    case 'notice_35_2':
      return validateNotice352Data(data);
    case 'atak_sanha':
      return validateAtakSanhaData(data);
    case 'notice_47':
      return validateNotice47Data(data);
    case 'notice_48':
      return validateNotice48Data(data);
    default:
      return { isValid: true, errors: {} };
  }
}
