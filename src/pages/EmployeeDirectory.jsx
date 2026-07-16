import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  UserPlus,
  ArrowUpDown,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  Flame,
  ShieldCheck,
  Ban
} from 'lucide-react';
import { usePortal } from '../context/PortalContext';

export const EmployeeDirectory = () => {
  const navigate = useNavigate();
  const { employees } = usePortal();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedPmeStatus, setSelectedPmeStatus] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [sortBy, setSortBy] = useState('name');

  // Available Unique Values for Filters
  const departments = ['All', 'Underground Mining', 'Opencast Mining', 'Excavation', 'Administration', 'Coal Handling Plant'];
  const pmeStatuses = ['All', 'Fit', 'Unfit', 'Fit with Restrictions', 'Overdue', 'Scheduled'];
  const risks = ['All', 'High', 'Medium', 'Low'];

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDept('All');
    setSelectedPmeStatus('All');
    setSelectedRisk('All');
    setSortBy('name');
  };

  // Filter & Sort Logic
  const filteredEmployees = useMemo(() => {
    return employees
      .filter((emp) => {
        const matchesSearch = 
          emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.designation.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesDept = selectedDept === 'All' ? true : emp.department === selectedDept;
        const matchesPme = selectedPmeStatus === 'All' ? true : emp.pmeStatus === selectedPmeStatus;
        const matchesRisk = selectedRisk === 'All' ? true : emp.riskCategory === selectedRisk;

        return matchesSearch && matchesDept && matchesPme && matchesRisk;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        } else if (sortBy === 'risk') {
          return b.riskScore - a.riskScore;
        } else if (sortBy === 'nextDue') {
          return new Date(a.nextPmeDueDate).getTime() - new Date(b.nextPmeDueDate).getTime();
        }
        return 0;
      });
  }, [employees, searchQuery, selectedDept, selectedPmeStatus, selectedRisk, sortBy]);

  return (
    <div className="space-y-6">
      {/* Page Header controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-3xl font-black tracking-tight text-slate-950">Personnel Health Records Directory</h2>
          <p className="text-sm text-slate-500 font-medium">Continuous health tracking index for coal workers and personnel at CCL Gandhinagar Hospital.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/tracker')}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer shrink-0"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Batch Schedule Manager</span>
          </button>
          <button
            onClick={() => navigate('/add-employee')}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700 transition cursor-pointer shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Direct Search and Interactive Filters panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        {/* Search row */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4.5 w-4.5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search miners by name, designation, or CCL ID number (e.g. CCL104)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs text-slate-850 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={resetFilters}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              title="Reset Filters"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="risk">Sort by Risk Index</option>
              <option value="nextDue">Sort by Exam Due Date</option>
            </select>
          </div>
        </div>

        {/* Filter categories pills */}
        <div className="grid gap-4 sm:grid-cols-3 pt-2">
          {/* Dept filter */}
          <div className="space-y-1">
            <label className="text-[9px] font-mono font-extrabold text-slate-400 uppercase tracking-widest">Classification / Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-bold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* PME Status filter */}
          <div className="space-y-1">
            <label className="text-[9px] font-mono font-extrabold text-slate-400 uppercase tracking-widest">PME Clearance Status</label>
            <select
              value={selectedPmeStatus}
              onChange={(e) => setSelectedPmeStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-bold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {pmeStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Risk Level filter */}
          <div className="space-y-1">
            <label className="text-[9px] font-mono font-extrabold text-slate-400 uppercase tracking-widest">Pneumoconiosis Risk Category</label>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-bold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {risks.map((risk) => (
                <option key={risk} value={risk}>{risk === 'All' ? 'All Risks' : `${risk} Risk Level`}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table Layout */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Employee Details</th>
                <th className="px-6 py-4">Department & Mine</th>
                <th className="px-6 py-4">Pneumoconiosis Risk Score</th>
                <th className="px-6 py-4">Form O status</th>
                <th className="px-6 py-4">Next Exam Due</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => {
                  // Determine risk color mapping
                  const riskColor = 
                    emp.riskCategory === 'High' ? 'text-rose-600 bg-rose-50 border-rose-100' :
                    emp.riskCategory === 'Medium' ? 'text-amber-600 bg-amber-50 border-amber-100' :
                    'text-sky-600 bg-sky-50 border-sky-100';

                  // Determine status color mapping
                  const statusColor =
                    emp.pmeStatus === 'Fit' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' :
                    emp.pmeStatus === 'Fit with Restrictions' ? 'text-amber-700 bg-amber-50 border-amber-100' :
                    emp.pmeStatus === 'Overdue' ? 'text-rose-700 bg-rose-50 border-rose-100' :
                    'text-cyan-700 bg-cyan-50 border-cyan-100';

                  // Extract initials
                  const initials = emp.name.split(' ').map(n => n[0]).join('').slice(0, 2);

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name/ID */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center font-black text-xs font-display shrink-0 ${
                            emp.riskCategory === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {initials}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-950 hover:text-blue-600 hover:underline cursor-pointer" onClick={() => navigate(`/profile/${emp.employeeId}`)}>
                              {emp.name}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{emp.employeeId} • {emp.designation}</p>
                          </div>
                        </div>
                      </td>

                      {/* Dept/Mine */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">{emp.department}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{emp.mineName}</p>
                      </td>

                      {/* Risk Index */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wide leading-none ${riskColor}`}>
                            {emp.riskCategory === 'High' && <Flame className="h-3 w-3 inline shrink-0 text-rose-500 animate-pulse" />}
                            <span>{emp.riskCategory} ({emp.riskScore}%)</span>
                          </span>
                        </div>
                        <div className="w-24 mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              emp.riskCategory === 'High' ? 'bg-rose-500' :
                              emp.riskCategory === 'Medium' ? 'bg-amber-500' : 'bg-sky-400'
                            }`}
                            style={{ width: `${emp.riskScore}%` }}
                          />
                        </div>
                      </td>

                      {/* PME status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded border px-2.5 py-0.5 text-[10px] font-bold uppercase leading-none font-sans ${statusColor}`}>
                          {emp.pmeStatus === 'Fit' && <ShieldCheck className="h-3 w-3 shrink-0" />}
                          {emp.pmeStatus === 'Fit with Restrictions' && <ShieldCheck className="h-3 w-3 shrink-0" />}
                          {emp.pmeStatus === 'Unfit' && <Ban className="h-3 w-3 shrink-0" />}
                          {emp.pmeStatus === 'Overdue' && <AlertCircle className="h-3 w-3 shrink-0" />}
                          <span>{emp.pmeStatus}</span>
                        </span>
                      </td>

                      {/* Next Exam Due */}
                      <td className="px-6 py-4 font-mono text-[10px]">
                        <div>
                          <p className="font-semibold text-slate-800">{emp.nextPmeDueDate}</p>
                          <p className="text-slate-400 mt-0.5">Last Exam: {emp.lastPmeDate}</p>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/profile/${emp.employeeId}`)}
                            className="inline-flex items-center justify-center gap-1 rounded-md border border-slate-200 bg-white p-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                            title="Open Profile"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => navigate('/new-record', { state: { selectedEmployeeId: emp.id } })}
                            className="inline-flex items-center justify-center gap-1 rounded-md bg-blue-50 border border-blue-100 p-1.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                            title="Add Medical Examination"
                          >
                            <FileSpreadsheet className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No Coal Miners or Personnel found matching the specified filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default EmployeeDirectory;
