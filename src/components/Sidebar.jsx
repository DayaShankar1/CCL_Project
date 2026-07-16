import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCircle,
  FileSpreadsheet,
  FolderLock,
  CalendarDays,
  ShieldAlert,
  BarChart3,
  Flame,
  HeartPulse
} from 'lucide-react';
import { usePortal } from '../context/PortalContext';
import { useAuth } from '../context/AuthContext';
import cclLogo from '../../assets/ccl png.webp';

export const Sidebar = ({ isOpen, onClose }) => {
  const { employees } = usePortal();
  const { user } = useAuth();
  
  // Count overdue or high-risk employees
  const overdueCount = employees.filter(e => e.pmeStatus === 'Overdue').length;
  const highRiskCount = employees.filter(e => e.riskCategory === 'High').length;

  const role = user?.role || 'Doctor';

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Employee Directory', path: '/employees', icon: Users },
    { name: 'Employee Profile', path: '/profile/CCL104928', icon: UserCircle, subtitle: 'Daya Shankar (Default)' },
    { name: 'New Examination', path: '/new-record', icon: FileSpreadsheet },
    { name: 'Reports & Documents', path: '/documents', icon: FolderLock },
    { name: 'PME Tracker', path: '/tracker', icon: CalendarDays, badge: overdueCount ? `${overdueCount} Overdue` : undefined },
    { name: 'Risk Assessment', path: '/risk-assessment', icon: ShieldAlert, badge: highRiskCount ? `${highRiskCount} High` : undefined },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ].filter(item => {
    if (role === 'Doctor') {
      return item.name !== 'Analytics';
    }
    if (role === 'Medical Staff') {
      return ['Dashboard', 'Employee Directory', 'New Examination', 'Reports & Documents'].includes(item.name);
    }
    if (role === 'Admin') {
      return ['Dashboard', 'Employee Directory', 'Analytics', 'PME Tracker', 'Reports & Documents'].includes(item.name);
    }
    return true;
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#1e293b] text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-screen
      `}>
        {/* Header Section */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center border border-slate-700 p-1.5 shrink-0 shadow-sm">
            <img src={cclLogo} alt="CCL Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="font-display font-black text-sm tracking-wider leading-none text-white uppercase">
              CCL <span className="text-blue-500 font-extrabold">Gandhinagar</span>
            </h1>
            <p className="text-[9px] font-mono text-slate-400 mt-2 uppercase tracking-widest font-bold">Health Portal</p>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin">
          <p className="px-3 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-3">Health Portals</p>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                group flex items-center justify-between px-3 py-3 rounded-lg text-sm transition-all duration-150
                ${isActive 
                  ? 'bg-white/10 text-white border-l-4 border-blue-500 font-bold shadow-sm' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-[18px] w-[18px] transition-transform group-hover:scale-110" />
                <div className="flex flex-col">
                  <span>{item.name}</span>
                  {item.subtitle && (
                    <span className="text-[10px] text-slate-400 font-normal group-hover:text-slate-300 select-none">
                      {item.subtitle}
                    </span>
                  )}
                </div>
              </div>
              
              {item.badge && (
                <span className={`
                  px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-tight
                  ${item.name.includes('Risk') 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }
                `}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer info showing standard clinical compliance details */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 p-2 bg-slate-800/30 border border-slate-800 rounded-lg">
            <Flame className="h-5 w-5 text-amber-500 flex-shrink-0 animate-bounce" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200">System Compliant</p>
              <p className="text-[10px] font-mono text-slate-500 truncate leading-none mt-0.5">Coal Mines Regulation Act</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
