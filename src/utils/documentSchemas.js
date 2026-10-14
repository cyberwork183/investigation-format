/**
 * documentSchemas.js
 * Default state models, sample test data, and local draft persistence for all official police documents.
 */

import {
  getDefaultFormData as getDefaultForm3Data,
  getSampleFormData as getSampleForm3Data,
  saveDraftToLocalStorage as saveForm3Draft,
  loadDraftFromLocalStorage as loadForm3Draft,
  clearDraftFromLocalStorage as clearForm3Draft
} from './formData.js';

export {
  getDefaultForm3Data,
  getSampleForm3Data,
  saveForm3Draft,
  loadForm3Draft,
  clearForm3Draft
};

// Helper: Format current date to DD-MM-YYYY
export function getCurrentDateStr() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

// -------------------------------------------------------------
// 1. POLICE CUSTODY REMAND APPLICATION (PCR)
// -------------------------------------------------------------
export const DEFAULT_INVESTIGATION_POINTS = [
  'आरोपीच्या कंपनीच्या बँक खात्याचा वापर कशा प्रकारे करण्यात आला आहे, याबाबत तपास करणे आवश्यक आहे.',
  'पीडितेशी शासकीय अधिकारी बनून कोणी संवाद साधला, तसेच तिला बनावट वॉरंट व इतर कागदपत्रे कोणी आणि कुठून पाठवली, याबाबत तपास करणे आवश्यक आहे.',
  'या खात्यामध्ये पैसे कोणाच्या सांगण्यावरून पाठवण्यात आले, याबाबत पुढील तपास अद्याप बाकी आहे.',
  'आरोपीने अशा प्रकारचे आणखी किती गुन्हे केले आहेत, हे निश्चित करण्यासाठी पुढील तपास करणे बाकी आहे.',
  'या गुन्ह्यांमध्ये आरोपीसोबत आणखी कोण-कोण सामील आहे, याबाबत तपास करणे अद्याप बाकी आहे.',
  'या गुन्ह्यात आणखी कोण-कोण सामील आहे, हे शोधण्यासाठी आणि त्यांना अटक करण्यासाठी पुढील तपासाची आवश्यकता आहे.',
  'गुन्ह्याचे भौतिक व तांत्रिक पुरावे जप्त करणे आवश्यक आहे.'
];

export function getDefaultRemandData() {
  return {
    letterDate: getCurrentDateStr(),
    policeStationHeader: 'पोलीस ठाणे सायबर नागपूर शहर',
    courtName: 'माननीय न्यायदंडाधिकारी, प्रथम वर्ग, न्यायालय क्रमांक 10, नागपूर शहर',
    remandDays: '5',
    throughProsecutor: 'सहा. सरकारी अभियोक्ता, न्यायालय प्रथमवर्ग क्रमांक 10, नागपुर शहर',
    ioName: '',
    ioRank: 'वरीष्ठ पोलीस निरीक्षक',
    ioBuckleNo: '',
    ioStation: 'पोलीस ठाणे सायबर, नागपूर शहर',

    // Summary Table (11 points)
    psName: 'पोलीस स्टेशन सायबर, नागपूर शहर',
    crimeNo: '',
    year: new Date().getFullYear().toString(),
    actsSections: 'भारतीय न्याय संहीता कलम 318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS सह कलम 66(क), 66(ड) माहिती तंत्रज्ञान अधिनियम 2000',
    complainantName: '',
    complainantAge: '',
    complainantProfession: '',
    complainantAddress: '',
    accusedName: '',
    accusedAge: '',
    accusedAddress: '',
    arrestDateTime: '',
    crimeScene: '',
    incidentDateTime: '',
    filingDateTime: '',

    // Investigation & Arrest Details (Order: Brief Facts, Grounds of Arrest)
    caseBrief: '',
    groundsOfArrest: '',

    // Production Warrant / Prior Case
    priorProductionDetails: '',

    // Grounds & Points
    relativeIntimation: '',
    refundStatusNote: '',
    remainingInvestigationPoints: [...DEFAULT_INVESTIGATION_POINTS],
    remandPrayer: 'नमुद आरोपीची वैद्यकीय तपासणी करुन मुदतीत व योग्य बंदोबस्तात मा. न्यायालयासमक्ष हजर करण्यात येत आहे, तरी वरील नमुद कारणांसाठी आरोपीची ५ दिवसांची पोलीस कोठडी मिळण्यास विनंती आहे.'
  };
}

