import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AccessDenied = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 py-12 text-center">
      <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-8 shadow-xl shadow-rose-100/40 max-w-md w-full space-y-6 animate-shake">
        {/* Shield Icon with alert style */}
        <div className="mx-auto h-16 w-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 border border-rose-200">
          <ShieldAlert className="h-8 w-8" />
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-black tracking-tight text-slate-900">Access Denied</h2>
          <p className="text-xs font-semibold text-rose-500 uppercase tracking-widest font-mono">Permission Level Required</p>
        </div>

        {/* Message */}
        <p className="text-slate-500 text-xs leading-relaxed font-medium">
          Your current portal role (<strong className="text-slate-800 font-bold">{user?.role || 'Guest'}</strong>) is not authorized to access this page. Please contact your administrator or switch accounts if you require access.
        </p>

        {/* Details card */}
        <div className="rounded-lg bg-slate-50 p-4 border text-[11px] text-slate-400 font-mono text-left space-y-1">
          <p><span className="font-bold text-slate-600">User Email:</span> {user?.email || 'N/A'}</p>
          <p><span className="font-bold text-slate-600">Assigned Role:</span> {user?.role || 'Guest'}</p>
          <p><span className="font-bold text-slate-600">Resource:</span> {window.location.hash || window.location.pathname}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-600 text-xs font-bold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700 transition cursor-pointer"
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
