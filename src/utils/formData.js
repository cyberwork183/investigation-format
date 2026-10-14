/**
 * formData.js
 * Form state management, default values, test data, and local draft persistence.
 * All data remains strictly within the user's browser (Local/Session Storage).
 */

export const STORAGE_KEY = 'ARREST_FORM_III_DRAFT';

export function getDefaultFormData() {
  return {
    // SECTION 1 — CASE INFORMATION
    state: 'Maharashtra',
    district: '',
    policeStation: '',
    firNo: '',
    year: new Date().getFullYear().toString(),
    date: new Date().toISOString().split('T')[0],
    accusedCode: 'A1',

    // SECTION 2 — DATE, TIME & PLACE OF ARREST / SURRENDER
    arrestDate: '',
    arrestTime: '',
    gdNo: '',
    arrestPS: '',
    arrestDist: '',
    arrestState: '',

    // SECTION 3 — COURT INFORMATION
    courtName: '',

    // SECTION 4 — ACTS AND SECTIONS
    actsSections: '',
    actsSectionsMr: '',

    // SECTION 5 — ARREST / SURRENDER STATUS (Index 0-6, null if unselected)
    arrestStatus: null,

    // SECTION 6 — PARTICULARS OF THE ACCUSED
    accusedName: '',
    fatherName: '',
    firstAlias: '',
    secondAlias: '',
    nationality: 'Indian / भारतीय',
    voterId: '',
    passportNo: '',
    passportIssueDate: '',
    passportIssuePlace: '',
    religion: '',
    caste: '',
    category: '', // SC / ST / OBC / General
    occupation: '',
    permanentAddress: '',
    permState: '',
    permDist: '',
    permPS: '',
    presentAddress: '',
    presState: '',
    presDist: '',
    presPS: '',

    // SECTION 7 — INJURIES / PHYSICAL CONDITION
    medicallyExamined: 'no',
    injuriesDetails: '',

    // SECTION 8 — CUSTODY / LEGAL RIGHTS
    custodyDate: '',
    custodyTime: '',
    custodyPlace: '',

    // SECTION 9 — ARTICLES FOUND DURING PHYSICAL SEARCH (1 to 6)
    articles: ['', '', '', '', '', ''],
    articlesNil: false,

    // SECTION 10 — INTIMATION
    intimationName: '',
    intimationRelation: '',
    intimationAddress: '',

    // SECTION 11 — PHYSICAL FEATURES (25 attributes)
    physicalFeatures: {
      sex: 'Male',
      dob: '',
      build: '',
      height: '',
      complexion: '',
      idMark: '',
      deformities: 'None',
      teeth: 'Normal',
      hair: 'Black',
      eye: 'Normal',
      habits: 'None',
      dressHabits: '',
      languages: '',
      burnMark: 'Nil',
      leucoderma: 'Nil',
      mole: '',
      scar: 'Nil',
      tattoo: 'Nil',
      forehead: 'Normal',
      ear: 'Normal',
      nose: 'Normal',
      moustaches: 'None',
      speech: 'Normal',
      face: 'Oval',
      lips: 'Normal'
    },

    // SECTION 12 — OTHER FEATURES
    otherFeatures: '',

    // SECTION 13 — FINGERPRINT
    fingerprintTaken: 'yes',
    fingerprintDetail: '',

    // SECTION 14 — SOCIO-ECONOMIC PROFILE
    livingStatus: 'Living with Family',
    education: '',
    socioOccupation: '',
    incomeGroup: null, // 0 to 5

    // SECTION 15 — POLICE RECORD / OBSERVATION (Yes / No)
    isDangerous: 'no',
    escapedBail: 'no',
    isArmed: 'no',
    operatesAccomplices: 'no',
    pastRecords: 'no',
    isRecidivist: 'no',
    likelyEscapeBail: 'no',
    likelyCommitCrime: 'no',
    wantedOtherCase: 'no',
    otherCaseDetail: '',

    // SECTION 16 — WITNESSES / PANCHAS
    witness1Name: '',
    witness1Address: '',
    witness2Name: '',
    witness2Address: '',

    // SECTION 17 — FINAL SIGNATURES / OFFICER DETAILS
    officerName: '',
    officerRank: '',
    officerNo: '',
    place: '',
    finalDate: new Date().toISOString().split('T')[0],

    // Uploaded photo dataUrl for preview
    photoDataUrl: null
  };
}

/**
 * Returns strictly fictitious demo data for end-to-end testing.
 * NEVER contains real accused personal information.
 */