export function getSampleRemandData() {
  return {
    letterDate: '२९-०७-२०२६',
    policeStationHeader: 'पोलीस ठाणे सायबर नागपूर शहर',
    courtName: 'माननीय न्यायदंडाधिकारी, प्रथम वर्ग, न्यायालय क्रमांक 10, नागपूर शहर',
    remandDays: '5',
    throughProsecutor: 'सहा. सरकारी अभियोक्ता, न्यायालय प्रथमवर्ग क्रमांक 10, नागपुर शहर',
    ioName: 'सुरेश डांबरे',
    ioRank: 'वरीष्ठ पोलीस निरीक्षक',
    ioBuckleNo: 'ब.क्र. ७८४५',
    ioStation: 'पोलीस ठाणे सायबर, नागपूर शहर',

    psName: 'पोलीस स्टेशन सायबर, नागपूर शहर',
    crimeNo: '38/2026',
    year: '2026',
    actsSections: 'भारतीय न्याय संहीता कलम 318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) भारतीय न्याय संहिता सह कलम 66(क), 66(ड) माहिती तंत्रज्ञान अधिनियम 2000',
    complainantName: 'श्रद्धा नथुजी झोडापे',
    complainantAge: '५०',
    complainantProfession: 'प्राकृतिक चिकीत्सा',
    complainantAddress: '९३, बेसा, रेणुका कॉलेजजवळ, नागपूर ४४००३४',
    accusedName: 'संदीप भानुदास मोरे',
    accusedAge: '४२',
    accusedAddress: 'हाऊस नं. ७५८/९, गल्ली नं. ९, अटल गेट, नेहरु नगर, इंदौर, मध्य प्रदेश',
    arrestDateTime: 'दिनांक २९-०७-२०२६ चे १४:०० वा.',
    crimeScene: 'फिर्यादीचे राहते घरी',
    incidentDateTime: 'दिनांक 22/03/2026 चे 10:04 ते दि. 24/03/2026 चे 09:00 वा. पावेतो',
    filingDateTime: 'दि. 27/03/2026',

    caseBrief: 'दिनांक २२-०३-२०२६ रोजी सकाळी १०.०४ वा. ते दिनांक २४-०४-२०२६ रोजी ०९.०० वाजेपर्यंत माझ्या नावावर सिम कार्ड, बँक खाते उघडलेले आहे व त्याचा वापर आतंकवादामध्ये झालेला आहे, तसेच माझ्या नावावर गुन्हा दाखल झालेला आहे व त्यामध्ये अरेस्ट वॉरंट निघाले आहे माझ्या नावाचे बनावट अरेस्ट वारंट मला पाठवून आम्हाला डिजिटली अरेस्ट करण्यात येत असे सांगून आम्हाला घाबरवण्यात व धमकावण्यात आले, तसेच खात्यावरील पैशांची पडताळणी करून पैसे परत पाठवण्यात येतील अशी खोटी बतावणी करुन शासकीय खाते आहे असे खोटे सांगून देण्यात आलेल्या बॅंक खात्यामध्ये एकूण ₹13,00,100 पाठविण्यास भाग पाडून फसवणूक करण्यात आलेली आहे.',
    groundsOfArrest: '१) तपासादरम्यान निष्पन्न झाले की आरोपीने गुन्ह्यातील फसवणूक झालेली रक्कम स्वीकारण्यात व हस्तांतरित करण्यात सक्रिय सहभाग घेतला आहे.\n२) आरोपीने गुन्ह्याशी संबंधित तांत्रिक पुरावे नष्ट करण्याचा प्रयत्न केला असून साक्षीदारांवर प्रभाव पाडण्याची शक्यता नाकारता येत नाही.\n३) गुन्ह्याचा सखोल तपास करण्यासाठी व गुन्ह्यात सामील असलेल्या इतर साथीदारांचा शोध घेण्यासाठी आरोपीची उपस्थिती आवश्यक आहे.',

    priorProductionDetails: 'सदर आरोपी नामे संदीप भानुदास मोरे व अजय पि. पुरुषोत्तम सिंह तोमर यांना सायबर क्राइम पोलीस ठाणे, गौतम बुद्ध नगर FIR No. 34/2026 मध्ये अटक केली होती. सदर आरोपी जिल्हा कारागृह गौतम बुद्ध नगर येथे न्यायालयीन कोठडीत असताना मा. न्यायालयाकडुन प्रोडक्शन वारंट मिळवून कारागृह पोलीस तिहार यांनी मा. न्यायालयासमक्ष हजर केले आहे.',
    relativeIntimation: 'आरोपीचा भाऊ श्री. मंगेश भानुदास मोरे (मोबा. ९८XXXXXXXX)',
    refundStatusNote: 'तसेच आरोपी डायरेक्टर असलेल्या IndusInd Bank खाते क्रमांक 259109855949 (Annkutgrains Private Limited) या खात्यातुन मा. न्यायालयाच्या आदेशानुसार फिर्यादीस फसवणुकीची रुपये 13,00,000/- (अक्षरी तेरा लाख रुपये) रक्कम परत करण्यात आलेली आहे.',
    remainingInvestigationPoints: [...DEFAULT_INVESTIGATION_POINTS],
    remandPrayer: 'नमुद आरोपीची वैद्यकीय तपासणी करुन मुदतीत व योग्य बंदोबस्तात मा. न्यायालयासमक्ष हजर करण्यात येत आहे, तरी वरील नमुद कारणांसाठी आरोपीची ५ दिवसांची पोलीस कोठडी मिळण्यास विनंती आहे.'
  };
}

// -------------------------------------------------------------
// 2. MEDICAL EXAMINATION REQUEST LETTER
// -------------------------------------------------------------
export function getDefaultMedicalData() {
  return {
    letterDate: getCurrentDateStr(),
    addresseeOfficer: 'वैद्यकीय अधिकारी,',
    addresseeHospital: 'जिल्हा सामान्य रुग्णालय,',
    addresseeCity: 'नागपूर शहर',
    policeStation: 'पोलीस ठाणे सायबर, नागपूर शहर',
    crimeNo: '',
    year: new Date().getFullYear().toString(),
    actsSections: '318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS r/w 66(c), 66(d) IT Act 2000',
    accusedStatus: 'in_custody', // 'in_custody' or 'to_be_arrested'
    accusedName: '',
    accusedAlias: '',
    accusedFather: '',
    accusedAge: '',
    accusedAddress: '',
    ioName: '',
    ioRank: 'पोलीस निरीक्षक',
    ioBuckleNo: '',
    ioStation: 'पोलीस ठाणे सायबर नागपूर शहर'
  };
}

export function getSampleMedicalData() {
  return {
    letterDate: '३०-०३-२०२६',
    addresseeOfficer: 'वैद्यकीय अधिकारी,',
    addresseeHospital: 'जिल्हा सामान्य रुग्णालय,',
    addresseeCity: 'नागपूर शहर',
    policeStation: 'पोलीस ठाणे सायबर, नागपूर शहर',
    crimeNo: '108/2025',
    year: '2025',
    actsSections: '318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS r/w 66(c), 66(d) IT Act 2000',
    accusedStatus: 'in_custody',
    accusedName: 'प्रेमसुख',
    accusedAlias: 'प्रेम',
    accusedFather: 'भाकर राम बिष्णोई',
    accusedAge: '२०',
    accusedAddress: 'जंबेश्वर नगरी, गाव मोटाई, पो. ठाणे चाखू, जि. फलोदी, राजस्थान',
    ioName: 'सुधीर पाटील',
    ioRank: 'पोलीस निरीक्षक',
    ioBuckleNo: 'ब.क्र. ५६१२',
    ioStation: 'पोलीस ठाणे सायबर नागपूर शहर'
  };
}

// -------------------------------------------------------------
// 3. LOCKUP PLACEMENT REQUEST LETTER (POLICE STATION)
// -------------------------------------------------------------
export function getDefaultLockupPsData() {
  return {
    letterDate: getCurrentDateStr(),
    addresseeRank: 'पोलीस निरीक्षक,',
    addresseeStation: 'पोलीस ठाणे सदर,',
    addresseeCity: 'नागपूर शहर',
    sendingStation: 'पोलीस ठाणे सायबर नागपूर शहर',
    crimeNo: '',
    year: new Date().getFullYear().toString(),
    actsSections: '318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS r/w 66(c), 66(d) IT Act 2000',
    accusedName: '',
    accusedAlias: '',
    accusedFather: '',
    accusedAge: '',
    accusedAddress: '',
    reasonText: 'पोलीस ठाणे सायबर नागपूर शहर येथे बंदीगृह (लॉकअप) नसल्याने सुरक्षेच्या कारणास्तव नमुद आरोपीस आपल्या पोलीस ठाण्यातील बंदिगृहात (लॉकअपमध्ये) ठेवणेबाबत विनंती आहे.',
    ioName: '',
    ioRank: 'पोलीस निरीक्षक',
    ioBuckleNo: '',
    ioStation: 'पोलीस ठाणे सायबर नागपूर शहर'
  };
}

