import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  User,
  Heart,
  Activity,
  FileText,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Plus,
  ArrowLeft,
  ChevronRight,
  TrendingDown,
  Stethoscope,
  Info
} from 'lucide-react';
import { usePortal } from '../context/PortalContext';
import { useAuth } from '../context/AuthContext';
import { RISK_TRAJECTORY_MOCK } from '../utils/mockData';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const EmployeeProfile = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { employees, medicalRecords, updateEmployeePmeStatus } = usePortal();
  const { user } = useAuth();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch employee data from Supabase
        const { data, error: fetchError } = await supabase
          .from("employees")
          .select("*")
          .eq("employeeId", employeeId)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (!data) {
          throw new Error("Employee not found");
        }

        setEmployee(data);
      } catch (err) {
        console.error("Error fetching employee:", err);
        if (err.code === "PGRST116" || err.message?.includes("coerce")) {
          setError(`Employee record with ID "${employeeId}" not found in the database. Please ensure they are registered.`);
        } else {
          setError(err.message || "Failed to load employee profile.");
        }
        setEmployee(null);
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchEmployee();
    } else {
      // Fallback if no employeeId is provided (e.g. default route)
      setEmployee(employees[0] || null);
      setLoading(false);
    }
  }, [employeeId, employees]);

  const [activeTab, setActiveTab] = useState('overview');
  
  // Interactive Fitness Board state
  const [boardDecision, setBoardDecision] = useState('Fit');
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [boardRestrictions, setBoardRestrictions] = useState("");

  useEffect(() => {
    if (employee) {
      setBoardDecision(employee.pmeStatus || 'Fit');
      setBoardRestrictions(
        employee.pmeStatus === 'Fit with Restrictions' 
          ? "No placement in high dust zones, Double N95 respirator deployment" 
          : ""
      );
    }
  }, [employee]);

  const associatedRecords = useMemo(() => {
    if (!employee) return [];
    
    // Find the local mock employee to get their mock id
    const mockEmp = employees.find(e => e.employeeId === employee.employeeId);
    const mockId = mockEmp ? mockEmp.id : null;
    
    return medicalRecords.filter((rec) => 
      rec.employeeId === employee.id || 
      rec.employeeId === employee.employeeId || 
      (mockId && rec.employeeId === mockId)
    );
  }, [medicalRecords, employee, employees]);

  // Load his personalized charts
  const trajectoryData = useMemo(() => {
    if (!employee) return [];
    const mockEmp = employees.find(e => e.employeeId === employee.employeeId);
    const mockId = mockEmp ? mockEmp.id : employee.id;
    return RISK_TRAJECTORY_MOCK[mockId] || [
      { date: '2023-10', spirometryFVC: 4.2, spirometryFEV1: 3.5, riskScore: 20, systolicBP: 120 },
      { date: '2024-10', spirometryFVC: 4.0, spirometryFEV1: 3.2, riskScore: 35, systolicBP: 125 },
      { date: '2025-11', spirometryFVC: 3.8, spirometryFEV1: 2.8, riskScore: employee.riskScore, systolicBP: 135 }
    ];
  }, [employee, employees]);

  const handleUpdateFitnessBoard = async () => {
    if (user?.role !== 'Doctor') {
      alert("Access Denied: Only Doctors can update clearance status.");
      return;
    }
    try {
      setLoading(true);
      
      // Update clearance status in Supabase table
      const { error: updateError } = await supabase
        .from("employees")
        .update({ pmeStatus: boardDecision })
        .eq("employeeId", employee.employeeId);

      if (updateError) throw updateError;

      // Update locally in context
      updateEmployeePmeStatus(employee.id, boardDecision);
      setEmployee(prev => prev ? { ...prev, pmeStatus: boardDecision } : null);
      setShowBoardModal(false);
    } catch (err) {
      console.error("Error updating fitness status:", err);
      alert("Failed to update clearance status in database: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center bg-white border border-slate-200 rounded-xl shadow-sm animate-pulse">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">Loading Employee Profile...</span>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
        <p className="text-slate-500 font-medium">{error || "Employee record not found in the hospital index."}</p>
        <button 
          onClick={() => navigate('/employees')} 
          className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-md shadow-blue-500/10 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Directory</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button and profile title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => navigate('/employees')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors self-start"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Employee Directory</span>
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => navigate('/new-record', { state: { selectedEmployeeId: employee.id } })}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-md shadow-blue-500/10"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create New Exam</span>
          </button>
          
          {user?.role === 'Doctor' && (
            <button
              onClick={() => setShowBoardModal(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
            >
              <Stethoscope className="h-3.5 w-3.5" />
              <span>Fitness Board Decision</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Info Sidebar & Dynamic Tab Views */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Info Card Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center relative overflow-hidden">
            {/* Top decorative gradient or accent */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${
              employee.riskCategory === 'High' ? 'bg-rose-500' :
              employee.riskCategory === 'Medium' ? 'bg-amber-400' : 'bg-emerald-400'
            }`} />

            {/* Avatar block */}
            <div className="mx-auto h-20 w-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-2xl font-display mb-4">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </div>

            <h3 className="font-display font-black text-lg text-slate-950">{employee.name}</h3>
            <p className="text-xs font-semibold text-slate-500">{employee.designation}</p>
            <p className="text-xs font-mono text-blue-600 bg-blue-50 px-2.5 py-1 rounded border border-blue-100/50 inline-block mt-2 font-extrabold uppercase tracking-widest">{employee.employeeId}</p>

            {/* Personal parameters key grid */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 mt-5 text-left">
              <div>
                <p className="text-[10px] font-mono text-slate-400 uppercase">Age / Gender</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">{employee.age} Yrs / {employee.gender}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-slate-400 uppercase">Blood Group</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">{employee.bloodGroup}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-slate-400 uppercase">Active Assignment</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5 truncate">{employee.mineName}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-slate-400 uppercase">Segment</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5 truncate">{employee.department}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-slate-400 uppercase">Service History</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">{employee.totalServiceYears} Years in Mines</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-slate-400 uppercase">Compliance Scale</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">★ {employee.complianceRating} / 5</p>
              </div>
            </div>
          </div>

          {/* Interactive Risk Indicator Gauge */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-extrabold text-slate-950 text-sm tracking-tight">Automated Risk Profile</h4>
              <span className={`text-[10px] font-mono font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border ${
                employee.riskCategory === 'High' ? 'text-rose-600 bg-rose-50 border-rose-100' :
                employee.riskCategory === 'Medium' ? 'text-amber-600 bg-amber-50 border-amber-100' :
                'text-emerald-600 bg-emerald-50 border-emerald-100'
              }`}>
                {employee.riskCategory} RISK
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-end justify-between text-xs">
                <span className="text-slate-500 font-medium">Mine Lung Disease Index</span>
                <span className="font-mono font-semibold text-slate-700">{employee.riskScore}%</span>
              </div>
              <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    employee.riskCategory === 'High' ? 'bg-gradient-to-r from-amber-500 to-rose-500 animate-pulse' :
                    employee.riskCategory === 'Medium' ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${employee.riskScore}%` }}
                />
              </div>
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-500 font-medium font-semibold">Fitness Recommendation</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  employee.pmeStatus === 'Fit' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                  employee.pmeStatus === 'Fit with Restrictions' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                  'bg-rose-50 text-rose-700 border border-rose-100'
                }`}>
                  {employee.pmeStatus || 'Fit'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed leading-[14px]">
                {employee.riskCategory === 'High' 
                  ? 'Immediate rotation to dust-free surface jobs and respiratory clinical panel review is strongly indicated.'
                  : 'Maintain standard 1-year periodic check scope and proper particulate safety wear.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Content Tabs Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Navigation Tabs bar */}
          <div className="border-b border-slate-200 flex gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === 'overview' ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Overview & History
            </button>
            <button
              onClick={() => setActiveTab('clinical')}
              className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === 'clinical' ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Detailed Clinical Findings
            </button>
            <button
              onClick={() => setActiveTab('trajectory')}
              className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === 'trajectory' ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Spirometry & Risk Trajectory
            </button>
          </div>

          {/* TAB 1: OVERVIEW & HISTORY */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Overdue alert if applicable */}
              {employee.pmeStatus === 'Overdue' && (
                <div className="rounded-lg bg-rose-50 border border-rose-100 p-4 text-xs text-rose-700 flex gap-3">
                  <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-rose-800">Critical Calendar Trigger: Periodic Medical Examination is Overdue</h5>
                    <p className="mt-1 leading-relaxed">This employee exceeded their continuous coal mine clearance timeframe. Select "Create New Exam" above to document physical checks and resolve regulatory standpoints.</p>
                  </div>
                </div>
              )}

              {/* General Health Indicators */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="bg-white border border-slate-100 rounded-lg p-3 flex gap-3 items-center">
                  <div className="h-8 w-8 bg-sky-50 text-sky-600 rounded flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-mono font-extrabold text-[#64748b] tracking-wider">PME clearance</p>
                    <p className="text-xs font-black text-slate-900 mt-0.5">{employee.pmeStatus}</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-lg p-3 flex gap-3 items-center">
                  <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded flex items-center justify-center shrink-0">
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-mono font-extrabold text-[#64748b] tracking-wider">Next Due Date</p>
                    <p className="text-xs font-black text-slate-900 mt-0.5">{employee.nextPmeDueDate}</p>
                  </div>
                </div>
              </div>

              {/* Medical Exam History Timeline */}
              <div className="space-y-4">
                <h4 className="font-display font-bold text-slate-950 text-sm tracking-tight">Hospital Certifications Timeline</h4>
                {associatedRecords.length > 0 ? (
                  <div className="relative border-l border-slate-200 pl-4 ml-2.5 space-y-6 pt-2">
                    {associatedRecords.map((rec) => (
                      <div key={rec.id} className="relative group">
                        {/* Dot */}
                        <div className="absolute -left-[21px] top-1.5 h-3.5 w-3.5 rounded-full bg-white border-2 border-blue-500" />
                        
                        <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-all shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-3.5">
                            <div>
                              <p className="text-xs font-bold text-slate-900">{rec.hospitalName}</p>
                              <p className="text-[10px] font-mono text-slate-500 mt-0.5">{rec.examinerName}</p>
                            </div>
                            <span className="text-[10px] font-mono bg-slate-50 text-slate-600 px-2 py-0.5 border border-slate-200 rounded">
                              {rec.examinationDate}
                            </span>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-3 text-xs">
                            <div className="space-y-2">
                              <p className="font-mono text-[10px] text-slate-400 uppercase font-bold">Vitals Status</p>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                BP: <span className="font-semibold text-slate-800">{rec.vitals.bloodPressure}</span> | 
                                Pulse: <span className="font-semibold text-slate-800">{rec.vitals.pulseRate} bpm</span> | 
                                SpO2: <span className="font-semibold text-slate-800">{rec.vitals.spo2}%</span>
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="font-mono text-[10px] text-slate-400 uppercase font-bold">Spirometry</p>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                FVC: <span className="font-semibold text-slate-800">{rec.spirometry.fvc}L</span> | 
                                Ratio: <span className="font-semibold text-slate-800">{rec.spirometry.ratio}%</span> ({rec.spirometry.assessment})
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="font-mono text-[10px] text-slate-400 uppercase font-bold">Risk Assessment</p>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                Score: <span className="font-semibold text-slate-800">{rec.riskScore !== undefined ? `${rec.riskScore}%` : 'N/A'} ({rec.riskCategory || 'Low'})</span> | 
                                Rec: <span className="font-semibold text-slate-800">{rec.fitnessRecommendation || 'Fit'}</span>
                              </p>
                            </div>
                          </div>

                          {rec.restrictionsList && rec.restrictionsList.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-100">
                              <p className="text-[10px] font-mono text-orange-600 font-bold uppercase tracking-wider mb-1">Approved Board Restrictions</p>
                              <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5 pl-1 leading-relaxed">
                                {rec.restrictionsList.map((res, i) => (
                                  <li key={i}>{res}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center border border-slate-100 rounded-lg bg-blue-50/20 text-slate-600 text-xs font-medium">
                    No digitized historical examination records available in the timeline. Click "Create New Exam" above to add the initial record.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED CLINICAL FINDINGS */}
          {activeTab === 'clinical' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6">
              {associatedRecords[0] ? (
                <div className="space-y-6 text-xs text-slate-700">
                  <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                    <div>
                      <h4 className="font-display font-bold text-slate-950 text-sm tracking-tight">Active Diagnostic Findings</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Primary clinic findings derived from latest completed physical exam dated {associatedRecords[0].examinationDate}.</p>
                    </div>
                    <span className="text-xs font-mono font-extrabold bg-blue-50 text-blue-800 border border-blue-100 px-3 py-1 rounded">HEALTH CLEARANCE REGISTERED</span>
                  </div>

                  {/* Radiology / Chest X-Ray section */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest">Chest Radiograph & Radiology Findings</p>
                    <div className="bg-slate-50 p-4 border rounded-lg grid sm:grid-cols-3 gap-4 items-center">
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase font-mono">ILO Classification</p>
                        <p className="text-base font-bold text-slate-800 mt-0.5">{associatedRecords[0].chestXray.iloClassification}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-[9px] text-slate-400 uppercase font-mono">Expert Findings Summary</p>
                        <p className="text-xs font-medium text-slate-700 mt-0.5 leading-relaxed">{associatedRecords[0].chestXray.findings}</p>
                      </div>
                    </div>
                  </div>

                  {/* Clinical Questions Status */}
                  <div className="space-y-3 pt-2">
                    <p className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest">Employee Respiratory & Exposure Questionnaire</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center justify-between p-2.5 border rounded-lg bg-white">
                        <span>Chronic Sputum Cough (&gt;3 weeks)</span>
                        <span className={`px-2 py-0.5 font-bold uppercase rounded text-[9px] ${associatedRecords[0].clinicalAnswers.chronicCough ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {associatedRecords[0].clinicalAnswers.chronicCough ? 'Present' : 'Absent'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 border rounded-lg bg-white">
                        <span>Dyspnoea on walking moderate incline</span>
                        <span className={`px-2 py-0.5 font-bold uppercase rounded text-[9px] ${associatedRecords[0].clinicalAnswers.dyspnoea ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {associatedRecords[0].clinicalAnswers.dyspnoea ? 'Present' : 'Absent'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 border rounded-lg bg-white">
                        <span>Active Dust Exposure History</span>
                        <span className="font-mono font-bold text-slate-800">{associatedRecords[0].clinicalAnswers.dustExposureYears} Years</span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 border rounded-lg bg-white">
                        <span>Tobacco / Smoking Habits</span>
                        <span className="font-bold text-slate-800 uppercase">{associatedRecords[0].clinicalAnswers.smokingStatus}</span>
                      </div>
                    </div>
                  </div>

                  {/* Clinical Notes Summary */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-widest">Medical Examiner Clinical Remarks</p>
                    <p className="p-4 rounded-lg bg-blue-50/20 border border-blue-100 text-blue-900 italic leading-relaxed text-xs font-medium">
                      "{associatedRecords[0].clinicalNotes}"
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-center py-6 text-xs">No clinical findings logged on profile.</p>
              )}
            </div>
          )}

          {/* TAB 3: TRAJECTORY & CLINICAL TRENDS */}
          {activeTab === 'trajectory' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6">
              <div>
                <h4 className="font-display font-semibold text-slate-800 text-sm">Dynamic Spirometry & Pulmonary Assessment Trajectory</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Mapping historic progression of pulmonary capacities mapped under routine PPF tests.</p>
              </div>

              {/* Chart of Spirometry Values over time */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="spirometryFVC" stroke="#0ea5e9" name="FVC (Litres)" strokeWidth={2.5} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="spirometryFEV1" stroke="#f43f5e" name="FEV1 (Litres)" strokeWidth={2.5} />
                    <Line type="monotone" dataKey="riskScore" stroke="#eab308" name="Aggregate Risk (%)" strokeWidth={2.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 text-xs border-t border-slate-100 pt-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-slate-700 font-semibold text-sm">
                    <TrendingDown className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                    <span>Progression Report</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed">
                    Spirometry indicators demonstrate an obstructive decline profile over the last 3 years. FEV1 drops from 3.32L to 2.32L. This corresponds closely to underground mine exposure duration.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-blue-50/20 border border-blue-100/50 space-y-2">
                  <span className="text-[10px] font-mono text-blue-800 font-extrabold uppercase tracking-widest block">ILO Recommendations</span>
                  <p className="text-blue-900 leading-relaxed font-semibold">
                    Patient lung function profile indicates moderate compliance risk. Clear recommendation is issued for surface-only light active deployment. Air filtering respirators are strictly mandatory.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Fitness Board board decision popup modal */}
      {showBoardModal && (
         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
           <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4">
             <div className="flex items-center justify-between border-b border-slate-100 pb-3">
               <div className="flex items-center gap-2">
                 <Stethoscope className="h-5 w-5 text-blue-600" />
                 <h3 className="font-display font-black text-slate-950 text-sm tracking-tight">Hospital Medical Board Opinion</h3>
               </div>
               <button onClick={() => setShowBoardModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
             </div>

             <p className="text-xs text-slate-500">Update clearance status is authorized only under the signature of regional chief medical officers CCL Gandhinagar.</p>
             
             <div className="space-y-4">
               <div className="space-y-1.5">
                 <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Board Judgment</label>
                 <div className="grid grid-cols-3 gap-2">
                   {['Fit', 'Unfit', 'Fit with Restrictions'].map((status) => (
                     <button
                       key={status}
                       onClick={() => setBoardDecision(status)}
                       className={`px-2 py-2 border rounded-lg text-center text-xs font-bold transition-all ${
                         boardDecision === status 
                           ? 'border-blue-500 bg-blue-50/60 text-blue-700 font-extrabold' 
                           : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                       }`}
                     >
                       {status}
                     </button>
                   ))}
                 </div>
               </div>

               {boardDecision === 'Fit with Restrictions' && (
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Mandatory Operational Restrictions</label>
                   <textarea
                     value={boardRestrictions}
                     onChange={(e) => setBoardRestrictions(e.target.value)}
                     placeholder="Enter board restrictions..."
                     className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:border-blue-500 focus:bg-white focus:outline-none"
                     rows={3}
                   />
                 </div>
               )}
             </div>

             <div className="flex gap-2.5 pt-4 border-t border-slate-100 justify-end">
               <button
                 onClick={() => setShowBoardModal(false)}
                 className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
               >
                 Cancel
               </button>
               <button
                 onClick={handleUpdateFitnessBoard}
                 className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-500/10"
               >
                 Sign & Submit Judgment
               </button>
             </div>
           </div>
         </div>
      )}
    </div>
  );
};
export default EmployeeProfile;
