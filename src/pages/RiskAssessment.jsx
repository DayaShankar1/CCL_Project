import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Flame,
  Activity,
  HeartPulse,
  TrendingDown,
  ExternalLink,
  Sliders,
  CheckCircle,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { usePortal } from '../context/PortalContext';

export const RiskAssessment = () => {
  const navigate = useNavigate();
  const { employees, medicalRecords } = usePortal();

  // 1. Calculations block for abnormal vitals
  const totalChecked = employees.length;
  
  // Abnormal BP (Systolic > 140 or Diastolic > 90)
  const hypertensiveCount = useMemo(() => {
    return medicalRecords.filter(rec => {
      const bpParts = rec.vitals.bloodPressure.split('/');
      const sys = bpParts[0] ? parseInt(bpParts[0]) : 120;
      const dia = bpParts[1] ? parseInt(bpParts[1]) : 80;
      return sys > 140 || dia > 90;
    }).length;
  }, [medicalRecords]);

  // Decline on Spirometry ratio (< 70)
  const obstructiveCount = useMemo(() => {
    return medicalRecords.filter(rec => rec.spirometry.ratio < 70).length;
  }, [medicalRecords]);

  // Cough complainers
  const clinicalSymptomsCount = useMemo(() => {
    return medicalRecords.filter(rec => rec.clinicalAnswers.chronicCough === true || rec.clinicalAnswers.dyspnoea === true).length;
  }, [medicalRecords]);

  // High Risk Category list
  const highRiskWorkers = useMemo(() => {
    return employees.filter(e => e.riskCategory === 'High');
  }, [employees]);

  // Average Risk Score
  const averageRiskScore = useMemo(() => {
    if (!employees.length) return 0;
    const sum = employees.reduce((acc, current) => acc + current.riskScore, 0);
    return Math.round(sum / employees.length);
  }, [employees]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-3xl font-black tracking-tight text-slate-950">Clinical Risk Surveillance</h2>
          <p className="text-sm text-slate-500 font-medium">Automated classification of coal workers pneumoconiosis (CWP), chronic obstructive pulmonary decay, and cardiovascular status.</p>
        </div>
        <span className="text-xs bg-rose-50 text-rose-700 font-mono font-bold px-3 py-1.5 border border-rose-100 rounded uppercase tracking-widest">ACTIVE VENTILARY HEALTH RISK</span>
      </div>

      {/* TOP: CORE RISK PANEL & CARD INDICATORS */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Risk Gauge Panel */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Surveillance Indicator</span>
            <h3 className="font-display font-black text-slate-950 text-sm mt-0.5 tracking-tight">Weighted Coalition Risk Score</h3>
          </div>

          <div className="flex flex-col items-center justify-center pt-2">
            <div className="relative h-28 w-28 flex flex-col items-center justify-center rounded-full border-8 border-slate-100 border-l-orange-500 border-t-rose-500">
              <span className="text-3xl font-extrabold font-display text-slate-800">{averageRiskScore}%</span>
              <span className="text-[9px] font-mono text-slate-400 uppercase font-semibold">Average Index</span>
            </div>
            
            <p className="text-xs text-center text-slate-500 mt-4 leading-relaxed px-2 font-medium">
              Average occupational respiratory hazard score across active underground face workers.
            </p>
          </div>
        </div>

        {/* Vital / Symptoms abnormality statistics Cards */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-black text-slate-950 text-sm tracking-tight">Vital Deficit Proportions</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Rate of workers flagged with active hypertensive trends, pulmonary resistance, or chronic symptoms.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 pt-2">
            {/* BP Card */}
            <div className="bg-slate-50/70 border rounded-lg p-4 space-y-2 relative overflow-hidden">
              <p className="text-[10px] font-mono font-semibold text-slate-400 uppercase">Hypertensive Trends</p>
              <p className="text-2xl font-bold font-display text-slate-800">
                {hypertensiveCount} <span className="text-xs font-normal text-slate-400">flagged</span>
              </p>
              <div className="h-1 bg-amber-400 rounded-full" style={{ width: `${totalChecked ? (hypertensiveCount / totalChecked) * 100 : 0}%` }} />
            </div>

            {/* Spirometry ratio Card */}
            <div className="bg-slate-50/70 border rounded-lg p-4 space-y-2 relative overflow-hidden">
              <p className="text-[10px] font-mono font-semibold text-slate-400 uppercase">Spirometry Ratio &lt;70%</p>
              <p className="text-2xl font-bold font-display text-slate-800">
                {obstructiveCount} <span className="text-xs font-normal text-slate-400">cases</span>
              </p>
              <div className="h-1 bg-rose-500 rounded-full" style={{ width: `${totalChecked ? (obstructiveCount / totalChecked) * 100 : 0}%` }} />
            </div>

            {/* General Pulmonary Symptoms */}
            <div className="bg-slate-50/70 border rounded-lg p-4 space-y-2 relative overflow-hidden">
              <p className="text-[10px] font-mono font-semibold text-slate-400 uppercase">Cough/Dyspnoea Compls</p>
              <p className="text-2xl font-bold font-display text-slate-800">
                {clinicalSymptomsCount} <span className="text-xs font-normal text-slate-400">miners</span>
              </p>
              <div className="h-1 bg-blue-500 rounded-full" style={{ width: `${totalChecked ? (clinicalSymptomsCount / totalChecked) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED CLINICAL EXPERT RECOMMENDATIONS */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b pb-2.5 border-slate-100">
          <Activity className="h-5 w-5 text-blue-600" />
          <h3 className="font-display font-black text-slate-950 text-sm tracking-tight">Industrial Health Protocols - Airway Surveillance</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 text-xs text-slate-600 leading-relaxed">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-xs">Paragraphs on Pneumoconiosis classifications:</h4>
            <p>
              Categories <span className="font-mono font-bold text-slate-800">1/0, 1/1, and 1/2 q/p opacities</span> indicate early cellular changes within interstitial lung profiles caused by silica or coal dust deposits. Immediate removal from high-particle underground zones is legally recommended to halt permanent respiratory decay (Fibrosis).
            </p>
          </div>

          <div className="p-3.5 bg-rose-50/30 rounded-lg border border-rose-100/50 space-y-2">
            <span className="text-[10px] font-mono text-rose-800 font-bold uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Coal Mines Regulation Mandates</span>
            </span>
            <p className="text-rose-900 leading-relaxed leading-[16px]">
              Employees working over 15 years in continuous face operations require PME evaluations every 6 months if spirometry FEV1 ratios show negative variations exceeding 10% in comparative years.
            </p>
          </div>
        </div>
      </div>

      {/* DYNAMIC RISK TRAJECTORY TABLE OF PERSONNEL */}
      <div className="space-y-4">
        <h3 className="font-display font-black text-slate-950 text-sm tracking-tight">High Risk Surveillance Registry</h3>
        <div className="overflow-hidden bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-widest">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Mine & Role</th>
                  <th className="px-6 py-4 text-center border-l">Dust Exposure Limit</th>
                  <th className="px-6 py-4 text-center border-l">Respiratory Risk rating</th>
                  <th className="px-6 py-4 border-l">Clearance Opinion</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {highRiskWorkers.length > 0 ? (
                  highRiskWorkers.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-800 select-all">{emp.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{emp.employeeId}</p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-700">{emp.designation}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{emp.mineName}</p>
                      </td>

                      <td className="px-6 py-4 text-center font-mono font-bold border-l">
                        {emp.totalServiceYears} Years Exposure
                      </td>

                      <td className="px-6 py-4 text-center border-l">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-mono font-bold text-rose-600 px-2 py-0.5 rounded bg-rose-50 border border-rose-100">
                            {emp.riskScore}% Risk Index
                          </span>
                          <span className="text-[10px] font-bold text-rose-700 uppercase">
                            {emp.riskCategory} Risk
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 border-l">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          emp.pmeStatus === 'Fit' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          emp.pmeStatus === 'Fit with Restrictions' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {emp.pmeStatus}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/profile/${emp.employeeId}`)}
                          className="inline-flex items-center gap-1 p-1.5 border rounded-lg hover:bg-slate-50 text-slate-600"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      Surveillance clean: no high respiratory risk miners flagged in active databases.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RiskAssessment;