export function getSampleLockupPsData() {
  return {
    letterDate: '२९-०३-२०२६',
    addresseeRank: 'पोलीस निरीक्षक,',
    addresseeStation: 'पोलीस ठाणे सदर,',
    addresseeCity: 'नागपूर शहर',
    sendingStation: 'पोलीस ठाणे सायबर नागपूर शहर',
    crimeNo: '108/2025',
    year: '2025',
    actsSections: '318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS r/w 66(c), 66(d) IT Act 2000',
    accusedName: 'प्रेमसुख',
    accusedAlias: 'प्रेम',
    accusedFather: 'भाकरराम बिष्णोई',
    accusedAge: '२०',
    accusedAddress: 'जंबेश्वर नगरी, मोटाई, पोलीस ठाणे चाखु, जिल्हा फलोदी, राजस्थान',
    reasonText: 'पोलीस ठाणे सायबर नागपूर शहर येथे बंदीगृह (लॉकअप) नसल्याने सुरक्षेच्या कारणास्तव नमुद आरोपीस आपल्या पोलीस ठाण्यातील बंदिगृहात (लॉकअपमध्ये) ठेवणेबाबत विनंती आहे.',
    ioName: 'सुधीर पाटील',
    ioRank: 'पोलीस निरीक्षक',
    ioBuckleNo: 'ब.क्र. ५६१२',
    ioStation: 'पोलीस ठाणे सायबर नागपूर शहर'
  };
}

// -------------------------------------------------------------
// 4. LOCKUP PLACEMENT INTIMATION LETTER (ACP)
// -------------------------------------------------------------
export function getDefaultLockupAcpData() {
  return {
    letterDate: getCurrentDateStr(),
    addresseeRank: 'मा. सहा. पोलीस आयुक्त,',
    addresseeOffice: 'गुन्हे, नागपूर शहर',
    sendingStation: 'पोलीस ठाणे सायबर, नागपूर शहर',
    crimeNo: '',
    year: new Date().getFullYear().toString(),
    actsSections: '318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS r/w 66(c), 66(d) IT Act 2000',
    accusedName: '',
    accusedAlias: '',
    accusedFather: '',
    accusedAge: '',
    accusedAddress: '',
    reasonText: 'पोलीस ठाणे सायबर नागपूर शहर येथे बंदीगृह (लॉकअप) नसल्याने सुरक्षेच्या कारणास्तव नमुद आरोपीस सदर पोलीस ठाण्यातील बंदिगृहात (लॉकअपमध्ये) ठेवणेबाबत माहिती सादर आहे.',
    ioName: '',
    ioRank: 'पोलीस निरीक्षक',
    ioBuckleNo: '',
    ioStation: 'पोलीस ठाणे सायबर नागपूर शहर'
  };
}

export function getSampleLockupAcpData() {
  return {
    letterDate: '२८-०३-२०२६',
    addresseeRank: 'मा. सहा. पोलीस आयुक्त,',
    addresseeOffice: 'गुन्हे, नागपूर शहर',
    sendingStation: 'पोलीस ठाणे सायबर, नागपूर शहर',
    crimeNo: '108/2025',
    year: '2025',
    actsSections: '318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS r/w 66(c), 66(d) IT Act 2000',
    accusedName: 'प्रेमसुख',
    accusedAlias: 'प्रेम',
    accusedFather: 'भाकरराम बिष्णोई',
    accusedAge: '२०',
    accusedAddress: 'जंबेश्वर नगरी, मोटाई, पोलीस ठाणे चाखु, जिल्हा फलोदी, राजस्थान',
    reasonText: 'पोलीस ठाणे सायबर नागपूर शहर येथे बंदीगृह (लॉकअप) नसल्याने सुरक्षेच्या कारणास्तव नमुद आरोपीस सदर पोलीस ठाण्यातील बंदिगृहात (लॉकअपमध्ये) ठेवणेबाबत माहिती सादर आहे.',
    ioName: 'सुधीर पाटील',
    ioRank: 'पोलीस निरीक्षक',
    ioBuckleNo: 'ब.क्र. ५६१२',
    ioStation: 'पोलीस ठाणे सायबर नागपूर शहर'
  };
}

// -------------------------------------------------------------
// 5. ACCUSED CUSTODY TRANSFER / RELEASE LETTER
// -------------------------------------------------------------
export function getDefaultCustodyTransferData() {
  return {
    letterDate: getCurrentDateStr(),
    addresseeRank: 'पोलीस निरीक्षक,',
    addresseeStation: 'पोलीस ठाणे सदर,',
    addresseeCity: 'नागपूर शहर',
    sendingStation: 'पोलीस ठाणे सायबर, नागपूर शहर',
    crimeNo: '',
    year: new Date().getFullYear().toString(),
    actsSections: '318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS r/w 66(c), 66(d) IT Act 2000',
    accusedName: '',
    accusedAlias: '',
    accusedFather: '',
    accusedAge: '',
    accusedAddress: '',
    custodyNote: 'हा सध्या पोलीस कोठडीत असुन त्याला आपले पोलीस ठाण्याच्या बंदीगृह (लॉकअप) मध्ये ठेवण्यात आलेले आहे.',
    prayerText: 'तरी नमुद आरोपीस पुढील तपास / मा. न्यायालयात हजर करण्यासाठी ताब्यात मिळण्यास विनंती आहे.',
    ioName: '',
    ioRank: 'पोलीस निरीक्षक',
    ioBuckleNo: '',
    ioStation: 'पोलीस ठाणे सायबर नागपूर शहर'
  };
}

