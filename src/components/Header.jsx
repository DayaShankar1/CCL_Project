import React, { useState, useEffect } from 'react';
import { Menu, Bell, Search, Hospital, ShieldAlert, HeartPulse, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePortal } from '../context/PortalContext';
import { useAuth } from '../context/AuthContext';
import cclLogo from '../../assets/ccl png.webp';

export const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { employees, pmeSchedules } = usePortal();
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterResults, setFilterResults] = useState([]);
  const [time, setTime] = useState(new Date().toUTCString().replace('GMT', 'UTC'));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toUTCString().replace('GMT', 'UTC'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const overdueCount = employees.filter(e => e.pmeStatus === 'Overdue').length;
  const activeBatchesCount = pmeSchedules.filter(s => s.status === 'In-Progress' || s.status === 'Scheduled').length;

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim().length > 1) {
      const match = employees.filter(emp => 
        emp.name.toLowerCase().includes(value.toLowerCase()) || 
        emp.employeeId.toLowerCase().includes(value.toLowerCase())
      );
      setFilterResults(match.slice(0, 5));
    } else {
      setFilterResults([]);
    }
  };

  const selectEmployeeResult = (employeeId) => {
    setSearchQuery('');
    setFilterResults([]);
    navigate(`/profile/${employeeId}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm shadow-slate-100">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-slate-100 lg:hidden text-slate-600 focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Brand / Location Designation */}
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center border border-slate-200 p-1 shrink-0 shadow-sm">
            <img src={cclLogo} alt="CCL Logo" className="h-full w-full object-contain" />
          </div>
          <div className="hidden sm:block">
            <span className="font-display font-bold text-slate-900 text-sm">Gandhinagar Main Chest Wing</span>
            <span className="ml-2 font-mono text-[10px] bg-sky-50 text-sky-700 border border-sky-100 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Coal Area (HQ)</span>
          </div>
        </div>
      </div>

      {/* Global Interactive Employee Lookup bar */}
      <div className="relative max-w-md w-full mx-8 hidden md:block">
        <label htmlFor="top-search" className="sr-only">Search employees by Name or ID</label>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          id="top-search"
          type="search"
          placeholder="Lookup Employee by Name or CCL ID..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="block w-full rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-10 pr-4 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
        />

        {searchQuery.trim().length > 1 && (
          <div className="absolute top-11 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
            {filterResults.length > 0 ? (
              filterResults.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => selectEmployeeResult(emp.employeeId)}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{emp.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{emp.employeeId} • {emp.designation}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] font-semibold font-mono rounded ${
                    emp.pmeStatus === 'Fit' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    emp.pmeStatus === 'Overdue' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                    'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    {emp.pmeStatus}
                  </span>
                </button>
              ))
            ) : (
              <div className="p-4 text-xs text-slate-500 text-center">No employee records found matching query</div>
            )}
            <div className="p-2 bg-slate-50 text-center">
              <button 
                onClick={() => { setFilterResults([]); navigate('/employees'); }}
                className="text-[10px] font-bold text-blue-600 hover:underline"
              >
                Go to Employee Directory
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Clock, Alert badges status & Profile details */}
      <div className="flex items-center gap-4">
        {/* Real-time sync clock */}
        <div className="text-right hidden sm:block">
          <p className="text-[11px] font-mono leading-none text-slate-500 font-medium">{time}</p>
          <p className="text-[10px] font-mono text-emerald-500 mt-1 uppercase font-bold tracking-wide flex items-center justify-end gap-1 select-none">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Cloud Portal Online
          </p>
        </div>

        {/* Warnings Banner */}
        <div className="flex gap-2">
          {overdueCount > 0 && (
            <div className="flex h-9 items-center gap-1.5 rounded-full bg-rose-50 border border-rose-100 px-3 py-1 text-xs font-semibold text-rose-700" title="Employees with Overdue PME sessions">
              <ShieldAlert className="h-4 w-4" />
              <span>{overdueCount} Alerts</span>
            </div>
          )}

          {activeBatchesCount > 0 && (
            <div className="flex h-9 items-center gap-1.5 rounded-full bg-amber-50 border border-amber-100 px-3 py-1 text-xs font-semibold text-amber-700" title="Active PME tracks scheduled">
              <HeartPulse className="h-4 w-4" />
              <span>{activeBatchesCount} Scheduled</span>
            </div>
          )}
        </div>

        {/* Logout Control */}
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 px-3 py-1 cursor-pointer transition shadow-sm"
          title="Sign out of portal"
        >
          <LogOut className="h-4 w-4 text-slate-500" />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};
