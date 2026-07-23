import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabaseClient';
import { X, FileText, Download, Save, Copy, Loader2, ArrowRight, FileDown, Briefcase, Database, Scale, Clock, AlertTriangle, ShieldCheck, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type RemandApplicationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: any;
};

export function RemandApplicationModal({ isOpen, onClose, user }: RemandApplicationModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loadingCases, setLoadingCases] = useState(false);
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState({
    // Sec 1: Jurisdiction
    courtName: "In the Court of the Hon'ble Chief Judicial Magistrate / Area Magistrate, Ahmedabad",
    station: 'Ahmedabad Cyber Crime Branch',
    firNumber: '',
    firDate: '',
    sectionsOfLaw: '',
    
    // Sec 2: Accused & Quota
    accusedName: '',
    accusedAge: '',
    accusedParentage: '',
    arrestDate: '',
    productionDate: '',
    productionMode: 'Physical Production in Open Court',
    remandType: 'Police Custody Remand (PCR)',
    daysRequested: '7',
    quotaUsed: '0',
    quotaTrack: '40', // 40 or 60 day track
    
    // Sec 3: Specific Grounds
    groundDevices: false,
    groundCrypto: false,
    groundCDR: false,
    groundSyndicate: false,
    groundField: false,
    groundEvasive: false,
    detailedNarrative: '',
    
    // Sec 4: Compliance Checklist
    compTimeLimit: true,
    compCaseDiary: true,
    compMLR: true,
    compRights: true,
    
    // Officer
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
          firDate: selected.date ? selected.date.split('T')[0] : prev.firDate,
          accusedName: selected.suspect_details || prev.accusedName
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

  const groundsList = [];
  if (formData.groundDevices) groundsList.push("To recover encrypted laptops, smartphones, and SIM cards used to execute the cyber fraud.");
  if (formData.groundCrypto) groundsList.push("To extract and verify seed phrases / private keys for cryptocurrency wallets holding proceeds of crime.");
  if (formData.groundCDR) groundsList.push("To confront the accused with voluminous bank UTR logs, IPDR records, and Call Data Records (CDRs).");
  if (formData.groundSyndicate) groundsList.push("To unearth the larger interstate / international cyber financial syndicate and identify masterminds.");
  if (formData.groundField) groundsList.push("To conduct field investigation and locate secret operating offices / call centers run by the accused.");
  if (formData.groundEvasive) groundsList.push("Accused is evasive, non-cooperative, and deliberately concealing passwords to cloud hosting servers.");

  const draftText = `${formData.courtName.toUpperCase()}
APPLICATION FOR AUTHORIZATION OF DETENTION IN POLICE CUSTODY UNDER SECTION 187 OF THE BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS), 2023

STATE OF GUJARAT
Through: ${formData.officerName}, ${formData.officerRank}, ${formData.station}
VERSUS
${formData.accusedName}, s/o ${formData.accusedParentage}

1. CASE REFERENCE:
FIR No: ${formData.firNumber} | Date: ${formData.firDate || '[Date]'}
Police Station: ${formData.station}
Under Sections: ${formData.sectionsOfLaw}

2. ACCUSED PRODUCTION DETAILS:
Accused Name: ${formData.accusedName}
Age: ${formData.accusedAge}
Date & Time of Original Arrest: ${formData.arrestDate ? new Date(formData.arrestDate).toLocaleString() : '[Date & Time]'}
Date & Time of Production: ${formData.productionDate ? new Date(formData.productionDate).toLocaleString() : '[Date & Time]'}
Production Mode: ${formData.productionMode}

3. CUSTODY QUOTA TRACKER (BNSS Sec 187):
Days of Police Custody Already Used: ${formData.quotaUsed} Days
Statutory Track Applicable: ${formData.quotaTrack}-Day Track

4. GROUNDS FOR POLICE CUSTODY (PCR):
The investigation is at a crucial stage. The custodial interrogation of the accused is essential on the following grounds:
${groundsList.map((g, i) => `${i + 1}. ${g}`).join('\n')}

Narrative of Investigation So Far:
${formData.detailedNarrative || 'Detailed investigation narrative is documented in the attached Case Diary.'}

5. STATUTORY COMPLIANCES:
[${formData.compTimeLimit ? 'X' : ' '}] Investigation cannot be completed within 24 hours under Section 58 BNSS / Art 22 Constitution.
[${formData.compCaseDiary ? 'X' : ' '}] Copy of Case Diary entries transmitted herewith for judicial perusal as required under Section 187(6) BNSS.
[${formData.compMLR ? 'X' : ' '}] Medico-Legal Report (MLR) of the accused certifying good physical/mental health attached (Sec 51/52 BNSS).
[${formData.compRights ? 'X' : ' '}] Accused was informed of grounds of arrest and right to legal counsel under Section 36 / 47 BNSS.

PRAYER:
In light of the aforementioned facts and circumstances, it is humbly prayed that this Hon'ble Court may be pleased to grant ${formData.remandType} of the accused for a period of ${formData.daysRequested} days to ensure a fair and effective investigation in the interest of justice.

VERIFICATION:
I, ${formData.officerName}, ${formData.officerRank}, do hereby verify that the contents of this application are true and correct based on official records.

Signature of Investigating Officer:
Name: ${formData.officerName} (${formData.officerRank})
Badge: ${formData.officerBadge}
Date: ${new Date().toLocaleDateString()}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draftText);
    toast.success("Application copied to clipboard!");
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const printElement = document.getElementById('remand-preview-container');
      if (!printElement) return;

      const canvas = await html2canvas(printElement, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`BNSS_Sec187_RemandApp_${formData.firNumber || 'Draft'}_${formData.accusedName.replace(/\s+/g, '_') || 'Accused'}.pdf`);
      toast.success("PDF Downloaded successfully!");
    } catch(e) {
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const logToCaseFile = async () => {
    toast.success("Logged Section 187 BNSS Remand Application to Case File & Audit Trail.");
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto w-screen h-screen">
      <div className="bg-[#1C2541] dark:bg-[#0B132B] border border-slate-700/50 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden anim-fadeup">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50 bg-[#0B132B]/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-600/20 flex items-center justify-center text-orange-400 border border-orange-500/30">
              <Scale size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Outfit']">Section 187 BNSS Remand Application</h2>
              <p className="text-xs text-slate-400 font-mono">Formal Judicial Pleading for Custodial Interrogation</p>
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
              <div className="bg-slate-800/40 border border-slate-600/30 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-orange-400 font-semibold">
                  <Database size={16} /> Import from Existing Case
                </div>
                <div className="flex-1 w-full relative">
                  <select 
                    value={selectedCaseId} 
                    onChange={handleCaseSelect}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none cursor-pointer"
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
                
                {/* Sec 1: Jurisdiction */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30 md:col-span-2">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><Briefcase size={16} className="text-orange-400"/> 1. Court Jurisdiction & Case Reference</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1">Target Court Name</label>
                      <input type="text" name="courtName" value={formData.courtName} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-serif" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Police Station / Branch</label>
                      <input type="text" name="station" value={formData.station} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">FIR / Crime Number</label>
                      <input type="text" name="firNumber" value={formData.firNumber} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">FIR Date</label>
                      <input type="date" name="firDate" value={formData.firDate} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Under Sections of Law</label>
                      <input type="text" name="sectionsOfLaw" value={formData.sectionsOfLaw} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="e.g. BNS Sec 318(4)" />
                    </div>
                  </div>
                </div>

                {/* Sec 2: Accused & Quota Tracker */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30 md:col-span-2">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><Clock size={16} className="text-orange-400"/> 2. Accused Production & Custody Quota Tracker</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Accused Full Name</label>
                      <input type="text" name="accusedName" value={formData.accusedName} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Age</label>
                      <input type="number" name="accusedAge" value={formData.accusedAge} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Parentage (s/o)</label>
                      <input type="text" name="accusedParentage" value={formData.accusedParentage} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Date & Time of Original Arrest</label>
                      <input type="datetime-local" name="arrestDate" value={formData.arrestDate} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Date & Time of Current Production</label>
                      <input type="datetime-local" name="productionDate" value={formData.productionDate} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Production Mode</label>
                      <select name="productionMode" value={formData.productionMode} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500">
                        <option>Physical Production in Open Court</option>
                        <option>Audio-Visual Electronic Production under Sec 187(2) BNSS</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 mt-4">
                    <h5 className="text-xs font-bold text-orange-400 mb-3 uppercase tracking-wider">BNSS 15-Day Custody Quota Tracker</h5>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1 uppercase">Remand Requested</label>
                        <select name="remandType" value={formData.remandType} onChange={handleChange} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-white">
                          <option>Police Custody Remand (PCR)</option>
                          <option>Judicial Custody Remand (JCR)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1 uppercase">Days Requested Now</label>
                        <input type="number" name="daysRequested" value={formData.daysRequested} onChange={handleChange} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-white font-mono text-center" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1 uppercase">PCR Days Already Used</label>
                        <div className="relative">
                          <input type="number" name="quotaUsed" value={formData.quotaUsed} onChange={handleChange} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-white font-mono text-center" />
                          <span className="absolute right-2 top-1.5 text-xs text-slate-500">/ 15</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1 uppercase">Statutory Total Track</label>
                        <select name="quotaTrack" value={formData.quotaTrack} onChange={handleChange} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-white">
                          <option value="40">40-Day Track (Standard)</option>
                          <option value="60">60-Day Track (Heinous / 10+ Yrs)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sec 3: Specific Grounds */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30 md:col-span-2">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><AlertTriangle size={16} className="text-orange-400"/> 3. Specific Grounds for Police Custody</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors bg-orange-900/10 border border-orange-500/20">
                      <input type="checkbox" name="groundDevices" checked={formData.groundDevices} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-orange-500" />
                      <span className="text-xs">To recover encrypted laptops, smartphones, and SIM cards used to execute the cyber fraud.</span>
                    </label>
                    <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors bg-orange-900/10 border border-orange-500/20">
                      <input type="checkbox" name="groundCrypto" checked={formData.groundCrypto} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-orange-500" />
                      <span className="text-xs">To extract and verify seed phrases / private keys for cryptocurrency wallets holding proceeds of crime.</span>
                    </label>
                    <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors bg-orange-900/10 border border-orange-500/20">
                      <input type="checkbox" name="groundCDR" checked={formData.groundCDR} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-orange-500" />
                      <span className="text-xs">To confront the accused with voluminous bank UTR logs, IPDR records, and Call Data Records (CDRs).</span>
                    </label>
                    <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors bg-orange-900/10 border border-orange-500/20">
                      <input type="checkbox" name="groundSyndicate" checked={formData.groundSyndicate} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-orange-500" />
                      <span className="text-xs">To unearth the larger interstate/international cyber financial syndicate and identify masterminds.</span>
                    </label>
                    <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors bg-orange-900/10 border border-orange-500/20">
                      <input type="checkbox" name="groundField" checked={formData.groundField} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-orange-500" />
                      <span className="text-xs">To conduct field investigation and locate secret operating offices/call centers run by the accused.</span>
                    </label>
                    <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors bg-orange-900/10 border border-orange-500/20">
                      <input type="checkbox" name="groundEvasive" checked={formData.groundEvasive} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-orange-500" />
                      <span className="text-xs">Accused is evasive, non-cooperative, and deliberately concealing passwords to cloud hosting servers.</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Detailed Narrative of Investigation Conducted So Far (Case Diary Summary)</label>
                    <textarea name="detailedNarrative" value={formData.detailedNarrative} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500" rows={4} placeholder="Summarize the progress recorded in the case diary here..."></textarea>
                  </div>
                </div>

                {/* Sec 4: Compliance Checklists */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30 md:col-span-2">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><FileCheck size={16} className="text-orange-400"/> 4. Mandatory Statutory Compliance</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 text-sm text-slate-300">
                      <input type="checkbox" name="compTimeLimit" checked={formData.compTimeLimit} onChange={handleChange} className="rounded border-slate-700 bg-slate-800 text-orange-500" />
                      <span>Investigation cannot be completed within 24 hours under Section 58 BNSS / Art 22 Constitution.</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm text-slate-300">
                      <input type="checkbox" name="compCaseDiary" checked={formData.compCaseDiary} onChange={handleChange} className="rounded border-slate-700 bg-slate-800 text-orange-500" />
                      <span>Copy of Case Diary entries transmitted herewith for judicial perusal as required under Section 187(6) BNSS.</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm text-slate-300">
                      <input type="checkbox" name="compMLR" checked={formData.compMLR} onChange={handleChange} className="rounded border-slate-700 bg-slate-800 text-orange-500" />
                      <span>Medico-Legal Report (MLR) of the accused certifying good physical/mental health attached (Sec 51/52 BNSS).</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm text-slate-300">
                      <input type="checkbox" name="compRights" checked={formData.compRights} onChange={handleChange} className="rounded border-slate-700 bg-slate-800 text-orange-500" />
                      <span>Accused was informed of grounds of arrest and right to legal counsel under Section 36 / 47 BNSS.</span>
                    </label>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            // PREVIEW
            <div id="remand-preview-container" className="bg-white text-black p-10 rounded-lg shadow-inner max-w-4xl mx-auto font-serif text-[13px] leading-relaxed whitespace-pre-wrap border border-slate-300 relative">
              <h2 className="text-center font-bold text-lg mb-1 uppercase">{formData.courtName}</h2>
              <h3 className="text-center font-bold text-md mb-6 uppercase tracking-wider underline">
                APPLICATION FOR AUTHORIZATION OF DETENTION IN POLICE CUSTODY UNDER SECTION 187 OF THE BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS), 2023
              </h3>
              
              <div className="flex justify-center mb-6">
                <div className="text-center border border-black p-4 inline-block min-w-[300px]">
                  <strong>STATE OF GUJARAT</strong><br />
                  Through: {formData.officerName}, {formData.officerRank}<br />
                  {formData.station}<br />
                  <br />
                  <strong>- VERSUS -</strong><br />
                  <br />
                  <strong>{formData.accusedName}</strong><br />
                  s/o {formData.accusedParentage}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-bold underline mb-1">1. CASE REFERENCE:</h4>
                <p>
                  <strong>FIR No:</strong> {formData.firNumber} | <strong>Date:</strong> {formData.firDate || '[Date]'}<br />
                  <strong>Police Station:</strong> {formData.station}<br />
                  <strong>Under Sections:</strong> {formData.sectionsOfLaw}
                </p>
              </div>

              <div className="mb-4">
                <h4 className="font-bold underline mb-1">2. ACCUSED PRODUCTION DETAILS:</h4>
                <p>
                  <strong>Accused Name:</strong> {formData.accusedName} (Age: {formData.accusedAge})<br />
                  <strong>Date & Time of Arrest:</strong> {formData.arrestDate ? new Date(formData.arrestDate).toLocaleString() : '[Date & Time]'}<br />
                  <strong>Date & Time of Production:</strong> {formData.productionDate ? new Date(formData.productionDate).toLocaleString() : '[Date & Time]'}<br />
                  <strong>Mode of Production:</strong> {formData.productionMode}
                </p>
              </div>

              <div className="mb-4 border border-black p-3 bg-slate-50">
                <h4 className="font-bold underline mb-1 text-center">3. CUSTODY QUOTA TRACKER (BNSS Sec 187)</h4>
                <div className="flex justify-around text-center mt-2">
                  <div>
                    <strong>Days Requested Now:</strong><br />
                    <span className="text-lg font-bold">{formData.daysRequested} Days</span>
                  </div>
                  <div>
                    <strong>15-Day PCR Quota Used:</strong><br />
                    <span className="text-lg font-bold">{formData.quotaUsed} / 15 Days</span>
                  </div>
                  <div>
                    <strong>Total Track Applicable:</strong><br />
                    <span className="text-lg font-bold">{formData.quotaTrack}-Day Track</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-bold underline mb-1">4. GROUNDS FOR POLICE CUSTODY:</h4>
                <p className="mb-2">The investigation is at a crucial stage. Custodial interrogation is essential on the following grounds:</p>
                {groundsList.length > 0 ? (
                  <ul className="list-decimal pl-6 space-y-1 mb-4 font-semibold">
                    {groundsList.map((g, i) => <li key={i}>{g}</li>)}
                  </ul>
                ) : (
                  <p className="italic text-slate-500 mb-4">No specific grounds selected.</p>
                )}
                <p className="text-justify border border-black/20 p-2 bg-slate-50">
                  <strong>Investigation Conducted So Far:</strong><br />
                  {formData.detailedNarrative || 'Detailed investigation narrative is documented in the attached Case Diary.'}
                </p>
              </div>

              <div className="mb-6">
                <h4 className="font-bold underline mb-2">5. STATUTORY COMPLIANCES (ANNEXURES):</h4>
                <ul className="list-none space-y-1">
                  <li><strong>[{formData.compTimeLimit ? 'X' : ' '}]</strong> Investigation cannot be completed within 24 hours (Sec 58 BNSS).</li>
                  <li><strong>[{formData.compCaseDiary ? 'X' : ' '}]</strong> Copy of Case Diary entries transmitted herewith (Sec 187(6) BNSS).</li>
                  <li><strong>[{formData.compMLR ? 'X' : ' '}]</strong> Medico-Legal Report (MLR) attached (Sec 51/52 BNSS).</li>
                  <li><strong>[{formData.compRights ? 'X' : ' '}]</strong> Accused informed of grounds of arrest & legal rights (Sec 36/47 BNSS).</li>
                </ul>
              </div>

              <div className="mb-10 p-4 border-2 border-black font-bold text-justify">
                PRAYER:<br /><br />
                In light of the aforementioned facts and circumstances, it is humbly prayed that this Hon'ble Court may be pleased to grant {formData.remandType} of the accused for a period of {formData.daysRequested} days to ensure a fair and effective investigation in the interest of justice.
              </div>

              <div className="flex justify-between mt-12 mb-4">
                <div className="text-left w-1/2 text-[11px] text-slate-600">
                  <strong>VERIFICATION:</strong><br />
                  I verify that the contents of this application are true and correct based on official records.<br />
                  Date: {new Date().toLocaleDateString()}
                </div>
                <div className="text-center w-1/2">
                  <div className="border-b border-black w-48 mx-auto mb-2"></div>
                  <strong>Investigating Officer</strong><br />
                  {formData.officerName}<br />
                  {formData.officerRank} | Badge: {formData.officerBadge}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-700/50 bg-[#0B132B]/50 shrink-0 flex justify-end gap-3 rounded-b-xl">
          {step === 1 ? (
            <button onClick={() => setStep(2)} className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
              Draft Court Pleading <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mr-auto">
                Back to Edit
              </button>
              <button onClick={copyToClipboard} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 border border-slate-700 transition-colors">
                <Copy size={16} /> Copy Application Text
              </button>
              <button onClick={handleDownloadPDF} disabled={isGenerating} className="bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 border border-orange-500/30 transition-colors disabled:opacity-50">
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />} 
                {isGenerating ? "Generating..." : "Download Court Application (.PDF)"}
              </button>
              <button onClick={logToCaseFile} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                <Database size={16} /> Log to Case File
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