export function getSampleCustodyTransferData() {
  return {
    letterDate: '२८-०३-२०२६',
    addresseeRank: 'पोलीस निरीक्षक,',
    addresseeStation: 'पोलीस ठाणे सदर,',
    addresseeCity: 'नागपूर शहर',
    sendingStation: 'पोलीस ठाणे सायबर, नागपूर शहर',
    crimeNo: '108/2025',
    year: '2025',
    actsSections: '318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS r/w 66(c), 66(d) IT Act 2000',
    accusedName: 'प्रेमसुख',
    accusedAlias: 'प्रेम',
    accusedFather: 'भाकरराम बिष्णोई',
    accusedAge: '२०',
    accusedAddress: 'जंबेश्वर नगरी, मोटाई, पोलीस ठाणे चाखु, जिल्हा फलोदी, राजस्थान',
    custodyNote: 'हा सध्या पोलीस कोठडीत असुन त्याला आपले पोलीस ठाण्याच्या बंदीगृह (लॉकअप) मध्ये ठेवण्यात आलेले आहे.',
    prayerText: 'तरी नमुद आरोपीस पुढील तपास / मा. न्यायालयात हजर करण्यासाठी ताब्यात मिळण्यास विनंती आहे.',
    ioName: 'सुधीर पाटील',
    ioRank: 'पोलीस निरीक्षक',
    ioBuckleNo: 'ब.क्र. ५६१२',
    ioStation: 'पोलीस ठाणे सायबर नागपूर शहर'
  };
}

// -------------------------------------------------------------
// 6. PERMISSION TO ARREST APPLICATION (COURT)
// -------------------------------------------------------------
export function getDefaultArrestPermissionData() {
  return {
    letterDate: getCurrentDateStr(),
    policeStationHeader: 'पोलीस ठाणे सायबर नागपूर शहर',
    courtName: 'माननीय न्यायदंडाधिकारी, प्रथम वर्ग, न्यायालय क्रमांक 10, नागपूर शहर',
    subject: 'आरोपीस अटक करुन तपास करण्याची परवानगी मिळणेबाबत',
    reporter: '',
    crimeNo: '',
    year: new Date().getFullYear().toString(),
    actsSections: 'u/s 318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS r/w 66(c), 66(d) IT Act',
    accusedListText: '',
    priorCaseDetails: '',
    producedAccusedName: '',
    producingAuthority: 'कारागृह पोलीस, तिहार कारागृह, दिल्ली',
    groundsText: 'सदर आरोपीस नमुद गुन्ह्यात अटक करुन त्याचेकडे तपास करणे आवश्यक असल्याने आरोपीचा ताबा आमचेकडे देऊन त्यास नमुद गुन्ह्यात अटक करण्याची परवानगी मिळण्यास विनंती आहे.',
    ioName: '',
    ioRank: 'वरीष्ठ पोलीस निरीक्षक',
    ioBuckleNo: '',
    ioStation: 'पोलीस ठाणे सायबर, नागपुर शहर'
  };
}

export function getSampleArrestPermissionData() {
  return {
    letterDate: '29-07-2026',
    policeStationHeader: 'पोलीस ठाणे सायबर नागपूर शहर',
    courtName: 'माननीय न्यायदंडाधिकारी, प्रथम वर्ग, न्यायालय क्रमांक 10, नागपूर शहर',
    subject: 'आरोपीस अटक करुन तपास करण्याची परवानगी मिळणेबाबत',
    reporter: 'सुरेश डांबरे, वरीष्ठ पोलीस निरीक्षक, पोलीस ठाणे सायबर, नागपूर शहर',
    crimeNo: '38/2026',
    year: '2026',
    actsSections: 'u/s 318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS r/w 66(c), 66(d) IT Act',
    accusedListText: '१) संदीप भानुदास मोरे, वय ४२ वर्षे, पत्ता – हाऊस नं. ७५८/९, गल्ली नं. ९, अटल गेट, नेहरु नगर, इंदौर, मध्य प्रदेश\n२) अजय पि. पुरुषोत्तम सिंह तोमर वय 32 वर्षे पत्ता – फ्लॅट नं. 106, कान्हा पॅराडाईज, राऊ, इंदौर, मध्य प्रदेश',
    priorCaseDetails: 'सायबर क्राइम पोलीस ठाणे, गौतम बुद्ध नगर, उत्तर प्रदेश FIR No. 34/2026 u/s 308(2), 318(4), 319(2), 336(3) BNS सहकलम 66(ड) IT Act या गुन्ह्यात अटक केलेली असुन त्यांना मा. CJM, गौतम बुद्घ नगर, उत्तर प्रदेश यांचे न्यायालयाने न्यायालयीन कोठडी सुनावलेली असुन सदर आरोपी सध्या जिल्हा कारागृह, गौतम बुद्ध नगर दिल्ली येथे न्यायालयीन कोठडीत असल्याबाबतची माहिती प्राप्त झाल्याने तसेच सदर आरोपींना अटक करुन सदर गुन्ह्यात आरोपींकडे तपास करणे आवश्यक असल्याने नमुद आरोपींचे प्रोडक्शन वारंट मिळणेसाठी मा. न्यायालयासमक्ष अर्ज करण्यात आलेला होता. त्यास अनुसरुन मा. न्यायालयाने नमुद आरोपींचे प्रोडक्शन वारंट काढलेले आहे.',
    producedAccusedName: 'संदीप भानुदास मोरे, वय ४२ वर्षे, पत्ता – हाऊस नं. ७५८/९, गल्ली नं. ९, अटल गेट, नेहरु नगर, इंदौर, मध्य प्रदेश',
    producingAuthority: 'कारागृह पोलीस, तिहार कारागृह, दिल्ली',
    groundsText: 'सदर आरोपीस पोलीस ठाणे सायबर, नागपूर शहर अपराध क्रमांक 38/2026 मध्ये अटक करुन त्याचेकडे तपास करणे आवश्यक असल्याने आरोपी नामे संदीप भानुदास मोरे, वय ४२ वर्षे याचा ताबा आमचेकडे देऊन त्यास नमुद गुन्ह्यात अटक करण्याची परवानगी मिळण्यास विनंती आहे.',
    ioName: 'सुरेश डांबरे',
    ioRank: 'वरीष्ठ पोलीस निरीक्षक',
    ioBuckleNo: 'ब.क्र. ७८४५',
    ioStation: 'पोलीस ठाणे सायबर, नागपुर शहर'
  };
}

