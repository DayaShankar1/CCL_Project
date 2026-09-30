import React, { useState, useMemo, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  Briefcase,
  AlertOctagon,
  FileSpreadsheet,
  CheckCircle,
  Plus,
  Minus,
  Send,
  Sliders,
  Sparkles,
  Info,
  Edit,
  X,
  Search,
  UserCircle,
  Mail,
  RefreshCw,
  Eye,
  Bell,
  ChevronRight
} from 'lucide-react';
import { usePortal } from '../context/PortalContext';
import { supabase } from '../supabaseClient';
import * as XLSX from 'xlsx';
import { validateName, sanitizeInput } from '../utils/securityValidation';

export const PmeTracker = () => {
  const { employees, pmeSchedules, addPMESchedule, updatePMESchedule } = usePortal();

  // Local employees state to synchronize changes locally when database operations complete
  const [localEmployees, setLocalEmployees] = useState([]);

  useEffect(() => {
    setLocalEmployees(employees);
  }, [employees]);

  // Active Tab: 'compliance' (Compliance Monitor) or 'batches' (Batch Milestones)
  const [activeTab, setActiveTab] = useState('compliance');

  // Search & Navigation States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeViewEmployee, setActiveViewEmployee] = useState(null);

  // Vitals & Reports states inside View Drawer
  const [viewEmployeeReports, setViewEmployeeReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [previewReport, setPreviewReport] = useState(null);

  // Single Reminder Modal States
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderEmployee, setReminderEmployee] = useState(null);
  const [reminderTypeEmail, setReminderTypeEmail] = useState(true);
  const [reminderTypeSms, setReminderTypeSms] = useState(true);
  const [isSendingReminder, setIsSendingReminder] = useState(false);

  // Batch Notice Modal States
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [targetOverdue, setTargetOverdue] = useState(true);
  const [targetDueSoon, setTargetDueSoon] = useState(true);
  const [expandOverdue, setExpandOverdue] = useState(false);
  const [expandDueSoon, setExpandDueSoon] = useState(false);
  const [isSendingBatch, setIsSendingBatch] = useState(false);
  const [batchProgressText, setBatchProgressText] = useState('');
  const [batchTargetEmployees, setBatchTargetEmployees] = useState([]);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchStatuses, setBatchStatuses] = useState({});
  const [showBatchSummary, setShowBatchSummary] = useState(false);
  const [batchSummaryData, setBatchSummaryData] = useState({ total: 0, success: 0, failed: 0 });

  // Scheduling Modal States
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleEmployee, setScheduleEmployee] = useState(null);
  const [doctorName, setDoctorName] = useState('Dr. B. N. Prasad');
  const [hospitalWing, setHospitalWing] = useState('Surveillance Wing');
  const [scheduleDateVal, setScheduleDateVal] = useState('');
  const [scheduleTimeSlot, setScheduleTimeSlot] = useState('09:00 AM - 10:00 AM');
  const [scheduleRemarks, setScheduleRemarks] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  // Toast States
  const [toasts, setToasts] = useState([]);
  const [sendingEmployeeId, setSendingEmployeeId] = useState(null);

  // Refresh State
  const [isRefreshing, setIsRefreshing] = useState(false);

  // New Schedule form state (inside Batches Tab)
  const [showForm, setShowForm] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [department, setDepartment] = useState('Underground Mining');
  const [targetCount, setTargetCount] = useState('10');
  const [scheduledDate, setScheduledDate] = useState('');
  const [mineName, setMineName] = useState('Gidi-A Colliery');

  // Edit Schedule form state
  const [editingBatch, setEditingBatch] = useState(null);
  const [editBatchName, setEditBatchName] = useState('');
  const [editDepartment, setEditDepartment] = useState('Underground Mining');
  const [editTargetCount, setEditTargetCount] = useState('10');
  const [editCompletedCount, setEditCompletedCount] = useState('0');
  const [editScheduledDate, setEditScheduledDate] = useState('');
  const [editMineName, setEditMineName] = useState('Gidi-A Colliery');
  const [editStatus, setEditStatus] = useState('Scheduled');
  const [scheduleErrors, setScheduleErrors] = useState({});
  const [createBatchErrors, setCreateBatchErrors] = useState({});
  const [editBatchErrors, setEditBatchErrors] = useState({});

  // Dynamic Toast Trigger
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch reports when active worker changes in drawer
  useEffect(() => {
    if (!activeViewEmployee) {
      setViewEmployeeReports([]);
      return;
    }

    const fetchEmployeeReports = async () => {
      setLoadingReports(true);
      try {
        const { data, error: reportsErr } = await supabase
          .from('reports')
          .select('*')
          .eq('employeeId', activeViewEmployee.employeeId)
          .order('created_at', { ascending: false });

        if (reportsErr) throw reportsErr;
        setViewEmployeeReports(data || []);
      } catch (err) {
        console.error('Error fetching employee reports:', err);
        showToast('Failed to load worker reports: ' + err.message, 'error');
      } finally {
        setLoadingReports(false);
      }
    };

    fetchEmployeeReports();
  }, [activeViewEmployee]);

  // Process employees to dynamically determine compliance status and days remaining
  const processedEmployees = useMemo(() => {
    return localEmployees.map((emp) => {
      let status = 'Scheduled'; // 'Overdue', 'Due Soon', 'Scheduled'
      let daysRemaining = 365;
      let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';

      if (emp.nextPmeDueDate && emp.nextPmeDueDate !== 'N/A') {
        const today = new Date("2026-06-25");
        const dueDate = new Date(emp.nextPmeDueDate);
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysRemaining = diffDays;

        if (emp.pmeStatus === 'Overdue' || diffDays < 0) {
          status = 'Overdue';
          badgeColor = 'bg-rose-50 text-rose-700 border-rose-100';
        } else if (diffDays <= 30) {
          status = 'Due Soon';
          badgeColor = 'bg-amber-50 text-amber-700 border-amber-100';
        } else {
          status = 'Scheduled';
          badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
        }
      } else {
        if (emp.pmeStatus === 'Overdue') {
          status = 'Overdue';
          daysRemaining = -15;
          badgeColor = 'bg-rose-50 text-rose-700 border-rose-100';
        } else {
          status = 'Scheduled';
          daysRemaining = 120;
          badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
        }
      }

      return {
        ...emp,
        calculatedStatus: status,
        daysRemaining,
        badgeColor
      };
    });
  }, [localEmployees]);

  // KPI count summaries
  const overdueCount = useMemo(() => processedEmployees.filter(e => e.calculatedStatus === 'Overdue').length, [processedEmployees]);
  const dueSoonCount = useMemo(() => processedEmployees.filter(e => e.calculatedStatus === 'Due Soon').length, [processedEmployees]);
  const scheduledCount = useMemo(() => processedEmployees.filter(e => e.calculatedStatus === 'Scheduled').length, [processedEmployees]);

  // Filter and search logic
  const filteredEmployees = useMemo(() => {
    return processedEmployees.filter((emp) => {
      const matchesSearch = 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.mineName.toLowerCase().includes(searchQuery.toLowerCase());

      if (statusFilter === 'All') return matchesSearch;
      return matchesSearch && emp.calculatedStatus === statusFilter;
    });
  }, [processedEmployees, searchQuery, statusFilter]);

  // Refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast("✓ Compliance database refreshed");
    }, 700);
  };

  // Excel Export using SheetJS (XLSX)
  const handleExportReport = () => {
    try {
      const rows = filteredEmployees.map((emp) => ({
        "Employee ID": emp.employeeId,
        "Employee Name": emp.name,
        "Department": emp.department,
        "Mine Location": emp.mineName,
        "Last PME Date": emp.lastPmeDate || 'N/A',
        "Next PME Date": emp.nextPmeDueDate || 'N/A',
        "Risk Category": emp.riskCategory || 'Low',
        "Risk Score": emp.riskScore !== undefined ? emp.riskScore : 0,
        "Status": emp.calculatedStatus,
        "Days Remaining": emp.daysRemaining
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "PME Compliance Status");

      // Set column widths
      const wscols = [
        { wch: 15 }, // ID
        { wch: 22 }, // Name
        { wch: 20 }, // Dept
        { wch: 22 }, // Mine
        { wch: 15 }, // Last PME
        { wch: 15 }, // Next PME
        { wch: 15 }, // Risk Cat
        { wch: 12 }, // Risk Score
        { wch: 15 }, // Status
        { wch: 15 }  // Days Rem
      ];
      worksheet['!cols'] = wscols;

      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '_');
      XLSX.writeFile(workbook, `PME_Compliance_Report_${dateStr}.xlsx`);
      showToast("✓ Export completed");
    } catch (err) {
      console.error("Export failed:", err);
      showToast("Export failed: " + err.message, "error");
    }
  };

  const handleViewEmployee = (emp) => {
    setActiveViewEmployee(emp);
  };

  // Single Reminder Logic
  const handleSendReminder = async (emp) => {
    const phone = emp.phone || emp.contactNo;
    if (!phone || !phone.trim()) {
      showToast("Phone number not available for this employee", "error");
      return;
    }

    setSendingEmployeeId(emp.id);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      let response;
      try {
        response = await fetch(`${API_BASE_URL}/api/sms/send-reminder`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            phone: phone.trim(),
            employeeName: emp.name
          })
        });
      } catch (netErr) {
        console.error("Network or Backend Connection Error:", netErr);
        showToast("❌ Unable to connect to backend server (Port 5001). Please check if backend server is running.", "error");
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        showToast(`✅ WhatsApp reminder sent successfully to ${emp.name}`, "success");
        try {
          await supabase.from('reminder_logs').insert([
            {
              employeeId: emp.employeeId,
              employeeName: emp.name,
              type: 'WhatsApp',
              sentAt: new Date().toISOString(),
              status: 'Sent'
            }
          ]);
        } catch (dbErr) {
          console.warn("Reminder log write to Supabase failed:", dbErr);
        }
      } else {
        console.error("Backend Error:", data);
        const errMsg = data.message || "Failed to send WhatsApp reminder";
        showToast(`❌ ${errMsg}`, "error");
      }
    } catch (err) {
      console.error("Unexpected Error in handleSendReminder:", err);
      showToast(`❌ ${err.message || 'An unexpected error occurred'}`, "error");
    } finally {
      setSendingEmployeeId(null);
    }
  };

  const handleConfirmReminder = async (e) => {
    e.preventDefault();
    if (!reminderTypeEmail && !reminderTypeSms) {
      showToast("Please choose at least one reminder channel", "error");
      return;
    }

    setIsSendingReminder(true);
    try {
      const selectedTypes = [];
      if (reminderTypeEmail) selectedTypes.push("Email");
      if (reminderTypeSms) selectedTypes.push("WhatsApp");

      const phone = reminderEmployee?.phone || reminderEmployee?.contactNo;
      let twilioSuccess = false;

      if (reminderTypeSms) {
        if (!phone || !phone.trim()) {
          throw new Error("Employee phone number is missing");
        }
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
        const response = await fetch(`${API_BASE_URL}/api/sms/send-reminder`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: phone.trim(),
            employeeName: reminderEmployee.name
          })
        });
        const data = await response.json();
        if (response.ok && data.success) {
          twilioSuccess = true;
        } else {
          throw new Error(data.message || "Twilio WhatsApp delivery failed");
        }
      }

      // Insert log into reminder_logs
      const { error: logErr } = await supabase
        .from('reminder_logs')
        .insert([
          {
            employeeId: reminderEmployee.employeeId,
            employeeName: reminderEmployee.name,
            type: selectedTypes.join(', '),
            sentAt: new Date().toISOString(),
            status: twilioSuccess ? 'Sent' : 'Queued'
          }
        ]);

      if (logErr) {
        console.warn("Failed to write reminder log.", logErr);
      }

      showToast(`✅ WhatsApp reminder sent to ${reminderEmployee.name}`, "success");
      setShowReminderModal(false);
    } catch (err) {
      console.error("Failed to send reminder:", err);
      showToast("❌ Failed: " + err.message, "error");
    } finally {
      setIsSendingReminder(false);
    }
  };

  // Batch Notices Logic
  const handleSendBatchNotices = async () => {
    const targets = [];
    if (targetOverdue) {
      processedEmployees.filter(e => e.calculatedStatus === 'Overdue').forEach(e => targets.push(e));
    }
    if (targetDueSoon) {
      processedEmployees.filter(e => e.calculatedStatus === 'Due Soon').forEach(e => targets.push(e));
    }

    if (targets.length === 0) {
      showToast("No target recipients selected", "error");
      return;
    }

    setIsSendingBatch(true);
    setBatchTargetEmployees(targets);
    setBatchProgress(0);
    setBatchStatuses({});
    setShowBatchSummary(false);

    let successCount = 0;
    let failedCount = 0;
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

    for (let i = 0; i < targets.length; i++) {
      const emp = targets[i];
      setBatchStatuses(prev => ({ ...prev, [emp.id]: 'sending' }));

      const phone = emp.phone || emp.contactNo;

      if (!phone || !phone.trim()) {
        failedCount++;
        setBatchStatuses(prev => ({ ...prev, [emp.id]: 'failed' }));
        setBatchProgress(i + 1);
        await new Promise(resolve => setTimeout(resolve, 300));
        continue;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/sms/send-reminder`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            phone: phone.trim(),
            employeeName: emp.name
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          successCount++;
          setBatchStatuses(prev => ({ ...prev, [emp.id]: 'sent' }));

          // Save logs to Supabase reminder_logs
          await supabase.from('reminder_logs').insert([
            {
              employeeId: emp.employeeId,
              employeeName: emp.name,
              type: 'WhatsApp',
              sentAt: new Date().toISOString(),
              status: 'Sent'
            }
          ]).catch(err => console.warn("Reminder log write failed", err));

        } else {
          console.error(`Failed to send WhatsApp reminder to ${emp.name}:`, data);
          failedCount++;
          setBatchStatuses(prev => ({ ...prev, [emp.id]: 'failed' }));
        }
      } catch (err) {
        console.error(`Error sending WhatsApp reminder to ${emp.name}:`, err);
        failedCount++;
        setBatchStatuses(prev => ({ ...prev, [emp.id]: 'failed' }));
      }

      setBatchProgress(i + 1);

      // Add 300ms delay between requests to avoid hitting API rate limits
      if (i < targets.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    setBatchSummaryData({
      total: targets.length,
      success: successCount,
      failed: failedCount
    });
    setShowBatchSummary(true);
  };

  // Schedule Single Logic
  const handleScheduleSingle = (emp) => {
    setScheduleEmployee(emp);
    setDoctorName('Dr. B. N. Prasad');
    setHospitalWing('Surveillance Wing');
    setScheduleTimeSlot('09:00 AM - 10:00 AM');
    setScheduleRemarks('');
    setScheduleDateVal('');
    setShowScheduleModal(true);
  };

  const handleConfirmSchedule = async (e) => {
    e.preventDefault();
    setScheduleErrors({});

    if (!scheduleDateVal) {
      setScheduleErrors(prev => ({ ...prev, scheduleDateVal: "Please choose a valid scheduling date" }));
      return;
    }

    const sanitizedDoctor = sanitizeInput(doctorName);
    const sanitizedWing = sanitizeInput(hospitalWing);
    const sanitizedRemarks = sanitizeInput(scheduleRemarks);

    setDoctorName(sanitizedDoctor);
    setHospitalWing(sanitizedWing);
    setScheduleRemarks(sanitizedRemarks);

    const docErr = validateName(sanitizedDoctor);
    let wingErr = null;
    if (!sanitizedWing) {
      wingErr = "Hospital wing location is required.";
    } else if (sanitizedWing.length < 3) {
      wingErr = "Wing must be at least 3 characters.";
    }

    const errors = {};
    if (docErr) errors.doctorName = docErr;
    if (wingErr) errors.hospitalWing = wingErr;

    if (Object.keys(errors).length > 0) {
      setScheduleErrors(errors);
      return;
    }

    setIsScheduling(true);
    try {
      // 1. Update worker nextPmeDueDate in Supabase employees table
      const { error: updateErr } = await supabase
        .from('employees')
        .update({
          nextPmeDueDate: scheduleDateVal,
          pmeStatus: 'Scheduled'
        })
        .eq('employeeId', scheduleEmployee.employeeId);

      if (updateErr) throw updateErr;

      // 2. Insert schedule log in schedule_logs
      const { error: logErr } = await supabase
        .from('schedule_logs')
        .insert([
          {
            employeeId: scheduleEmployee.employeeId,
            employeeName: scheduleEmployee.name,
            doctor: sanitizedDoctor,
            hospitalWing: sanitizedWing,
            date: scheduleDateVal,
            timeSlot: scheduleTimeSlot,
            remarks: sanitizedRemarks
          }
        ]);

      if (logErr) {
        console.warn("Failed to create schedule log. schedule_logs table might be missing.", logErr);
      }

      // 3. Update local state list to synchronize view immediately
      setLocalEmployees((prev) => 
        prev.map((emp) => {
          if (emp.employeeId === scheduleEmployee.employeeId) {
            return {
              ...emp,
              nextPmeDueDate: scheduleDateVal,
              pmeStatus: 'Scheduled'
            };
          }
          return emp;
        })
      );

      showToast("✓ Schedule created successfully");
      setScheduleErrors({});
      setShowScheduleModal(false);
    } catch (err) {
      console.error("Scheduling failed:", err);
      showToast("Failed to create schedule: " + err.message, "error");
    } finally {
      setIsScheduling(false);
    }
  };

  // Batch Milestone calendar actions
  const handleCreateSchedule = (e) => {
    e.preventDefault();
    setCreateBatchErrors({});

    const sanitizedBatchName = sanitizeInput(batchName);
    setBatchName(sanitizedBatchName);

    const errors = {};
    if (!sanitizedBatchName) {
      errors.batchName = 'Please provide a batch name.';
    } else if (sanitizedBatchName.length < 3) {
      errors.batchName = 'Batch name must be at least 3 characters.';
    } else if (sanitizedBatchName.length > 50) {
      errors.batchName = 'Batch name must not exceed 50 characters.';
    }

    if (!scheduledDate) {
      errors.scheduledDate = 'Please choose a target calendar date.';
    }

    const tCount = Number(targetCount);
    if (!targetCount) {
      errors.targetCount = 'Target count is required.';
    } else if (isNaN(tCount) || tCount < 1 || tCount > 500) {
      errors.targetCount = 'Target miners count must be between 1 and 500.';
    }

    if (Object.keys(errors).length > 0) {
      setCreateBatchErrors(errors);
      return;
    }

    addPMESchedule({
      batchName: sanitizedBatchName,
      department: department,
      targetCount: tCount,
      scheduledDate,
      status: 'Scheduled',
      mineName,
    });

    setBatchName('');
    setScheduledDate('');
    setCreateBatchErrors({});
    setShowForm(false);
    showToast("✓ PME Batch Scheduled");
  };

  const handleEditClick = (sch) => {
    setEditingBatch(sch);
    setEditBatchName(sch.batchName);
    setEditDepartment(sch.department);
    setEditTargetCount(String(sch.targetCount));
    setEditCompletedCount(String(sch.completedCount));
    setEditScheduledDate(sch.scheduledDate);
    setEditMineName(sch.mineName);
    setEditStatus(sch.status);
    setEditBatchErrors({});
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setEditBatchErrors({});

    const sanitizedEditBatchName = sanitizeInput(editBatchName);
    setEditBatchName(sanitizedEditBatchName);

    const errors = {};
    if (!sanitizedEditBatchName) {
      errors.editBatchName = 'Please provide a batch name.';
    } else if (sanitizedEditBatchName.length < 3) {
      errors.editBatchName = 'Batch name must be at least 3 characters.';
    } else if (sanitizedEditBatchName.length > 50) {
      errors.editBatchName = 'Batch name must not exceed 50 characters.';
    }

    if (!editScheduledDate) {
      errors.editScheduledDate = 'Please choose a target calendar date.';
    }

    const editTCount = Number(editTargetCount);
    if (!editTargetCount) {
      errors.editTargetCount = 'Target count is required.';
    } else if (isNaN(editTCount) || editTCount < 1 || editTCount > 500) {
      errors.editTargetCount = 'Target miners count must be between 1 and 500.';
    }

    const editCCount = Number(editCompletedCount);
    if (editCompletedCount === undefined || editCompletedCount === null || editCompletedCount === '') {
      errors.editCompletedCount = 'Completed count is required.';
    } else if (isNaN(editCCount) || editCCount < 0 || editCCount > editTCount) {
      errors.editCompletedCount = `Completed count must be between 0 and the target count (${editTCount}).`;
    }

    if (Object.keys(errors).length > 0) {
      setEditBatchErrors(errors);
      return;
    }

    updatePMESchedule(editingBatch.id, {
      batchName: sanitizedEditBatchName,
      department: editDepartment,
      targetCount: editTCount,
      completedCount: editCCount,
      scheduledDate: editScheduledDate,
      mineName: editMineName,
      status: editStatus,
    });
    setEditingBatch(null);
    setEditBatchErrors({});
    showToast("✓ Batch progress updated");
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-3xl font-black tracking-tight text-slate-950">Periodical Medical Examination (PME) Tracker</h2>
          <p className="text-sm text-slate-500 font-medium">Monitor compliance ratings, coordinate cyclical medical boards, and schedule personnel surveillance checks.</p>
        </div>
        
        {/* Tab Selection Navigation */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-lg border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'compliance'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Compliance Monitor
          </button>
          <button
            onClick={() => setActiveTab('batches')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'batches'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Batch Milestones
          </button>
        </div>
      </div>

      {activeTab === 'compliance' ? (
        <>
          {/* KPI Summary Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* 1. Overdue */}
            <div className="rounded-xl border border-rose-200 bg-white p-5 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between group">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-widest block">Overdue Employees</span>
                <h3 className="font-display font-black text-3xl text-rose-600 leading-none">{overdueCount}</h3>
                <p className="text-xs text-slate-400 font-medium">PME expired. Immediate action required.</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform duration-200 shrink-0">
                <AlertOctagon className="h-6 w-6 text-rose-600" />
              </div>
            </div>

            {/* 2. Due Soon */}
            <div className="rounded-xl border border-amber-200 bg-white p-5 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between group">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">Due in Next 30 Days</span>
                <h3 className="font-display font-black text-3xl text-amber-600 leading-none">{dueSoonCount}</h3>
                <p className="text-xs text-slate-400 font-medium">Upcoming examinations.</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-200 shrink-0">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>

            {/* 3. Scheduled */}
            <div className="rounded-xl border border-emerald-200 bg-white p-5 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between group">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest block">Scheduled</span>
                <h3 className="font-display font-black text-3xl text-emerald-600 leading-none">{scheduledCount}</h3>
                <p className="text-xs text-slate-400 font-medium">Employees currently compliant.</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform duration-200 shrink-0">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <label htmlFor="search-input" className="sr-only">Search employees</label>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search by name, employee ID, or mine..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-500 font-medium min-w-[160px]"
              >
                <option value="All">All Compliance Statuses</option>
                <option value="Overdue">Overdue PME</option>
                <option value="Due Soon">Due Soon (30 Days)</option>
                <option value="Scheduled">Scheduled / Compliant</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBatchModal(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700 transition cursor-pointer shrink-0"
              >
                <Send className="h-4 w-4" />
                <span>Send Batch Notices</span>
              </button>

              <button
                onClick={handleExportReport}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer shrink-0"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <span>Export PME Report</span>
              </button>

              <button
                onClick={handleRefresh}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer shrink-0"
              >
                <RefreshCw className={`h-4 w-4 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </button>
            </div>
          </div>

          {/* Main Table or Empty State */}
          {statusFilter === 'Overdue' && overdueCount === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-emerald-50/10 border border-dashed border-emerald-250 rounded-2xl text-center space-y-4">
              <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-100 shadow-xs animate-pulse">
                <CheckCircle className="h-11 w-11 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-black text-slate-800 text-lg">Excellent!</h3>
                <p className="text-xs text-slate-500 font-semibold max-w-sm">All employees are currently PME compliant.</p>
              </div>
            </div>
          ) : filteredEmployees.length > 0 ? (
            /* Data Table */
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-mono uppercase text-[9px] font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Employee ID</th>
                      <th className="px-6 py-4">Employee Name</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">Mine Location</th>
                      <th className="px-6 py-4">Last PME Date</th>
                      <th className="px-6 py-4">Next PME Date</th>
                      <th className="px-6 py-4 text-center">Days Remaining</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                    {filteredEmployees.map((emp) => {
                      const isDaysOverdue = emp.daysRemaining < 0;
                      const phone = emp.phone || emp.contactNo;
                      const hasPhone = !!(phone && phone.trim());
                      const isSending = sendingEmployeeId === emp.id;
                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-slate-400">{emp.employeeId}</td>
                          <td className="px-6 py-4 font-bold text-slate-900">{emp.name}</td>
                          <td className="px-6 py-4">{emp.department}</td>
                          <td className="px-6 py-4 text-slate-500">{emp.mineName}</td>
                          <td className="px-6 py-4 font-mono text-[11px]">{emp.lastPmeDate || 'N/A'}</td>
                          <td className="px-6 py-4 font-mono text-[11px]">{emp.nextPmeDueDate || 'N/A'}</td>
                          <td className="px-6 py-4 text-center font-mono font-bold">
                            {isDaysOverdue ? (
                              <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 border border-rose-100 rounded">
                                {emp.daysRemaining} days (Overdue)
                              </span>
                            ) : (
                              <span className={`px-1.5 py-0.5 border rounded ${emp.daysRemaining <= 30 ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-slate-500 bg-slate-50 border-slate-150'}`}>
                                {emp.daysRemaining} days
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${emp.badgeColor}`}>
                              <span className={`mr-1 h-1.5 w-1.5 rounded-full ${
                                emp.calculatedStatus === 'Overdue' ? 'bg-rose-500' :
                                emp.calculatedStatus === 'Due Soon' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} />
                              {emp.calculatedStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => handleViewEmployee(emp)}
                                className="inline-flex items-center gap-1 rounded bg-slate-50 border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                              >
                                <Eye className="h-3 w-3 text-slate-500" />
                                <span>View</span>
                              </button>
                              
                              <button
                                onClick={() => handleSendReminder(emp)}
                                disabled={!hasPhone || isSending}
                                title={!hasPhone ? "Phone number not available" : ""}
                                className={`inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-600 hover:bg-blue-100 transition cursor-pointer ${
                                  !hasPhone || isSending ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                {isSending ? (
                                  <RefreshCw className="h-3 w-3 text-blue-500 animate-spin" />
                                ) : (
                                  <Bell className="h-3 w-3 text-blue-500" />
                                )}
                                <span>{isSending ? "Sending..." : "Reminder"}</span>
                              </button>

                              <button
                                onClick={() => handleScheduleSingle(emp)}
                                className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-600 hover:bg-emerald-100 transition cursor-pointer"
                              >
                                <CalendarDays className="h-3 w-3 text-emerald-500" />
                                <span>Schedule</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed rounded-xl text-slate-400 bg-slate-50/50 text-xs">
              No workers match the selected search query or filters.
            </div>
          )}
        </>
      ) : (
        /* Tab 2: Batch Scheduled Calendars */
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4 border-slate-100">
            <div>
              <h3 className="font-display font-black text-slate-950 text-base">Active & Upcoming Batch Milestones</h3>
              <p className="text-slate-500 text-xs mt-0.5">Aggregate surveillance schedules grouped by category, departments, and colliery location.</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700 transition cursor-pointer"
            >
              {showForm ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span>{showForm ? 'Hide Form' : 'Schedule PME Batch'}</span>
            </button>
          </div>

          {/* CREATE INPUT FORM */}
          {showForm && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/10 p-5 shadow-xs space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 border-b pb-2.5 border-blue-150">
                <CalendarDays className="h-4.5 w-4.5 text-blue-600" />
                <h3 className="font-display font-black text-blue-800 text-xs uppercase tracking-wider">Schedule Upcoming Batch</h3>
              </div>

              <form onSubmit={handleCreateSchedule} className="grid gap-4 sm:grid-cols-4 items-end text-xs">
                <div className="space-y-1.5 col-span-2">
                  <label htmlFor="batch-name" className="text-[10px] font-mono text-slate-500 uppercase font-bold">PME Batch Name</label>
                  <input
                    id="batch-name"
                    type="text"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    placeholder="e.g. Gidi-A Underground Miners Batch A"
                    className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:bg-white ${
                      createBatchErrors.batchName 
                        ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                        : 'border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    required
                  />
                  {createBatchErrors.batchName && (
                    <p className="text-rose-600 text-[10px] font-bold mt-1">{createBatchErrors.batchName}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="dept" className="text-[10px] font-mono text-slate-500 uppercase font-bold">Category</label>
                  <select
                    id="dept"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none font-medium"
                  >
                    <option value="Underground Mining">Underground Mining</option>
                    <option value="Opencast Mining">Opencast Mining</option>
                    <option value="Excavation">Excavation</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="target-emp" className="text-[10px] font-mono text-slate-500 uppercase font-bold">Personnel Count</label>
                  <input
                    id="target-emp"
                    type="number"
                    value={targetCount}
                    onChange={(e) => setTargetCount(e.target.value)}
                    className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:bg-white ${
                      createBatchErrors.targetCount 
                        ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                        : 'border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    required
                  />
                  {createBatchErrors.targetCount && (
                    <p className="text-rose-600 text-[10px] font-bold mt-1">{createBatchErrors.targetCount}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="target-mine" className="text-[10px] font-mono text-slate-500 uppercase font-bold">Mine Location</label>
                  <select
                    id="target-mine"
                    value={mineName}
                    onChange={(e) => setMineName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none font-medium"
                  >
                    <option value="Gidi-A Colliery">Gidi-A Colliery</option>
                    <option value="Piparwar Opencast Mine">Piparwar Opencast Mine</option>
                    <option value="Amrapali OCP">Amrapali OCP</option>
                    <option value="Religara Colliery">Religara Colliery</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="calendar-date" className="text-[10px] font-mono text-slate-500 uppercase font-bold">Calendar Date</label>
                  <input
                    id="calendar-date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className={`w-full text-xs p-2 border rounded-lg focus:outline-none focus:bg-white ${
                      createBatchErrors.scheduledDate 
                        ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                        : 'border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    required
                  />
                  {createBatchErrors.scheduledDate && (
                    <p className="text-rose-600 text-[10px] font-bold mt-1">{createBatchErrors.scheduledDate}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center justify-center gap-1.5 bg-blue-600 text-white rounded-lg px-4 font-bold text-xs transition hover:bg-blue-700 shadow-md shadow-blue-500/10 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Save Batch</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 h-9 border border-slate-200 rounded-lg text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Batches Progress Cards list */}
          <div className="grid gap-4 sm:grid-cols-2">
            {pmeSchedules.map((sch) => (
              <div key={sch.id} className="bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between border-slate-200 hover:border-slate-350 hover:shadow-md transition-all duration-200">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-tighter ${
                      sch.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      sch.status === 'In-Progress' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                      'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {sch.status}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">{sch.scheduledDate}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(sch);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Edit PME Batch"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 leading-snug">{sch.batchName}</h4>
                  <p className="text-[10px] text-slate-400 font-mono font-semibold">{sch.mineName} • {sch.department}</p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2.5 mt-5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold">Milestone Progress</span>
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-md p-0.5 shadow-xs">
                      <button
                        type="button"
                        disabled={sch.completedCount <= 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          updatePMESchedule(sch.id, { completedCount: Math.max(0, sch.completedCount - 1) });
                        }}
                        className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                        title="Decrease Checked Miners"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-mono text-[10px] text-slate-700 font-bold px-1 select-none">
                        {sch.completedCount} / {sch.targetCount} Checked
                      </span>
                      <button
                        type="button"
                        disabled={sch.completedCount >= sch.targetCount}
                        onClick={(e) => {
                          e.stopPropagation();
                          updatePMESchedule(sch.id, { completedCount: Math.min(sch.targetCount, sch.completedCount + 1) });
                        }}
                        className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                        title="Increase Checked Miners"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        sch.status === 'Completed' ? 'bg-emerald-500' :
                        sch.status === 'In-Progress' ? 'bg-indigo-500' : 'bg-slate-400'
                      }`}
                      style={{ width: `${(sch.completedCount / sch.targetCount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RIGHT-SIDE DRAWER: worker details view */}
      {activeViewEmployee && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs flex justify-end" 
          onClick={() => setActiveViewEmployee(null)}
        >
          <div 
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-slate-100">
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-blue-400" />
                <div>
                  <h3 className="font-display font-black text-sm tracking-tight">{activeViewEmployee.name}</h3>
                  <p className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">{activeViewEmployee.employeeId}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveViewEmployee(null)}
                className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Avatar and Demographic details */}
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-150 p-4 rounded-xl">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700 text-xl border-2 border-white shadow-sm shrink-0">
                  {activeViewEmployee.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{activeViewEmployee.name}</p>
                  <p className="text-slate-500 font-semibold">{activeViewEmployee.designation}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">{activeViewEmployee.department} • {activeViewEmployee.mineName}</p>
                </div>
              </div>

              {/* Data parameters */}
              <div className="space-y-4">
                <h4 className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Employee Demographics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 font-semibold">Blood Group</p>
                    <p className="font-bold text-slate-800 mt-1">{activeViewEmployee.bloodGroup || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold">Age / Gender</p>
                    <p className="font-bold text-slate-800 mt-1">{activeViewEmployee.age || 'N/A'} yrs • {activeViewEmployee.gender || 'Male'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold">Dust Exposure Level</p>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 bg-amber-50 text-amber-700 border border-amber-100">
                      {activeViewEmployee.dustExposureLevel || 'Medium'}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold">Total Service</p>
                    <p className="font-bold text-slate-800 mt-1">{activeViewEmployee.totalServiceYears || '0'} years</p>
                  </div>
                </div>

                <h4 className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1 pt-2">Medical Summary</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 font-semibold">Last PME Date</p>
                    <p className="font-bold text-slate-800 mt-1 font-mono">{activeViewEmployee.lastPmeDate || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold">Next PME Date</p>
                    <p className="font-bold text-slate-800 mt-1 font-mono">{activeViewEmployee.nextPmeDueDate || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold">Medical Officer</p>
                    <p className="font-bold text-slate-800 mt-1">Dr. B. N. Prasad</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold">Risk Score</p>
                    <p className="font-bold text-slate-800 mt-1 font-mono">{activeViewEmployee.riskScore !== undefined ? `${activeViewEmployee.riskScore} / 100` : '0 / 100'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold">Risk Category</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${
                      activeViewEmployee.riskCategory === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                      activeViewEmployee.riskCategory === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {activeViewEmployee.riskCategory || 'Low'}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold">Latest Fitness Status</p>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 bg-blue-50 text-blue-700 border border-blue-100">
                      {activeViewEmployee.pmeStatus || 'Fit'}
                    </span>
                  </div>
                </div>

                {/* Latest Medical Reports Sub-table */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Latest Medical Reports</h4>
                  {loadingReports ? (
                    <div className="p-4 text-center text-slate-400 animate-pulse font-medium">
                      Loading medical reports...
                    </div>
                  ) : viewEmployeeReports.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {viewEmployeeReports.map((report) => (
                        <div key={report.id} className="p-3 bg-slate-50 border border-slate-150 rounded-lg flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-800 truncate">{report.fileName}</p>
                            <p className="text-[10px] text-slate-450 mt-0.5">
                              {new Date(report.created_at).toLocaleDateString()} • {report.fileType}
                            </p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => setPreviewReport(report)}
                              className="px-2 py-1 rounded bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                            >
                              View
                            </button>
                            <a
                              href={report.fileUrl}
                              download={report.fileName}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded bg-blue-50 border border-blue-100 text-[10px] font-bold text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-450 border border-dashed rounded-lg bg-slate-50/50">
                      No medical reports uploaded for this worker.
                    </div>
                  )}
                </div>

                <h4 className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1 pt-2">Contact Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 w-16 font-semibold">Phone:</span>
                    <span className="font-bold text-slate-800">{activeViewEmployee.contactNo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 w-16 font-semibold">Email:</span>
                    <span className="font-bold text-slate-800 truncate">{activeViewEmployee.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => {
                  alert('Opening Full Medical Profile for ' + activeViewEmployee.name);
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-700 transition cursor-pointer shadow-md shadow-blue-500/10"
              >
                <span>Open Full Medical Profile</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE REMINDER CONFIRMATION MODAL */}
      {showReminderModal && reminderEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200 text-xs">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="h-4.5 w-4.5 text-blue-600" />
                <h3 className="font-display font-black text-slate-900 text-sm uppercase tracking-wider">Send PME Reminder</h3>
              </div>
              <button 
                onClick={() => setShowReminderModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                disabled={isSendingReminder}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-150">
                <div>
                  <p className="text-slate-400 font-semibold">Recipient Name</p>
                  <p className="font-bold text-slate-800 mt-0.5">{reminderEmployee.name}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold">Employee ID</p>
                  <p className="font-bold text-slate-800 mt-0.5">{reminderEmployee.employeeId}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Reminder Type (Channels)</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminderTypeEmail}
                      onChange={(e) => setReminderTypeEmail(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      disabled={isSendingReminder}
                    />
                    <span className="font-bold text-slate-700">Email Notice</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminderTypeSms}
                      onChange={(e) => setReminderTypeSms(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      disabled={isSendingReminder}
                    />
                    <span className="font-bold text-slate-700">SMS Notification</span>
                  </label>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1.5">Notification Message Preview</p>
                <div className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[10px] leading-relaxed border border-slate-800 shadow-inner">
                  <p className="font-bold text-emerald-500">[SURVEILLANCE COMPLIANCE REMINDER]</p>
                  <p className="mt-1.5">Dear {reminderEmployee.name},</p>
                  <p className="mt-1">This is an urgent notification regarding your Periodical Medical Examination (PME). Our records show that your PME is currently {reminderEmployee.calculatedStatus === 'Overdue' ? 'OVERDUE' : 'DUE SHORTLY'}.</p>
                  <p className="mt-1">Please report to the Medical Board of CCL Gandhinagar Hospital immediately.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowReminderModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                disabled={isSendingReminder}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReminder}
                disabled={isSendingReminder || (!reminderTypeEmail && !reminderTypeSms)}
                className="inline-flex items-center justify-center gap-1.5 bg-blue-600 text-white rounded-lg px-4 py-2 font-bold text-xs transition hover:bg-blue-700 shadow-md shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSendingReminder ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Queuing...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Reminder</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEND BATCH NOTICES MODAL */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200 text-xs">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <Mail className="h-4.5 w-4.5 text-blue-600" />
                <h3 className="font-display font-black text-slate-900 text-sm uppercase tracking-wider">Batch PME Reminder</h3>
              </div>
              <button 
                onClick={() => {
                  setShowBatchModal(false);
                  setShowBatchSummary(false);
                  setIsSendingBatch(false);
                }}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                disabled={isSendingBatch && !showBatchSummary}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {showBatchSummary ? (
              <div className="space-y-4">
                <div className="text-center py-4 space-y-2">
                  <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-100 mx-auto shadow-xs">
                    <CheckCircle className="h-6 w-6 text-emerald-600 animate-bounce" />
                  </div>
                  <h4 className="font-display font-black text-slate-900 text-sm uppercase tracking-wider">Batch Reminder Completed</h4>
                </div>
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-3 font-medium">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 font-bold">
                    <span className="text-slate-500">Total Employees</span>
                    <span className="font-mono text-slate-900 text-xs">{batchSummaryData.total}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 font-bold">
                    <span className="text-emerald-600">Successfully Sent</span>
                    <span className="font-mono text-emerald-600 text-xs">{batchSummaryData.success}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-rose-600">Failed</span>
                    <span className="font-mono text-rose-600 text-xs">{batchSummaryData.failed}</span>
                  </div>
                </div>
              </div>
            ) : isSendingBatch ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span>Sending reminders...</span>
                    <span className="font-mono">{batchProgress} / {batchTargetEmployees.length} completed</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${batchTargetEmployees.length > 0 ? (batchProgress / batchTargetEmployees.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white max-h-60 overflow-y-auto divide-y divide-slate-100 animate-fade-in">
                  {batchTargetEmployees.map((emp) => {
                    const status = batchStatuses[emp.id];
                    return (
                      <div key={emp.id} className="p-2.5 flex items-center justify-between text-[11px] font-medium">
                        <div className="min-w-0 flex-1 font-sans">
                          <span className="font-bold text-slate-700">{emp.name}</span>
                          <span className="text-slate-400 font-mono ml-2">({emp.employeeId})</span>
                        </div>
                        <div className="shrink-0 font-bold ml-2 font-mono">
                          {status === 'sending' && (
                            <span className="text-blue-500 flex items-center gap-1">
                              <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                              <span>Sending</span>
                            </span>
                          )}
                          {status === 'sent' && (
                            <span className="text-emerald-600">✅ Sent</span>
                          )}
                          {status === 'failed' && (
                            <span className="text-rose-600">❌ Failed</span>
                          )}
                          {!status && (
                            <span className="text-slate-400">Waiting</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-2">Target Recipients</p>
                  <div className="space-y-2.5">
                    
                    {/* Overdue Expandable Card */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                      <div 
                        className="flex items-center justify-between p-3 bg-slate-50 border-b border-slate-200 cursor-pointer"
                        onClick={() => setExpandOverdue(!expandOverdue)}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={targetOverdue}
                            onChange={(e) => setTargetOverdue(e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                            disabled={isSendingBatch}
                          />
                          <span className="font-bold text-slate-800">Overdue Employees ({overdueCount})</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {expandOverdue ? 'Hide Names' : 'Show Names'}
                        </span>
                      </div>
                      
                      {expandOverdue && (
                        <div className="p-3 bg-white max-h-32 overflow-y-auto divide-y divide-slate-100 font-sans">
                          {processedEmployees.filter(e => e.calculatedStatus === 'Overdue').map(e => (
                            <div key={e.id} className="py-1 flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-slate-700">{e.name}</span>
                              <span className="text-slate-400 font-mono">{e.employeeId}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {!expandOverdue && overdueCount > 0 && (
                        <div className="p-2.5 px-3 bg-white text-[11px] text-slate-500 italic font-sans">
                          {processedEmployees.filter(e => e.calculatedStatus === 'Overdue').slice(0, 2).map(e => e.name).join(', ')}
                          {overdueCount > 2 ? ` and +${overdueCount - 2} more` : ''}
                        </div>
                      )}
                    </div>

                    {/* Due Soon Expandable Card */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                      <div 
                        className="flex items-center justify-between p-3 bg-slate-50 border-b border-slate-200 cursor-pointer"
                        onClick={() => setExpandDueSoon(!expandDueSoon)}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={targetDueSoon}
                            onChange={(e) => setTargetDueSoon(e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                            disabled={isSendingBatch}
                          />
                          <span className="font-bold text-slate-800">Due within 30 Days ({dueSoonCount})</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {expandDueSoon ? 'Hide Names' : 'Show Names'}
                        </span>
                      </div>
                      
                      {expandDueSoon && (
                        <div className="p-3 bg-white max-h-32 overflow-y-auto divide-y divide-slate-100 font-sans">
                          {processedEmployees.filter(e => e.calculatedStatus === 'Due Soon').map(e => (
                            <div key={e.id} className="py-1 flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-slate-700">{e.name}</span>
                              <span className="text-slate-400 font-mono">{e.employeeId}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {!expandDueSoon && dueSoonCount > 0 && (
                        <div className="p-2.5 px-3 bg-white text-[11px] text-slate-500 italic font-sans">
                          {processedEmployees.filter(e => e.calculatedStatus === 'Due Soon').slice(0, 2).map(e => e.name).join(', ')}
                          {dueSoonCount > 2 ? ` and +${dueSoonCount - 2} more` : ''}
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-250 text-slate-750 font-bold text-xs select-none">
                  <span>Total Employees Selected:</span>
                  <span className="font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs">
                    {(targetOverdue ? overdueCount : 0) + (targetDueSoon ? dueSoonCount : 0)}
                  </span>
                </div>

                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-2">Message Preview</p>
                  <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] leading-relaxed border border-slate-800 shadow-inner space-y-2 select-none">
                    <p className="border-b border-slate-800 pb-1.5"><span className="text-slate-500">From:</span> surveillance-alert@ccl.gov.in</p>
                    <p className="border-b border-slate-800 pb-1.5"><span className="text-slate-500">Subject:</span> URGENT: Periodic Medical Examination (PME) Due Notification</p>
                    <div className="space-y-1.5 pt-1">
                      <p>Dear Employee,</p>
                      <p>This is to notify you that your Periodic Medical Examination (PME) compliance status is currently flagged. Under the Coal Mines Regulations, all active mine personnel must maintain current PME clearances.</p>
                      <p>Please report to the Medical Surveillance Dept at CCL Gandhinagar Hospital immediately to complete your clearance.</p>
                      <p className="text-slate-400 mt-4">— CCL Medical Surveillance Board</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              {showBatchSummary ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowBatchModal(false);
                    setShowBatchSummary(false);
                    setIsSendingBatch(false);
                  }}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                >
                  Close
                </button>
              ) : isSendingBatch ? (
                <span className="text-xs text-slate-500 font-semibold select-none">Please do not close this window while notifications are being dispatched...</span>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowBatchModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-650 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                    disabled={isSendingBatch}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={(!targetOverdue && !targetDueSoon)}
                    onClick={handleSendBatchNotices}
                    className="inline-flex items-center justify-center gap-1.5 bg-blue-600 text-white rounded-lg px-4 py-2 font-bold text-xs transition hover:bg-blue-700 shadow-md shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Notices</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULING MODAL */}
      {showScheduleModal && scheduleEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200 text-xs">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4.5 w-4.5 text-blue-600" />
                <h3 className="font-display font-black text-slate-900 text-sm uppercase tracking-wider">Book PME Examination</h3>
              </div>
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                disabled={isScheduling}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmSchedule} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-500 uppercase font-bold">Selected Employee</label>
                  <input
                    type="text"
                    value={`${scheduleEmployee.name} (${scheduleEmployee.employeeId})`}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none font-bold text-slate-700"
                    disabled
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="doctor" className="text-[10px] font-mono text-slate-500 uppercase font-bold">Medical Officer / Doctor</label>
                  <input
                    id="doctor"
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:bg-white font-medium ${
                      scheduleErrors.doctorName 
                        ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                        : 'border-slate-200 bg-white focus:border-blue-500'
                    }`}
                    required
                    disabled={isScheduling}
                  />
                  {scheduleErrors.doctorName && (
                    <p className="text-rose-600 text-[10px] font-bold mt-1">{scheduleErrors.doctorName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="wing" className="text-[10px] font-mono text-slate-500 uppercase font-bold">Hospital Wing</label>
                  <select
                    id="wing"
                    value={hospitalWing}
                    onChange={(e) => setHospitalWing(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none font-medium"
                    disabled={isScheduling}
                  >
                    <option value="Surveillance Wing">Surveillance Wing</option>
                    <option value="Radiology Wing">Radiology Wing</option>
                    <option value="Spirometry OP">Spirometry OP</option>
                    <option value="General OPD">General OPD</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="timeslot" className="text-[10px] font-mono text-slate-500 uppercase font-bold">Time Slot</label>
                  <select
                    id="timeslot"
                    value={scheduleTimeSlot}
                    onChange={(e) => setScheduleTimeSlot(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none font-medium font-mono"
                    disabled={isScheduling}
                  >
                    <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                    <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                    <option value="11:30 AM - 12:30 PM">11:30 AM - 12:30 PM</option>
                    <option value="02:30 PM - 03:30 PM">02:30 PM - 03:30 PM</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="sched-date" className="text-[10px] font-mono text-slate-500 uppercase font-bold">Proposed Exam Date</label>
                <input
                  id="sched-date"
                  type="date"
                  value={scheduleDateVal}
                  onChange={(e) => setScheduleDateVal(e.target.value)}
                  className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none font-mono ${
                    scheduleErrors.scheduleDateVal 
                      ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                      : 'border-slate-200 bg-white'
                  }`}
                  required
                  disabled={isScheduling}
                />
                {scheduleErrors.scheduleDateVal && (
                  <p className="text-rose-600 text-[10px] font-bold mt-1">{scheduleErrors.scheduleDateVal}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="remarks" className="text-[10px] font-mono text-slate-500 uppercase font-bold">Special Instructions / Remarks</label>
                <textarea
                  id="remarks"
                  rows="3"
                  value={scheduleRemarks}
                  onChange={(e) => setScheduleRemarks(e.target.value)}
                  placeholder="e.g. Ensure patient brings previous radiology films..."
                  className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-500 font-medium"
                  disabled={isScheduling}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                  disabled={isScheduling}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isScheduling}
                  className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 font-bold text-xs transition shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  {isScheduling ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Scheduling...</span>
                    </>
                  ) : (
                    <>
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>Schedule PME</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT PREVIEW MODAL */}
      {previewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-4xl bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 text-xs">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-blue-400" />
                <div>
                  <h3 className="font-display font-black text-xs uppercase tracking-wider">{previewReport.fileName}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Uploaded on {new Date(previewReport.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewReport(null)}
                className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 bg-slate-100 p-4 overflow-y-auto flex items-center justify-center">
              {previewReport.fileName.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={previewReport.fileUrl}
                  className="w-full h-[70vh] border rounded-lg bg-white"
                  title={previewReport.fileName}
                />
              ) : (
                <img
                  src={previewReport.fileUrl}
                  alt={previewReport.fileName}
                  className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-md"
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <a
                href={previewReport.fileUrl}
                download={previewReport.fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-650 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
              >
                Download File
              </a>
              <button
                onClick={() => setPreviewReport(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT BATCH SCHEDULES MODAL */}
      {editingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200 text-xs">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <Edit className="h-4.5 w-4.5 text-blue-600" />
                <h3 className="font-display font-black text-slate-900 text-sm uppercase tracking-wider">Update Batch Progress</h3>
              </div>
              <button 
                onClick={() => setEditingBatch(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="edit-batch-name" className="text-[10px] font-mono text-slate-500 uppercase font-bold">PME Batch Name</label>
                <input
                  id="edit-batch-name"
                  type="text"
                  value={editBatchName}
                  onChange={(e) => setEditBatchName(e.target.value)}
                  className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none font-medium ${
                    editBatchErrors.editBatchName 
                      ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                      : 'border-slate-200 bg-white focus:border-blue-500'
                  }`}
                  required
                />
                {editBatchErrors.editBatchName && (
                  <p className="text-rose-600 text-[10px] font-bold mt-1">{editBatchErrors.editBatchName}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="edit-dept" className="text-[10px] font-mono text-slate-500 uppercase font-bold">Category</label>
                  <select
                    id="edit-dept"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none font-medium"
                  >
                    <option value="Underground Mining">Underground Mining</option>
                    <option value="Opencast Mining">Opencast Mining</option>
                    <option value="Excavation">Excavation</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="edit-mine" className="text-[10px] font-mono text-slate-500 uppercase font-bold">Mine Location</label>
                  <select
                    id="edit-mine"
                    value={editMineName}
                    onChange={(e) => setEditMineName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none font-medium"
                  >
                    <option value="Gidi-A Colliery">Gidi-A Colliery</option>
                    <option value="Piparwar Opencast Mine">Piparwar Opencast Mine</option>
                    <option value="Amrapali OCP">Amrapali OCP</option>
                    <option value="Religara Colliery">Religara Colliery</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="edit-date" className="text-[10px] font-mono text-slate-500 uppercase font-bold">Calendar Date</label>
                  <input
                    id="edit-date"
                    type="date"
                    value={editScheduledDate}
                    onChange={(e) => setEditScheduledDate(e.target.value)}
                    className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none font-mono ${
                      editBatchErrors.editScheduledDate 
                        ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                        : 'border-slate-200 bg-white'
                    }`}
                    required
                  />
                  {editBatchErrors.editScheduledDate && (
                    <p className="text-rose-600 text-[10px] font-bold mt-1">{editBatchErrors.editScheduledDate}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="edit-status" className="text-[10px] font-mono text-slate-500 uppercase font-bold">Status</label>
                  <select
                    id="edit-status"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none font-medium"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In-Progress">In-Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4 border-slate-100">
                <div className="space-y-1.5">
                  <label htmlFor="edit-target-count" className="text-[10px] font-mono text-slate-500 uppercase font-bold">Total Target Miners</label>
                  <input
                    id="edit-target-count"
                    type="number"
                    value={editTargetCount}
                    onChange={(e) => setEditTargetCount(e.target.value)}
                    className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:bg-white ${
                      editBatchErrors.editTargetCount 
                        ? 'border-rose-500 ring-1 ring-rose-500' 
                        : 'border-slate-200'
                    }`}
                    min="1"
                    required
                  />
                  {editBatchErrors.editTargetCount && (
                    <p className="text-rose-600 text-[10px] font-bold mt-1">{editBatchErrors.editTargetCount}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="edit-completed-count" className="text-[10px] font-mono text-slate-500 uppercase font-bold">Checked Miners</label>
                  <div className={`flex items-center border rounded-lg overflow-hidden font-mono bg-white ${
                    editBatchErrors.editCompletedCount ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setEditCompletedCount(prev => String(Math.max(0, parseInt(prev) - 1)))}
                      className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border-r border-slate-200 text-slate-500 font-bold transition cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      id="edit-completed-count"
                      type="number"
                      value={editCompletedCount}
                      onChange={(e) => setEditCompletedCount(e.target.value)}
                      className="w-full text-center text-xs p-2 focus:outline-none border-none font-bold text-slate-700 bg-transparent"
                      min="0"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setEditCompletedCount(prev => String(Math.min(parseInt(editTargetCount) || 999, parseInt(prev) + 1)))}
                      className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border-l border-slate-200 text-slate-500 font-bold transition cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  {editBatchErrors.editCompletedCount && (
                    <p className="text-rose-600 text-[10px] font-bold mt-1">{editBatchErrors.editCompletedCount}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingBatch(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 bg-blue-600 text-white rounded-lg px-4 py-2 font-bold text-xs transition hover:bg-blue-700 shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION CONTAINER */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 rounded-lg px-4 py-3 text-xs font-bold text-white shadow-lg pointer-events-auto border transition-all duration-300 animate-in slide-in-from-bottom-5 ${
              toast.type === 'success'
                ? 'bg-slate-900 border-emerald-500/20 text-emerald-400'
                : 'bg-slate-900 border-rose-500/20 text-rose-400'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0 animate-bounce" />
            ) : (
              <AlertOctagon className="h-4.5 w-4.5 text-rose-500 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="ml-2 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PmeTracker;
