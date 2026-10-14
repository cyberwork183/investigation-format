/**
 * documentTypes.js
 * Registry and metadata for all supported official police investigation documents
 */

export const DOCUMENT_TYPES = [
  {
    id: 'form3',
    title: 'Arrest / Court Surrender Form — Form III',
    titleMr: 'अटकेचा पंचनामा / न्यायालयाच्या स्वाधीन होण्याचा नमुना (फॉर्म ३)',
    badge: 'Statutory Memo',
    badgeClass: 'badge-primary',
    category: 'Arrest & Custody',
    categoryMr: 'अटक व ताबा',
    description: 'Statutory 17-section arrest memo under CrPC/BNSS with accused photo, physical features, articles search, socio-economic profile, and witness signatures.',
    descriptionMr: 'आरोपीचा फोटो, शारीरिक वैशिष्ट्ये, अंगझडती, सामाजिक-आर्थिक माहिती व पंचांच्या सह्यांसह १७ कलमी वैधानिक नमुना.',
    templateFile: '/template/arrest-form-master.docx',
    icon: 'memo'
  },
  {
    id: 'notice_35_2',
    title: 'Section 35(2) BNSS Notice Checklist',
    titleMr: '३५(२) नोटीस चेकलिस्ट (कलम ३५(१)(ब)(२) अन्वये)',
    badge: 'Statutory Checklist',
    badgeClass: 'badge-primary',
    category: 'Arrest & Custody',
    categoryMr: 'अटक व ताबा',
    description: 'Statutory checklist submitted to Judicial Magistrate detailing brief facts of the case, grounds of arrest, and reasons under Section 35(1)(b)(2) BNSS.',
    descriptionMr: 'भारतीय नागरिक सुरक्षा संहिता कलम ३५(१)(ब)(२) अन्वये आरोपीच्या अटकेचे आधार, बँक तपशील व अटकेची कारणे मा. न्यायालयाकडे सादर करण्याचे चेकलिस्ट पत्र.',
    templateFile: '/template/notice-35-2-checklist-master.docx',
    icon: 'memo'
  },
  {
    id: 'atak_sanha',
    title: 'Arrest Station Diary Entry (Atak Sanha)',
    titleMr: 'अटक सान्हा (स्टेशन डायरी नोंद)',
    badge: 'Station Diary Entry',
    badgeClass: 'badge-secondary',
    category: 'Arrest & Custody',
    categoryMr: 'अटक व ताबा',
    description: 'Official Station Diary (Sanha) arrest entry recording the IO statement, brief facts of the case, grounds of arrest, and reasons for arrest.',
    descriptionMr: 'आरोपीच्या अटकेची अधिकृत स्टेशन डायरी (सान्हा) नोंद, ज्यामध्ये गुन्ह्याची पार्श्वभूमी, बँक खात्याचा तपशील, व अटकेची ११ कारणे नमूद केली जातात.',
    templateFile: '/template/atak-sanha-master.docx',
    icon: 'memo'
  },
  {
    id: 'notice_47',
    title: 'Section 47 BNSS Notice to Accused',
    titleMr: '४७ नोटीस (कलम ४७ - आरोपीस अटकेची व जामीन हक्काची सूचना)',
    badge: 'Statutory Notice',
    badgeClass: 'badge-warning',
    category: 'Arrest & Custody',
    categoryMr: 'अटक व ताबा',
    description: 'Official statutory notice served on the arrested accused intimating grounds of arrest, reasons, and right to apply for bail under Section 47 BNSS.',
    descriptionMr: 'भारतीय नागरिक सुरक्षा संहिता कलम ४७ अन्वये अटक आरोपीला अटकेचे आधार, कारणे व जामीन अधिकाराबाबत दिली जाणारी अधिकृत लेखी सूचना.',
    templateFile: '/template/notice-47-master.docx',
    icon: 'memo'
  },
  {
    id: 'notice_48',
    title: 'Section 48 BNSS Notice to Relative / Friend',
    titleMr: '४८ नोटीस (कलम ४८ - नातेवाईकास अटकेची व जामीन हक्काची सूचना)',
    badge: 'Relative Intimation',
    badgeClass: 'badge-info',
    category: 'Arrest & Custody',
    categoryMr: 'अटक व ताबा',
    description: 'Official statutory notice served on the relative/friend of the arrested person informing them of arrest, grounds, and bail rights under Section 48 BNSS.',
    descriptionMr: 'भारतीय नागरिक सुरक्षा संहिता कलम ४८ अन्वये अटक आरोपीच्या नातेवाईकास अटकेची माहिती, कारणे व जामीन अधिकाराबाबत दिली जाणारी अधिकृत सूचना.',
    templateFile: '/template/notice-48-master.docx',
    icon: 'memo'
  },
  {
    id: 'remand',
    title: 'Police Custody Remand Application (PCR)',
    titleMr: 'पोलीस कोठडी रिमांड अर्ज (PCR)',
    badge: 'Court Application',
    badgeClass: 'badge-danger',
    category: 'Court Remand',
    categoryMr: 'न्यायालयीन रिमांड',
    description: 'Official application to Judicial Magistrate for Police Custody Remand with 11-point summary table, brief facts of the case, grounds of arrest, reasons for arrest, and investigation points.',
    descriptionMr: '११ कलमी गोषवारा तक्ता, गुन्ह्याची थोडक्यात हकीकत, बँक लेयर तपशील, अटकेची कारणे व तपास मुद्दे यांसह मा. न्यायालयाकडे पोलीस कोठडी मागणी अर्ज.',
    templateFile: '/template/remand-application-master.docx',
    icon: 'gavel'
  },
  {
    id: 'arrest_permission',
    title: 'Permission to Arrest Application',
    titleMr: 'आरोपीस अटक करण्याची परवानगी अर्ज',
    badge: 'Court Application',
    badgeClass: 'badge-warning',
    category: 'Court Permission',
    categoryMr: 'न्यायालयीन परवानगी',
    description: 'Application to Judicial Magistrate requesting permission to arrest an accused produced on Production Warrant from another prison/jurisdiction.',
    descriptionMr: 'इतर कारागृहातून प्रोडक्शन वॉरंटद्वारे हजर केलेल्या आरोपीस नमुद गुन्ह्यात अटक करण्याची परवानगी मिळण्यासाठी मा. न्यायालयासमक्ष अर्ज.',
    templateFile: '/template/arrest-permission-master.docx',
    icon: 'shield-check'
  },
  {
    id: 'medical',
    title: 'Medical Examination Request Letter',
    titleMr: 'वैद्यकीय तपासणी विनंती पत्र',
    badge: 'Official Letter',
    badgeClass: 'badge-info',
    category: 'Medical & Custody',
    categoryMr: 'वैद्यकीय व बंदिगृह',
    description: 'Official requisition letter to Medical Officer (General Hospital) for general physical examination of an accused in custody or prior to arrest.',
    descriptionMr: 'पोलीस कोठडीत असलेल्या किंवा अटक करावयाच्या आरोपीची सर्वसाधारण शारीरिक व वैद्यकीय तपासणी करण्यासाठी वैद्यकीय अधिकाऱ्यांना पत्र.',
    templateFile: '/template/medical-letter-master.docx',
    icon: 'stethoscope'
  },
  {
    id: 'lockup_ps',
    title: 'Lockup Placement Request Letter (Police Station)',
    titleMr: 'आरोपीला बंदिगृहात (लॉकअपमध्ये) ठेवणेबाबत पत्र - पोलीस ठाणे',
    badge: 'Inter-Station Requisition',
    badgeClass: 'badge-secondary',
    category: 'Medical & Custody',
    categoryMr: 'वैद्यकीय व बंदिगृह',
    description: 'Official request to In-Charge / PI of another Police Station (e.g. Sadar PS) to keep remanded accused in their lockup facility due to lack of lockup at Cyber PS.',
    descriptionMr: 'सायबर पोलीस ठाण्यात स्वतंत्र बंदीगृह नसल्याने आरोपीस सुरक्षिततेसाठी दुसऱ्या पोलीस ठाण्याच्या लॉकअपमध्ये ठेवण्याची विनंती पत्र.',
    templateFile: '/template/lockup-placement-ps-master.docx',
    icon: 'lock'
  },
  {
    id: 'lockup_acp',
    title: 'Lockup Placement Intimation Letter (ACP Crime)',
    titleMr: 'आरोपीला बंदिगृहात ठेवणेबाबत पत्र - मा. सहा. पोलीस आयुक्त',
    badge: 'Supervisory Letter',
    badgeClass: 'badge-secondary',
    category: 'Medical & Custody',
    categoryMr: 'वैद्यकीय व बंदिगृह',
    description: 'Official supervisory intimation letter to Assistant Commissioner of Police (Crime) regarding placement of accused in another police station lockup.',
    descriptionMr: 'आरोपीस दुसऱ्या पोलीस ठाण्याच्या बंदिगृहात ठेवण्याबाबत मा. सहायक पोलीस आयुक्त (गुन्हे) यांना पाठविण्यात येणारे माहिती/परवानगी पत्र.',
    templateFile: '/template/lockup-placement-acp-master.docx',
    icon: 'building'
  },
  {
    id: 'custody_transfer',
    title: 'Accused Custody Transfer / Release Request Letter',
    titleMr: 'आरोपी बंदिगृहातून ताब्यात मिळणेबाबत पत्र',
    badge: 'Custody Handover',
    badgeClass: 'badge-success',
    category: 'Medical & Custody',
    categoryMr: 'वैद्यकीय व बंदिगृह',
    description: 'Official request to lockup Police Station requesting temporary handover of remanded accused from lockup for investigation or court production.',
    descriptionMr: 'लॉकअपमध्ये ठेवलेल्या आरोपीस पुढील तपास किंवा न्यायालयीन हजेरीसाठी तात्पुरता ताब्यात मिळण्याबाबतचे अधिकृत विनंती पत्र.',
    templateFile: '/template/custody-transfer-master.docx',
    icon: 'user-check'
  }
];