// -------------------------------------------------------------
// 7. SECTION 35(2) BNSS NOTICE CHECKLIST
// -------------------------------------------------------------
export function getDefaultNotice352Data() {
  return {
    letterDate: getCurrentDateStr(),
    courtName: 'माननीय न्यायदंडाधिकारी, प्रथम वर्ग, न्यायालय क्रमांक 10, नागपूर शहर',
    ioName: '',
    ioRank: 'वरीष्ठ पोलीस निरीक्षक',
    ioBuckleNo: '',
    ioStation: 'पोलीस ठाणे सायबर, नागपुर शहर',
    psName: 'पोलीस ठाणे सायबर, नागपूर शहर',
    crimeNo: '',
    year: new Date().getFullYear().toString(),
    actsSections: 'u/s 318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS r/w 66(c), 66(d) IT Act',
    complainantName: '',
    complainantAge: '',
    complainantProfession: '',
    complainantAddress: '',
    caseBrief: '',
    totalFraudAmount: '',
    groundsOfArrest: '',
    productionWarrantDetails: '',
    accusedName: '',
    accusedAge: '',
    accusedAddress: '',
    producedFromJail: 'तिहार कारागृह, दिल्ली',
    arrestDate: '',
    arrestTime: '',
    relativeIntimation: ''
  };
}

export function getSampleNotice352Data() {
  return {
    letterDate: '२९-०७-२०२६',
    courtName: 'माननीय न्यायदंडाधिकारी, प्रथम वर्ग, न्यायालय क्रमांक 10, नागपूर शहर',
    ioName: 'सुरेश डांबरे',
    ioRank: 'वरीष्ठ पोलीस निरीक्षक',
    ioBuckleNo: 'ब.क्र. ७८४५',
    ioStation: 'पोलीस ठाणे सायबर, नागपुर शहर',
    psName: 'पोलीस ठाणे सायबर, नागपूर शहर',
    crimeNo: '38/2026',
    year: '2026',
    actsSections: 'u/s 318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS r/w 66(c), 66(d) IT Act',
    complainantName: 'श्रद्धा नथुजी झोडापे',
    complainantAge: '५०',
    complainantProfession: 'प्राकृतिक चिकीत्सा',
    complainantAddress: '९३, बेसा, रेणुका कॉलेजजवळ, नागपूर ४४००३४',
    caseBrief: 'दिनांक २२-०३-२०२६ रोजी सकाळी १०.०४ वा. ते दिनांक २४-०४-२०२६ रोजी ०९.०० वाजेपर्यंत माझ्या नावावर सिम कार्ड, बँक खाते उघडलेले आहे व त्याचा वापर आतंकवादामध्ये झालेला आहे, तसेच माझ्या नावावर गुन्हा दाखल झालेला आहे व त्यामध्ये अरेस्ट वॉरंट निघाले आहे माझ्या नावाचे बनावट अरेस्ट वारंट मला पाठवून आम्हाला डिजिटली अरेस्ट करण्यात येत असे सांगून आम्हाला घाबरवण्यात व धमकावण्यात आले, तसेच माझ्या खात्यावरील पैशांची पडताळणी करून मला पैसे परत पाठवण्यात अशी खोटी बतावणी करुन शासकीय खाते आहे असे खोटे सांगून आम्हाला देण्यात आलेल्या बॅंक खात्यामध्ये एकूण ₹13,00,100 पाठविण्यास भाग पाडून पैसे जमा केल्याबाबत बनावट पोचपावती पाठवून माझी एकुण ₹13,00,100 रुपयांची फसवणूक करण्यात आलेली आहे. अशा तक्रारीच्या आधारे, वरील गुन्हा दाखल करण्यात आला आहे आणि आम्ही प्रकरणाचा अधिक तपास करत आहोत.',
    totalFraudAmount: '₹13,00,100/-',
    groundsOfArrest: '१) तपासादरम्यान निष्पन्न झाले की आरोपीने गुन्ह्यातील फसवणूक झालेली रक्कम स्वीकारण्यात व हस्तांतरित करण्यात सक्रिय सहभाग घेतला आहे.\n२) आरोपीने गुन्ह्याशी संबंधित तांत्रिक पुरावे नष्ट करण्याचा प्रयत्न केला असून साक्षीदारांवर प्रभाव पाडण्याची शक्यता नाकारता येत नाही.\n३) गुन्ह्याचा सखोल तपास करण्यासाठी व गुन्ह्यात सामील असलेल्या इतर साथीदारांचा शोध घेण्यासाठी आरोपीची उपस्थिती आवश्यक आहे.',
    productionWarrantDetails: 'सदर आरोपी नामे १) संदीप भानुदास मोरे, वय ४२ वर्षे, पत्ता – हाऊस नं. ७५८/९, गल्ली नं. ९, अटल गेट, नेहरु नगर, इंदौर, मध्य प्रदेश २) अजय पि. पुरुषोत्तम सिंह तोमर वय 32 वर्षे पत्ता – फ्लॅट नं. 106, कान्हा पॅराडाईज, राऊ, इंदौर, मध्य प्रदेश यांना सायबर क्राइम पोलीस ठाणे, गौतम बुद्ध नगर, उत्तर प्रदेश FIR No. 34/2026 u/s 308(2), 318(4), 319(2), 336(3) BNS सहकलम 66(ड) IT Act या गुन्ह्यात अटक केलेली असुन त्यांना मा. CJM, गौतम बुद्घ नगर, उत्तर प्रदेश यांचे न्यायालयाने न्यायालयीन कोठडी सुनावलेली असुन सदर आरोपी सध्या जिल्हा कारागृह, गौतम बुद्ध नगर दिल्ली येथे न्यायालयीन कोठडीत असल्याबाबतची माहिती प्राप्त झाल्याने तसेच सदर आरोपींना अटक करुन सदर गुन्ह्यात आरोपींकडे तपास करणे आवश्यक असल्याने नमुद आरोपींचे प्रोडक्शन वारंट मिळणेसाठी मा. न्यायालयासमक्ष अर्ज करण्यात आलेला होता. त्यास अनुसरुन मा. न्यायालयाने नमुद आरोपी नामे १) संदीप भानुदास मोरे, वय ४२ वर्षे, पत्ता – हाऊस नं. ७५८/९, गल्ली नं. ९, अटल गेट, नेहरु नगर, इंदौर, मध्य प्रदेश २) अजय पि. पुरुषोत्तम सिंह तोमर वय 32 वर्षे पत्ता – फ्लॅट नं. 106, कान्हा पॅराडाईज, राऊ, इंदौर, मध्य प्रदेश यांचे प्रोडक्शन वारंट काढलेले आहे.',
    accusedName: 'संदीप भानुदास मोरे',
    accusedAge: '४२',
    accusedAddress: 'हाऊस नं. ७५८/९, गल्ली नं. ९, अटल गेट, नेहरु नगर, इंदौर, मध्य प्रदेश',
    producedFromJail: 'तिहार कारागृह, दिल्ली',
    arrestDate: '२९-०७-२०२६',
    arrestTime: '११:३०',
    relativeIntimation: 'पत्नी सौ. सीमा मोरे, मो. ९८२२००००००'
  };
}

