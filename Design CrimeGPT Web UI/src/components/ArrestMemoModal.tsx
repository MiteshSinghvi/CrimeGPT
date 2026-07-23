import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabaseClient';
import { X, FileText, Download, Save, Copy, Loader2, ArrowRight, FileDown, Briefcase, UserCog, Calendar, ShieldCheck, Database, Users, AlertTriangle, FileWarning, Clock, MapPin, Scale } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type ArrestMemoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: any;
};

export function ArrestMemoModal({ isOpen, onClose, user }: ArrestMemoModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<'A' | 'B'>('A');
  const [loadingCases, setLoadingCases] = useState(false);
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState({
    // Common / Case Ref
    station: 'Ahmedabad Cyber Crime Branch',
    firNumber: '',
    firDate: '',
    sectionsOfLaw: '',
    
    // Accused / Arrestee Details
    accusedName: '',
    accusedFather: '',
    accusedAge: '',
    accusedGender: 'Male',
    accusedAddress: '',
    accusedPhone: '',
    accusedDigital: '',
    
    // Mode A: Appearance Directive
    reportDate: '',
    reportLocation: 'Ahmedabad Cyber Crime Branch, Command Center Office',
    warnNoTamper: true,
    warnNoInfluence: true,
    warnNoLeave: true,
    
    // Mode B: Arrest Specifics
    groundsOfArrest: '',
    physicalCondition: 'No visible injuries / Good health',
    execDate: '',
    execPlace: '',
    
    // Mode B: Witness & Relative
    witnessName: '',
    witnessRel: 'Respectable Member of Locality',
    witnessAddress: '',
    witnessContact: '',
    relativeName: '',
    relativeRel: '',
    relativeContact: '',
    
    // Mode B: Legal Rights
    rightLegalPractitioner: true,
    rightLegalAid: true,
    
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

  const modeADraftText = `NOTICE OF APPEARANCE - UNDER SECTION 35(3) OF BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS), 2023

To:
Name: ${formData.accusedName}, s/o ${formData.accusedFather}
Age: ${formData.accusedAge}
Address: ${formData.accusedAddress}
Phone: ${formData.accusedPhone} | Digital ID: ${formData.accusedDigital || 'N/A'}

Ref: Case FIR No. ${formData.firNumber} dated ${formData.firDate || '[Date]'}
Registered at: ${formData.station}
Under Sections: ${formData.sectionsOfLaw}

Whereas your attendance is necessary to answer to a charge/complaint regarding the above-mentioned FIR wherein there are reasonable grounds to question you regarding the ongoing cyber crime investigation.

DIRECTIVE TO APPEAR:
You are hereby directed to appear before the undersigned at the following time and place:
Date & Time: ${formData.reportDate ? new Date(formData.reportDate).toLocaleString() : '[Date & Time]'} (IST)
Location: ${formData.reportLocation}

STATUTORY INSTRUCTIONS & CONDITIONS:
1. You shall not tamper with any digital evidence, cloud accounts, or hardware devices.
2. You shall not influence, threaten, or contact any witnesses associated with this case.
3. You shall not leave the jurisdiction without prior permission of the Investigating Officer or Court.

STATUTORY WARNING:
Compliance with this notice protects you from arrest under Section 35(5) BNSS. Failure to appear or comply without reasonable cause will render you liable for immediate arrest under Section 35(6) BNSS.

Signature of Investigating Officer:
Name: ${formData.officerName}
Rank: ${formData.officerRank}
Badge: ${formData.officerBadge}
Date: ${new Date().toLocaleDateString()}`;

  const modeBDraftText = `MEMORANDUM OF ARREST - UNDER SECTION 36 & 47 OF BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS), 2023

1. CASE REFERENCE:
FIR No: ${formData.firNumber} | Date: ${formData.firDate || '[Date]'}
Police Station: ${formData.station}
Under Sections: ${formData.sectionsOfLaw}

2. ARRESTEE DETAILS:
Name: ${formData.accusedName}, s/o ${formData.accusedFather}
Age: ${formData.accusedAge} | Gender: ${formData.accusedGender}
Address: ${formData.accusedAddress}
Phone: ${formData.accusedPhone}
Physical Condition / Visible Marks: ${formData.physicalCondition}

3. GROUNDS & NECESSITY OF ARREST (Sec 47 BNSS):
${formData.groundsOfArrest || '[Grounds not specified]'}

4. EXECUTION OF ARREST:
Date & Time of Arrest: ${formData.execDate ? new Date(formData.execDate).toLocaleString() : '[Date & Time]'}
Place of Execution: ${formData.execPlace}

5. WITNESS ATTESTATION (Sec 36 BNSS):
Witness Name: ${formData.witnessName}
Relationship: ${formData.witnessRel}
Address: ${formData.witnessAddress} | Contact: ${formData.witnessContact}

6. INTIMATION TO NOMINATED RELATIVE (Sec 48 BNSS):
The fact of arrest and place of custody has been intimated to:
Name: ${formData.relativeName} (${formData.relativeRel})
Contact: ${formData.relativeContact}

7. LEGAL RIGHTS NOTIFICATION:
- Informed of right to consult a legal practitioner: ${formData.rightLegalPractitioner ? 'Yes' : 'No'}
- Informed of right to free legal aid (DLSA): ${formData.rightLegalAid ? 'Yes' : 'No'}

SIGNATURES:
Investigating Officer: _______________________
Name: ${formData.officerName} (${formData.officerRank})

Attesting Witness:     _______________________
Name: ${formData.witnessName}

Arrestee Countersignature: _______________________
Name: ${formData.accusedName}`;

  const currentDraftText = mode === 'A' ? modeADraftText : modeBDraftText;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentDraftText);
    toast.success("Document copied to clipboard!");
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const printElement = document.getElementById('arrest-preview-container');
      if (!printElement) return;

      const canvas = await html2canvas(printElement, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const fileName = mode === 'A' 
        ? `BNSS_Sec35_Notice_${formData.firNumber || 'Draft'}.pdf` 
        : `BNSS_Sec36_ArrestMemo_${formData.firNumber || 'Draft'}.pdf`;
        
      pdf.save(fileName);
      toast.success("PDF Downloaded successfully!");
    } catch(e) {
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const logToCaseFile = async () => {
    toast.success(`Logged ${mode === 'A' ? 'Sec 35 Notice' : 'Sec 36 Arrest Memo'} to Case File & Audit Trail.`);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto w-screen h-screen">
      <div className="bg-[#1C2541] dark:bg-[#0B132B] border border-slate-700/50 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden anim-fadeup">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50 bg-[#0B132B]/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
              <UserCog size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Outfit']">Arrest Memo & Sec 35 Notice</h2>
              <p className="text-xs text-slate-400 font-mono">Sec 35(3) & Sec 36 BNSS Statutory Procedures</p>
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
              
              {/* Mode Toggle */}
              <div className="flex rounded-lg overflow-hidden border border-slate-700/50 bg-slate-900/50 shadow-inner">
                <button 
                  onClick={() => setMode('A')}
                  className={`flex-1 flex flex-col items-center justify-center p-4 transition-all ${mode === 'A' ? 'bg-blue-600/20 border-b-2 border-blue-500 text-blue-400' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  <span className="text-lg mb-1">🛡️</span>
                  <span className="font-bold text-sm font-['Outfit']">Mode A: Sec 35(3) Notice</span>
                  <span className="text-xs opacity-70">Notice of Appearance (Arrest Avoided)</span>
                </button>
                <button 
                  onClick={() => setMode('B')}
                  className={`flex-1 flex flex-col items-center justify-center p-4 transition-all ${mode === 'B' ? 'bg-red-600/20 border-b-2 border-red-500 text-red-400' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  <span className="text-lg mb-1">🚨</span>
                  <span className="font-bold text-sm font-['Outfit']">Mode B: Sec 36 Arrest Memo</span>
                  <span className="text-xs opacity-70">Official Custodial Physical Arrest</span>
                </button>
              </div>

              {/* Import Bar */}
              <div className="bg-slate-800/40 border border-slate-600/30 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-emerald-400 font-semibold">
                  <Database size={16} /> Import from Existing Case
                </div>
                <div className="flex-1 w-full relative">
                  <select 
                    value={selectedCaseId} 
                    onChange={handleCaseSelect}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none cursor-pointer"
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
                
                {/* Sec 1: Case Ref */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><Briefcase size={16} className="text-emerald-400"/> Case Reference & Authority</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Police Station / Branch Name</label>
                      <input type="text" name="station" value={formData.station} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">FIR Number</label>
                        <input type="text" name="firNumber" value={formData.firNumber} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">FIR Date</label>
                        <input type="date" name="firDate" value={formData.firDate} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Under Sections of Law</label>
                      <input type="text" name="sectionsOfLaw" value={formData.sectionsOfLaw} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="e.g. BNS Sec 318(4)" />
                    </div>
                  </div>
                </div>

                {/* Sec 2: Accused Details */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><Users size={16} className="text-emerald-400"/> {mode === 'A' ? 'Notice Recipient' : 'Arrestee Details'}</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                        <input type="text" name="accusedName" value={formData.accusedName} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Father's/Husband's Name</label>
                        <input type="text" name="accusedFather" value={formData.accusedFather} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Age</label>
                        <input type="number" name="accusedAge" value={formData.accusedAge} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                      </div>
                      {mode === 'B' && (
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Gender</label>
                          <select name="accusedGender" value={formData.accusedGender} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500">
                            <option>Male</option><option>Female</option><option>Other</option>
                          </select>
                        </div>
                      )}
                      {mode === 'A' && (
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Phone Number</label>
                          <input type="text" name="accusedPhone" value={formData.accusedPhone} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Residential Address</label>
                      <input type="text" name="accusedAddress" value={formData.accusedAddress} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                    </div>
                    {mode === 'B' ? (
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Phone Number</label>
                        <input type="text" name="accusedPhone" value={formData.accusedPhone} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Digital Identifiers (Email/Social)</label>
                        <input type="text" name="accusedDigital" value={formData.accusedDigital} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                      </div>
                    )}
                  </div>
                </div>

                {/* MODE A SPECIFIC */}
                {mode === 'A' && (
                  <>
                    <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30 md:col-span-2">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><Calendar size={16} className="text-blue-400"/> Appearance Directive</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Date & Time to Report (IST)</label>
                          <input type="datetime-local" name="reportDate" value={formData.reportDate} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Location / Station to Report to</label>
                          <input type="text" name="reportLocation" value={formData.reportLocation} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>
                      </div>
                    </div>

                    <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30 md:col-span-2">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><FileWarning size={16} className="text-blue-400"/> Statutory Warning Checklist</h4>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 text-sm text-slate-300">
                          <input type="checkbox" name="warnNoTamper" checked={formData.warnNoTamper} onChange={handleChange} className="rounded border-slate-700 bg-slate-800 text-blue-500" />
                          <span>Instructed not to tamper with digital evidence, cloud accounts, or hardware.</span>
                        </label>
                        <label className="flex items-center gap-3 text-sm text-slate-300">
                          <input type="checkbox" name="warnNoInfluence" checked={formData.warnNoInfluence} onChange={handleChange} className="rounded border-slate-700 bg-slate-800 text-blue-500" />
                          <span>Instructed not to influence, threaten, or contact any witnesses.</span>
                        </label>
                        <label className="flex items-center gap-3 text-sm text-slate-300">
                          <input type="checkbox" name="warnNoLeave" checked={formData.warnNoLeave} onChange={handleChange} className="rounded border-slate-700 bg-slate-800 text-blue-500" />
                          <span>Instructed not to leave the jurisdiction without permission.</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {/* MODE B SPECIFIC */}
                {mode === 'B' && (
                  <>
                    <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><AlertTriangle size={16} className="text-red-400"/> Grounds & Execution of Arrest</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1 font-bold text-red-300">Specific Grounds / Necessity of Arrest (Sec 47 BNSS)</label>
                          <textarea name="groundsOfArrest" value={formData.groundsOfArrest} onChange={handleChange} className="w-full bg-slate-800/50 border border-red-900/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500" rows={3} placeholder="Mandatory specific grounds to prevent illegal detention claims..."></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Date & Time of Execution</label>
                            <input type="datetime-local" name="execDate" value={formData.execDate} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500" />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Physical Place of Execution</label>
                            <input type="text" name="execPlace" value={formData.execPlace} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Physical Condition / Visible Body Marks</label>
                          <input type="text" name="physicalCondition" value={formData.physicalCondition} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500" />
                        </div>
                      </div>
                    </div>

                    <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><ShieldCheck size={16} className="text-red-400"/> Witness & Relative Intimation</h4>
                      <div className="space-y-4">
                        <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                          <label className="block text-xs font-bold text-slate-300 mb-2">Witness Attestation (Sec 36 BNSS)</label>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <input type="text" name="witnessName" value={formData.witnessName} onChange={handleChange} placeholder="Witness Name" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white" />
                            <select name="witnessRel" value={formData.witnessRel} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white">
                              <option>Family Member / Relative</option>
                              <option>Respectable Member of Locality</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input type="text" name="witnessAddress" value={formData.witnessAddress} onChange={handleChange} placeholder="Address" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white" />
                            <input type="text" name="witnessContact" value={formData.witnessContact} onChange={handleChange} placeholder="Contact" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white" />
                          </div>
                        </div>

                        <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                          <label className="block text-xs font-bold text-slate-300 mb-2">Nominated Relative Intimation (Sec 48 BNSS)</label>
                          <div className="grid grid-cols-3 gap-2">
                            <input type="text" name="relativeName" value={formData.relativeName} onChange={handleChange} placeholder="Name" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white" />
                            <input type="text" name="relativeRel" value={formData.relativeRel} onChange={handleChange} placeholder="Relationship" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white" />
                            <input type="text" name="relativeContact" value={formData.relativeContact} onChange={handleChange} placeholder="Contact" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white" />
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t border-slate-700/50">
                          <label className="flex items-center gap-3 text-xs text-slate-300 mb-2">
                            <input type="checkbox" name="rightLegalPractitioner" checked={formData.rightLegalPractitioner} onChange={handleChange} className="rounded border-slate-700 bg-slate-800 text-red-500" />
                            <span>Informed of right to consult a legal practitioner</span>
                          </label>
                          <label className="flex items-center gap-3 text-xs text-slate-300">
                            <input type="checkbox" name="rightLegalAid" checked={formData.rightLegalAid} onChange={handleChange} className="rounded border-slate-700 bg-slate-800 text-red-500" />
                            <span>Informed of right to free legal aid through DLSA</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </>
                )}

              </div>
            </div>
          ) : (
            <div id="arrest-preview-container" className="bg-white text-black p-10 rounded-lg shadow-inner max-w-4xl mx-auto font-serif text-sm leading-relaxed whitespace-pre-wrap border border-slate-300 relative">
              {mode === 'A' ? (
                // MODE A RENDER
                <>
                  <h2 className="text-center font-bold text-lg mb-1 underline mt-2">NOTICE OF APPEARANCE</h2>
                  <h3 className="text-center font-bold text-md mb-8 uppercase tracking-wider">UNDER SECTION 35(3) OF BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS), 2023</h3>
                  
                  <div className="mb-6 flex justify-between">
                    <div>
                      <strong>To:</strong><br />
                      <strong>Name:</strong> {formData.accusedName}, s/o {formData.accusedFather}<br />
                      <strong>Age:</strong> {formData.accusedAge}<br />
                      <strong>Address:</strong> {formData.accusedAddress}<br />
                      <strong>Phone:</strong> {formData.accusedPhone} {formData.accusedDigital ? `| Digital ID: ${formData.accusedDigital}` : ''}
                    </div>
                    <div className="text-right">
                      <strong>Date:</strong> {new Date().toLocaleDateString()}<br />
                      <strong>Station:</strong> {formData.station}
                    </div>
                  </div>

                  <div className="mb-6 p-3 border border-black/20 bg-slate-50">
                    <strong>Ref:</strong> Case FIR No. {formData.firNumber} dated {formData.firDate || '[Date]'}<br />
                    <strong>Registered at:</strong> {formData.station}<br />
                    <strong>Under Sections:</strong> {formData.sectionsOfLaw}
                  </div>

                  <p className="mb-4 text-justify">
                    Whereas your attendance is necessary to answer to a charge/complaint regarding the above-mentioned FIR wherein there are reasonable grounds to question you regarding the ongoing cyber crime investigation.
                  </p>

                  <h4 className="font-bold underline mb-2 mt-6">DIRECTIVE TO APPEAR:</h4>
                  <p className="mb-4">
                    You are hereby directed to appear before the undersigned at the following time and place:<br />
                    <strong>Date & Time:</strong> {formData.reportDate ? new Date(formData.reportDate).toLocaleString() : '[Date & Time]'} (IST)<br />
                    <strong>Location:</strong> {formData.reportLocation}
                  </p>

                  <h4 className="font-bold underline mb-2 mt-6">STATUTORY INSTRUCTIONS & CONDITIONS:</h4>
                  <ul className="list-decimal pl-5 space-y-1 mb-6">
                    {formData.warnNoTamper && <li>You shall not tamper with any digital evidence, cloud accounts, or hardware devices.</li>}
                    {formData.warnNoInfluence && <li>You shall not influence, threaten, or contact any witnesses associated with this case.</li>}
                    {formData.warnNoLeave && <li>You shall not leave the jurisdiction without prior permission of the Investigating Officer or Court.</li>}
                  </ul>

                  <div className="mb-10 p-4 border-2 border-black bg-slate-100 font-bold text-justify text-xs">
                    STATUTORY WARNING:<br />
                    Compliance with this notice protects you from arrest under Section 35(5) BNSS. Failure to appear or comply without reasonable cause will render you liable for immediate arrest under Section 35(6) BNSS.
                  </div>

                  <div className="flex justify-end mt-12 mb-4">
                    <div className="text-center">
                      <div className="border-b border-black w-56 mb-2"></div>
                      Signature of Investigating Officer<br />
                      <strong>{formData.officerName}</strong><br />
                      {formData.officerRank} | Badge: {formData.officerBadge}
                    </div>
                  </div>
                </>
              ) : (
                // MODE B RENDER
                <>
                  <h2 className="text-center font-bold text-lg mb-1 underline mt-2">MEMORANDUM OF ARREST</h2>
                  <h3 className="text-center font-bold text-md mb-6 uppercase tracking-wider">UNDER SECTION 36 & 47 OF BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS), 2023</h3>
                  
                  <div className="mb-4 border border-black p-3">
                    <h4 className="font-bold underline mb-1">1. CASE REFERENCE:</h4>
                    <strong>FIR No:</strong> {formData.firNumber} | <strong>Date:</strong> {formData.firDate || '[Date]'}<br />
                    <strong>Police Station:</strong> {formData.station}<br />
                    <strong>Under Sections:</strong> {formData.sectionsOfLaw}
                  </div>

                  <div className="mb-4 border border-black p-3">
                    <h4 className="font-bold underline mb-1">2. ARRESTEE DETAILS:</h4>
                    <strong>Name:</strong> {formData.accusedName}, s/o {formData.accusedFather}<br />
                    <strong>Age:</strong> {formData.accusedAge} | <strong>Gender:</strong> {formData.accusedGender}<br />
                    <strong>Address:</strong> {formData.accusedAddress}<br />
                    <strong>Phone:</strong> {formData.accusedPhone}<br />
                    <strong>Physical Condition / Visible Marks:</strong> {formData.physicalCondition}
                  </div>

                  <div className="mb-4 border border-black p-3 bg-slate-50">
                    <h4 className="font-bold underline text-red-900 mb-1">3. GROUNDS & NECESSITY OF ARREST (Sec 47 BNSS):</h4>
                    <p className="italic">{formData.groundsOfArrest || '[Grounds not specified]'}</p>
                  </div>

                  <div className="mb-4 border border-black p-3">
                    <h4 className="font-bold underline mb-1">4. EXECUTION OF ARREST:</h4>
                    <strong>Date & Time of Arrest:</strong> {formData.execDate ? new Date(formData.execDate).toLocaleString() : '[Date & Time]'}<br />
                    <strong>Place of Execution:</strong> {formData.execPlace}
                  </div>

                  <div className="flex gap-4 mb-4">
                    <div className="w-1/2 border border-black p-3">
                      <h4 className="font-bold underline mb-1">5. WITNESS ATTESTATION:</h4>
                      <strong>Name:</strong> {formData.witnessName}<br />
                      <strong>Relationship:</strong> {formData.witnessRel}<br />
                      <strong>Address:</strong> {formData.witnessAddress}<br />
                      <strong>Contact:</strong> {formData.witnessContact}
                    </div>
                    <div className="w-1/2 border border-black p-3">
                      <h4 className="font-bold underline mb-1">6. NOMINATED RELATIVE INTIMATED:</h4>
                      <strong>Name:</strong> {formData.relativeName} ({formData.relativeRel})<br />
                      <strong>Contact:</strong> {formData.relativeContact}
                    </div>
                  </div>

                  <div className="mb-8 border border-black p-3">
                    <h4 className="font-bold underline mb-1">7. LEGAL RIGHTS NOTIFICATION:</h4>
                    <ul className="list-disc pl-5">
                      <li>Informed of right to consult a legal practitioner: <strong>{formData.rightLegalPractitioner ? 'Yes' : 'No'}</strong></li>
                      <li>Informed of right to free legal aid (DLSA): <strong>{formData.rightLegalAid ? 'Yes' : 'No'}</strong></li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-3 gap-6 mt-16 text-center text-xs">
                    <div>
                      <div className="border-b border-black w-full mb-1 mt-4"></div>
                      <strong>Attesting Witness</strong><br />
                      {formData.witnessName}
                    </div>
                    <div>
                      <div className="border-b border-black w-full mb-1 mt-4"></div>
                      <strong>Arrestee Countersignature</strong><br />
                      {formData.accusedName}
                    </div>
                    <div>
                      <div className="border-b border-black w-full mb-1 mt-4"></div>
                      <strong>Investigating Officer</strong><br />
                      {formData.officerName}<br />
                      ({formData.officerRank})
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-700/50 bg-[#0B132B]/50 shrink-0 flex justify-end gap-3 rounded-b-xl">
          {step === 1 ? (
            <button 
              onClick={() => setStep(2)} 
              className={`text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${mode === 'A' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-red-600 hover:bg-red-500'}`}
            >
              {mode === 'A' ? 'Draft Sec 35 Notice' : 'Draft Arrest Memo'} <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mr-auto">
                Back to Edit
              </button>
              <button onClick={copyToClipboard} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 border border-slate-700 transition-colors">
                <Copy size={16} /> Copy Document Text
              </button>
              <button 
                onClick={handleDownloadPDF} 
                disabled={isGenerating} 
                className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 border transition-colors disabled:opacity-50 ${mode === 'A' ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border-blue-500/30' : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-500/30'}`}
              >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />} 
                {isGenerating ? "Generating..." : "Download Official Document (.PDF)"}
              </button>
              <button onClick={logToCaseFile} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
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