/**
 * 4 Main Document Categories / Cards displayed on the Dashboard
 */
export const MAIN_DASHBOARD_CARDS = [
  {
    id: 'arrest_custody',
    cardKey: 'arrest_custody',
    isDirectDoc: false,
    title: 'Arrest & Custody (Form III, Sanha & Notices)',
    titleMr: 'अटक व ताबा (पंचनामा, सान्हा व वैधानिक नोटिसा)',
    badge: '5 Templates',
    badgeClass: 'badge-primary',
    category: 'Arrest & Custody',
    categoryMr: 'अटक व ताबा',
    description: 'Statutory 17-section arrest memo Form III, BNSS 35(2) checklist, Atak Sanha entry, BNSS 47 notice to accused, and BNSS 48 notice to relative.',
    descriptionMr: 'फॉर्म ३ अटकेचा पंचनामा, कलम ३५(२) चेकलिस्ट, अटक सान्हा नोंद, कलम ४७ आरोपीस नोटीस, व कलम ४८ नातेवाईकास नोटीस.',
    icon: 'memo',
    subDocIds: ['form3', 'notice_35_2', 'atak_sanha', 'notice_47', 'notice_48']
  },
  {
    id: 'remand',
    cardKey: 'remand',
    isDirectDoc: true,
    title: 'Police Custody Remand Application (PCR)',
    titleMr: 'पोलीस कोठडी रिमांड अर्ज (PCR)',
    badge: 'Court Application',
    badgeClass: 'badge-danger',
    category: 'Court Remand',
    categoryMr: 'न्यायालयीन रिमांड',
    description: 'Official application to Judicial Magistrate for Police Custody Remand with 11-point summary table, brief facts of the case, grounds of arrest, and reasons for arrest.',
    descriptionMr: '११ कलमी गोषवारा तक्ता, गुन्ह्याची थोडक्यात हकीकत, बँक लेयर तपशील, अटकेची कारणे व तपास मुद्दे यांसह मा. न्यायालयाकडे पोलीस कोठडी मागणी अर्ज.',
    icon: 'gavel'
  },
  {
    id: 'arrest_permission',
    cardKey: 'arrest_permission',
    isDirectDoc: true,
    title: 'Permission to Arrest Application',
    titleMr: 'आरोपीस अटक करण्याची परवानगी अर्ज',
    badge: 'Court Application',
    badgeClass: 'badge-warning',
    category: 'Court Permission',
    categoryMr: 'न्यायालयीन परवानगी',
    description: 'Application to Judicial Magistrate requesting permission to arrest an accused produced on Production Warrant from another prison/jurisdiction.',
    descriptionMr: 'इतर कारागृहातून प्रोडक्शन वॉरंटद्वारे हजर केलेल्या आरोपीस नमुद गुन्ह्यात अटक करण्याची परवानगी मिळण्यासाठी मा. न्यायालयासमक्ष अर्ज.',
    icon: 'shield-check'
  },
  {
    id: 'medical_custody',
    cardKey: 'medical_custody',
    isDirectDoc: false,
    title: 'Medical & Custody Letters',
    titleMr: 'वैद्यकीय तपासणी व बंदिगृह (लॉकअप) पत्रे',
    badge: '4 Letter Templates',
    badgeClass: 'badge-success',
    category: 'Medical & Custody',
    categoryMr: 'वैद्यकीय व बंदिगृह',
    description: 'Requisition letters for Medical Examination, Lockup Placement (PS), ACP Supervisory Intimation, and Custody Transfer/Handover.',
    descriptionMr: 'वैद्यकीय तपासणी विनंती पत्र, लॉकअप मागणी पत्र (पोलीस ठाणे), लॉकअप माहिती पत्र (मा. एसीपी), व आरोपी ताबा हस्तांतरण/सुटका पत्रे.',
    icon: 'folder-heart',
    subDocIds: ['medical', 'lockup_ps', 'lockup_acp', 'custody_transfer']
  }
];

