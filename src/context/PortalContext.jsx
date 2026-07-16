import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_EMPLOYEES,
  INITIAL_MEDICAL_RECORDS,
  INITIAL_FOLDERS,
  INITIAL_DOCUMENTS,
  INITIAL_PME_SCHEDULES,
} from '../utils/mockData';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const PortalContext = createContext(undefined);

export const PortalProvider = ({ children }) => {
  const { user } = useAuth();

  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('ccl_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [medicalRecords, setMedicalRecords] = useState(() => {
    const saved = localStorage.getItem('ccl_medical_records');
    return saved ? JSON.parse(saved) : INITIAL_MEDICAL_RECORDS;
  });

  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem('ccl_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [folders, setFolders] = useState(() => {
    const saved = localStorage.getItem('ccl_folders');
    return saved ? JSON.parse(saved) : INITIAL_FOLDERS;
  });

  const [pmeSchedules, setPmeSchedules] = useState(() => {
    const saved = localStorage.getItem('ccl_pme_schedules');
    return saved ? JSON.parse(saved) : INITIAL_PME_SCHEDULES;
  });

  // Load data from Supabase on mount/auth state change
  useEffect(() => {
    const loadSupabaseData = async () => {
      if (!user) return;
      try {
        // 1. Fetch employees
        const { data: dbEmployees, error: empError } = await supabase
          .from('employees')
          .select('*');

        if (empError) throw empError;

        // 2. Fetch medical records
        const { data: dbRecords, error: recError } = await supabase
          .from('medical_records')
          .select('*');

        if (recError) throw recError;

        if (dbEmployees && dbEmployees.length > 0) {
          const mappedEmployees = dbEmployees.map(emp => ({
            ...emp,
            complianceRating: emp.complianceRating ? parseFloat(emp.complianceRating) : 5.0
          }));
          setEmployees(mappedEmployees);

          if (dbRecords) {
            const mappedRecords = dbRecords.map(rec => {
              const correspondingEmp = mappedEmployees.find(e => e.employeeId === rec.employeeId);
              const empId = correspondingEmp ? correspondingEmp.id : rec.employeeId;

              const isCough = rec.examinerRemarks?.toLowerCase().includes('cough') || false;
              const isDyspnoea = rec.examinerRemarks?.toLowerCase().includes('dyspnoea') || 
                                 rec.examinerRemarks?.toLowerCase().includes('shortness of breath') || false;

              return {
                id: rec.id,
                employeeId: empId,
                examinationDate: rec.examinationDate,
                examinerName: rec.medicalOfficer || '',
                hospitalName: 'CCL Gandhinagar Hospital',
                vitals: {
                  bloodPressure: `${rec.systolicBP || 120}/${rec.diastolicBP || 80}`,
                  pulseRate: rec.pulseRate || 72,
                  respiratoryRate: rec.respiratoryRate || 16,
                  temperature: rec.temperature ? parseFloat(rec.temperature) : 98.6,
                  weight: rec.weight ? parseFloat(rec.weight) : 70,
                  height: rec.height ? parseFloat(rec.height) : 170,
                  bmi: rec.height > 0 ? parseFloat((parseFloat(rec.weight) / ((parseFloat(rec.height) / 100) * (parseFloat(rec.height) / 100))).toFixed(1)) : 22.5,
                  spo2: rec.spo2 || 98
                },
                spirometry: {
                  fvc: rec.fvc ? parseFloat(rec.fvc) : 4.2,
                  fev1: rec.fev1 ? parseFloat(rec.fev1) : 3.4,
                  ratio: rec.fev1Ratio || 0,
                  assessment: rec.spirometryOpinion || 'Normal'
                },
                audiometry: {
                  leftEar: 'Normal',
                  rightEar: 'Normal',
                  assessment: 'Hearing normal bilateral'
                },
                chestXray: {
                  iloClassification: rec.iloClassification || '0/0',
                  findings: rec.radiologyNotes || '',
                  status: rec.radiologyDiagnosis || 'Normal'
                },
                clinicalAnswers: {
                  chronicCough: isCough,
                  dyspnoea: isDyspnoea,
                  chestPain: false,
                  nightSweats: false,
                  smokingStatus: 'Never',
                  dustExposureYears: correspondingEmp ? correspondingEmp.totalServiceYears : 10
                },
                clinicalNotes: rec.examinerRemarks || '',
                fitnessRecommendation: rec.fitnessStatus || 'Fit',
                restrictionsList: rec.restrictions ? [rec.restrictions] : [],
                nextExamIntervalMonths: 12
              };
            });
            setMedicalRecords(mappedRecords);
          }
        }
      } catch (err) {
        console.error("Failed to load data from Supabase:", err);
      }
    };

    loadSupabaseData();
  }, [user]);

  useEffect(() => {
    localStorage.setItem('ccl_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('ccl_medical_records', JSON.stringify(medicalRecords));
  }, [medicalRecords]);

  useEffect(() => {
    localStorage.setItem('ccl_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('ccl_folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('ccl_pme_schedules', JSON.stringify(pmeSchedules));
  }, [pmeSchedules]);

  const addMedicalRecord = (recordData) => {
    const newRecordId = `rec-${Date.now()}`;
    const newRecord = {
      ...recordData,
      id: newRecordId,
    };

    setMedicalRecords((prev) => [newRecord, ...prev]);

    // Automatically trigger updates to the corresponding Employee
    setEmployees((prevEmployees) => {
      return prevEmployees.map((emp) => {
        if (emp.id === recordData.employeeId) {
          const nextDueDate = new Date();
          nextDueDate.setMonth(nextDueDate.getMonth() + recordData.nextExamIntervalMonths);
          const nextDueStr = nextDueDate.toISOString().split('T')[0];

          return {
            ...emp,
            pmeStatus: recordData.fitnessRecommendation,
            riskScore: recordData.riskScore !== undefined ? recordData.riskScore : emp.riskScore,
            riskCategory: recordData.riskCategory !== undefined ? recordData.riskCategory : emp.riskCategory,
            lastPmeDate: recordData.examinationDate,
            nextPmeDueDate: nextDueStr,
          };
        }
        return emp;
      });
    });

    // Automatically create a dynamic document pdf simulation for records list
    const correspondingEmployee = employees.find(e => e.id === recordData.employeeId);
    if (correspondingEmployee) {
      const docName = `PME_${correspondingEmployee.name.replace(/\s+/g, '_')}_${recordData.examinationDate.replace(/-/g, '')}.pdf`;
      const newDoc = {
        id: `doc-${Date.now()}`,
        name: docName,
        type: 'pdf',
        size: '1.4 MB',
        uploadedDate: recordData.examinationDate,
        uploadedBy: recordData.examinerName,
        category: 'PME Report',
        employeeId: recordData.employeeId,
        employeeName: correspondingEmployee.name,
        fileContentSummary: `CCL GANDHINAGAR HOSPITAL - PME RECORD DIGITIZED\nEmployee: ${correspondingEmployee.name}\nID: ${correspondingEmployee.employeeId}\nDate of Examination: ${recordData.examinationDate}\nExaminer: ${recordData.examinerName}\n\n[VITALS]\nBP: ${recordData.vitals.bloodPressure} mmHg | Pulse: ${recordData.vitals.pulseRate} bpm | SpO2: ${recordData.vitals.spo2}%\n\n[SPIROMETRY]\nFVC: ${recordData.spirometry.fvc}L | FEV1: ${recordData.spirometry.fev1}L | Ratio: ${recordData.spirometry.ratio}% | Type: ${recordData.spirometry.assessment}\n\n[CHEST X-RAY]\nILO Status: ${recordData.chestXray.iloClassification} | Chest Findings: ${recordData.chestXray.findings}\n\n[OPINION / RECOMMENDATION]\nRecommendation: ${recordData.fitnessRecommendation.toUpperCase()}\nPhysician Notes: ${recordData.clinicalNotes}`
      };
      addDocument(newDoc);
    }
  };

  const addPMESchedule = (scheduleData) => {
    const newSchedule = {
      ...scheduleData,
      id: `pme-sch-${Date.now()}`,
      completedCount: 0,
    };
    setPmeSchedules((prev) => [newSchedule, ...prev]);

    // Also update any employees in that department who are Overdue or scheduled
    if (scheduleData.status === 'Scheduled') {
      setEmployees((prevEmployees) => {
        return prevEmployees.map((emp) => {
          if (emp.department === scheduleData.department && emp.pmeStatus === 'Overdue') {
            return {
              ...emp,
              pmeStatus: 'Scheduled',
            };
          }
          return emp;
        });
      });
    }
  };

  const updatePMESchedule = (id, updatedFields) => {
    setPmeSchedules((prev) =>
      prev.map((sch) => {
        if (sch.id === id) {
          const merged = { ...sch, ...updatedFields };
          // If status isn't explicitly changed, automatically update it based on counts
          if (!updatedFields.hasOwnProperty('status')) {
            if (merged.completedCount >= merged.targetCount) {
              merged.status = 'Completed';
            } else if (merged.completedCount > 0) {
              merged.status = 'In-Progress';
            } else {
              merged.status = 'Scheduled';
            }
          }
          return merged;
        }
        return sch;
      })
    );
  };

  const updateEmployeePmeStatus = (employeeId, status) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === employeeId ? { ...emp, pmeStatus: status } : emp))
    );
  };

  const addDocument = (doc) => {
    setDocuments((prev) => [doc, ...prev]);
    // increment folder count
    const cat = doc.category;
    let folderCat = 'PME';
    if (cat === 'Chest X-Ray' || cat === 'X-Ray Report') folderCat = 'Radiology';
    else if (cat === 'Spirometry Profile' || cat === 'PFT Report') folderCat = 'Spirometry';
    else if (cat === 'Fitness Certificate' || cat === 'ECG Report' || cat === 'Other') folderCat = 'Certificates';

    setFolders((prevFolders) => {
      return prevFolders.map((f) => {
        if (f.category === folderCat) {
          return { ...f, count: f.count + 1 };
        }
        return f;
      });
    });
  };

  const deleteDocument = (docId) => {
    const targetDoc = documents.find(d => d.id === docId);
    if (!targetDoc) return;
    
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    
    // decrement folder count
    const cat = targetDoc.category;
    let folderCat = 'PME';
    if (cat === 'Chest X-Ray' || cat === 'X-Ray Report') folderCat = 'Radiology';
    else if (cat === 'Spirometry Profile' || cat === 'PFT Report') folderCat = 'Spirometry';
    else if (cat === 'Fitness Certificate' || cat === 'ECG Report' || cat === 'Other') folderCat = 'Certificates';

    setFolders((prevFolders) => {
      return prevFolders.map((f) => {
        if (f.category === folderCat) {
          return { ...f, count: Math.max(0, f.count - 1) };
        }
        return f;
      });
    });
  };

  const addEmployee = (emp) => {
    const newEmp = {
      ...emp,
      id: emp.id || `emp-${Date.now()}`,
      pmeStatus: emp.pmeStatus || 'Fit',
      riskScore: emp.riskScore || 0,
      riskCategory: emp.riskCategory || 'Low',
      lastPmeDate: emp.lastPmeDate || 'N/A',
      nextPmeDueDate: emp.nextPmeDueDate || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0], // 1 year from now
      complianceRating: 5.0
    };
    setEmployees((prev) => [...prev, newEmp]);
  };

  return (
    <PortalContext.Provider
      value={{
        employees,
        medicalRecords,
        documents,
        folders,
        pmeSchedules,
        addMedicalRecord,
        addPMESchedule,
        updatePMESchedule,
        updateEmployeePmeStatus,
        deleteDocument,
        addDocument,
        addEmployee,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};

export const usePortal = () => {
  const context = useContext(PortalContext);
  if (context === undefined) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
};
