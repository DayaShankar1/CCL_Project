import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, Activity, ShieldAlert, HeartPulse, Plus, Send, ChevronDown } from 'lucide-react';
import { usePortal } from '../context/PortalContext';
import { supabase } from '../supabaseClient';
import { validateName, validateEmployeeId, validateAge, validateBloodGroup, validatePhone, sanitizeInput } from '../utils/securityValidation';

export const AddEmployee = () => {
  const navigate = useNavigate();
  const { employees, addEmployee } = usePortal();

  // Form states
  const [employeeId, setEmployeeId] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [contactNo, setContactNo] = useState('');

  const [department, setDepartment] = useState('Underground Mining');
  const [designation, setDesignation] = useState('');
  const [totalServiceYears, setTotalServiceYears] = useState('0');
  const [dateOfJoining, setDateOfJoining] = useState(new Date().toISOString().split('T')[0]);

  const [dustExposureLevel, setDustExposureLevel] = useState('Medium');
  const [workCategory, setWorkCategory] = useState('Coal Face');
  const [mineName, setMineName] = useState('Gidi-A Colliery');

  const [error, setError] = useState('');
  const [dbError, setDbError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDbError('');
    setFormErrors({});

    const sanitizedEmpId = sanitizeInput(employeeId).toUpperCase();
    const sanitizedName = sanitizeInput(fullName);
    const sanitizedContact = sanitizeInput(contactNo);
    const sanitizedDesignation = sanitizeInput(designation);

    // Sync sanitized states back to inputs
    setEmployeeId(sanitizedEmpId);
    setFullName(sanitizedName);
    setContactNo(sanitizedContact);
    setDesignation(sanitizedDesignation);

    // Client-side validations
    const empIdErr = validateEmployeeId(sanitizedEmpId);
    const nameErr = validateName(sanitizedName);
    const ageErr = validateAge(age);
    const bgErr = validateBloodGroup(bloodGroup);
    
    let contactErr = null;
    if (sanitizedContact) {
      contactErr = validatePhone(sanitizedContact);
    }

    let designationErr = null;
    if (!sanitizedDesignation) {
      designationErr = "Designation is required.";
    } else if (sanitizedDesignation.length < 3) {
      designationErr = "Designation must be at least 3 characters.";
    } else if (sanitizedDesignation.length > 50) {
      designationErr = "Designation must not exceed 50 characters.";
    }

    const errors = {};
    if (empIdErr) errors.employeeId = empIdErr;
    if (nameErr) errors.fullName = nameErr;
    if (ageErr) errors.age = ageErr;
    if (bgErr) errors.bloodGroup = bgErr;
    if (contactErr) errors.contactNo = contactErr;
    if (designationErr) errors.designation = designationErr;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setError('Please correct the validation errors below.');
      return;
    }

    try {
      setLoading(true);

      // Duplicate check locally
      const isDuplicate = employees.some(
        (emp) => emp.employeeId.toLowerCase() === sanitizedEmpId.toLowerCase().trim()
      );
      if (isDuplicate) {
        setError(`Duplicate Employee ID: An employee with ID '${sanitizedEmpId}' is already registered.`);
        setLoading(false);
        return;
      }

      const record = {
        employeeId: sanitizedEmpId.trim(),
        name: sanitizedName.trim(),
        age: parseInt(age) || null,
        gender,
        dob,
        bloodGroup,
        contactNo: sanitizedContact.trim(),
        department,
        designation: sanitizedDesignation.trim(),
        totalServiceYears: parseInt(totalServiceYears) || 0,
        dateOfJoining,
        dustExposureLevel,
        workCategory,
        mineName,
        pmeStatus: 'Fit',
        riskScore: 0,
        riskCategory: 'Low',
        complianceRating: 5.0
      };

      // Insert into Supabase table
      const { error: insertError } = await supabase.from('employees').insert([record]);

      if (insertError) {
        setDbError(insertError.message || 'Supabase database insert failed.');
        throw insertError;
      }

      // Sync local context state
      addEmployee(record);

      // Navigate immediately to avoid alerts
      navigate('/employees');
    } catch (err) {
      setError(err.message || 'Failed to register employee to database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div>
        <h2 className="font-display text-3xl font-black tracking-tight text-slate-950">Add New Miner / Personnel</h2>
        <p className="text-sm text-slate-500 font-medium">Initialize medical files and occupational tracking details for new coal workers.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 flex items-start gap-3 text-xs text-rose-700 animate-shake">
          <ShieldAlert className="h-5 w-5 shrink-0 text-rose-500" />
          <div className="space-y-1">
            <p className="font-bold">Registration Alert</p>
            <p className="font-medium text-rose-600/90 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal Info */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-2.5 border-slate-100">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="font-display font-bold text-slate-950 text-sm tracking-tight">Personal Information</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label htmlFor="reg-emp-id" className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Employee ID (Required)</label>
              <input
                id="reg-emp-id"
                type="text"
                placeholder="e.g. CCL105942"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:ring-1 font-bold text-slate-800 focus:bg-white ${
                  formErrors.employeeId 
                    ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-blue-500'
                }`}
                required
              />
              {formErrors.employeeId && (
                <p className="text-rose-600 text-[10px] font-bold mt-1">{formErrors.employeeId}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-name" className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Full Name (Required)</label>
              <input
                id="reg-name"
                type="text"
                placeholder="e.g. Shashi Shekhar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:ring-1 font-bold text-slate-800 focus:bg-white ${
                  formErrors.fullName 
                    ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-blue-500'
                }`}
                required
              />
              {formErrors.fullName && (
                <p className="text-rose-600 text-[10px] font-bold mt-1">{formErrors.fullName}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-gender" className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Gender</label>
              <select
                id="reg-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:border-blue-500 focus:bg-white focus:outline-none font-bold text-slate-800"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-age" className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Age</label>
              <input
                id="reg-age"
                type="number"
                placeholder="e.g. 34"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:ring-1 font-bold text-slate-800 focus:bg-white ${
                  formErrors.age 
                    ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {formErrors.age && (
                <p className="text-rose-600 text-[10px] font-bold mt-1">{formErrors.age}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-dob" className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Date of Birth</label>
              <input
                id="reg-dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-blood" className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Blood Group</label>
              <select
                id="reg-blood"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:border-blue-500 focus:bg-white focus:outline-none font-bold text-slate-800"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="space-y-1.5 col-span-1 sm:col-span-3">
              <label htmlFor="reg-contact" className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Contact Number</label>
              <input
                id="reg-contact"
                type="text"
                placeholder="e.g. 9431102931"
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
                className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:ring-1 font-bold text-slate-800 focus:bg-white ${
                  formErrors.contactNo 
                    ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {formErrors.contactNo && (
                <p className="text-rose-600 text-[10px] font-bold mt-1">{formErrors.contactNo}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Employment Info */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-2.5 border-slate-100">
            <Briefcase className="h-5 w-5 text-blue-600" />
            <h3 className="font-display font-bold text-slate-950 text-sm tracking-tight">Employment Information</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="reg-dept" className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Department</label>
              <select
                id="reg-dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:border-blue-500 focus:bg-white focus:outline-none font-bold text-slate-800"
              >
                <option value="Underground Mining">Underground Mining</option>
                <option value="Opencast Mining">Opencast Mining</option>
                <option value="Excavation">Excavation</option>
                <option value="Administration">Administration</option>
                <option value="Coal Handling Plant">Coal Handling Plant</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-desig" className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Designation</label>
              <input
                id="reg-desig"
                type="text"
                placeholder="e.g. Shovel Operator"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:ring-1 font-bold text-slate-800 focus:bg-white ${
                  formErrors.designation 
                    ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-blue-500'
                }`}
                required
              />
              {formErrors.designation && (
                <p className="text-rose-600 text-[10px] font-bold mt-1">{formErrors.designation}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-years" className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Years in Mining Service</label>
              <input
                id="reg-years"
                type="number"
                placeholder="e.g. 8"
                value={totalServiceYears}
                onChange={(e) => setTotalServiceYears(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-800"
                min="0"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-joining" className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Joining Date</label>
              <input
                id="reg-joining"
                type="date"
                value={dateOfJoining}
                onChange={(e) => setDateOfJoining(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Occupational Info */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-2.5 border-slate-100">
            <Activity className="h-5 w-5 text-blue-600" />
            <h3 className="font-display font-bold text-slate-950 text-sm tracking-tight">Occupational Information</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label htmlFor="reg-dust" className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Dust Exposure Level</label>
              <select
                id="reg-dust"
                value={dustExposureLevel}
                onChange={(e) => setDustExposureLevel(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:border-blue-500 focus:bg-white focus:outline-none font-bold text-slate-800"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-cat" className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Work Category</label>
              <select
                id="reg-cat"
                value={workCategory}
                onChange={(e) => setWorkCategory(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:border-blue-500 focus:bg-white focus:outline-none font-bold text-slate-800"
              >
                <option value="Coal Face">Coal Face</option>
                <option value="Transportation">Transportation</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Administration">Administration</option>
                <option value="Ventilation">Ventilation</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-mine" className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Mining Zone / Colliery Location</label>
              <select
                id="reg-mine"
                value={mineName}
                onChange={(e) => setMineName(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:border-blue-500 focus:bg-white focus:outline-none font-bold text-slate-800"
              >
                <option value="Gidi-A Colliery">Gidi-A Colliery</option>
                <option value="Piparwar Opencast Mine">Piparwar Opencast Mine</option>
                <option value="Amrapali OCP">Amrapali OCP</option>
                <option value="Religara Colliery">Religara Colliery</option>
              </select>
            </div>
          </div>
        </div>

        {/* Database Error Banner - shown underneath the form */}
        {dbError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 flex items-start gap-3 text-xs text-rose-700 animate-shake">
            <ShieldAlert className="h-5 w-5 shrink-0 text-rose-500" />
            <div className="space-y-1.5 flex-1">
              <p className="font-bold text-rose-800">Supabase Database Error (Table Not Initialized)</p>
              <p className="font-medium text-rose-600/90 leading-relaxed">
                The database table <code>employees</code> could not be found or is not initialized in your Supabase project. 
                Please ensure you run the table creation query in your Supabase SQL Editor.
              </p>
              <div className="mt-2 bg-slate-900 text-slate-100 p-2.5 rounded font-mono text-[10px] select-all overflow-x-auto">
                {`create table employees ( id uuid default gen_random_uuid() primary key, "employeeId" text unique not null, name text not null, age integer, gender text, dob date, "bloodGroup" text, "contactNo" text, department text, designation text, "totalServiceYears" integer default 0, "dateOfJoining" date, "dustExposureLevel" text, "workCategory" text, "mineName" text, "pmeStatus" text default 'Fit', "riskScore" integer default 0, "riskCategory" text default 'Low', "complianceRating" numeric default 5.0, "lastPmeDate" date, "nextPmeDueDate" date, created_at timestamp with time zone default timezone('utc'::text, now()) not null );`}
              </div>
              <p className="text-[10px] font-mono text-rose-500 mt-1.5 font-bold">Raw Error Response: {dbError}</p>
            </div>
          </div>
        )}

        {/* Action Buttons Panel */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/employees')}
            className="px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2.5 font-bold text-xs transition shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{loading ? 'Saving Miner...' : 'Save Employee'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;
