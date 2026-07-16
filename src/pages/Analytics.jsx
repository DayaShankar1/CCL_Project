import React from 'react';
import {
  TrendingUp,
  Activity,
  Heart,
  Calendar,
  AlertTriangle,
  Lightbulb,
  Bell
} from 'lucide-react';
import { usePortal } from '../context/PortalContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const Analytics = () => {
  const { employees } = usePortal();

  // Recharts Chart 1: Sector Risk Breakdown Stacked bars
  const sectorRiskData = employees.reduce((acc, emp) => {
    const existing = acc.find((item) => item.sector === emp.department);
    if (existing) {
      if (emp.riskCategory === 'High') existing.High += 1;
      else if (emp.riskCategory === 'Medium') existing.Medium += 1;
      else existing.Low += 1;
    } else {
      acc.push({
        sector: emp.department,
        High: emp.riskCategory === 'High' ? 1 : 0,
        Medium: emp.riskCategory === 'Medium' ? 1 : 0,
        Low: emp.riskCategory === 'Low' ? 1 : 0,
      });
    }
    return acc;
  }, []);

  // Recharts Chart 2: PME compliance status pie chart
  const complianceDistribution = [
    { name: 'Fit', value: employees.filter(e => e.pmeStatus === 'Fit').length, color: '#10b981' },
    { name: 'Fit with Restrictions', value: employees.filter(e => e.pmeStatus === 'Fit with Restrictions').length, color: '#fbbf24' },
    { name: 'Overdue PME', value: employees.filter(e => e.pmeStatus === 'Overdue').length, color: '#ef4444' },
    { name: 'Scheduled', value: employees.filter(e => e.pmeStatus === 'Scheduled').length, color: '#0ea5e9' }
  ];

  // Recharts Chart 3: Disease Trends (COPD/Silicosis/Hypertension occurrences) over years 2021-2025
  const historicDiseaseTrends = [
    { year: '2021', Pneumoconiosis: 2, COPD: 5, Hypertension: 12 },
    { year: '2022', Pneumoconiosis: 4, COPD: 7, Hypertension: 15 },
    { year: '2023', Pneumoconiosis: 5, COPD: 9, Hypertension: 19 },
    { year: '2024', Pneumoconiosis: 8, COPD: 10, Hypertension: 21 },
    { year: '2025', Pneumoconiosis: 11, COPD: 12, Hypertension: 24 }
  ];

  // Recharts Chart 4: Risk levels vs Mine exposure year gradient
  const exposureRiskCurve = [
    { exposureYears: 5, riskScore: 18 },
    { exposureYears: 10, riskScore: 32 },
    { exposureYears: 15, riskScore: 54 },
    { exposureYears: 20, riskScore: 72 },
    { exposureYears: 25, riskScore: 84 },
    { exposureYears: 30, riskScore: 92 }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">Hospital Analytics Dashboard</h2>
        <p className="text-sm text-slate-500">Population-level health metrics, chronic disease curves, and predictive alerts for CCL collieries.</p>
      </div>

      {/* TOP CHARTS ROW: stacked bars and donut */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart 1: Sector Risk breakdown */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-sm">Industrial Risk Index by Mine Sector</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Classification of coal sector workers matching dust hazard categories.</p>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorRiskData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="sector" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="Low" fill="#38bdf8" name="Low Risk" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Medium" fill="#f59e0b" name="Moderate Risk" stackId="a" />
                <Bar dataKey="High" fill="#f43f5e" name="Severe Pneumoconiosis Risk" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Compliance status Donut Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-sm">Form O Status Breakdown</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Clearance ratios declared in administrative folders.</p>
          </div>

          <div className="h-44 w-full relative flex items-center justify-center mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {complianceDistribution.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold font-mono text-slate-800">{employees.length}</span>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">Total Workers</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
            {complianceDistribution.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="truncate">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HISTORIC DISEASE LINES CHART & COAL EXPOSURE CURVE */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Chart 3: Disease Line trends 2021-2025 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-sm">Historic Occupational Illness Trends (5-Year)</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Annual registered incidences of pneumoconiosis, Chronic Obstructive complaints, and systemic high BP.</p>
          </div>

          <div className="h-60 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicDiseaseTrends} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={9} />
                <Tooltip contentStyle={{ fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="Pneumoconiosis" stroke="#ef4444" strokeWidth={2.5} name="Pneumoconiosis Suspects" />
                <Line type="monotone" dataKey="COPD" stroke="#eab308" strokeWidth={2.5} name="COPD cases" />
                <Line type="monotone" dataKey="Hypertension" stroke="#0ea5e9" strokeWidth={2.5} name="Essential Hypertension" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Area risk index vs Mine exposure duration */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-sm">Exposure-to-Risk Intensity Curve</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Correlation coefficient between continuous years of active dust inhalation and medical risk scores.</p>
          </div>

          <div className="h-60 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={exposureRiskCurve} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="exposureYears" stroke="#94a3b8" name="Years of Dust Exposure" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={9} />
                <Tooltip contentStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="riskScore" stroke="#bfdbfe" fill="#dbeafe" name="Aggregate Risk Intensity (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* BOTTOM CLUSTER: PREDICTIVE HOSPITAL RECOMMENDATIONS */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col md:flex-row gap-6 items-center">
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-center shrink-0">
          <Bell className="h-8 w-8 text-amber-500" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-slate-800">
            <Lightbulb className="h-4.5 w-4.5 text-amber-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider font-display text-amber-800">Predictive clinical alerts</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Analytical forecasting engines identify <span className="font-semibold">Excavation Operators</span> older than 50 years to have a <span className="font-bold text-amber-700">45% higher probability</span> of developing persistent high blood pressure under thermal constraints. Implementing climate control operators cabs in Piparwar and Amrapali mines has shown to reduce average systolic pressure variations by 15mmHg over 3 months.
          </p>
        </div>
      </div>
    </div>
  );
};
export default Analytics;
