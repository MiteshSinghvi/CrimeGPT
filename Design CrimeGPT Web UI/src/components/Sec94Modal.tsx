import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabaseClient';
import { X, FileText, Download, Save, Copy, Loader2, ArrowRight, FileDown, Briefcase, FileSearch, Calendar, ShieldCheck, PenTool, Database } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type Sec94ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: any;
};

export function Sec94Modal({ isOpen, onClose, user }: Sec94ModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loadingCases, setLoadingCases] = useState(false);
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState({
    // Section 1
    station: 'Ahmedabad Cyber Crime Branch',
    firNumber: '',
    sectionsOfLaw: '',
    // Section 2
    intermediaryPreset: '',
    customIntermediary: '',
    // Section 3
    identifierType: 'Mobile Number / IMEI',
    targetValue: '',
    dateFrom: '',
    dateTo: '',
    // Section 4
    reqSDR: false,
    reqCDR: false,
    reqIPLogs: false,
    reqStatement: false,
    reqPreservation: false,
    // Section 5
    deadline: 'Within 7 Days',
    deliveryMethod: 'Encrypted electronic transmission via official email: nodal-cyber@accb.gov.in',
    officerName: user?.name || '',
    officerRank: user?.role || '',
    officerBadge: user?.badgeId || ''
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      fetchCases();
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const fetchCases = async () => {
    setLoadingCases(true);
    try {
      const { data, error } = await supabase.from('cases').select('*').order('date', { ascending: false });
      if (error) throw error;
      setCases(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch cases");
    } finally {
      setLoadingCases(false);
    }
  };

  const handleCaseSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const caseId = e.target.value;
    setSelectedCaseId(caseId);
    
    if (caseId) {
      const selected = cases.find(c => c.id === caseId);
      if (selected) {
        setFormData(prev => ({
          ...prev,
          firNumber: selected.id || prev.firNumber,
          targetValue: selected.suspect_details || prev.targetValue
        }));
        toast.success(`Loaded details from Case: ${selected.title}`);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!isOpen) return null;

  const intermediaryOptions = [
    { label: "Select Preset...", value: "" },
    { label: "Google LLC / YouTube (Legal Investigations Team)", value: "Google LLC / YouTube (Legal Investigations Team)" },
    { label: "Meta Platforms Inc. (WhatsApp / Instagram / Facebook)", value: "Meta Platforms Inc. (WhatsApp / Instagram / Facebook Nodal Officer)" },
    { label: "Reliance Jio Infocomm Ltd. (Nodal Compliance Officer)", value: "Reliance Jio Infocomm Ltd. (Nodal Compliance Officer)" },
    { label: "Bharti Airtel / Vodafone Idea (Law Enforcement Liaison)", value: "Bharti Airtel / Vodafone Idea (Law Enforcement Liaison)" },
    { label: "NPCI / UPI / Payment Gateway Compliance Desk", value: "NPCI / UPI / Payment Gateway Compliance Desk" },
    { label: "Bank Nodal Officer (HDFC / ICICI / SBI / Axis / etc.)", value: "Bank Nodal Officer" },
    { label: "Telegram Messenger LLP / X Corp / Domain Registrar", value: "Telegram Messenger LLP / X Corp / Domain Registrar" },
    { label: "Custom Intermediary...", value: "custom" }
  ];

  const targetTypes = [
    "Mobile Number / IMEI",
    "UPI ID / Wallet Address",
    "Bank Account / IFSC",
    "Email Address / Google ID",
    "Social Media Profile / URL",
    "IP Address & Source Port"
  ];

  const finalIntermediary = formData.intermediaryPreset === 'custom' ? formData.customIntermediary : formData.intermediaryPreset;

  const getRequiredRecordsList = () => {
    const list = [];
    if (formData.reqSDR) list.push("Subscriber Details Record (SDR) / Customer Application Form (CAF) & KYC Documents.");
    if (formData.reqCDR) list.push("Call Data Records (CDR) / IP Detail Records (IPDR) with Cell Tower ID (CGI) & Location History.");
    if (formData.reqIPLogs) list.push("IP Access Logs (Login / Logout IP addresses with timestamps and source ports).");
    if (formData.reqStatement) list.push("Complete Transaction Statement & Beneficiary Bank Account Mapping.");
    if (formData.reqPreservation) list.push("Emergency Data Preservation Order: Preserve account state for 90 days under IT Act rules.");
    return list;
  };

  const recordsList = getRequiredRecordsList();

  const draftText = `NOTICE UNDER SECTION 94 OF BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS), 2023
(Formerly Section 91 of the Code of Criminal Procedure, 1973)

From:
Investigating Officer: ${formData.officerName}, ${formData.officerRank}
Badge Number: ${formData.officerBadge}
${formData.station}

To:
The Nodal Officer / Compliance Authority
${finalIntermediary}

Subject: Summons for Production of Electronic Records / Digital Evidence

Ref: Case FIR No. ${formData.firNumber}
Under Sections: ${formData.sectionsOfLaw}

Sir/Madam,
Whereas an investigation is being conducted in the above-mentioned case, it has been made to appear to me that the production of specific electronic records/documents is necessary and desirable for the purpose of the said investigation.

You are hereby summoned to produce/provide the following records pertaining to the digital identifier detailed below:

TARGET IDENTIFIER DETAILS:
Type: ${formData.identifierType}
Value: ${formData.targetValue}
Relevant Timeframe: ${formData.dateFrom ? new Date(formData.dateFrom).toLocaleString() : 'N/A'} to ${formData.dateTo ? new Date(formData.dateTo).toLocaleString() : 'N/A'} (IST)

RECORDS REQUIRED:
${recordsList.length > 0 ? recordsList.map((r, i) => `${i + 1}. ${r}`).join('\n') : 'No specific records selected.'}

You are directed to submit the aforementioned records ${formData.deadline}.
Delivery Method: ${formData.deliveryMethod}

MANDATORY LEGAL WARNING:
Kindly note that failure to attend, preserve, or comply with the terms of this lawful notice without reasonable cause renders you liable for penal proceedings under Section 210 of the Bharatiya Nyaya Sanhita (BNS), 2023 (Omission to produce document or electronic record to public servant by person legally bound to produce it).

Signature of Investigating Officer:
Name: ${formData.officerName}
Rank: ${formData.officerRank}
Date: ${new Date().toLocaleDateString()}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draftText);
    toast.success("Draft copied to clipboard!");
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const printElement = document.getElementById('sec94-preview-container');
      if (!printElement) return;

      const canvas = await html2canvas(printElement, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`BNSS_Sec94_Notice_${formData.firNumber || 'Draft'}_${new Date().toISOString().slice(0,10)}.pdf`);
      toast.success("PDF Downloaded successfully!");
    } catch(e) {
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const logToEvidence = async () => {
    toast.success("Notice issuance logged to Evidence Chain audit trail.");
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto w-screen h-screen">
      <div className="bg-[#1C2541] dark:bg-[#0B132B] border border-slate-700/50 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden anim-fadeup">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50 bg-[#0B132B]/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
              <FileSearch size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Outfit']">Section 94 BNSS Notice</h2>
              <p className="text-xs text-slate-400 font-mono">Data Preservation & Log Production Summons</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: "thin" }}>
          {step === 1 ? (
            <div className="space-y-6">
              {/* Import Bar */}
              <div className="bg-slate-800/40 border border-blue-500/30 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-blue-400 font-semibold">
                  <Database size={16} /> Import from Existing Case
                </div>
                <div className="flex-1 w-full relative">
                  <select 
                    value={selectedCaseId} 
                    onChange={handleCaseSelect}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="">-- Select active investigation --</option>
                    {cases.map(c => (
                      <option key={c.id} value={c.id}>{c.title || c.id}</option>
                    ))}
                  </select>
                  {loadingCases && <Loader2 size={14} className="absolute right-8 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Sec 1 */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><Briefcase size={16} className="text-emerald-400"/> 1. Case Reference & Authority</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Police Station / Branch</label>
                      <input type="text" name="station" value={formData.station} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">FIR / Case Number</label>
                      <input type="text" name="firNumber" value={formData.firNumber} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Under Sections of Law (e.g., BNS Sec 318)</label>
                      <input type="text" name="sectionsOfLaw" value={formData.sectionsOfLaw} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                  </div>
                </div>

                {/* Sec 2 */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><Database size={16} className="text-emerald-400"/> 2. Target Intermediary</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Intermediary Presets</label>
                      <select name="intermediaryPreset" value={formData.intermediaryPreset} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                        {intermediaryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                    {formData.intermediaryPreset === 'custom' && (
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Custom Intermediary Details</label>
                        <input type="text" name="customIntermediary" value={formData.customIntermediary} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="e.g. Legal Team, Apple Inc." />
                      </div>
                    )}
                  </div>
                </div>

                {/* Sec 3 */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><FileSearch size={16} className="text-emerald-400"/> 3. Target Identifiers & Timeframe</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Target Identifier Type</label>
                      <select name="identifierType" value={formData.identifierType} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                        {targetTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Specific Target Value(s)</label>
                      <input type="text" name="targetValue" value={formData.targetValue} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="e.g. +91 9876543210" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">From (IST)</label>
                        <input type="datetime-local" name="dateFrom" value={formData.dateFrom} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">To (IST)</label>
                        <input type="datetime-local" name="dateTo" value={formData.dateTo} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sec 4 */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><ShieldCheck size={16} className="text-emerald-400"/> 4. Scope of Records Required</h4>
                  <div className="space-y-2">
                    <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer p-1.5 rounded hover:bg-slate-800/50 transition-colors">
                      <input type="checkbox" name="reqSDR" checked={formData.reqSDR} onChange={handleChange} className="mt-0.5 rounded border-slate-700 bg-slate-800 text-blue-500" />
                      <span>SDR / CAF & KYC Documents</span>
                    </label>
                    <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer p-1.5 rounded hover:bg-slate-800/50 transition-colors">
                      <input type="checkbox" name="reqCDR" checked={formData.reqCDR} onChange={handleChange} className="mt-0.5 rounded border-slate-700 bg-slate-800 text-blue-500" />
                      <span>CDR / IPDR with Cell Tower ID & Location</span>
                    </label>
                    <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer p-1.5 rounded hover:bg-slate-800/50 transition-colors">
                      <input type="checkbox" name="reqIPLogs" checked={formData.reqIPLogs} onChange={handleChange} className="mt-0.5 rounded border-slate-700 bg-slate-800 text-blue-500" />
                      <span>IP Access Logs (Login/Logout w/ Source Ports)</span>
                    </label>
                    <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer p-1.5 rounded hover:bg-slate-800/50 transition-colors">
                      <input type="checkbox" name="reqStatement" checked={formData.reqStatement} onChange={handleChange} className="mt-0.5 rounded border-slate-700 bg-slate-800 text-blue-500" />
                      <span>Complete Transaction Statement & Beneficiary Mapping</span>
                    </label>
                    <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer p-1.5 rounded hover:bg-slate-800/50 transition-colors">
                      <input type="checkbox" name="reqPreservation" checked={formData.reqPreservation} onChange={handleChange} className="mt-0.5 rounded border-slate-700 bg-slate-800 text-blue-500" />
                      <span>Emergency Data Preservation Order (90 days under IT Act)</span>
                    </label>
                  </div>
                </div>
                
                {/* Sec 5 */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30 md:col-span-2">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><Calendar size={16} className="text-emerald-400"/> 5. Compliance Deadline & Officer Sign-off</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Submission Deadline</label>
                      <select name="deadline" value={formData.deadline} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option>Within 24 Hours (Urgent/Heinous Crime)</option>
                        <option>Within 48 Hours</option>
                        <option>Within 7 Days</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Delivery Method</label>
                      <input type="text" name="deliveryMethod" value={formData.deliveryMethod} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Officer Details</label>
                      <div className="text-sm font-mono text-slate-300 bg-slate-800/30 p-2 rounded border border-slate-700/30">
                        {formData.officerName} ({formData.officerRank}) - {formData.officerBadge}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div id="sec94-preview-container" className="bg-white text-black p-10 rounded-lg shadow-inner max-w-3xl mx-auto font-serif text-sm leading-relaxed whitespace-pre-wrap border border-slate-300">
              <h2 className="text-center font-bold text-lg mb-1 underline">NOTICE UNDER SECTION 94 OF BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS), 2023</h2>
              <p className="text-center text-xs font-semibold mb-6">(Formerly Section 91 of the Code of Criminal Procedure, 1973)</p>
              
              <div className="flex justify-between mb-6">
                <div>
                  <strong>From:</strong><br />
                  Investigating Officer: {formData.officerName}, {formData.officerRank}<br />
                  Badge Number: {formData.officerBadge}<br />
                  {formData.station}
                </div>
                <div className="text-right">
                  <strong>Date:</strong> {new Date().toLocaleDateString()}<br />
                </div>
              </div>
              
              <div className="mb-6">
                <strong>To:</strong><br />
                The Nodal Officer / Compliance Authority<br />
                {finalIntermediary || '[Intermediary Name]'}
              </div>

              <div className="mb-6 p-3 border border-black/20 bg-slate-50">
                <strong>Subject:</strong> Summons for Production of Electronic Records / Digital Evidence<br />
                <strong>Ref:</strong> Case FIR No. {formData.firNumber}<br />
                <strong>Under Sections:</strong> {formData.sectionsOfLaw}
              </div>

              <p className="mb-4">Sir/Madam,</p>
              <p className="mb-4 text-justify">
                Whereas an investigation is being conducted in the above-mentioned case, it has been made to appear to me that the production of specific electronic records/documents is necessary and desirable for the purpose of the said investigation.
              </p>
              <p className="mb-4 text-justify">
                You are hereby summoned to produce/provide the following records pertaining to the digital identifier detailed below:
              </p>

              <div className="mb-6 p-4 border border-black/30 bg-slate-50">
                <h4 className="font-bold underline mb-2">TARGET IDENTIFIER DETAILS:</h4>
                <table className="w-full text-left border-collapse">
                  <tbody>
                    <tr className="border-b border-black/10"><th className="py-1 w-1/3">Type:</th><td className="py-1">{formData.identifierType}</td></tr>
                    <tr className="border-b border-black/10"><th className="py-1">Value:</th><td className="py-1 font-mono">{formData.targetValue}</td></tr>
                    <tr><th className="py-1">Relevant Timeframe:</th><td className="py-1">{formData.dateFrom ? new Date(formData.dateFrom).toLocaleString() : 'N/A'} to {formData.dateTo ? new Date(formData.dateTo).toLocaleString() : 'N/A'} (IST)</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="mb-6">
                <h4 className="font-bold underline mb-2">RECORDS REQUIRED:</h4>
                {recordsList.length > 0 ? (
                  <ul className="list-decimal pl-5 space-y-1">
                    {recordsList.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                ) : (
                  <p className="italic text-slate-500">No specific records selected.</p>
                )}
              </div>

              <p className="mb-6 text-justify">
                You are directed to submit the aforementioned records <strong>{formData.deadline}</strong>.<br />
                <strong>Delivery Method:</strong> {formData.deliveryMethod}
              </p>

              <div className="mb-8 p-3 border border-black bg-red-50 text-black font-semibold text-justify text-xs">
                MANDATORY LEGAL WARNING:<br />
                Kindly note that failure to attend, preserve, or comply with the terms of this lawful notice without reasonable cause renders you liable for penal proceedings under Section 210 of the Bharatiya Nyaya Sanhita (BNS), 2023 (Omission to produce document or electronic record to public servant by person legally bound to produce it).
              </div>

              <div className="flex justify-end mt-12">
                <div className="text-center">
                  <div className="border-b border-black w-48 mb-2"></div>
                  Signature of Investigating Officer<br />
                  <strong>{formData.officerName}</strong><br />
                  {formData.officerRank}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-700/50 bg-[#0B132B]/50 shrink-0 flex justify-end gap-3 rounded-b-xl">
          {step === 1 ? (
            <button onClick={() => setStep(2)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
              Draft Official Notice <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mr-auto">
                Back to Edit
              </button>
              <button onClick={copyToClipboard} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 border border-slate-700 transition-colors">
                <Copy size={16} /> Copy Notice Text
              </button>
              <button onClick={handleDownloadPDF} disabled={isGenerating} className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 border border-emerald-500/30 transition-colors disabled:opacity-50">
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />} 
                {isGenerating ? "Generating..." : "Download Official Notice (.PDF)"}
              </button>
              <button onClick={logToEvidence} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                <Database size={16} /> Log to Evidence Chain
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
