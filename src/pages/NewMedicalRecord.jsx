import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  Users,
  Heart,
  Activity,
  FileText,
  Clock,
  ShieldCheck,
  Stethoscope,
  Info,
  ChevronDown,
  ShieldAlert
} from 'lucide-react';
import { usePortal } from '../context/PortalContext';
import { supabase } from '../supabaseClient';
import { validateName, validateBP, validateTemperature, validateWeight, validateHeight, validateSpo2, sanitizeInput } from '../utils/securityValidation';

export const NewMedicalRecord = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { employees, addMedicalRecord } = usePortal();

  // Try to pre-populate employee from state
  const stateEmployeeId = location.state?.selectedEmployeeId || '';

  // Form states
  const [employeeId, setEmployeeId] = useState(stateEmployeeId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dbError, setDbError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [examinerName, setExaminerName] = useState('Dr. B. N. Prasad');
  const [examinationDate, setExaminationDate] = useState(new Date().toISOString().split('T')[0]);

  // Vitals
  const [bpSystolic, setBpSystolic] = useState('120');
  const [bpDiastolic, setBpDiastolic] = useState('80');
  const [pulseRate, setPulseRate] = useState('72');
  const [respiratoryRate, setRespiratoryRate] = useState('16');
  const [temperature, setTemperature] = useState('98.6');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('170');
  const [spo2, setSpo2] = useState('98');

  // Spirometry (PFT)
  const [fvc, setFvc] = useState('4.20');
  const [fev1, setFev1] = useState('3.40');
  const [spirometryAssessment, setSpirometryAssessment] = useState('Normal');

  // Audiometry
  const [leftEar, setLeftEar] = useState('Normal');
  const [rightEar, setRightEar] = useState('Normal');
  const [audiometryAssessment, setAudiometryAssessment] = useState('Hearing normal bilateral');

  // XRay
  const [iloClassification, setIloClassification] = useState('0/0');
  const [xrayFindings, setXrayFindings] = useState('Lungs clear, cardiac silhouette normal');
  const [xrayStatus, setXrayStatus] = useState('Normal');

  // Survey
  const [chronicCough, setChronicCough] = useState(false);
  const [dyspnoea, setDyspnoea] = useState(false);
  const [chestPain, setChestPain] = useState(false);
  const [nightSweats, setNightSweats] = useState(false);
  const [smokingStatus, setSmokingStatus] = useState('Never');
  const [dustExposureYears, setDustExposureYears] = useState('10');

  // Decision
  const [clinicalNotes, setClinicalNotes] = useState('Regular chest screening completed. Heart sounds normal. Clear vesicular breath sounds.');
  const [fitnessRecommendation, setFitnessRecommendation] = useState('Fit');
  const [restrictions, setRestrictions] = useState('Double respirator particulate face mask recommended at mine underground operations.');
  const [nextExamInterval, setNextExamInterval] = useState('12');

  // Dynamically estimate ratio FEV1/FVC as percentage
  const spirometryRatio = parseFloat(fvc) > 0 ? Math.round((parseFloat(fev1) / parseFloat(fvc)) * 100) : 0;

  // Sync state if selected target changes
  useEffect(() => {
    if (stateEmployeeId) {
      setEmployeeId(stateEmployeeId);
      const matched = employees.find(e => e.id === stateEmployeeId);
      if (matched) {
        setDustExposureYears(matched.totalServiceYears.toString());
      }
    }
  }, [stateEmployeeId, employees]);

  // Adjust prefilled values when a user selects a different employee in the dropdown
  const handleEmployeeToggle = (e) => {
    const val = e.target.value;
    setEmployeeId(val);
    const matched = employees.find(e => e.id === val);
    if (matched) {
      setDustExposureYears(matched.totalServiceYears.toString());
      // Suggest status fitting his history
      if (matched.riskScore > 60) {
        setFitnessRecommendation('Fit with Restrictions');
        setIloClassification('1/1 q');
        setXrayStatus('Pneumoconiosis Suspect');
        setFev1('2.40');
        setSpirometryAssessment('Obstructive');
      } else {
        setFitnessRecommendation('Fit');
        setIloClassification('0/0');
        setXrayStatus('Normal');
        setFvc('4.20');
        setFev1('3.50');
        setSpirometryAssessment('Normal');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDbError('');
    setFormErrors({});

    if (!employeeId) {
      setError('Please select an active Employee to submit medical records.');
      return;
    }

    const sanitizedExaminer = sanitizeInput(examinerName);
    const sanitizedBPSystolic = sanitizeInput(bpSystolic);
    const sanitizedBPDiastolic = sanitizeInput(bpDiastolic);
    const sanitizedPulse = sanitizeInput(pulseRate);
    const sanitizedRespRate = sanitizeInput(respiratoryRate);
    const sanitizedTemp = sanitizeInput(temperature);
    const sanitizedWeight = sanitizeInput(weight);
    const sanitizedHeight = sanitizeInput(height);
    const sanitizedSpo2 = sanitizeInput(spo2);
    const sanitizedIlo = sanitizeInput(iloClassification);
    const sanitizedXrayFindings = sanitizeInput(xrayFindings);
    const sanitizedClinicalNotes = sanitizeInput(clinicalNotes);
    const sanitizedRestrictions = sanitizeInput(restrictions);

    // Sync sanitized states
    setExaminerName(sanitizedExaminer);
    setBpSystolic(sanitizedBPSystolic);
    setBpDiastolic(sanitizedBPDiastolic);
    setPulseRate(sanitizedPulse);
    setRespiratoryRate(sanitizedRespRate);
    setTemperature(sanitizedTemp);
    setWeight(sanitizedWeight);
    setHeight(sanitizedHeight);
    setSpo2(sanitizedSpo2);
    setIloClassification(sanitizedIlo);
    setXrayFindings(sanitizedXrayFindings);
    setClinicalNotes(sanitizedClinicalNotes);
    setRestrictions(sanitizedRestrictions);

    // Client-side validations
    const examinerErr = validateName(sanitizedExaminer);
    const bpErr = validateBP(sanitizedBPSystolic, sanitizedBPDiastolic);
    const tempErr = validateTemperature(sanitizedTemp);
    const weightErr = validateWeight(sanitizedWeight);
    const heightErr = validateHeight(sanitizedHeight);
    const spo2Err = validateSpo2(sanitizedSpo2);

    let pulseErr = null;
    if (!sanitizedPulse) {
      pulseErr = "Pulse rate is required.";
    } else if (isNaN(Number(sanitizedPulse)) || Number(sanitizedPulse) < 30 || Number(sanitizedPulse) > 200) {
      pulseErr = "Pulse rate must be between 30 and 200 bpm.";
    }

    let respErr = null;
    if (!sanitizedRespRate) {
      respErr = "Respiratory rate is required.";
    } else if (isNaN(Number(sanitizedRespRate)) || Number(sanitizedRespRate) < 5 || Number(sanitizedRespRate) > 60) {
      respErr = "Respiratory rate must be between 5 and 60 bpm.";
    }

    let notesErr = null;
    if (!sanitizedClinicalNotes) {
      notesErr = "Clinical notes are required.";
    } else if (sanitizedClinicalNotes.length < 5) {
      notesErr = "Clinical notes must be at least 5 characters.";
    }

    const errors = {};
    if (examinerErr) errors.examinerName = examinerErr;
    if (bpErr) errors.bp = bpErr;
    if (tempErr) errors.temperature = tempErr;
    if (weightErr) errors.weight = weightErr;
    if (heightErr) errors.height = heightErr;
    if (spo2Err) errors.spo2 = spo2Err;
    if (pulseErr) errors.pulseRate = pulseErr;
    if (respErr) errors.respiratoryRate = respErr;
    if (notesErr) errors.clinicalNotes = notesErr;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setError('Please correct the validation errors below.');
      return;
    }

    try {
      setLoading(true);

      // Calculations
      const mass = parseFloat(sanitizedWeight) || 70;
      const size = parseFloat(sanitizedHeight) || 170;
      const computedBMI = size > 0 ? parseFloat((mass / ((size / 100) * (size / 100))).toFixed(1)) : 22.5;

      // Resolve database employeeId and local mock id
      const selectedEmp = employees.find(e => e.id === employeeId);
      const dbEmployeeId = selectedEmp ? selectedEmp.employeeId : employeeId;

      // 1. Blood Pressure: If systolicBP > 140 OR diastolicBP > 90: add 20 points
      let bpPoints = 0;
      const systolic = parseInt(sanitizedBPSystolic) || 120;
      const diastolic = parseInt(sanitizedBPDiastolic) || 80;
      if (systolic > 140 || diastolic > 90) {
        bpPoints = 20;
      }

      // 2. SpO2: >=95 : +0, 90–94 : +15, <90 : +25
      let spo2Points = 0;
      const spo2Val = parseInt(sanitizedSpo2) || 98;
      if (spo2Val < 90) {
        spo2Points = 25;
      } else if (spo2Val >= 90 && spo2Val <= 94) {
        spo2Points = 15;
      }

      // 3. Lung Function (FEV1/FVC Ratio): >=70 : +0, 60–69 : +20, <60 : +35
      let ratioPoints = 0;
      if (spirometryRatio < 60) {
        ratioPoints = 35;
      } else if (spirometryRatio >= 60 && spirometryRatio < 70) {
        ratioPoints = 20;
      }

      // 4. Dust Exposure Level: Low : +0, Medium : +10, High : +20
      let dustPoints = 0;
      const dustLevel = selectedEmp?.dustExposureLevel || 'Low';
      if (dustLevel === 'High') {
        dustPoints = 20;
      } else if (dustLevel === 'Medium') {
        dustPoints = 10;
      }

      // 5. Years in Mining Service: <10 years : +0, 10–20 years : +10, >20 years : +20
      let servicePoints = 0;
      const serviceYears = selectedEmp ? selectedEmp.totalServiceYears : (parseInt(dustExposureYears) || 0);
      if (serviceYears > 20) {
        servicePoints = 20;
      } else if (serviceYears >= 10 && serviceYears <= 20) {
        servicePoints = 10;
      }

      // Calculate total risk score and category
      const calculatedRiskScore = bpPoints + spo2Points + ratioPoints + dustPoints + servicePoints;
      
      const calculatedRiskCategory = 
        calculatedRiskScore >= 60 ? 'High' : 
        calculatedRiskScore >= 30 ? 'Medium' : 
        'Low';

      // Auto-generate Fitness Recommendation: Low → Fit, Medium → Fit with Restrictions, High → Temporary Unfit
      const calculatedFitnessRecommendation = 
        calculatedRiskCategory === 'High' ? 'Temporary Unfit' : 
        calculatedRiskCategory === 'Medium' ? 'Fit with Restrictions' : 
        'Fit';

      const recordData = {
        employeeId,
        examinationDate,
        examinerName: sanitizedExaminer,
        hospitalName: 'CCL Gandhinagar Hospital',
        vitals: {
          bloodPressure: `${sanitizedBPSystolic}/${sanitizedBPDiastolic}`,
          pulseRate: parseInt(sanitizedPulse) || 72,
          respiratoryRate: parseInt(sanitizedRespRate) || 16,
          temperature: parseFloat(sanitizedTemp) || 98.6,
          weight: mass,
          height: size,
          bmi: computedBMI,
          spo2: parseInt(sanitizedSpo2) || 98,
        },
        spirometry: {
          fvc: parseFloat(fvc) || 4.2,
          fev1: parseFloat(fev1) || 3.4,
          ratio: spirometryRatio,
          assessment: spirometryAssessment,
        },
        audiometry: {
          leftEar,
          rightEar,
          assessment: audiometryAssessment,
        },
        chestXray: {
          iloClassification: sanitizedIlo,
          findings: sanitizedXrayFindings,
          status: xrayStatus,
        },
        clinicalAnswers: {
          chronicCough,
          dyspnoea,
          chestPain,
          nightSweats,
          smokingStatus,
          dustExposureYears: parseInt(dustExposureYears) || 10,
        },
        clinicalNotes: sanitizedClinicalNotes,
        fitnessRecommendation: calculatedFitnessRecommendation,
        restrictionsList: calculatedFitnessRecommendation === 'Fit with Restrictions' ? [sanitizedRestrictions] : [],
        nextExamIntervalMonths: parseInt(nextExamInterval) || 12,
        riskScore: calculatedRiskScore,
        riskCategory: calculatedRiskCategory,
      };

      const dbRecord = {
        employeeId: dbEmployeeId,
        examinationDate,
        medicalOfficer: sanitizedExaminer,
        systolicBP: parseInt(sanitizedBPSystolic) || 120,
        diastolicBP: parseInt(sanitizedBPDiastolic) || 80,
        pulseRate: parseInt(sanitizedPulse) || 72,
        respiratoryRate: parseInt(sanitizedRespRate) || 16,
        temperature: parseFloat(sanitizedTemp) || 98.6,
        weight: mass,
        height: size,
        spo2: parseInt(sanitizedSpo2) || 98,
        fvc: parseFloat(fvc) || 4.2,
        fev1: parseFloat(fev1) || 3.4,
        fev1Ratio: spirometryRatio,
        spirometryOpinion: spirometryAssessment,
        iloClassification: sanitizedIlo,
        radiologyDiagnosis: xrayStatus,
        radiologyNotes: sanitizedXrayFindings,
        riskScore: calculatedRiskScore,
        riskCategory: calculatedRiskCategory,
        fitnessStatus: calculatedFitnessRecommendation,
        restrictions: calculatedFitnessRecommendation === 'Fit with Restrictions' ? sanitizedRestrictions : '',
        examinerRemarks: sanitizedClinicalNotes
      };

      // 1. Insert exam record into Supabase
      const { error: insertError } = await supabase
        .from('medical_records')
        .insert([dbRecord]);

      if (insertError) {
        setDbError(insertError.message || 'Supabase medical_records insert failed.');
        throw insertError;
      }

      // 2. Update stats on employee record in Supabase
      const nextDueDate = new Date();
      nextDueDate.setMonth(nextDueDate.getMonth() + (parseInt(nextExamInterval) || 12));
      const nextDueStr = nextDueDate.toISOString().split('T')[0];

      const { error: employeeUpdateError } = await supabase
        .from('employees')
        .update({
          pmeStatus: calculatedFitnessRecommendation,
          riskScore: calculatedRiskScore,
          riskCategory: calculatedRiskCategory,
          lastPmeDate: examinationDate,
          nextPmeDueDate: nextDueStr
        })
        .eq('employeeId', dbEmployeeId);

      if (employeeUpdateError) {
        console.error("Failed to update employee stats in Supabase:", employeeUpdateError);
        setDbError(employeeUpdateError.message || 'Failed to update employee in database.');
        throw employeeUpdateError;
      }

      // 3. Sync local context state
      addMedicalRecord(recordData);

      navigate(`/profile/${dbEmployeeId}`);
    } catch (err) {
      console.error("Error saving medical record:", err);
      setError(err.message || 'Failed to save examination record to database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div>
        <h2 className="font-display text-3xl font-black tracking-tight text-slate-950">Form O: Create Medical Examination</h2>
        <p className="text-sm text-slate-500 font-medium">Document respiratory compliance, lung volume indices, chest radiography data, and occupational capabilities.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 flex items-start gap-3 text-xs text-rose-700 animate-shake">
          <ShieldAlert className="h-5 w-5 shrink-0 text-rose-500" />
          <div className="space-y-1">
            <p className="font-bold">Assessment Recording Alert</p>
            <p className="font-medium text-rose-600/90 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Section 1: Target Selector & Metadata */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-2.5 border-slate-100">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="font-display font-bold text-slate-950 text-sm tracking-tight">Select Coal Miner / Employee</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label htmlFor="employee-select" className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Select Worker</label>
              <div className="relative">
                <select
                  id="employee-select"
                  value={employeeId}
                  onChange={handleEmployeeToggle}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none font-bold text-slate-800"
                  required
                >
                  <option value="">-- Choose active personnel --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.employeeId} - {emp.designation})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 pointer-events-none text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="examiner-name" className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Medical Officer / Examiner Name</label>
              <input
                id="examiner-name"
                type="text"
                value={examinerName}
                onChange={(e) => setExaminerName(e.target.value)}
                className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:ring-1 font-bold text-slate-800 focus:bg-white ${
                  formErrors.examinerName 
                    ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-blue-500'
                }`}
                required
              />
              {formErrors.examinerName && (
                <p className="text-rose-600 text-[10px] font-bold mt-1">{formErrors.examinerName}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="examination-date" className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Date of Physical Examination</label>
              <input
                id="examination-date"
                type="date"
                value={examinationDate}
                onChange={(e) => setExaminationDate(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-800"
                required
              />
            </div>
          </div>
        </div>

        {/* Card Section 2: Patient Vitals Sheet */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-2.5 border-slate-100">
            <Heart className="h-5 w-5 text-blue-600" />
            <h3 className="font-display font-bold text-slate-950 text-sm tracking-tight">Patient Vitals Card</h3>
          </div>

          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <div className="space-y-1.5">
              <label htmlFor="bp-systolic" className="text-[10px] font-mono font-bold text-slate-400 uppercase">SYS Blood Pressure</label>
              <input
                id="bp-systolic"
                type="text"
                value={bpSystolic}
                onChange={(e) => setBpSystolic(e.target.value)}
                placeholder="Systolic (e.g. 120)"
                className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:bg-white ${
                  formErrors.bp 
                    ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-blue-500'
                }`}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="bp-diastolic" className="text-[10px] font-mono font-bold text-slate-400 uppercase">DIA Blood Pressure</label>
              <input
                id="bp-diastolic"
                type="text"
                value={bpDiastolic}
                onChange={(e) => setBpDiastolic(e.target.value)}
                placeholder="Diastolic (e.g. 80)"
                className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:bg-white ${
                  formErrors.bp 
                    ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-blue-500'
                }`}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pulse-rate" className="text-[10px] font-mono font-bold text-slate-400 uppercase">Pulse Rate (bpm)</label>
              <input
                id="pulse-rate"
                type="number"
                value={pulseRate}
                onChange={(e) => setPulseRate(e.target.value)}
                className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:bg-white ${
                  formErrors.pulseRate 
                    ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-blue-500'
                }`}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="respiratory-rate" className="text-[10px] font-mono font-bold text-slate-400 uppercase">Respiratory Rate (bpm)</label>
              <input
                id="respiratory-rate"
                type="number"
                value={respiratoryRate}
                onChange={(e) => setRespiratoryRate(e.target.value)}
                className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:bg-white ${
                  formErrors.respiratoryRate 
                    ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-blue-500'
                }`}
                required
              />
            </div>

            {formErrors.bp && (
              <div className="col-span-2 text-rose-600 text-[10px] font-bold mt-1">{formErrors.bp}</div>
            )}
            {formErrors.pulseRate && (
              <div className="col-span-1 text-rose-600 text-[10px] font-bold mt-1">{formErrors.pulseRate}</div>
            )}
            {formErrors.respiratoryRate && (
              <div className="col-span-1 text-rose-600 text-[10px] font-bold mt-1">{formErrors.respiratoryRate}</div>
            )}

            <div className="space-y-1.5 col-span-1">
              <label htmlFor="temp" className="text-[10px] font-mono font-bold text-slate-400 uppercase">Temperature (°F)</label>
              <input
                id="temp"
                type="text"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:bg-white ${
                  formErrors.temperature 
                    ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-blue-500'
                }`}
                required
              />
              {formErrors.temperature && (
                <p className="text-rose-600 text-[10px] font-bold mt-1">{formErrors.temperature}</p>
              )}
            </div>

            <div className="space-y-1.5 col-span-1">
              <label htmlFor="weight" className="text-[10px] font-mono font-bold text-slate-400 uppercase">Weight (kg)</label>
              <input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:bg-white ${
                  formErrors.weight 
                    ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-blue-500'
                }`}
                required
              />
              {formErrors.weight && (
                <p className="text-rose-600 text-[10px] font-bold mt-1">{formErrors.weight}</p>
              )}
            </div>

            <div className="space-y-1.5 col-span-1">
              <label htmlFor="height" className="text-[10px] font-mono font-bold text-slate-400 uppercase">Height (cm)</label>
              <input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:bg-white ${
                  formErrors.height 
                    ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-blue-500'
                }`}
                required
              />
              {formErrors.height && (
                <p className="text-rose-600 text-[10px] font-bold mt-1">{formErrors.height}</p>
              )}
            </div>

            <div className="space-y-1.5 col-span-1">
              <label htmlFor="spo2" className="text-[10px] font-mono font-bold text-slate-400 uppercase">SpO2 (%)</label>
              <input
                id="spo2"
                type="number"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:bg-white ${
                  formErrors.spo2 
                    ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-blue-500'
                }`}
                required
              />
              {formErrors.spo2 && (
                <p className="text-rose-600 text-[10px] font-bold mt-1">{formErrors.spo2}</p>
              )}
            </div>
          </div>
        </div>

        {/* Card Section 3: Chest Radiography & Spirometry parameters */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Spirometry (PFT) */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b pb-2.5 border-slate-100">
              <Activity className="h-5 w-5 text-blue-600" />
              <h3 className="font-display font-bold text-slate-950 text-sm tracking-tight">Lung Spirometry (PFT)</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="fvc" className="text-[10px] font-mono font-bold text-slate-400 uppercase">FVC (Forced Vital Cap, L)</label>
                <input
                  id="fvc"
                  type="text"
                  value={fvc}
                  onChange={(e) => setFvc(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:border-blue-500 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="fev1" className="text-[10px] font-mono font-bold text-slate-400 uppercase">FEV1 (Forced Vol in 1s, L)</label>
                <input
                  id="fev1"
                  type="text"
                  value={fev1}
                  onChange={(e) => setFev1(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:border-blue-500 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label htmlFor="spirometry-assessment" className="text-[10px] font-mono font-bold text-slate-400 uppercase">Spirometry Lung Opinion</label>
                <select
                  id="spirometry-assessment"
                  value={spirometryAssessment}
                  onChange={(e) => setSpirometryAssessment(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:border-blue-500 focus:bg-white focus:outline-none"
                >
                  <option value="Normal">Normal Lung Dynamics (Ratio &gt; 80%)</option>
                  <option value="Obstructive">Obstructive Lung Disease (e.g. COPD, Dust Bronchitis)</option>
                  <option value="Restrictive">Restrictive Lung Disease (e.g. Fibrosis, SIL)</option>
                  <option value="Mixed">Mixed Profile</option>
                </select>
              </div>

              <div className="bg-slate-50 p-3.5 border rounded-lg col-span-2 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Estimated FEV1/FVC Ratio</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{spirometryRatio}%</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${spirometryRatio >= 75 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    spirometryRatio >= 65 ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}>
                  {spirometryRatio >= 75 ? 'Optimal' : spirometryRatio >= 65 ? 'Borderline' : 'Decline (Obstructive)'}
                </span>
              </div>
            </div>
          </div>

          {/* Radiology & chest XRay */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b pb-2.5 border-slate-100">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="font-display font-bold text-slate-950 text-sm tracking-tight">Chest Radiography (Radiology)</h3>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="ilo-classification" className="text-[10px] font-mono font-bold text-slate-400 uppercase">ILO classification Grade</label>
                  <input
                    id="ilo-classification"
                    type="text"
                    value={iloClassification}
                    placeholder="e.g. 0/0 or 1/1 q"
                    className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:border-blue-500 focus:bg-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="xray-status" className="text-[10px] font-mono font-bold text-slate-400 uppercase">Radiology Diagnosis</label>
                  <select
                    id="xray-status"
                    value={xrayStatus}
                    onChange={(e) => setXrayStatus(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:border-blue-500 focus:bg-white focus:outline-none"
                  >
                    <option value="Normal">Normal Radiograph</option>
                    <option value="Suspect Silicosis">Suspect Silicosis / Early markings</option>
                    <option value="Pneumoconiosis Suspect">Pneumoconiosis Suspect (CWP)</option>
                    <option value="Other Findings">Other Findings (Bulla, Calcification)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="xray-findings" className="text-[10px] font-mono font-bold text-slate-400 uppercase">Radiographer Findings Notes</label>
                <textarea
                  id="xray-findings"
                  value={xrayFindings}
                  onChange={(e) => setXrayFindings(e.target.value)}
                  placeholder="Summarize visual findings on lower lobes, reticular opacities..."
                  rows={2}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card Section 4: Questionnaire Survey */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-2.5 border-slate-100">
            <Info className="h-5 w-5 text-blue-600" />
            <h3 className="font-display font-bold text-slate-950 text-sm tracking-tight">Industrial Exposure & Symptoms Survey</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 items-end">
            <div className="flex gap-2.5 items-center p-3 border rounded-lg bg-slate-50/50">
              <label htmlFor="cough" className="text-xs text-slate-700 font-medium select-none cursor-pointer flex-1">Chronic cough (&gt;3 wk)</label>
              <input
                id="cough"
                type="checkbox"
                checked={chronicCough}
                onChange={(e) => setChronicCough(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
              />
            </div>

            <div className="flex gap-2.5 items-center p-3 border rounded-lg bg-slate-50/50">
              <label htmlFor="dyspnoea-check" className="text-xs text-slate-700 font-medium select-none cursor-pointer flex-1">Dyspnoea on incline</label>
              <input
                id="dyspnoea-check"
                type="checkbox"
                checked={dyspnoea}
                onChange={(e) => setDyspnoea(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
              />
            </div>

            <div className="flex gap-2.5 items-center p-3 border rounded-lg bg-slate-50/50">
              <label htmlFor="chest-pain" className="text-xs text-slate-700 font-medium select-none cursor-pointer flex-1">Chest tightness/pain</label>
              <input
                id="chest-pain"
                type="checkbox"
                checked={chestPain}
                onChange={(e) => setChestPain(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
              />
            </div>

            <div className="flex gap-2.5 items-center p-3 border rounded-lg bg-slate-50/50">
              <label htmlFor="sweats" className="text-xs text-slate-700 font-medium select-none cursor-pointer flex-1">Frequent night sweats</label>
              <input
                id="sweats"
                type="checkbox"
                checked={nightSweats}
                onChange={(e) => setNightSweats(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="smoking-status" className="text-[10px] font-mono font-bold text-slate-400 uppercase">Tobacco Habits</label>
              <select
                id="smoking-status"
                value={smokingStatus}
                onChange={(e) => setSmokingStatus(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:border-blue-500"
              >
                <option value="Never">Never Smoking</option>
                <option value="Former">Former User/Smoker</option>
                <option value="Active">Active Tobacco Smoker</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="dust-years" className="text-[10px] font-mono font-bold text-slate-400 uppercase">Dust exposure (years)</label>
              <input
                id="dust-years"
                type="number"
                value={dustExposureYears}
                onChange={(e) => setDustExposureYears(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:border-blue-500"
                min={0}
                required
              />
            </div>
          </div>
        </div>

        {/* Card Section 5: Clinical Recommendation & Verdict */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-2.5 border-slate-100">
            <Stethoscope className="h-5 w-5 text-blue-600" />
            <h3 className="font-display font-bold text-slate-950 text-sm tracking-tight">Executive Clearance & Board Recommendation</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label htmlFor="fitness-recommend" className="text-[10px] font-mono font-bold text-slate-400 uppercase">Interim Fitness Judgment</label>
              <select
                id="fitness-recommend"
                value={fitnessRecommendation}
                onChange={(e) => setFitnessRecommendation(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:border-blue-500 focus:bg-white focus:outline-none"
              >
                <option value="Fit">Fit - Unrestricted Deployment</option>
                <option value="Unfit">Unfit - Complete Suspension</option>
                <option value="Fit with Restrictions">Fit with Restrictions - Surface Jobs only</option>
              </select>
            </div>

            <div className="space-y-1.5 col-span-2">
              <label htmlFor="restrictions-desc" className="text-[10px] font-mono font-bold text-slate-400 uppercase">Describe Authorized Restrictions (if restricted)</label>
              <input
                id="restrictions-desc"
                type="text"
                value={restrictions}
                onChange={(e) => setRestrictions(e.target.value)}
                disabled={fitnessRecommendation !== 'Fit with Restrictions'}
                placeholder="Details of dust barriers, air systems or physical load limits..."
                className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg disabled:opacity-50 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 col-span-3">
              <label htmlFor="notes" className="text-[10px] font-mono font-bold text-slate-400 uppercase">Consolidated Medical Officer Clinical Notes</label>
              <textarea
                id="notes"
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                rows={3}
                placeholder="Write detailed diagnostic opinion, follow up scopes, referral suggestions..."
                className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:bg-white ${
                  formErrors.clinicalNotes 
                    ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-blue-500'
                }`}
                required
              />
              {formErrors.clinicalNotes && (
                <p className="text-rose-600 text-[10px] font-bold mt-1">{formErrors.clinicalNotes}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="next-exam-interval" className="text-[10px] font-mono font-bold text-slate-400 uppercase">Recommended Next Recurrence Interval</label>
              <select
                id="next-exam-interval"
                value={nextExamInterval}
                onChange={(e) => setNextExamInterval(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:border-blue-500"
              >
                <option value="6">6 Months (Aggressive surveillance)</option>
                <option value="12">12 Months (Standard Periodic cycle)</option>
                <option value="24">24 Months (Office Administration only)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Database Error Banner - shown underneath the form */}
        {dbError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 flex items-start gap-3 text-xs text-rose-700 animate-shake">
            <ShieldAlert className="h-5 w-5 shrink-0 text-rose-500" />
            <div className="space-y-1.5 flex-1">
              <p className="font-bold text-rose-800">Supabase Database Error (Table Not Initialized)</p>
              <p className="font-medium text-rose-600/90 leading-relaxed">
                The database table <code>medical_records</code> could not be found or is not initialized in your Supabase project. 
                Please ensure you run the table creation query in your Supabase SQL Editor.
              </p>
              <div className="mt-2 bg-slate-900 text-slate-100 p-2.5 rounded font-mono text-[10px] select-all overflow-x-auto">
                {`create table medical_records ( id uuid default gen_random_uuid() primary key, "employeeId" text not null, "examinationDate" date not null, "medicalOfficer" text, "systolicBP" integer, "diastolicBP" integer, "pulseRate" integer, "respiratoryRate" integer, "temperature" numeric, "weight" numeric, "height" numeric, "spo2" integer, "fvc" numeric, "fev1" numeric, "fev1Ratio" numeric, "spirometryOpinion" text, "iloClassification" text, "radiologyDiagnosis" text, "radiologyNotes" text, "riskScore" integer default 0, "riskCategory" text default 'Low', "fitnessStatus" text default 'Fit', "restrictions" text, "examinerRemarks" text, created_at timestamp with time zone default timezone('utc'::text, now()) not null, constraint fk_employee foreign key ("employeeId") references employees("employeeId") on delete cascade );`}
              </div>
              <p className="text-[10px] font-mono text-rose-500 mt-1.5 font-bold">Raw Error Response: {dbError}</p>
            </div>
          </div>
        )}

        {/* Action Panel */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/employees')}
            className="px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
          >
            Cancel Assessment
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-xs font-bold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700 transition cursor-pointer disabled:opacity-75 disabled:cursor-wait"
          >
            {loading ? 'Recording Form...' : 'Authenticate & Record Form'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default NewMedicalRecord;