/**
 * 4 Main Organized Dashboard Sections for Continuous Single-Page Display
 */
export const DASHBOARD_CATEGORIES = [
  {
    id: 'arrest_custody',
    category: 'Arrest & Custody',
    categoryMr: 'अटक व ताबा',
    titleMr: '१. अटक व ताबा दस्तऐवज',
    titleEn: 'Arrest & Custody Documents (Form III, Sanha & Statutory Notices)',
    descriptionMr: 'अटकेचा पंचनामा, कलम ३५(२) चेकलिस्ट, स्टेशन डायरी सान्हा व कलम ४७/४८ वैधानिक सूचना.',
    badge: '५ दस्तऐवज / 5 Templates',
    icon: 'memo',
    docIds: ['form3', 'notice_35_2', 'atak_sanha', 'notice_47', 'notice_48']
  },
  {
    id: 'court_remand',
    category: 'Court Remand',
    categoryMr: 'न्यायालयीन रिमांड',
    titleMr: '२. पोलीस कोठडी रिमांड (PCR)',
    titleEn: 'Police Custody Remand Application',
    descriptionMr: '११ कलमी गोषवारा तक्ता व बँक लेयर तपासासह मा. न्यायालयाकडे पोलीस कोठडी मागणी अर्ज.',
    badge: '१ अर्ज / 1 Application',
    icon: 'gavel',
    docIds: ['remand']
  },
  {
    id: 'court_permission',
    category: 'Court Permission',
    categoryMr: 'न्यायालयीन परवानगी',
    titleMr: '३. अटकेची परवानगी अर्ज',
    titleEn: 'Permission to Arrest Application',
    descriptionMr: 'इतर कारागृहातून प्रोडक्शन वॉरंटद्वारे हजर आरोपीस अटक करण्याची मा. न्यायालयासमक्ष परवानगी अर्ज.',
    badge: '१ अर्ज / 1 Application',
    icon: 'shield-check',
    docIds: ['arrest_permission']
  },
  {
    id: 'medical_custody',
    category: 'Medical & Custody',
    categoryMr: 'वैद्यकीय व बंदिगृह',
    titleMr: '४. वैद्यकीय तपासणी व बंदिगृह (लॉकअप) पत्रे',
    titleEn: 'Medical & Lockup Custody Requisition Letters',
    descriptionMr: 'वैद्यकीय तपासणी विनंती, पोलीस ठाणे बंदीगृह मागणी, एसीपी माहिती पत्र व ताबा हस्तांतरण पत्रे.',
    badge: '४ पत्रे / 4 Templates',
    icon: 'folder-heart',
    docIds: ['medical', 'lockup_ps', 'lockup_acp', 'custody_transfer']
  }
];

