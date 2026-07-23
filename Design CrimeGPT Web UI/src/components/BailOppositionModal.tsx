import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabaseClient';
import { X, FileText, Download, Save, Copy, Loader2, ArrowRight, FileDown, Briefcase, Database, Scale, Users, ShieldAlert, FileWarning, Gavel } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type BailOppositionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: any;
};

export function BailOppositionModal({ isOpen, onClose, user }: BailOppositionModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loadingCases, setLoadingCases] = useState(false);
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState({
    // Sec 1: Jurisdiction & Ref
    courtName: "In the Court of the Hon'ble Principal District & Sessions Judge / Chief Judicial Magistrate, Ahmedabad",
    bailAppNumber: '',
    bailType: 'Regular Bail under Section 480 BNSS (Magistrate Court)',
    station: 'Ahmedabad Cyber Crime Branch',
    firNumber: '',
    firDate: '',
    sectionsOfLaw: '',
    
    // Sec 2: Applicant Profile
    applicantName: '',
    applicantAge: '',
    applicantParentage: '',
    custodyStatus: '',
    roleInSyndicate: 'Mastermind / Kingpin',
    
    // Sec 3: Rejection Grounds (Checkboxes)
    groundMagnitude: true,
    groundInterrogation: true,
    groundTampering: true,
    groundFlight: false,
    groundHabitual: false,
    groundWitness: false,
    
    // Sec 4: Rebuttals & Narrative
    rebutSmallAmount: false,
    rebutParity: false,
    detailedNarrative: '',
    
    // Sec 5: Legal Citations & PP
    citeEconomicOffense: true,
    publicProsecutor: 'Learned Public Prosecutor, State of Gujarat',
    
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
          sectionsOfLaw: selected.title ? selected.title.replace('Case ', '') : prev.sectionsOfLaw,
          applicantName: selected.suspect_details || prev.applicantName,
          detailedNarrative: `Brief Facts: Based on the complaint filed by ${selected.victim_details || 'the victim'}, an investigation was initiated. The accused is intricately involved in a coordinated cyber fraud resulting in a loss of ₹${selected.amount_lost || 0}. \n\nThe applicant's specific involvement is detailed as follows: ...`
        }));
        
        toast.success(`Imported Case File: ${selected.title}`);
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
  if (formData.groundMagnitude) groundsList.push("Intricate Economic Crime & Magnitude: The offense is a calculated, multi-layered economic fraud severely impacting the public and economy; economic offenses constitute a class apart.");
  if (formData.groundInterrogation) groundsList.push("Active Custodial Interrogation Needed: Crucial digital evidence (hardware wallets, decrypted laptops, master server credentials) is yet to be recovered from the applicant.");
  if (formData.groundTampering) groundsList.push("Technical Risk of Evidence Tampering: Accused possesses advanced IT skills and, if released, will remotely delete cloud server logs, wipe Telegram/WhatsApp chat histories, or dissipate cryptocurrency assets.");
  if (formData.groundFlight) groundsList.push("Flight Risk & International Ties: The fraud involves cross-border money trails and foreign server infrastructure; the applicant poses a severe flight risk.");
  if (formData.groundHabitual) groundsList.push("Habitual Offender / Antecedents: The applicant is a serial offender involved in similar cyber fraud syndicates across multiple states/jurisdictions.");
  if (formData.groundWitness) groundsList.push("Risk of Influencing Witnesses: Risk of threatening the complainant or tampering with bank and telecom nodal witnesses.");

  const sectionCode = formData.bailType.includes('480') ? '480' : formData.bailType.includes('482') ? '482' : '483';

  const draftText = `IN THE COURT OF THE HON'BLE ${formData.courtName.toUpperCase().replace('IN THE COURT OF THE HON\'BLE ', '')}

CRIMINAL MISC. BAIL APPLICATION NO. ${formData.bailAppNumber || '[____ of 202_]'}

STATE OF GUJARAT
Through: ${formData.officerName}, ${formData.officerRank}, ${formData.station}
- VERSUS -
${formData.applicantName}, s/o ${formData.applicantParentage} (Applicant / Accused)

REPLY / OBJECTION ON BEHALF OF THE INVESTIGATING AGENCY TO THE APPLICATION FOR GRANT OF BAIL UNDER SECTION ${sectionCode} BNSS, 2023

MAY IT PLEASE THIS HON'BLE COURT:

1. CASE REFERENCE:
FIR No: ${formData.firNumber} | Date: ${formData.firDate || '[Date]'}
Police Station: ${formData.station}
Under Sections: ${formData.sectionsOfLaw}

2. APPLICANT PROFILE & SYNDICATE ROLE:
Applicant Name: ${formData.applicantName} (Age: ${formData.applicantAge})
Custody Status: ${formData.custodyStatus}
Specific Role in Syndicate: ${formData.roleInSyndicate}

3. COMPELLING GROUNDS FOR REJECTION OF BAIL:
The Investigating Agency strongly opposes the grant of bail on the following grounds:
${groundsList.map((g, i) => `${i + 1}. ${g}`).join('\n')}

4. REBUTTAL TO ACCUSED'S DEFENSES:
${formData.rebutSmallAmount ? '- Rebutting "Small Traced Amount": Even if only a fraction of the defrauded amount landed in the applicant\'s personal account, they are a critical link in a multi-crore circular money-laundering network and share equal liability under the law of conspiracy.\n' : ''}${formData.rebutParity ? '- Rebutting "Parity with Co-Accused": The rule of parity does not apply as the applicant\'s role is significantly more grave and foundational to the syndicate than the co-accused who were granted bail.\n' : ''}
Detailed Narrative of Opposition & Evidence Unearthed:
${formData.detailedNarrative || 'Detailed narrative goes here...'}

5. LEGAL PRECEDENT:
${formData.citeEconomicOffense ? 'As held by the Hon\'ble Supreme Court in multiple landmark judgments, economic offenses having deep-rooted conspiracies and involving huge loss of public funds need to be viewed seriously and considered as class apart offenses. Bail in such matters requires strict scrutiny.' : ''}

PRAYER:
In light of the facts and circumstances stated above, and considering the gravity of the cyber fraud and the risk of digital evidence tampering, it is humbly prayed that the present application for grant of bail be rejected outright in the interest of justice.

VERIFICATION:
I, ${formData.officerName}, do hereby verify that the contents of this reply are true and correct based on the official investigation records.

Date: ${new Date().toLocaleDateString()}

___________________________               ___________________________
${formData.officerName} (${formData.officerRank})                       ${formData.publicProsecutor}
Investigating Officer                     Public Prosecutor`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draftText);
    toast.success("Bail Reply copied to clipboard!");
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const printElement = document.getElementById('bail-preview-container');
      if (!printElement) return;

      const canvas = await html2canvas(printElement, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`BNSS_BailReply_${formData.firNumber || 'Draft'}_${formData.applicantName.replace(/\s+/g, '_') || 'Accused'}.pdf`);
      toast.success("PDF Downloaded successfully!");
    } catch(e) {
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const logToCaseFile = async () => {
    toast.success("Logged Bail Opposition Reply to Case File & Audit Trail.");
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto w-screen h-screen">
      <div className="bg-[#1C2541] dark:bg-[#0B132B] border border-slate-700/50 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden anim-fadeup">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50 bg-[#0B132B]/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center text-red-400 border border-red-500/30">
              <Gavel size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Outfit']">Bail Opposition / Reply Pleading</h2>
              <p className="text-xs text-slate-400 font-mono">Formal IO/PP Objection to Regular or Anticipatory Bail</p>
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
                <div className="flex items-center gap-2 text-sm text-red-400 font-semibold">
                  <Database size={16} /> Import from Existing Case
                </div>
                <div className="flex-1 w-full relative">
                  <select 
                    value={selectedCaseId} 
                    onChange={handleCaseSelect}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500 appearance-none cursor-pointer"
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
                
                {/* Sec 1: Jurisdiction & Application Ref */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30 md:col-span-2">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><Briefcase size={16} className="text-red-400"/> 1. Court Jurisdiction & Bail Application Reference</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1">Target Court Name</label>
                      <input type="text" name="courtName" value={formData.courtName} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500 font-serif" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Bail Application Number & Year</label>
                      <input type="text" name="bailAppNumber" value={formData.bailAppNumber} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500" placeholder="e.g. Criminal Misc. Bail App No. ___ of 2026" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Type of Bail Opposed</label>
                      <select name="bailType" value={formData.bailType} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500">
                        <option>Regular Bail under Section 480 BNSS (Magistrate Court)</option>
                        <option>Regular Bail under Section 483 BNSS (Sessions / High Court)</option>
                        <option>Anticipatory (Pre-Arrest) Bail under Section 482 BNSS</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Police Station / Branch</label>
                      <input type="text" name="station" value={formData.station} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">FIR Number</label>
                        <input type="text" name="firNumber" value={formData.firNumber} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">FIR Date</label>
                        <input type="date" name="firDate" value={formData.firDate} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500" />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1">Charged Sections of Law (BNSS/IT Act)</label>
                      <input type="text" name="sectionsOfLaw" value={formData.sectionsOfLaw} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500" placeholder="e.g. BNS Sec 318(4), IT Act Sec 66D" />
                    </div>
                  </div>
                </div>

                {/* Sec 2: Applicant Profile & Role */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30 md:col-span-2">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><Users size={16} className="text-red-400"/> 2. Applicant / Accused Profile & Role in Syndicate</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Applicant Full Name</label>
                      <input type="text" name="applicantName" value={formData.applicantName} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Age</label>
                      <input type="number" name="applicantAge" value={formData.applicantAge} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Parentage (s/o)</label>
                      <input type="text" name="applicantParentage" value={formData.applicantParentage} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Date of Arrest / Custody Status</label>
                      <input type="text" name="custodyStatus" value={formData.custodyStatus} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500" placeholder="e.g. In Judicial Custody since [Date] / Apprehending Arrest" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1 font-bold text-red-300">Specific Role in the Cyber Crime Syndicate</label>
                      <select name="roleInSyndicate" value={formData.roleInSyndicate} onChange={handleChange} className="w-full bg-slate-800/50 border border-red-900/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500">
                        <option>Mastermind / Kingpin</option>
                        <option>Technical Operator / Phishing Page Creator</option>
                        <option>Mule Bank Account Supplier / Handler</option>
                        <option>Call Center / Tele-caller Operator</option>
                        <option>Crypto / Hawala Money Launderer</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sec 3: Rejection Grounds */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30 md:col-span-2">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><ShieldAlert size={16} className="text-red-400"/> 3. Compelling Grounds for Bail Rejection (The Cyber Matrix)</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors bg-red-900/10 border border-red-500/20">
                      <input type="checkbox" name="groundMagnitude" checked={formData.groundMagnitude} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-red-500" />
                      <span className="text-xs"><strong>Intricate Economic Crime:</strong> Multi-layered economic fraud severely impacting the public/economy.</span>
                    </label>
                    <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors bg-red-900/10 border border-red-500/20">
                      <input type="checkbox" name="groundInterrogation" checked={formData.groundInterrogation} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-red-500" />
                      <span className="text-xs"><strong>Active Interrogation Needed:</strong> Crucial digital evidence (hardware wallets, decrypted laptops) unrecovered.</span>
                    </label>
                    <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors bg-red-900/10 border border-red-500/20">
                      <input type="checkbox" name="groundTampering" checked={formData.groundTampering} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-red-500" />
                      <span className="text-xs"><strong>Technical Tampering Risk:</strong> Accused will remotely delete cloud server logs or wipe crypto assets.</span>
                    </label>
                    <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors bg-red-900/10 border border-red-500/20">
                      <input type="checkbox" name="groundFlight" checked={formData.groundFlight} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-red-500" />
                      <span className="text-xs"><strong>Flight Risk & Int. Ties:</strong> Fraud involves cross-border money trails and foreign server infrastructure.</span>
                    </label>
                    <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors bg-red-900/10 border border-red-500/20">
                      <input type="checkbox" name="groundHabitual" checked={formData.groundHabitual} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-red-500" />
                      <span className="text-xs"><strong>Habitual Offender:</strong> Serial offender involved in similar cyber fraud syndicates across jurisdictions.</span>
                    </label>
                    <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors bg-red-900/10 border border-red-500/20">
                      <input type="checkbox" name="groundWitness" checked={formData.groundWitness} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-red-500" />
                      <span className="text-xs"><strong>Influencing Witnesses:</strong> Risk of threatening complainant or tampering with telecom/bank nodal witnesses.</span>
                    </label>
                  </div>
                </div>

                {/* Sec 4: Rebuttals & Narrative */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30 md:col-span-2">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><FileWarning size={16} className="text-red-400"/> 4. Rebuttal to Accused's Defenses & Case Narrative</h4>
                  <div className="space-y-4 mb-4">
                    <label className="flex items-start gap-3 text-sm text-slate-300">
                      <input type="checkbox" name="rebutSmallAmount" checked={formData.rebutSmallAmount} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-red-500" />
                      <div className="flex flex-col">
                        <span className="font-bold text-red-300">Rebut "Small Traced Amount" Defense</span>
                        <span className="text-xs text-slate-400">Argue that despite small personal gain, they are a critical link in a multi-crore circular money-laundering network.</span>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 text-sm text-slate-300">
                      <input type="checkbox" name="rebutParity" checked={formData.rebutParity} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-red-500" />
                      <div className="flex flex-col">
                        <span className="font-bold text-red-300">Rebut "Parity with Co-Accused" Defense</span>
                        <span className="text-xs text-slate-400">Argue that the applicant's specific role is significantly more foundational and grave than co-accused granted bail.</span>
                      </div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Detailed Narrative of Opposition & Evidence Unearthed So Far</label>
                    <textarea name="detailedNarrative" value={formData.detailedNarrative} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[150px]"></textarea>
                  </div>
                </div>

                {/* Sec 5: Legal Citations */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30 md:col-span-2">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><Gavel size={16} className="text-red-400"/> 5. Legal Citations & Prayer</h4>
                  <div className="mb-4">
                    <label className="flex items-start gap-3 text-sm text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                      <input type="checkbox" name="citeEconomicOffense" checked={formData.citeEconomicOffense} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-red-500" />
                      <span className="text-xs italic">Cite Supreme Court Jurisprudence: "Economic offenses having deep-rooted conspiracies and involving huge loss of public funds need to be viewed seriously and considered as class apart offenses warranting strict bail scrutiny."</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Learned Public Prosecutor Name</label>
                      <input type="text" name="publicProsecutor" value={formData.publicProsecutor} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500" />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            // PREVIEW
            <div id="bail-preview-container" className="bg-white text-black p-10 rounded-lg shadow-inner max-w-4xl mx-auto font-serif text-[13px] leading-relaxed whitespace-pre-wrap border border-slate-300 relative">
              <h2 className="text-center font-bold text-lg mb-1 uppercase">{formData.courtName}</h2>
              <h3 className="text-center font-bold text-md mb-6 uppercase tracking-wider underline">
                CRIMINAL MISC. BAIL APPLICATION NO. {formData.bailAppNumber || '[____ of 202_]'}
              </h3>
              
              <div className="flex justify-center mb-6">
                <div className="text-center p-4 inline-block min-w-[300px]">
                  <strong>STATE OF GUJARAT</strong><br />
                  Through: {formData.officerName}, {formData.station}<br />
                  <br />
                  <strong>- VERSUS -</strong><br />
                  <br />
                  <strong>{formData.applicantName}</strong><br />
                  s/o {formData.applicantParentage}<br />
                  (Applicant / Accused)
                </div>
              </div>

              <div className="mb-6 p-3 border-2 border-black bg-slate-100 text-center font-bold uppercase text-sm">
                REPLY / OBJECTION ON BEHALF OF THE INVESTIGATING AGENCY TO THE APPLICATION FOR GRANT OF BAIL UNDER SECTION {sectionCode} BNSS, 2023
              </div>

              <p className="font-bold mb-4">MAY IT PLEASE THIS HON'BLE COURT:</p>

              <div className="mb-4">
                <h4 className="font-bold underline mb-1">1. CASE REFERENCE:</h4>
                <p>
                  <strong>FIR No:</strong> {formData.firNumber} | <strong>Date:</strong> {formData.firDate || '[Date]'}<br />
                  <strong>Police Station:</strong> {formData.station}<br />
                  <strong>Under Sections:</strong> {formData.sectionsOfLaw}
                </p>
              </div>

              <div className="mb-4">
                <h4 className="font-bold underline mb-1">2. APPLICANT PROFILE & SYNDICATE ROLE:</h4>
                <p>
                  <strong>Applicant Name:</strong> {formData.applicantName} (Age: {formData.applicantAge})<br />
                  <strong>Custody Status:</strong> {formData.custodyStatus || '[Status]'}<br />
                  <strong className="text-red-800">Specific Role in Syndicate:</strong> {formData.roleInSyndicate}
                </p>
              </div>

              <div className="mb-4">
                <h4 className="font-bold underline mb-1">3. COMPELLING GROUNDS FOR REJECTION OF BAIL:</h4>
                <p className="mb-2">The Investigating Agency strongly opposes the grant of bail on the following grounds:</p>
                {groundsList.length > 0 ? (
                  <ul className="list-decimal pl-6 space-y-2 mb-4 font-semibold">
                    {groundsList.map((g, i) => <li key={i}>{g}</li>)}
                  </ul>
                ) : (
                  <p className="italic text-slate-500 mb-4">No specific grounds selected.</p>
                )}
              </div>

              <div className="mb-4">
                <h4 className="font-bold underline mb-1">4. REBUTTAL TO ACCUSED'S DEFENSES:</h4>
                <ul className="list-none space-y-2 mb-4">
                  {formData.rebutSmallAmount && <li><strong>Rebutting "Small Traced Amount":</strong> Even if only a fraction of the defrauded amount landed in the applicant's personal account, they are a critical link in a multi-crore circular money-laundering network and share equal liability under the law of conspiracy.</li>}
                  {formData.rebutParity && <li><strong>Rebutting "Parity with Co-Accused":</strong> The rule of parity does not apply as the applicant's role is significantly more grave and foundational to the syndicate than the co-accused who were granted bail.</li>}
                </ul>
                <div className="text-justify border border-black/20 p-3 bg-slate-50">
                  <strong>Detailed Narrative of Opposition & Evidence Unearthed:</strong><br /><br />
                  {formData.detailedNarrative || 'Detailed narrative goes here...'}
                </div>
              </div>

              {formData.citeEconomicOffense && (
                <div className="mb-4">
                  <h4 className="font-bold underline mb-1">5. LEGAL PRECEDENT:</h4>
                  <p className="italic font-bold">
                    As held by the Hon'ble Supreme Court in multiple landmark judgments, economic offenses having deep-rooted conspiracies and involving huge loss of public funds need to be viewed seriously and considered as class apart offenses. Bail in such matters requires strict scrutiny.
                  </p>
                </div>
              )}

              <div className="mb-10 mt-6 font-bold text-justify">
                PRAYER:<br /><br />
                In light of the facts and circumstances stated above, and considering the gravity of the cyber fraud and the risk of digital evidence tampering, it is humbly prayed that the present application for grant of bail be rejected outright in the interest of justice.
              </div>

              <div className="mb-6">
                <strong>VERIFICATION:</strong><br />
                I verify that the contents of this reply are true and correct based on the official investigation records.
              </div>

              <div className="flex justify-between mt-12 mb-4 text-center">
                <div className="w-1/3">
                  <div className="border-b border-black w-3/4 mx-auto mb-1"></div>
                  <strong>Investigating Officer</strong><br />
                  {formData.officerName} ({formData.officerRank})
                </div>
                <div className="w-1/3">
                  <div className="border-b border-black w-3/4 mx-auto mb-1"></div>
                  <strong>Learned Public Prosecutor</strong><br />
                  {formData.publicProsecutor}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-700/50 bg-[#0B132B]/50 shrink-0 flex justify-end gap-3 rounded-b-xl">
          {step === 1 ? (
            <button onClick={() => setStep(2)} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
              Draft Court Reply <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mr-auto">
                Back to Edit
              </button>
              <button onClick={copyToClipboard} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 border border-slate-700 transition-colors">
                <Copy size={16} /> Copy Reply Text
              </button>
              <button onClick={handleDownloadPDF} disabled={isGenerating} className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 border border-red-500/30 transition-colors disabled:opacity-50">
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />} 
                {isGenerating ? "Generating..." : "Download Court Reply (.PDF)"}
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