// -------------------------------------------------------------
// 8. ARREST STATION DIARY ENTRY (ATAK SANHA)
// -------------------------------------------------------------
export function getDefaultAtakSanhaData() {
  return {
    letterDate: getCurrentDateStr(),
    ioName: '',
    ioRank: 'वरिष्ठ पोलीस निरीक्षक',
    ioBuckleNo: '',
    ioStation: 'पोलीस ठाणे सायबर, नागपूर शहर',
    psName: 'पोलीस ठाणे सायबर, नागपूर शहर',
    crimeNo: '',
    year: new Date().getFullYear().toString(),
    actsSections: 'भारतीय न्याय संहीता कलम 318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS सह कलम 66(क), 66(ड) माहिती तंत्रज्ञान अधिनियम 2000',
    complainantName: '',
    complainantAge: '',
    complainantProfession: '',
    complainantAddress: '',
    caseBrief: '',
    totalFraudAmount: '',
    groundsOfArrest: '',
    productionWarrantDetails: '',
    accusedName: '',
    accusedAge: '',
    accusedAddress: '',
    producedFromJail: 'तिहार कारागृह, दिल्ली',
    arrestDate: '',
    arrestTime: '',
    relativeIntimation: ''
  };
}

export function getSampleAtakSanhaData() {
  return {
    letterDate: '२९-०७-२०२६',
    ioName: 'सुरेश डांबरे',
    ioRank: 'वरिष्ठ पोलीस निरीक्षक',
    ioBuckleNo: 'ब.क्र. ७८४५',
    ioStation: 'पोलीस ठाणे सायबर, नागपूर शहर',
    psName: 'पोलीस ठाणे सायबर, नागपूर शहर',
    crimeNo: '38/2026',
    year: '2026',
    actsSections: 'भारतीय न्याय संहीता कलम 318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS सह कलम 66(क), 66(ड) माहिती तंत्रज्ञान अधिनियम 2000',
    complainantName: 'श्रद्धा नथुजी झोडापे',
    complainantAge: '५०',
    complainantProfession: 'प्राकृतिक चिकीत्सा',
    complainantAddress: '९३, बेसा, रेणुका कॉलेजजवळ, नागपूर ४४००३४',
    caseBrief: 'दिनांक २२-०३-२०२६ रोजी सकाळी १०.०४ वा. ते दिनांक २४-०४-२०२६ रोजी ०९.०० वाजेपर्यंत माझ्या नावावर सिम कार्ड, बँक खाते उघडलेले आहे व त्याचा वापर आतंकवादामध्ये झालेला आहे, तसेच माझ्या नावावर गुन्हा दाखल झालेला आहे व त्यामध्ये अरेस्ट वॉरंट निघाले आहे माझ्या नावाचे बनावट अरेस्ट वारंट मला पाठवून आम्हाला डिजिटली अरेस्ट करण्यात येत असे सांगून आम्हाला घाबरवण्यात व धमकावण्यात आले, तसेच माझ्या खात्यावरील पैशांची पडताळणी करून मला पैसे परत पाठवण्यात अशी खोटी बतावणी करुन शासकीय खाते आहे असे खोटे सांगून आम्हाला देण्यात आलेल्या बॅंक खात्यामध्ये एकूण ₹13,00,100 पाठविण्यास भाग पाडून पैसे जमा केल्याबाबत बनावट पोचपावती पाठवून माझी एकुण ₹13,00,100 रुपयांची फसवणूक करण्यात आलेली आहे. अशा तक्रारीच्या आधारे, वरील गुन्हा दाखल करण्यात आला आहे आणि आम्ही प्रकरणाचा अधिक तपास करत आहोत.',
    totalFraudAmount: '₹13,00,100/-',
    groundsOfArrest: '१) तपासादरम्यान निष्पन्न झाले की आरोपीने गुन्ह्यातील फसवणूक झालेली रक्कम स्वीकारण्यात व हस्तांतरित करण्यात सक्रिय सहभाग घेतला आहे.\n२) आरोपीने गुन्ह्याशी संबंधित तांत्रिक पुरावे नष्ट करण्याचा प्रयत्न केला असून साक्षीदारांवर प्रभाव पाडण्याची शक्यता नाकारता येत नाही.\n३) गुन्ह्याचा सखोल तपास करण्यासाठी व गुन्ह्यात सामील असलेल्या इतर साथीदारांचा शोध घेण्यासाठी आरोपीची उपस्थिती आवश्यक आहे.',
    productionWarrantDetails: 'सदर आरोपी नामे १) संदीप भानुदास मोरे, वय ४२ वर्षे, पत्ता – हाऊस नं. ७५८/९, गल्ली नं. ९, अटल गेट, नेहरु नगर, इंदौर, मध्य प्रदेश २) अजय पि. पुरुषोत्तम सिंह तोमर वय 32 वर्षे पत्ता – फ्लॅट नं. 106, कान्हा पॅराडाईज, राऊ, इंदौर, मध्य प्रदेश यांना सायबर क्राइम पोलीस ठाणे, गौतम बुद्ध नगर, उत्तर प्रदेश FIR No. 34/2026 u/s 308(2), 318(4), 319(2), 336(3) BNS सहकलम 66(ड) IT Act या गुन्ह्यात अटक केलेली असुन त्यांना मा. CJM, गौतम बुद्घ नगर, उत्तर प्रदेश यांचे न्यायालयाने न्यायालयीन कोठडी सुनावलेली असुन सदर आरोपी सध्या जिल्हा कारागृह, गौतम बुद्ध नगर दिल्ली येथे न्यायालयीन कोठडीत असल्याबाबतची माहिती प्राप्त झाल्याने तसेच सदर आरोपींना अटक करुन सदर गुन्ह्यात आरोपींकडे तपास करणे आवश्यक असल्याने नमुद आरोपींचे प्रोडक्शन वारंट मिळणेसाठी मा. न्यायालयासमक्ष अर्ज करण्यात आलेला होता. त्यास अनुसरुन मा. न्यायालयाने नमुद आरोपी नामे १) संदीप भानुदास मोरे, वय ४२ वर्षे, पत्ता – हाऊस नं. ७५८/९, गल्ली नं. ९, अटल गेट, नेहरु नगर, इंदौर, मध्य प्रदेश २) अजय पि. पुरुषोत्तम सिंह तोमर वय 32 वर्षे पत्ता – फ्लॅट नं. 106, कान्हा पॅराडाईज, राऊ, इंदौर, मध्य प्रदेश यांचे प्रोडक्शन वारंट काढलेले आहे.',
    accusedName: 'संदीप भानुदास मोरे',
    accusedAge: '४२',
    accusedAddress: 'हाऊस नं. ७५८/९, गल्ली नं. ९, अटल गेट, नेहरु नगर, इंदौर, मध्य प्रदेश',
    producedFromJail: 'तिहार कारागृह, दिल्ली',
    arrestDate: '२९-०७-२०२६',
    arrestTime: '११:३०',
    relativeIntimation: 'पत्नी सौ. सीमा मोरे, मो. ९८२२००००००'
  };
}

