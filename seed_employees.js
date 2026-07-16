import { createClient } from '@supabase/supabase-js';
import { INITIAL_EMPLOYEES } from './src/utils/mockData.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLIC_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLIC_KEY) {
  throw new Error('Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY before seeding.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

async function run() {
  try {
    console.log("Starting seed of employees...");

    // Format employees to match Supabase schema columns
    const dbEmployees = INITIAL_EMPLOYEES.map(emp => ({
      employeeId: emp.employeeId,
      name: emp.name,
      age: emp.age,
      gender: emp.gender,
      dob: emp.dateOfJoining, // map to dob / fallback
      bloodGroup: emp.bloodGroup,
      contactNo: emp.contactNo,
      department: emp.department,
      designation: emp.designation,
      totalServiceYears: emp.totalServiceYears,
      dateOfJoining: emp.dateOfJoining,
      dustExposureLevel: "Medium", // fallback
      workCategory: "Underground", // fallback
      mineName: emp.mineName,
      pmeStatus: emp.pmeStatus,
      riskScore: emp.riskScore,
      riskCategory: emp.riskCategory,
      complianceRating: emp.complianceRating,
      lastPmeDate: emp.lastPmeDate,
      nextPmeDueDate: emp.nextPmeDueDate
    }));

    // Insert employees
    const { data, error } = await supabase
      .from('employees')
      .upsert(dbEmployees, { onConflict: 'employeeId' });

    if (error) throw error;

    console.log("Successfully seeded mock employees in Supabase database!");
  } catch (err) {
    console.error("Error seeding database:", err.message);
  }
}

run();
