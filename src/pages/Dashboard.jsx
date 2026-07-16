import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Activity,
  AlertTriangle,
  FileSpreadsheet,
  Calendar,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Heart
} from 'lucide-react';
import { usePortal } from '../context/PortalContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid
} from 'recharts';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { employees, medicalRecords, pmeSchedules } = usePortal();

  // Data Calculations
  const totalEmployees = employees.length;
  const overdueEmployees = employees.filter((e) => e.pmeStatus === 'Overdue');
  const fitEmployees = employees.filter((e) => e.pmeStatus === 'Fit' || e.pmeStatus === 'Fit with Restrictions');
  const highRiskEmployees = employees.filter((e) => e.riskCategory === 'High');

  const complianceRate = totalEmployees ? Math.round((fitEmployees.length / totalEmployees) * 100) : 100;

  // Recharts Chart 1: Disease Risk Profile by Mine
  const mineRiskData = employees.reduce((acc, emp) => {
    const existing = acc.find((m) => m.name === emp.mineName);
    if (existing) {
      if (emp.riskCategory === 'High') existing.High += 1;
      else if (emp.riskCategory === 'Medium') existing.Medium += 1;
      else existing.Low += 1;
    } else {
      acc.push({
        name: emp.mineName,
        High: emp.riskCategory === 'High' ? 1 : 0,
        Medium: emp.riskCategory === 'Medium' ? 1 : 0,
        Low: emp.riskCategory === 'Low' ? 1 : 0,
      });
    }
    return acc;
  }, []);

  // Recharts Chart 2: PME Status Breakdown
  const pmeBreakdownData = [
    { name: 'Fit', value: employees.filter((e) => e.pmeStatus === 'Fit').length, color: '#10b981' },
    { name: 'Fit with Restrictions', value: employees.filter((e) => e.pmeStatus === 'Fit with Restrictions').length, color: '#f59e0b' },
    { name: 'Overdue PME', value: overdueEmployees.length, color: '#f43f5e' },
    { name: 'Scheduled PME', value: employees.filter((e) => e.pmeStatus === 'Scheduled').length, color: '#06b6d4' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-3xl font-black tracking-tight text-slate-950 md:text-4xl">PME Hospital Control Center</h2>
          <p className="text-sm text-slate-500 font-medium">Real-time health surveillance, coal workers lung health profile, and medical board compliance tracker.</p>
        </div>
        <button
          onClick={() => navigate('/new-record')}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700 transition"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>New Examination Record</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI Card 1: Total Employees */}
        <div 
          onClick={() => navigate('/employees')}
          className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-150 flex items-start justify-between"
        >
          <div className="space-y-2">
            <p className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-widest">Total Serviced Miners</p>
            <p className="text-4xl font-display font-black tracking-tight text-slate-900 leading-none">{totalEmployees}</p>
            <p className="text-[11px] text-blue-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Full compliance indexed</span>
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-slate-100 transition-colors">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* KPI Card 2: Compliance Level */}
        <div 
          onClick={() => navigate('/tracker')}
          className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-150 flex items-start justify-between"
        >
          <div className="space-y-2">
            <p className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-widest">PME Compliance</p>
            <p className="text-4xl font-display font-black tracking-tight text-slate-900 leading-none">{complianceRate}%</p>
            <p className="text-[11px] text-slate-500 font-bold">
              Target goal is: <span className="font-extrabold text-emerald-600">95%</span>
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50/70 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100/70 transition-colors">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        {/* KPI Card 3: Overdue Critical */}
        <div 
          onClick={() => navigate('/tracker')}
          className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-150 flex items-start justify-between"
        >
          <div className="space-y-2">
            <p className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-widest">Pending / Overdue</p>
            <p className="text-4xl font-display font-black tracking-tight text-rose-600 leading-none">{overdueEmployees.length}</p>
            <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Emergency action needed</span>
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 group-hover:bg-rose-100 transition-colors">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        {/* KPI Card 4: High Lung/Dust Risk */}
        <div 
          onClick={() => navigate('/risk-assessment')}
          className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-150 flex items-start justify-between"
        >
          <div className="space-y-2">
            <p className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-widest">High Risk Profile</p>
            <p className="text-4xl font-display font-black tracking-tight text-slate-900 leading-none">{highRiskEmployees.length}</p>
            <p className="text-[11px] text-amber-600 font-bold">
              Dust exposure &gt; 15 years
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center text-amber-500 group-hover:bg-slate-100 transition-colors">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Red Alert Overdue Notice Banner if overdue list exists */}
      {overdueEmployees.length > 0 && (
        <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-rose-900">Critical: PME Overdue for {overdueEmployees.length} Underground Face Miners</h4>
              <p className="text-xs text-rose-700 mt-1">These mine workers have exceeded their 5-year cyclical medical exam limits, posing high liability under Coal Mines Regulations. Immediate PME scheduling is recommended.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/tracker')}
            className="self-start md:self-auto inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-900 hover:underline shrink-0"
          >
            <span>Resolve through Batch PME</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Graphical Dashboard Metrics */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart Card 1: Mine Dust Risk Indices */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-slate-950 text-sm tracking-tight">Respiratory/Occupational Risk Profile by Collieries</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Classification of workers under different risk profiles based on dust exposure and years of underground face service.</p>
            </div>
            <span className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-extrabold">ILO STANDARDS</span>
          </div>
          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mineRiskData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', marginTop: '5px' }} />
                <Bar dataKey="Low" name="Low Risk Index" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Medium" name="Moderate Risk Index" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="High" name="Severe Pneumoconiosis Risk" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart Card 2: Health Clearance Status */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-slate-950 text-sm tracking-tight">Fitness Clearance Distribution</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Summary of medical clearances issued to mine workers under Form O.</p>
          </div>
          
          <div className="h-44 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pmeBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pmeBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color === '#10b981' ? '#10b981' : entry.color === '#f59e0b' ? '#f59e0b' : entry.color === '#f43f5e' ? '#ef4444' : '#3b82f6'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Workers`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black font-display text-slate-900 leading-none">{complianceRate}%</span>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-extrabold mt-1">Active Clearance</span>
            </div>
          </div>

          <div className="space-y-1.5 mt-2">
            {pmeBreakdownData.map((d, index) => (
              <div key={index} className="flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color === '#10b981' ? '#10b981' : d.color === '#f59e0b' ? '#f59e0b' : d.color === '#f43f5e' ? '#ef4444' : '#3b82f6' }}></span>
                  <span className="font-semibold">{d.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Column Layout */}
      <div className="grid gap-6 md:grid-cols-5">
        {/* Section 1: Live Chest / Spirometry Exam log (feed of records) */}
        <div className="md:col-span-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-slate-950 text-sm tracking-tight">Recent Clinical Logs</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Latest physical certifications completed at Gandhinagar Hospital Chest wing.</p>
            </div>
            <button
              onClick={() => navigate('/documents')}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>View Documents</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-100">
            {medicalRecords.slice(0, 3).map((rec) => {
              const matchedEmp = employees.find((e) => e.id === rec.employeeId);
              if (!matchedEmp) return null;
              return (
                <div key={rec.id} className="p-3.5 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4">
                  <div className="min-w-0 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                      <TrendingUp className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-950 leading-tight truncate">{matchedEmp.name}</p>
                      <p className="text-[10px] text-slate-500 mt-1 font-mono truncate">{matchedEmp.employeeId} • {matchedEmp.designation}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-slate-500 font-bold">{rec.examinationDate}</p>
                      <p className={`text-[10px] mt-0.5 font-bold ${
                        rec.chestXray.status === 'Normal' ? 'text-emerald-600' : 'text-rose-500'
                      }`}>
                        X-Ray: {rec.chestXray.iloClassification} ({rec.chestXray.status})
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/profile/${matchedEmp.employeeId}`)}
                      className="rounded p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Smart Hospital Recommendations */}
        <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500 fill-rose-50" />
              <h3 className="font-display font-bold text-slate-950 text-sm tracking-tight">Predictive Health Insights</h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Our automated analysis of continuous miner records predicts a <span className="font-semibold text-rose-600">12% risk spike</span> in dust-related respiratory decline for workers with &gt; 15 years in <span className="font-semibold">Underground Dev</span> roles in <span className="italic">Gidi-A Colliery</span>.
            </p>

            <div className="p-3 bg-blue-50/40 border border-blue-100 rounded-lg space-y-1.5">
              <h4 className="text-[10px] font-mono font-extrabold text-blue-900 uppercase tracking-widest">Recommended Interventions</h4>
              <ul className="text-[11px] text-blue-800 list-disc list-inside space-y-1 leading-relaxed font-semibold">
                <li>Optimize wet drilling dust controllers at face.</li>
                <li>Implement voluntary spirometry screenings.</li>
                <li>Accelerated PME cycle for high risk Overmen.</li>
              </ul>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between mt-4">
            <div>
              <p className="text-[9px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">Hospital PME Capacity</p>
              <p className="text-xs font-bold text-slate-800">60 Workers Examined / week</p>
            </div>
            <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-extrabold border border-emerald-100 uppercase tracking-wide">Optimal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
