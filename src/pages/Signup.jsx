import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, ShieldAlert, HeartPulse, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { validateName, validateEmail, validatePassword, sanitizeInput } from '../utils/securityValidation';
import cclLogo from '../../assets/ccl png.webp';

export const Signup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Doctor'); // 'Admin', 'Doctor', 'Medical Staff'
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

    const sanitizedName = sanitizeInput(fullName);
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedPassword = sanitizeInput(password);
    const sanitizedConfirmPassword = sanitizeInput(confirmPassword);

    // Sync input states
    setFullName(sanitizedName);
    setEmail(sanitizedEmail);

    const nameErr = validateName(sanitizedName);
    const emailErr = validateEmail(sanitizedEmail);
    const passErr = validatePassword(sanitizedPassword);

    const errors = {};
    if (nameErr) errors.fullName = nameErr;
    if (emailErr) errors.email = emailErr;
    if (passErr) errors.password = passErr;
    if (sanitizedPassword !== sanitizedConfirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setError('Please correct the validation errors below.');
      return;
    }

    try {
      setLoading(true);
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: sanitizedPassword,
        options: {
          data: {
            full_name: sanitizedName,
            role: role
          }
        }
      });
      if (error) throw error;

      // Save selected role in Supabase profiles table directly as well (failsafe)
      if (signUpData?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: signUpData.user.id,
            email: sanitizedEmail,
            full_name: sanitizedName,
            role: role
          }]);
        if (profileError) {
          console.error("Error creating profile in database:", profileError);
        }
      }

      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
            Register Workspace Account
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Create a clinician or staff account to access medical records, register Form O certificates, schedule periodical medical boards, and monitor patient health indicators.
          </p>

          {/* Bullet points info */}
          <div className="space-y-3 pt-6 border-t border-slate-800 text-slate-400 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
              <span>Role-based portal permissions (Doctor, Admin, Staff)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
              <span>Audit logs for all patient record creation & uploads</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
              <span>Direct compliance alerts for overdue miners</span>
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xl shadow-slate-100 flex flex-col justify-between my-auto">
          <div className="space-y-5">
            {/* Header */}
            <div className="text-center lg:text-left space-y-1">
              <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center border p-2 shadow-sm mx-auto lg:mx-0 mb-4 lg:hidden">
                <img src={cclLogo} alt="CCL Logo" className="h-full w-full object-contain" />
              </div>
              <h3 className="font-display font-black text-2xl text-slate-900 tracking-tight">Create Account</h3>
              <p className="text-slate-500 text-xs font-semibold">Join the CCL Gandhinagar medical surveillance portal.</p>
            </div>

            {/* Error alerts */}
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-3 flex items-start gap-2.5 text-xs text-rose-700 animate-shake">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-medium">
              <div className="space-y-1">
                <label htmlFor="signup-name" className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Full Name</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="signup-name"
                    type="text"
                    placeholder="Dr. Shashi Shekhar"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`block w-full rounded-lg border py-2 pl-10 pr-4 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 transition-colors ${
                      formErrors.fullName 
                        ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                        : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    required
                  />
                </div>
                {formErrors.fullName && (
                  <p className="text-rose-600 text-[10px] font-bold mt-1">{formErrors.fullName}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="signup-email" className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Email Address</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="signup-email"
                      type="email"
                      placeholder="shekhar@ccl.gov.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`block w-full rounded-lg border py-2 pl-10 pr-4 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 transition-colors ${
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

                <div className="space-y-1">
                  <label htmlFor="signup-role" className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Workspace Role</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <UserCheck className="h-4 w-4 text-slate-400" />
                    </div>
                    <select
                      id="signup-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-semibold"
                      required
                    >
                      <option value="Doctor">Doctor</option>
                      <option value="Admin">Admin</option>
                      <option value="Medical Staff">Medical Staff</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="signup-password" className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Password (min 8 characters)</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="signup-password"
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

              <div className="space-y-1">
                <label htmlFor="signup-confirm-password" className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Confirm Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="signup-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`block w-full rounded-lg border py-2 pl-10 pr-4 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 transition-colors ${
                      formErrors.confirmPassword 
                        ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                        : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    required
                  />
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-rose-600 text-[10px] font-bold mt-1">{formErrors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex h-10 items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-75 disabled:cursor-wait mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-1.5">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  <span>Register Account</span>
                )}
              </button>
            </form>
          </div>

          {/* Footer Navigation link */}
          <div className="text-center pt-6 border-t border-slate-100 mt-6">
            <span className="text-[11px] text-slate-500 font-semibold">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline font-bold">
                Sign In
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
