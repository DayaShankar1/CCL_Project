import React, { useState, useMemo, useEffect } from 'react';
import {
  FolderLock,
  Search,
  FileText,
  Image as ImageIcon,
  Download,
  Trash2,
  X,
  FileSpreadsheet,
  FolderOpen,
  Plus,
  ArrowRight,
  UserCircle,
  Clock,
  Printer
} from 'lucide-react';
import { usePortal } from '../context/PortalContext';
import { supabase } from '../supabaseClient';
import { validateName, sanitizeInput } from '../utils/securityValidation';

export const ReportsDocuments = () => {
  const { employees, folders } = usePortal();

  // Search & Navigation States
  const [activeFolder, setActiveFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePreviewDoc, setActivePreviewDoc] = useState(null);

  // Supabase Reports State
  const [dbReports, setDbReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Upload Report States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadEmployeeId, setUploadEmployeeId] = useState('');
  const [uploadCategory, setUploadCategory] = useState('PDF'); // 'PDF', 'X-Ray', 'ECG', 'PFT'
  const [uploadPhysician, setUploadPhysician] = useState('');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadSummary, setUploadSummary] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Fetch reports from Supabase Database
  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setDbReports(data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message || 'Failed to fetch reports.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];

    if (!allowedExtensions.includes(extension)) {
      setFileError('Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.');
      setSelectedFile(null);
      setUploadName('');
      return;
    }

    setSelectedFile(file);
    setUploadName(file.name);
    setFileError('');
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    if (!uploadEmployeeId) {
      setFormErrors(prev => ({ ...prev, uploadEmployeeId: 'Please select an employee.' }));
      return;
    }

    const employee = employees.find(emp => emp.id === uploadEmployeeId);
    if (!employee) {
      setFormErrors(prev => ({ ...prev, uploadEmployeeId: 'Selected employee not found.' }));
      return;
    }

    if (!selectedFile) {
      setFileError('Please select a report file.');
      return;
    }

    const sanitizedPhysician = sanitizeInput(uploadPhysician);
    const sanitizedSummary = sanitizeInput(uploadSummary);
    const sanitizedFileName = sanitizeInput(uploadName);

    setUploadPhysician(sanitizedPhysician);
    setUploadSummary(sanitizedSummary);
    setUploadName(sanitizedFileName);

    const physicianErr = validateName(sanitizedPhysician);
    let summaryErr = null;
    if (!sanitizedSummary) {
      summaryErr = "OCR summary / diagnostic notes are required.";
    } else if (sanitizedSummary.length < 5) {
      summaryErr = "Summary must be at least 5 characters.";
    }

    const errors = {};
    if (physicianErr) errors.uploadPhysician = physicianErr;
    if (summaryErr) errors.uploadSummary = summaryErr;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsUploading(true);
    try {
      // 1. Generate unique file name using timestamp
      const fileExt = selectedFile.name.split('.').pop().toLowerCase();
      const uniqueFileName = `${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

      // 2. Upload file to Supabase Storage bucket 'medical-reports'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('medical-reports')
        .upload(uniqueFileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 3. Get public URL from Supabase Storage
      const { data: publicUrlData } = supabase.storage
        .from('medical-reports')
        .getPublicUrl(uniqueFileName);

      const fileUrl = publicUrlData.publicUrl;

      // 4. Insert record into reports table
      const { error: insertError } = await supabase
        .from('reports')
        .insert([
          {
            employeeId: employee.employeeId,
            fileName: sanitizedFileName || selectedFile.name,
            fileType: uploadCategory,
            fileUrl: fileUrl,
            uploadedBy: sanitizedPhysician || 'Dr. B. N. Prasad'
          }
        ]);

      if (insertError) throw insertError;

      // Reset form states
      setUploadName('');
      setUploadEmployeeId('');
      setUploadCategory('PDF');
      setUploadPhysician('');
      setUploadDate(new Date().toISOString().split('T')[0]);
      setUploadSummary('');
      setSelectedFile(null);
      setFileError('');
      setFormErrors({});
      setShowUploadModal(false);

      // Refresh reports list
      fetchReports();
    } catch (err) {
      console.error('Error uploading report:', err);
      setFileError('Failed to upload report: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteReport = async (reportId, fileUrl) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    setIsLoading(true);
    try {
      // 1. Delete from database
      const { error: dbDeleteError } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (dbDeleteError) throw dbDeleteError;

      // 2. Try to extract filename and delete from storage
      try {
        const fileUri = new URL(fileUrl);
        const pathSegments = fileUri.pathname.split('/');
        const storageFileName = pathSegments[pathSegments.length - 1];
        if (storageFileName) {
          await supabase.storage
            .from('medical-reports')
            .remove([storageFileName]);
        }
      } catch (storageErr) {
        console.error('Failed to delete file from storage:', storageErr);
      }

      setActivePreviewDoc(null);
      fetchReports();
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('Failed to delete report: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic folder counts
  const dynamicFolders = useMemo(() => {
    const counts = {
      'all': dbReports.length,
      'fold-1': dbReports.filter(d => d.fileType === 'PDF').length,
      'fold-2': dbReports.filter(d => d.fileType === 'IME').length,
      'fold-3': dbReports.filter(d => d.fileType === 'X-Ray').length,
      'fold-4': dbReports.filter(d => d.fileType === 'PFT').length,
      'fold-5': dbReports.filter(d => d.fileType === 'ECG').length,
    };
    return folders.map(f => ({
      ...f,
      count: counts[f.id] || 0
    }));
  }, [dbReports, folders]);

  // Filter and search logic
  const filteredDocuments = useMemo(() => {
    return dbReports.filter((doc) => {
      const employee = employees.find(emp => emp.employeeId === doc.employeeId);
      const employeeName = employee ? employee.name : '';

      const matchesSearch = 
        doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.fileType.toLowerCase().includes(searchQuery.toLowerCase());

      if (activeFolder === 'all') return matchesSearch;

      if (activeFolder === 'fold-1') return matchesSearch && doc.fileType === 'PDF';
      if (activeFolder === 'fold-2') return matchesSearch && doc.fileType === 'IME';
      if (activeFolder === 'fold-3') return matchesSearch && doc.fileType === 'X-Ray';
      if (activeFolder === 'fold-4') return matchesSearch && doc.fileType === 'PFT';
      if (activeFolder === 'fold-5') return matchesSearch && doc.fileType === 'ECG';

      return matchesSearch;
    });
  }, [dbReports, activeFolder, searchQuery, employees]);

  const handlePrint = (doc) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Digitized Document Report - ${doc.name}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; color: #333; }
              h1 { border-bottom: 2px solid #000; padding-bottom: 10px; font-size: 20px; }
              .meta { margin-bottom: 30px; font-size: 13px; color: #666; }
              pre { background: #f4f4f4; padding: 20px; border-radius: 5px; font-family: monospace; font-size: 13px; white-space: pre-wrap; line-height: 1.6; }
            </style>
          </head>
          <body>
            <h1>${doc.name}</h1>
            <div class="meta">
              <strong>Patient Name:</strong> ${doc.employeeName} <br/>
              <strong>Date of Log:</strong> ${doc.uploadedDate} <br/>
              <strong>Medical Officer:</strong> ${doc.uploadedBy} <br/>
              <strong>Document Classification:</strong> ${doc.category}
            </div>
            <pre>${doc.fileContentSummary || 'No technical summaries available.'}</pre>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-3xl font-black tracking-tight text-slate-950">Hospital Reports & Documents</h2>
          <p className="text-sm text-slate-500 font-medium">Digitized health folders, raw spirometry waves, and Form O certificates compiled for medical surveillance.</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700 transition shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Report</span>
        </button>
      </div>

      {/* Grid: Folders list on left, Documents list on right */}
      <div className="grid gap-6 md:grid-cols-4 items-start">
        {/* Left Side: Folder Panel */}
        <div className="space-y-4 md:col-span-1">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1">Clinical Vaults</p>
          <div className="space-y-1.5">
            <button
              onClick={() => { setActiveFolder('all'); setActivePreviewDoc(null); }}
              className={`w-full text-left p-3 rounded-lg text-xs font-bold flex items-center justify-between border cursor-pointer transition-all ${
                activeFolder === 'all'
                  ? 'bg-blue-600/10 text-blue-700 border-blue-500/20 shadow-sm font-extrabold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderOpen className="h-4.5 w-4.5 shrink-0" />
                <span>All Documents</span>
              </div>
              <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{dbReports.length}</span>
            </button>

            {dynamicFolders.map((f) => (
              <button
                key={f.id}
                onClick={() => { setActiveFolder(f.id); setActivePreviewDoc(null); }}
                className={`w-full text-left p-3 rounded-lg text-xs font-bold flex items-center justify-between border cursor-pointer transition-all ${
                  activeFolder === f.id
                    ? 'bg-blue-600/10 text-blue-700 border-blue-500/20 shadow-sm font-extrabold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FolderLock className="h-4.5 w-4.5 text-slate-400 group-hover:text-blue-600" />
                  <span className="truncate">{f.name}</span>
                </div>
                <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{f.count}</span>
              </button>
            ))}
          </div>

          <div className="p-4 bg-blue-50/20 rounded-xl border border-blue-100/30 space-y-2">
            <span className="text-[10px] font-mono text-blue-800 font-extrabold uppercase tracking-widest block">Surveillance Audits</span>
            <p className="text-[11px] text-blue-900 leading-relaxed leading-[15px] font-medium">
              All dossiers are digitized with standard character recognition to enable search and rapid board reviews under mine inspector mandates.
            </p>
          </div>
        </div>

        {/* Right Side: Search and File Listings */}
        <div className="md:col-span-3 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <label htmlFor="search-input" className="sr-only">Search digitized health records</label>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <input
                id="search-input"
                type="text"
                placeholder="Search digitized health records, worker names, or types (e.g. Rajesh Kumar or X-Ray)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Files grid list */}
          <div className="grid gap-3 sm:grid-cols-2">
            {isLoading ? (
              <div className="col-span-2 p-12 text-center border border-dashed rounded-xl text-slate-500 bg-slate-50/50 text-xs animate-pulse">
                Loading medical reports and radiology logs from database...
              </div>
            ) : error ? (
              <div className="col-span-2 p-12 text-center border border-dashed rounded-xl text-rose-500 bg-rose-50/50 text-xs">
                Error loading reports: {error}
              </div>
            ) : filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => {
                const employee = employees.find(emp => emp.employeeId === doc.employeeId);
                const employeeName = employee ? employee.name : doc.employeeId;
                const isPdf = doc.fileName?.toLowerCase().endsWith('.pdf');

                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setActivePreviewDoc({
                        id: doc.id,
                        name: doc.fileName,
                        category: doc.fileType,
                        uploadedDate: doc.created_at ? new Date(doc.created_at).toISOString().split('T')[0] : 'N/A',
                        uploadedBy: doc.uploadedBy,
                        employeeId: doc.employeeId,
                        employeeName: employeeName,
                        fileUrl: doc.fileUrl,
                        fileContentSummary: `Report File Name: ${doc.fileName}\nClassification: ${doc.fileType}\nUploaded By: ${doc.uploadedBy}\nUploaded At: ${doc.created_at}\n\nDocument URL:\n${doc.fileUrl}`
                      });
                    }}
                    className={`cursor-pointer rounded-xl border p-4 shadow-sm relative group transition-all flex flex-col gap-2 hover:border-slate-300 hover:shadow-md ${
                      activePreviewDoc?.id === doc.id 
                        ? 'border-blue-500 bg-blue-50/10 font-bold' 
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 w-full">
                      <div className="h-10 w-10 rounded-lg bg-slate-50 border flex items-center justify-center shrink-0 text-slate-600 group-hover:text-blue-600">
                        {isPdf ? (
                          <FileText className="h-5.5 w-5.5 text-rose-500" />
                        ) : (
                          <ImageIcon className="h-5.5 w-5.5 text-sky-500" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate leading-snug">{doc.fileName}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-1 font-sans truncate">
                          {employeeName} ({doc.employeeId})
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[9px] font-mono bg-slate-50 px-1.5 py-0.5 border rounded text-slate-600 uppercase tracking-tighter">
                            {doc.fileType}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 items-end pt-1 shrink-0">
                        <span className="text-[9px] font-mono text-slate-400">
                          {doc.created_at ? new Date(doc.created_at).toISOString().split('T')[0] : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full mt-1 border-t pt-2 border-slate-100">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded bg-blue-50 px-2.5 py-1.5 text-[10px] font-bold text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Document
                      </a>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 p-12 text-center border border-dashed rounded-xl text-slate-500 bg-slate-50/50 text-xs">
                No healthcare documents or radiology files match the selected filter query.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide Drawer: Document Preview Side panel */}
      {activePreviewDoc && (
        <div className="fixed inset-y-0 right-0 max-w-xl w-full bg-white border-l border-slate-200 shadow-2xl z-40 flex flex-col h-full animate-slide-in-right">
          {/* Panel Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-slate-100">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-blue-400" />
              <div>
                <h3 className="font-display font-black text-sm tracking-tight truncate max-w-sm">{activePreviewDoc.name}</h3>
                <p className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">{activePreviewDoc.category} • {activePreviewDoc.uploadedDate}</p>
              </div>
            </div>
            <button
              onClick={() => setActivePreviewDoc(null)}
              className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Panel Parameters Detail view */}
          <div className="p-5 bg-slate-50/55 border-b border-slate-200 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5 p-2 bg-white rounded border">
                <UserCircle className="h-5 w-5 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] text-slate-400 uppercase font-mono font-bold leading-none">Patient Name</p>
                  <p className="font-semibold text-slate-700 truncate mt-1">{activePreviewDoc.employeeName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 bg-white rounded border">
                <Clock className="h-5 w-5 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] text-slate-400 uppercase font-mono font-bold leading-none">Logged By Physician</p>
                  <p className="font-semibold text-slate-700 truncate mt-1">{activePreviewDoc.uploadedBy}</p>
                </div>
              </div>
            </div>

            {/* Quick Action links */}
            <div className="flex gap-2.5 justify-end">
              <button
                onClick={() => handlePrint(activePreviewDoc)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white border rounded px-2.5 py-1.5 hover:bg-slate-50"
                title="Print digitization page"
              >
                <Printer className="h-4.5 w-4.5" />
                <span>Print Document</span>
              </button>

              <button
                onClick={() => {
                  handleDeleteReport(activePreviewDoc.id, activePreviewDoc.fileUrl);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50/60 border border-rose-100 rounded px-2.5 py-1.5 hover:bg-rose-100/70"
                title="Delete this record"
              >
                <Trash2 className="h-4.5 w-4.5" />
                <span>Delete File</span>
              </button>
            </div>
          </div>

          {/* Panel digitized text body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <p className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest leading-none">Digitized Text Preview (OCR Summary)</p>
            <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] leading-relaxed whitespace-pre-wrap border border-slate-800 shadow-inner">
              {activePreviewDoc.fileContentSummary || 'No digital technical summaries completed on this folder.'}
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD REPORT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4.5 w-4.5 text-blue-600" />
                <h3 className="font-display font-black text-slate-900 text-sm uppercase tracking-wider">Upload Healthcare Report</h3>
              </div>
              <button 
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setFileError('');
                }}
                disabled={isUploading}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="upload-category" className="text-[10px] font-mono text-slate-500 uppercase font-bold">Report Type / Category</label>
                  <select
                    id="upload-category"
                    value={uploadCategory}
                    onChange={(e) => {
                      setUploadCategory(e.target.value);
                      setSelectedFile(null);
                      setFileError('');
                    }}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none font-medium"
                    disabled={isUploading}
                  >
                    <option value="PDF">PDF (PME Report)</option>
                    <option value="X-Ray">X-Ray (Radiology)</option>
                    <option value="ECG">ECG Report</option>
                    <option value="PFT">PFT (Spirometry)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="upload-employee" className="text-[10px] font-mono text-slate-500 uppercase font-bold">Select Employee</label>
                  <select
                    id="upload-employee"
                    value={uploadEmployeeId}
                    onChange={(e) => setUploadEmployeeId(e.target.value)}
                    className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none ${
                      formErrors.uploadEmployeeId 
                        ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                        : 'border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    required
                    disabled={isUploading}
                  >
                    <option value="">Select Employee...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.employeeId})
                      </option>
                    ))}
                  </select>
                  {formErrors.uploadEmployeeId && (
                    <p className="text-rose-600 text-[10px] font-bold mt-1">{formErrors.uploadEmployeeId}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-500 uppercase font-bold">Select Report File</label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 hover:bg-slate-50/50 transition text-center cursor-pointer relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                    disabled={isUploading}
                  />
                  <div className="space-y-1">
                    <Plus className="h-6 w-6 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">
                      {selectedFile ? selectedFile.name : 'Click or Drag file to upload'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Supported formats: PDF, JPG, JPEG, PNG
                    </p>
                  </div>
                </div>
                {fileError && <p className="text-rose-500 text-[10px] font-bold mt-1">{fileError}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="upload-physician" className="text-[10px] font-mono text-slate-500 uppercase font-bold">Physician Name</label>
                  <input
                    id="upload-physician"
                    type="text"
                    placeholder="e.g. Dr. B. N. Prasad"
                    value={uploadPhysician}
                    onChange={(e) => setUploadPhysician(e.target.value)}
                    className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none ${
                      formErrors.uploadPhysician 
                        ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                        : 'border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    required
                    disabled={isUploading}
                  />
                  {formErrors.uploadPhysician && (
                    <p className="text-rose-600 text-[10px] font-bold mt-1">{formErrors.uploadPhysician}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="upload-date" className="text-[10px] font-mono text-slate-500 uppercase font-bold">Report Date</label>
                  <input
                    id="upload-date"
                    type="date"
                    value={uploadDate}
                    onChange={(e) => setUploadDate(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none"
                    required
                    disabled={isUploading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="upload-summary" className="text-[10px] font-mono text-slate-500 uppercase font-bold">OCR Summary / Diagnostic Notes</label>
                <textarea
                  id="upload-summary"
                  rows="3"
                  placeholder="Enter digitized summaries, findings, or notes..."
                  value={uploadSummary}
                  onChange={(e) => setUploadSummary(e.target.value)}
                  className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none font-mono ${
                    formErrors.uploadSummary 
                      ? 'border-rose-500 ring-1 ring-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                      : 'border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  required
                  disabled={isUploading}
                />
                {formErrors.uploadSummary && (
                  <p className="text-rose-600 text-[10px] font-bold mt-1">{formErrors.uploadSummary}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                    setFileError('');
                  }}
                  disabled={isUploading}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!!fileError || !selectedFile || isUploading}
                  className="inline-flex items-center justify-center gap-1.5 bg-blue-600 text-white rounded-lg px-4 py-2 font-bold text-xs transition hover:bg-blue-700 shadow-md shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <Clock className="h-3.5 w-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      <span>Upload Document</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsDocuments;
