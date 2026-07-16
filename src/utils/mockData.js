export const INITIAL_EMPLOYEES = [
  {
    id: "emp-1",
    name: "Daya Shankar",
    designation: "Mining Sirdar (Overman)",
    department: "Underground Mining",
    mineName: "Gidi-A Colliery",
    pmeStatus: "Fit with Restrictions",
    riskScore: 78,
    riskCategory: "High",
    age: 45,
    gender: "Male",
    bloodGroup: "O+",
    employeeId: "CCL104928",
    dateOfJoining: "2008-03-12",
    contactNo: "+91 94311 08291",
    email: "daya.shankar@ccl.gov.in",
    totalServiceYears: 18,
    lastPmeDate: "2025-11-20",
    nextPmeDueDate: "2026-11-20",
    complianceRating: 4.5
  },
  {
    id: "emp-2",
    name: "Shanti Devi",
    designation: "Data Entry Operator",
    department: "Administration",
    mineName: "Gandhinagar HQ Office",
    pmeStatus: "Fit",
    riskScore: 12,
    riskCategory: "Low",
    age: 38,
    gender: "Female",
    bloodGroup: "A+",
    employeeId: "CCL104952",
    dateOfJoining: "2015-08-24",
    contactNo: "+91 82103 44521",
    email: "shanti.devi@ccl.gov.in",
    totalServiceYears: 10,
    lastPmeDate: "2025-12-15",
    nextPmeDueDate: "2027-12-15",
    complianceRating: 5.0
  },
  {
    id: "emp-3",
    name: "Ramesh Prasad",
    designation: "HEMM Operator (Dumper)",
    department: "Excavation",
    mineName: "Piparwar Opencast Mine",
    pmeStatus: "Fit with Restrictions",
    riskScore: 48,
    riskCategory: "Medium",
    age: 52,
    gender: "Male",
    bloodGroup: "B+",
    employeeId: "CCL102143",
    dateOfJoining: "2001-05-18",
    contactNo: "+91 98351 12049",
    email: "ramesh.prasad@ccl.gov.in",
    totalServiceYears: 25,
    lastPmeDate: "2025-10-10",
    nextPmeDueDate: "2026-10-10",
    complianceRating: 4.0
  },
  {
    id: "emp-4",
    name: "Vikram Singh",
    designation: "Shovel Operator",
    department: "Opencast Mining",
    mineName: "Amrapali OCP",
    pmeStatus: "Fit",
    riskScore: 28,
    riskCategory: "Low",
    age: 29,
    gender: "Male",
    bloodGroup: "O-",
    employeeId: "CCL109156",
    dateOfJoining: "2021-11-01",
    contactNo: "+91 79922 40591",
    email: "vikram.singh21@ccl.gov.in",
    totalServiceYears: 4,
    lastPmeDate: "2026-02-18",
    nextPmeDueDate: "2028-02-18",
    complianceRating: 4.8
  },
  {
    id: "emp-5",
    name: "Anil Soren",
    designation: "Coal Loader",
    department: "Underground Mining",
    mineName: "Religara Colliery",
    pmeStatus: "Overdue",
    riskScore: 84,
    riskCategory: "High",
    age: 44,
    gender: "Male",
    bloodGroup: "AB+",
    employeeId: "CCL103289",
    dateOfJoining: "2006-11-15",
    contactNo: "+91 70041 83204",
    email: "anil.soren@ccl.gov.in",
    totalServiceYears: 19,
    lastPmeDate: "2024-05-10",
    nextPmeDueDate: "2025-05-10",
    complianceRating: 2.5
  },
  {
    id: "emp-6",
    name: "Savita Mahto",
    designation: "Belt Conveyor Attendant",
    department: "Coal Handling Plant",
    mineName: "Rajrappa Washery",
    pmeStatus: "Scheduled",
    riskScore: 54,
    riskCategory: "Medium",
    age: 33,
    gender: "Female",
    bloodGroup: "B-",
    employeeId: "CCL108221",
    dateOfJoining: "2018-02-20",
    contactNo: "+91 91223 44520",
    email: "savita.mahto@ccl.gov.in",
    totalServiceYears: 8,
    lastPmeDate: "2024-06-20",
    nextPmeDueDate: "2026-06-20",
    complianceRating: 3.8
  },
  {
    id: "emp-7",
    name: "Meena Oraon",
    designation: "Support Man",
    department: "Underground Mining",
    mineName: "Gidi-A Colliery",
    pmeStatus: "Fit",
    riskScore: 35,
    riskCategory: "Medium",
    age: 31,
    gender: "Female",
    bloodGroup: "A-",
    employeeId: "CCL110190",
    dateOfJoining: "2022-04-10",
    contactNo: "+91 88771 93012",
    email: "meena.oraon@ccl.gov.in",
    totalServiceYears: 4,
    lastPmeDate: "2025-04-10",
    nextPmeDueDate: "2027-04-10",
    complianceRating: 4.2
  },
  {
    id: "emp-8",
    name: "Bipin Bihari",
    designation: "Mining Sirdar",
    department: "Underground Mining",
    mineName: "Religara Colliery",
    pmeStatus: "Overdue",
    riskScore: 92,
    riskCategory: "High",
    age: 58,
    gender: "Male",
    bloodGroup: "O+",
    employeeId: "CCL101034",
    dateOfJoining: "1995-09-01",
    contactNo: "+91 94311 12345",
    email: "bipin.bihari@ccl.gov.in",
    totalServiceYears: 31,
    lastPmeDate: "2024-03-24",
    nextPmeDueDate: "2025-03-24",
    complianceRating: 1.8
  }
];