// -------------------------------------------------------------
// 9. SECTION 47 BNSS NOTICE TO ACCUSED
// -------------------------------------------------------------
export function getDefaultNotice47Data() {
  return {
    letterDate: getCurrentDateStr(),
    accusedName: '',
    accusedAge: '',
    accusedAddress: '',
    psName: 'पोलीस ठाणे सायबर, नागपुर शहर',
    crimeNo: '',
    year: new Date().getFullYear().toString(),
    actsSections: 'u/s 318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS r/w 66(c), 66(d) IT Act',
    complainantName: '',
    complainantAge: '',
    complainantProfession: '',
    complainantAddress: '',
    complaintDate: getCurrentDateStr(),
    caseBrief: '',
    arrestDate: '',
    arrestTime: '',
    groundsOfArrest: '',
    courtName: 'माननीय न्यायालय, प्रथमवर्ग क्रमांक १०, नागपुर शहर',
    courtProductionDate: '',
    relativeIntimation: '',
    ioName: '',
    ioRank: 'वरीष्ठ पोलीस निरीक्षक',
    ioBuckleNo: '',
    ioStation: 'पोलीस ठाणे सायबर, नागपुर शहर'
  };
}

export function getSampleNotice47Data() {
  return {
    letterDate: '२९-०७-२०२६',
    accusedName: 'संदीप भानुदास मोरे',
    accusedAge: '४२',
    accusedAddress: 'हाऊस नं. ७५८/९, गल्ली नं. ९, अटल गेट, नेहरु नगर, इंदौर, मध्य प्रदेश',
    psName: 'पोलीस ठाणे सायबर, नागपुर शहर',
    crimeNo: '38/2026',
    year: '2026',
    actsSections: 'u/s 318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS r/w 66(c), 66(d) IT Act',
    complainantName: 'श्रद्धा नथुजी झोडापे',
    complainantAge: '५०',
    complainantProfession: 'प्राकृतिक चिकीत्सा',
    complainantAddress: '९३, बेसा, रेणुका कॉलेजजवळ, नागपूर ४४००३४',
    complaintDate: '२७-०३-२०२६',
    caseBrief: 'दिनांक २२-०३-२०२६ को सुबह १०.०४ बजे से दिनांक २४-०४-२०२६ को सुबह ०९.०० बजे तक, मेरे नाम पर सिम कार्ड और बैंक खाता खोला गया है तथा उसका उपयोग आतंकवाद में हुआ है, साथ ही मेरे नाम पर अपराध दर्ज हुआ है और उसमें गिरफ्तारी वारंट निकला है। मेरे नाम का बनावटी गिरफ्तारी वारंट मुझे भेजकर हमें डिजिटल रूप से गिरफ्तार किया जाएगा, ऐसा कहकर हमें डराया और धमकाया गया, साथ ही मेरे खाते की रकम की पड़ताल करके मुझे पैसे वापस भेजे जाएंगे, ऐसा झूठा बहाना बनाकर और यह सरकारी खाता है, ऐसा झूठा बताकर हमें दिए गए बैंक खाते में कुल ₹13,00,100 भेजने के लिए मजबूर किया गया तथा पैसे जमा करने के संबंध में बनावटी रसीद भेजकर मेरे साथ कुल ₹13,00,100 रुपये की धोखाधड़ी की गई है।',
    arrestDate: '२९-०७-२०२६',
    arrestTime: '११:३०',
    groundsOfArrest: '१) तपासादरम्यान निष्पन्न झाले की आरोपीने गुन्ह्यातील फसवणूक झालेली रक्कम स्वीकारण्यात व हस्तांतरित करण्यात सक्रिय सहभाग घेतला आहे.\n२) आरोपीने गुन्ह्याशी संबंधित तांत्रिक पुरावे नष्ट करण्याचा प्रयत्न केला असून साक्षीदारांवर प्रभाव पाडण्याची शक्यता नाकारता येत नाही.\n३) गुन्ह्याचा सखोल तपास करण्यासाठी व गुन्ह्यात सामील असलेल्या इतर साथीदारांचा शोध घेण्यासाठी आरोपीची उपस्थिती आवश्यक आहे.',
    courtName: 'माननीय न्यायालय, प्रथमवर्ग क्रमांक १०, नागपुर शहर',
    courtProductionDate: '२९-०७-२०२६',
    relativeIntimation: 'पत्नी सौ. सीमा मोरे, मो. ९८२२००००००',
    ioName: 'सुरेश डांबरे',
    ioRank: 'वरीष्ठ पोलीस निरीक्षक',
    ioBuckleNo: 'ब.क्र. ७८४५',
    ioStation: 'पोलीस ठाणे सायबर, नागपुर शहर'
  };
}

