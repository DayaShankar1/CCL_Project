import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ShieldAlert, HeartPulse, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { validateEmail, validatePassword, sanitizeInput } from '../utils/securityValidation';
import cclLogo from '../../assets/ccl png.webp';

export const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Redirect to Dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFormErrors({});

    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedPassword = sanitizeInput(password);

    setEmail(sanitizedEmail);

    const emailErr = validateEmail(sanitizedEmail);
    const passErr = sanitizedPassword ? null : "Password is required.";

    const errors = {};
    if (emailErr) errors.email = emailErr;
    if (passErr) errors.password = passErr;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setError('Please correct the validation errors below.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: sanitizedPassword
      });
      if (error) throw error;
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden">
      {/* Left Pane - Branding & Intro (Split View) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden select-none">
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

        {/* Branding header */}
        <div className="flex items-center gap-3 z-10">
          <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center border border-slate-700 p-1.5 shadow-md">
            <img src={cclLogo} alt="CCL Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-white text-base tracking-wide leading-none">Central Coalfields Limited</h1>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">A Miniratna Company</span>
          </div>
        </div>

        {/* Main core message */}
        <div className="space-y-6 z-10 my-auto max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-semibold uppercase tracking-wider">
            <HeartPulse className="h-3.5 w-3.5" />
            <span>Health Surveillance</span>
          </div>
          <h2 className="font-display font-black text-4xl text-white tracking-tight leading-tight">
            Employee Health Monitoring Portal
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            A specialized healthcare application for the Gandhinagar Main Chest Wing, facilitating cyclical PME scheduling, digital Form logging, and advanced respiratory health analytics.
          </p>

          {/* Quick Stats / Info Row */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800">
            <div>
              <p className="font-mono text-xl font-bold text-white">100%</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Form Digitized</p>
            </div>
            <div>
              <p className="font-mono text-xl font-bold text-white">Real-time</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Risk Tracking</p>
            </div>
            <div>
              <p className="font-mono text-xl font-bold text-white">5-Year</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">PME Scheduling</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="z-10 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>&copy; {new Date().getFullYear()} CCL Gandhinagar Hospital</span>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Support</a>
          </div>
        </div>
      </div>

      {/* Right Pane - Form Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xl shadow-slate-100 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center lg:text-left space-y-2">
              {/* Logo display for mobile */}
              <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center border p-2 shadow-sm mx-auto lg:mx-0 mb-4 lg:hidden">
                <img src={cclLogo} alt="CCL Logo" className="h-full w-full object-contain" />
              </div>
              <h3 className="font-display font-black text-2xl text-slate-900 tracking-tight">Welcome Back</h3>
              <p className="text-slate-500 text-xs font-semibold">Sign in to access your clinical surveillance workspace.</p>
            </div>

            {/* Error alerts */}
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-3 flex items-start gap-2.5 text-xs text-rose-700 animate-shake">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Email Address</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="doctor@ccl.gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`block w-full rounded-lg border py-2.5 pl-10 pr-4 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 transition-colors ${
                      formErrors.email 
                        ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                        : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    required
                  />
                </div>
                {formErrors.email && (
                  <p className="text-rose-600 text-[10px] font-bold mt-1">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="login-password" className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Password</label>
                  <a href="#" className="text-[10px] text-blue-600 hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full rounded-lg border py-2.5 pl-10 pr-10 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 transition-colors ${
                      formErrors.password 
                        ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                        : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-rose-600 text-[10px] font-bold mt-1">{formErrors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex h-10 items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
              >
                {loading ? (
                  <span className="flex items-center gap-1.5">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          </div>

          {/* Footer Navigation link */}
          <div className="text-center pt-8 border-t border-slate-100 mt-8">
            <span className="text-[11px] text-slate-500 font-semibold">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 hover:underline font-bold">
                Sign Up
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