export const INITIAL_MEDICAL_RECORDS = [
  {
    id: "rec-1",
    employeeId: "emp-1",
    examinationDate: "2025-11-20",
    examinerName: "Dr. B. N. Prasad (Chest Specialist)",
    hospitalName: "CCL Gandhinagar Hospital",
    vitals: {
      bloodPressure: "135/85",
      pulseRate: 78,
      respiratoryRate: 19,
      temperature: 98.4,
      weight: 72,
      height: 168,
      bmi: 25.5,
      spo2: 96
    },
    spirometry: {
      fvc: 3.42,
      fev1: 2.32,
      ratio: 67.8,
      assessment: "Obstructive (Mild-to-Moderate)"
    },
    audiometry: {
      leftEar: "Mild Loss (High Frequency)",
      rightEar: "Normal",
      assessment: "Occupational Noise Induced Notch at 4kHz"
    },
    chestXray: {
      iloClassification: "1/1 q",
      findings: "Sub-segmental reticular opacities noted in bilateral lower zones, consistent with dust inhalation. No evidence of active Koch's (Tuberculosis).",
      status: "Suspect Silicosis"
    },
    clinicalAnswers: {
      chronicCough: true,
      dyspnoea: true,
      chestPain: false,
      nightSweats: false,
      smokingStatus: "Former",
      dustExposureYears: 18
    },
    clinicalNotes: "Patient reports progressive mild dyspnoea on walking slopes in underground workings. Sputum negative for AFB. Chest X-Ray ILO category 1/1 q indicates early pneumoconiosis/coal workers pneumoconiosis (CWP). Mild obstructive deficit on Spirometry. Recommend strict dust-free deployment.",
    fitnessRecommendation: "Fit with Restrictions",
    restrictionsList: [
      "No placement in high dust zones (underground drilling or coal face operations)",
      "Mandatory usage of double particulate respirator (N95/FFP2)",
      "Repeat chest evaluation and PFT every 6 months instead of 1 year"
    ],
    nextExamIntervalMonths: 6
  },
  {
    id: "rec-2",
    employeeId: "emp-3",
    examinationDate: "2025-10-10",
    examinerName: "Dr. S. K. Mahapatra (Physician)",
    hospitalName: "CCL Gandhinagar Hospital",
    vitals: {
      bloodPressure: "154/96",
      pulseRate: 82,
      respiratoryRate: 16,
      temperature: 98.6,
      weight: 84,
      height: 172,
      bmi: 28.4,
      spo2: 98
    },
    spirometry: {
      fvc: 4.1,
      fev1: 3.4,
      ratio: 82.9,
      assessment: "Normal"
    },
    audiometry: {
      leftEar: "Normal",
      rightEar: "Normal",
      assessment: "Hearing normal bilateral"
    },
    chestXray: {
      iloClassification: "0/0",
      findings: "Clear lung fields, cardiac silhouette within normal limits.",
      status: "Normal"
    },
    clinicalAnswers: {
      chronicCough: false,
      dyspnoea: false,
      chestPain: false,
      nightSweats: false,
      smokingStatus: "Never",
      dustExposureYears: 25
    },
    clinicalNotes: "Asymptomatic from a respiratory standpoint. Moderately elevated BP (154/96 mmHg). Cardiac assessment shows essential hypertension. Prescribed Telmisartan 40mg. Restrict heavy lifting until BP stabilized under 140/90.",
    fitnessRecommendation: "Fit with Restrictions",
    restrictionsList: [
      "Avoid direct continuous exposure to thermal extremes (dumper operations with non-functional AC)",
      "Weekly blood pressure monitoring at mine dispensary",
      "Avoid heavy physical lifting above 20kg"
    ],
    nextExamIntervalMonths: 12
  },
  {
    id: "rec-3",
    employeeId: "emp-5",
    examinationDate: "2024-05-10",
    examinerName: "Dr. A. K. Choudhury",
    hospitalName: "CCL Regional Dispensary, Religara",
    vitals: {
      bloodPressure: "142/90",
      pulseRate: 88,
      respiratoryRate: 21,
      temperature: 98.2,
      weight: 65,
      height: 165,
      bmi: 23.9,
      spo2: 94
    },
    spirometry: {
      fvc: 3.12,
      fev1: 2.15,
      ratio: 68.9,
      assessment: "Obstructive"
    },
    audiometry: {
      leftEar: "Mild Loss",
      rightEar: "Mild Loss",
      assessment: "Mild sensorineural loss"
    },
    chestXray: {
      iloClassification: "1/0 p",
      findings: "Bilateral prominent bronchovascular markings, early micronodular changes in middle fields.",
      status: "Pneumoconiosis Suspect"
    },
    clinicalAnswers: {
      chronicCough: true,
      dyspnoea: true,
      chestPain: true,
      nightSweats: false,
      smokingStatus: "Active",
      dustExposureYears: 19
    },
    clinicalNotes: "Loader working underground face for 19 years. Prominent cough. Scheduled for higher referral at Gandhinagar Hospital, but missed his follow-up. Emergency immediate PME is ordered.",
    fitnessRecommendation: "Unfit",
    restrictionsList: [
      "To be withdrawn from underground face mining immediately pending complete hospital panel review"
    ],
    nextExamIntervalMonths: 1
  }
];