export const ARREST_CUSTODY_DOCUMENTS = [
  {
    id: 'form3',
    title: 'Arrest / Court Surrender Form — Form III',
    titleMr: '१. अटकेचा पंचनामा (Form III - Arrest Memo)',
    badge: 'Statutory Memo',
    badgeClass: 'badge-primary',
    descMr: 'आरोपीचा फोटो, शारीरिक वैशिष्ट्ये, अंगझडती, सामाजिक-आर्थिक माहिती व पंचांच्या सह्यांसह १७ कलमी वैधानिक नमुना.'
  },
  {
    id: 'notice_35_2',
    title: 'Section 35(2) BNSS Notice Checklist',
    titleMr: '२. ३५(२) नोटीस चेकलिस्ट (Sec 35(2) BNSS Notice Checklist)',
    badge: 'Checklist',
    badgeClass: 'badge-primary',
    descMr: 'भारतीय नागरिक सुरक्षा संहिता कलम ३५(१)(ब)(२) अन्वये आरोपीच्या अटकेचे आधार व कारणांबाबत मा. न्यायालयात सादर करावयाची चेकलिस्ट.'
  },
  {
    id: 'atak_sanha',
    title: 'Arrest Station Diary Entry (Atak Sanha)',
    titleMr: '३. अटक सान्हा नोंद (Station Diary Arrest Sanha Entry)',
    badge: 'Sanha Entry',
    badgeClass: 'badge-secondary',
    descMr: 'आरोपीच्या अटकेची पोलीस ठाणे स्टेशन डायरी (सान्हा) मधील अधिकृत नोंद व हकीकत.'
  },
  {
    id: 'notice_47',
    title: 'Section 47 BNSS Notice to Accused',
    titleMr: '४. ४७ नोटीस - आरोपीस सूचना (Sec 47 Notice to Accused)',
    badge: 'Accused Notice',
    badgeClass: 'badge-warning',
    descMr: 'भारतीय नागरिक सुरक्षा संहिता २०२३ कलम ४७ अन्वये आरोपीस अटकेची कारणे व जामीन हक्काबाबत दिली जाणारी लेखी सूचना.'
  },
  {
    id: 'notice_48',
    title: 'Section 48 BNSS Notice to Relative / Friend',
    titleMr: '५. ४८ नोटीस - नातेवाईकास सूचना (Sec 48 Notice to Relative)',
    badge: 'Relative Notice',
    badgeClass: 'badge-info',
    descMr: 'भारतीय नागरिक सुरक्षा संहिता २०२३ कलम ४८ अन्वये आरोपीच्या नातेवाईकास अटकेची माहिती व जामीन हक्काबाबत दिली जाणारी लेखी सूचना.'
  }
];