export function getSampleFormData() {
  const d = getDefaultFormData();
  d.state = 'Maharashtra';
  d.district = 'Nagpur City';
  d.policeStation = 'Cyber Police Station';
  d.firNo = '89/2026';
  d.year = '2026';
  d.date = '2026-10-08';
  d.accusedCode = 'A1';

  d.arrestDate = '2026-10-08';
  d.arrestTime = '11:45 hrs';
  d.gdNo = '34/2026';
  d.arrestPS = 'Cyber Police Station';
  d.arrestDist = 'Nagpur City';
  d.arrestState = 'Maharashtra';

  d.courtName = '';
  d.actsSections = 'BNS 318(2), 318(4), 319(2), 336(2), 338, 340(1) r/w Sec 66(C), 66(D) Information Technology Act';
  d.actsSectionsMr = 'माहिती तंत्रज्ञान कायदा कलम ६६(क), ६६(ड) व बी.एन.एस. कलमे';
  d.arrestStatus = 0; // Arrested and forward

  d.accusedName = 'Ramesh Kumar Suresh Patel';
  d.fatherName = 'Suresh Patel';
  d.firstAlias = 'Rocky';
  d.secondAlias = 'Nil';
  d.nationality = 'Indian / भारतीय';
  d.voterId = 'MH/23/145/098765';
  d.passportNo = 'N1234567';
  d.passportIssueDate = '2022-04-15';
  d.passportIssuePlace = 'Mumbai';
  d.religion = 'Hindu';
  d.caste = 'Maratha';
  d.category = 'General';
  d.occupation = 'Business';

  d.permanentAddress = 'Plot No. 45, Shivaji Chowk, Dharampeth, Nagpur - 440010';
  d.permState = 'Maharashtra';
  d.permDist = 'Nagpur';
  d.permPS = 'Ambazari';

  d.presentAddress = 'Flat No. 302, Green Valley Apartments, Wardha Road, Nagpur - 440025';
  d.presState = 'Maharashtra';
  d.presDist = 'Nagpur';
  d.presPS = 'Dhantoli';

  d.medicallyExamined = 'yes';
  d.injuriesDetails = 'Medically examined at Govt. Medical College Hospital, Nagpur. No external visible injuries noted on the person.';

  d.custodyDate = '2026-10-08';
  d.custodyTime = '11:45 hrs';
  d.custodyPlace = 'Cyber Police Station, Nagpur';

  d.articlesNil = false;
  d.articles = [
    'One Samsung Galaxy S23 Mobile Phone with SIM Card',
    'Black Leather Wallet containing Indian Currency Rs. 1,450/-',
    'Aadhaar Card and PAN Card in the name of accused',
    'Wristwatch (Fastrack, Black Strap)',
    'Key ring with 2 keys',
    'NIL'
  ];

  d.intimationName = 'Sunita Ramesh Patel';
  d.intimationRelation = 'Wife';
  d.intimationAddress = 'Flat No. 302, Green Valley Apartments, Wardha Road, Nagpur';

  d.physicalFeatures = {
    sex: 'Male',
    dob: '1992 (Age 34)',
    build: 'Medium Athletic',
    height: '172 cm',
    complexion: 'Wheatish',
    idMark: 'A small dark mole on right cheek below eye',
    deformities: 'None',
    teeth: 'Normal, complete set',
    hair: 'Black, short straight',
    eye: 'Dark Brown',
    habits: 'None',
    dressHabits: 'Blue jeans and white collared shirt',
    languages: 'Marathi, Hindi, English',
    burnMark: 'Nil',
    leucoderma: 'Nil',
    mole: 'Dark mole on right cheek',
    scar: 'Old faint linear scar (1 cm) on left forearm',
    tattoo: 'Nil',
    forehead: 'Broad',
    ear: 'Normal',
    nose: 'Straight',
    moustaches: 'Trimmed black',
    speech: 'Normal and polite',
    face: 'Oval',
    lips: 'Normal'
  };

  d.otherFeatures = 'Nil';
  d.fingerprintTaken = 'yes';
  d.fingerprintDetail = 'Crime Scene Fingerprint Card Sl. No. 104/2026 recorded';

  d.livingStatus = 'Living with Family';
  d.education = 'Bachelor of Commerce (B.Com)';
  d.socioOccupation = 'Self Employed Trader';
  d.incomeGroup = 2; // Middle Income (from Rs. 50,001 to 1,00,000)

  d.isDangerous = 'no';
  d.escapedBail = 'no';
  d.isArmed = 'no';
  d.operatesAccomplices = 'yes';
  d.pastRecords = 'no';
  d.isRecidivist = 'no';
  d.likelyEscapeBail = 'no';
  d.likelyCommitCrime = 'no';
  d.wantedOtherCase = 'no';
  d.otherCaseDetail = '';

  d.witness1Name = 'Vikas Manohar Rao (Age 42)';
  d.witness1Address = 'House No. 12, Ram Nagar, Nagpur - 440033';
  d.witness2Name = 'Prakash D. Shinde (Age 38)';
  d.witness2Address = 'Plot No. 89, Trimurti Nagar, Ring Road, Nagpur - 440022';

  d.officerName = 'Vikram S. Gaikwad';
  d.officerRank = 'Assistant Police Inspector (API)';
  d.officerNo = 'API-7845';
  d.place = 'Cyber Police Station, Nagpur City';
  d.finalDate = '2026-10-08';

  return d;
}

export function saveDraftToLocalStorage(data) {
  try {
    const dataToSave = { ...data };
    const officerData = {};
    ['officerName', 'officerRank', 'officerNo', 'place'].forEach((k) => {
      if (dataToSave[k] !== undefined) {
        officerData[k] = dataToSave[k];
        delete dataToSave[k];
      }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    sessionStorage.setItem('SESSION_FORM3_OFFICER', JSON.stringify(officerData));
  } catch (e) {
    console.error('Failed to save draft to localStorage:', e);
  }
}

export function loadDraftFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure user-entered officer details are never restored from permanent localStorage in new sessions
      delete parsed.officerName;
      delete parsed.officerRank;
      delete parsed.officerNo;
      delete parsed.place;

      try {
        const sessionRaw = sessionStorage.getItem('SESSION_FORM3_OFFICER');
        if (sessionRaw) {
          Object.assign(parsed, JSON.parse(sessionRaw));
        }
      } catch (err) {}
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load draft from localStorage:', e);
  }
  return null;
}

export function clearDraftFromLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem('SESSION_FORM3_OFFICER');
  } catch (e) {
    console.error('Failed to clear draft:', e);
  }
}

export function exportDraftAsJson(data) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const code = data.accusedCode || 'A1';
  const date = data.date || 'draft';
  a.href = url;
  a.download = `Arrest_Form_Draft_${code}_${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