export const INITIAL_FOLDERS = [
  { id: "fold-1", name: "Periodic Medical Exams (PME)", count: 182, category: "PME" },
  { id: "fold-2", name: "Initial Medical Exams (IME)", count: 48, category: "IME" },
  { id: "fold-3", name: "Radiology & X-Ray Reports", count: 215, category: "Radiology" },
  { id: "fold-4", name: "Spirometry (PFT) Logs", count: 110, category: "Spirometry" },
  { id: "fold-5", name: "Fitness & Medical Board Certs", count: 95, category: "Certificates" }
];

export const INITIAL_DOCUMENTS = [
  {
    id: "doc-1",
    name: "PME_Rajesh_Kumar_Nov2025.pdf",
    type: "pdf",
    size: "1.8 MB",
    uploadedDate: "2025-11-21",
    uploadedBy: "Dr. B. N. Prasad",
    category: "PME Report",
    employeeId: "emp-1",
    employeeName: "Rajesh Kumar",
    fileContentSummary: "CCL GANDHINAGAR HOSPITAL - PERIODICAL MEDICAL EXAMINATION\nEmployee. Rajesh Kumar, Mining Sirdar\nEmployee ID: CCL104928 | Mine: Gidi-A\nSpirometry: FVC=3.42L, FEV1=2.32L, Ratio=67.8% (Obstructive Profile).\nChest X-Ray: Sub-segmental nodules consistent with early Coal Worker's Pneumoconiosis. ILO Classification 1/1 q.\nAction: Re-designated Fit with dry dust-free restrictions. Re-examine in 6 months."
  },
  {
    id: "doc-2",
    name: "CXray_Rajesh_Kumar_Nov2025.img",
    type: "image",
    size: "8.4 MB",
    uploadedDate: "2025-11-20",
    uploadedBy: "Dr. R. K. Sharan",
    category: "Chest X-Ray",
    employeeId: "emp-1",
    employeeName: "Rajesh Kumar",
    fileContentSummary: "DIGITAL CHEST RADIOGRAPH - REAR/POSTERIOR-ANTERIOR VIEW\nID: CCL104928_PME2025\nShadow density: ILO Classification 1/1 q.\nNo cavitation, apical pleural thickening absent, diaphragmatic angles sharp.\nConclusion: Early occupational pneumoconiotic tissue changes."
  },
  {
    id: "doc-3",
    name: "PFT_Ramesh_Prasad_Oct2025.pdf",
    type: "pdf",
    size: "1.2 MB",
    uploadedDate: "2025-10-10",
    uploadedBy: "Dr. S. K. Mahapatra",
    category: "Spirometry Profile",
    employeeId: "emp-3",
    employeeName: "Ramesh Prasad",
    fileContentSummary: "SPIROMETRY REPORT (PFT)\nPatient: Ramesh Prasad (Age 52)\nFVC: 4.10L (96% predicted)\nFEV1: 3.40L (98% predicted)\nRatio: 82.9% (Normal)\nComments: Excellent efforts. Airway mechanics normal."
  },
  {
    id: "doc-4",
    name: "Fitness_Certificate_Ramesh_Prasad.pdf",
    type: "pdf",
    size: "450 KB",
    uploadedDate: "2025-10-11",
    uploadedBy: "Dr. S. K. Mahapatra",
    category: "Fitness Certificate",
    employeeId: "emp-3",
    employeeName: "Ramesh Prasad",
    fileContentSummary: "FORM O - CERTIFICATE OF FITNESS FOR COAL MINE WORKERS\nI hereby certify that I have examined Ramesh Prasad, HEMM Operator, and find him fit for dry duties with restrictions. Blood pressure high (154/96). Authorized restriction: weekly BP logging, restricted manual heavy weights, climate-controlled excavator cabins preferred."
  },
  {
    id: "doc-5",
    name: "PME_Anil_Soren_May2024.pdf",
    type: "pdf",
    size: "2.1 MB",
    uploadedDate: "2024-05-11",
    uploadedBy: "Dr. A. K. Choudhury",
    category: "PME Report",
    employeeId: "emp-5",
    employeeName: "Anil Soren",
    fileContentSummary: "FORM 'O' - PERIODICAL MEDICAL EXAMINATION REGISTER\nAnil Soren, Coal Loader, Religara.\nILO chest status: 1/0 p.\nSpirometry: 68.9% ratio.\nFinal Opinion: Temp Unfit, advised immediate specialist consult in Gandhinagar Chest Dept."
  }
];