export const MEDICAL_CUSTODY_LETTERS = [
  {
    id: 'medical',
    title: 'Medical Examination Request Letter',
    titleMr: '१. वैद्यकीय तपासणी विनंती पत्र (Medical Examination Letter)',
    badge: 'Medical Officer',
    badgeClass: 'badge-info',
    descMr: 'आरोपीची सर्वसाधारण शारीरिक व वैद्यकीय तपासणी करणेबाबत शासकीय वैद्यकीय अधिकाऱ्यांना पत्र.'
  },
  {
    id: 'lockup_ps',
    title: 'Lockup Placement Request (Police Station)',
    titleMr: '२. लॉकअपमध्ये ठेवणेबाबत पत्र - पोलीस ठाणे (Lockup Placement PS)',
    badge: 'Inter-Station',
    badgeClass: 'badge-secondary',
    descMr: 'सायबर ठाण्यात बंदीगृह नसल्याने आरोपीस दुसऱ्या पोलीस ठाण्याच्या लॉकअपमध्ये ठेवण्याची विनंती पत्र.'
  },
  {
    id: 'lockup_acp',
    title: 'Lockup Placement Intimation (ACP Crime)',
    titleMr: '३. लॉकअपमध्ये ठेवणेबाबत पत्र - मा. सहा. पोलीस आयुक्त (Lockup ACP)',
    badge: 'Supervisory',
    badgeClass: 'badge-secondary',
    descMr: 'आरोपीस दुसऱ्या ठाण्याच्या बंदिगृहात ठेवण्याबाबत मा. सहायक पोलीस आयुक्त यांना माहिती पत्र.'
  },
  {
    id: 'custody_transfer',
    title: 'Accused Custody Transfer / Release Request Letter',
    titleMr: '४. आरोपी बंदिगृहातून ताब्यात मिळणेबाबत पत्र (Custody Transfer)',
    badge: 'Handover',
    badgeClass: 'badge-success',
    descMr: 'लॉकअपमध्ये ठेवलेल्या आरोपीस पुढील तपास किंवा न्यायालयीन हजेरीसाठी तात्पुरता ताब्यात मिळण्याबाबत पत्र.'
  }
];

export function getDocumentTypeById(id) {
  return DOCUMENT_TYPES.find(d => d.id === id) || DOCUMENT_TYPES[0];
}