// -------------------------------------------------------------
// 10. SECTION 48 BNSS NOTICE TO RELATIVE
// -------------------------------------------------------------
export function getDefaultNotice48Data() {
  return {
    letterDate: getCurrentDateStr(),
    relativeName: '',
    relativeRelation: '',
    relativeAddress: '',
    relativePhone: '',
    accusedName: '',
    accusedAge: '',
    accusedAddress: '',
    psName: 'पोलीस ठाणे सायबर, नागपुर शहर',
    crimeNo: '',
    year: new Date().getFullYear().toString(),
    actsSections: 'u/s 318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS r/w 66(c), 66(d) IT Act',
    complainantName: '',
    complainantAge: '',
    complainantProfession: '',
    complainantAddress: '',
    complaintDate: getCurrentDateStr(),
    caseBrief: '',
    arrestDate: '',
    arrestTime: '',
    groundsOfArrest: '',
    courtName: 'माननीय न्यायालय, प्रथमवर्ग क्रमांक १०, नागपुर शहर',
    courtProductionDate: '',
    ioName: '',
    ioRank: 'वरीष्ठ पोलीस निरीक्षक',
    ioBuckleNo: '',
    ioStation: 'पोलीस ठाणे सायबर, नागपुर शहर'
  };
}

export function getSampleNotice48Data() {
  return {
    letterDate: '२९-०७-२०२६',
    relativeName: 'सौ. सीमा संदीप मोरे',
    relativeRelation: 'पत्नी',
    relativeAddress: 'हाऊस नं. ७५८/९, गल्ली नं. ९, अटल गेट, नेहरु नगर, इंदौर, मध्य प्रदेश',
    relativePhone: '९८२२००००००',
    accusedName: 'संदीप भानुदास मोरे',
    accusedAge: '४२',
    accusedAddress: 'हाऊस नं. ७५८/९, गल्ली नं. ९, अटल गेट, नेहरु नगर, इंदौर, मध्य प्रदेश',
    psName: 'पोलीस ठाणे सायबर, नागपुर शहर',
    crimeNo: '38/2026',
    year: '2026',
    actsSections: 'u/s 318(2), 318(4), 319(2), 336(2), 336(3), 338, 340(1), 340(2), 204, 3(5) BNS r/w 66(c), 66(d) IT Act',
    complainantName: 'श्रद्धा नथुजी झोडापे',
    complainantAge: '५०',
    complainantProfession: 'प्राकृतिक चिकीत्सा',
    complainantAddress: '९३, बेसा, रेणुका कॉलेजजवळ, नागपूर ४४००३४',
    complaintDate: '२७-०३-२०२६',
    caseBrief: 'दिनांक २२-०३-२०२६ को सुबह १०.०४ बजे से दिनांक २४-०४-२०२६ को सुबह ०९.०० बजे तक, मेरे नाम पर सिम कार्ड और बैंक खाता खोला गया है तथा उसका उपयोग आतंकवाद में हुआ है, साथ ही मेरे नाम पर अपराध दर्ज हुआ है और उसमें गिरफ्तारी वारंद निकला है। मेरे नाम का बनावटी गिरफ्तारी वारंट मुझे भेजकर हमें डिजिटल रूप से गिरफ्तार किया जाएगा, ऐसा कहकर हमें डराया और धमकाया गया, साथ ही मेरे खाते की रकम की पड़ताल करके मुझे पैसे वापस भेजे जाएंगे, ऐसा झूठा बहाना बनाकर और यह सरकारी खाता है, ऐसा झूठा बताकर हमें दिए गए बैंक खाते में कुल ₹13,00,100 भेजने के लिए मजबूर किया गया तथा पैसे जमा करने के संबंध में बनावटी रसीद भेजकर मेरे साथ कुल ₹13,00,100 रुपये की धोखाधड़ी की गई है।',
    arrestDate: '२९-०७-२०२६',
    arrestTime: '११:३०',
    groundsOfArrest: '१) तपासादरम्यान निष्पन्न झाले की आरोपीने गुन्ह्यातील फसवणूक झालेली रक्कम स्वीकारण्यात व हस्तांतरित करण्यात सक्रिय सहभाग घेतला आहे.\n२) आरोपीने गुन्ह्याशी संबंधित तांत्रिक पुरावे नष्ट करण्याचा प्रयत्न केला असून साक्षीदारांवर प्रभाव पाडण्याची शक्यता नाकारता येत नाही.\n३) गुन्ह्याचा सखोल तपास करण्यासाठी व गुन्ह्यात सामील असलेल्या इतर साथीदारांचा शोध घेण्यासाठी आरोपीची उपस्थिती आवश्यक आहे.',
    courtName: 'माननीय न्यायालय, प्रथमवर्ग क्रमांक १०, नागपुर शहर',
    courtProductionDate: '२९-०७-२०२६',
    ioName: 'सुरेश डांबरे',
    ioRank: 'वरीष्ठ पोलीस निरीक्षक',
    ioBuckleNo: 'ब.क्र. ७८४५',
    ioStation: 'पोलीस ठाणे सायबर, नागपुर शहर'
  };
}

// -------------------------------------------------------------
// GENERIC DRAFT PERSISTENCE PER DOCUMENT
// -------------------------------------------------------------
export function getStorageKeyForDoc(docId) {
  return `INVESTIGATION_DOC_DRAFT_${docId.toUpperCase()}`;
}

const OFFICER_FIELDS = ['ioName', 'ioRank', 'ioBuckleNo', 'ioBeltNo', 'ioStation'];

export function saveDocDraft(docId, data) {
  try {
    const dataToSave = { ...data };
    const officerData = {};
    OFFICER_FIELDS.forEach((k) => {
      if (dataToSave[k] !== undefined) {
        officerData[k] = dataToSave[k];
        delete dataToSave[k];
      }
    });
    localStorage.setItem(getStorageKeyForDoc(docId), JSON.stringify(dataToSave));
    sessionStorage.setItem(`SESSION_DOC_OFFICER_${docId}`, JSON.stringify(officerData));
  } catch (e) {
    console.error('Failed to save draft to localStorage', e);
  }
}

export function loadDocDraft(docId) {
  try {
    const raw = localStorage.getItem(getStorageKeyForDoc(docId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    OFFICER_FIELDS.forEach((k) => {
      delete parsed[k];
    });
    try {
      const sessionRaw = sessionStorage.getItem(`SESSION_DOC_OFFICER_${docId}`);
      if (sessionRaw) {
        Object.assign(parsed, JSON.parse(sessionRaw));
      }
    } catch (err) {}
    return parsed;
  } catch (e) {
    console.error('Failed to load draft from localStorage', e);
    return null;
  }
}

export function clearDocDraft(docId) {
  try {
    localStorage.removeItem(getStorageKeyForDoc(docId));
    sessionStorage.removeItem(`SESSION_DOC_OFFICER_${docId}`);
  } catch (e) {
    console.error('Failed to clear draft from localStorage', e);
  }
}

export function exportDocDraftJson(docId, data) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Draft_${docId}_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