export const INITIAL_PME_SCHEDULES = [
  {
    id: "pme-sch-1",
    batchName: "Gidi-A Sirdars & Overmen Batch B",
    department: "Underground Mining",
    targetCount: 15,
    completedCount: 12,
    scheduledDate: "2026-06-20",
    status: "Scheduled",
    mineName: "Gidi-A Colliery"
  },
  {
    id: "pme-sch-2",
    batchName: "Piparwar Operator Batch A",
    department: "Excavation",
    targetCount: 22,
    completedCount: 22,
    scheduledDate: "2026-06-11",
    status: "Completed",
    mineName: "Piparwar Opencast Mine"
  },
  {
    id: "pme-sch-3",
    batchName: "Religara Underground face crew A",
    department: "Underground Mining",
    targetCount: 30,
    completedCount: 5,
    scheduledDate: "2026-06-18",
    status: "In-Progress",
    mineName: "Religara Colliery"
  },
  {
    id: "pme-sch-4",
    batchName: "Gandhinagar HQ Office Admin PME",
    department: "Administration",
    targetCount: 18,
    completedCount: 0,
    scheduledDate: "2026-06-28",
    status: "Draft",
    mineName: "Gandhinagar HQ Office"
  }
];

export const RISK_TRAJECTORY_MOCK = {
  "emp-1": [
    { date: "2022-11-15", spirometryFVC: 4.10, spirometryFEV1: 3.32, riskScore: 32, systolicBP: 124 },
    { date: "2023-11-18", spirometryFVC: 3.82, spirometryFEV1: 2.95, riskScore: 48, systolicBP: 128 },
    { date: "2024-11-20", spirometryFVC: 3.61, spirometryFEV1: 2.58, riskScore: 62, systolicBP: 130 },
    { date: "2025-11-20", spirometryFVC: 3.42, spirometryFEV1: 2.32, riskScore: 78, systolicBP: 135 }
  ]
};
